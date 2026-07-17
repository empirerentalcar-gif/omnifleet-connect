import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0?target=deno";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const DEFAULT_PLATFORM_FEE_BPS = 500; // fallback if agency row is missing rate (existing agencies grandfathered at 5%)

const log = (step: string, details?: unknown) => {
  const extra = details ? ` - ${JSON.stringify(details)}` : "";
  console.log(`[CREATE-BOOKING-PAYMENT] ${step}${extra}`);
};

/**
 * Creates a booking + Stripe authorization for a renter.
 * - pickup within 7 days: PaymentIntent with capture_method=manual (auth-only)
 * - pickup beyond 7 days: SetupIntent (saves card for later auth via cron)
 * Uses Stripe Connect destination charges with a per-agency application fee
 * (agencies.commission_rate_bps). Existing agencies are grandfathered at 500 bps (5%);
 * new signups default to 1000 bps (10%).
 */
serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");

    const body = await req.json();
    const {
      vehicle_id,
      pickup_date,
      dropoff_date,
      renter_name,
      renter_email,
      renter_phone,
    } = body ?? {};

    // Basic validation
    if (!vehicle_id || !pickup_date || !dropoff_date) {
      throw new Error("Missing vehicle_id, pickup_date, or dropoff_date");
    }
    if (!renter_name || renter_name.length < 2) throw new Error("Invalid renter name");
    if (!renter_email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(renter_email)) {
      throw new Error("Invalid renter email");
    }
    if (!renter_phone || renter_phone.length < 7) throw new Error("Invalid renter phone");

    const pickup = new Date(pickup_date);
    const dropoff = new Date(dropoff_date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (pickup < today) throw new Error("Pickup date cannot be in the past");
    if (dropoff <= pickup) throw new Error("Drop-off must be after pickup");

    const rentalDays = Math.ceil(
      (dropoff.getTime() - pickup.getTime()) / (1000 * 60 * 60 * 24),
    );
    if (rentalDays < 1) throw new Error("Rental must be at least 1 day");

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } },
    );

    // Look up vehicle + agency
    const { data: vehicle, error: vehErr } = await supabaseAdmin
      .from("vehicles")
      .select("id, profile_id, daily_rate, status, make, model")
      .eq("id", vehicle_id)
      .maybeSingle();
    if (vehErr) throw new Error(`Vehicle lookup failed: ${vehErr.message}`);
    if (!vehicle) throw new Error("Vehicle not found");
    if (vehicle.status !== "available") throw new Error("Vehicle is not available");

    const { data: profile } = await supabaseAdmin
      .from("profiles")
      .select("id, user_id")
      .eq("id", vehicle.profile_id)
      .maybeSingle();
    if (!profile) throw new Error("Agency profile not found");

    const { data: agency } = await supabaseAdmin
      .from("agencies")
      .select("id, stripe_connect_account_id, stripe_charges_enabled, approved, active, subscription_status, grace_period_end, commission_rate_bps")
      .eq("owner_user_id", profile.user_id)
      .maybeSingle();
    if (!agency) throw new Error("Agency not found");
    if (!agency.approved || !agency.active) throw new Error("Agency is not active");
    if (!agency.stripe_connect_account_id || !agency.stripe_charges_enabled) {
      throw new Error("Agency cannot accept payments yet");
    }

    const dailyRateCents = Math.round(Number(vehicle.daily_rate) * 100);
    const totalAmountCents = dailyRateCents * rentalDays;
    const commissionRateBps =
      typeof (agency as { commission_rate_bps?: number }).commission_rate_bps === "number"
        ? (agency as { commission_rate_bps: number }).commission_rate_bps
        : DEFAULT_PLATFORM_FEE_BPS;
    const platformFeeCents = Math.round((totalAmountCents * commissionRateBps) / 10000);
    if (totalAmountCents < 100) throw new Error("Total amount too small");

    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });

    // Determine flow: <=7 days = PaymentIntent (manual capture), else SetupIntent
    const msUntilPickup = pickup.getTime() - Date.now();
    const daysUntilPickup = msUntilPickup / (1000 * 60 * 60 * 24);
    const useImmediateAuth = daysUntilPickup <= 7;

    // Insert booking row first (DB-priority per project memory)
    const { data: booking, error: bookErr } = await supabaseAdmin
      .from("bookings")
      .insert({
        vehicle_id,
        agency_id: agency.id,
        profile_id: profile.id,
        renter_name,
        renter_email,
        renter_phone,
        pickup_date,
        dropoff_date,
        rental_days: rentalDays,
        daily_rate_cents: dailyRateCents,
        total_amount_cents: totalAmountCents,
        platform_fee_cents: platformFeeCents,
        currency: "usd",
        capture_method: "manual",
        booking_status: "pending_agency",
        payment_status: useImmediateAuth ? "requires_capture" : "scheduled",
      })
      .select("id")
      .single();
    if (bookErr) throw new Error(`Booking insert failed: ${bookErr.message}`);
    log("Booking created", { bookingId: booking.id, useImmediateAuth });

    // Fire-and-forget: notify the agency owner that a new booking request came in.
    // This runs at initial submission (not payment success), so agencies see the
    // lead even if the renter never completes payment authorization.
    (async () => {
      try {
        const resendApiKey = Deno.env.get("RESEND_API_KEY");
        if (!resendApiKey) {
          log("AGENCY-NOTIFY skipped: no RESEND_API_KEY");
          return;
        }
        const { data: agencyRow } = await supabaseAdmin
          .from("agencies")
          .select("agency_name, email")
          .eq("id", agency.id)
          .maybeSingle();
        const emailRe = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
        const to = (agencyRow?.email ?? "").trim();
        if (!to || !emailRe.test(to)) {
          log("AGENCY-NOTIFY skipped: invalid agency email", { agency_id: agency.id, to });
          return;
        }
        const vehicleLabel = `${vehicle.make ?? ""} ${vehicle.model ?? ""}`.trim() || "Vehicle";
        const subject = `New booking request — ${renter_name} / ${vehicleLabel}`;
        const html = `<div style="font-family:Arial,sans-serif;max-width:640px;margin:0 auto;padding:24px;background:#0d1b2e;color:#fff;">
  <h2 style="color:#2dd4bf;margin:0 0 12px;">🚗 New Booking Request</h2>
  <p style="margin:0 0 16px;color:#c8d0dc;">A renter just submitted a booking request on Zuvio. Payment is being authorized — you'll get a second confirmation once the funds are held.</p>
  <table style="width:100%;border-collapse:collapse;background:#132640;border-radius:8px;overflow:hidden;">
    <tr><td style="padding:10px 12px;color:#9aa4b2;border-bottom:1px solid rgba(255,255,255,0.08);">Renter</td><td style="padding:10px 12px;font-weight:bold;border-bottom:1px solid rgba(255,255,255,0.08);">${renter_name}</td></tr>
    <tr><td style="padding:10px 12px;color:#9aa4b2;border-bottom:1px solid rgba(255,255,255,0.08);">Renter phone</td><td style="padding:10px 12px;font-weight:bold;border-bottom:1px solid rgba(255,255,255,0.08);">${renter_phone}</td></tr>
    <tr><td style="padding:10px 12px;color:#9aa4b2;border-bottom:1px solid rgba(255,255,255,0.08);">Renter email</td><td style="padding:10px 12px;font-weight:bold;border-bottom:1px solid rgba(255,255,255,0.08);">${renter_email}</td></tr>
    <tr><td style="padding:10px 12px;color:#9aa4b2;border-bottom:1px solid rgba(255,255,255,0.08);">Vehicle</td><td style="padding:10px 12px;font-weight:bold;border-bottom:1px solid rgba(255,255,255,0.08);">${vehicleLabel}</td></tr>
    <tr><td style="padding:10px 12px;color:#9aa4b2;border-bottom:1px solid rgba(255,255,255,0.08);">Pickup</td><td style="padding:10px 12px;font-weight:bold;border-bottom:1px solid rgba(255,255,255,0.08);">${pickup_date}</td></tr>
    <tr><td style="padding:10px 12px;color:#9aa4b2;border-bottom:1px solid rgba(255,255,255,0.08);">Drop-off</td><td style="padding:10px 12px;font-weight:bold;border-bottom:1px solid rgba(255,255,255,0.08);">${dropoff_date}</td></tr>
    <tr><td style="padding:10px 12px;color:#9aa4b2;">Duration</td><td style="padding:10px 12px;font-weight:bold;">${rentalDays} day${rentalDays === 1 ? "" : "s"}</td></tr>
  </table>
  <p style="margin:20px 0 8px;">
    <a href="https://gozuvio.com/owner-dashboard" style="display:inline-block;background:#2dd4bf;color:#0d1b2e;padding:10px 18px;border-radius:6px;text-decoration:none;font-weight:bold;">Open owner dashboard</a>
  </p>
  <p style="font-size:12px;color:#7f8b9c;margin-top:20px;">Booking ID: ${booking.id}</p>
</div>`;
        const res = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: { Authorization: `Bearer ${resendApiKey}`, "Content-Type": "application/json" },
          body: JSON.stringify({
            from: "Zuvio Bookings <noreply@notify.gozuvio.com>",
            to: [to],
            subject,
            html,
          }),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          log("AGENCY-NOTIFY resend failed", { status: res.status, data, booking_id: booking.id, to });
        } else {
          log("AGENCY-NOTIFY sent", { booking_id: booking.id, to, resend_id: (data as { id?: string }).id });
        }
      } catch (e) {
        log("AGENCY-NOTIFY error", { msg: (e as Error).message });
      }
    })();

    let clientSecret: string | null = null;
    let intentId: string | null = null;
    let intentType: "payment_intent" | "setup_intent";

    if (useImmediateAuth) {
      const intent = await stripe.paymentIntents.create({
        amount: totalAmountCents,
        currency: "usd",
        capture_method: "manual",
        // Restrict to instant-confirmation methods only. Async/redirect methods
        // (Cash App Pay, Klarna, Affirm) can leave bookings in an ambiguous
        // "renter thinks they paid, platform doesn't know yet" state.
        // Do NOT use automatic_payment_methods here — it would pull in whatever
        // is enabled in the Stripe Dashboard.
        payment_method_types: ["card", "apple_pay", "google_pay", "link"],
        application_fee_amount: platformFeeCents,
        on_behalf_of: agency.stripe_connect_account_id,
        transfer_data: { destination: agency.stripe_connect_account_id },
        receipt_email: renter_email,
        metadata: {
          booking_id: booking.id,
          vehicle_id,
          agency_id: agency.id,
          flow: "immediate_auth",
        },
      });
      clientSecret = intent.client_secret;
      intentId = intent.id;
      intentType = "payment_intent";
      await supabaseAdmin
        .from("bookings")
        .update({ stripe_payment_intent_id: intent.id, updated_at: new Date().toISOString() })
        .eq("id", booking.id);
    } else {
      const setupIntent = await stripe.setupIntents.create({
        usage: "off_session",
        payment_method_types: ["card"],
        on_behalf_of: agency.stripe_connect_account_id,
        metadata: {
          booking_id: booking.id,
          vehicle_id,
          agency_id: agency.id,
          flow: "deferred_auth",
        },
      });
      clientSecret = setupIntent.client_secret;
      intentId = setupIntent.id;
      intentType = "setup_intent";
      await supabaseAdmin
        .from("bookings")
        .update({ stripe_setup_intent_id: setupIntent.id, updated_at: new Date().toISOString() })
        .eq("id", booking.id);
    }

    return new Response(
      JSON.stringify({
        booking_id: booking.id,
        client_secret: clientSecret,
        intent_id: intentId,
        intent_type: intentType,
        total_amount_cents: totalAmountCents,
        platform_fee_cents: platformFeeCents,
        rental_days: rentalDays,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 },
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    log("ERROR", { message });
    return new Response(JSON.stringify({ error: message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});