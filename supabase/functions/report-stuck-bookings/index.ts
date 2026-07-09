import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-cron-secret",
};

const log = (step: string, details?: unknown) => {
  const extra = details ? ` - ${JSON.stringify(details)}` : "";
  console.log(`[REPORT-STUCK-BOOKINGS] ${step}${extra}`);
};

interface StuckRow {
  id: string;
  renter_name: string;
  pickup_date: string;
  dropoff_date: string;
  created_at: string;
  updated_at: string;
  agency_id: string;
  agencies: { agency_name: string | null; email: string | null } | null;
}

const daysSince = (iso: string) => {
  const ms = Date.now() - new Date(iso).getTime();
  return Math.max(0, Math.floor(ms / 86400000));
};

const escapeHtml = (s: string) =>
  s.replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!),
  );

/**
 * Weekly stuck-booking report. Read-only against `bookings`.
 * Auth:
 *   - Cron: `x-cron-secret` header must match CRON_SECRET.
 *   - Manual: caller must be an authenticated admin (has_role admin).
 */
serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } },
    );

    const cronSecret = Deno.env.get("CRON_SECRET") ?? "";
    const providedSecret = req.headers.get("x-cron-secret") ?? "";
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
    const authHeaderRaw = req.headers.get("Authorization") ?? "";
    const bearer = authHeaderRaw.startsWith("Bearer ")
      ? authHeaderRaw.slice(7)
      : "";
    const internalAuth = req.headers.get("x-internal-auth") === "cron";
    const isCron =
      (!!cronSecret && providedSecret === cronSecret) ||
      (internalAuth && !!serviceRoleKey && bearer === serviceRoleKey);

    let manual = false;
    if (!isCron) {
      // Require admin caller.
      const authHeader = req.headers.get("Authorization");
      if (!authHeader) throw new Error("Not authorized");
      const supabaseAuth = createClient(
        Deno.env.get("SUPABASE_URL") ?? "",
        Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      );
      const token = authHeader.replace("Bearer ", "");
      const { data: userData, error: userErr } =
        await supabaseAuth.auth.getUser(token);
      if (userErr || !userData.user) throw new Error("Not authenticated");
      const { data: isAdmin } = await supabaseAdmin.rpc("has_role", {
        _user_id: userData.user.id,
        _role: "admin",
      });
      if (!isAdmin) throw new Error("Admin role required");
      manual = true;
    }

    const today = new Date().toISOString().slice(0, 10);
    const { data: rows, error } = await supabaseAdmin
      .from("bookings")
      .select(
        "id,renter_name,pickup_date,dropoff_date,created_at,updated_at,agency_id,agencies(agency_name,email)",
      )
      .eq("booking_status", "pending_agency")
      .lt("pickup_date", today)
      .order("pickup_date", { ascending: true });
    if (error) throw new Error(`Query failed: ${error.message}`);

    // Signature: no action ever taken → updated_at == created_at.
    const stuck = (rows ?? []).filter(
      (r) => r.updated_at === r.created_at,
    ) as unknown as StuckRow[];

    log("stuck count", { count: stuck.length, manual, isCron });

    // Weekly cron with zero stuck: skip sending to avoid inbox noise.
    if (!manual && stuck.length === 0) {
      return new Response(
        JSON.stringify({ ok: true, count: 0, emailed: false, mode: "cron-skip" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 },
      );
    }

    // Group by agency.
    const byAgency = new Map<string, { name: string; items: StuckRow[] }>();
    for (const r of stuck) {
      const key = r.agency_id;
      const name = r.agencies?.agency_name || "Unknown agency";
      if (!byAgency.has(key)) byAgency.set(key, { name, items: [] });
      byAgency.get(key)!.items.push(r);
    }

    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    const adminEmail =
      Deno.env.get("ADMIN_NOTIFICATION_EMAIL") || "silverpathseniorservices@gmail.com";
    if (!resendApiKey) throw new Error("RESEND_API_KEY is not set");

    const subject =
      stuck.length === 0
        ? "Zuvio ops · Stuck bookings report — all clear"
        : `Zuvio ops · ${stuck.length} stuck booking${stuck.length === 1 ? "" : "s"} across ${byAgency.size} agenc${byAgency.size === 1 ? "y" : "ies"}`;

    let bodyHtml = `
      <div style="font-family:Arial,sans-serif;color:#111;max-width:720px;margin:0 auto;padding:16px;">
        <h2 style="margin:0 0 8px 0;">Stuck bookings report</h2>
        <p style="color:#555;margin:0 0 16px 0;">
          Definition: <code>booking_status = pending_agency</code>, <code>pickup_date &lt; today</code>,
          and <code>updated_at == created_at</code> (no action ever taken).
          Generated ${escapeHtml(new Date().toUTCString())}${manual ? " (manual run)" : " (weekly cron)"}.
        </p>`;

    if (stuck.length === 0) {
      bodyHtml += `<p style="padding:12px;background:#ecfdf5;border:1px solid #a7f3d0;border-radius:8px;">
        ✅ All clear — no stuck bookings this week.
      </p>`;
    } else {
      for (const [, group] of byAgency) {
        bodyHtml += `
          <h3 style="margin:20px 0 6px 0;border-bottom:1px solid #e5e7eb;padding-bottom:4px;">
            ${escapeHtml(group.name)} <span style="color:#888;font-weight:normal;">(${group.items.length})</span>
          </h3>
          <table style="width:100%;border-collapse:collapse;font-size:13px;">
            <thead>
              <tr style="background:#f3f4f6;text-align:left;">
                <th style="padding:6px 8px;border:1px solid #e5e7eb;">Booking ID</th>
                <th style="padding:6px 8px;border:1px solid #e5e7eb;">Renter</th>
                <th style="padding:6px 8px;border:1px solid #e5e7eb;">Pickup date</th>
                <th style="padding:6px 8px;border:1px solid #e5e7eb;">Days stuck</th>
              </tr>
            </thead>
            <tbody>`;
        for (const b of group.items) {
          bodyHtml += `
              <tr>
                <td style="padding:6px 8px;border:1px solid #e5e7eb;font-family:monospace;">${escapeHtml(b.id)}</td>
                <td style="padding:6px 8px;border:1px solid #e5e7eb;">${escapeHtml(b.renter_name)}</td>
                <td style="padding:6px 8px;border:1px solid #e5e7eb;">${escapeHtml(b.pickup_date)}</td>
                <td style="padding:6px 8px;border:1px solid #e5e7eb;">${daysSince(b.created_at)}</td>
              </tr>`;
        }
        bodyHtml += `</tbody></table>`;
      }
      bodyHtml += `<p style="color:#555;margin-top:16px;font-size:12px;">
        Resolve via Admin → Agency detail (Decline button) or ask Lovable to call
        <code>admin-resolve-stuck-bookings</code>.
      </p>`;
    }
    bodyHtml += `</div>`;

    const resendRes = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "Zuvio Ops <team@zuvio.us>",
        to: [adminEmail],
        subject,
        html: bodyHtml,
      }),
    });
    const resendData = await resendRes.json();
    if (!resendRes.ok) {
      log("Resend error", resendData);
      throw new Error(`Resend failed: ${JSON.stringify(resendData)}`);
    }
    log("email sent", { to: adminEmail, id: resendData?.id });

    return new Response(
      JSON.stringify({
        ok: true,
        count: stuck.length,
        agencies: byAgency.size,
        emailed: true,
        recipient: adminEmail,
        resend_id: resendData?.id ?? null,
        mode: manual ? "manual" : "cron",
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 },
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    log("ERROR", { message });
    return new Response(JSON.stringify({ error: message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});