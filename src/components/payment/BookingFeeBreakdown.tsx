import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Info, ClipboardList, ChevronDown } from "lucide-react";
import {
  computeBreakdown,
  depositCollectionLabel,
  FEE_DEFINITIONS,
  type PaymentSettings,
} from "@/lib/payment-settings";

type Props = {
  dailyRate: number;
  days: number;
  settings: PaymentSettings | null | undefined;
  pickupRequirements?: string[] | null;
  pickupInstructions?: string | null;
  className?: string;
};

const fmt = (n: number) =>
  n.toLocaleString("en-US", { style: "currency", currency: "USD" });

export const BookingFeeBreakdown = ({
  dailyRate,
  days,
  settings,
  pickupRequirements,
  pickupInstructions,
  className,
}: Props) => {
  const { t } = useTranslation();
  const [reqOpen, setReqOpen] = useState(false);

  // Fallback: cannot resolve settings → show single notice
  if (!settings) {
    return (
      <div
        className={
          "rounded-lg p-3 text-xs bg-white/5 border border-white/10 text-white/70 " +
          (className ?? "")
        }
      >
        {t("bookingBreakdown.fallback")}
      </div>
    );
  }

  const safeDays = Math.max(1, Math.floor(days || 1));
  const breakdown = computeBreakdown(dailyRate || 0, safeDays, settings);

  // Card charge today = daily rate × days only
  const cardCharge = (dailyRate || 0) * safeDays;

  // Non-deposit / non-tax fee lines (the things "Collected at Pickup")
  const pickupFeeLines = breakdown.lines.filter(
    (l) => l.key !== "daily_rate" && l.key !== "security_deposit" && l.key !== "tax",
  );
  const hasPickupFees = pickupFeeLines.length > 0;
  const taxRate = Math.max(0, settings.tax_rate || 0);
  const taxLine = breakdown.lines.find((l) => l.key === "tax");

  // Estimated pickup total = sum of pickup fees + tax (deposit excluded)
  const pickupSubtotal = pickupFeeLines.reduce((s, l) => s + l.amount, 0);
  const pickupTotal = +(pickupSubtotal + (taxLine?.amount || 0)).toFixed(2);
  const grandTotal = +(cardCharge + pickupTotal).toFixed(2);

  const depositAmount = breakdown.depositAmount;
  const depositLabel = depositCollectionLabel(breakdown.depositCollection);

  // Build context-aware notice copy
  let noticeKey: "full" | "depositOnly" | "feesOnly" | "none";
  if (depositAmount > 0 && hasPickupFees) noticeKey = "full";
  else if (depositAmount > 0) noticeKey = "depositOnly";
  else if (hasPickupFees) noticeKey = "feesOnly";
  else noticeKey = "none";

  const noticeText = (() => {
    switch (noticeKey) {
      case "full":
        return t("bookingBreakdown.notice.full", {
          deposit: fmt(depositAmount),
          method: depositLabel,
        });
      case "depositOnly":
        return t("bookingBreakdown.notice.depositOnly", {
          deposit: fmt(depositAmount),
          method: depositLabel,
        });
      case "feesOnly":
        return t("bookingBreakdown.notice.feesOnly");
      case "none":
      default:
        return t("bookingBreakdown.notice.none");
    }
  })();

  const reqList = (pickupRequirements ?? []).filter(
    (r) => typeof r === "string" && r.trim(),
  );
  const hasFreeText = !!pickupInstructions && pickupInstructions.trim().length > 0;
  const hasRequirements = reqList.length > 0 || hasFreeText;

  return (
    <div className={"space-y-3 " + (className ?? "")}>
      {/* Reservation Charge */}
      <section className="rounded-lg p-3 sm:p-4 bg-white/5 border border-white/10 text-sm text-white/85">
        <h4 className="text-xs font-semibold uppercase tracking-wide text-white/60 mb-2">
          {t("bookingBreakdown.reservationHeader")}
        </h4>
        <div className="flex items-baseline justify-between gap-2">
          <span>
            {t("bookingBreakdown.dailyRate")}:{" "}
            <span className="text-white/70">
              ${(dailyRate || 0).toFixed(2)} × {safeDays}{" "}
              {safeDays === 1 ? t("bookingBreakdown.day") : t("bookingBreakdown.days")}
            </span>
          </span>
          <span className="tabular-nums font-medium">{fmt(cardCharge)}</span>
        </div>
        <div className="border-t border-white/10 mt-2 pt-2 flex items-baseline justify-between">
          <span className="font-semibold">{t("bookingBreakdown.chargedToday")}</span>
          <span className="tabular-nums font-bold text-base">{fmt(cardCharge)}</span>
        </div>
      </section>

      {/* Collected at Pickup */}
      <section className="rounded-lg p-3 sm:p-4 bg-white/5 border border-white/10 text-sm text-white/85">
        <h4 className="text-xs font-semibold uppercase tracking-wide text-white/60 mb-2">
          {t("bookingBreakdown.pickupHeader")}
        </h4>

        {!hasPickupFees && depositAmount === 0 ? (
          <p className="text-xs text-white/60 italic">
            {t("bookingBreakdown.noPickupFees")}
          </p>
        ) : (
          <ul className="divide-y divide-white/10">
            {depositAmount > 0 && (
              <li className="flex items-baseline justify-between gap-2 py-1.5">
                <div className="flex-1 min-w-0">
                  <p>
                    {t("bookingBreakdown.securityDeposit")}
                    <span className="ml-2 text-[10px] uppercase tracking-wide text-white/50">
                      {t("bookingBreakdown.refundable")}
                    </span>
                  </p>
                  <p className="text-xs text-white/50">{depositLabel}</p>
                </div>
                <span className="tabular-nums text-white/70 italic">
                  {fmt(depositAmount)}
                </span>
              </li>
            )}
            {pickupFeeLines.map((line) => (
              <li key={line.key} className="flex items-baseline justify-between gap-2 py-1.5">
                <div className="flex-1 min-w-0">
                  <p className="truncate">{line.label}</p>
                  {line.detail && (
                    <p className="text-xs text-white/50">{line.detail}</p>
                  )}
                </div>
                <span className="tabular-nums font-medium">{fmt(line.amount)}</span>
              </li>
            ))}
            {taxLine && taxRate > 0 && (
              <li className="flex items-baseline justify-between gap-2 py-1.5">
                <span>
                  {t("bookingBreakdown.estimatedTax", { rate: taxRate })}
                </span>
                <span className="tabular-nums font-medium">{fmt(taxLine.amount)}</span>
              </li>
            )}
          </ul>
        )}

        {hasPickupFees && (
          <>
            <div className="border-t border-white/10 mt-2 pt-2 flex items-baseline justify-between">
              <span className="font-semibold">{t("bookingBreakdown.estimatedPickupTotal")}</span>
              <span className="tabular-nums font-bold">{fmt(pickupTotal)}</span>
            </div>
            {depositAmount > 0 && (
              <p className="text-[11px] text-white/50 mt-1">
                {t("bookingBreakdown.excludesDeposit")}
              </p>
            )}
          </>
        )}
      </section>

      {/* Grand Total */}
      {(hasPickupFees || depositAmount > 0) && (
        <section className="rounded-lg p-3 sm:p-4 border border-teal-400/30 bg-teal-400/5 text-sm text-white">
          <h4 className="text-xs font-semibold uppercase tracking-wide text-teal-300 mb-2">
            {t("bookingBreakdown.grandTotalHeader")}
          </h4>
          <div className="flex items-baseline justify-between gap-2">
            <span className="font-semibold">{t("bookingBreakdown.cardPlusPickup")}</span>
            <span className="tabular-nums font-bold text-lg">{fmt(grandTotal)}</span>
          </div>
        </section>
      )}

      {/* Notice */}
      <div className="rounded-lg p-3 bg-white/5 border border-white/10 flex gap-2 text-xs text-white/70">
        <Info className="h-4 w-4 text-white/60 mt-0.5 shrink-0" />
        <p>{noticeText}</p>
      </div>

      {/* Pickup Requirements reminder */}
      {hasRequirements && (
        <div className="rounded-lg p-3 bg-sky-400/5 border border-sky-400/20 text-xs text-white/85">
          <button
            type="button"
            onClick={() => setReqOpen((v) => !v)}
            className="w-full flex items-center justify-between gap-2"
          >
            <span className="flex items-center gap-1.5">
              <ClipboardList className="h-4 w-4 text-sky-300" />
              {t("bookingBreakdown.requirementsReminder")}
            </span>
            <span className="flex items-center gap-1 text-sky-300">
              {t("bookingBreakdown.seeRequirements")}
              <ChevronDown
                className={`h-3.5 w-3.5 transition-transform ${reqOpen ? "rotate-180" : ""}`}
              />
            </span>
          </button>
          {reqOpen && (
            <div className="mt-2 space-y-1.5 text-white/75">
              {reqList.length > 0 && (
                <ul className="list-disc pl-5 space-y-0.5">
                  {reqList.map((r, i) => (
                    <li key={i}>{r}</li>
                  ))}
                </ul>
              )}
              {hasFreeText && (
                <p className="whitespace-pre-line border-t border-white/10 pt-1.5">
                  {pickupInstructions}
                </p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default BookingFeeBreakdown;