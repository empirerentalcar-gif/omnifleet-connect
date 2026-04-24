import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const log = (step: string, details?: unknown) => {
  const extra = details ? ` - ${JSON.stringify(details)}` : "";
  console.log(`[CONNECT-ACCOUNT-STATUS] ${step}${extra}`);
};

function deriveStatus(account: Stripe.Account): string {
  if (account.charges_enabled && account.payouts_enabled && account.details_submitted) {
    return "active";
  }
  if (account.requirements?.disabled_reason) return "restricted";
  if (account.details_submitted) return "pending_verification";
  return "pending";
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");

    const supabaseAuth = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );
    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userErr } = await supabaseAuth.auth.getUser(token);
    if (userErr) throw new Error(`Auth error: ${userErr.message}`);
    const user = userData.user;
    if (!user?.email) throw new Error("User not authenticated");

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const { data: agency, error: agencyErr } = await supabaseAdmin
      .from("agencies")
      .select(
        "id, stripe_connect_account_id, stripe_connect_status, stripe_charges_enabled, stripe_payouts_enabled"
      )
      .eq("owner_user_id", user.id)
      .maybeSingle();
    if (agencyErr) throw new Error(`Agency lookup failed: ${agencyErr.message}`);
    if (!agency) throw new Error("No agency found");

    if (!agency.stripe_connect_account_id) {
      return new Response(
        JSON.stringify({
          connected: false,
          status: agency.stripe_connect_status ?? "not_started",
          charges_enabled: false,
          payouts_enabled: false,
          details_submitted: false,
          requirements: null,
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        }
      );
    }

    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });
    const account = await stripe.accounts.retrieve(agency.stripe_connect_account_id);
    const status = deriveStatus(account);
    log("Retrieved account", {
      accountId: account.id,
      status,
      charges: account.charges_enabled,
      payouts: account.payouts_enabled,
    });

    // Sync DB
    await supabaseAdmin
      .from("agencies")
      .update({
        stripe_connect_status: status,
        stripe_charges_enabled: !!account.charges_enabled,
        stripe_payouts_enabled: !!account.payouts_enabled,
        updated_at: new Date().toISOString(),
      })
      .eq("id", agency.id);

    return new Response(
      JSON.stringify({
        connected: true,
        account_id: account.id,
        status,
        charges_enabled: !!account.charges_enabled,
        payouts_enabled: !!account.payouts_enabled,
        details_submitted: !!account.details_submitted,
        requirements: {
          currently_due: account.requirements?.currently_due ?? [],
          eventually_due: account.requirements?.eventually_due ?? [],
          past_due: account.requirements?.past_due ?? [],
          disabled_reason: account.requirements?.disabled_reason ?? null,
        },
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    log("ERROR", { message });
    return new Response(JSON.stringify({ error: message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});