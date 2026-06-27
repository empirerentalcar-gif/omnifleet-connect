import { createClient } from "npm:@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const AGREEMENT_TEXT =
  "I agree that I am the Merchant of Record for all transactions and accept full responsibility for disputes and chargebacks as outlined in Zuvio's Terms of Service.";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const ADMIN_EMAIL = "zuviollc@gmail.com";
const FROM_EMAIL = "Zuvio <team@zuvio.us>";

async function sendEmail(to: string, subject: string, html: string) {
  if (!RESEND_API_KEY) {
    console.error("[record-mor-agreement] RESEND_API_KEY missing, skipping email to", to);
    return;
  }
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ from: FROM_EMAIL, to: [to], subject, html }),
    });
    if (!res.ok) {
      console.error("[record-mor-agreement] Resend error", res.status, await res.text());
    }
  } catch (err) {
    console.error("[record-mor-agreement] Email send failed", err);
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization") ?? "";
    const token = authHeader.replace(/^Bearer\s+/i, "");
    if (!token) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;

    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: `Bearer ${token}` } },
    });
    const { data: userRes, error: userErr } = await userClient.auth.getUser();
    if (userErr || !userRes?.user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const userId = userRes.user.id;

    const admin = createClient(supabaseUrl, serviceRoleKey);

    const { data: agency, error: agencyErr } = await admin
      .from("agencies")
      .select("id, agency_name, email")
      .eq("owner_user_id", userId)
      .maybeSingle();

    if (agencyErr || !agency) {
      return new Response(JSON.stringify({ error: "Agency not found for current user" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const ipHeader =
      req.headers.get("x-forwarded-for") ??
      req.headers.get("cf-connecting-ip") ??
      req.headers.get("x-real-ip") ??
      "";
    const ipAddress = ipHeader.split(",")[0]?.trim() || null;
    const userAgent = req.headers.get("user-agent") || null;
    const agreedAt = new Date().toISOString();

    const { data: inserted, error: insertErr } = await admin
      .from("agency_agreements")
      .insert({
        agency_id: agency.id,
        agreement_text: AGREEMENT_TEXT,
        agreed_at: agreedAt,
        ip_address: ipAddress,
        user_agent: userAgent,
      })
      .select("id, agreed_at")
      .single();

    if (insertErr || !inserted) {
      console.error("[record-mor-agreement] Insert failed", insertErr);
      return new Response(JSON.stringify({ error: "Failed to record agreement" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const friendlyTime = new Date(inserted.agreed_at).toLocaleString("en-US", {
      timeZone: "UTC",
      dateStyle: "long",
      timeStyle: "short",
    }) + " UTC";
    const ipForEmail = ipAddress ?? "unknown";

    // Fire-and-forget emails (don't block client on email send).
    if (agency.email) {
      sendEmail(
        agency.email,
        "Merchant of Record Agreement Confirmation",
        `<p>You have agreed to Zuvio's Merchant of Record terms on <strong>${friendlyTime}</strong> from IP <strong>${ipForEmail}</strong>.</p>
         <p>This agreement is binding and on file with Zuvio.</p>
         <hr/>
         <p style="font-size:12px;color:#666">Agreement text:<br/>${AGREEMENT_TEXT}</p>`,
      );
    }
    sendEmail(
      ADMIN_EMAIL,
      `MOR Agreement Accepted — ${agency.agency_name}`,
      `<p>Agency <strong>${agency.agency_name}</strong> (${agency.email ?? "no email"}) has accepted the Merchant of Record agreement on <strong>${friendlyTime}</strong> from IP <strong>${ipForEmail}</strong>.</p>
       <p>Their agreement has been recorded in Supabase under <code>agency_agreements</code> (id: ${inserted.id}).</p>`,
    );

    return new Response(
      JSON.stringify({ success: true, agreement_id: inserted.id, agreed_at: inserted.agreed_at }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (err) {
    console.error("[record-mor-agreement] Unexpected error", err);
    return new Response(JSON.stringify({ error: "Internal error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});