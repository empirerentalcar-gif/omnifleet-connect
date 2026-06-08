import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Banknote,
  CreditCard,
  Smartphone,
  Zap,
  DollarSign,
  WalletCards,
  Apple,
  Mail,
  HelpCircle,
  ChevronDown,
  Info,
  Lock,
  ClipboardList,
  type LucideIcon,
} from "lucide-react";
import {
  FEE_DEFINITIONS,
  type PaymentSettings,
  type PaymentMethodKey,
  type FeeFrequency,
} from "@/lib/payment-settings";

const fmtUsd = (n: number) =>
  n.toLocaleString("en-US", { style: "currency", currency: "USD" });

// Cash-forward methods get the green tint per scope.
const GREEN_METHODS: PaymentMethodKey[] = ["cash", "venmo", "zelle", "cash_app"];

const METHOD_ICONS: Record<PaymentMethodKey, LucideIcon> = {
  cash: Banknote,
  debit_card: CreditCard,
  venmo: Smartphone,
  zelle: Zap,
  cash_app: DollarSign,
  prepaid_card: WalletCards,
  apple_pay: Apple,
  google_pay: Smartphone,
  money_order: Mail,
  other: HelpCircle,
};

type Props = {
  settings: PaymentSettings;
  /** Pickup requirement presets (already i18n-translated or raw values). */
  pickupRequirements?: string[] | null;
  /** Optional free-text pickup instructions. */
  pickupInstructions?: string | null;
};

const frequencyKey = (f: FeeFrequency) => {
  if (f === "per_day") return "vehicle.payments.frequencyPerDay";
  if (f === "per_hour") return "vehicle.payments.frequencyPerHour";
  return "vehicle.payments.frequencyPerRental";
};

