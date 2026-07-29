import { createClient } from "npm:@supabase/supabase-js@2.45.0";
import Stripe from "https://esm.sh/stripe@18.5.0?target=deno";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-run-token",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const RUN_TOKEN = "zv-orphan-cleanup-4b81ce77";

// Bookings stuck in a confirmed-looking state with no live Stripe payment.
const STANDARD_DECLINES = [
  "05281358-1f29-4e16-a1c9-96981da25fce", // Richard Alpha Russell Jr
  "b194597b-d843-4e1f-b826-3b9e9db8809c", // RICHARD RUSSELL JR
  "0398c5d2-4682-4a7f-a36c-545886375675", // Richard Alpha Russell Jr
  "b8455cca-ae78-4ad5-a6a1-06be55e92916", // Eduardo
  "172754b6-1f96-4877-bc1c-bfc8f87305aa", // Steven McClure
  "fa122d1f-bcf0-4ab9-89ba-a81535adca3c", // Shenekwa McFarlande
  "f2ceb9be-faef-4d9b-9f7b-b0969932c059", // Biaixa
];

// Payment intent exists but never completed — invite a retry instead.
const RETRY_BOOKING = "79d807d3-fc40-47bc-a96e-d31a4ab685cc"; // Jonathan K Youte

const REASON =
  "Canceled: payment was never completed, so this reservation was never confirmed. You have not been charged.";
const RETRY_REASON =
  "Canceled: your payment did not go through, so this reservation was never confirmed. You have not been charged — you're welcome to try booking again.";

function esc(t: string) {
  return String(t ?? "").replace(/[&<>"']/g, (m) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" }[m] as string));
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.headers.get("x-run-token") !== RUN_TOKEN) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    { auth: { persistSession: false } },
  );
  const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!, { apiVersion: "2025-08-27.basil" });
  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const cronSecret = Deno.env.get("CRON_SECRET") ?? "";
  const resendApiKey = Deno.env.get("RESEND_API_KEY");

  const results: unknown[] = [];

  const cancelStripe = async (b: Record<string, unknown>) => {
    try {
      if (b.stripe_payment_intent_id) {
        await stripe.paymentIntents.cancel(b.stripe_payment_intent_id as string);
        return "pi_canceled";
      }
      if (b.stripe_setup_intent_id) {
        await stripe.setupIntents.cancel(b.stripe_setup_intent_id as string);
        return "si_canceled";
      }
      return "none";
    } catch (e) {
      return `stripe_err:${(e as Error).message}`;
    }
  };

  for (const id of STANDARD_DECLINES) {
    const { data: b } = await supabase
      .from("bookings")
      .select("id, renter_name, stripe_payment_intent_id, stripe_setup_intent_id, booking_status")
      .eq("id", id)
      .maybeSingle();
    if (!b) { results.push({ id, status: "not_found" }); continue; }

    const stripeResult = await cancelStripe(b);
    const { error: updErr } = await supabase
      .from("bookings")
      .update({
        booking_status: "declined",
        payment_status: "canceled",
        decline_reason: REASON,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id);

    let emailResult = "not_attempted";
    try {
      const r = await fetch(`${supabaseUrl}/functions/v1/send-renter-booking-status`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-cron-secret": cronSecret },
        body: JSON.stringify({ booking_id: id, status: "declined", reason: REASON }),
      });
      emailResult = r.ok ? "sent" : `email_err:${r.status}`;
    } catch (e) {
      emailResult = `email_err:${(e as Error).message}`;
    }

    results.push({ id, renter: b.renter_name, stripe: stripeResult, db: updErr ? updErr.message : "declined", email: emailResult });
  }

  // Retry invite path
  {
    const { data: b } = await supabase
      .from("bookings")
      .select("id, renter_name, renter_email, pickup_date, dropoff_date, total_amount_cents, vehicle_id, stripe_payment_intent_id, stripe_setup_intent_id")
      .eq("id", RETRY_BOOKING)
      .maybeSingle();

    if (!b) {
      results.push({ id: RETRY_BOOKING, status: "not_found" });
    } else {
      const stripeResult = await cancelStripe(b);
      const { error: updErr } = await supabase
        .from("bookings")
        .update({
          booking_status: "canceled",
          payment_status: "canceled",
          decline_reason: RETRY_REASON,
          updated_at: new Date().toISOString(),
        })
        .eq("id", b.id);

      const { data: vehicle } = await supabase
        .from("vehicles").select("year, make, model").eq("id", b.vehicle_id).maybeSingle();
      const vehicleLabel = vehicle ? `${vehicle.year} ${vehicle.make} ${vehicle.model}` : "your vehicle";

      let emailResult = "no_resend_key";
      if (resendApiKey && b.renter_email) {
        const html = `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:24px;background:#0d1b2e;color:#fff;">
  <h2 style="color:#2dd4bf;margin:0 0 12px;">Your payment didn't go through</h2>
  <p>Hi ${esc(b.renter_name)},</p>
  <p>We were unable to complete the payment for your reservation request for the <strong>${esc(vehicleLabel)}</strong>, so the booking was never confirmed and the vehicle was released.</p>
  <p><strong>You have not been charged.</strong> This usually happens when a card is declined at the final step.</p>
  <p>If you'd still like the car, you can start a fresh booking in under a minute:</p>
  <p style="text-align:center;margin:24px 0;">
    <a href="https://www.gozuvio.com/vehicles/${b.vehicle_id}" style="background:#2dd4bf;color:#0d1b2e;padding:12px 24px;border-radius:6px;text-decoration:none;font-weight:bold;">Try your booking again</a>
  </p>
  <p>Need a hand? Email <a href="mailto:team@zuvio.us" style="color:#2dd4bf;">team@zuvio.us</a> or call 725-239-2300.</p>
  <p style="color:#8b95a5;font-size:12px;margin-top:24px;">— The ZUVIO Team</p>
</div>`;
        const r = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: { Authorization: `Bearer ${resendApiKey}`, "Content-Type": "application/json" },
          body: JSON.stringify({
            from: "ZUVIO <team@zuvio.us>",
            to: [b.renter_email],
            subject: `Payment didn't complete — retry your ${vehicleLabel} booking`,
            html,
          }),
        });
        emailResult = r.ok ? "sent_retry_invite" : `email_err:${r.status}`;
      }

      results.push({ id: b.id, renter: b.renter_name, stripe: stripeResult, db: updErr ? updErr.message : "canceled", email: emailResult });
    }
  }

  return new Response(JSON.stringify({ results }, null, 2), {
    status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});