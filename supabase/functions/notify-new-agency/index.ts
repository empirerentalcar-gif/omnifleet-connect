// notify-new-agency edge function

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    const adminEmail = Deno.env.get("ADMIN_NOTIFICATION_EMAIL");

    if (!resendApiKey) {
      console.log("[NOTIFY] No RESEND_API_KEY configured");
      return new Response(
        JSON.stringify({ error: "Email service not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!adminEmail) {
      console.log("[NOTIFY] No ADMIN_NOTIFICATION_EMAIL configured");
      return new Response(
        JSON.stringify({ error: "Admin email not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { agency } = await req.json();

    if (!agency || !agency.agency_name) {
      return new Response(
        JSON.stringify({ error: "Missing agency data" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const createdAt = agency.created_at
      ? new Date(agency.created_at).toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" })
      : "N/A";

    const appUrl = "https://zuvio-website.lovable.app";
    const subject = `New Agency Signup - ${agency.agency_name}`;
    const html = `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:20px;">
        <h2 style="color:#3b82f6;">🏢 New Agency Signup</h2>
        <p>A new agency has registered on ZUVIO:</p>
        <table style="width:100%;border-collapse:collapse;margin:16px 0;">
          <tr><td style="padding:8px;border-bottom:1px solid #eee;color:#666;">Agency Name</td><td style="padding:8px;border-bottom:1px solid #eee;font-weight:bold;">${agency.agency_name}</td></tr>
          <tr><td style="padding:8px;border-bottom:1px solid #eee;color:#666;">City</td><td style="padding:8px;border-bottom:1px solid #eee;">${agency.city || "—"}</td></tr>
          <tr><td style="padding:8px;border-bottom:1px solid #eee;color:#666;">State</td><td style="padding:8px;border-bottom:1px solid #eee;">${agency.state || "—"}</td></tr>
          <tr><td style="padding:8px;border-bottom:1px solid #eee;color:#666;">Phone</td><td style="padding:8px;border-bottom:1px solid #eee;">${agency.phone || "—"}</td></tr>
          <tr><td style="padding:8px;border-bottom:1px solid #eee;color:#666;">Email</td><td style="padding:8px;border-bottom:1px solid #eee;">${agency.email || "—"}</td></tr>
          <tr><td style="padding:8px;border-bottom:1px solid #eee;color:#666;">Created At</td><td style="padding:8px;border-bottom:1px solid #eee;">${createdAt}</td></tr>
        </table>
        <a href="${appUrl}/admin/agencies" style="display:inline-block;background:#3b82f6;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:bold;margin-top:8px;">
          Review & Approve Agency
        </a>
        <p style="color:#888;font-size:12px;margin-top:24px;">— ZUVIO Admin Notifications</p>
      </div>
    `;

    const resendRes = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "ZUVIO <noreply@zuvio.us>",
        to: [adminEmail],
        subject,
        html,
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

    console.log(`[NOTIFY] Sent to ${adminEmail}`, resendData);
    return new Response(
      JSON.stringify({ success: true, sent_to: adminEmail }),
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
