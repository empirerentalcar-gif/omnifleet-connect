// Shared types, defaults, merge logic, and price-breakdown calculator for
// agency-level and per-vehicle Payment Methods & Fee Settings.

export type PaymentMethodKey =
  | "cash"
  | "debit_card"
  | "venmo"
  | "zelle"
  | "cash_app"
  | "prepaid_card"
  | "apple_pay"
  | "google_pay"
  | "money_order"
  | "other";

export const PAYMENT_METHOD_OPTIONS: { key: PaymentMethodKey; label: string; emoji: string }[] = [
  { key: "cash", label: "Cash", emoji: "💵" },
  { key: "debit_card", label: "Debit Card", emoji: "💳" },
  { key: "venmo", label: "Venmo", emoji: "📱" },
  { key: "zelle", label: "Zelle", emoji: "⚡" },
  { key: "cash_app", label: "Cash App", emoji: "💚" },
  { key: "prepaid_card", label: "Prepaid Card", emoji: "🟦" },
  { key: "apple_pay", label: "Apple Pay", emoji: "🍎" },
  { key: "google_pay", label: "Google Pay", emoji: "🔵" },
  { key: "money_order", label: "Money Order", emoji: "📬" },
  { key: "other", label: "Other", emoji: "✳️" },
];

// Credit-card-only methods. If a renter sees ANY non-credit method, payment
// restriction notes are shown.
export const NON_CREDIT_METHODS: PaymentMethodKey[] = [
  "cash",
  "debit_card",
  "venmo",
  "zelle",
  "cash_app",
  "prepaid_card",
  "money_order",
  "other",
];

export type DepositCollectionMethod =
  | "same_as_rental"
  | "cash_only"
  | "zelle_only"
  | "card_hold_only";

export const DEPOSIT_COLLECTION_OPTIONS: { value: DepositCollectionMethod; label: string }[] = [
  { value: "same_as_rental", label: "Same as Rental Payment" },
  { value: "cash_only", label: "Cash Only" },
  { value: "zelle_only", label: "Zelle Only" },
  { value: "card_hold_only", label: "Debit or Credit Card Authorization Hold Only" },
];

export type FeeFrequency =
  | "per_rental"
  | "per_day"
  | "per_hour"
  | "per_trip";

export type FeeKey =
  | "security_deposit"
  | "airport_fee"
  | "additional_driver"
  | "young_driver"
  | "late_return"
  | "cleaning"
  | "fuel"
  | "toll"
  | "insurance";

export type FeeDef = {
  key: FeeKey;
  label: string;
  // human-friendly unit description shown in form & summary
  unit: string;
  frequency: FeeFrequency;
  hasCollectionMethod?: boolean;
  refundable?: boolean;
};

export const FEE_DEFINITIONS: FeeDef[] = [
  { key: "security_deposit",  label: "Security Deposit",          unit: "refundable",      frequency: "per_rental", hasCollectionMethod: true, refundable: true },
  { key: "airport_fee",       label: "Airport Pickup/Drop-off",   unit: "per trip",         frequency: "per_trip" },
  { key: "additional_driver", label: "Additional Driver Fee",     unit: "per day",          frequency: "per_day" },
  { key: "young_driver",      label: "Young Driver Fee (under 25)", unit: "per day",        frequency: "per_day" },
  { key: "late_return",       label: "Late Return Fee",           unit: "per hour",         frequency: "per_hour" },
  { key: "cleaning",          label: "Cleaning Fee",              unit: "per rental",       frequency: "per_rental" },
  { key: "fuel",              label: "Fuel/Gas Policy Fee",       unit: "per rental",       frequency: "per_rental" },
  { key: "toll",              label: "Toll Package Fee",          unit: "per day",          frequency: "per_day" },
  { key: "insurance",         label: "Insurance/Damage Waiver",   unit: "per day",          frequency: "per_day" },
];

export type FeeState = {
  enabled: boolean;
  amount: number;
  collection_method?: DepositCollectionMethod;
};

export type CustomFee = {
  label: string;
  amount: number;
  frequency: "per_rental" | "per_day";
};

export type PaymentSettings = {
  payment_methods: PaymentMethodKey[];
  other_payment_text: string;
  payment_restrictions: string;
  tax_rate: number; // percent, e.g. 8.25
  fees: Partial<Record<FeeKey, FeeState>>;
  custom_fees: CustomFee[];
};

export const MAX_CUSTOM_FEES = 3;

export const emptyPaymentSettings = (): PaymentSettings => ({
  payment_methods: [],
  other_payment_text: "",
  payment_restrictions: "",
  tax_rate: 0,
  fees: Object.fromEntries(
    FEE_DEFINITIONS.map((f) => [
      f.key,
      f.hasCollectionMethod
        ? { enabled: false, amount: 0, collection_method: "same_as_rental" as DepositCollectionMethod }
        : { enabled: false, amount: 0 },
    ]),
  ) as Partial<Record<FeeKey, FeeState>>,
  custom_fees: [],
});

