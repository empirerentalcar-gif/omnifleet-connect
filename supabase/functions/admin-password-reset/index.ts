import { createClient } from "npm:@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-cron-secret",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const TARGET_EMAIL = "silverpathseniorservices@gmail.com";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const cronSecret = Deno.env.get("CRON_SECRET");
    const suppliedSecret = req.headers.get("x-cron-secret");
    if (!cronSecret || suppliedSecret !== cronSecret) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { password } = await req.json().catch(() => ({}));
    if (typeof password !== "string" || password.length < 16 || password.length > 128) {
      return new Response(JSON.stringify({ error: "Password must be 16-128 characters" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const admin = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    let targetUserId: string | null = null;
    for (let page = 1; page <= 20 && !targetUserId; page += 1) {
      const { data, error } = await admin.auth.admin.listUsers({ page, perPage: 1000 });
      if (error) throw error;
      targetUserId = data.users.find((user) => user.email?.toLowerCase() === TARGET_EMAIL)?.id ?? null;
      if (data.users.length < 1000) break;
    }

    if (!targetUserId) {
      return new Response(JSON.stringify({ error: "Admin account not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { error: updateError } = await admin.auth.admin.updateUserById(targetUserId, {
      password,
      email_confirm: true,
    });
    if (updateError) throw updateError;

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("[admin-password-reset] failed", err);
    return new Response(JSON.stringify({ error: "Password reset failed" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});