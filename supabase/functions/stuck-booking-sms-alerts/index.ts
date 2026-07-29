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

    return new Response(
      JSON.stringify({ ok: true, checked: candidates.length, results }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (err) {
    console.error("[STUCK-SMS] Error:", err);
    return new Response(JSON.stringify({ error: (err as Error).message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
