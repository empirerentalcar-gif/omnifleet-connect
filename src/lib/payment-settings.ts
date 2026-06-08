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
  | "per_hour";

export type FeeKey =
  | "security_deposit"
  | "cleaning_fee"
  | "late_return_fee"
  | "fuel_refueling_fee"
  | "smoking_fee"
  | "mileage_overage_fee"
  | "toll_pass_fee"
  | "young_driver_fee"
  | "additional_driver_fee"
  | "airport_fee"
  | "insurance_damage_waiver_fee";

export type FeeDef = {
  key: FeeKey;
  label: string;
  unit: string;
  frequency: FeeFrequency;
  hasCollectionMethod?: boolean;
  hasIncludedMiles?: boolean;
  refundable?: boolean;
};

export const FEE_DEFINITIONS: FeeDef[] = [
  { key: "security_deposit", label: "Security Deposit", unit: "refundable", frequency: "per_rental", hasCollectionMethod: true, refundable: true },
  { key: "cleaning_fee", label: "Cleaning Fee", unit: "per rental", frequency: "per_rental" },
  { key: "late_return_fee", label: "Late Return Fee", unit: "per hour", frequency: "per_hour" },
  { key: "fuel_refueling_fee", label: "Fuel/Refueling Fee", unit: "per rental", frequency: "per_rental" },
  { key: "smoking_fee", label: "Smoking Fee", unit: "per rental", frequency: "per_rental" },
  { key: "mileage_overage_fee", label: "Mileage Overage Fee", unit: "per mile over included", frequency: "per_day", hasIncludedMiles: true },
  { key: "toll_pass_fee", label: "Toll Pass Fee", unit: "per day", frequency: "per_day" },
  { key: "young_driver_fee", label: "Young Driver Fee (under 25)", unit: "per day", frequency: "per_day" },
  { key: "additional_driver_fee", label: "Additional Driver Fee", unit: "per day", frequency: "per_day" },
  { key: "airport_fee", label: "Airport Pickup/Drop-off Fee", unit: "per rental", frequency: "per_rental" },
  { key: "insurance_damage_waiver_fee", label: "Insurance/Damage Waiver Fee", unit: "per day", frequency: "per_day" },
];

export type FeeState = {
  enabled: boolean;
  amount: number;
  taxable: boolean;
  collection_method?: DepositCollectionMethod;
  included_miles_per_day?: number;
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
export const MAX_RESTRICTIONS_LENGTH = 500;
export const MAX_CUSTOM_FEE_LABEL_LENGTH = 40;
export const MAX_DEPOSIT_AMOUNT = 5000;
export const MAX_FEE_AMOUNT = 9999;
export const MAX_TAX_RATE = 100;

const defaultFeeState = (def: FeeDef): FeeState => {
  const base: FeeState = { enabled: false, amount: 0, taxable: false };
  if (def.hasCollectionMethod) base.collection_method = "same_as_rental";
  if (def.hasIncludedMiles) base.included_miles_per_day = 0;
  return base;
};

export const emptyPaymentSettings = (): PaymentSettings => ({
  payment_methods: [],
  other_payment_text: "",
  payment_restrictions: "",
  tax_rate: 0,
  fees: Object.fromEntries(FEE_DEFINITIONS.map((f) => [f.key, defaultFeeState(f)])) as Partial<Record<FeeKey, FeeState>>,
  custom_fees: [],
});

// Validate a PaymentSettings object client-side. Returns array of error messages.
export const validatePaymentSettings = (s: PaymentSettings): string[] => {
  const errs: string[] = [];
  if (s.payment_methods.length === 0) errs.push("Select at least one accepted payment method.");
  if (s.payment_methods.includes("other") && !s.other_payment_text.trim()) errs.push("Please specify the 'Other' payment method.");
  if (s.payment_restrictions && s.payment_restrictions.length > MAX_RESTRICTIONS_LENGTH) errs.push(`Payment restrictions must be ${MAX_RESTRICTIONS_LENGTH} characters or fewer.`);
  if (s.tax_rate < 0 || s.tax_rate > MAX_TAX_RATE) errs.push("Tax rate must be between 0 and 100.");

  for (const def of FEE_DEFINITIONS) {
    const state = s.fees[def.key];
    if (!state || !state.enabled) continue;
    if (def.key === "security_deposit") {
      if (state.amount < 0 || state.amount > MAX_DEPOSIT_AMOUNT) errs.push("Security deposits are capped at $5,000. For higher deposits, please contact renters directly.");
    } else {
      if (state.amount < 0 || state.amount > MAX_FEE_AMOUNT) errs.push("Fee amounts must be between $0 and $9,999.");
    }
    if (def.hasIncludedMiles && (state.included_miles_per_day === undefined || state.included_miles_per_day < 0 || state.included_miles_per_day > MAX_FEE_AMOUNT)) {
      errs.push("Included miles per day must be between 0 and 9,999.");
    }
  }

  if (s.custom_fees.length > MAX_CUSTOM_FEES) errs.push(`Only up to ${MAX_CUSTOM_FEES} custom fees are allowed.`);
  for (const cf of s.custom_fees) {
    if (!cf.label.trim()) errs.push("All custom fees must have a label.");
    if (cf.label.length > MAX_CUSTOM_FEE_LABEL_LENGTH) errs.push(`Custom fee labels must be ${MAX_CUSTOM_FEE_LABEL_LENGTH} characters or fewer.`);
    if (cf.amount < 0 || cf.amount > MAX_FEE_AMOUNT) errs.push("Custom fee amounts must be between $0 and $9,999.");
  }

  return errs;
};

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
            label: String(c.label).slice(0, MAX_CUSTOM_FEE_LABEL_LENGTH),
            amount: Number(c.amount) || 0,
            frequency: c.frequency === "per_day" ? "per_day" : "per_rental",
          }))
      : [],
  };
  if (r.fees && typeof r.fees === "object") {
    for (const def of FEE_DEFINITIONS) {
      const existing = (r.fees as Record<string, FeeState>)[def.key];
      if (existing && typeof existing === "object") {
        const state: FeeState = {
          enabled: !!existing.enabled,
          amount: Number(existing.amount) || 0,
          taxable: !!existing.taxable,
        };
        if (def.hasCollectionMethod) {
          state.collection_method = (existing.collection_method as DepositCollectionMethod) || "same_as_rental";
        }
        if (def.hasIncludedMiles) {
          state.included_miles_per_day = Number(existing.included_miles_per_day) || 0;
        }
        out.fees[def.key] = state;
      }
    }
  }
  return out;
};

