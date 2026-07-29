import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { sendOpsSms, fmtDay } from "../_shared/sms.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-cron-secret",
};

const INTERNAL_ALERT_EMAIL = "zuviollc@gmail.com";
const FROM_EMAIL = "ZUVIO <team@zuvio.us>";

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
 * Server-to-server only. Called from stripe-webhook on payment_intent.payment_failed.
 * - Emails the renter with a retry link.
 * - Emails Zuvio ops (INTERNAL_ALERT_EMAIL) with full booking + agency details.
 * - Does NOT email the agency — intentionally, to avoid off-platform poaching
 *   of an unpaid live lead.
 */
Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const cronSecret = Deno.env.get("CRON_SECRET");
    const incoming = req.headers.get("x-cron-secret") || req.headers.get("X-Cron-Secret");
    if (!cronSecret || incoming !== cronSecret) {
      return new Response(JSON.stringify({ error: "unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { booking_id, failure_message } = (await req.json()) as {
      booking_id?: string;
      failure_message?: string;
    };
    if (!booking_id) {
      return new Response(JSON.stringify({ error: "Missing booking_id" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
      { auth: { persistSession: false } },
    );

    const { data: booking, error } = await supabase
      .from("bookings")
      .select("id, renter_name, renter_email, renter_phone, pickup_date, dropoff_date, rental_days, total_amount_cents, currency, vehicle_id, agency_id, created_at")
      .eq("id", booking_id)
      .maybeSingle();
    if (error || !booking) {
      return new Response(JSON.stringify({ error: "Booking not found" }), {
        status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const [{ data: vehicle }, { data: agency }] = await Promise.all([
      supabase.from("vehicles").select("year, make, model").eq("id", booking.vehicle_id).maybeSingle(),
      supabase.from("agencies").select("agency_name, city, state, email, phone").eq("id", booking.agency_id).maybeSingle(),
    ]);

    const vehicleLabel = vehicle ? `${vehicle.year} ${vehicle.make} ${vehicle.model}` : "your vehicle";
    const total = (booking.total_amount_cents / 100).toFixed(2);
    const reason = (failure_message || "Your card issuer declined the payment.").slice(0, 500);

    const retryUrl = `https://www.gozuvio.com/vehicles/${booking.vehicle_id}`;

    // Ops SMS: instant text to Zuvio on payment failure (never to the agency).
    try {
      const smsCount = await sendOpsSms([
        "ZUVIO: Payment FAILED on a booking",
        `Customer: ${booking.renter_name}`,
        `Phone: ${booking.renter_phone || "n/a"}`,
        `Email: ${booking.renter_email || "n/a"}`,
        `Vehicle: ${vehicleLabel}`,
        `Pickup: ${fmtDay(booking.pickup_date)}`,
        `Return: ${fmtDay(booking.dropoff_date)}`,
        `Total: $${total}`,
        `Reason: ${reason.slice(0, 120)}`,
        `Booking: ${booking.id.slice(0, 8)}`,
      ].join("\n"));
      console.log("[PAYMENT-FAILED-EMAIL] ops sms", { recipients: smsCount });
    } catch (e) {
      console.error("[PAYMENT-FAILED-EMAIL] ops sms error", (e as Error).message);
    }

    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    if (!resendApiKey) {
      console.log("[PAYMENT-FAILED-EMAIL] No RESEND_API_KEY — logging only");
      return new Response(JSON.stringify({ success: true, logged: true }), {
        status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ---- Renter email ----
    let renterResult: unknown = { skipped: "no_renter_email" };
    if (booking.renter_email) {
      const renterHtml = `<div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:20px;background:#0d1b2e;color:#fff;">
        <h2 style="color:#f87171;margin-top:0;">⚠️ Payment Didn't Go Through</h2>
        <p>Hi ${escapeHtml(booking.renter_name)},</p>
        <p>We tried to authorize your payment for the <strong>${escapeHtml(vehicleLabel)}</strong> and it was declined by your card issuer.</p>
        <p style="background:rgba(248,113,113,0.1);border:1px solid rgba(248,113,113,0.3);padding:12px;border-radius:8px;font-size:14px;">
          <strong>Reason:</strong> ${escapeHtml(reason)}
        </p>
        <p><strong>You have not been charged.</strong> Your reservation is on hold, but the vehicle isn't confirmed until payment succeeds.</p>
        <table style="width:100%;border-collapse:collapse;margin:16px 0;background:#132640;border-radius:8px;overflow:hidden;">
          <tr><td style="padding:10px;border-bottom:1px solid rgba(255,255,255,0.1);color:#9aa4b2;">Vehicle</td><td style="padding:10px;border-bottom:1px solid rgba(255,255,255,0.1);font-weight:bold;">${escapeHtml(vehicleLabel)}</td></tr>
          <tr><td style="padding:10px;border-bottom:1px solid rgba(255,255,255,0.1);color:#9aa4b2;">Pickup</td><td style="padding:10px;border-bottom:1px solid rgba(255,255,255,0.1);font-weight:bold;">${escapeHtml(fmtDate(booking.pickup_date))}</td></tr>
          <tr><td style="padding:10px;border-bottom:1px solid rgba(255,255,255,0.1);color:#9aa4b2;">Drop-off</td><td style="padding:10px;border-bottom:1px solid rgba(255,255,255,0.1);font-weight:bold;">${escapeHtml(fmtDate(booking.dropoff_date))}</td></tr>
          <tr><td style="padding:10px;color:#9aa4b2;">Total</td><td style="padding:10px;font-weight:bold;color:#2dd4bf;">$${total} ${String(booking.currency || "usd").toUpperCase()}</td></tr>
        </table>
        <p style="text-align:center;margin:24px 0;">
          <a href="${retryUrl}" style="background:#2dd4bf;color:#0d1b2e;padding:12px 24px;border-radius:6px;text-decoration:none;font-weight:bold;display:inline-block;">Retry with a Different Payment Method</a>
        </p>
        <p style="font-size:14px;color:#9aa4b2;">Common fixes: try another card, check your billing ZIP, or contact your bank to approve the charge. This booking will automatically expire in 24 hours if payment isn't completed.</p>
        <p style="font-size:13px;color:#9aa4b2;">Booking ID: ${escapeHtml(booking.id)}</p>
        <p>Need help? <a href="mailto:team@zuvio.us" style="color:#2dd4bf;">team@zuvio.us</a> · 725-239-2300</p>
        <p style="color:#888;font-size:12px;margin-top:24px;">— The ZUVIO Team</p>
      </div>`;

      const renterRes = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { Authorization: `Bearer ${resendApiKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          from: FROM_EMAIL,
          to: [booking.renter_email],
          subject: `Payment declined — retry your ${vehicleLabel} booking`,
          html: renterHtml,
        }),
      });
      renterResult = await renterRes.json();
      if (!renterRes.ok) console.error("[PAYMENT-FAILED-EMAIL] Renter send failed", renterResult);
    }

    // ---- Internal Zuvio ops alert (NOT to the agency) ----
    const agencyName = agency?.agency_name ?? "(unknown)";
    const opsHtml = `<div style="font-family:sans-serif;max-width:640px;margin:0 auto;">
      <h2 style="color:#dc2626;">🚨 Payment Failed — Live Pending Booking</h2>
      <p><strong>This alert goes to Zuvio ops only.</strong> The agency has NOT been notified — do not forward this to them.</p>
      <h3>Renter</h3>
      <ul>
        <li><strong>Name:</strong> ${escapeHtml(booking.renter_name)}</li>
        <li><strong>Email:</strong> ${escapeHtml(booking.renter_email || "(none)")}</li>
        <li><strong>Phone:</strong> ${escapeHtml(booking.renter_phone || "(none)")}</li>
      </ul>
      <h3>Booking</h3>
      <ul>
        <li><strong>ID:</strong> ${escapeHtml(booking.id)}</li>
        <li><strong>Vehicle:</strong> ${escapeHtml(vehicleLabel)}</li>
        <li><strong>Pickup:</strong> ${escapeHtml(fmtDate(booking.pickup_date))}</li>
        <li><strong>Drop-off:</strong> ${escapeHtml(fmtDate(booking.dropoff_date))}</li>
        <li><strong>Total:</strong> $${total} ${String(booking.currency || "usd").toUpperCase()}</li>
        <li><strong>Created:</strong> ${escapeHtml(fmtDate(booking.created_at))}</li>
      </ul>
      <h3>Agency</h3>
      <ul>
        <li><strong>Name:</strong> ${escapeHtml(agencyName)}</li>
        <li><strong>Location:</strong> ${escapeHtml(agency?.city || "?")}, ${escapeHtml(agency?.state || "?")}</li>
        <li><strong>Email:</strong> ${escapeHtml(agency?.email || "(none)")}</li>
        <li><strong>Phone:</strong> ${escapeHtml(agency?.phone || "(none)")}</li>
      </ul>
      <p><strong>Failure reason:</strong> ${escapeHtml(reason)}</p>
      <p style="color:#666;font-size:12px;">Booking will auto-expire after 24h if renter doesn't complete payment.</p>
    </div>`;

    const opsRes = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${resendApiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: "Zuvio Alerts <team@zuvio.us>",
        to: [INTERNAL_ALERT_EMAIL],
        subject: `[Zuvio] Payment failed — ${booking.renter_name} / ${agencyName} ($${total})`,
        html: opsHtml,
      }),
    });
    const opsResult = await opsRes.json();
    if (!opsRes.ok) console.error("[PAYMENT-FAILED-EMAIL] Ops alert failed", opsResult);

    return new Response(JSON.stringify({ success: true, renter: renterResult, ops: opsResult }), {
      status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("[PAYMENT-FAILED-EMAIL] Error:", err);
    return new Response(JSON.stringify({ error: (err as Error).message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});