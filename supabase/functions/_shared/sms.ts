/**
 * Shared SMS helper. Sends text messages through the Twilio connector gateway.
 *
 * Required secrets:
 *   LOVABLE_API_KEY     - gateway auth (already present)
 *   TWILIO_API_KEY      - connection key created when Twilio is linked
 *   TWILIO_FROM_NUMBER  - the Twilio number texts are sent from (E.164)
 *   ALERT_SMS_TO        - comma-separated E.164 recipients for ops alerts
 *
 * Never throws: SMS is an add-on to email, so a failure here must never break
 * a booking, payment, or cron run.
 */
const GATEWAY_URL = "https://connector-gateway.lovable.dev/twilio";

export function alertRecipients(): string[] {
  return (Deno.env.get("ALERT_SMS_TO") ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter((s) => /^\+[1-9]\d{6,14}$/.test(s));
}

export async function sendSms(to: string, body: string): Promise<{ ok: boolean; detail?: string }> {
  const lovableKey = Deno.env.get("LOVABLE_API_KEY");
  const twilioKey = Deno.env.get("TWILIO_API_KEY");
  const from = Deno.env.get("TWILIO_FROM_NUMBER");

  if (!lovableKey || !twilioKey || !from) {
    console.log("[SMS] skipped: Twilio not configured", {
      has_lovable_key: !!lovableKey, has_twilio_key: !!twilioKey, has_from: !!from,
    });
    return { ok: false, detail: "not_configured" };
  }

  try {
    const res = await fetch(`${GATEWAY_URL}/Messages.json`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${lovableKey}`,
        "X-Connection-Api-Key": twilioKey,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({ To: to, From: from, Body: body.slice(0, 1500) }),
    });
    const text = await res.text();
    if (!res.ok) {
      console.error(`[SMS] send failed [${res.status}]: ${text}`);
      return { ok: false, detail: `${res.status}: ${text}` };
    }
    console.log("[SMS] sent", { to });
    return { ok: true };
  } catch (e) {
    console.error("[SMS] error", (e as Error).message);
    return { ok: false, detail: (e as Error).message };
  }
}

/** Fan out one message to every configured ops recipient. */
export async function sendOpsSms(body: string): Promise<number> {
  const tos = alertRecipients();
  if (tos.length === 0) {
    console.log("[SMS] skipped: ALERT_SMS_TO not set or invalid");
    return 0;
  }
  const results = await Promise.all(tos.map((to) => sendSms(to, body)));
  return results.filter((r) => r.ok).length;
}

export function fmtDay(s?: string | null): string {
  if (!s) return "n/a";
  const d = new Date(s);
  if (isNaN(d.getTime())) return String(s);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}
