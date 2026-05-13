import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0?target=deno";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, stripe-signature",
};

const log = (step: string, details?: unknown) => {
  const extra = details ? ` - ${JSON.stringify(details)}` : "";
  console.log(`[STRIPE-WEBHOOK] ${step}${extra}`);
};

/**
 * Stripe webhook receiver.
 * Handles subscription lifecycle (active/past_due/canceled) and booking
 * payment events (success/failure). Uses stripe_webhook_events for idempotency.
 * Required env: STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET
 */
serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");
    if (!webhookSecret) throw new Error("STRIPE_WEBHOOK_SECRET is not set");

    const signature = req.headers.get("stripe-signature");
    if (!signature) throw new Error("Missing stripe-signature header");

    const body = await req.text();
    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });

    let event: Stripe.Event;
    try {
      event = await stripe.webhooks.constructEventAsync(body, signature, webhookSecret);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      log("Signature verification failed", { msg });
      return new Response(JSON.stringify({ error: "invalid signature" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } },
    );

    // Idempotency: bail early if we've seen this event ID before
    const { data: existing } = await supabaseAdmin
      .from("stripe_webhook_events")
      .select("id")
      .eq("stripe_event_id", event.id)
      .maybeSingle();
    if (existing) {
      log("Duplicate event, skipping", { id: event.id, type: event.type });
      return new Response(JSON.stringify({ received: true, duplicate: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    log("Processing event", { id: event.id, type: event.type });

    try {
      switch (event.type) {
        case "customer.subscription.created":
        case "customer.subscription.updated":
        case "customer.subscription.deleted": {
          const sub = event.data.object as Stripe.Subscription;
          await syncSubscription(supabaseAdmin, sub);
          break;
        }
        case "invoice.payment_failed": {
          const invoice = event.data.object as Stripe.Invoice;
          const subId = (invoice as unknown as { subscription?: string }).subscription;
          if (subId) {
            const sub = await stripe.subscriptions.retrieve(subId);
            await syncSubscription(supabaseAdmin, sub);
          }
          break;
        }
        case "invoice.paid": {
          const invoice = event.data.object as Stripe.Invoice;
          const subId = (invoice as unknown as { subscription?: string }).subscription;
          if (subId) {
            const sub = await stripe.subscriptions.retrieve(subId);
            await syncSubscription(supabaseAdmin, sub);
          }
          break;
        }
        case "payment_intent.succeeded": {
          const pi = event.data.object as Stripe.PaymentIntent;
          const bookingId = pi.metadata?.booking_id;
          if (bookingId) {
            await supabaseAdmin
              .from("bookings")
              .update({
                payment_status: "succeeded",
                booking_status: "approved",
                stripe_charge_id:
                  (pi as unknown as { latest_charge?: string }).latest_charge ?? null,
                updated_at: new Date().toISOString(),
              })
              .eq("id", bookingId);
            await sendRenterConfirmation(bookingId);
          }
          break;
        }
        case "payment_intent.amount_capturable_updated": {
          // Manual-capture authorization succeeded — send the confirmation email
          const pi = event.data.object as Stripe.PaymentIntent;
          const bookingId = pi.metadata?.booking_id;
          if (bookingId) await sendRenterConfirmation(bookingId);
          break;
        }
        case "setup_intent.succeeded": {
          const si = event.data.object as Stripe.SetupIntent;
          const bookingId = si.metadata?.booking_id;
          if (bookingId) await sendRenterConfirmation(bookingId);
          break;
        }
        case "payment_intent.payment_failed": {
          const pi = event.data.object as Stripe.PaymentIntent;
          const bookingId = pi.metadata?.booking_id;
          if (bookingId) {
            await supabaseAdmin
              .from("bookings")
              .update({
                payment_status: "failed",
                decline_reason:
                  pi.last_payment_error?.message?.slice(0, 500) ?? "Payment failed",
                updated_at: new Date().toISOString(),
              })
              .eq("id", bookingId);
          }
          break;
        }
        case "payment_intent.canceled": {
          const pi = event.data.object as Stripe.PaymentIntent;
          const bookingId = pi.metadata?.booking_id;
          if (bookingId) {
            await supabaseAdmin
              .from("bookings")
              .update({
                payment_status: "canceled",
                updated_at: new Date().toISOString(),
              })
              .eq("id", bookingId);
          }
          break;
        }
        case "charge.refunded": {
          const charge = event.data.object as Stripe.Charge;
          const bookingId = charge.metadata?.booking_id;
          // Charges may not carry booking_id metadata directly — fall back to PI lookup
          const piId = typeof charge.payment_intent === "string"
            ? charge.payment_intent
            : charge.payment_intent?.id;
          const refunded = charge.amount_refunded >= charge.amount;
          const query = supabaseAdmin.from("bookings").update({
            payment_status: refunded ? "refunded" : "partially_refunded",
            updated_at: new Date().toISOString(),
          });
          if (bookingId) {
            await query.eq("id", bookingId);
          } else if (piId) {
            await query.eq("stripe_payment_intent_id", piId);
          }
          break;
        }
        case "payout.paid":
        case "payout.failed": {
          // Connect payout — event.account is the connected account ID
          const payout = event.data.object as Stripe.Payout;
          const connectAccountId = (event as unknown as { account?: string }).account;
          if (!connectAccountId) {
            log("payout event missing account", { id: event.id });
            break;
          }
          const isPaid = event.type === "payout.paid";
          const arrival = payout.arrival_date
            ? new Date(payout.arrival_date * 1000).toISOString()
            : new Date().toISOString();
          await supabaseAdmin
            .from("agencies")
            .update({
              last_payout_status: isPaid ? "paid" : "failed",
              last_payout_amount_cents: payout.amount,
              last_payout_at: arrival,
              last_payout_failure_message: isPaid
                ? null
                : payout.failure_message?.slice(0, 500) ?? "Payout failed",
              updated_at: new Date().toISOString(),
            })
            .eq("stripe_connect_account_id", connectAccountId);
          break;
        }
        case "account.updated": {
          const account = event.data.object as Stripe.Account;
          const requirements = account.requirements;
          let connectStatus = "pending";
          if (account.charges_enabled && account.payouts_enabled) {
            connectStatus = "active";
          } else if ((requirements?.disabled_reason ?? null) !== null) {
            connectStatus = "restricted";
          } else if (account.details_submitted) {
            connectStatus = "pending_verification";
          }
          await supabaseAdmin
            .from("agencies")
            .update({
              stripe_charges_enabled: account.charges_enabled ?? false,
              stripe_payouts_enabled: account.payouts_enabled ?? false,
              stripe_connect_status: connectStatus,
              updated_at: new Date().toISOString(),
            })
            .eq("stripe_connect_account_id", account.id);
          break;
        }
        default:
          log("Unhandled event type", { type: event.type });
      }

      // Mark event as processed
      await supabaseAdmin.from("stripe_webhook_events").insert({
        stripe_event_id: event.id,
        event_type: event.type,
        payload: event.data.object as unknown as Record<string, unknown>,
      });
    } catch (handlerErr) {
      const msg = handlerErr instanceof Error ? handlerErr.message : String(handlerErr);
      log("Handler error", { msg, eventId: event.id });
      // Don't mark as processed → Stripe will retry
      return new Response(JSON.stringify({ error: msg }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      });
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    log("ERROR", { message });
    return new Response(JSON.stringify({ error: message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});

async function syncSubscription(
  // deno-lint-ignore no-explicit-any
  supabaseAdmin: any,
  sub: Stripe.Subscription,
) {
  const customerId = typeof sub.customer === "string" ? sub.customer : sub.customer.id;
  const { data: agency } = await supabaseAdmin
    .from("agencies")
    .select("id, grace_period_end, trial_end_date")
    .eq("stripe_customer_id", customerId)
    .maybeSingle();
  if (!agency) {
    log("No agency for customer", { customerId });
    return;
  }

  let newStatus: string;
  let gracePeriodEnd: string | null = (agency as { grace_period_end: string | null })
    .grace_period_end;
  const periodEndSec = (sub as unknown as { current_period_end?: number }).current_period_end;
  const periodEnd = periodEndSec ? new Date(periodEndSec * 1000).toISOString() : null;

  if (sub.status === "active" || sub.status === "trialing") {
    newStatus = "active";
    gracePeriodEnd = null;
  } else if (sub.status === "past_due" || sub.status === "unpaid") {
    newStatus = "payment_required";
    if (!gracePeriodEnd) {
      const grace = new Date();
      grace.setUTCDate(grace.getUTCDate() + 7);
      gracePeriodEnd = grace.toISOString().slice(0, 10);
    }
  } else if (sub.status === "canceled" || sub.status === "incomplete_expired") {
    const trialEnd = (agency as { trial_end_date: string | null }).trial_end_date;
    const trialActive = trialEnd ? new Date(trialEnd).getTime() > Date.now() : false;
    newStatus = trialActive ? "trial" : "expired";
    gracePeriodEnd = null;
  } else {
    newStatus = "trial"; // incomplete etc — keep them in pre-active state
  }

  await supabaseAdmin
    .from("agencies")
    .update({
      subscription_status: newStatus,
      grace_period_end: gracePeriodEnd,
      stripe_subscription_id: sub.id,
      subscription_current_period_end: periodEnd,
      updated_at: new Date().toISOString(),
    })
    .eq("id", (agency as { id: string }).id);

  log("Subscription synced", { agencyId: (agency as { id: string }).id, newStatus });
}

async function sendRenterConfirmation(bookingId: string) {
  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const cronSecret = Deno.env.get("CRON_SECRET") ?? "";
    await fetch(`${supabaseUrl}/functions/v1/send-renter-booking-confirmation`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-cron-secret": cronSecret,
      },
      body: JSON.stringify({ booking_id: bookingId }),
    });
  } catch (e) {
    console.error("[STRIPE-WEBHOOK] renter confirmation email failed", e);
  }
}