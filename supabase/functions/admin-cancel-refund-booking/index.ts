import Stripe from "npm:stripe@17.7.0";
import { createClient } from "npm:@supabase/supabase-js@2.49.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const log = (step: string, details?: unknown) => {
  const extra = details ? ` - ${JSON.stringify(details)}` : "";
  console.log(`[ADMIN-CANCEL-REFUND] ${step}${extra}`);
};

const esc = (t: string) =>
  String(t).replace(/[&<>"']/g, (m) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" }[m]!)
  );

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

/** Balance / timing problems that must NOT be treated as hard failures. */
const isBalanceOrPendingIssue = (err: unknown) => {
  const e = err as { code?: string; message?: string; raw?: { code?: string } };
  const code = e?.code ?? e?.raw?.code ?? "";
  const msg = (e?.message ?? "").toLowerCase();
  return (
    code === "balance_insufficient" ||
    /insufficient (funds|balance)/.test(msg) ||
    /balance_insufficient/.test(msg) ||
    /not have (enough|sufficient)/.test(msg)
  );
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return json({ error: "No authorization header provided" }, 401);

    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const supabaseAuth = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY") ?? "");
    const { data: userData, error: userErr } = await supabaseAuth.auth.getUser(
      authHeader.replace("Bearer ", ""),
    );
    if (userErr || !userData?.user) return json({ error: "Not authenticated" }, 401);
    const user = userData.user;

    const supabaseAdmin = createClient(
      supabaseUrl,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } },
    );

    // Super-admin only.
    const { data: isAdmin } = await supabaseAdmin.rpc("has_role", {
      _user_id: user.id,
      _role: "admin",
    });
    if (!isAdmin) return json({ error: "Admin role required" }, 403);

    const body = (await req.json().catch(() => ({}))) as {
      booking_id?: string;
      reason?: string;
    };
    const bookingId = body.booking_id;
    const reason =
      typeof body.reason === "string" && body.reason.trim()
        ? body.reason.trim().slice(0, 500)
        : null;
    if (!bookingId) return json({ error: "Missing booking_id" }, 400);

    const { data: booking, error: bErr } = await supabaseAdmin
      .from("bookings")
      .select(
        "id, agency_id, vehicle_id, renter_name, renter_email, pickup_date, dropoff_date, rental_days, total_amount_cents, currency, payment_status, booking_status, stripe_payment_intent_id, stripe_refund_id",
      )
      .eq("id", bookingId)
      .maybeSingle();
    if (bErr) return json({ error: `Booking lookup failed: ${bErr.message}` }, 400);
    if (!booking) return json({ error: "Booking not found" }, 404);

    // Eligibility
    if (["cancelled_refunded", "refund_pending"].includes(booking.booking_status)) {
      return json(
        { error: `This booking is already ${booking.booking_status.replace("_", " ")}.` },
        400,
      );
    }
    if (["refunded", "partially_refunded", "refund_pending"].includes(booking.payment_status)) {
      return json({ error: "This booking has already been refunded." }, 400);
    }
    if (booking.payment_status !== "captured") {
      return json(
        {
          error:
            "Only bookings with a captured payment can be cancelled and refunded. Use Decline to release an uncaptured authorization.",
        },
        400,
      );
    }
    if (!booking.stripe_payment_intent_id) {
      return json({ error: "No Stripe PaymentIntent on this booking — nothing to refund." }, 400);
    }

    const beforeStatus = booking.booking_status;
    const stripe = new Stripe(stripeKey, {
      apiVersion: "2025-08-27.basil",
      httpClient: Stripe.createFetchHttpClient(),
    });

    let refund: Stripe.Refund | null = null;
    let pendingNote: string | null = null;

    try {
      refund = await stripe.refunds.create({
        payment_intent: booking.stripe_payment_intent_id,
        reverse_transfer: true,
        refund_application_fee: true,
        reason: "requested_by_customer",
        metadata: {
          booking_id: booking.id,
          cancelled_by: user.id,
          ...(reason ? { reason } : {}),
        },
      });
      log("Refund created", { id: refund.id, status: refund.status });
    } catch (err) {
      if (!isBalanceOrPendingIssue(err)) {
        const msg = err instanceof Error ? err.message : String(err);
        log("Refund failed hard", { msg });
        return json({ error: `Stripe refund failed: ${msg}` }, 400);
      }
      pendingNote = err instanceof Error ? err.message : String(err);
      log("Refund blocked by balance — marking refund_pending", { msg: pendingNote });
    }

    const refundSucceeded = !!refund && refund.status === "succeeded";
    if (refund && !refundSucceeded) {
      pendingNote = `Stripe refund ${refund.id} is ${refund.status}.`;
    }

    const nowIso = new Date().toISOString();
    const afterStatus = refundSucceeded ? "cancelled_refunded" : "refund_pending";

    const { error: updErr } = await supabaseAdmin
      .from("bookings")
      .update({
        booking_status: afterStatus,
        payment_status: refundSucceeded ? "refunded" : "refund_pending",
        stripe_refund_id: refund?.id ?? null,
        cancelled_by: user.id,
        cancellation_reason: reason,
        cancelled_at: nowIso,
        updated_at: nowIso,
      })
      .eq("id", booking.id);
    if (updErr) log("Booking update failed", { msg: updErr.message });

    // Audit log
    await supabaseAdmin.from("admin_audit_log").insert({
      action_type: "booking_cancel_refund",
      target_type: "booking",
      target_id: booking.id,
      target_label: `${booking.renter_name} · ${booking.pickup_date} → ${booking.dropoff_date}`,
      admin_user_id: user.id,
      admin_email: user.email ?? null,
      metadata: {
        reason,
        stripe_refund_id: refund?.id ?? null,
        refund_status: refund?.status ?? "not_created",
        before_status: beforeStatus,
        after_status: afterStatus,
        amount_cents: booking.total_amount_cents,
        pending_note: pendingNote,
      },
    });

    // Agency email — success only.
    if (refundSucceeded) {
      try {
        const resendApiKey = Deno.env.get("RESEND_API_KEY");
        const { data: agency } = await supabaseAdmin
          .from("agencies")
          .select("agency_name, email")
          .eq("id", booking.agency_id)
          .maybeSingle();
        const { data: vehicle } = await supabaseAdmin
          .from("vehicles")
          .select("year, make, model")
          .eq("id", booking.vehicle_id)
          .maybeSingle();
        if (resendApiKey && agency?.email) {
          const vehicleLabel = vehicle
            ? `${vehicle.year} ${vehicle.make} ${vehicle.model}`
            : "Vehicle";
          const total = (booking.total_amount_cents / 100).toFixed(2);
          const html = `
            <div style="font-family:Arial,sans-serif;background:#0d1b2e;color:#e8eef6;padding:24px;border-radius:12px">
              <h1 style="color:#3ec9c9;font-size:20px;margin:0 0 16px">Booking cancelled and refunded</h1>
              <p>Hi ${esc(agency.agency_name ?? "there")},</p>
              <p>Zuvio has cancelled the following booking and issued a full refund to the renter. The rental amount has been reversed from your Stripe balance, and the dates are now available again.</p>
              <table style="font-size:14px;line-height:1.8">
                <tr><td style="opacity:.7;padding-right:12px">Booking reference</td><td>${esc(booking.id)}</td></tr>
                <tr><td style="opacity:.7;padding-right:12px">Renter</td><td>${esc(booking.renter_name)}</td></tr>
                <tr><td style="opacity:.7;padding-right:12px">Vehicle</td><td>${esc(vehicleLabel)}</td></tr>
                <tr><td style="opacity:.7;padding-right:12px">Dates</td><td>${esc(booking.pickup_date)} → ${esc(booking.dropoff_date)} (${booking.rental_days}d)</td></tr>
                <tr><td style="opacity:.7;padding-right:12px">Refunded</td><td>$${total} ${esc((booking.currency ?? "usd").toUpperCase())}</td></tr>
                ${reason ? `<tr><td style="opacity:.7;padding-right:12px">Reason</td><td>${esc(reason)}</td></tr>` : ""}
              </table>
              <p style="margin-top:20px;font-size:13px;opacity:.8">Questions? Reply to this email or contact team@zuvio.us / 725-239-2300.</p>
            </div>`;
          const res = await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: {
              Authorization: `Bearer ${resendApiKey}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              from: "ZUVIO <team@zuvio.us>",
              to: [agency.email],
              subject: `🔄 Booking cancelled & refunded — ${agency.agency_name ?? "Your agency"} · ${booking.renter_name}`,
              html,
            }),
          });
          if (!res.ok) log("Agency email failed", { status: res.status, body: await res.text() });
        }
      } catch (e) {
        log("Agency email error", { msg: (e as Error).message });
      }
    }

    return json({
      ok: true,
      status: afterStatus,
      refund_pending: !refundSucceeded,
      stripe_refund_id: refund?.id ?? null,
      message: refundSucceeded
        ? "Refund issued and booking cancelled. The agency has been notified."
        : "Refund could not be completed yet — the booking is marked refund pending. Check the platform and connected account Stripe balances.",
      detail: pendingNote,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    log("ERROR", { message });
    return json({ error: message }, 400);
  }
});