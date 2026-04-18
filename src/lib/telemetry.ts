// Lightweight client-side telemetry for vehicle fetch issues.
// Logs structured events to the console and forwards them to Google Analytics
// (when gtag is available) so cross-browser issues are easier to trace.

import { trackEvent } from "./analytics";

type TelemetryContext = Record<string, string | number | boolean | null | undefined>;

const browserInfo = () => {
  if (typeof navigator === "undefined") return {};
  const ua = navigator.userAgent || "";
  let platform = "unknown";
  if (/Windows/i.test(ua)) platform = "windows";
  else if (/Mac/i.test(ua)) platform = "mac";
  else if (/Android/i.test(ua)) platform = "android";
  else if (/iPhone|iPad|iPod/i.test(ua)) platform = "ios";
  else if (/Linux/i.test(ua)) platform = "linux";

  let browser = "unknown";
  if (/Edg\//i.test(ua)) browser = "edge";
  else if (/Chrome\//i.test(ua)) browser = "chrome";
  else if (/Safari\//i.test(ua)) browser = "safari";
  else if (/Firefox\//i.test(ua)) browser = "firefox";

  return { platform, browser };
};

const sanitize = (ctx: TelemetryContext = {}): Record<string, string | number> => {
  const out: Record<string, string | number> = {};
  for (const [k, v] of Object.entries(ctx)) {
    if (v === null || v === undefined) continue;
    if (typeof v === "boolean") out[k] = v ? 1 : 0;
    else out[k] = v;
  }
  return out;
};

/**
 * Log a vehicle fetch failure (Supabase error or thrown exception).
 */
export const logVehicleFetchFailure = (
  page: string,
  reason: string,
  context: TelemetryContext = {}
) => {
  const info = browserInfo();
  // eslint-disable-next-line no-console
  console.error(`[telemetry][${page}] vehicle_fetch_failure`, { reason, ...info, ...context });
  trackEvent("vehicle_fetch_failure", sanitize({
    event_category: "data_health",
    page,
    reason: reason.slice(0, 100),
    ...info,
    ...context,
  }));
};

/**
 * Log when a vehicle fetch returned no rows (helps catch empty-result regressions).
 */
export const logVehicleFetchEmpty = (
  page: string,
  context: TelemetryContext = {}
) => {
  const info = browserInfo();
  // eslint-disable-next-line no-console
  console.warn(`[telemetry][${page}] vehicle_fetch_empty`, { ...info, ...context });
  trackEvent("vehicle_fetch_empty", sanitize({
    event_category: "data_health",
    page,
    ...info,
    ...context,
  }));
};
