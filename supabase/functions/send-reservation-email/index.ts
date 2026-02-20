import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface EmailPayload {
  reservation_id: string;
  type: "approved" | "vehicle_ready" | "extension_approved";
}

function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  };
  return text.replace(/[&<>"']/g, (m) => map[m]);
}

const subjects: Record<string, string> = {
  approved: "Your Reservation Has Been Approved!",
  vehicle_ready: "Your Vehicle Is Ready for Pickup!",
  extension_approved: "Your Extension Has Been Approved!",
};

const bodyTemplates: Record<string, (r: any) => string> = {
  approved: (r) =>
    `<div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:20px;">
      <h2 style="color:#10b981;">✅ Reservation Approved</h2>
      <p>Hi ${escapeHtml(r.customer_name)},</p>
      <p>Great news! Your reservation with <strong>${escapeHtml(r.agency_name)}</strong> has been approved.</p>
      <table style="width:100%;border-collapse:collapse;margin:16px 0;">
        <tr><td style="padding:8px;border-bottom:1px solid #eee;color:#666;">Pickup</td><td style="padding:8px;border-bottom:1px solid #eee;font-weight:bold;">${escapeHtml(r.pickup_date)}</td></tr>
        <tr><td style="padding:8px;border-bottom:1px solid #eee;color:#666;">Drop-off</td><td style="padding:8px;border-bottom:1px solid #eee;font-weight:bold;">${escapeHtml(r.dropoff_date)}</td></tr>
        <tr><td style="padding:8px;border-bottom:1px solid #eee;color:#666;">Vehicle Type</td><td style="padding:8px;border-bottom:1px solid #eee;font-weight:bold;">${escapeHtml(r.vehicle_type)}</td></tr>
      </table>
      <p>The agency will contact you at <strong>${escapeHtml(r.customer_phone)}</strong> with any additional details.</p>
      <p style="color:#888;font-size:12px;margin-top:24px;">— ZUVIO</p>
    </div>`,
  vehicle_ready: (r) =>
    `<div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:20px;">
      <h2 style="color:#10b981;">🚗 Vehicle Ready for Pickup</h2>
      <p>Hi ${escapeHtml(r.customer_name)},</p>
      <p>Your vehicle is ready for pickup at <strong>${escapeHtml(r.agency_name)}</strong>!</p>
      <p>Please bring the required documents and head to the agency location.</p>
      <p><strong>Pickup Date:</strong> ${escapeHtml(r.pickup_date)}<br/><strong>Vehicle Type:</strong> ${escapeHtml(r.vehicle_type)}</p>
      <p style="color:#888;font-size:12px;margin-top:24px;">— ZUVIO</p>
    </div>`,
  extension_approved: (r) =>
    `<div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:20px;">
      <h2 style="color:#10b981;">📅 Extension Approved</h2>
      <p>Hi ${escapeHtml(r.customer_name)},</p>
      <p>Your rental extension with <strong>${escapeHtml(r.agency_name)}</strong> has been approved.</p>
      <p><strong>New Drop-off Date:</strong> ${escapeHtml(r.dropoff_date)}</p>
      <p>If you have questions, contact the agency directly.</p>
      <p style="color:#888;font-size:12px;margin-top:24px;">— ZUVIO</p>
    </div>`,
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const resendApiKey = Deno.env.get("RESEND_API_KEY");

    // --- Authentication: require a valid JWT ---
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } = await userClient.auth.getClaims(token);
    if (claimsError || !claimsData?.claims) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const userId = claimsData.claims.sub;

    // Use service role client for data operations
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    const { reservation_id, type } = (await req.json()) as EmailPayload;

    if (!reservation_id || !type || !subjects[type]) {
      return new Response(
        JSON.stringify({ error: "Missing reservation_id or invalid type" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { data: reservation, error } = await supabase
      .from("reservation_requests")
      .select("*")
      .eq("id", reservation_id)
      .maybeSingle();

    if (error || !reservation) {
      return new Response(
        JSON.stringify({ error: "Reservation not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // --- Authorization: verify the caller owns this reservation's agency profile ---
    if (reservation.profile_id) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("user_id")
        .eq("id", reservation.profile_id)
        .maybeSingle();

      if (!profile || profile.user_id !== userId) {
        return new Response(
          JSON.stringify({ error: "Forbidden: you do not own this reservation" }),
          { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    } else {
      return new Response(
        JSON.stringify({ error: "Forbidden: reservation has no linked profile" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!reservation.customer_email) {
      return new Response(
        JSON.stringify({ error: "No customer email on file", skipped: true }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Update reservation status
    const statusMap: Record<string, string> = {
      approved: "approved",
      vehicle_ready: "vehicle_ready",
      extension_approved: "extension_approved",
    };

    await supabase
      .from("reservation_requests")
      .update({ status: statusMap[type] })
      .eq("id", reservation_id);

    const emailHtml = bodyTemplates[type](reservation);
    const subject = subjects[type];

    if (resendApiKey) {
      const resendRes = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${resendApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: "ZUVIO <noreply@zuvio.us>",
          to: [reservation.customer_email],
          subject,
          html: emailHtml,
        }),
      });

      const resendData = await resendRes.json();

      if (!resendRes.ok) {
        console.error("[EMAIL] Resend error:", resendData);
        return new Response(
          JSON.stringify({ error: "Failed to send email", details: resendData }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      console.log(`[EMAIL] Sent via Resend to ${reservation.customer_email}`, resendData);

      return new Response(
        JSON.stringify({
          success: true,
          message: `Email sent to ${reservation.customer_email}`,
          resend_id: resendData.id,
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    } else {
      console.log(`[EMAIL] No RESEND_API_KEY — logging only`);
      console.log(`[EMAIL] To: ${reservation.customer_email}`);
      console.log(`[EMAIL] Subject: ${subject}`);

      return new Response(
        JSON.stringify({
          success: true,
          message: `Email notification logged (no RESEND_API_KEY)`,
          to: reservation.customer_email,
          subject,
        }),
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
