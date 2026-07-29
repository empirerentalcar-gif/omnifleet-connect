import { createClient } from "npm:@supabase/supabase-js@2.45.0";
import Stripe from "https://esm.sh/stripe@18.5.0?target=deno";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-run-token",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const RUN_TOKEN = "zv-overlap-cleanup-9f3a71c2";

// Duplicate/overlapping bookings to decline. Earliest submission in each group is kept.
const GROUPS = [
  {
    label: "FLEXX Ford Fusion Jul 25-26 (Eduardo)",
    keep: "b8455cca-ae78-4ad5-a6a1-06be55e92916",
    decline: ["ba2a6287-0504-4977-a7e6-19807ef33a94"],
    emailFor: "ba2a6287-0504-4977-a7e6-19807ef33a94",
  },
  {
    label: "FLEXX BMW I8 Jul 27-28 (Steven McClure)",
    keep: "172754b6-1f96-4877-bc1c-bfc8f87305aa",
    decline: [
      "28de8eb4-99e8-422e-a9ff-ec61a50f04f4",
      "5c69de4e-b7b5-41ce-839d-441d02532661",
      "452563b8-563e-4c17-8269-960ef6a2fb55",
      "88a34576-92d6-490e-a1f5-7e4b814295ed",
      "127d0a51-8f7c-4307-9953-b589447e7376",
      "d918b8eb-97a4-4751-a7ca-64741b1bf05e",
    ],
    // one notification per renter, not one per duplicate submit
    emailFor: "28de8eb4-99e8-422e-a9ff-ec61a50f04f4",
  },
];

const REASON = "Duplicate reservation request for the same vehicle and dates. Your original request is still active.";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.headers.get("x-run-token") !== RUN_TOKEN) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    { auth: { persistSession: false } },
  );
  const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!, { apiVersion: "2025-08-27.basil" });
  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const cronSecret = Deno.env.get("CRON_SECRET") ?? "";

  const results: unknown[] = [];

  for (const g of GROUPS) {
    for (const id of g.decline) {
      const { data: b } = await supabase
        .from("bookings")
        .select("id, stripe_payment_intent_id, stripe_setup_intent_id, booking_status")
        .eq("id", id)
        .maybeSingle();
      if (!b) { results.push({ group: g.label, id, status: "not_found" }); continue; }

      let stripeResult = "none";
      try {
        if (b.stripe_payment_intent_id) {
          await stripe.paymentIntents.cancel(b.stripe_payment_intent_id);
          stripeResult = "pi_canceled";
        } else if (b.stripe_setup_intent_id) {
          await stripe.setupIntents.cancel(b.stripe_setup_intent_id);
          stripeResult = "si_canceled";
        }
      } catch (e) {
        stripeResult = `stripe_err:${(e as Error).message}`;
      }

      const { error: updErr } = await supabase
        .from("bookings")
        .update({
          payment_status: "canceled",
          booking_status: "declined",
          decline_reason: REASON,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id);

      let emailResult = "skipped_duplicate_notice";
      if (id === g.emailFor) {
        try {
          const r = await fetch(`${supabaseUrl}/functions/v1/send-renter-booking-status`, {
            method: "POST",
            headers: { "Content-Type": "application/json", "x-cron-secret": cronSecret },
            body: JSON.stringify({ booking_id: id, status: "declined", reason: REASON }),
          });
          emailResult = r.ok ? "sent" : `email_err:${r.status}`;
        } catch (e) {
          emailResult = `email_err:${(e as Error).message}`;
        }
      }

      results.push({ group: g.label, id, stripe: stripeResult, db: updErr ? updErr.message : "declined", renter_email: emailResult });
    }
  }

  return new Response(JSON.stringify({ kept: GROUPS.map((g) => ({ group: g.label, kept_booking: g.keep })), results }, null, 2), {
    status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});
