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

const DISPUTE_ALERT_EMAIL = "zuviollc@gmail.com";
const DISPUTE_FROM_EMAIL = "Zuvio Alerts <team@zuvio.us>";

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
          const bookingId = await reconcilePaymentIntent(supabaseAdmin, pi, event.type);
          if (bookingId) {
            await sendRenterConfirmation(bookingId);
            await sendBookingConfirmedNotification(bookingId);
          }
          break;
        }
        case "payment_intent.captured": {
          const pi = event.data.object as Stripe.PaymentIntent;
          const bookingId = await reconcilePaymentIntent(supabaseAdmin, pi, event.type);
          if (bookingId) await sendBookingConfirmedNotification(bookingId);
          break;
        }
        case "payment_intent.amount_capturable_updated": {
          // Manual-capture authorization succeeded — this is the ONLY point at
          // which a booking may move out of `awaiting_payment`.
          const pi = event.data.object as Stripe.PaymentIntent;
          const bookingId = pi.metadata?.booking_id;
          if (bookingId) {
            await supabaseAdmin
              .from("bookings")
              .update({
                payment_status: "requires_capture",
                stripe_payment_intent_id: pi.id,
                updated_at: new Date().toISOString(),
              })
              .eq("id", bookingId);
            await sendRenterConfirmation(bookingId);
          }
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
            // Only DEFINITIVE failures release the date hold. Ambiguous outcomes
            // (api_error / api_connection_error / processing_error) keep the
            // booking pending so the expire-stalled-bookings sweep decides.
            const errType = pi.last_payment_error?.type;
            const errCode = pi.last_payment_error?.code;
            const definitive =
              (errType === "card_error" || errType === "invalid_request_error") &&
              errCode !== "processing_error";
            const update: Record<string, unknown> = {
              payment_status: "failed",
              decline_reason:
                pi.last_payment_error?.message?.slice(0, 500) ?? "Payment failed",
              updated_at: new Date().toISOString(),
            };
            if (definitive) {
              // Frees the dates via prevent_double_booking so the renter can retry.
              update.booking_status = "canceled";
            }
            await supabaseAdmin.from("bookings").update(update).eq("id", bookingId);
            // Notify renter + Zuvio ops (NOT the agency — intentional).
            await sendPaymentFailedEmails(
              bookingId,
              pi.last_payment_error?.message?.slice(0, 500) ?? "Payment failed",
            );
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
        case "charge.dispute.created": {
          const dispute = event.data.object as Stripe.Dispute;
          await handleDisputeCreated(supabaseAdmin, dispute);
          break;
        }
        case "charge.dispute.funds_withdrawn": {
          const dispute = event.data.object as Stripe.Dispute;
          await handleDisputeFundsWithdrawn(supabaseAdmin, dispute);
          break;
        }
        case "charge.dispute.funds_reinstated": {
          const dispute = event.data.object as Stripe.Dispute;
          await handleDisputeFundsReinstated(supabaseAdmin, dispute);
          break;
        }
        case "charge.dispute.closed": {
          const dispute = event.data.object as Stripe.Dispute;
          await handleDisputeClosed(supabaseAdmin, dispute);
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

async function sendBookingConfirmedNotification(bookingId: string) {
  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const cronSecret = Deno.env.get("CRON_SECRET") ?? "";
    await fetch(`${supabaseUrl}/functions/v1/send-booking-confirmation-email`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-cron-secret": cronSecret,
      },
      body: JSON.stringify({ booking_id: bookingId }),
    });
  } catch (e) {
    console.error("[STRIPE-WEBHOOK] admin/agency booking-confirmed email failed", e);
  }
}

async function sendPaymentFailedEmails(bookingId: string, failureMessage: string) {
  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const cronSecret = Deno.env.get("CRON_SECRET") ?? "";
    await fetch(`${supabaseUrl}/functions/v1/send-renter-payment-failed`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-cron-secret": cronSecret,
      },
      body: JSON.stringify({ booking_id: bookingId, failure_message: failureMessage }),
    });
  } catch (e) {
    console.error("[STRIPE-WEBHOOK] payment-failed email dispatch failed", e);
  }
}

/**
 * Reconcile a PaymentIntent (succeeded/captured) against the bookings table.
 * Looks up the booking by stripe_payment_intent_id (canonical) and falls back
 * to metadata.booking_id. Safe to run multiple times — idempotent UPDATE.
 * Returns the booking_id when a row was matched, otherwise null.
 */
