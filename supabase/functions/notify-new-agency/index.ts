import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

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
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const resendApiKey = Deno.env.get("RESEND_API_KEY");

    const { agency } = await req.json();

    if (!agency || !agency.agency_name) {
      return new Response(
        JSON.stringify({ error: "Missing agency data" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey);

    // Get all admin user IDs
    const { data: adminRoles, error: rolesError } = await supabase
      .from("user_roles")
      .select("user_id")
      .eq("role", "admin");

    if (rolesError || !adminRoles?.length) {
      console.log("[NOTIFY] No admins found or error:", rolesError);
      return new Response(
        JSON.stringify({ success: true, message: "No admins to notify" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get admin emails from auth
    const adminEmails: string[] = [];
    for (const role of adminRoles) {
      const { data: userData } = await supabase.auth.admin.getUserById(role.user_id);
      if (userData?.user?.email) {
        adminEmails.push(userData.user.email);
      }
    }

    if (adminEmails.length === 0) {
      console.log("[NOTIFY] No admin emails found");
      return new Response(
        JSON.stringify({ success: true, message: "No admin emails found" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
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

    if (resendApiKey) {
      const resendRes = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${resendApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: "ZUVIO <noreply@zuvio.us>",
          to: adminEmails,
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

      console.log(`[NOTIFY] Sent to ${adminEmails.join(", ")}`, resendData);
      return new Response(
        JSON.stringify({ success: true, sent_to: adminEmails }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    } else {
      console.log(`[NOTIFY] No RESEND_API_KEY — logging only`);
      console.log(`[NOTIFY] Would send to: ${adminEmails.join(", ")}`);
      console.log(`[NOTIFY] Subject: ${subject}`);
      return new Response(
        JSON.stringify({ success: true, message: "Email logged (no RESEND_API_KEY)", to: adminEmails }),
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
