import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;",
  };
  return String(text).replace(/[&<>"']/g, (m) => map[m]);
}

function fmtDate(s: string): string {
  try {
    const d = new Date(s);
    if (isNaN(d.getTime())) return s;
    return d.toLocaleDateString("en-US", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return s;
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const resendApiKey = Deno.env.get("RESEND_API_KEY");

    const { booking_id } = (await req.json()) as { booking_id?: string };
    if (!booking_id) {
      return new Response(
        JSON.stringify({ error: "Missing booking_id" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey);

    const { data: booking, error } = await supabase
      .from("bookings")
      .select(
        "id, renter_name, renter_email, pickup_date, dropoff_date, rental_days, total_amount_cents, currency, capture_method, payment_status, vehicle_id",
      )
      .eq("id", booking_id)
      .maybeSingle();

    if (error || !booking) {
      return new Response(
        JSON.stringify({ error: "Booking not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    if (!booking.renter_email) {
      return new Response(
        JSON.stringify({ skipped: true, reason: "No renter_email" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const { data: vehicle } = await supabase
      .from("vehicles")
      .select("year, make, model")
      .eq("id", booking.vehicle_id)
      .maybeSingle();

    const vehicleLabel = vehicle
      ? `${vehicle.year} ${vehicle.make} ${vehicle.model}`
      : "Your vehicle";

    const total = (booking.total_amount_cents / 100).toFixed(2);
    const isAuthOnly = booking.payment_status === "requires_capture";
    const noticeText = isAuthOnly
      ? "Your card has been authorized but not yet charged. The agency will confirm your booking shortly. You'll be charged when they confirm."
      : "Your card has been saved and will be authorized 7 days before pickup. You won't be charged until the agency confirms your booking.";

    const emailHtml = `<div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:20px;background:#0d1b2e;color:#fff;">
      <h2 style="color:#2dd4bf;margin-top:0;">🚗 Booking Received!</h2>
      <p>Hi ${escapeHtml(booking.renter_name)},</p>
      <p>Thanks for booking with ZUVIO. Here are your reservation details:</p>
      <table style="width:100%;border-collapse:collapse;margin:16px 0;background:#132640;border-radius:8px;overflow:hidden;">
        <tr><td style="padding:10px;border-bottom:1px solid rgba(255,255,255,0.1);color:#9aa4b2;">Vehicle</td><td style="padding:10px;border-bottom:1px solid rgba(255,255,255,0.1);font-weight:bold;">${escapeHtml(vehicleLabel)}</td></tr>
        <tr><td style="padding:10px;border-bottom:1px solid rgba(255,255,255,0.1);color:#9aa4b2;">Pickup</td><td style="padding:10px;border-bottom:1px solid rgba(255,255,255,0.1);font-weight:bold;">${escapeHtml(fmtDate(booking.pickup_date))}</td></tr>
        <tr><td style="padding:10px;border-bottom:1px solid rgba(255,255,255,0.1);color:#9aa4b2;">Drop-off</td><td style="padding:10px;border-bottom:1px solid rgba(255,255,255,0.1);font-weight:bold;">${escapeHtml(fmtDate(booking.dropoff_date))}</td></tr>
        <tr><td style="padding:10px;border-bottom:1px solid rgba(255,255,255,0.1);color:#9aa4b2;">Duration</td><td style="padding:10px;border-bottom:1px solid rgba(255,255,255,0.1);font-weight:bold;">${booking.rental_days} day${booking.rental_days === 1 ? "" : "s"}</td></tr>
        <tr><td style="padding:10px;color:#9aa4b2;">Total</td><td style="padding:10px;font-weight:bold;color:#2dd4bf;">$${total} ${String(booking.currency || "usd").toUpperCase()}</td></tr>
      </table>
      <p style="background:rgba(45,212,191,0.1);border:1px solid rgba(45,212,191,0.3);padding:12px;border-radius:8px;font-size:14px;">${escapeHtml(noticeText)}</p>
      <p style="font-size:13px;color:#9aa4b2;">Booking ID: ${escapeHtml(booking.id)}</p>
      <p>Questions? Reach us at <a href="mailto:team@zuvio.us" style="color:#2dd4bf;">team@zuvio.us</a> or 725-239-2300.</p>
      <p style="color:#888;font-size:12px;margin-top:24px;">— The ZUVIO Team</p>
    </div>`;

    if (!resendApiKey) {
      console.log("[RENTER-EMAIL] No RESEND_API_KEY — logging only", { to: booking.renter_email });
      return new Response(
        JSON.stringify({ success: true, logged: true }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const resendRes = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "ZUVIO <team@zuvio.us>",
        to: [booking.renter_email],
        bcc: ["team@zuvio.us"],
        subject: `Booking received — ${vehicleLabel}`,
        html: emailHtml,
      }),
    });

    const resendData = await resendRes.json();
    if (!resendRes.ok) {
      console.error("[RENTER-EMAIL] Resend error:", resendData);
      return new Response(
        JSON.stringify({ error: "Failed to send email", details: resendData }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    console.log(`[RENTER-EMAIL] Sent to ${booking.renter_email}`, resendData);
    return new Response(
      JSON.stringify({ success: true, resend_id: resendData.id }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (err) {
    console.error("[RENTER-EMAIL] Error:", err);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});