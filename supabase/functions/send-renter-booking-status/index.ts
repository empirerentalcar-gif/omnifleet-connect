import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

function escapeHtml(text: string): string {
  const map: Record<string, string> = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" };
  return String(text).replace(/[&<>"']/g, (m) => map[m]);
}

function fmtDate(s: string): string {
  try {
    const d = new Date(s);
    if (isNaN(d.getTime())) return s;
    return d.toLocaleDateString("en-US", { weekday: "short", year: "numeric", month: "short", day: "numeric" });
  } catch { return s; }
}

type StatusKind = "approved" | "declined" | "captured";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const resendApiKey = Deno.env.get("RESEND_API_KEY");

    // Server-to-server only: require CRON_SECRET. Fail-secure if unset.
    const cronSecret = Deno.env.get("CRON_SECRET");
    const incoming = req.headers.get("x-cron-secret") || req.headers.get("X-Cron-Secret");
    if (!cronSecret || incoming !== cronSecret) {
      return new Response(JSON.stringify({ error: "unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { booking_id, status, reason } = (await req.json()) as {
      booking_id?: string;
      status?: StatusKind;
      reason?: string;
    };
    if (!booking_id || !status) {
      return new Response(JSON.stringify({ error: "Missing booking_id or status" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (!["approved", "declined", "captured"].includes(status)) {
      return new Response(JSON.stringify({ error: "Invalid status" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey);
    const { data: booking, error } = await supabase
      .from("bookings")
      .select("id, renter_name, renter_email, renter_phone, pickup_date, dropoff_date, rental_days, total_amount_cents, currency, vehicle_id, agency_id")
      .eq("id", booking_id)
      .maybeSingle();
    if (error || !booking) {
      return new Response(JSON.stringify({ error: "Booking not found" }), {
        status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (!booking.renter_email) {
      return new Response(JSON.stringify({ skipped: true, reason: "No renter_email" }), {
        status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: vehicle } = await supabase
      .from("vehicles").select("year, make, model").eq("id", booking.vehicle_id).maybeSingle();
    const vehicleLabel = vehicle ? `${vehicle.year} ${vehicle.make} ${vehicle.model}` : "Your vehicle";
    const total = (booking.total_amount_cents / 100).toFixed(2);

    // Agency identity is hidden from renters everywhere until a booking is
    // approved (or paid). Only then do we reveal who they're renting from.
    let revealAgency: { name: string; phone: string | null } | null = null;
    if ((status === "approved" || status === "captured") && booking.agency_id) {
      const { data: revealed } = await supabase
        .from("agencies").select("agency_name, phone").eq("id", booking.agency_id).maybeSingle();
      if (revealed?.agency_name) revealAgency = { name: revealed.agency_name, phone: revealed.phone ?? null };
    }

    let heading = "";
    let intro = "";
    let notice = "";
    let subject = "";
    let accent = "#2dd4bf";

    if (status === "approved") {
      heading = "✅ Booking Approved";
      intro = `Great news — the agency confirmed your reservation for the ${vehicleLabel}.`;
      notice = "Your card is authorized and will be charged on your pickup date. See you soon!";
      subject = `Booking approved — ${vehicleLabel}`;
    } else if (status === "captured") {
      heading = "💳 Payment Captured";
      intro = `Your card has been charged for your ${vehicleLabel} rental.`;
      notice = `A receipt of $${total} has been sent by Stripe. Enjoy your trip!`;
      subject = `Payment captured — ${vehicleLabel}`;
    } else {
      heading = "❌ Booking Declined";
      intro = `Unfortunately, the agency was unable to confirm your reservation for the ${vehicleLabel}.`;
      const reasonText = reason && reason.trim().length > 0
        ? `Reason: ${reason.trim()}`
        : "No specific reason was provided.";
      notice = `${reasonText} Your card hold has been released — you have not been charged.`;
      subject = `Booking declined — ${vehicleLabel}`;
      accent = "#f87171";
    }

    const html = `<div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:20px;background:#0d1b2e;color:#fff;">
      <h2 style="color:${accent};margin-top:0;">${heading}</h2>
      <p>Hi ${escapeHtml(booking.renter_name)},</p>
      <p>${escapeHtml(intro)}</p>
      <table style="width:100%;border-collapse:collapse;margin:16px 0;background:#132640;border-radius:8px;overflow:hidden;">
        ${revealAgency ? `<tr><td style="padding:10px;border-bottom:1px solid rgba(255,255,255,0.1);color:#9aa4b2;">Agency</td><td style="padding:10px;border-bottom:1px solid rgba(255,255,255,0.1);font-weight:bold;">${escapeHtml(revealAgency.name)}${revealAgency.phone ? ` · ${escapeHtml(revealAgency.phone)}` : ""}</td></tr>` : ""}
        <tr><td style="padding:10px;border-bottom:1px solid rgba(255,255,255,0.1);color:#9aa4b2;">Vehicle</td><td style="padding:10px;border-bottom:1px solid rgba(255,255,255,0.1);font-weight:bold;">${escapeHtml(vehicleLabel)}</td></tr>
        <tr><td style="padding:10px;border-bottom:1px solid rgba(255,255,255,0.1);color:#9aa4b2;">Pickup</td><td style="padding:10px;border-bottom:1px solid rgba(255,255,255,0.1);font-weight:bold;">${escapeHtml(fmtDate(booking.pickup_date))}</td></tr>
        <tr><td style="padding:10px;border-bottom:1px solid rgba(255,255,255,0.1);color:#9aa4b2;">Drop-off</td><td style="padding:10px;border-bottom:1px solid rgba(255,255,255,0.1);font-weight:bold;">${escapeHtml(fmtDate(booking.dropoff_date))}</td></tr>
        <tr><td style="padding:10px;border-bottom:1px solid rgba(255,255,255,0.1);color:#9aa4b2;">Duration</td><td style="padding:10px;border-bottom:1px solid rgba(255,255,255,0.1);font-weight:bold;">${booking.rental_days} day${booking.rental_days === 1 ? "" : "s"}</td></tr>
        <tr><td style="padding:10px;color:#9aa4b2;">Total</td><td style="padding:10px;font-weight:bold;color:${accent};">$${total} ${String(booking.currency || "usd").toUpperCase()}</td></tr>
      </table>
      <p style="background:rgba(45,212,191,0.1);border:1px solid rgba(45,212,191,0.3);padding:12px;border-radius:8px;font-size:14px;">${escapeHtml(notice)}</p>
      <p style="font-size:13px;color:#9aa4b2;">Booking ID: ${escapeHtml(booking.id)}</p>
      <p>Questions? Reach us at <a href="mailto:team@zuvio.us" style="color:#2dd4bf;">team@zuvio.us</a> or 725-239-2300.</p>
      <p style="color:#888;font-size:12px;margin-top:24px;">— The ZUVIO Team</p>
    </div>`;

    if (!resendApiKey) {
      console.log("[RENTER-STATUS-EMAIL] No RESEND_API_KEY — logging only", { to: booking.renter_email, status });
      return new Response(JSON.stringify({ success: true, logged: true }), {
        status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const resendRes = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${resendApiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: "ZUVIO <team@zuvio.us>",
        to: [booking.renter_email],
        bcc: ["team@zuvio.us"],
        subject,
        html,
      }),
    });
    const resendData = await resendRes.json();
    if (!resendRes.ok) {
      console.error("[RENTER-STATUS-EMAIL] Resend error:", resendData);
      return new Response(JSON.stringify({ error: "Failed to send email", details: resendData }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    console.log(`[RENTER-STATUS-EMAIL] Sent ${status} to ${booking.renter_email}`, resendData);

    // Immediate internal alert on declines
    if (status === "declined") {
      try {
        let agencyName = "Unknown agency";
        if (booking.agency_id) {
          const { data: agency } = await supabase
            .from("agencies").select("name").eq("id", booking.agency_id).maybeSingle();
          if (agency?.name) agencyName = agency.name;
        }
        const alertHtml = `<div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:20px;background:#0d1b2e;color:#fff;">
          <h2 style="color:#f87171;margin-top:0;">❌ Booking Declined</h2>
          <table style="width:100%;border-collapse:collapse;margin:16px 0;background:#132640;border-radius:8px;overflow:hidden;">
            <tr><td style="padding:10px;color:#9aa4b2;">Agency</td><td style="padding:10px;font-weight:bold;">${escapeHtml(agencyName)}</td></tr>
            <tr><td style="padding:10px;color:#9aa4b2;">Renter</td><td style="padding:10px;font-weight:bold;">${escapeHtml(booking.renter_name || "—")} &lt;${escapeHtml(booking.renter_email)}&gt;${booking.renter_phone ? ` · ${escapeHtml(booking.renter_phone)}` : ""}</td></tr>
            <tr><td style="padding:10px;color:#9aa4b2;">Vehicle</td><td style="padding:10px;font-weight:bold;">${escapeHtml(vehicleLabel)}</td></tr>
            <tr><td style="padding:10px;color:#9aa4b2;">Dates</td><td style="padding:10px;font-weight:bold;">${escapeHtml(fmtDate(booking.pickup_date))} → ${escapeHtml(fmtDate(booking.dropoff_date))}</td></tr>
            <tr><td style="padding:10px;color:#9aa4b2;">Total</td><td style="padding:10px;font-weight:bold;">$${total} ${String(booking.currency || "usd").toUpperCase()}</td></tr>
            <tr><td style="padding:10px;color:#9aa4b2;">Reason</td><td style="padding:10px;font-weight:bold;">${escapeHtml(reason && reason.trim() ? reason.trim() : "No reason provided")}</td></tr>
          </table>
          <p style="font-size:13px;color:#9aa4b2;">Booking ID: ${escapeHtml(booking.id)}</p>
        </div>`;
        const alertRes = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: { Authorization: `Bearer ${resendApiKey}`, "Content-Type": "application/json" },
          body: JSON.stringify({
            from: "ZUVIO Alerts <team@zuvio.us>",
            to: ["zuviollc@gmail.com"],
            subject: `❌ Declined — ${agencyName} · ${vehicleLabel} (${(reason && reason.trim() ? reason.trim() : "No reason given").slice(0, 60)})`,
            html: alertHtml,
          }),
        });
        if (!alertRes.ok) console.error("[RENTER-STATUS-EMAIL] Decline alert failed:", await alertRes.text());
      } catch (alertErr) {
        console.error("[RENTER-STATUS-EMAIL] Decline alert error:", alertErr);
      }
    }

    return new Response(JSON.stringify({ success: true, resend_id: resendData.id }), {
      status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("[RENTER-STATUS-EMAIL] Error:", err);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});