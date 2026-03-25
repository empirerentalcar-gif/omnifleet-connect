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
  return text.replace(/[&<>"']/g, (m) => map[m]);
}

// In-memory rate limit store (per isolate lifetime)
const rateLimitMap = new Map<string, { count: number; windowStart: number }>();
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX = 5; // max 5 calls per minute per IP

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);
  if (!entry || now - entry.windowStart > RATE_LIMIT_WINDOW_MS) {
    rateLimitMap.set(ip, { count: 1, windowStart: now });
    return true;
  }
  if (entry.count >= RATE_LIMIT_MAX) {
    return false;
  }
  entry.count++;
  return true;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Rate limit by IP
    const clientIp = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
    if (!checkRateLimit(clientIp)) {
      return new Response(
        JSON.stringify({ error: "Too many requests. Please try again later." }),
        { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const resendApiKey = Deno.env.get("RESEND_API_KEY");

    const supabase = createClient(supabaseUrl, serviceRoleKey);

    const { reservation_id } = await req.json() as { reservation_id: string };

    // Validate reservation_id format (UUID)
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!reservation_id || !uuidRegex.test(reservation_id)) {
      return new Response(
        JSON.stringify({ error: "Invalid reservation_id" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Fetch the reservation
    const { data: reservation, error: resErr } = await supabase
      .from("reservation_requests")
      .select("*")
      .eq("id", reservation_id)
      .maybeSingle();

    if (resErr || !reservation) {
      // Return generic error to prevent ID enumeration
      return new Response(
        JSON.stringify({ error: "Unable to process request" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Idempotency guard: only send notification for recently created reservations (within 5 minutes)
    const createdAt = new Date(reservation.created_at).getTime();
    const now = Date.now();
    const FIVE_MINUTES_MS = 5 * 60 * 1000;
    if (now - createdAt > FIVE_MINUTES_MS) {
      return new Response(
        JSON.stringify({ success: true, message: "Notification already processed" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Fetch the agency owner's contact email via profile
    let agencyEmail: string | null = null;
    if (reservation.profile_id) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("contact_email")
        .eq("id", reservation.profile_id)
        .maybeSingle();

      agencyEmail = profile?.contact_email ?? null;
    }

    const ADMIN_ALERT_EMAIL = "mixdownent@icloud.com";

    const r = reservation;
    const notesRow = r.notes
      ? `<tr><td style="padding:8px;border-bottom:1px solid #eee;color:#666;vertical-align:top;">Notes</td><td style="padding:8px;border-bottom:1px solid #eee;">${escapeHtml(r.notes)}</td></tr>`
      : "";

    // Email to agency owner
    const agencyEmailHtml = `
<div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:20px;">
  <h2 style="color:#10b981;">🚗 New Rental Request on ZUVIO</h2>
  <p>You have a new reservation request from a customer. Please follow up with them within 24 hours.</p>
  <table style="width:100%;border-collapse:collapse;margin:16px 0;">
    <tr><td style="padding:8px;border-bottom:1px solid #eee;color:#666;">Customer Name</td><td style="padding:8px;border-bottom:1px solid #eee;font-weight:bold;">${escapeHtml(r.customer_name)}</td></tr>
    <tr><td style="padding:8px;border-bottom:1px solid #eee;color:#666;">Phone</td><td style="padding:8px;border-bottom:1px solid #eee;font-weight:bold;">${escapeHtml(r.customer_phone)}</td></tr>
    <tr><td style="padding:8px;border-bottom:1px solid #eee;color:#666;">Email</td><td style="padding:8px;border-bottom:1px solid #eee;">${r.customer_email ? escapeHtml(r.customer_email) : "<em>Not provided</em>"}</td></tr>
    <tr><td style="padding:8px;border-bottom:1px solid #eee;color:#666;">Vehicle Type</td><td style="padding:8px;border-bottom:1px solid #eee;">${escapeHtml(r.vehicle_type)}</td></tr>
    <tr><td style="padding:8px;border-bottom:1px solid #eee;color:#666;">Pickup Date</td><td style="padding:8px;border-bottom:1px solid #eee;">${escapeHtml(r.pickup_date)}</td></tr>
    <tr><td style="padding:8px;border-bottom:1px solid #eee;color:#666;">Drop-off Date</td><td style="padding:8px;border-bottom:1px solid #eee;">${escapeHtml(r.dropoff_date)}</td></tr>
    ${notesRow}
  </table>
  <p style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;padding:12px;font-size:14px;">
    📋 <strong>Next step:</strong> Log in to your <a href="https://zuvio.us/owner-dashboard" style="color:#10b981;">ZUVIO dashboard</a> to view and respond to this request.
  </p>
  <p style="color:#888;font-size:12px;margin-top:24px;">— ZUVIO Team</p>
</div>`;

    // Customer confirmation email
    const customerEmailHtml = `
<div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:20px;">
  <h2 style="color:#10b981;">✅ Your Rental Request Has Been Submitted</h2>
  <p>Hi ${escapeHtml(r.customer_name)},</p>
  <p>Thank you for your rental request through ZUVIO! Here's a summary of what you submitted:</p>
  <table style="width:100%;border-collapse:collapse;margin:16px 0;background:#f9fafb;border-radius:8px;">
    <tr><td style="padding:12px;border-bottom:1px solid #eee;color:#666;">Agency</td><td style="padding:12px;border-bottom:1px solid #eee;font-weight:bold;">${escapeHtml(r.agency_name)}</td></tr>
    <tr><td style="padding:12px;border-bottom:1px solid #eee;color:#666;">Vehicle Type</td><td style="padding:12px;border-bottom:1px solid #eee;">${escapeHtml(r.vehicle_type)}</td></tr>
    <tr><td style="padding:12px;border-bottom:1px solid #eee;color:#666;">Pickup Date</td><td style="padding:12px;border-bottom:1px solid #eee;">${escapeHtml(r.pickup_date)}</td></tr>
    <tr><td style="padding:12px;border-bottom:1px solid #eee;color:#666;">Drop-off Date</td><td style="padding:12px;border-bottom:1px solid #eee;">${escapeHtml(r.dropoff_date)}</td></tr>
  </table>
  <div style="background:#fef3c7;border:1px solid #fcd34d;border-radius:8px;padding:16px;margin:16px 0;">
    <p style="margin:0 0 8px 0;font-weight:bold;color:#92400e;">⏱️ What happens next?</p>
    <ul style="margin:0;padding-left:20px;color:#92400e;">
      <li>The agency will review your request and contact you within 24 hours</li>
      <li>They will reach out via phone at <strong>${escapeHtml(r.customer_phone)}</strong></li>
      <li>Have your driver's license and payment method ready</li>
    </ul>
  </div>
  <p style="color:#888;font-size:12px;margin-top:24px;border-top:1px solid #eee;padding-top:16px;">
    — The ZUVIO Team<br/><em>Connecting you with trusted local car rental agencies</em>
  </p>
</div>`;

    if (!resendApiKey) {
      console.log(`[NOTIFY] No RESEND_API_KEY — logging only`);
      return new Response(
        JSON.stringify({ success: true, message: "Logged (no RESEND_API_KEY)" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const emailPromises: Promise<Response>[] = [];

    // 1. Always send admin alert to mixdownent@icloud.com
    const adminRecipients = [ADMIN_ALERT_EMAIL];
    if (agencyEmail) adminRecipients.push(agencyEmail);

    emailPromises.push(
      fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${resendApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: "ZUVIO <team@zuvio.us>",
          to: adminRecipients,
          subject: `New Rental Request from ${r.customer_name} — ZUVIO`,
          html: agencyEmailHtml,
        }),
      })
    );

    // 2. Always send confirmation to renter if email provided
    if (r.customer_email) {
      emailPromises.push(
        fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${resendApiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from: "ZUVIO <team@zuvio.us>",
            to: [r.customer_email],
            subject: `Your ZUVIO Rental Request — ${r.agency_name}`,
            html: customerEmailHtml,
          }),
        })
      );
    }

    const results = await Promise.all(emailPromises);

    for (let i = 0; i < results.length; i++) {
      const body = await results[i].json();
      if (!results[i].ok) {
        console.error(`[NOTIFY] Resend error (email ${i}):`, body);
      } else {
        console.log(`[NOTIFY] Email ${i} sent successfully:`, body);
      }
    }

    return new Response(
      JSON.stringify({ success: true, message: "Notifications sent" }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("Error:", err);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