// deno-lint-ignore no-explicit-any
async function reconcilePaymentIntent(
  supabaseAdmin: any,
  pi: Stripe.PaymentIntent,
  eventType: string,
): Promise<string | null> {
  const piId = pi.id;
  const latestCharge =
    (pi as unknown as { latest_charge?: string | { id: string } }).latest_charge ?? null;
  const chargeId =
    typeof latestCharge === "string" ? latestCharge : latestCharge?.id ?? null;

  // Primary lookup: by PI id
  let { data: booking } = await supabaseAdmin
    .from("bookings")
    .select("id")
    .eq("stripe_payment_intent_id", piId)
    .maybeSingle();

  // Fallback: metadata.booking_id (legacy / rows missing PI id)
  if (!booking && pi.metadata?.booking_id) {
    const res = await supabaseAdmin
      .from("bookings")
      .select("id")
      .eq("id", pi.metadata.booking_id)
      .maybeSingle();
    booking = res.data;
  }

  if (!booking) {
    console.log(
      `[WEBHOOK-RECONCILIATION] Received ${eventType} for PI ${piId} but no matching booking in DB (may be test/old data)`,
    );
    return null;
  }

  const { error: updateErr } = await supabaseAdmin
    .from("bookings")
    .update({
      payment_status: "captured",
      booking_status: "approved",
      stripe_charge_id: chargeId,
      updated_at: new Date().toISOString(),
    })
    .eq("id", booking.id);

  if (updateErr) {
    console.error(
      `[WEBHOOK-RECONCILIATION] Failed to update booking ${booking.id} from ${eventType}`,
      updateErr,
    );
    throw new Error(`Booking reconcile failed: ${updateErr.message}`);
  }

  console.log(
    `[WEBHOOK-RECONCILIATION] Booking ${booking.id} reconciled from Stripe webhook, charge ${chargeId ?? "null"}`,
  );
  return booking.id as string;
}

/**
 * Locate the booking + agency that owns a Stripe dispute.
 * Looks up by charge id first, then PaymentIntent id.
 */
// deno-lint-ignore no-explicit-any
async function findBookingForDispute(supabaseAdmin: any, dispute: Stripe.Dispute) {
  const chargeId = typeof dispute.charge === "string" ? dispute.charge : dispute.charge?.id ?? null;
  const piId = typeof dispute.payment_intent === "string"
    ? dispute.payment_intent
    : dispute.payment_intent?.id ?? null;

  let booking: { id: string; agency_id: string | null } | null = null;
  if (chargeId) {
    const res = await supabaseAdmin
      .from("bookings")
      .select("id, agency_id")
      .eq("stripe_charge_id", chargeId)
      .maybeSingle();
    booking = res.data ?? null;
  }
  if (!booking && piId) {
    const res = await supabaseAdmin
      .from("bookings")
      .select("id, agency_id")
      .eq("stripe_payment_intent_id", piId)
      .maybeSingle();
    booking = res.data ?? null;
  }
  return { booking, chargeId, piId };
}

async function sendDisputeAlertEmail(subject: string, html: string) {
  const apiKey = Deno.env.get("RESEND_API_KEY");
  if (!apiKey) {
    console.error("[STRIPE-WEBHOOK] RESEND_API_KEY missing — cannot send dispute alert");
    return;
  }
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        from: DISPUTE_FROM_EMAIL,
        to: [DISPUTE_ALERT_EMAIL],
        subject,
        html,
      }),
    });
    if (!res.ok) {
      console.error(
        `[STRIPE-WEBHOOK] Dispute alert email failed: ${res.status} ${await res.text()}`,
      );
    }
  } catch (e) {
    console.error("[STRIPE-WEBHOOK] Dispute alert email error", e);
  }
}

