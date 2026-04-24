import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const FOUNDING_PRICE_ID = "price_1TPaFQ5IJtCc9WoUveteTxwJ";

const log = (step: string, details?: unknown) => {
  const extra = details ? ` - ${JSON.stringify(details)}` : "";
  console.log(`[CREATE-SUBSCRIPTION-CHECKOUT] ${step}${extra}`);
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

    const supabaseAuth = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
    );
    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userErr } = await supabaseAuth.auth.getUser(token);
    if (userErr) throw new Error(`Auth error: ${userErr.message}`);
    const user = userData.user;
    if (!user?.email) throw new Error("User not authenticated");
    log("User authenticated", { userId: user.id });

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } },
    );

    const { data: agency, error: agencyErr } = await supabaseAdmin
      .from("agencies")
      .select("id, agency_name, email, stripe_customer_id")
      .eq("owner_user_id", user.id)
      .maybeSingle();
    if (agencyErr) throw new Error(`Agency lookup failed: ${agencyErr.message}`);
    if (!agency) throw new Error("No agency found for this user");

    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });

    // Reuse or create the Stripe customer for this agency
    let customerId = agency.stripe_customer_id ?? null;
    if (!customerId) {
      const existing = await stripe.customers.list({ email: user.email, limit: 1 });
      if (existing.data.length > 0) {
        customerId = existing.data[0].id;
      } else {
        const customer = await stripe.customers.create({
          email: user.email,
          name: agency.agency_name,
          metadata: { agency_id: agency.id, owner_user_id: user.id },
        });
        customerId = customer.id;
      }
      await supabaseAdmin
        .from("agencies")
        .update({ stripe_customer_id: customerId, updated_at: new Date().toISOString() })
        .eq("id", agency.id);
      log("Customer linked", { customerId });
    }

    const origin =
      req.headers.get("origin") ||
      Deno.env.get("PUBLIC_SITE_URL") ||
      "https://zuvio.us";

    const session = await stripe.checkout.sessions.create({
      customer: customerId!,
      mode: "subscription",
      line_items: [{ price: FOUNDING_PRICE_ID, quantity: 1 }],
      allow_promotion_codes: true,
      success_url: `${origin}/dashboard?subscription=success`,
      cancel_url: `${origin}/dashboard?subscription=cancelled`,
      subscription_data: {
        metadata: { agency_id: agency.id, owner_user_id: user.id },
      },
      metadata: { agency_id: agency.id, owner_user_id: user.id },
    });
    log("Checkout session created", { sessionId: session.id });

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    log("ERROR", { message });
    return new Response(JSON.stringify({ error: message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});