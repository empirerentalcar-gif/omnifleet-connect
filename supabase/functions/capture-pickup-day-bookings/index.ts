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
  console.log(`[CAPTURE-PICKUP-DAY] ${step}${extra}`);
};

/**
 * CRON (daily 8am UTC): For approved bookings whose pickup_date is today,
 * capture the authorized PaymentIntent so the renter is charged on pickup day.
 */
serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const cronSecret = Deno.env.get("CRON_SECRET");
    const incoming = req.headers.get("x-cron-secret") || req.headers.get("X-Cron-Secret");
    if (cronSecret && incoming !== cronSecret) {
      return new Response(JSON.stringify({ error: "unauthorized" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 401,
      });
    }

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");

    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const supabaseAdmin = createClient(
      supabaseUrl,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } },
    );

    const today = new Date().toISOString().slice(0, 10);

    const { data: bookings, error } = await supabaseAdmin
      .from("bookings")
      .select("id, stripe_payment_intent_id, payment_status, booking_status, pickup_date")
      .eq("booking_status", "approved")
      .eq("pickup_date", today)
      .in("payment_status", ["requires_capture", "authorized"])
      .not("stripe_payment_intent_id", "is", null)
      .limit(200);
    if (error) throw new Error(`Query failed: ${error.message}`);
    log("Found bookings", { count: bookings?.length ?? 0, today });

    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });
    const results: Array<Record<string, unknown>> = [];

    for (const b of bookings ?? []) {
      try {
        const captured = await stripe.paymentIntents.capture(b.stripe_payment_intent_id!);
        await supabaseAdmin
          .from("bookings")
          .update({
            payment_status: "succeeded",
            stripe_charge_id:
              (captured as unknown as { latest_charge?: string }).latest_charge ?? null,
            updated_at: new Date().toISOString(),
          })
          .eq("id", b.id);

        // Fire-and-forget renter receipt email
        try {
          await fetch(`${supabaseUrl}/functions/v1/send-renter-booking-status`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ booking_id: b.id, status: "captured" }),
          });
        } catch (e) {
          log("email failed", { id: b.id, msg: (e as Error).message });
        }

        results.push({ id: b.id, status: captured.status });
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        log("Capture failed", { id: b.id, msg });
        await supabaseAdmin
          .from("bookings")
          .update({
            payment_status: "capture_failed",
            decline_reason: msg.slice(0, 500),
            updated_at: new Date().toISOString(),
          })
          .eq("id", b.id);
        results.push({ id: b.id, error: msg });
      }
    }

    return new Response(JSON.stringify({ processed: results.length, results }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    log("ERROR", { message });
    return new Response(JSON.stringify({ error: message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500,
    });
  }
});