import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const FROM_EMAIL = "Zuvio Team <team@zuvio.us>";
const ALERT_EMAIL = "mixdownent@icloud.com";
const EMAIL_TYPE = "reactivation_day_60";

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

const resendPost = async (to: string, subject: string, html: string) => {
  if (!RESEND_API_KEY) throw new Error("RESEND_API_KEY not configured");
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${RESEND_API_KEY}`,
    },
    body: JSON.stringify({ from: FROM_EMAIL, to: [to], subject, html }),
  });
  if (!res.ok) throw new Error(`Resend ${res.status}: ${await res.text()}`);
};

const logAttempt = async (
  supabase: ReturnType<typeof createClient>,
  agencyId: string | null,
  recipient: string,
  status: "success" | "failed",
  retryCount: number,
  errorMessage: string | null,
) => {
  try {
    await supabase.from("email_logs").insert({
      agency_id: agencyId,
      email_type: EMAIL_TYPE,
      recipient,
      status,
      retry_count: retryCount,
      error_message: errorMessage,
    });
  } catch (e) {
    console.error("Failed to insert email_log:", e);
  }
};

const sendFailureAlert = async (agencyName: string, errorMessage: string) => {
  try {
    await resendPost(
      ALERT_EMAIL,
      "Zuvio Email Delivery Failed",
      `<h2>Zuvio Email Delivery Failed</h2>
       <p><strong>Agency:</strong> ${agencyName}</p>
       <p><strong>Email type:</strong> ${EMAIL_TYPE}</p>
       <p><strong>Error:</strong> ${errorMessage}</p>
       <p><strong>Timestamp:</strong> ${new Date().toISOString()}</p>`,
    );
  } catch (e) {
    console.error("Failed to send failure alert:", e);
  }
};

const sendEmailWithRetry = async (
  supabase: ReturnType<typeof createClient>,
  agency: { id: string; agency_name: string },
  to: string,
  subject: string,
  html: string,
): Promise<boolean> => {
  const maxAttempts = 3;
  let lastError = "";
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      await resendPost(to, subject, html);
      await logAttempt(supabase, agency.id, to, "success", attempt, null);
      return true;
    } catch (err) {
      lastError = err instanceof Error ? err.message : String(err);
      console.error(`[${EMAIL_TYPE}] attempt ${attempt + 1} failed:`, lastError);
      await logAttempt(supabase, agency.id, to, "failed", attempt, lastError);
      if (attempt < maxAttempts - 1) await sleep(5000);
    }
  }
  await sendFailureAlert(agency.agency_name, lastError);
  return false;
};

const buildEmailHtml = (agencyName: string) => `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><title>Your Free Trial Has Ended — Reactivate Your Listing</title></head>
<body style="margin:0;padding:0;background:#f5f5f5;font-family:Arial,sans-serif;color:#1a1a1a;">
  <div style="max-width:640px;margin:0 auto;background:#ffffff;padding:32px;">
    <div style="text-align:center;margin-bottom:24px;">
      <h1 style="margin:0;font-size:28px;letter-spacing:2px;color:#f97316;">ZUVIO</h1>
    </div>

    <div style="background:#fef2f2;border:2px solid #ef4444;border-radius:8px;padding:20px;text-align:center;margin-bottom:24px;">
      <p style="margin:0 0 8px;font-size:13px;color:#ef4444;font-weight:bold;letter-spacing:1px;">TRIAL ENDED</p>
      <p style="margin:0;font-size:48px;font-weight:bold;color:#ef4444;line-height:1;">▮▮</p>
      <h2 style="margin:12px 0 0;font-size:22px;color:#1a1a1a;">Your Free Trial Has Ended.</h2>
      <p style="margin:6px 0 0;font-size:16px;color:#1a1a1a;font-weight:bold;">Your Listing Is Now Paused.</p>
    </div>

    <p>Hi ${agencyName},</p>
    <p>Your 60-day Founding Member free trial ended today. Your vehicles are no longer visible to renters on Zuvio. The good news — reactivating takes less than 2 minutes.</p>

    <div style="background:#fef2f2;border:1px solid #ef4444;border-radius:8px;padding:16px;margin:20px 0;">
      <p style="margin:0;font-size:14px;"><strong>🔒 Your listing is currently hidden from renters. Subscribe now to go live again instantly — no waiting, no delays.</strong></p>
    </div>

    <div style="border:2px solid #f97316;border-radius:8px;padding:20px;margin:24px 0;text-align:center;">
      <h3 style="margin:0 0 12px;color:#f97316;">REACTIVATE AS A FOUNDING MEMBER</h3>
      <p style="margin:0;font-size:32px;font-weight:bold;color:#1a1a1a;">$79<span style="font-size:16px;font-weight:normal;">/month</span></p>
      <p style="margin:6px 0 16px;font-size:13px;color:#666;">⭐ Founding Member rate — locked in for life</p>
      <ul style="text-align:left;margin:0 0 16px;padding-left:20px;font-size:14px;line-height:1.8;">
        <li>Your vehicles stay listed on Zuvio</li>
        <li>Renters can find and book your vehicles</li>
        <li>Receive payouts directly to your bank via Stripe</li>
        <li>Only 5% commission per completed booking</li>
        <li>Listing goes live the moment you subscribe</li>
      </ul>
      <a href="https://gozuvio.com/dashboard" style="display:inline-block;background:#f97316;color:#ffffff;padding:14px 28px;border-radius:6px;text-decoration:none;font-weight:bold;font-size:16px;">REACTIVATE MY LISTING NOW</a>
      <p style="margin:12px 0 0;font-size:12px;color:#666;">You'll be redirected to your Owner Dashboard → Billing section</p>
    </div>

    <h3 style="margin-top:32px;">What happens if I don't reactivate?</h3>
    <p style="font-size:14px;line-height:1.7;">🚫 Your vehicles remain hidden from renters until you subscribe.</p>
    <p style="font-size:14px;line-height:1.7;">🚫 Your Founding Member rate of $79/month is only guaranteed while you reactivate as a Founding Member. Future pricing may be higher.</p>
    <p style="font-size:14px;line-height:1.7;">✅ The moment you subscribe, your listing goes live again instantly — no review period, no waiting.</p>

    <h3 style="margin-top:32px;">Need help reactivating?</h3>
    <p style="font-size:14px;line-height:1.7;">Reply to this email, call us at (725) 344-3074, or email <a href="mailto:team@zuvio.us" style="color:#f97316;">team@zuvio.us</a>. We'll walk you through it personally and make sure your listing is back up as fast as possible.</p>

    <div style="border-top:1px solid #e5e7eb;margin-top:32px;padding-top:20px;text-align:center;">
      <h3 style="margin:0 0 6px;color:#f97316;letter-spacing:2px;">ZUVIO</h3>
      <p style="margin:0;font-size:13px;color:#666;">Independent Car Rentals. One Network.</p>
      <p style="margin:8px 0 0;font-size:12px;color:#666;">team@zuvio.us &nbsp;|&nbsp; (725) 344-3074 &nbsp;|&nbsp; zuvio.us</p>
      <p style="margin:12px 0 0;font-size:11px;color:#999;">You're receiving this because you registered as a Founding Member on Zuvio. © 2026 Zuvio. All rights reserved.</p>
    </div>
  </div>
</body>
</html>`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const cronSecret = Deno.env.get("CRON_SECRET");
    const incoming = req.headers.get("x-cron-secret") || req.headers.get("X-Cron-Secret");
    if (!cronSecret || incoming !== cronSecret) {
      return new Response(JSON.stringify({ error: "unauthorized" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 401,
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // Find agencies created exactly 60 days ago that haven't been notified yet
    const sixtyDaysAgo = new Date();
    sixtyDaysAgo.setUTCHours(0, 0, 0, 0);
    sixtyDaysAgo.setUTCDate(sixtyDaysAgo.getUTCDate() - 60);
    const start = sixtyDaysAgo.toISOString();
    const endDate = new Date(sixtyDaysAgo);
    endDate.setUTCDate(endDate.getUTCDate() + 1);
    const end = endDate.toISOString();

    const { data: agencies, error } = await supabase
      .from("agencies")
      .select("id, agency_name, email, day60_notice_sent, created_at")
      .eq("day60_notice_sent", false)
      .gte("created_at", start)
      .lt("created_at", end);

    if (error) throw error;

    let sent = 0;
    const results: Array<{ id: string; sent: boolean; reason?: string }> = [];

    for (const agency of agencies ?? []) {
      if (!agency.email) {
        results.push({ id: agency.id, sent: false, reason: "no_email" });
        await supabase
          .from("agencies")
          .update({ day60_notice_sent: true })
          .eq("id", agency.id);
        continue;
      }

      const ok = await sendEmailWithRetry(
        supabase,
        { id: agency.id, agency_name: agency.agency_name },
        agency.email,
        "Your Free Trial Has Ended — Reactivate Your Listing on Zuvio",
        buildEmailHtml(agency.agency_name)
      );

      if (ok) {
        await supabase
          .from("agencies")
          .update({ day60_notice_sent: true })
          .eq("id", agency.id);
        sent++;
        results.push({ id: agency.id, sent: true });
      } else {
        results.push({ id: agency.id, sent: false, reason: "send_failed" });
      }
    }

    console.log(`[DAY60-NOTICE] Checked ${agencies?.length ?? 0} agencies, sent ${sent} emails`);

    return new Response(
      JSON.stringify({ success: true, checked: agencies?.length ?? 0, sent, results }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("Day 60 notice error:", message);
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});