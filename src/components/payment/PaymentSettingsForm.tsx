import { useState, useMemo } from "react";
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
import { Plus, Trash2 } from "lucide-react";
import { NumberInput } from "@/components/payment/NumberInput";
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
  type PaymentSettings,
  type PaymentMethodKey,
  type FeeKey,
  type FeeState,
  type CustomFee,
  type DepositCollectionMethod,
} from "@/lib/payment-settings";

type Props = {
  value: PaymentSettings;
  onChange: (next: PaymentSettings) => void;
  showValidation?: boolean;
};

const moneyInputProps = {
  type: "number" as const,
  min: 0,
  max: 9999,
  step: "0.01",
  inputMode: "decimal" as const,
};

const intInputProps = {
  type: "number" as const,
  min: 0,
  max: 9999,
  step: 1,
  inputMode: "numeric" as const,
};

export const PaymentSettingsForm = ({ value, onChange, showValidation }: Props) => {
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const noMethodSelected = value.payment_methods.length === 0;
  const methodSet = useMemo(() => new Set(value.payment_methods), [value.payment_methods]);

  const toggleMethod = (key: PaymentMethodKey, checked: boolean) => {
    const next = checked
      ? [...value.payment_methods, key]
      : value.payment_methods.filter((m) => m !== key);
    onChange({ ...value, payment_methods: next });
  };

  const updateFee = (key: FeeKey, patch: Partial<FeeState>) => {
    const current = value.fees[key] ?? { enabled: false, amount: 0, taxable: false };
    onChange({ ...value, fees: { ...value.fees, [key]: { ...current, ...patch } } });
  };

  const updateCustom = (idx: number, patch: Partial<CustomFee>) => {
    const next = [...value.custom_fees];
    next[idx] = { ...next[idx], ...patch };
    onChange({ ...value, custom_fees: next });
  };

  const addCustom = () => {
    if (value.custom_fees.length >= MAX_CUSTOM_FEES) return;
    onChange({
      ...value,
      custom_fees: [...value.custom_fees, { label: "", amount: 0, frequency: "per_rental" }],
    });
  };

  const removeCustom = (idx: number) =>
    onChange({ ...value, custom_fees: value.custom_fees.filter((_, i) => i !== idx) });

  const markTouched = (field: string) =>
    setTouched((prev) => ({ ...prev, [field]: true }));

  const restrictionsRemaining = MAX_RESTRICTIONS_LENGTH - (value.payment_restrictions?.length || 0);
  const restrictionsNearLimit = restrictionsRemaining <= 50;

  return (
    <div className="space-y-10">
      {/* Payment Methods */}
      <section className="space-y-3">
        <div>
          <h3 className="text-base font-semibold">Payment Methods Accepted</h3>
          <p className="text-xs text-muted-foreground">
            Check all the ways your agency accepts payment.
          </p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {PAYMENT_METHOD_OPTIONS.map((opt) => (
            <label
              key={opt.key}
              className="flex items-center gap-2 rounded-md border border-border bg-secondary/30 px-3 py-2.5 cursor-pointer hover:bg-secondary/50 transition-colors"
            >
              <Checkbox
                checked={methodSet.has(opt.key)}
                onCheckedChange={(c) => toggleMethod(opt.key, !!c)}
                aria-label={opt.label}
              />
              <span className="text-sm">
                <span className="mr-1.5">{opt.emoji}</span>
                {opt.label}
              </span>
            </label>
          ))}
        </div>
        {methodSet.has("other") && (
          <div>
            <Label className="text-xs text-muted-foreground mb-1 block">Please specify</Label>
            <Input
              value={value.other_payment_text}
              maxLength={120}
              onChange={(e) => onChange({ ...value, other_payment_text: e.target.value })}
              placeholder="e.g. Wire transfer, crypto, etc."
              onBlur={() => markTouched("other_payment_text")}
            />
            {showValidation && touched.other_payment_text && !value.other_payment_text.trim() && (
              <p className="text-xs text-destructive mt-1">Please specify the 'Other' payment method.</p>
            )}
          </div>
        )}
        {showValidation && noMethodSelected && (
          <p className="text-sm text-destructive">
            Please select at least one accepted payment method.
          </p>
        )}
      </section>

      {/* Payment Restrictions */}
      <section className="space-y-2">
        <div>
          <h3 className="text-base font-semibold">Payment Method Restrictions / Instructions</h3>
          <p className="text-xs text-muted-foreground">
            Shown to renters on the public listing when any non-credit method is accepted.
          </p>
        </div>
        <Textarea
          id="payment_restrictions"
          value={value.payment_restrictions}
          maxLength={MAX_RESTRICTIONS_LENGTH}
          rows={4}
          placeholder="e.g. Cash rentals require a local utility bill and a DMV printout at pickup."
          onChange={(e) => onChange({ ...value, payment_restrictions: e.target.value })}
          onBlur={() => markTouched("payment_restrictions")}
          className={restrictionsNearLimit ? "border-orange-400 focus-visible:ring-orange-400" : ""}
        />
        <div className="flex justify-between items-center">
          <p className="text-xs text-muted-foreground">
            Maximum {MAX_RESTRICTIONS_LENGTH} characters.
          </p>
          <p className={`text-xs font-medium ${restrictionsNearLimit ? "text-orange-500" : "text-muted-foreground"}`}>
            {restrictionsRemaining} remaining
          </p>
        </div>
        {showValidation && value.payment_restrictions.length > MAX_RESTRICTIONS_LENGTH && (
          <p className="text-sm text-destructive">Payment restrictions must be {MAX_RESTRICTIONS_LENGTH} characters or fewer.</p>
        )}
      </section>

      {/* Tax */}
      <section className="space-y-2">
        <div>
          <h3 className="text-base font-semibold">Local Sales / Rental Tax Rate</h3>
          <p className="text-xs text-muted-foreground">
            Applied to all non-refundable charges only. Never applied to the security deposit.
          </p>
        </div>
        <div className="relative max-w-xs">
          <NumberInput
            id="tax_rate"
            min={0}
            max={MAX_TAX_RATE}
            value={value.tax_rate}
            onChange={(n) => onChange({ ...value, tax_rate: n })}
            onBlur={() => markTouched("tax_rate")}
            className="pr-8"
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
            %
          </span>
        </div>
        {showValidation && touched.tax_rate && (value.tax_rate < 0 || value.tax_rate > MAX_TAX_RATE) && (
          <p className="text-sm text-destructive">Tax rate must be between 0 and {MAX_TAX_RATE}%.</p>
        )}
      </section>

      {/* Fees */}
      <section className="space-y-3">
        <div>
          <h3 className="text-base font-semibold">Additional Fees</h3>
          <p className="text-xs text-muted-foreground">
            Toggle on the fees you charge, then enter the amount. Check "Taxable" if the fee should have sales tax applied.
          </p>
        </div>
        <div className="space-y-3">
          {FEE_DEFINITIONS.map((def) => {
            const state = value.fees[def.key] ?? { enabled: false, amount: 0, taxable: false };
            const fieldPrefix = `fee_${def.key}`;
            const showFeeValidation = showValidation && touched[fieldPrefix];
            const amountError = showFeeValidation && state.enabled && state.amount < 0;
            const depositError = showFeeValidation && state.enabled && def.key === "security_deposit" && state.amount > MAX_DEPOSIT_AMOUNT;
            const feeCapError = showFeeValidation && state.enabled && def.key !== "security_deposit" && state.amount > MAX_FEE_AMOUNT;

            return (
              <div
                key={def.key}
                className="rounded-md border border-border bg-secondary/20 p-3 sm:p-4"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{def.label}</p>
                    <p className="text-xs text-muted-foreground">{def.unit}</p>
                  </div>
                  <Switch
                    checked={state.enabled}
                    onCheckedChange={(c) => updateFee(def.key, { enabled: !!c })}
                    aria-label={`Toggle ${def.label}`}
                  />
                </div>
                {state.enabled && (
                  <div className="mt-3 space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                          $
                        </span>
                        <NumberInput
                          min={0}
                          max={def.key === "security_deposit" ? MAX_DEPOSIT_AMOUNT : MAX_FEE_AMOUNT}
                          value={state.amount}
                          onChange={(n) => updateFee(def.key, { amount: n })}
                          onBlur={() => markTouched(fieldPrefix)}
                          className="pl-7"
                          aria-label={`${def.label} amount`}
                        />
                      </div>
                      {def.hasCollectionMethod && (
                        <Select
                          value={state.collection_method ?? "same_as_rental"}
                          onValueChange={(v) =>
                            updateFee(def.key, { collection_method: v as DepositCollectionMethod })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Collection method" />
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
                        <Label className="text-xs text-muted-foreground mb-1 block">Included miles per day</Label>
                        <div className="relative">
                          <NumberInput
                            min={0}
                            max={MAX_FEE_AMOUNT}
                            allowDecimals={false}
                            value={state.included_miles_per_day ?? 0}
                            onChange={(n) => updateFee(def.key, { included_miles_per_day: n })}
                            onBlur={() => markTouched(`${fieldPrefix}_miles`)}
                          />
                          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                            miles
                          </span>
                        </div>
                      </div>
                    )}
                    {def.key === "security_deposit" ? (
                      <label className="flex items-center gap-2 select-none opacity-50 cursor-not-allowed">
                        <Checkbox
                          checked={false}
                          disabled
                          aria-label="Security deposits are never taxable"
                          aria-disabled="true"
                        />
                        <span className="text-sm">Taxable (security deposits are never taxable)</span>
                      </label>
                    ) : (
                      <label className="flex items-center gap-2 cursor-pointer select-none">
                        <Checkbox
                          checked={state.taxable}
                          onCheckedChange={(c) => updateFee(def.key, { taxable: !!c })}
                          aria-label={`${def.label} taxable`}
                        />
                        <span className="text-sm">Taxable</span>
                      </label>
                    )}
                    {amountError && (
                      <p className="text-xs text-destructive">Amount cannot be negative.</p>
                    )}
                    {depositError && (
                      <p className="text-xs text-destructive">Security deposits are capped at $5,000.</p>
                    )}
                    {feeCapError && (
                      <p className="text-xs text-destructive">Fee amounts must be $9,999 or less.</p>
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
        <div>
          <h3 className="text-base font-semibold">Custom Fees</h3>
          <p className="text-xs text-muted-foreground">
            Up to {MAX_CUSTOM_FEES} additional fees not covered above.
          </p>
        </div>
        <div className="space-y-2">
          {value.custom_fees.map((cf, idx) => {
            const cfPrefix = `custom_fee_${idx}`;
            const showCfValidation = showValidation && touched[cfPrefix];
            const labelError = showCfValidation && !cf.label.trim();
            const labelLenError = showCfValidation && cf.label.length > MAX_CUSTOM_FEE_LABEL_LENGTH;
            const amountError = showCfValidation && (cf.amount < 0 || cf.amount > MAX_FEE_AMOUNT);

            return (
              <div
                key={idx}
                className="rounded-md border border-border bg-secondary/20 p-3 grid grid-cols-1 sm:grid-cols-[1fr_140px_140px_auto] gap-2 items-end"
              >
                <div>
                  <Label className="text-xs text-muted-foreground mb-1 block">Label</Label>
                  <Input
                    value={cf.label}
                    maxLength={MAX_CUSTOM_FEE_LABEL_LENGTH}
                    placeholder="e.g. Pet Fee"
                    onChange={(e) => updateCustom(idx, { label: e.target.value })}
                    onBlur={() => markTouched(cfPrefix)}
                  />
                  {labelError && <p className="text-xs text-destructive mt-1">Label is required.</p>}
                  {labelLenError && <p className="text-xs text-destructive mt-1">Max {MAX_CUSTOM_FEE_LABEL_LENGTH} chars.</p>}
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground mb-1 block">Amount</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                      $
                    </span>
                    <NumberInput
                      min={0}
                      max={MAX_FEE_AMOUNT}
                      value={cf.amount}
                      onChange={(n) => updateCustom(idx, { amount: n })}
                      onBlur={() => markTouched(cfPrefix)}
                      className="pl-7"
                    />
                  </div>
                  {amountError && <p className="text-xs text-destructive mt-1">Must be $0–$9,999.</p>}
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground mb-1 block">Frequency</Label>
                  <Select
                    value={cf.frequency}
                    onValueChange={(v) => updateCustom(idx, { frequency: v as CustomFee["frequency"] })}
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
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => removeCustom(idx)}
                  aria-label="Remove custom fee"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            );
          })}
        </div>
        {value.custom_fees.length < MAX_CUSTOM_FEES && (
          <Button type="button" variant="outline" size="sm" onClick={addCustom}>
            <Plus className="h-4 w-4 mr-1" /> Add Custom Fee
          </Button>
        )}
      </section>
    </div>
  );
};

export default PaymentSettingsForm;
