// send-agency-approval edge function - sends email when agency is approved

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  };
  return String(text || '').replace(/[&<>"']/g, (m) => map[m]);
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verify JWT - require authenticated admin user
    const authHeader = req.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return new Response(
        JSON.stringify({ error: "Missing authorization" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { createClient } = await import("https://esm.sh/@supabase/supabase-js@2");
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    
    // Verify user is admin
    const authClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user }, error: authError } = await authClient.auth.getUser();
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check admin role using service role client
    const serviceClient = createClient(supabaseUrl, supabaseServiceKey);
    const { data: hasAdminRole } = await serviceClient.rpc('has_role', {
      _user_id: user.id,
      _role: 'admin',
    });

    if (!hasAdminRole) {
      return new Response(
        JSON.stringify({ error: "Admin access required" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    if (!resendApiKey) {
      console.log("[APPROVAL] No RESEND_API_KEY configured");
      return new Response(
        JSON.stringify({ error: "Email service not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { agency } = await req.json();
    if (!agency || !agency.agency_name || !agency.email) {
      return new Response(
        JSON.stringify({ error: "Missing agency data (name and email required)" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const dashboardUrl = "https://zuvio.us/dashboard";
    const siteUrl = "https://zuvio.us";
    const subject = `🎉 Your Agency is Now Live on Zuvio!`;
    const html = `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:20px;background:#ffffff;">
        <div style="text-align:center;margin-bottom:24px;">
          <h1 style="color:#000;font-size:28px;margin:0;">Congratulations! 🎊</h1>
        </div>
        
        <p style="font-size:16px;color:#333;line-height:1.6;">
          Great news! <strong>${escapeHtml(agency.agency_name)}</strong> has been approved and is now live on Zuvio.
        </p>
        
        <div style="background:#f8f9fa;border-radius:12px;padding:20px;margin:24px 0;">
          <h2 style="color:#000;font-size:18px;margin:0 0 12px 0;">What's Next?</h2>
          <ul style="color:#555;line-height:1.8;padding-left:20px;margin:0;">
            <li>Your vehicles are now visible to customers searching on Zuvio</li>
            <li>Customers can view your listing and request reservations</li>
            <li>Log in to your dashboard to manage vehicles and reservations</li>
          </ul>
        </div>
        
        <div style="text-align:center;margin:32px 0;">
          <a href="${dashboardUrl}" style="display:inline-block;background:#000;color:#fff;padding:14px 32px;border-radius:8px;text-decoration:none;font-weight:bold;font-size:16px;">
            Go to Your Dashboard
          </a>
        </div>
        
        <p style="font-size:14px;color:#666;line-height:1.6;">
          Your profile is now live at <a href="${siteUrl}" style="color:#000;">${siteUrl}</a>. 
          Start by adding or updating your vehicles to attract more customers.
        </p>
        
        <hr style="border:none;border-top:1px solid #eee;margin:32px 0;" />
        
        <p style="font-size:12px;color:#999;text-align:center;">
          Questions? Reply to this email or contact us at team@zuvio.us<br/>
          — The Zuvio Team
        </p>
      </div>
    `;

    const resendRes = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "Zuvio <team@zuvio.us>",
        to: [agency.email],
        subject,
        html,
      }),
    });

    const resendData = await resendRes.json();
    if (!resendRes.ok) {
      console.error("[APPROVAL] Resend error:", resendData);
      return new Response(
        JSON.stringify({ error: "Failed to send email", details: resendData }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`[APPROVAL] Sent approval email to ${agency.email}`, resendData);
    return new Response(
      JSON.stringify({ success: true, sent_to: agency.email }),
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
