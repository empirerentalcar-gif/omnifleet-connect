import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const ADMIN_EMAIL = "zuviollc@gmail.com";
const EMAIL_RE = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;

const log = (step: string, details?: unknown) => {
  console.log(`[CREATE-VEHICLE-INQUIRY] ${step}${details ? ` - ${JSON.stringify(details)}` : ""}`);
};

const esc = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

const sendEmail = async (payload: Record<string, unknown>) => {
  const key = Deno.env.get("RESEND_API_KEY");
  if (!key) {
    log("email skipped: no RESEND_API_KEY");
    return;
  }
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from: "Zuvio Leads <noreply@notify.gozuvio.com>", ...payload }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) log("resend failed", { status: res.status, data });
  else log("email sent", { to: payload.to, id: (data as { id?: string }).id });
};

const detailRows = (rows: [string, string][]) =>
  rows
    .map(
      ([k, v]) =>
        `<tr><td style="padding:10px 12px;color:#9aa4b2;border-bottom:1px solid rgba(255,255,255,0.08);">${esc(k)}</td><td style="padding:10px 12px;font-weight:bold;border-bottom:1px solid rgba(255,255,255,0.08);">${esc(v)}</td></tr>`,
    )
    .join("");

/**
 * Inquiry-only lead capture for vehicles whose agency has not completed Stripe
 * Connect onboarding. No payment, no booking row — this writes a lead to
 * public.vehicle_inquiries and notifies Zuvio + the agency.
 */
serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const body = await req.json();
    const {
      vehicle_id,
      pickup_date,
      dropoff_date,
      renter_name,
      renter_email,
      renter_phone,
      message,
    } = body ?? {};

    if (!vehicle_id || !pickup_date || !dropoff_date) {
      throw new Error("Missing vehicle_id, pickup_date, or dropoff_date");
    }
    if (!renter_name || String(renter_name).trim().length < 2 || String(renter_name).length > 100) {
      throw new Error("Invalid name");
    }
    if (!renter_email || !EMAIL_RE.test(String(renter_email))) throw new Error("Invalid email");
    if (!renter_phone || String(renter_phone).trim().length < 7) throw new Error("Invalid phone");
    if (message && String(message).length > 1000) throw new Error("Message is too long");

    const pickup = new Date(pickup_date);
    const dropoff = new Date(dropoff_date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (Number.isNaN(pickup.getTime()) || Number.isNaN(dropoff.getTime())) {
      throw new Error("Invalid dates");
    }
    if (pickup < today) throw new Error("Pickup date cannot be in the past");
    if (dropoff <= pickup) throw new Error("Drop-off must be after pickup");

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } },
    );

    const { data: vehicle, error: vehErr } = await supabaseAdmin
      .from("vehicles")
      .select("id, profile_id, make, model, year, daily_rate, status")
      .eq("id", vehicle_id)
      .maybeSingle();
    if (vehErr) throw new Error(`Vehicle lookup failed: ${vehErr.message}`);
    if (!vehicle) throw new Error("Vehicle not found");
    if (vehicle.status !== "available") throw new Error("Vehicle is not available");

    const { data: profile } = await supabaseAdmin
      .from("profiles")
      .select("id, user_id, business_name, contact_email")
      .eq("id", vehicle.profile_id)
      .maybeSingle();
    if (!profile) throw new Error("Agency profile not found");

    const { data: agency } = await supabaseAdmin
      .from("agencies")
      .select("id, agency_name, email")
      .eq("owner_user_id", profile.user_id)
      .maybeSingle();

    const { data: inquiry, error: insErr } = await supabaseAdmin
      .from("vehicle_inquiries")
      .insert({
        vehicle_id,
        profile_id: profile.id,
        agency_id: agency?.id ?? null,
        renter_name: String(renter_name).trim(),
        renter_email: String(renter_email).trim(),
        renter_phone: String(renter_phone).trim(),
        pickup_date,
        dropoff_date,
        message: message ? String(message).trim() : null,
      })
      .select("id")
      .single();
    if (insErr) throw new Error(`Inquiry insert failed: ${insErr.message}`);
    log("Inquiry created", { inquiry_id: inquiry.id });

    const vehicleLabel =
      `${vehicle.year ?? ""} ${vehicle.make ?? ""} ${vehicle.model ?? ""}`.trim() || "Vehicle";
    const agencyName = agency?.agency_name ?? profile.business_name ?? "Unknown agency";
    const rows: [string, string][] = [
      ["Renter", String(renter_name)],
      ["Phone", String(renter_phone)],
      ["Email", String(renter_email)],
      ["Vehicle", vehicleLabel],
      ["Pickup", String(pickup_date)],
      ["Drop-off", String(dropoff_date)],
      ["Agency", agencyName],
    ];
    if (message) rows.push(["Message", String(message)]);

    // Notify Zuvio + the agency. Never let email failures break the lead.
    try {
      await sendEmail({
        to: [ADMIN_EMAIL],
        subject: `LEAD (not a booking) — ${renter_name} / ${vehicleLabel} / ${agencyName}`,
        html: `<div style="font-family:Arial,sans-serif;max-width:640px;margin:0 auto;padding:24px;background:#0d1b2e;color:#fff;">
  <p style="display:inline-block;background:#fbbf24;color:#0d1b2e;font-weight:bold;padding:4px 10px;border-radius:4px;margin:0 0 12px;font-size:12px;letter-spacing:.08em;">LEAD — NOT A CONFIRMED RESERVATION</p>
  <h2 style="color:#2dd4bf;margin:0 0 12px;">New vehicle inquiry</h2>
  <p style="margin:0 0 16px;color:#c8d0dc;">This agency has <strong>not completed Stripe Connect onboarding</strong>, so no payment was taken and no booking exists. The renter was told the agency will contact them to confirm availability and payment.</p>
  <table style="width:100%;border-collapse:collapse;background:#132640;border-radius:8px;overflow:hidden;">${detailRows(rows)}</table>
  <p style="font-size:12px;color:#7f8b9c;margin-top:20px;">Inquiry ID: ${inquiry.id}</p>
</div>`,
      });
    } catch (e) {
      log("admin email error", { msg: (e as Error).message });
    }

    const agencyTo = (agency?.email ?? profile.contact_email ?? "").trim();
    if (agencyTo && EMAIL_RE.test(agencyTo)) {
      try {
        await sendEmail({
          to: [agencyTo],
          subject: `Potential renter for your ${vehicleLabel} — finish Stripe setup to accept bookings`,
          html: `<div style="font-family:Arial,sans-serif;max-width:640px;margin:0 auto;padding:24px;background:#0d1b2e;color:#fff;">
  <p style="display:inline-block;background:#fbbf24;color:#0d1b2e;font-weight:bold;padding:4px 10px;border-radius:4px;margin:0 0 12px;font-size:12px;letter-spacing:.08em;">LEAD — NOT A CONFIRMED RESERVATION</p>
  <h2 style="color:#2dd4bf;margin:0 0 12px;">You have a potential renter</h2>
  <p style="margin:0 0 16px;color:#c8d0dc;">Someone asked about one of your vehicles on Zuvio. <strong>No payment was collected and nothing is reserved</strong> — please contact them directly to confirm availability and payment.</p>
  <table style="width:100%;border-collapse:collapse;background:#132640;border-radius:8px;overflow:hidden;">${detailRows(rows)}</table>
  <p style="margin:20px 0 8px;color:#fbbf24;"><strong>Important:</strong> your Stripe payment setup isn't finished, so renters can't book and pay through Zuvio yet. Finish it and future requests become real, paid bookings automatically.</p>
  <p style="margin:8px 0 0;"><a href="https://gozuvio.com/owner-dashboard" style="display:inline-block;background:#2dd4bf;color:#0d1b2e;font-weight:bold;padding:12px 20px;border-radius:6px;text-decoration:none;">Finish Stripe setup</a></p>
  <p style="font-size:12px;color:#7f8b9c;margin-top:20px;">Inquiry ID: ${inquiry.id}</p>
</div>`,
        });
      } catch (e) {
        log("agency email error", { msg: (e as Error).message });
      }
    } else {
      log("agency email skipped: invalid address", { profile_id: profile.id });
    }

    await supabaseAdmin
      .from("vehicle_inquiries")
      .update({ notified_at: new Date().toISOString() })
      .eq("id", inquiry.id);

    return new Response(JSON.stringify({ inquiry_id: inquiry.id }), {
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