// deno-lint-ignore no-explicit-any
async function handleDisputeCreated(supabaseAdmin: any, dispute: Stripe.Dispute) {
  const { booking, chargeId, piId } = await findBookingForDispute(supabaseAdmin, dispute);
  const amount = dispute.amount ?? 0;
  const currency = (dispute.currency ?? "usd").toLowerCase();
  const evidenceDue = dispute.evidence_details?.due_by
    ? new Date(dispute.evidence_details.due_by * 1000).toISOString()
    : null;

  const { error } = await supabaseAdmin.from("disputes").upsert(
    {
      stripe_dispute_id: dispute.id,
      stripe_charge_id: chargeId,
      stripe_payment_intent_id: piId,
      booking_id: booking?.id ?? null,
      agency_id: booking?.agency_id ?? null,
      amount_cents: amount,
      currency,
      status: dispute.status,
      reason: dispute.reason ?? null,
      evidence_due_by: evidenceDue,
      raw: dispute as unknown as Record<string, unknown>,
      opened_at: new Date((dispute.created ?? Math.floor(Date.now() / 1000)) * 1000).toISOString(),
      updated_at: new Date().toISOString(),
    },
    { onConflict: "stripe_dispute_id" },
  );
  if (error) {
    log("dispute insert failed", { id: dispute.id, msg: error.message });
    throw new Error(`Dispute insert failed: ${error.message}`);
  }

  if (booking?.id) {
    await supabaseAdmin
      .from("bookings")
      .update({
        disputed: true,
        dispute_status: dispute.status,
        updated_at: new Date().toISOString(),
      })
      .eq("id", booking.id);
  }

  log("Dispute created", { id: dispute.id, bookingId: booking?.id ?? null, amount });

  const amountUsd = (amount / 100).toFixed(2);
  const html = `
    <h2>Stripe Dispute Opened</h2>
    <p><strong>Dispute ID:</strong> ${dispute.id}</p>
    <p><strong>Amount:</strong> $${amountUsd} ${currency.toUpperCase()}</p>
    <p><strong>Reason:</strong> ${dispute.reason ?? "unknown"}</p>
    <p><strong>Status:</strong> ${dispute.status}</p>
    <p><strong>Booking ID:</strong> ${booking?.id ?? "(not matched)"}</p>
    <p><strong>Agency ID:</strong> ${booking?.agency_id ?? "(not matched)"}</p>
    <p><strong>Charge:</strong> ${chargeId ?? "n/a"}</p>
    <p><strong>PaymentIntent:</strong> ${piId ?? "n/a"}</p>
    <p><strong>Evidence due by:</strong> ${evidenceDue ?? "n/a"}</p>
  `;
  await sendDisputeAlertEmail(
    `[Zuvio] Dispute opened — $${amountUsd} (${dispute.reason ?? "unknown"})`,
    html,
  );
}

// deno-lint-ignore no-explicit-any
async function handleDisputeFundsWithdrawn(supabaseAdmin: any, dispute: Stripe.Dispute) {
  const { error } = await supabaseAdmin
    .from("disputes")
    .update({
      funds_withdrawn: true,
      funds_withdrawn_at: new Date().toISOString(),
      status: dispute.status,
      raw: dispute as unknown as Record<string, unknown>,
      updated_at: new Date().toISOString(),
    })
    .eq("stripe_dispute_id", dispute.id);
  if (error) throw new Error(`Dispute funds_withdrawn update failed: ${error.message}`);
  log("Dispute funds withdrawn", { id: dispute.id });
}

// deno-lint-ignore no-explicit-any
async function handleDisputeFundsReinstated(supabaseAdmin: any, dispute: Stripe.Dispute) {
  const { error } = await supabaseAdmin
    .from("disputes")
    .update({
      funds_withdrawn: false,
      funds_reinstated_at: new Date().toISOString(),
      status: dispute.status,
      raw: dispute as unknown as Record<string, unknown>,
      updated_at: new Date().toISOString(),
    })
    .eq("stripe_dispute_id", dispute.id);
  if (error) throw new Error(`Dispute funds_reinstated update failed: ${error.message}`);
  log("Dispute funds reinstated", { id: dispute.id });
}

// deno-lint-ignore no-explicit-any
async function handleDisputeClosed(supabaseAdmin: any, dispute: Stripe.Dispute) {
  const { booking } = await findBookingForDispute(supabaseAdmin, dispute);
  const { error } = await supabaseAdmin
    .from("disputes")
    .update({
      status: dispute.status,
      outcome: dispute.status, // 'won' | 'lost' | 'warning_closed' etc.
      closed_at: new Date().toISOString(),
      raw: dispute as unknown as Record<string, unknown>,
      updated_at: new Date().toISOString(),
    })
    .eq("stripe_dispute_id", dispute.id);
  if (error) throw new Error(`Dispute closed update failed: ${error.message}`);

  if (booking?.id) {
    await supabaseAdmin
      .from("bookings")
      .update({
        dispute_status: dispute.status,
        // Keep `disputed = true` so the flag remains historically queryable,
        // unless Stripe reports the dispute was won.
        disputed: dispute.status === "won" ? false : true,
        updated_at: new Date().toISOString(),
      })
      .eq("id", booking.id);
  }

  log("Dispute closed", { id: dispute.id, outcome: dispute.status });

  await sendDisputeAlertEmail(
    `[Zuvio] Dispute closed — ${dispute.status.toUpperCase()} (${dispute.id})`,
    `<h2>Dispute Closed</h2>
     <p><strong>Dispute ID:</strong> ${dispute.id}</p>
     <p><strong>Final outcome:</strong> ${dispute.status}</p>
     <p><strong>Booking ID:</strong> ${booking?.id ?? "(not matched)"}</p>`,
  );
}