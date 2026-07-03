import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-cron-secret",
};

const ADMIN_EMAIL = "zuviollc@gmail.com";
const FROM_EMAIL = "Zuvio Bookings <bookings@notify.gozuvio.com>";
const ADMIN_BASE_URL = "https://gozuvio.com";

const log = (step: string, details?: unknown) => {
  const extra = details ? ` - ${JSON.stringify(details)}` : "";
  console.log(`[BOOKING-CONFIRMED-EMAIL] ${step}${extra}`);
};

function esc(text: unknown): string {
  const map: Record<string, string> = {
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;",
  };
  return String(text ?? "").replace(/[&<>"']/g, (m) => map[m]);
}

function fmtDate(s: string): string {
  try {
    const d = new Date(s);
    if (isNaN(d.getTime())) return s;
    return d.toLocaleDateString("en-US", {
      weekday: "short", year: "numeric", month: "short", day: "numeric",
    });
  } catch { return s; }
}

function fmtMoney(cents: number | null | undefined, currency = "usd"): string {
  const n = ((cents ?? 0) / 100);
  return `$${n.toFixed(2)} ${String(currency).toUpperCase()}`;
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    // Server-to-server only
    const cronSecret = Deno.env.get("CRON_SECRET");
    const incoming = req.headers.get("x-cron-secret") || req.headers.get("X-Cron-Secret");
    if (!cronSecret || incoming !== cronSecret) {
      return new Response(JSON.stringify({ error: "unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { booking_id } = (await req.json()) as { booking_id?: string };
    if (!booking_id) {
      return new Response(JSON.stringify({ error: "missing booking_id" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    if (!resendApiKey) throw new Error("RESEND_API_KEY not configured");

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } },
    );

    // Idempotency gate: atomically claim the send slot. Only one caller wins.
    const nowIso = new Date().toISOString();
    const { data: claimed, error: claimErr } = await supabaseAdmin
      .from("bookings")
      .update({ confirmation_email_sent_at: nowIso })
      .eq("id", booking_id)
      .is("confirmation_email_sent_at", null)
      .select("id")
      .maybeSingle();
    if (claimErr) throw new Error(`claim failed: ${claimErr.message}`);
    if (!claimed) {
      log("Already sent, skipping", { booking_id });
      return new Response(JSON.stringify({ ok: true, skipped: "already_sent" }), {
        status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Load booking, vehicle, agency
    const { data: booking, error: bErr } = await supabaseAdmin
      .from("bookings")
      .select("id, agency_id, vehicle_id, renter_name, renter_email, pickup_date, dropoff_date, rental_days, total_amount_cents, platform_fee_cents, currency, payment_status")
      .eq("id", booking_id)
      .maybeSingle();
    if (bErr || !booking) throw new Error(`booking not found: ${bErr?.message ?? ""}`);

    const [{ data: vehicle }, { data: agency }] = await Promise.all([
      supabaseAdmin.from("vehicles").select("year, make, model").eq("id", booking.vehicle_id).maybeSingle(),
      supabaseAdmin.from("agencies").select("id, agency_name, email").eq("id", booking.agency_id).maybeSingle(),
    ]);

    const vehicleLabel = vehicle
      ? `${vehicle.year ?? ""} ${vehicle.make ?? ""} ${vehicle.model ?? ""}`.trim()
      : "Vehicle";
    const agencyName = agency?.agency_name ?? "Unknown agency";

    // Recipients
    const recipients: string[] = [ADMIN_EMAIL];
    const emailRe = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
    const agencyEmail = agency?.email?.trim() ?? "";
    if (agencyEmail && emailRe.test(agencyEmail)) {
      recipients.push(agencyEmail);
    } else {
      // Log failure for follow-up, but keep sending to admin
      try {
        await supabaseAdmin.from("sensitive_update_failures").insert({
          agency_id: booking.agency_id,
          field_name: "agency.email",
          source: "booking-confirmation-email",
          expected_value: "valid email address",
          actual_value: agencyEmail || "(empty)",
          error_message: `Booking ${booking.id}: agency ${booking.agency_id} has no valid owner email; admin email sent only.`,
        });
      } catch (e) {
        log("failure-log insert failed", { msg: (e as Error).message });
      }
      log("Agency email missing/invalid", { agency_id: booking.agency_id, agencyEmail });
    }

    // Amount breakdown
    const total = booking.total_amount_cents ?? 0;
    const platform = booking.platform_fee_cents ?? 0;
    const payout = Math.max(total - platform, 0);
    const currency = booking.currency || "usd";

    const adminLink = `${ADMIN_BASE_URL}/admin/agencies/${booking.agency_id}`;

    const subject = `Booking Confirmed & Paid — ${booking.renter_name ?? "Renter"} / ${vehicleLabel}`;

    const html = `<div style="font-family:Arial,sans-serif;max-width:640px;margin:0 auto;padding:24px;background:#0d1b2e;color:#fff;">
  <h2 style="color:#2dd4bf;margin:0 0 12px;">✅ Booking Confirmed & Paid</h2>
  <p style="margin:0 0 16px;color:#c8d0dc;">A booking has been paid and confirmed on Zuvio.</p>
  <table style="width:100%;border-collapse:collapse;background:#132640;border-radius:8px;overflow:hidden;">
    <tr><td style="padding:10px 12px;color:#9aa4b2;border-bottom:1px solid rgba(255,255,255,0.08);">Renter</td><td style="padding:10px 12px;font-weight:bold;border-bottom:1px solid rgba(255,255,255,0.08);">${esc(booking.renter_name)}</td></tr>
    <tr><td style="padding:10px 12px;color:#9aa4b2;border-bottom:1px solid rgba(255,255,255,0.08);">Vehicle</td><td style="padding:10px 12px;font-weight:bold;border-bottom:1px solid rgba(255,255,255,0.08);">${esc(vehicleLabel)}</td></tr>
    <tr><td style="padding:10px 12px;color:#9aa4b2;border-bottom:1px solid rgba(255,255,255,0.08);">Agency</td><td style="padding:10px 12px;font-weight:bold;border-bottom:1px solid rgba(255,255,255,0.08);">${esc(agencyName)}</td></tr>
    <tr><td style="padding:10px 12px;color:#9aa4b2;border-bottom:1px solid rgba(255,255,255,0.08);">Pickup</td><td style="padding:10px 12px;font-weight:bold;border-bottom:1px solid rgba(255,255,255,0.08);">${esc(fmtDate(booking.pickup_date))}</td></tr>
    <tr><td style="padding:10px 12px;color:#9aa4b2;border-bottom:1px solid rgba(255,255,255,0.08);">Drop-off</td><td style="padding:10px 12px;font-weight:bold;border-bottom:1px solid rgba(255,255,255,0.08);">${esc(fmtDate(booking.dropoff_date))}</td></tr>
    <tr><td style="padding:10px 12px;color:#9aa4b2;border-bottom:1px solid rgba(255,255,255,0.08);">Duration</td><td style="padding:10px 12px;font-weight:bold;border-bottom:1px solid rgba(255,255,255,0.08);">${booking.rental_days ?? 0} day${booking.rental_days === 1 ? "" : "s"}</td></tr>
    <tr><td style="padding:10px 12px;color:#9aa4b2;border-bottom:1px solid rgba(255,255,255,0.08);">Payment status</td><td style="padding:10px 12px;font-weight:bold;color:#2dd4bf;border-bottom:1px solid rgba(255,255,255,0.08);">Paid</td></tr>
  </table>

  <h3 style="color:#2dd4bf;margin:20px 0 8px;">Price breakdown</h3>
  <table style="width:100%;border-collapse:collapse;background:#132640;border-radius:8px;overflow:hidden;">
    <tr><td style="padding:10px 12px;color:#9aa4b2;border-bottom:1px solid rgba(255,255,255,0.08);">Rental total (renter paid)</td><td style="padding:10px 12px;text-align:right;font-weight:bold;border-bottom:1px solid rgba(255,255,255,0.08);">${fmtMoney(total, currency)}</td></tr>
    <tr><td style="padding:10px 12px;color:#9aa4b2;border-bottom:1px solid rgba(255,255,255,0.08);">Platform fee</td><td style="padding:10px 12px;text-align:right;font-weight:bold;border-bottom:1px solid rgba(255,255,255,0.08);">${fmtMoney(platform, currency)}</td></tr>
    <tr><td style="padding:10px 12px;color:#9aa4b2;">Agency payout</td><td style="padding:10px 12px;text-align:right;font-weight:bold;color:#2dd4bf;">${fmtMoney(payout, currency)}</td></tr>
  </table>

  <p style="margin:24px 0 8px;">
    <a href="${esc(adminLink)}" style="display:inline-block;background:#2dd4bf;color:#0d1b2e;padding:10px 18px;border-radius:6px;text-decoration:none;font-weight:bold;">View in admin</a>
  </p>
  <p style="font-size:12px;color:#7f8b9c;margin-top:20px;">Booking ID: ${esc(booking.id)}</p>
</div>`;

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: FROM_EMAIL,
        to: recipients,
        subject,
        html,
      }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      // Roll back the claim so a later retry can succeed
      await supabaseAdmin
        .from("bookings")
        .update({ confirmation_email_sent_at: null })
        .eq("id", booking_id);
      log("Resend error", { status: res.status, data });
      return new Response(JSON.stringify({ error: "resend_failed", details: data }), {
        status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    log("Sent", { booking_id, recipients, resend_id: (data as { id?: string }).id });
    return new Response(JSON.stringify({ ok: true, recipients, resend_id: (data as { id?: string }).id }), {
      status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    log("ERROR", { msg });
    return new Response(JSON.stringify({ error: msg }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});