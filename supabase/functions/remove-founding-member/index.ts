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
  console.log(`[REMOVE-FOUNDING-MEMBER] ${step}${extra}`);
};

type AuditEntry = {
  action_type: string;
  target_type: string;
  target_id: string;
  target_label: string;
  admin_user_id: string;
  admin_email: string;
  metadata: Record<string, unknown>;
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("Missing authorization header");

    // Identify caller
    const supabaseAuth = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
    );
    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userErr } = await supabaseAuth.auth.getUser(token);
    if (userErr) throw new Error(`Auth error: ${userErr.message}`);
    const caller = userData.user;
    if (!caller?.id) throw new Error("Not authenticated");

    const admin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } },
    );

    // Verify admin role
    const { data: roleRow, error: roleErr } = await admin
      .from("user_roles")
      .select("role")
      .eq("user_id", caller.id)
      .eq("role", "admin")
      .maybeSingle();
    if (roleErr) throw new Error(`Role check failed: ${roleErr.message}`);
    if (!roleRow) {
      return new Response(JSON.stringify({ error: "Admin role required" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 403,
      });
    }

    // Parse + validate input
    const body = await req.json().catch(() => ({}));
    const agencyId = typeof body?.agency_id === "string" ? body.agency_id : null;
    if (!agencyId) {
      return new Response(JSON.stringify({ error: "agency_id is required" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }

    // Load the agency
    const { data: agency, error: agencyErr } = await admin
      .from("agencies")
      .select(
        "id, agency_name, email, is_founding_member, founding_member_number, stripe_customer_id, stripe_subscription_id",
      )
      .eq("id", agencyId)
      .maybeSingle();
    if (agencyErr) throw new Error(`Agency lookup failed: ${agencyErr.message}`);
    if (!agency) {
      return new Response(JSON.stringify({ error: "Agency not found" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 404,
      });
    }
    if (!agency.is_founding_member) {
      return new Response(
        JSON.stringify({ error: "Agency is not a founding member" }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400,
        },
      );
    }

    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });
    const adminEmail = caller.email ?? "unknown";
    const auditEntries: AuditEntry[] = [];

    // 1) Cancel Stripe subscription (if any)
    if (agency.stripe_subscription_id) {
      try {
        await stripe.subscriptions.cancel(agency.stripe_subscription_id);
        log("Subscription canceled", { sub: agency.stripe_subscription_id });
        auditEntries.push({
          action_type: "stripe_subscription_canceled",
          target_type: "stripe_subscription",
          target_id: agency.stripe_subscription_id,
          target_label: `${agency.agency_name} subscription`,
          admin_user_id: caller.id,
          admin_email: adminEmail,
          metadata: {
            agency_id: agency.id,
            stripe_customer_id: agency.stripe_customer_id,
          },
        });
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        log("Subscription cancel failed (continuing)", { msg });
      }
    }

    // 2) Detach all payment methods + delete Stripe customer
    if (agency.stripe_customer_id) {
      try {
        const pms = await stripe.paymentMethods.list({
          customer: agency.stripe_customer_id,
          type: "card",
          limit: 100,
        });
        for (const pm of pms.data) {
          try {
            await stripe.paymentMethods.detach(pm.id);
            log("Payment method detached", { pm: pm.id });
            auditEntries.push({
              action_type: "stripe_payment_method_detached",
              target_type: "stripe_payment_method",
              target_id: pm.id,
              target_label: `${agency.agency_name} card`,
              admin_user_id: caller.id,
              admin_email: adminEmail,
              metadata: {
                agency_id: agency.id,
                stripe_customer_id: agency.stripe_customer_id,
                brand: pm.card?.brand ?? null,
                last4: pm.card?.last4 ?? null,
              },
            });
          } catch (e) {
            const msg = e instanceof Error ? e.message : String(e);
            log("Detach failed (continuing)", { pm: pm.id, msg });
          }
        }

        const deleted = await stripe.customers.del(agency.stripe_customer_id);
        log("Customer deleted", { customer: deleted.id });
        auditEntries.push({
          action_type: "stripe_customer_deleted",
          target_type: "stripe_customer",
          target_id: agency.stripe_customer_id,
          target_label: `${agency.agency_name} customer`,
          admin_user_id: caller.id,
          admin_email: adminEmail,
          metadata: { agency_id: agency.id },
        });
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        log("Customer delete failed (continuing)", { msg });
      }
    }

    // 3) Clear booking FK references
    const { data: deletedBookings, error: bookingsErr } = await admin
      .from("bookings")
      .delete()
      .eq("agency_id", agency.id)
      .select("id");
    if (bookingsErr) throw new Error(`Booking cleanup failed: ${bookingsErr.message}`);
    const deletedBookingCount = deletedBookings?.length ?? 0;

    // 4) Delete the agency
    const { error: deleteErr } = await admin
      .from("agencies")
      .delete()
      .eq("id", agency.id);
    if (deleteErr) throw new Error(`Agency delete failed: ${deleteErr.message}`);

    auditEntries.push({
      action_type: "founding_member_deleted",
      target_type: "agency",
      target_id: agency.id,
      target_label: agency.agency_name,
      admin_user_id: caller.id,
      admin_email: adminEmail,
      metadata: {
        founding_member_number: agency.founding_member_number,
        email: agency.email,
        deleted_bookings: deletedBookingCount,
        reason: "admin removal via Remove Founding Member; slot freed for reuse",
      },
    });

    // 5) Persist audit log
    if (auditEntries.length > 0) {
      const { error: auditErr } = await admin
        .from("admin_audit_log")
        .insert(auditEntries);
      if (auditErr) log("Audit insert failed", { msg: auditErr.message });
    }

    return new Response(
      JSON.stringify({
        success: true,
        agency_id: agency.id,
        founding_member_number: agency.founding_member_number,
        deleted_bookings: deletedBookingCount,
        audit_entries: auditEntries.length,
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