// Coerce any stored JSONB blob into a well-formed PaymentSettings object.
export const normalizePaymentSettings = (raw: unknown): PaymentSettings => {
  const base = emptyPaymentSettings();
  if (!raw || typeof raw !== "object") return base;
  const r = raw as Partial<PaymentSettings>;
  const out: PaymentSettings = {
    payment_methods: Array.isArray(r.payment_methods)
      ? (r.payment_methods.filter((m) => typeof m === "string") as PaymentMethodKey[])
      : [],
    other_payment_text: typeof r.other_payment_text === "string" ? r.other_payment_text : "",
    payment_restrictions: typeof r.payment_restrictions === "string" ? r.payment_restrictions : "",
    tax_rate: typeof r.tax_rate === "number" && isFinite(r.tax_rate) ? r.tax_rate : 0,
    fees: { ...base.fees },
    custom_fees: Array.isArray(r.custom_fees)
      ? r.custom_fees
          .filter((c): c is CustomFee => !!c && typeof (c as CustomFee).label === "string")
          .slice(0, MAX_CUSTOM_FEES)
          .map((c) => ({
            label: String(c.label).slice(0, 60),
            amount: Number(c.amount) || 0,
            frequency: c.frequency === "per_day" ? "per_day" : "per_rental",
          }))
      : [],
  };
  if (r.fees && typeof r.fees === "object") {
    for (const def of FEE_DEFINITIONS) {
      const existing = (r.fees as Record<string, FeeState>)[def.key];
      if (existing && typeof existing === "object") {
        out.fees[def.key] = {
          enabled: !!existing.enabled,
          amount: Number(existing.amount) || 0,
          ...(def.hasCollectionMethod
            ? {
                collection_method:
                  (existing.collection_method as DepositCollectionMethod) || "same_as_rental",
              }
            : {}),
        };
      }
    }
  }
  return out;
};

// Choose vehicle-level settings if present, otherwise agency-level defaults.
export const resolveSettings = (
  vehicleSettings: unknown,
  agencySettings: unknown,
): PaymentSettings => {
  if (vehicleSettings && typeof vehicleSettings === "object" && Object.keys(vehicleSettings as object).length > 0) {
    return normalizePaymentSettings(vehicleSettings);
  }
  return normalizePaymentSettings(agencySettings);
};

// ---- Price Breakdown ----

export type BreakdownLine = {
  key: string;
  label: string;
  detail?: string;        // e.g. "$15/day × 3 days"
  amount: number;         // dollars
  refundable?: boolean;   // excluded from estimated total
  isTax?: boolean;
};

export type Breakdown = {
  lines: BreakdownLine[];
  rentalSubtotal: number;
  taxableSubtotal: number;
  taxAmount: number;
  estimatedTotal: number;
  depositAmount: number;
  depositCollection?: DepositCollectionMethod;
};

const feeAmountForDays = (frequency: FeeFrequency, amount: number, days: number): { value: number; detail?: string } => {
  switch (frequency) {
    case "per_day":
      return { value: amount * days, detail: `$${amount.toFixed(2)}/day × ${days} day${days === 1 ? "" : "s"}` };
    case "per_rental":
      return { value: amount };
    case "per_trip":
      return { value: amount, detail: "per trip" };
    case "per_hour":
      // Late return fee is only applied if a renter is late; for preview we show
      // the hourly rate but don't include it in the estimated total.
      return { value: 0, detail: `$${amount.toFixed(2)}/hr if late` };
  }
};

export const computeBreakdown = (
  dailyRate: number,
  days: number,
  settings: PaymentSettings,
): Breakdown => {
  const lines: BreakdownLine[] = [];
  const safeDays = Math.max(1, Math.floor(days || 1));
  const rentalSubtotal = dailyRate * safeDays;

  lines.push({
    key: "daily_rate",
    label: "Daily Rate",
    detail: `$${dailyRate.toFixed(2)} × ${safeDays} day${safeDays === 1 ? "" : "s"}`,
    amount: rentalSubtotal,
  });

  let depositAmount = 0;
  let depositCollection: DepositCollectionMethod | undefined;
  let taxableSubtotal = rentalSubtotal;

  for (const def of FEE_DEFINITIONS) {
    const state = settings.fees[def.key];
    if (!state || !state.enabled || !state.amount) continue;
    if (def.key === "security_deposit") {
      depositAmount = state.amount;
      depositCollection = state.collection_method;
      lines.push({
        key: def.key,
        label: def.label,
        detail: `Collected via ${depositCollectionLabel(depositCollection)} — refundable`,
        amount: depositAmount,
        refundable: true,
      });
      continue;
    }
    const { value, detail } = feeAmountForDays(def.frequency, state.amount, safeDays);
    lines.push({
      key: def.key,
      label: def.label,
      detail,
      amount: value,
    });
    taxableSubtotal += value;
  }

  for (const [i, cf] of settings.custom_fees.entries()) {
    if (!cf.label || !cf.amount) continue;
    const value = cf.frequency === "per_day" ? cf.amount * safeDays : cf.amount;
    lines.push({
      key: `custom_${i}`,
      label: cf.label,
      detail: cf.frequency === "per_day" ? `$${cf.amount.toFixed(2)}/day × ${safeDays}` : "per rental",
      amount: value,
    });
    taxableSubtotal += value;
  }

  const taxRate = Math.max(0, settings.tax_rate || 0);
  const taxAmount = +((taxableSubtotal * taxRate) / 100).toFixed(2);
  if (taxRate > 0) {
    lines.push({
      key: "tax",
      label: `Tax (${taxRate}%)`,
      detail: "on non-refundable charges",
      amount: taxAmount,
      isTax: true,
    });
  }

  const estimatedTotal = +(taxableSubtotal + taxAmount).toFixed(2);

  return {
    lines,
    rentalSubtotal,
    taxableSubtotal,
    taxAmount,
    estimatedTotal,
    depositAmount,
    depositCollection,
  };
};

export const depositCollectionLabel = (m?: DepositCollectionMethod) =>
  DEPOSIT_COLLECTION_OPTIONS.find((o) => o.value === m)?.label ?? "Same as Rental Payment";

export const paymentMethodMeta = (key: PaymentMethodKey) =>
  PAYMENT_METHOD_OPTIONS.find((o) => o.key === key);

export const hasNonCreditMethod = (s: PaymentSettings) =>
  s.payment_methods.some((m) => NON_CREDIT_METHODS.includes(m));