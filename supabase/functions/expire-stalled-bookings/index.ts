import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0?target=deno";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-cron-secret",
};

const INTERNAL_ALERT_EMAIL = "zuviollc@gmail.com";
const FROM_EMAIL = "ZUVIO <team@zuvio.us>";

const log = (step: string, details?: unknown) => {
  const extra = details ? ` - ${JSON.stringify(details)}` : "";
  console.log(`[EXPIRE-STALLED-BOOKINGS] ${step}${extra}`);
};

function escapeHtml(text: string): string {
  const map: Record<string, string> = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" };
  return String(text ?? "").replace(/[&<>"']/g, (m) => map[m]);
}

function fmtDate(s: string): string {
  try {
    const d = new Date(s);
    if (isNaN(d.getTime())) return s;
    return d.toLocaleDateString("en-US", { weekday: "short", year: "numeric", month: "short", day: "numeric" });
  } catch { return s; }
}

/**
 * Cancel bookings still awaiting successful payment more than 24h after
 * creation. Runs on a cron. For each stalled booking:
 *   1. Cancel the Stripe PaymentIntent (releases any authorization).
 *   2. Mark booking canceled with a clear reason.
 *   3. Email the renter — "expired due to no payment".
 *   4. Email the agency — "booking canceled" (safe now, no live unpaid lead).
 *
 * Runs as service-role so writes bypass any owner-side protections. Manual
 * runs supported via `{ force: true, booking_id?: "..." }` payload — still
 * gated by CRON_SECRET.
 */
serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const cronSecret = Deno.env.get("CRON_SECRET");
    const incoming = req.headers.get("x-cron-secret") || req.headers.get("X-Cron-Secret");
    if (!cronSecret || incoming !== cronSecret) {
      return new Response(JSON.stringify({ error: "unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY not set");
    const resendApiKey = Deno.env.get("RESEND_API_KEY");

    let body: { force?: boolean; booking_id?: string; older_than_hours?: number } = {};
    try { body = await req.json(); } catch { /* no body ok */ }
    const olderThanHours = body.older_than_hours ?? 24;

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
      { auth: { persistSession: false } },
    );
    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });

    // Stalled = booking still pending on the agency side, payment never
    // captured, older than the threshold. `payment_status` in these values
    // means no successful auth/capture happened.
    const cutoff = new Date(Date.now() - olderThanHours * 3600 * 1000).toISOString();
    const stalledPaymentStatuses = [
      "awaiting_payment",
      "pending",
      "failed",
      "requires_payment_method",
      "requires_action",
      "processing",
    ];

    let query = supabase
      .from("bookings")
      .select("id, renter_name, renter_email, pickup_date, dropoff_date, rental_days, total_amount_cents, currency, vehicle_id, agency_id, stripe_payment_intent_id, payment_status, booking_status, created_at")
      .eq("booking_status", "pending_agency")
      .in("payment_status", stalledPaymentStatuses)
      .lt("created_at", cutoff)
      .limit(50);

    if (body.booking_id) {
      // Manual/targeted mode — override filters.
      query = supabase
        .from("bookings")
        .select("id, renter_name, renter_email, pickup_date, dropoff_date, rental_days, total_amount_cents, currency, vehicle_id, agency_id, stripe_payment_intent_id, payment_status, booking_status, created_at")
        .eq("id", body.booking_id);
    }

    const { data: bookings, error } = await query;
    if (error) throw new Error(`Query failed: ${error.message}`);

    // Safety net for legacy/orphaned rows: bookings that look authorized
    // (`requires_capture`) but have no Stripe PaymentIntent at all. These can
    // never be captured and must not sit around looking confirmed.
    let candidates = bookings ?? [];
    if (!body.booking_id) {
      const { data: orphans } = await supabase
        .from("bookings")
        .select("id, renter_name, renter_email, pickup_date, dropoff_date, rental_days, total_amount_cents, currency, vehicle_id, agency_id, stripe_payment_intent_id, payment_status, booking_status, created_at")
        .eq("booking_status", "pending_agency")
        .eq("payment_status", "requires_capture")
        .is("stripe_payment_intent_id", null)
        .lt("created_at", cutoff)
        .limit(50);
      const seen = new Set(candidates.map((b) => b.id));
      for (const o of orphans ?? []) if (!seen.has(o.id)) candidates.push(o);
    }
    log("Candidates", { count: bookings?.length ?? 0, olderThanHours, force: !!body.force });

    const results: Array<Record<string, unknown>> = [];

    for (const b of candidates) {
      try {
        // Safety: never cancel a booking that Stripe says has live money on it.
        // With capture_method="manual", a successful renter authorization lands
        // the PI in status="requires_capture" with amount_received=0 and
        // amount_capturable>0 — treat any of these as "hands off" so we don't
        // orphan a live authorization on a canceled booking.
        if (b.stripe_payment_intent_id) {
          try {
            const pi = await stripe.paymentIntents.retrieve(b.stripe_payment_intent_id);
            const liveStates = ["succeeded", "requires_capture", "processing"];
            if (
              liveStates.includes(pi.status) ||
              (pi.amount_received ?? 0) > 0 ||
              (pi.amount_capturable ?? 0) > 0
            ) {
              results.push({ id: b.id, skipped: "pi_live", pi_status: pi.status });
              continue;
            }
            if (["requires_payment_method", "requires_action", "requires_confirmation"].includes(pi.status)) {
              try { await stripe.paymentIntents.cancel(b.stripe_payment_intent_id); }
              catch (e) { log("PI cancel failed (non-fatal)", { id: b.id, msg: (e as Error).message }); }
            }
          } catch (e) {
            log("PI retrieve failed", { id: b.id, msg: (e as Error).message });
          }
        }

        const { error: upErr } = await supabase
          .from("bookings")
          .update({
            booking_status: "canceled",
            payment_status: "canceled",
            decline_reason: "Expired: payment not completed within 24 hours",
            updated_at: new Date().toISOString(),
          })
          .eq("id", b.id);
        if (upErr) throw new Error(`booking update failed: ${upErr.message}`);

        // Fetch vehicle + agency for email content
        const [{ data: vehicle }, { data: agency }] = await Promise.all([
          supabase.from("vehicles").select("year, make, model").eq("id", b.vehicle_id).maybeSingle(),
          supabase.from("agencies").select("agency_name, email").eq("id", b.agency_id).maybeSingle(),
        ]);
        const vehicleLabel = vehicle ? `${vehicle.year} ${vehicle.make} ${vehicle.model}` : "your vehicle";
        const total = (b.total_amount_cents / 100).toFixed(2);

        if (resendApiKey) {
          // Renter — expired notice
          if (b.renter_email) {
            const renterHtml = `<div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:20px;background:#0d1b2e;color:#fff;">
              <h2 style="color:#f87171;margin-top:0;">Booking Expired</h2>
              <p>Hi ${escapeHtml(b.renter_name)},</p>
              <p>Your reservation request for the <strong>${escapeHtml(vehicleLabel)}</strong> has been canceled because payment was not completed within 24 hours.</p>
              <table style="width:100%;border-collapse:collapse;margin:16px 0;background:#132640;border-radius:8px;overflow:hidden;">
                <tr><td style="padding:10px;color:#9aa4b2;">Vehicle</td><td style="padding:10px;font-weight:bold;">${escapeHtml(vehicleLabel)}</td></tr>
                <tr><td style="padding:10px;color:#9aa4b2;">Pickup</td><td style="padding:10px;font-weight:bold;">${escapeHtml(fmtDate(b.pickup_date))}</td></tr>
                <tr><td style="padding:10px;color:#9aa4b2;">Total</td><td style="padding:10px;font-weight:bold;">$${total}</td></tr>
              </table>
              <p><strong>You have not been charged.</strong> The vehicle has been released. If you'd still like to book, you can start a new reservation any time.</p>
              <p style="text-align:center;margin:24px 0;">
                <a href="https://www.gozuvio.com/vehicles/${b.vehicle_id}" style="background:#2dd4bf;color:#0d1b2e;padding:12px 24px;border-radius:6px;text-decoration:none;font-weight:bold;">Start a New Booking</a>
              </p>
              <p>Questions? <a href="mailto:team@zuvio.us" style="color:#2dd4bf;">team@zuvio.us</a> · 725-239-2300</p>
              <p style="color:#888;font-size:12px;margin-top:24px;">— The ZUVIO Team</p>
            </div>`;
            await fetch("https://api.resend.com/emails", {
              method: "POST",
              headers: { Authorization: `Bearer ${resendApiKey}`, "Content-Type": "application/json" },
              body: JSON.stringify({
                from: FROM_EMAIL,
                to: [b.renter_email],
                subject: `Booking expired — ${vehicleLabel}`,
                html: renterHtml,
              }),
            });
          }

          // Agency — canceled notice (safe post-expiration)
          if (agency?.email) {
            const agencyHtml = `<div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:20px;">
              <h2>Pending booking canceled — no payment</h2>
              <p>Hi ${escapeHtml(agency.agency_name || "there")},</p>
              <p>The following pending booking was automatically canceled because the renter did not complete payment within 24 hours. The vehicle and dates are now released.</p>
              <ul>
                <li><strong>Renter:</strong> ${escapeHtml(b.renter_name)}</li>
                <li><strong>Vehicle:</strong> ${escapeHtml(vehicleLabel)}</li>
                <li><strong>Pickup:</strong> ${escapeHtml(fmtDate(b.pickup_date))}</li>
                <li><strong>Drop-off:</strong> ${escapeHtml(fmtDate(b.dropoff_date))}</li>
                <li><strong>Booking ID:</strong> ${escapeHtml(b.id)}</li>
              </ul>
              <p>No action needed from you.</p>
              <p style="color:#888;font-size:12px;">— Zuvio</p>
            </div>`;
            await fetch("https://api.resend.com/emails", {
              method: "POST",
              headers: { Authorization: `Bearer ${resendApiKey}`, "Content-Type": "application/json" },
              body: JSON.stringify({
                from: FROM_EMAIL,
                to: [agency.email],
                bcc: [INTERNAL_ALERT_EMAIL],
                subject: `Booking canceled (no payment) — ${vehicleLabel}`,
                html: agencyHtml,
              }),
            });
          }
        }

        results.push({ id: b.id, canceled: true });
      } catch (e) {
        const msg = (e as Error).message;
        log("Cancel failed", { id: b.id, msg });
        results.push({ id: b.id, error: msg });
      }
    }

    return new Response(JSON.stringify({ success: true, count: results.length, results }), {
      status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("[EXPIRE-STALLED-BOOKINGS] Error:", err);
    return new Response(JSON.stringify({ error: (err as Error).message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});