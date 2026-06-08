import { useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Plus, Trash2, RotateCcw } from "lucide-react";
import {
  PAYMENT_METHOD_OPTIONS,
  DEPOSIT_COLLECTION_OPTIONS,
  FEE_DEFINITIONS,
  MAX_CUSTOM_FEES,
  MAX_RESTRICTIONS_LENGTH,
  MAX_CUSTOM_FEE_LABEL_LENGTH,
  MAX_DEPOSIT_AMOUNT,
  MAX_FEE_AMOUNT,
  MAX_TAX_RATE,
  emptyVehicleOverrides,
  depositCollectionLabel,
  type PaymentSettings,
  type VehicleOverrides,
  type PaymentMethodKey,
  type FeeKey,
  type FeeState,
  type CustomFee,
  type DepositCollectionMethod,
} from "@/lib/payment-settings";

type Props = {
  agencyDefaults: PaymentSettings;
  value: VehicleOverrides;
  onChange: (next: VehicleOverrides) => void;
  showValidation?: boolean;
};

const moneyInputProps = {
  type: "number" as const,
  min: 0,
  max: 9999,
  step: "0.01",
  inputMode: "decimal" as const,
};

// Render a default fee value as a short read-only summary.
const summarizeFee = (state: FeeState | undefined, def: typeof FEE_DEFINITIONS[number]) => {
  if (!state || !state.enabled) return "Not charged";
  const parts = [`$${state.amount.toFixed(2)} ${def.unit}`];
  if (def.hasCollectionMethod) parts.push(`— ${depositCollectionLabel(state.collection_method)}`);
  if (def.hasIncludedMiles) parts.push(`— ${state.included_miles_per_day ?? 0} mi/day included`);
  if (state.taxable && def.key !== "security_deposit") parts.push("— taxable");
  return parts.join(" ");
};

const InheritedTag = () => (
  <span className="text-[10px] uppercase tracking-wide font-semibold text-muted-foreground bg-secondary/50 px-1.5 py-0.5 rounded">
    Inherited
  </span>
);

const OverrideTag = () => (
  <span className="text-[10px] uppercase tracking-wide font-semibold text-primary bg-primary/10 px-1.5 py-0.5 rounded">
    Override
  </span>
);

