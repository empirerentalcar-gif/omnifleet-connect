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
<head><meta charset="utf-8"><title>Your Founding Member Trial - 20 Days Left</title></head>
<body style="margin:0;padding:0;background:#f5f5f5;font-family:Arial,sans-serif;color:#1a1a1a;">
  <div style="max-width:640px;margin:0 auto;background:#ffffff;padding:32px;">
    <div style="text-align:center;margin-bottom:24px;">
      <h1 style="margin:0;font-size:28px;letter-spacing:2px;color:#f97316;">ZUVIO</h1>
      <div style="display:inline-block;background:#fff8f0;color:#f97316;border:1px solid #f97316;border-radius:999px;padding:4px 12px;font-size:12px;font-weight:bold;margin-top:8px;">FOUNDING MEMBER</div>
    </div>

    <div style="background:#fef2f2;border:1px solid #ef4444;border-radius:8px;padding:16px;text-align:center;margin-bottom:24px;">
      <p style="margin:0;font-size:14px;color:#ef4444;font-weight:bold;">⏱ YOUR TRIAL CLOCK IS TICKING</p>
      <h2 style="margin:8px 0 0;font-size:22px;">You Have 20 Days Left to Complete Your Setup.</h2>
    </div>

    <p>Hi ${agencyName},</p>
    <p>Your 60-day Founding Member free trial is flying by. To keep your listing active and start receiving paid bookings, there are a few things you need to finish before your trial ends.</p>

    <div style="background:#fff8f0;border:1px solid #f97316;border-radius:8px;padding:16px;margin:20px 0;">
      <p style="margin:0;"><strong>⚠ Agencies that complete all three steps before their trial ends lock in $79/month for life. Don't leave your spot on the table.</strong></p>
    </div>

    <h3>Here's what's left to do:</h3>
    <p>Complete these 3 steps to stay active on the Zuvio platform.</p>

    <div style="border:1px solid #e5e7eb;border-radius:8px;padding:16px;margin-bottom:12px;">
      <h4 style="margin:0 0 8px;color:#f97316;">1. Connect Your Stripe Account</h4>
      <p style="margin:0 0 12px;font-size:14px;">Link your bank account through Stripe Express so Zuvio can send your rental payouts directly. This is required before you can accept paid bookings.</p>
      <a href="https://zuvio.us/dashboard" style="color:#f97316;font-weight:bold;text-decoration:none;">GO TO OWNER DASHBOARD →</a>
    </div>

    <div style="border:1px solid #e5e7eb;border-radius:8px;padding:16px;margin-bottom:12px;">
      <h4 style="margin:0 0 8px;color:#f97316;">2. Upload Vehicle Photos</h4>
      <p style="margin:0 0 12px;font-size:14px;">Listings with photos get significantly more bookings than those without. Upload at least 3 photos per vehicle — exterior front, exterior rear, and interior. Takes less than 5 minutes.</p>
      <a href="https://zuvio.us/dashboard" style="color:#f97316;font-weight:bold;text-decoration:none;">UPLOAD PHOTOS NOW →</a>
    </div>

    <div style="border:1px solid #e5e7eb;border-radius:8px;padding:16px;margin-bottom:20px;">
      <h4 style="margin:0 0 8px;color:#f97316;">3. Set Your Daily Rates</h4>
      <p style="margin:0 0 12px;font-size:14px;">Make sure every vehicle has a daily rate set. Without a rate, renters can't complete a paid booking for your vehicle. Log into your dashboard and confirm each vehicle is priced and ready.</p>
      <a href="https://zuvio.us/dashboard" style="color:#f97316;font-weight:bold;text-decoration:none;">REVIEW MY VEHICLES →</a>
    </div>

    <div style="text-align:center;margin:28px 0;">
      <a href="https://zuvio.us/dashboard" style="display:inline-block;background:#f97316;color:#ffffff;padding:14px 28px;border-radius:8px;text-decoration:none;font-weight:bold;font-size:16px;">COMPLETE MY SETUP NOW</a>
    </div>

    <h3>What happens after your trial ends?</h3>
    <p>✅ Founding Members who complete setup pay just <strong>$79/month — locked in for life.</strong></p>
    <p>❌ Agencies that don't complete setup will have their listings paused until onboarding is finished.</p>

    <p style="margin-top:24px;">Questions? Reply to this email or call us at <strong>(725) 344-3074</strong>. We're happy to walk you through it.</p>

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

    // Test mode: send a single test email to a provided address, bypass all DB filters/updates.
    if (req.method === "POST") {
      let body: any = null;
      try { body = await req.json(); } catch (_) { body = null; }
      if (body?.test === true && body?.to) {
        const ok = await sendEmail(
          String(body.to),
          "[TEST] ⏱ 20 Days Left — Complete Your Zuvio Setup",
          buildEmailHtml(String(body.agency_name ?? "Test Agency"))
        );
        return new Response(
          JSON.stringify({ success: ok, test: true, to: body.to }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: ok ? 200 : 500 }
        );
      }
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // Find agencies created exactly 40 days ago that haven't been notified yet.
    const { data: agencies, error } = await supabase
      .from("agencies")
      .select("id, agency_name, email, owner_user_id, stripe_connect_status, created_at, day40_reminder_sent")
      .eq("day40_reminder_sent", false)
      .gte("created_at", new Date(Date.now() - 41 * 24 * 60 * 60 * 1000).toISOString())
      .lt("created_at", new Date(Date.now() - 40 * 24 * 60 * 60 * 1000).toISOString())
      .not("email", "is", null);

    if (error) throw error;

    let sent = 0;
    const results: Array<{ id: string; sent: boolean; reason?: string }> = [];

    for (const agency of agencies ?? []) {
      // Check onboarding completeness
      const stripeActive = agency.stripe_connect_status === "active";

      // Pull this agency's vehicles via owner_user_id -> profile -> vehicles
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
        // Still mark as sent so we never re-check this agency.
        await supabase
          .from("agencies")
          .update({ day40_reminder_sent: true })
          .eq("id", agency.id);
        continue;
      }

      const ok = await sendEmail(
        agency.email!,
        "⏱ 20 Days Left — Complete Your Zuvio Setup",
        buildEmailHtml(agency.agency_name)
      );

      if (ok) {
        await supabase
          .from("agencies")
          .update({ day40_reminder_sent: true })
          .eq("id", agency.id);
        sent++;
        results.push({ id: agency.id, sent: true });
      } else {
        results.push({ id: agency.id, sent: false, reason: "send_failed" });
      }
    }

    console.log(`[DAY40-REMINDER] Checked ${agencies?.length ?? 0} agencies, sent ${sent} emails`);

    return new Response(
      JSON.stringify({ success: true, checked: agencies?.length ?? 0, sent, results }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("Day 40 reminder error:", message);
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});