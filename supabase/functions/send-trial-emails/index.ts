import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const FROM_EMAIL = "team@zuvio.us";

interface Agency {
  id: string;
  agency_name: string;
  email: string | null;
  trial_start_date: string | null;
  trial_end_date: string | null;
  subscription_status: string;
  is_founding_member: boolean;
  founding_member_number: number | null;
}

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
  }
  return res.ok;
};

const foundingWelcomeEmail = (name: string, number: number) => `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
  <h1 style="color: #1a1a1a;">🎉 Welcome, Founding Member #${number}!</h1>
  <p>Congratulations <strong>${name}</strong> — you're officially Founding Member <strong>#${number} of 50</strong> on Zuvio.</p>
  
  <div style="background: #fff8f0; border: 1px solid #f97316; border-radius: 8px; padding: 16px; margin: 20px 0;">
    <h3 style="margin-top: 0; color: #f97316;">Your Founding Member Benefits</h3>
    <ul style="margin: 0; padding-left: 20px;">
      <li><strong>60 days completely FREE</strong> — no credit card required</li>
      <li>After trial: <strong>$25/month + 3% commission</strong> (locked in forever)</li>
      <li>Full access to list vehicles, receive reservations, and grow your business</li>
      <li>Priority support and early access to new features</li>
    </ul>
  </div>

  <h3>How to Get Started:</h3>
  <ol>
    <li>Log into your dashboard and complete your agency profile</li>
    <li>Upload your vehicles with photos and pricing</li>
    <li>Optimize your listings — detailed descriptions get more bookings</li>
    <li>Start receiving reservation requests from customers</li>
  </ol>

  <p><a href="https://gozuvio.com/dashboard" style="display:inline-block;background:#f97316;color:#fff;padding:14px 28px;border-radius:8px;text-decoration:none;font-weight:bold;font-size:16px;">Go to Your Dashboard →</a></p>
  
  <p style="color: #666; font-size: 14px; margin-top: 30px;">Your trial ends in 60 days. We'll remind you before it expires.<br/>— The Zuvio Team</p>
</div>`;

const standardWelcomeEmail = (name: string) => `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
  <h1 style="color: #1a1a1a;">Welcome to Zuvio, ${name}! 🚗</h1>
  <p>Your <strong>30-day free trial</strong> starts now. Here's everything you need to know.</p>
  
  <div style="background: #f0f4ff; border: 1px solid #3b82f6; border-radius: 8px; padding: 16px; margin: 20px 0;">
    <h3 style="margin-top: 0; color: #3b82f6;">Your Trial Details</h3>
    <ul style="margin: 0; padding-left: 20px;">
      <li><strong>30 days free</strong> — full access, no restrictions</li>
      <li>After trial: <strong>$49/month + 5% commission</strong></li>
      <li>List unlimited vehicles and receive reservation requests</li>
    </ul>
  </div>

  <h3>Maximize Your Trial:</h3>
  <ol>
    <li>Complete your agency profile with photos and your story</li>
    <li>Upload all your available vehicles</li>
    <li>Add detailed descriptions and competitive pricing</li>
    <li>Respond quickly to reservation requests</li>
  </ol>

  <p><a href="https://gozuvio.com/dashboard" style="display:inline-block;background:#3b82f6;color:#fff;padding:14px 28px;border-radius:8px;text-decoration:none;font-weight:bold;font-size:16px;">Go to Your Dashboard →</a></p>
  
  <p style="color: #666; font-size: 14px; margin-top: 30px;">Your trial ends in 30 days. We'll remind you before it expires.<br/>— The Zuvio Team</p>
</div>`;

