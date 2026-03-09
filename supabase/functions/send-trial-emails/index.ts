import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const FROM_EMAIL = "noreply@zuvio.us";

interface Agency {
  id: string;
  agency_name: string;
  email: string | null;
  trial_start_date: string | null;
  trial_end_date: string | null;
  subscription_status: string;
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

const welcomeEmail = (name: string) => `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
  <h1 style="color: #1a1a1a;">Welcome to Zuvio, ${name}! 🎉</h1>
  <p>You've been accepted as a <strong>Founding Member</strong> — one of the first 50 agencies on Zuvio.</p>
  <p>Here's what you get:</p>
  <ul>
    <li><strong>60 days FREE</strong> — no credit card required</li>
    <li>Full access to list vehicles, receive reservations, and grow your business</li>
    <li>Locked-in Founding Member pricing when you subscribe</li>
  </ul>
  <p>Your trial ends in 60 days. We'll remind you before it expires.</p>
  <p><a href="https://zuvio.us/dashboard" style="display:inline-block;background:#f97316;color:#fff;padding:12px 24px;border-radius:6px;text-decoration:none;font-weight:bold;">Go to Your Dashboard</a></p>
  <p style="color: #666; font-size: 14px;">— The Zuvio Team</p>
</div>`;

const reminderEmail = (name: string, daysLeft: number) => `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
  <h1 style="color: #1a1a1a;">${daysLeft <= 5 ? '⚠️' : '⏰'} ${daysLeft} days left in your trial</h1>
  <p>Hi ${name},</p>
  <p>Your Zuvio Founding Member trial ${daysLeft <= 5 ? '<strong>expires very soon</strong>' : 'is ending soon'}.</p>
  <p>After your trial ends, your vehicles will be hidden from search until you subscribe.</p>
  <p><strong>Founding Member pricing: $79/month</strong> — locked in forever.</p>
  <p><a href="https://zuvio.us/dashboard" style="display:inline-block;background:#f97316;color:#fff;padding:12px 24px;border-radius:6px;text-decoration:none;font-weight:bold;">Subscribe Now</a></p>
  <p style="color: #666; font-size: 14px;">— The Zuvio Team</p>
</div>`;

const expiredEmail = (name: string) => `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
  <h1 style="color: #1a1a1a;">Your trial has ended</h1>
  <p>Hi ${name},</p>
  <p>Your 60-day Founding Member trial has expired. Your vehicles are now <strong>hidden from public search</strong>.</p>
  <p>Don't worry — your data is safe. Subscribe to make your listings visible again.</p>
  <p><strong>Founding Member pricing: $79/month</strong> — this rate is only available to you.</p>
  <p><a href="https://zuvio.us/dashboard" style="display:inline-block;background:#f97316;color:#fff;padding:12px 24px;border-radius:6px;text-decoration:none;font-weight:bold;">Subscribe & Go Live</a></p>
  <p style="color: #666; font-size: 14px;">— The Zuvio Team</p>
</div>`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (!RESEND_API_KEY) throw new Error("RESEND_API_KEY not set");

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // Get all agencies on trial
    const { data: agencies, error } = await supabase
      .from("agencies")
      .select("id, agency_name, email, trial_start_date, trial_end_date, subscription_status")
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

      // Day 1: Welcome email
      if (daysSinceStart === 0) {
        await sendEmail(agency.email, "Welcome to Zuvio — Your 60-Day Trial Starts Now!", welcomeEmail(agency.agency_name));
        sent++;
      }
      // Day 45 (15 days left)
      else if (daysLeft === 15) {
        await sendEmail(agency.email, "15 days left in your Zuvio trial", reminderEmail(agency.agency_name, 15));
        sent++;
      }
      // Day 55 (5 days left)
      else if (daysLeft === 5) {
        await sendEmail(agency.email, "⚠️ 5 days left — Subscribe to stay live on Zuvio", reminderEmail(agency.agency_name, 5));
        sent++;
      }
      // Day 60 (expired)
      else if (daysLeft <= 0) {
        await sendEmail(agency.email, "Your Zuvio trial has ended — Subscribe to go live", expiredEmail(agency.agency_name));
        // Mark as expired
        await supabase
          .from("agencies")
          .update({ subscription_status: "expired" })
          .eq("id", agency.id);
        sent++;
      }
    }

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
