import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const FROM_EMAIL = "Zuvio Team <team@zuvio.us>";

const buildEmailHtml = (agencyName: string) => `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><title>10 Days Remaining — Your Free Trial Ends Soon</title></head>
<body style="margin:0;padding:0;background:#f5f5f5;font-family:Arial,sans-serif;color:#1a1a1a;">
  <div style="max-width:640px;margin:0 auto;background:#ffffff;padding:32px;">
    <div style="text-align:center;margin-bottom:24px;">
      <h1 style="margin:0;font-size:28px;letter-spacing:2px;color:#f97316;">ZUVIO</h1>
    </div>

    <div style="background:#fef2f2;border:2px solid #ef4444;border-radius:8px;padding:20px;text-align:center;margin-bottom:24px;">
      <p style="margin:0 0 8px;font-size:13px;color:#ef4444;font-weight:bold;letter-spacing:1px;">⚠ URGENT</p>
      <p style="margin:0;font-size:48px;font-weight:bold;color:#ef4444;line-height:1;">10</p>
      <p style="margin:4px 0 12px;font-size:14px;color:#ef4444;font-weight:bold;letter-spacing:1px;">DAYS REMAINING</p>
      <h2 style="margin:0;font-size:22px;color:#1a1a1a;">Your Free Trial Ends Soon.</h2>
      <p style="margin:6px 0 0;font-size:16px;color:#1a1a1a;font-weight:bold;">Don't Lose Your Spot.</p>
    </div>

    <p>Hi ${agencyName},</p>
    <p>Your 60-day Founding Member trial is almost over. After your trial ends, your listing will be paused until your setup is complete and your subscription is active. Here's what you need to do right now.</p>

    <div style="background:#fef2f2;border:1px solid #ef4444;border-radius:8px;padding:16px;margin:20px 0;">
      <p style="margin:0;font-size:14px;"><strong>🚫 In 10 days, any agency that has not completed setup will have their listings automatically paused. Renters will not be able to find or book your vehicles until you finish.</strong></p>
    </div>

    <h3>Complete these steps before your trial ends:</h3>
    <p>Log into your Owner Dashboard at <a href="https://zuvio.us/dashboard" style="color:#f97316;">zuvio.us/dashboard</a> to finish setup.</p>

    <div style="border:1px solid #e5e7eb;border-radius:8px;padding:16px;margin-bottom:12px;">
      <h4 style="margin:0 0 8px;color:#f97316;">1. Connect Your Stripe Account</h4>
      <p style="margin:0 0 12px;font-size:14px;">Required to receive rental payouts. Without this, you cannot get paid.</p>
      <a href="https://zuvio.us/dashboard" style="color:#f97316;font-weight:bold;text-decoration:none;">DO IT →</a>
    </div>

    <div style="border:1px solid #e5e7eb;border-radius:8px;padding:16px;margin-bottom:12px;">
      <h4 style="margin:0 0 8px;color:#f97316;">2. Upload Vehicle Photos</h4>
      <p style="margin:0 0 12px;font-size:14px;">At least 3 photos per vehicle. Listings with photos get significantly more bookings.</p>
      <a href="https://zuvio.us/dashboard" style="color:#f97316;font-weight:bold;text-decoration:none;">DO IT →</a>
    </div>

    <div style="border:1px solid #e5e7eb;border-radius:8px;padding:16px;margin-bottom:20px;">
      <h4 style="margin:0 0 8px;color:#f97316;">3. Set Daily Rates on All Vehicles</h4>
      <p style="margin:0 0 12px;font-size:14px;">Every vehicle needs a daily rate so renters can book and pay instantly.</p>
      <a href="https://zuvio.us/dashboard" style="color:#f97316;font-weight:bold;text-decoration:none;">DO IT →</a>
    </div>

    <div style="background:#fff8f0;border:2px solid #f97316;border-radius:8px;padding:20px;margin:24px 0;text-align:center;">
      <p style="margin:0 0 6px;font-size:12px;font-weight:bold;color:#f97316;letter-spacing:1px;">⭐ FOUNDING MEMBER BENEFIT</p>
      <h3 style="margin:0 0 8px;font-size:22px;color:#1a1a1a;">Lock in $79/month for life.</h3>
      <p style="margin:0;font-size:14px;color:#55575d;">Complete your setup before your trial ends and your Founding Member rate is locked in permanently. This price will never increase as long as you remain active on Zuvio.</p>
    </div>

    <div style="text-align:center;margin:28px 0;">
      <a href="https://zuvio.us/dashboard" style="display:inline-block;background:#f97316;color:#ffffff;padding:14px 28px;border-radius:8px;text-decoration:none;font-weight:bold;font-size:16px;">FINISH MY SETUP NOW</a>
    </div>

    <h3>Need help finishing setup?</h3>
    <p>We're here for you. Reply to this email, call us at <strong>(725) 344-3074</strong>, or email <a href="mailto:team@zuvio.us" style="color:#f97316;">team@zuvio.us</a> and we'll walk you through it personally.</p>
    <p><strong>Setup takes less than 15 minutes. Don't let your free trial go to waste.</strong></p>

    <hr style="border:none;border-top:1px solid #e5e7eb;margin:28px 0;">
    <div style="text-align:center;font-size:12px;color:#999;">
      <p style="margin:0 0 4px;font-weight:bold;color:#f97316;letter-spacing:1px;">ZUVIO</p>
      <p style="margin:0 0 8px;">Independent Car Rentals. One Network.</p>
      <p style="margin:0;">team@zuvio.us | (725) 344-3074 | zuvio.us</p>
      <p style="margin:12px 0 0;">You're receiving this because you registered as a Founding Member on Zuvio. © 2026 Zuvio. All rights reserved.</p>
    </div>
  </div>
</body>
</html>`;

