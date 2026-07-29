import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { sendOpsSms, fmtDay } from "../_shared/sms.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-cron-secret",
};

const log = (step: string, details?: unknown) =>
  console.log(`[STUCK-SMS] ${step}${details ? ` - ${JSON.stringify(details)}` : ""}`);

// A booking is "stuck" once the agency has had this long to act on a live,
// paid-or-authorized request and still hasn't approved or declined it.
const STUCK_AFTER_HOURS = 2;
const FOLLOWUP_AFTER_HOURS = 24;
// A booking is an "abandoned checkout" once it has sat in awaiting_payment this
// long with no Stripe PaymentIntent/SetupIntent/charge behind it at all.
const ABANDONED_AFTER_HOURS = 2;

function esc(text: unknown): string {
  const map: Record<string, string> = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" };
  return String(text ?? "").replace(/[&<>"']/g, (m) => map[m]);
}

/**
 * Hourly SMS alerting for stuck bookings.
 *  - First alert: fires the first hour a booking crosses the stuck threshold.
 *  - Follow-up: exactly one reminder if it's still stuck 24h after creation.
 *  - Never repeats: every send is recorded in public.booking_alert_log with a
 *    unique (booking_id, alert_type, channel) key.
 * Auth: x-cron-secret must match CRON_SECRET.
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

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
      { auth: { persistSession: false } },
    );

    const now = Date.now();
    const stuckCutoff = new Date(now - STUCK_AFTER_HOURS * 3600_000).toISOString();

    const { data: rows, error } = await supabase
      .from("bookings")
      .select("id, renter_name, renter_email, renter_phone, pickup_date, dropoff_date, created_at, vehicle_id, agency_id, payment_status")
      .eq("booking_status", "pending_agency")
      .lt("created_at", stuckCutoff)
      .order("created_at", { ascending: true })
      .limit(100);
    if (error) throw new Error(`Query failed: ${error.message}`);

    const candidates = rows ?? [];
    log("candidates", { count: candidates.length });

    const results: Array<Record<string, unknown>> = [];

    for (const b of candidates) {
      const ageHours = (now - new Date(b.created_at).getTime()) / 3600_000;
      const alertType = ageHours >= FOLLOWUP_AFTER_HOURS ? "stuck_followup" : "stuck_first";

      // If the follow-up window is reached, make sure the first alert exists too;
      // otherwise send the first alert now and let the follow-up come later.
      const { data: existing } = await supabase
        .from("booking_alert_log")
        .select("alert_type")
        .eq("booking_id", b.id)
        .eq("channel", "sms");
      const sentTypes = new Set((existing ?? []).map((r) => r.alert_type));

      const toSend = sentTypes.has(alertType) ? null : alertType;
      if (!toSend) { results.push({ id: b.id, skipped: "already_alerted", alertType }); continue; }

      const [{ data: vehicle }, { data: agency }] = await Promise.all([
        supabase.from("vehicles").select("year, make, model").eq("id", b.vehicle_id).maybeSingle(),
        supabase.from("agencies").select("agency_name").eq("id", b.agency_id).maybeSingle(),
      ]);
      const vehicleLabel = vehicle
        ? [vehicle.year, vehicle.make, vehicle.model].filter(Boolean).join(" ")
        : "Vehicle";

      const header = toSend === "stuck_followup"
        ? `ZUVIO REMINDER: still stuck after ${Math.floor(ageHours)}h`
        : `ZUVIO ALERT: booking stuck ${Math.floor(ageHours)}h with no agency action`;

      const body = [
        header,
        `Agency: ${agency?.agency_name ?? "Unknown"}`,
        `Customer: ${b.renter_name}`,
        `Phone: ${b.renter_phone ?? "n/a"}`,
        `Email: ${b.renter_email ?? "n/a"}`,
        `Vehicle: ${vehicleLabel}`,
        `Pickup: ${fmtDay(b.pickup_date)}`,
        `Return: ${fmtDay(b.dropoff_date)}`,
        `Booking: ${b.id.slice(0, 8)}`,
      ].join("\n");

      const sentCount = await sendOpsSms(body);
      if (sentCount > 0) {
        await supabase.from("booking_alert_log").insert({
          booking_id: b.id, alert_type: toSend, channel: "sms",
          detail: `age_hours=${Math.floor(ageHours)}`,
        });
        results.push({ id: b.id, sent: toSend, recipients: sentCount });
      } else {
        results.push({ id: b.id, error: "sms_not_sent", alertType: toSend });
      }
    }

    // ---- Abandoned checkout email alerts -------------------------------
    const abandonedResults: Array<Record<string, unknown>> = [];
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    const alertEmail = Deno.env.get("STUCK_REPORT_EMAIL") || "zuviollc@gmail.com";
    const abandonedCutoff = new Date(now - ABANDONED_AFTER_HOURS * 3600_000).toISOString();

    const { data: abandonedRows, error: abandonedError } = await supabase
      .from("bookings")
      .select("id, renter_name, renter_email, renter_phone, pickup_date, dropoff_date, created_at, vehicle_id, agency_id, total_amount_cents, currency, stripe_payment_intent_id, stripe_setup_intent_id, stripe_charge_id")
      .eq("payment_status", "awaiting_payment")
      .lt("created_at", abandonedCutoff)
      .is("stripe_payment_intent_id", null)
      .is("stripe_setup_intent_id", null)
      .is("stripe_charge_id", null)
      .order("created_at", { ascending: true })
      .limit(100);
    if (abandonedError) throw new Error(`Abandoned query failed: ${abandonedError.message}`);

    for (const b of abandonedRows ?? []) {
      const { data: alreadySent } = await supabase
        .from("booking_alert_log")
        .select("id")
        .eq("booking_id", b.id)
        .eq("alert_type", "abandoned_checkout")
        .eq("channel", "email")
        .maybeSingle();
      if (alreadySent) { abandonedResults.push({ id: b.id, skipped: "already_alerted" }); continue; }

      const ageHours = Math.floor((now - new Date(b.created_at).getTime()) / 3600_000);
      const [{ data: vehicle }, { data: agency }] = await Promise.all([
        supabase.from("vehicles").select("year, make, model").eq("id", b.vehicle_id).maybeSingle(),
        supabase.from("agencies").select("agency_name").eq("id", b.agency_id).maybeSingle(),
      ]);
      const vehicleLabel = vehicle
        ? [vehicle.year, vehicle.make, vehicle.model].filter(Boolean).join(" ")
        : "Vehicle";
      const total = ((b.total_amount_cents ?? 0) / 100).toFixed(2);

      const rows = [
        ["Agency", agency?.agency_name ?? "Unknown"],
        ["Customer", b.renter_name],
        ["Phone", b.renter_phone ?? "n/a"],
        ["Email", b.renter_email ?? "n/a"],
        ["Vehicle", vehicleLabel],
        ["Pickup", fmtDay(b.pickup_date)],
        ["Return", fmtDay(b.dropoff_date)],
        ["Total", `$${total} ${String(b.currency || "usd").toUpperCase()}`],
        ["Age", `${ageHours}h in awaiting_payment`],
        ["Booking ID", b.id],
      ];
      const html = `<div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:20px;background:#0d1b2e;color:#fff;">
        <h2 style="color:#fbbf24;margin-top:0;">🛒 Abandoned checkout</h2>
        <p style="color:#c8d2e0;">This renter started a booking but never completed payment — no Stripe PaymentIntent was ever created. The 24-hour sweep will cancel it automatically; no action required.</p>
        <table style="width:100%;border-collapse:collapse;margin:16px 0;background:#132640;border-radius:8px;overflow:hidden;">
          ${rows.map(([k, v]) => `<tr><td style="padding:10px;color:#9aa4b2;border-bottom:1px solid rgba(255,255,255,0.08);">${esc(k)}</td><td style="padding:10px;font-weight:bold;border-bottom:1px solid rgba(255,255,255,0.08);">${esc(v)}</td></tr>`).join("")}
        </table>
        <p style="color:#888;font-size:12px;">— ZUVIO automated alerts</p>
      </div>`;

      if (!resendApiKey) { abandonedResults.push({ id: b.id, error: "no_resend_key" }); continue; }
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { Authorization: `Bearer ${resendApiKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          from: "ZUVIO Alerts <team@zuvio.us>",
          to: [alertEmail],
          subject: `Abandoned checkout — ${agency?.agency_name ?? "Unknown"} · ${vehicleLabel} (${ageHours}h)`,
          html,
        }),
      });
      if (!res.ok) {
        console.error("[STUCK-SMS] Abandoned email failed:", await res.text());
        abandonedResults.push({ id: b.id, error: "email_failed" });
        continue;
      }
      await supabase.from("booking_alert_log").insert({
        booking_id: b.id, alert_type: "abandoned_checkout", channel: "email",
        detail: `age_hours=${ageHours}`,
      });
      abandonedResults.push({ id: b.id, sent: "abandoned_checkout" });
    }
    log("abandoned", { count: (abandonedRows ?? []).length });

    return new Response(
      JSON.stringify({ ok: true, checked: candidates.length, results, abandoned: abandonedResults }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (err) {
    console.error("[STUCK-SMS] Error:", err);
    return new Response(JSON.stringify({ error: (err as Error).message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