export const VehiclePaymentOverrideForm = ({
  agencyDefaults,
  value,
  onChange,
  showValidation,
}: Props) => {
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const markTouched = (k: string) => setTouched((p) => ({ ...p, [k]: true }));

  // ---- Payment Methods ----
  const methodsOverridden = value.payment_methods !== null;
  const togglePaymentMethodsOverride = (on: boolean) =>
    onChange({
      ...value,
      payment_methods: on
        ? {
            methods: [...agencyDefaults.payment_methods],
            other_text: agencyDefaults.other_payment_text,
          }
        : null,
    });
  const setMethod = (key: PaymentMethodKey, checked: boolean) => {
    if (!value.payment_methods) return;
    const set = new Set(value.payment_methods.methods);
    checked ? set.add(key) : set.delete(key);
    onChange({
      ...value,
      payment_methods: { ...value.payment_methods, methods: Array.from(set) },
    });
  };

  // ---- Payment Restrictions ----
  const restrictionsOverridden = value.payment_restrictions !== null;
  const toggleRestrictionsOverride = (on: boolean) =>
    onChange({
      ...value,
      payment_restrictions: on ? agencyDefaults.payment_restrictions : null,
    });

  // ---- Tax Rate ----
  const taxOverridden = value.tax_rate !== null;
  const toggleTaxOverride = (on: boolean) =>
    onChange({ ...value, tax_rate: on ? agencyDefaults.tax_rate : null });

  // ---- Fees ----
  const isFeeOverridden = (k: FeeKey) => value.fees[k] !== undefined;
  const toggleFeeOverride = (k: FeeKey, on: boolean) => {
    const next = { ...value.fees };
    if (on) {
      const def = FEE_DEFINITIONS.find((f) => f.key === k)!;
      const fallback: FeeState = { enabled: false, amount: 0, taxable: false };
      if (def.hasCollectionMethod) fallback.collection_method = "same_as_rental";
      if (def.hasIncludedMiles) fallback.included_miles_per_day = 0;
      next[k] = agencyDefaults.fees[k] ? { ...agencyDefaults.fees[k]! } : fallback;
    } else {
      delete next[k];
    }
    onChange({ ...value, fees: next });
  };
  const updateFee = (k: FeeKey, patch: Partial<FeeState>) => {
    if (!value.fees[k]) return;
    onChange({
      ...value,
      fees: { ...value.fees, [k]: { ...value.fees[k]!, ...patch } },
    });
  };

  // ---- Custom Fees ----
  const customOverridden = value.custom_fees !== null;
  const toggleCustomOverride = (on: boolean) =>
    onChange({
      ...value,
      custom_fees: on ? [...agencyDefaults.custom_fees] : null,
    });
  const updateCustom = (idx: number, patch: Partial<CustomFee>) => {
    if (!value.custom_fees) return;
    const next = [...value.custom_fees];
    next[idx] = { ...next[idx], ...patch };
    onChange({ ...value, custom_fees: next });
  };
  const addCustom = () => {
    if (!value.custom_fees || value.custom_fees.length >= MAX_CUSTOM_FEES) return;
    onChange({
      ...value,
      custom_fees: [...value.custom_fees, { label: "", amount: 0, frequency: "per_rental" }],
    });
  };
  const removeCustom = (idx: number) => {
    if (!value.custom_fees) return;
    onChange({ ...value, custom_fees: value.custom_fees.filter((_, i) => i !== idx) });
  };

  const handleResetAll = () => onChange(emptyVehicleOverrides());

  const restrictionsLen = value.payment_restrictions?.length ?? 0;
  const restrictionsRemaining = MAX_RESTRICTIONS_LENGTH - restrictionsLen;
  const restrictionsNearLimit = restrictionsRemaining <= 50;

  return (
    <div className="space-y-8">
      <div className="rounded-md bg-secondary/30 border border-border px-3 py-2 text-xs text-muted-foreground">
        Your agency defaults are pre-filled below. Toggle <strong>Override</strong> on any row to
        customize it for this specific vehicle. Rows left as Inherited will follow your agency
        settings automatically — even if you change those defaults later.
      </div>

      {/* Payment Methods */}
      <section className="space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h4 className="text-sm font-semibold">Payment Methods</h4>
            {!methodsOverridden && (
              <p className="text-xs text-muted-foreground mt-0.5">
                Inheriting: {agencyDefaults.payment_methods.length
                  ? agencyDefaults.payment_methods
                      .map((m) => PAYMENT_METHOD_OPTIONS.find((o) => o.key === m)?.label ?? m)
                      .join(", ")
                  : "None selected"}
              </p>
            )}
          </div>
          <div className="flex items-center gap-2">
            {methodsOverridden ? <OverrideTag /> : <InheritedTag />}
            <Switch
              checked={methodsOverridden}
              onCheckedChange={togglePaymentMethodsOverride}
              aria-label="Override payment methods"
            />
          </div>
        </div>
        {methodsOverridden && value.payment_methods && (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {PAYMENT_METHOD_OPTIONS.map((opt) => (
                <label
                  key={opt.key}
                  className="flex items-center gap-2 rounded-md border border-border bg-secondary/30 px-3 py-2 cursor-pointer hover:bg-secondary/50"
                >
                  <Checkbox
                    checked={value.payment_methods!.methods.includes(opt.key)}
                    onCheckedChange={(c) => setMethod(opt.key, !!c)}
                    aria-label={opt.label}
                  />
                  <span className="text-sm">
                    <span className="mr-1.5">{opt.emoji}</span>
                    {opt.label}
                  </span>
                </label>
              ))}
            </div>
            {value.payment_methods.methods.includes("other") && (
              <Input
                value={value.payment_methods.other_text}
                maxLength={120}
                placeholder="Please specify"
                onChange={(e) =>
                  onChange({
                    ...value,
                    payment_methods: {
                      ...value.payment_methods!,
                      other_text: e.target.value,
                    },
                  })
                }
                onBlur={() => markTouched("methods_other")}
              />
            )}
            {showValidation && value.payment_methods.methods.length === 0 && (
              <p className="text-xs text-destructive">Select at least one method.</p>
            )}
          </>
        )}
      </section>

      {/* Payment Restrictions */}
      <section className="space-y-2">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1">
            <h4 className="text-sm font-semibold">Payment Restrictions / Instructions</h4>
            {!restrictionsOverridden && (
              <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                Inheriting:{" "}
                {agencyDefaults.payment_restrictions
                  ? `"${agencyDefaults.payment_restrictions}"`
                  : "None"}
              </p>
            )}
          </div>
          <div className="flex items-center gap-2">
            {restrictionsOverridden ? <OverrideTag /> : <InheritedTag />}
            <Switch
              checked={restrictionsOverridden}
              onCheckedChange={toggleRestrictionsOverride}
              aria-label="Override payment restrictions"
            />
          </div>
        </div>
        {restrictionsOverridden && (
          <>
            <Textarea
              value={value.payment_restrictions ?? ""}
              maxLength={MAX_RESTRICTIONS_LENGTH}
              rows={3}
              onChange={(e) => onChange({ ...value, payment_restrictions: e.target.value })}
              onBlur={() => markTouched("restrictions")}
              className={restrictionsNearLimit ? "border-orange-400 focus-visible:ring-orange-400" : ""}
            />
            <p
              className={`text-xs text-right ${
                restrictionsNearLimit ? "text-orange-500 font-medium" : "text-muted-foreground"
              }`}
            >
              {restrictionsRemaining} remaining
            </p>
          </>
        )}
      </section>

      {/* Tax */}
      <section className="space-y-2">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h4 className="text-sm font-semibold">Tax Rate</h4>
            {!taxOverridden && (
              <p className="text-xs text-muted-foreground mt-0.5">
                Inheriting: {agencyDefaults.tax_rate}%
              </p>
            )}
          </div>
          <div className="flex items-center gap-2">
            {taxOverridden ? <OverrideTag /> : <InheritedTag />}
            <Switch
              checked={taxOverridden}
              onCheckedChange={toggleTaxOverride}
              aria-label="Override tax rate"
            />
          </div>
        </div>
        {taxOverridden && (
          <div className="relative max-w-xs">
            <Input
              type="number"
              inputMode="decimal"
              min={0}
              max={MAX_TAX_RATE}
              step="0.01"
              value={value.tax_rate ?? 0}
              onChange={(e) =>
                onChange({
                  ...value,
                  tax_rate: Math.max(0, Math.min(MAX_TAX_RATE, Number(e.target.value) || 0)),
                })
              }
              onBlur={() => markTouched("tax")}
              className="pr-8"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">%</span>
          </div>
        )}
      </section>

      {/* Fees */}
      <section className="space-y-3">
        <h4 className="text-sm font-semibold">Additional Fees</h4>
        <div className="space-y-2">
          {FEE_DEFINITIONS.map((def) => {
            const overridden = isFeeOverridden(def.key);
            const state = overridden ? value.fees[def.key]! : agencyDefaults.fees[def.key];
            const fieldKey = `fee_${def.key}`;
            const isDeposit = def.key === "security_deposit";
            const max = isDeposit ? MAX_DEPOSIT_AMOUNT : MAX_FEE_AMOUNT;
            const amountError =
              showValidation && overridden && state?.enabled && (state.amount < 0 || state.amount > max);

            return (
              <div key={def.key} className="rounded-md border border-border bg-secondary/20 p-3">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-medium">{def.label}</p>
                      {overridden ? <OverrideTag /> : <InheritedTag />}
                    </div>
                    {!overridden && (
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {summarizeFee(state, def)}
                      </p>
                    )}
                  </div>
                  <Switch
                    checked={overridden}
                    onCheckedChange={(c) => toggleFeeOverride(def.key, !!c)}
                    aria-label={`Override ${def.label}`}
                  />
                </div>

                {overridden && state && (
                  <div className="mt-3 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">Charge this fee?</span>
                      <Switch
                        checked={state.enabled}
                        onCheckedChange={(c) => updateFee(def.key, { enabled: !!c })}
                        aria-label={`Enable ${def.label}`}
                      />
                    </div>
                    {state.enabled && (
                      <>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                              $
                            </span>
                            <Input
                              {...moneyInputProps}
                              max={max}
                              value={state.amount}
                              onChange={(e) =>
                                updateFee(def.key, {
                                  amount: Math.max(0, Math.min(max, Number(e.target.value) || 0)),
                                })
                              }
                              onBlur={() => markTouched(fieldKey)}
                              className="pl-7"
                            />
                          </div>
                          {def.hasCollectionMethod && (
                            <Select
                              value={state.collection_method ?? "same_as_rental"}
                              onValueChange={(v) =>
                                updateFee(def.key, {
                                  collection_method: v as DepositCollectionMethod,
                                })
                              }
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {DEPOSIT_COLLECTION_OPTIONS.map((o) => (
                                  <SelectItem key={o.value} value={o.value}>
                                    {o.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          )}
                        </div>
                        {def.hasIncludedMiles && (
                          <div className="max-w-xs">
                            <Label className="text-xs text-muted-foreground mb-1 block">
                              Included miles per day
                            </Label>
                            <Input
                              type="number"
                              min={0}
                              max={MAX_FEE_AMOUNT}
                              value={state.included_miles_per_day ?? 0}
                              onChange={(e) =>
                                updateFee(def.key, {
                                  included_miles_per_day: Math.max(
                                    0,
                                    Math.min(MAX_FEE_AMOUNT, Number(e.target.value) || 0),
                                  ),
                                })
                              }
                            />
                          </div>
                        )}
                        {isDeposit ? (
                          <label className="flex items-center gap-2 opacity-50 cursor-not-allowed">
                            <Checkbox checked={false} disabled aria-disabled="true" />
                            <span className="text-sm">
                              Taxable (security deposits are never taxable)
                            </span>
                          </label>
                        ) : (
                          <label className="flex items-center gap-2 cursor-pointer">
                            <Checkbox
                              checked={state.taxable}
                              onCheckedChange={(c) => updateFee(def.key, { taxable: !!c })}
                            />
                            <span className="text-sm">Taxable</span>
                          </label>
                        )}
                        {amountError && (
                          <p className="text-xs text-destructive">
                            Must be $0–${max.toLocaleString()}.
                          </p>
                        )}
                      </>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Custom Fees */}
      <section className="space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h4 className="text-sm font-semibold">Custom Fees</h4>
            {!customOverridden && (
              <p className="text-xs text-muted-foreground mt-0.5">
                Inheriting:{" "}
                {agencyDefaults.custom_fees.length === 0
                  ? "None"
                  : agencyDefaults.custom_fees
                      .map((c) => `${c.label} ($${c.amount} ${c.frequency.replace("_", " ")})`)
                      .join(", ")}
              </p>
            )}
          </div>
          <div className="flex items-center gap-2">
            {customOverridden ? <OverrideTag /> : <InheritedTag />}
            <Switch
              checked={customOverridden}
              onCheckedChange={toggleCustomOverride}
              aria-label="Override custom fees"
            />
          </div>
        </div>
        {customOverridden && value.custom_fees && (
          <>
            <div className="space-y-2">
              {value.custom_fees.map((cf, idx) => (
                <div
                  key={idx}
                  className="rounded-md border border-border bg-secondary/20 p-3 grid grid-cols-1 sm:grid-cols-[1fr_120px_140px_auto] gap-2 items-end"
                >
                  <div>
                    <Label className="text-xs mb-1 block">Label</Label>
                    <Input
                      value={cf.label}
                      maxLength={MAX_CUSTOM_FEE_LABEL_LENGTH}
                      onChange={(e) => updateCustom(idx, { label: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label className="text-xs mb-1 block">Amount</Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                        $
                      </span>
                      <Input
                        {...moneyInputProps}
                        value={cf.amount}
                        onChange={(e) =>
                          updateCustom(idx, {
                            amount: Math.max(
                              0,
                              Math.min(MAX_FEE_AMOUNT, Number(e.target.value) || 0),
                            ),
                          })
                        }
                        className="pl-7"
                      />
                    </div>
                  </div>
                  <div>
                    <Label className="text-xs mb-1 block">Frequency</Label>
                    <Select
                      value={cf.frequency}
                      onValueChange={(v) =>
                        updateCustom(idx, { frequency: v as CustomFee["frequency"] })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="per_rental">Per Rental</SelectItem>
                        <SelectItem value="per_day">Per Day</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button type="button" variant="ghost" size="icon" onClick={() => removeCustom(idx)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
            {value.custom_fees.length < MAX_CUSTOM_FEES && (
              <Button type="button" variant="outline" size="sm" onClick={addCustom}>
                <Plus className="h-4 w-4 mr-1" /> Add Custom Fee
              </Button>
            )}
          </>
        )}
      </section>

      <div className="pt-2 border-t border-border">
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button type="button" variant="outline" size="sm">
              <RotateCcw className="h-4 w-4 mr-1.5" />
              Reset to Agency Defaults
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Reset all overrides?</AlertDialogTitle>
              <AlertDialogDescription>
                This will remove all custom settings for this vehicle and restore your agency
                defaults. Are you sure?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleResetAll}>Reset</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
};

export default VehiclePaymentOverrideForm;