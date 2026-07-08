import { createClient } from "npm:@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY")!;
const FROM_EMAIL = "Zuvio <noreply@notify.gozuvio.com>";

function buildHtml(agencyName: string) {
  return `<div style="font-family: Arial, sans-serif; color:#0d1b2e; max-width:600px; line-height:1.6;">
  <p>Hi ${agencyName},</p>
  <p>Thanks for being part of Zuvio! We're rolling out a few platform improvements, and we noticed your agency profile is missing some details we now require for all agencies: <strong>business city, state, and phone number</strong>.</p>
  <p>Could you take 2 minutes to add these to your profile? Having this info on file helps renters trust your listings and helps us reach you quickly if there's ever a booking issue.</p>
  <p><strong>How to update:</strong></p>
  <ol>
    <li>Log in to your Zuvio dashboard</li>
    <li>Go to Business Profile / Settings</li>
    <li>Fill in city, state, and phone number</li>
    <li>Save</li>
  </ol>
  <p>If you have any trouble, just reply to this email and we'll help you out.</p>
  <p>Thanks for being part of Zuvio,<br/>The Zuvio Team</p>
</div>`;
}

function buildText(agencyName: string) {
  return `Hi ${agencyName},

Thanks for being part of Zuvio! We're rolling out a few platform improvements, and we noticed your agency profile is missing some details we now require for all agencies: business city, state, and phone number.

Could you take 2 minutes to add these to your profile? Having this info on file helps renters trust your listings and helps us reach you quickly if there's ever a booking issue.

How to update:
1. Log in to your Zuvio dashboard
2. Go to Business Profile / Settings
3. Fill in city, state, and phone number
4. Save

If you have any trouble, just reply to this email and we'll help you out.

Thanks for being part of Zuvio,
The Zuvio Team`;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { data: agencies, error } = await supabase
      .from("agencies")
      .select("id, agency_name, email, city, state, phone")
      .or("city.is.null,state.is.null,phone.is.null");

    if (error) throw error;

    const EXCLUDE = new Set(["slaughtermarketing101@gmail.com"]);
    const targets = (agencies ?? []).filter((a) => {
      if (!a.email) return false;
      if (EXCLUDE.has(a.email.toLowerCase())) return false;
      const missing = !a.city || !a.state || !a.phone;
      return missing;
    });

    const results: Array<{ agency: string; email: string; status: string; id?: string; error?: string }> = [];

    for (const a of targets) {
      try {
        const res = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${RESEND_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from: FROM_EMAIL,
            to: [a.email],
            subject: "Quick update needed for your Zuvio agency profile",
            html: buildHtml(a.agency_name),
            text: buildText(a.agency_name),
          }),
        });
        const body = await res.json().catch(() => ({}));
        if (!res.ok) {
          results.push({ agency: a.agency_name, email: a.email, status: "failed", error: JSON.stringify(body) });
        } else {
          results.push({ agency: a.agency_name, email: a.email, status: "sent", id: body.id });
        }
      } catch (err) {
        results.push({
          agency: a.agency_name,
          email: a.email,
          status: "failed",
          error: err instanceof Error ? err.message : String(err),
        });
      }
      await new Promise((r) => setTimeout(r, 600)); // gentle pacing (Resend ~2/sec)
    }

    const summary = {
      total: results.length,
      sent: results.filter((r) => r.status === "sent").length,
      failed: results.filter((r) => r.status === "failed").length,
      results,
    };

    return new Response(JSON.stringify(summary, null, 2), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : String(err) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});