import { createClient } from "npm:@supabase/supabase-js@2.45.0";
import Stripe from "https://esm.sh/stripe@18.5.0?target=deno";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const FLEXX_BOOKING_IDS = [
  "ca89c252-cb5e-4ecb-847c-3762c5ee4abe",
  "62e21bab-d657-40eb-ba27-19ddc3d6456e",
  "05059b45-5de8-4402-8765-5367213a64e8",
  "6be9742f-cf1e-4976-9858-83c1154ac714",
  "0a413ec6-5e97-421a-91df-f2ec73cf030c",
];

const NOTIFY_AGENCIES: Array<{ agency_name: string; email: string; booking_id: string; renter_name: string; pickup_date: string }> = [
  {
    agency_name: "Rent Me Orlando",
    email: "support@orlandorentme.com",
    booking_id: "79d807d3-fc40-47bc-a96e-d31a4ab685cc",
    renter_name: "Jonathan K Youte",
    pickup_date: "2026-07-03",
  },
  {
    agency_name: "Miami One Rent A Car",
    email: "rent@miamionerentacar.com",
    booking_id: "9fee4e23-1734-4190-a698-278722ac69c0",
    renter_name: "Jennifer Morgan",
    pickup_date: "2026-06-26",
  },
];

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY")!;
const FROM_EMAIL = "Zuvio <team@zuvio.us>";

function agencyNoticeHtml(agencyName: string, bookingId: string, renterName: string, pickupDate: string) {
  return `<div style="font-family:Arial,sans-serif;color:#0d1b2e;max-width:600px;line-height:1.6;">
  <p>Hi ${agencyName},</p>
  <p>We recently found and fixed a bug that affected bookings with a pickup date that had already passed — in some cases, when an agency tried to approve or deny one of these bookings, the action didn't save correctly and the booking got stuck showing as "pending."</p>
  <p>We found one booking in your account affected by this:</p>
  <ul>
    <li><strong>Booking ID:</strong> ${bookingId}</li>
    <li><strong>Renter:</strong> ${renterName}</li>
    <li><strong>Pickup date:</strong> ${pickupDate}</li>
  </ul>
  <p>This bug is now fixed. Could you log in to your dashboard and confirm whether you'd like to approve or deny this booking? It should save correctly now.</p>
  <p>Sorry for the inconvenience, and thanks for your patience.</p>
  <p>The Zuvio Team</p>
</div>`;
}

function agencyNoticeText(agencyName: string, bookingId: string, renterName: string, pickupDate: string) {
  return `Hi ${agencyName},

We recently found and fixed a bug that affected bookings with a pickup date that had already passed — in some cases, when an agency tried to approve or deny one of these bookings, the action didn't save correctly and the booking got stuck showing as "pending."

We found one booking in your account affected by this:
- Booking ID: ${bookingId}
- Renter: ${renterName}
- Pickup date: ${pickupDate}

This bug is now fixed. Could you log in to your dashboard and confirm whether you'd like to approve or deny this booking? It should save correctly now.

Sorry for the inconvenience, and thanks for your patience.

The Zuvio Team`;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const cronSecret = Deno.env.get("CRON_SECRET");
    const provided = req.headers.get("x-cron-secret");
    if (!cronSecret || provided !== cronSecret) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
      { auth: { persistSession: false } },
    );
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!, { apiVersion: "2025-08-27.basil" });
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;

    // PART 1: Decline 5 FLEXX bookings
    const declineResults: unknown[] = [];
    for (const id of FLEXX_BOOKING_IDS) {
      const { data: b } = await supabase
        .from("bookings")
        .select("id, stripe_payment_intent_id, stripe_setup_intent_id, booking_status")
        .eq("id", id)
        .maybeSingle();
      if (!b) { declineResults.push({ id, status: "not_found" }); continue; }

      let stripeResult = "skipped";
      try {
        if (b.stripe_payment_intent_id) {
          await stripe.paymentIntents.cancel(b.stripe_payment_intent_id);
          stripeResult = "pi_canceled";
        } else if (b.stripe_setup_intent_id) {
          await stripe.setupIntents.cancel(b.stripe_setup_intent_id);
          stripeResult = "si_canceled";
        }
      } catch (e) {
        stripeResult = `stripe_err:${(e as Error).message}`;
      }

      const { error: updErr } = await supabase
        .from("bookings")
        .update({
          payment_status: "canceled",
          booking_status: "declined",
          decline_reason: "Agency confirmed decline (resolved after past-date update bug fix).",
          updated_at: new Date().toISOString(),
        })
        .eq("id", id);

      let emailResult = "skipped";
      try {
        const r = await fetch(`${supabaseUrl}/functions/v1/send-renter-booking-status`, {
          method: "POST",
          headers: { "Content-Type": "application/json", "x-cron-secret": cronSecret },
          body: JSON.stringify({ booking_id: id, status: "declined", reason: "The agency was unable to fulfill this reservation." }),
        });
        emailResult = r.ok ? "sent" : `email_err:${r.status}`;
      } catch (e) {
        emailResult = `email_err:${(e as Error).message}`;
      }

      declineResults.push({ id, stripe: stripeResult, db: updErr ? updErr.message : "updated", renter_email: emailResult });
    }

    // PART 2: Send notice emails to two agencies
    const noticeResults: unknown[] = [];
    for (const a of NOTIFY_AGENCIES) {
      try {
        const res = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: { Authorization: `Bearer ${RESEND_API_KEY}`, "Content-Type": "application/json" },
          body: JSON.stringify({
            from: FROM_EMAIL,
            to: [a.email],
            subject: "Action needed: one of your bookings needs your review",
            html: agencyNoticeHtml(a.agency_name, a.booking_id, a.renter_name, a.pickup_date),
            text: agencyNoticeText(a.agency_name, a.booking_id, a.renter_name, a.pickup_date),
          }),
        });
        const body = await res.json().catch(() => ({}));
        noticeResults.push({ agency: a.agency_name, email: a.email, booking_id: a.booking_id, status: res.ok ? "sent" : "failed", resend_id: body.id, error: res.ok ? undefined : body });
      } catch (e) {
        noticeResults.push({ agency: a.agency_name, email: a.email, booking_id: a.booking_id, status: "failed", error: (e as Error).message });
      }
      await new Promise((r) => setTimeout(r, 600));
    }

    return new Response(JSON.stringify({ declineResults, noticeResults }, null, 2), {
      status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err instanceof Error ? err.message : String(err) }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});