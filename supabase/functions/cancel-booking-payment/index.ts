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
  console.log(`[CANCEL-BOOKING-PAYMENT] ${step}${extra}`);
};

/** Agency owner declines → cancel/release the authorization. */
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

    const { booking_id, reason } = await req.json();
    if (!booking_id) throw new Error("Missing booking_id");

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } },
    );

    const { data: booking } = await supabaseAdmin
      .from("bookings")
      .select("id, agency_id, stripe_payment_intent_id, stripe_setup_intent_id")
      .eq("id", booking_id)
      .maybeSingle();
    if (!booking) throw new Error("Booking not found");

    const { data: agency } = await supabaseAdmin
      .from("agencies")
      .select("id, owner_user_id")
      .eq("id", booking.agency_id)
      .maybeSingle();
    if (!agency) throw new Error("Agency not found");
    let authorized = agency.owner_user_id === user.id;
    if (!authorized) {
      // Allow platform admins to decline on behalf of an agency.
      const { data: isAdmin } = await supabaseAdmin.rpc("has_role", {
        _user_id: user.id,
        _role: "admin",
      });
      authorized = !!isAdmin;
    }
    if (!authorized) {
      throw new Error("Not authorized for this booking");
    }

    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });

    if (booking.stripe_payment_intent_id) {
      try {
        await stripe.paymentIntents.cancel(booking.stripe_payment_intent_id);
        log("PI cancelled", { id: booking.stripe_payment_intent_id });
      } catch (e) {
        log("PI cancel skipped", { msg: (e as Error).message });
      }
    } else if (booking.stripe_setup_intent_id) {
      try {
        await stripe.setupIntents.cancel(booking.stripe_setup_intent_id);
        log("SI cancelled", { id: booking.stripe_setup_intent_id });
      } catch (e) {
        log("SI cancel skipped", { msg: (e as Error).message });
      }
    }

    await supabaseAdmin
      .from("bookings")
      .update({
        payment_status: "canceled",
        booking_status: "declined",
        decline_reason: typeof reason === "string" ? reason.slice(0, 500) : null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", booking_id);

    // Fire-and-forget renter notification email
    try {
      const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
      const cronSecret = Deno.env.get("CRON_SECRET") ?? "";
      await fetch(`${supabaseUrl}/functions/v1/send-renter-booking-status`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-cron-secret": cronSecret,
        },
        body: JSON.stringify({ booking_id, status: "declined", reason }),
      });
    } catch (e) {
      log("status email failed", { msg: (e as Error).message });
    }

    return new Response(JSON.stringify({ ok: true }), {
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