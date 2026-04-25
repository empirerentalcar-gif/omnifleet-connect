import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0?target=deno";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const log = (step: string, details?: unknown) => {
  const extra = details ? ` - ${JSON.stringify(details)}` : "";
  console.log(`[CHECK-SUBSCRIPTION-STATUS] ${step}${extra}`);
};

/**
 * Reconciles the agency's subscription state with Stripe.
 * - active/trialing -> subscription_status = 'active', clears grace period
 * - past_due/unpaid -> subscription_status = 'payment_required', sets 7-day grace if not set
 * - canceled/none -> falls back to trial logic; if trial expired, marks 'expired'
 */
serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");

    const supabaseAuth = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
    );
    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userErr } = await supabaseAuth.auth.getUser(token);
    if (userErr) throw new Error(`Auth error: ${userErr.message}`);
    const user = userData.user;
    if (!user?.email) throw new Error("User not authenticated");

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } },
    );

    const { data: agency, error: agencyErr } = await supabaseAdmin
      .from("agencies")
      .select(
        "id, stripe_customer_id, stripe_subscription_id, subscription_status, subscription_current_period_end, trial_end_date, grace_period_end, is_founding_member, founding_member_number",
      )
      .eq("owner_user_id", user.id)
      .maybeSingle();
    if (agencyErr) throw new Error(`Agency lookup failed: ${agencyErr.message}`);
    if (!agency) throw new Error("No agency found");

    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });

    // Find or backfill customer
    let customerId = agency.stripe_customer_id ?? null;
    if (!customerId) {
      const existing = await stripe.customers.list({ email: user.email, limit: 1 });
      if (existing.data.length > 0) {
        customerId = existing.data[0].id;
        await supabaseAdmin
          .from("agencies")
          .update({ stripe_customer_id: customerId })
          .eq("id", agency.id);
      }
    }

    let subscription: Stripe.Subscription | null = null;
    if (customerId) {
      const subs = await stripe.subscriptions.list({
        customer: customerId,
        status: "all",
        limit: 5,
      });
      // Pick the most relevant: active > trialing > past_due > unpaid > others
      const priority: Record<string, number> = {
        active: 0,
        trialing: 1,
        past_due: 2,
        unpaid: 3,
        canceled: 4,
        incomplete: 5,
        incomplete_expired: 6,
      };
      subscription =
        subs.data
          .slice()
          .sort((a, b) => (priority[a.status] ?? 99) - (priority[b.status] ?? 99))[0] ??
        null;
    }

    const now = Date.now();
    const trialEndMs = agency.trial_end_date
      ? new Date(agency.trial_end_date).getTime()
      : null;
    const trialActive = trialEndMs !== null && trialEndMs > now;

    let newStatus: string = agency.subscription_status;
    let gracePeriodEnd: string | null = agency.grace_period_end;
    let subId: string | null = agency.stripe_subscription_id;
    let periodEnd: string | null = agency.subscription_current_period_end;

    if (subscription) {
      subId = subscription.id;
      const periodEndSec = (subscription as unknown as { current_period_end?: number })
        .current_period_end;
      periodEnd = periodEndSec ? new Date(periodEndSec * 1000).toISOString() : null;

      if (subscription.status === "active" || subscription.status === "trialing") {
        newStatus = "active";
        gracePeriodEnd = null;
      } else if (subscription.status === "past_due" || subscription.status === "unpaid") {
        newStatus = "payment_required";
        if (!gracePeriodEnd) {
          const grace = new Date();
          grace.setUTCDate(grace.getUTCDate() + 7);
          gracePeriodEnd = grace.toISOString().slice(0, 10);
        }
      } else if (
        subscription.status === "canceled" ||
        subscription.status === "incomplete_expired"
      ) {
        newStatus = trialActive ? "trial" : "expired";
        gracePeriodEnd = null;
      }
    } else {
      // No Stripe subscription yet
      newStatus = trialActive ? "trial" : "expired";
      gracePeriodEnd = null;
    }

    await supabaseAdmin
      .from("agencies")
      .update({
        subscription_status: newStatus,
        grace_period_end: gracePeriodEnd,
        stripe_subscription_id: subId,
        subscription_current_period_end: periodEnd,
        updated_at: new Date().toISOString(),
      })
      .eq("id", agency.id);

    log("Reconciled", { newStatus, gracePeriodEnd, subId });

    return new Response(
      JSON.stringify({
        subscription_status: newStatus,
        stripe_status: subscription?.status ?? null,
        grace_period_end: gracePeriodEnd,
        subscription_current_period_end: periodEnd,
        trial_end_date: agency.trial_end_date,
        is_founding_member: agency.is_founding_member,
        founding_member_number: agency.founding_member_number,
        has_subscription: !!subscription,
        cancel_at_period_end: subscription?.cancel_at_period_end ?? false,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      },
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    log("ERROR", { message });
    return new Response(JSON.stringify({ error: message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});