// Convert PaymentSettings to DB JSONB shapes
export const toDbPaymentMethods = (s: PaymentSettings): { methods: PaymentMethodKey[]; other_text?: string } => {
  const methods = [...s.payment_methods];
  return { methods, other_text: methods.includes("other") ? s.other_payment_text : undefined };
};

export const fromDbPaymentMethods = (methods: unknown, otherText?: string | null): PaymentMethodKey[] => {
  const arr = Array.isArray(methods) ? methods.filter((m): m is string => typeof m === "string") : [];
  return arr as PaymentMethodKey[];
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
  detail?: string; // e.g. "$15/day × 3 days"
  amount: number; // dollars
  refundable?: boolean; // excluded from estimated total
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
    case "per_hour":
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
    if (state.taxable) taxableSubtotal += value;
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
    // Custom fees are always taxable in the breakdown
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

// ---- Vehicle-level overrides ----
// Each top-level key may be null, meaning "inherit the agency default for this row".
// `fees` is a partial map — only overridden fee keys are present; missing keys inherit.
export type VehicleOverrides = {
  payment_methods: { methods: PaymentMethodKey[]; other_text: string } | null;
  payment_restrictions: string | null;
  tax_rate: number | null;
  fees: Partial<Record<FeeKey, FeeState>>;
  custom_fees: CustomFee[] | null;
};

export const emptyVehicleOverrides = (): VehicleOverrides => ({
  payment_methods: null,
  payment_restrictions: null,
  tax_rate: null,
  fees: {},
  custom_fees: null,
});

export const normalizeVehicleOverrides = (raw: {
  payment_methods_override?: unknown;
  payment_restrictions_override?: unknown;
  tax_rate_override?: unknown;
  fee_settings_override?: unknown;
  custom_fees_override?: unknown;
}): VehicleOverrides => {
  const base = emptyVehicleOverrides();

  // payment_methods_override may be array or { methods, other_text }
  if (Array.isArray(raw.payment_methods_override)) {
    base.payment_methods = {
      methods: (raw.payment_methods_override as unknown[]).filter(
        (m): m is string => typeof m === "string",
      ) as PaymentMethodKey[],
      other_text: "",
    };
  } else if (raw.payment_methods_override && typeof raw.payment_methods_override === "object") {
    const o = raw.payment_methods_override as Record<string, unknown>;
    base.payment_methods = {
      methods: Array.isArray(o.methods)
        ? ((o.methods as unknown[]).filter((m): m is string => typeof m === "string") as PaymentMethodKey[])
        : [],
      other_text: typeof o.other_text === "string" ? o.other_text : "",
    };
  }

  if (typeof raw.payment_restrictions_override === "string") {
    base.payment_restrictions = raw.payment_restrictions_override;
  }

  if (typeof raw.tax_rate_override === "number" && isFinite(raw.tax_rate_override)) {
    base.tax_rate = raw.tax_rate_override;
  } else if (typeof raw.tax_rate_override === "string" && raw.tax_rate_override !== "") {
    const n = Number(raw.tax_rate_override);
    if (isFinite(n)) base.tax_rate = n;
  }

  if (raw.fee_settings_override && typeof raw.fee_settings_override === "object") {
    const src = raw.fee_settings_override as Record<string, FeeState>;
    for (const def of FEE_DEFINITIONS) {
      const existing = src[def.key];
      if (existing && typeof existing === "object") {
        const state: FeeState = {
          enabled: !!existing.enabled,
          amount: Number(existing.amount) || 0,
          taxable: !!existing.taxable,
        };
        if (def.hasCollectionMethod) {
          state.collection_method =
            (existing.collection_method as DepositCollectionMethod) || "same_as_rental";
        }
        if (def.hasIncludedMiles) {
          state.included_miles_per_day = Number(existing.included_miles_per_day) || 0;
        }
        base.fees[def.key] = state;
      }
    }
  }

  if (Array.isArray(raw.custom_fees_override)) {
    base.custom_fees = (raw.custom_fees_override as unknown[])
      .filter((c): c is CustomFee => !!c && typeof (c as CustomFee).label === "string")
      .slice(0, MAX_CUSTOM_FEES)
      .map((c) => ({
        label: String(c.label).slice(0, MAX_CUSTOM_FEE_LABEL_LENGTH),
        amount: Number(c.amount) || 0,
        frequency: c.frequency === "per_day" ? "per_day" : "per_rental",
      }));
  }

  return base;
};

// Merge agency defaults with vehicle overrides into the resolved effective settings.
export const mergeAgencyWithOverrides = (
  agency: PaymentSettings,
  overrides: VehicleOverrides,
): PaymentSettings => {
  const fees: PaymentSettings["fees"] = { ...agency.fees };
  for (const def of FEE_DEFINITIONS) {
    if (overrides.fees[def.key]) fees[def.key] = overrides.fees[def.key]!;
  }
  return {
    payment_methods: overrides.payment_methods?.methods ?? agency.payment_methods,
    other_payment_text:
      overrides.payment_methods?.other_text ?? agency.other_payment_text,
    payment_restrictions:
      overrides.payment_restrictions ?? agency.payment_restrictions,
    tax_rate: overrides.tax_rate ?? agency.tax_rate,
    fees,
    custom_fees: overrides.custom_fees ?? agency.custom_fees,
  };
};

// Validate vehicle overrides against the same client-side limits as agency settings.
export const validateVehicleOverrides = (o: VehicleOverrides): string[] => {
  const errs: string[] = [];
  if (o.payment_methods) {
    if (o.payment_methods.methods.length === 0)
      errs.push("Select at least one accepted payment method for this vehicle.");
    if (
      o.payment_methods.methods.includes("other") &&
      !o.payment_methods.other_text.trim()
    )
      errs.push("Please specify the 'Other' payment method.");
  }
  if (o.payment_restrictions && o.payment_restrictions.length > MAX_RESTRICTIONS_LENGTH)
    errs.push(`Payment restrictions must be ${MAX_RESTRICTIONS_LENGTH} characters or fewer.`);
  if (o.tax_rate !== null && (o.tax_rate < 0 || o.tax_rate > MAX_TAX_RATE))
    errs.push("Tax rate must be between 0 and 100.");
  for (const def of FEE_DEFINITIONS) {
    const s = o.fees[def.key];
    if (!s || !s.enabled) continue;
    if (def.key === "security_deposit") {
      if (s.amount < 0 || s.amount > MAX_DEPOSIT_AMOUNT)
        errs.push("Security deposits are capped at $5,000.");
    } else if (s.amount < 0 || s.amount > MAX_FEE_AMOUNT) {
      errs.push("Fee amounts must be between $0 and $9,999.");
    }
    if (
      def.hasIncludedMiles &&
      (s.included_miles_per_day === undefined ||
        s.included_miles_per_day < 0 ||
        s.included_miles_per_day > MAX_FEE_AMOUNT)
    )
      errs.push("Included miles per day must be between 0 and 9,999.");
  }
  if (o.custom_fees) {
    if (o.custom_fees.length > MAX_CUSTOM_FEES)
      errs.push(`Only up to ${MAX_CUSTOM_FEES} custom fees are allowed.`);
    for (const cf of o.custom_fees) {
      if (!cf.label.trim()) errs.push("All custom fees must have a label.");
      if (cf.label.length > MAX_CUSTOM_FEE_LABEL_LENGTH)
        errs.push(`Custom fee labels must be ${MAX_CUSTOM_FEE_LABEL_LENGTH} characters or fewer.`);
      if (cf.amount < 0 || cf.amount > MAX_FEE_AMOUNT)
        errs.push("Custom fee amounts must be between $0 and $9,999.");
    }
  }
  return errs;
};

// Convert overrides to the DB column shape (null = inherit).
export const overridesToDb = (o: VehicleOverrides) => ({
  payment_methods_override: o.payment_methods
    ? o.payment_methods.methods.includes("other") && o.payment_methods.other_text.trim()
      ? { methods: o.payment_methods.methods, other_text: o.payment_methods.other_text.trim() }
      : o.payment_methods.methods
    : null,
  payment_restrictions_override: o.payment_restrictions?.trim() || (o.payment_restrictions === null ? null : null),
  tax_rate_override: o.tax_rate,
  fee_settings_override: Object.keys(o.fees).length > 0 ? o.fees : null,
  custom_fees_override: o.custom_fees,
});
