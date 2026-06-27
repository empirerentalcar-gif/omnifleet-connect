import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0?target=deno";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const log = (step: string, details?: unknown) => {
  const extra = details ? ` - ${JSON.stringify(details)}` : "";
  console.log(`[AUTHORIZE-PENDING-BOOKINGS] ${step}${extra}`);
};

/**
 * CRON: For deferred bookings (SetupIntent), once pickup is <=7 days away,
 * create a manual-capture PaymentIntent off the saved payment method and
 * attach to the booking. The agency can then capture on approval.
 */
serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const cronSecret = Deno.env.get("CRON_SECRET");
    const incoming = req.headers.get("x-cron-secret") || req.headers.get("X-Cron-Secret");
    // Fail-secure: require CRON_SECRET to be set AND match the incoming header.
    if (!cronSecret || incoming !== cronSecret) {
      return new Response(JSON.stringify({ error: "unauthorized" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 401,
      });
    }

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } },
    );

    // Find scheduled bookings whose pickup is within 7 days and still no PI
    const sevenDaysOut = new Date();
    sevenDaysOut.setUTCDate(sevenDaysOut.getUTCDate() + 7);
    const isoDate = sevenDaysOut.toISOString().slice(0, 10);

    const { data: bookings, error } = await supabaseAdmin
      .from("bookings")
      .select(
        "id, agency_id, total_amount_cents, platform_fee_cents, stripe_setup_intent_id, renter_email, vehicle_id",
      )
      .eq("payment_status", "scheduled")
      .is("stripe_payment_intent_id", null)
      .lte("pickup_date", isoDate)
      .limit(50);

    if (error) throw new Error(`Query failed: ${error.message}`);
    log("Found bookings", { count: bookings?.length ?? 0 });

    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });
    const results: Array<Record<string, unknown>> = [];

    for (const b of bookings ?? []) {
      try {
        if (!b.stripe_setup_intent_id) {
          results.push({ id: b.id, skipped: "no_setup_intent" });
          continue;
        }
        const si = await stripe.setupIntents.retrieve(b.stripe_setup_intent_id);
        const paymentMethod = typeof si.payment_method === "string"
          ? si.payment_method
          : si.payment_method?.id;
        const customer = typeof si.customer === "string"
          ? si.customer
          : si.customer?.id;
        if (!paymentMethod) {
          results.push({ id: b.id, skipped: "no_payment_method" });
          continue;
        }

        const { data: agency } = await supabaseAdmin
          .from("agencies")
          .select("stripe_connect_account_id")
          .eq("id", b.agency_id)
          .maybeSingle();
        if (!agency?.stripe_connect_account_id) {
          results.push({ id: b.id, skipped: "no_connect_account" });
          continue;
        }

        const pi = await stripe.paymentIntents.create({
          amount: b.total_amount_cents,
          currency: "usd",
          capture_method: "manual",
          confirm: true,
          off_session: true,
          payment_method: paymentMethod,
          customer: customer ?? undefined,
          application_fee_amount: b.platform_fee_cents,
          on_behalf_of: agency.stripe_connect_account_id,
          transfer_data: { destination: agency.stripe_connect_account_id },
          receipt_email: b.renter_email,
          metadata: { booking_id: b.id, flow: "deferred_auth_executed" },
        });

        await supabaseAdmin
          .from("bookings")
          .update({
            stripe_payment_intent_id: pi.id,
            payment_method_id: paymentMethod,
            payment_status:
              pi.status === "requires_capture" ? "requires_capture" : pi.status,
            updated_at: new Date().toISOString(),
          })
          .eq("id", b.id);

        results.push({ id: b.id, status: pi.status });
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        log("Auth failed for booking", { id: b.id, msg });
        await supabaseAdmin
          .from("bookings")
          .update({
            payment_status: "auth_failed",
            decline_reason: msg.slice(0, 500),
            updated_at: new Date().toISOString(),
          })
          .eq("id", b.id);
        results.push({ id: b.id, error: msg });
      }
    }

    return new Response(JSON.stringify({ processed: results.length, results }), {
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