const trialEndingEmail = (name: string, daysLeft: number, isFounding: boolean, number: number | null) => `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
  <h1 style="color: #1a1a1a;">${daysLeft <= 5 ? '⚠️' : '⏰'} Your Zuvio trial ends in ${daysLeft} days</h1>
  <p>Hi ${name},</p>
  <p>Your ${isFounding ? `Founding Member` : ''} trial ${daysLeft <= 5 ? '<strong>expires very soon</strong>' : 'is ending soon'}.</p>
  
  <div style="background: ${daysLeft <= 5 ? '#fef2f2' : '#fff8f0'}; border: 1px solid ${daysLeft <= 5 ? '#ef4444' : '#f97316'}; border-radius: 8px; padding: 16px; margin: 20px 0;">
    <p style="margin: 0;"><strong>After your trial ends:</strong></p>
    <ul style="margin: 8px 0 0; padding-left: 20px;">
      <li>Your vehicles will be hidden from public search</li>
      <li>Your agency data and listings are preserved</li>
      <li>Subscribe anytime to restore visibility</li>
    </ul>
  </div>

  <p><strong>Your pricing: ${isFounding ? `$25/month + 3% commission (Founding Member #${number} exclusive rate)` : '$49/month + 5% commission'}</strong></p>
  
  <p><a href="https://gozuvio.com/dashboard" style="display:inline-block;background:#f97316;color:#fff;padding:14px 28px;border-radius:8px;text-decoration:none;font-weight:bold;font-size:16px;">Subscribe Now →</a></p>
  
  <p style="color: #666; font-size: 14px; margin-top: 30px;">— The Zuvio Team</p>
</div>`;

const trialEndedEmail = (name: string, isFounding: boolean, number: number | null) => `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
  <h1 style="color: #1a1a1a;">Your trial has ended</h1>
  <p>Hi ${name},</p>
  <p>Your ${isFounding ? `60-day Founding Member` : '30-day'} trial period is complete.</p>
  
  <div style="background: #fef2f2; border: 1px solid #ef4444; border-radius: 8px; padding: 16px; margin: 20px 0;">
    <p style="margin: 0;"><strong>What's changed:</strong></p>
    <ul style="margin: 8px 0 0; padding-left: 20px;">
      <li>Your vehicles are now <strong>hidden from public search</strong></li>
      <li>Your agency data and listings are <strong>safe and preserved</strong></li>
      <li>Subscribe to restore visibility instantly</li>
    </ul>
  </div>

  <div style="background: #f0fdf4; border: 1px solid #22c55e; border-radius: 8px; padding: 16px; margin: 20px 0;">
    <p style="margin: 0;"><strong>Your pricing${isFounding ? ` (Founding Member #${number})` : ''}:</strong></p>
    <p style="font-size: 20px; font-weight: bold; margin: 8px 0 0; color: #16a34a;">
      ${isFounding ? '$25/month + 3% commission' : '$49/month + 5% commission'}
    </p>
    ${isFounding ? '<p style="margin: 4px 0 0; font-size: 14px; color: #666;">This exclusive rate is locked in forever as a Founding Member.</p>' : ''}
  </div>

  <p><a href="https://gozuvio.com/dashboard" style="display:inline-block;background:#f97316;color:#fff;padding:14px 28px;border-radius:8px;text-decoration:none;font-weight:bold;font-size:16px;">Subscribe & Go Live →</a></p>
  
  <p style="color: #666; font-size: 14px; margin-top: 30px;">Questions? Reply to this email — we're here to help.<br/>— The Zuvio Team</p>
</div>`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Authenticate: require valid service role key or CRON_SECRET
    const authHeader = req.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return new Response(
        JSON.stringify({ error: "Unauthorized: missing Authorization header" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const token = authHeader.replace("Bearer ", "");
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const cronSecret = Deno.env.get("CRON_SECRET");

    const isServiceRole = serviceRoleKey && token === serviceRoleKey;
    const isCronSecret = cronSecret && token === cronSecret;

    if (!isServiceRole && !isCronSecret) {
      return new Response(
        JSON.stringify({ error: "Unauthorized: invalid credentials" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!RESEND_API_KEY) throw new Error("RESEND_API_KEY not set");

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // Get all agencies on trial
    const { data: agencies, error } = await supabase
      .from("agencies")
      .select("id, agency_name, email, trial_start_date, trial_end_date, subscription_status, is_founding_member, founding_member_number")
      .eq("subscription_status", "trial")
      .not("email", "is", null)
      .not("trial_end_date", "is", null);

    if (error) throw error;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    let sent = 0;

    for (const agency of (agencies || []) as Agency[]) {
      if (!agency.email || !agency.trial_end_date || !agency.trial_start_date) continue;

      const startDate = new Date(agency.trial_start_date);
      const endDate = new Date(agency.trial_end_date);
      const daysSinceStart = Math.floor((today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
      const daysLeft = Math.ceil((endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      const isFounding = agency.is_founding_member;
      const fmNum = agency.founding_member_number;

      // Day 1: Welcome email
      if (daysSinceStart === 0) {
        if (isFounding && fmNum) {
          await sendEmail(agency.email, `Welcome, Founding Member #${fmNum}! Your 60-Day Trial Starts Now`, foundingWelcomeEmail(agency.agency_name, fmNum));
        } else {
          await sendEmail(agency.email, "Welcome to Zuvio — Your 30-Day Trial Starts Now", standardWelcomeEmail(agency.agency_name));
        }
        sent++;
      }
      // Founding: Day 45 (15 days left) / Standard: Day 23 (7 days left)
      else if ((isFounding && daysLeft === 15) || (!isFounding && daysLeft === 7)) {
        await sendEmail(
          agency.email,
          `Your Zuvio trial ends in ${daysLeft} days`,
          trialEndingEmail(agency.agency_name, daysLeft, isFounding, fmNum)
        );
        sent++;
      }
      // 5 days left (both tiers)
      else if (daysLeft === 5) {
        await sendEmail(
          agency.email,
          `⚠️ 5 days left — Subscribe to stay live on Zuvio`,
          trialEndingEmail(agency.agency_name, 5, isFounding, fmNum)
        );
        sent++;
      }
      // Trial ended
      else if (daysLeft <= 0) {
        await sendEmail(
          agency.email,
          "Your trial has ended — Subscribe to continue on Zuvio",
          trialEndedEmail(agency.agency_name, isFounding, fmNum)
        );
        // Mark as payment_required
        await supabase
          .from("agencies")
          .update({ subscription_status: "payment_required" })
          .eq("id", agency.id);
        sent++;
      }
    }

    console.log(`[TRIAL-EMAILS] Processed ${(agencies || []).length} agencies, sent ${sent} emails`);

    return new Response(JSON.stringify({ success: true, emailsSent: sent }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("Trial email error:", message);
    return new Response(JSON.stringify({ error: message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
