import { Info } from "lucide-react";
import {
  FEE_DEFINITIONS,
  PAYMENT_METHOD_OPTIONS,
  depositCollectionLabel,
  hasNonCreditMethod,
  paymentMethodMeta,
  type PaymentSettings,
} from "@/lib/payment-settings";

const fmt = (n: number) => n.toLocaleString("en-US", { style: "currency", currency: "USD" });

export const AcceptedPaymentBadges = ({ settings }: { settings: PaymentSettings }) => {
  if (!settings.payment_methods.length) return null;
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wide text-white/60 mb-2">
        Accepted Payments
      </p>
      <div className="flex flex-wrap gap-2">
        {settings.payment_methods.map((m) => {
          const meta = paymentMethodMeta(m);
          if (!meta) return null;
          const label =
            m === "other" && settings.other_payment_text
              ? settings.other_payment_text
              : meta.label;
          return (
            <span
              key={m}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium"
              style={{
                backgroundColor: "rgba(45,212,191,0.12)",
                color: "#7fe7d9",
                border: "1px solid rgba(45,212,191,0.3)",
              }}
            >
              <span aria-hidden>{meta.emoji}</span> {label}
            </span>
          );
        })}
      </div>
    </div>
  );
};

export const PaymentRestrictionsCallout = ({ settings }: { settings: PaymentSettings }) => {
  if (!settings.payment_restrictions || !hasNonCreditMethod(settings)) return null;
  return (
    <div
      role="note"
      className="rounded-lg p-4 flex gap-3 items-start"
      style={{
        backgroundColor: "rgba(56,189,248,0.10)",
        border: "1px solid rgba(56,189,248,0.35)",
      }}
    >
      <Info className="h-5 w-5 mt-0.5 shrink-0" style={{ color: "#38bdf8" }} aria-hidden />
      <div className="text-sm" style={{ color: "#bfe4ff" }}>
        <p className="font-semibold mb-1" style={{ color: "#e1f3ff" }}>
          Payment Requirements
        </p>
        <p className="whitespace-pre-line">{settings.payment_restrictions}</p>
      </div>
    </div>
  );
};

export const FeeSummary = ({ settings }: { settings: PaymentSettings }) => {
  const activeFees = FEE_DEFINITIONS.filter((f) => {
    const s = settings.fees[f.key];
    return s?.enabled && s.amount > 0;
  });
  const customFees = settings.custom_fees.filter((c) => c.label && c.amount > 0);
  const hasTax = (settings.tax_rate || 0) > 0;

  if (!activeFees.length && !customFees.length && !hasTax) {
    return (
      <div>
        <h3 className="text-lg font-bold text-white mb-2">Additional Fees</h3>
        <p className="text-white/60 text-sm">No additional fees for this vehicle.</p>
      </div>
    );
  }

  return (
    <div>
      <h3 className="text-lg font-bold text-white mb-3">Additional Fees</h3>
      <ul className="space-y-2 text-sm">
        {activeFees.map((f) => {
          const s = settings.fees[f.key]!;
          return (
            <li key={f.key} className="flex justify-between gap-3 text-white/80">
              <span>
                {f.label}
                {f.key === "security_deposit" && s.collection_method && (
                  <span className="text-white/50">
                    {" "}— {depositCollectionLabel(s.collection_method)}, refundable
                  </span>
                )}
              </span>
              <span className="font-medium whitespace-nowrap">
                {fmt(s.amount)}{" "}
                <span className="text-white/50 font-normal">{f.unit !== "refundable" ? f.unit : ""}</span>
              </span>
            </li>
          );
        })}
        {customFees.map((c, i) => (
          <li key={`c${i}`} className="flex justify-between gap-3 text-white/80">
            <span>{c.label}</span>
            <span className="font-medium whitespace-nowrap">
              {fmt(c.amount)}{" "}
              <span className="text-white/50 font-normal">
                {c.frequency === "per_day" ? "per day" : "per rental"}
              </span>
            </span>
          </li>
        ))}
        {hasTax && (
          <li className="flex justify-between gap-3 text-white/80">
            <span>Local Tax</span>
            <span className="font-medium">{settings.tax_rate}%</span>
          </li>
        )}
      </ul>
    </div>
  );
};