import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const log = (step: string, details?: unknown) => {
  const extra = details ? ` - ${JSON.stringify(details)}` : "";
  console.log(`[CREATE-CONNECT-ACCOUNT] ${step}${extra}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");

    // Auth: identify the user
    const supabaseAuth = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );
    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userErr } = await supabaseAuth.auth.getUser(token);
    if (userErr) throw new Error(`Auth error: ${userErr.message}`);
    const user = userData.user;
    if (!user?.email) throw new Error("User not authenticated");
    log("User authenticated", { userId: user.id });

    // Service role client for trusted writes
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // Find this user's agency
    const { data: agency, error: agencyErr } = await supabaseAdmin
      .from("agencies")
      .select(
        "id, agency_name, email, stripe_connect_account_id, stripe_connect_status, city, state"
      )
      .eq("owner_user_id", user.id)
      .maybeSingle();
    if (agencyErr) throw new Error(`Agency lookup failed: ${agencyErr.message}`);
    if (!agency) throw new Error("No agency found for this user");

    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });

    // Reuse existing Connect account if present, otherwise create a new Express account
    let accountId = agency.stripe_connect_account_id ?? null;
    if (!accountId) {
      const account = await stripe.accounts.create({
        type: "express",
        country: "US",
        email: agency.email ?? user.email,
        business_type: "company",
        capabilities: {
          card_payments: { requested: true },
          transfers: { requested: true },
        },
        business_profile: {
          name: agency.agency_name,
          mcc: "7512", // Car rental agency
        },
        metadata: {
          agency_id: agency.id,
          owner_user_id: user.id,
        },
      });
      accountId = account.id;
      log("Created Connect account", { accountId });

      const { error: updErr } = await supabaseAdmin
        .from("agencies")
        .update({
          stripe_connect_account_id: accountId,
          stripe_connect_status: "pending",
          updated_at: new Date().toISOString(),
        })
        .eq("id", agency.id);
      if (updErr) throw new Error(`Failed to save Connect account: ${updErr.message}`);
    }

    const origin =
      req.headers.get("origin") ||
      Deno.env.get("PUBLIC_SITE_URL") ||
      "https://zuvio.us";

    const accountLink = await stripe.accountLinks.create({
      account: accountId!,
      refresh_url: `${origin}/owner-dashboard?stripe_refresh=1`,
      return_url: `${origin}/owner-dashboard?stripe_return=1`,
      type: "account_onboarding",
    });
    log("Created onboarding link");

    return new Response(
      JSON.stringify({ url: accountLink.url, account_id: accountId }),
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