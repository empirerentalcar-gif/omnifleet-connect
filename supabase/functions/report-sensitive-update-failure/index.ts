import { createClient } from "npm:@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const ADMIN_EMAIL = "zuviollc@gmail.com";
const FROM_EMAIL = "Zuvio <team@zuvio.us>";

async function sendAlertEmail(subject: string, html: string) {
  if (!RESEND_API_KEY) {
    console.error("[report-sensitive-update-failure] RESEND_API_KEY missing");
    return;
  }
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ from: FROM_EMAIL, to: [ADMIN_EMAIL], subject, html }),
    });
    if (!res.ok) {
      console.error("[report-sensitive-update-failure] Resend error", res.status, await res.text());
    }
  } catch (err) {
    console.error("[report-sensitive-update-failure] Email failed", err);
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const body = await req.json().catch(() => ({}));
    const {
      agency_id = null,
      field_name = "unknown",
      source = "client",
      expected_value = null,
      actual_value = null,
      error_message = null,
    } = body ?? {};

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const admin = createClient(supabaseUrl, serviceRoleKey);

    // Optional: resolve user from JWT if present (best-effort, not required).
    let userId: string | null = null;
    const authHeader = req.headers.get("Authorization") ?? "";
    const token = authHeader.replace(/^Bearer\s+/i, "");
    if (token) {
      try {
        const userClient = createClient(supabaseUrl, anonKey, {
          global: { headers: { Authorization: `Bearer ${token}` } },
        });
        const { data } = await userClient.auth.getUser();
        userId = data?.user?.id ?? null;
      } catch (_) { /* ignore */ }
    }

    const ipHeader =
      req.headers.get("x-forwarded-for") ??
      req.headers.get("cf-connecting-ip") ??
      req.headers.get("x-real-ip") ??
      "";
    const ipAddress = ipHeader.split(",")[0]?.trim() || null;
    const userAgent = req.headers.get("user-agent") || null;

    const { data: inserted, error: insertErr } = await admin
      .from("sensitive_update_failures")
      .insert({
        agency_id,
        field_name,
        source,
        expected_value: expected_value == null ? null : String(expected_value),
        actual_value: actual_value == null ? null : String(actual_value),
        error_message,
        user_id: userId,
        user_agent: userAgent,
        ip_address: ipAddress,
      })
      .select("id, created_at")
      .single();

    if (insertErr) {
      console.error("[report-sensitive-update-failure] Log insert failed", insertErr);
    }

    sendAlertEmail(
      `⚠️ Silent sensitive-field update failure (${source})`,
      `<p>A protected agency field update was rejected silently.</p>
       <ul>
         <li><strong>Agency ID:</strong> ${agency_id ?? "unknown"}</li>
         <li><strong>Field:</strong> ${field_name}</li>
         <li><strong>Source:</strong> ${source}</li>
         <li><strong>Expected:</strong> ${expected_value ?? "(none)"}</li>
         <li><strong>Actual:</strong> ${actual_value ?? "(none)"}</li>
         <li><strong>Error:</strong> ${error_message ?? "(none)"}</li>
         <li><strong>User ID:</strong> ${userId ?? "(anonymous)"}</li>
         <li><strong>IP:</strong> ${ipAddress ?? "unknown"}</li>
         <li><strong>User-Agent:</strong> ${userAgent ?? "unknown"}</li>
         <li><strong>Logged at:</strong> ${inserted?.created_at ?? new Date().toISOString()}</li>
       </ul>
       <p>Recorded in <code>sensitive_update_failures</code>${inserted?.id ? ` (id: ${inserted.id})` : ""}.</p>`,
    );

    return new Response(
      JSON.stringify({ success: true, id: inserted?.id ?? null }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (err) {
    console.error("[report-sensitive-update-failure] Unexpected error", err);
    return new Response(JSON.stringify({ error: "Internal error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});