export const PublicVehiclePaymentSummary = ({
  settings,
  pickupRequirements,
  pickupInstructions,
}: Props) => {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);

  // --- Tier 1: payment badges ---
  const methods = settings.payment_methods;

  // --- Tier 1: deposit ---
  const depositState = settings.fees.security_deposit;
  const showDeposit = !!depositState?.enabled && (depositState?.amount ?? 0) > 0;

  // --- Tier 1: pickup requirements callout ---
  const reqList = (pickupRequirements ?? []).filter((r) => typeof r === "string" && r.trim());
  const hasFreeText = !!pickupInstructions && pickupInstructions.trim().length > 0;
  const showPickup = reqList.length > 0 || hasFreeText;

  // --- Tier 2: non-deposit fees ---
  const tier2Fees = FEE_DEFINITIONS.filter(
    (f) =>
      f.key !== "security_deposit" &&
      settings.fees[f.key]?.enabled &&
      (settings.fees[f.key]?.amount ?? 0) > 0,
  );
  const customFees = settings.custom_fees.filter((c) => c.label.trim() && c.amount > 0);
  const hasTax = (settings.tax_rate ?? 0) > 0;
  const hasAnyTier2 = tier2Fees.length > 0 || customFees.length > 0;

  return (
    <div className="space-y-4">
      {/* === Tier 1 === */}

      {/* Accepted Payments */}
      {methods.length > 0 && (
        <section>
          <p className="text-xs font-semibold uppercase tracking-wide text-white/60 mb-2">
            {t("vehicle.payments.accepted")}
          </p>
          <div className="flex flex-wrap gap-2">
            {methods.map((m) => {
              const Icon = METHOD_ICONS[m] ?? HelpCircle;
              const isGreen = GREEN_METHODS.includes(m);
              const label =
                m === "other" && settings.other_payment_text
                  ? settings.other_payment_text
                  : t(`vehicle.payments.method.${m}`);
              return (
                <span
                  key={m}
                  aria-label={t("vehicle.payments.ariaBadge", { method: label })}
                  className={[
                    "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border",
                    isGreen
                      ? "bg-green-900/30 text-green-300 border-green-700/40"
                      : "bg-white/5 text-white/80 border-white/15",
                  ].join(" ")}
                >
                  <Icon className="h-3.5 w-3.5" aria-hidden />
                  {label}
                </span>
              );
            })}
          </div>
        </section>
      )}

      {/* Security Deposit highlight */}
      {showDeposit && depositState && (
        <div
          role="note"
          className="flex items-start gap-2 rounded-lg px-3 py-2 text-sm bg-amber-900/30 text-amber-200 border border-amber-700/40"
        >
          <Lock className="h-4 w-4 mt-0.5 shrink-0" aria-hidden />
          <p className="break-words">
            {t("vehicle.payments.depositLine", {
              amount: fmtUsd(depositState.amount),
              method: t(
                `vehicle.payments.deposit.${depositState.collection_method ?? "same_as_rental"}`,
              ),
            })}
          </p>
        </div>
      )}

      {/* Pickup Requirements callout */}
      {showPickup && (
        <div
          role="note"
          className="rounded-lg p-4 flex gap-3 items-start bg-sky-900/25 border border-sky-700/40 text-sky-100"
        >
          <ClipboardList className="h-5 w-5 mt-0.5 shrink-0 text-sky-300" aria-hidden />
          <div className="text-sm flex-1 min-w-0">
            <p className="font-semibold mb-1.5">{t("vehicle.payments.pickupHeader")}</p>
            {reqList.length > 0 && (
              <ul className="list-disc pl-5 space-y-0.5">
                {reqList.map((r) => (
                  <li key={r}>{r}</li>
                ))}
              </ul>
            )}
            {reqList.length > 0 && hasFreeText && (
              <div className="my-2 border-t border-sky-700/40" />
            )}
            {hasFreeText && (
              <p className="whitespace-pre-line">{pickupInstructions}</p>
            )}
          </div>
        </div>
      )}

      {/* === Tier 2 — collapsible breakdown === */}
      <div className="rounded-lg border border-white/10 bg-white/[0.03]">
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          className="w-full flex items-center justify-between px-4 py-2.5 text-sm font-medium text-white/80 hover:text-white"
        >
          <span>
            {open
              ? t("vehicle.payments.hideBreakdown")
              : t("vehicle.payments.seeBreakdown")}
          </span>
          <ChevronDown
            className={`h-4 w-4 transition-transform ${open ? "rotate-180" : ""}`}
            aria-hidden
          />
        </button>
        {open && (
          <div className="px-4 pb-4 pt-1 space-y-2 text-sm">
            {!hasAnyTier2 && !hasTax && (
              <p className="text-white/60">{t("vehicle.payments.noFees")}</p>
            )}

            {(hasAnyTier2 || hasTax) && (
              <ul className="space-y-1.5">
                {tier2Fees.map((def) => {
                  const s = settings.fees[def.key]!;
                  return (
                    <li
                      key={def.key}
                      className="flex justify-between gap-3 items-center text-white/80"
                    >
                      <span className="flex items-center gap-1.5 flex-wrap">
                        {t(`vehicle.payments.fee.${def.key}`)}
                        {s.taxable && (
                          <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-white/10 text-white/70 uppercase tracking-wide">
                            {t("vehicle.payments.taxableBadge")}
                          </span>
                        )}
                      </span>
                      <span className="font-medium whitespace-nowrap">
                        {fmtUsd(s.amount)}{" "}
                        <span className="text-white/50 font-normal">
                          {t(frequencyKey(def.frequency))}
                        </span>
                      </span>
                    </li>
                  );
                })}
                {customFees.map((c, i) => (
                  <li
                    key={`c${i}`}
                    className="flex justify-between gap-3 items-center text-white/80"
                  >
                    <span className="flex items-center gap-1.5 flex-wrap">
                      {c.label}
                      <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-white/10 text-white/70 uppercase tracking-wide">
                        {t("vehicle.payments.taxableBadge")}
                      </span>
                    </span>
                    <span className="font-medium whitespace-nowrap">
                      {fmtUsd(c.amount)}{" "}
                      <span className="text-white/50 font-normal">
                        {t(
                          c.frequency === "per_day"
                            ? "vehicle.payments.frequencyPerDay"
                            : "vehicle.payments.frequencyPerRental",
                        )}
                      </span>
                    </span>
                  </li>
                ))}
                {hasTax && (
                  <li className="flex justify-between gap-3 text-white/70 pt-1 border-t border-white/10">
                    <span className="flex items-center gap-1.5">
                      <Info className="h-3.5 w-3.5" aria-hidden />
                      {t("vehicle.payments.estimatedTax", { rate: settings.tax_rate })}
                    </span>
                  </li>
                )}
              </ul>
            )}

            <p className="text-xs text-white/55 pt-2 border-t border-white/10">
              {t("vehicle.payments.bottomNote")}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PublicVehiclePaymentSummary;