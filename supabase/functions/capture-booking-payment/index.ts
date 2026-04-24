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
  console.log(`[CAPTURE-BOOKING-PAYMENT] ${step}${extra}`);
};

/**
 * Agency owner approves a booking → captures the authorized PaymentIntent.
 * For deferred-auth bookings (SetupIntent), this is called by the cron
 * indirectly: cron creates the PI off the saved PM, then this captures
 * once the agency clicks Approve.
 */
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
    if (!user) throw new Error("Not authenticated");

    const { booking_id } = await req.json();
    if (!booking_id) throw new Error("Missing booking_id");

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } },
    );

    // Verify caller owns the agency on this booking
    const { data: booking, error: bErr } = await supabaseAdmin
      .from("bookings")
      .select("id, agency_id, stripe_payment_intent_id, payment_status, booking_status")
      .eq("id", booking_id)
      .maybeSingle();
    if (bErr) throw new Error(`Booking lookup failed: ${bErr.message}`);
    if (!booking) throw new Error("Booking not found");

    const { data: agency } = await supabaseAdmin
      .from("agencies")
      .select("id, owner_user_id")
      .eq("id", booking.agency_id)
      .maybeSingle();
    if (!agency || agency.owner_user_id !== user.id) {
      throw new Error("Not authorized for this booking");
    }

    if (!booking.stripe_payment_intent_id) {
      throw new Error(
        "No PaymentIntent on this booking yet. Wait until the card is authorized (this happens 7 days before pickup for advance bookings).",
      );
    }

    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });
    const captured = await stripe.paymentIntents.capture(booking.stripe_payment_intent_id);
    log("Captured", { id: captured.id, status: captured.status });

    await supabaseAdmin
      .from("bookings")
      .update({
        payment_status: "succeeded",
        booking_status: "approved",
        stripe_charge_id:
          (captured as unknown as { latest_charge?: string }).latest_charge ?? null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", booking_id);

    return new Response(JSON.stringify({ ok: true, status: captured.status }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    log("ERROR", { message });
    return new Response(JSON.stringify({ error: message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});