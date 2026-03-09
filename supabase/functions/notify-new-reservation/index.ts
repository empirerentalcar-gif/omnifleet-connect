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

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const resendApiKey = Deno.env.get("RESEND_API_KEY");

    const supabase = createClient(supabaseUrl, serviceRoleKey);

    const { reservation_id } = await req.json() as { reservation_id: string };

    if (!reservation_id) {
      return new Response(
        JSON.stringify({ error: "Missing reservation_id" }),
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
      return new Response(
        JSON.stringify({ error: "Reservation not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
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

    if (!agencyEmail) {
      console.log("[NOTIFY] No agency email found — logging only");
      return new Response(
        JSON.stringify({ success: true, message: "No agency email on file, skipped" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const r = reservation;
    const notesRow = r.notes
      ? `<tr><td style="padding:8px;border-bottom:1px solid #eee;color:#666;vertical-align:top;">Notes</td><td style="padding:8px;border-bottom:1px solid #eee;">${escapeHtml(r.notes)}</td></tr>`
      : "";

    const emailHtml = `
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

  <p style="color:#888;font-size:12px;margin-top:24px;">— ZUVIO Team &nbsp;|&nbsp; This is an automated notification. Reply directly to the customer using the details above.</p>
</div>`;

    if (resendApiKey) {
      const toList = [agencyEmail];
      const resendRes = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${resendApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: "ZUVIO <noreply@zuvio.us>",
          to: toList,
          cc: ["team@zuvio.us"],
          subject: `New Rental Request from ${r.customer_name} — ZUVIO`,
          html: emailHtml,
        }),
      });

      const resendData = await resendRes.json();

      if (!resendRes.ok) {
        console.error("[NOTIFY] Resend error:", resendData);
        return new Response(
          JSON.stringify({ error: "Failed to send email", details: resendData }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      console.log(`[NOTIFY] Sent to agency ${agencyEmail}`, resendData);
      return new Response(
        JSON.stringify({ success: true, message: `Notification sent to ${agencyEmail}`, resend_id: resendData.id }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    } else {
      console.log(`[NOTIFY] No RESEND_API_KEY — logging only`);
      console.log(`[NOTIFY] To: ${agencyEmail}`);
      return new Response(
        JSON.stringify({ success: true, message: "Logged (no RESEND_API_KEY)", to: agencyEmail }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
  } catch (err) {
    console.error("Error:", err);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