const sendEmail = async (to: string, subject: string, html: string) => {
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${RESEND_API_KEY}`,
    },
    body: JSON.stringify({ from: FROM_EMAIL, to: [to], subject, html }),
  });
  if (!res.ok) {
    console.error("Resend error:", await res.text());
    return false;
  }
  return true;
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (!RESEND_API_KEY) throw new Error("RESEND_API_KEY not set");

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

    // Find agencies created exactly 50 days ago that haven't been notified yet.
    const { data: agencies, error } = await supabase
      .from("agencies")
      .select("id, agency_name, email, owner_user_id, stripe_connect_status, created_at, day50_reminder_sent")
      .eq("day50_reminder_sent", false)
      .gte("created_at", new Date(Date.now() - 51 * 24 * 60 * 60 * 1000).toISOString())
      .lt("created_at", new Date(Date.now() - 50 * 24 * 60 * 60 * 1000).toISOString())
      .not("email", "is", null);

    if (error) throw error;

    let sent = 0;
    const results: Array<{ id: string; sent: boolean; reason?: string }> = [];

    for (const agency of agencies ?? []) {
      const stripeActive = agency.stripe_connect_status === "active";

      let onboardingComplete = false;
      if (stripeActive && agency.owner_user_id) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("id")
          .eq("user_id", agency.owner_user_id)
          .maybeSingle();

        if (profile?.id) {
          const { data: vehicles } = await supabase
            .from("vehicles")
            .select("id, images, daily_rate")
            .eq("profile_id", profile.id);

          const hasVehicles = (vehicles?.length ?? 0) > 0;
          const allHavePhotos = hasVehicles && vehicles!.every(
            (v) => Array.isArray(v.images) && v.images.length > 0
          );
          const allHaveRates = hasVehicles && vehicles!.every(
            (v) => v.daily_rate != null && Number(v.daily_rate) > 0
          );
          onboardingComplete = hasVehicles && allHavePhotos && allHaveRates;
        }
      }

      if (onboardingComplete) {
        results.push({ id: agency.id, sent: false, reason: "onboarding_complete" });
        await supabase
          .from("agencies")
          .update({ day50_reminder_sent: true })
          .eq("id", agency.id);
        continue;
      }

      const ok = await sendEmail(
        agency.email!,
        "⚠ 10 Days Remaining — Don't Lose Your Spot on Zuvio",
        buildEmailHtml(agency.agency_name)
      );

      if (ok) {
        await supabase
          .from("agencies")
          .update({ day50_reminder_sent: true })
          .eq("id", agency.id);
        sent++;
        results.push({ id: agency.id, sent: true });
      } else {
        results.push({ id: agency.id, sent: false, reason: "send_failed" });
      }
    }

    console.log(`[DAY50-REMINDER] Checked ${agencies?.length ?? 0} agencies, sent ${sent} emails`);

    return new Response(
      JSON.stringify({ success: true, checked: agencies?.length ?? 0, sent, results }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("Day 50 reminder error:", message);
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});