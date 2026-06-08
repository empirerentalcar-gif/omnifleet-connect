import { useMemo } from "react";
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
import {
  PAYMENT_METHOD_OPTIONS,
  DEPOSIT_COLLECTION_OPTIONS,
  FEE_DEFINITIONS,
  MAX_CUSTOM_FEES,
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

export const PaymentSettingsForm = ({ value, onChange, showValidation }: Props) => {
  const noMethodSelected = value.payment_methods.length === 0;
  const methodSet = useMemo(() => new Set(value.payment_methods), [value.payment_methods]);

  const toggleMethod = (key: PaymentMethodKey, checked: boolean) => {
    const next = checked
      ? [...value.payment_methods, key]
      : value.payment_methods.filter((m) => m !== key);
    onChange({ ...value, payment_methods: next });
  };

  const updateFee = (key: FeeKey, patch: Partial<FeeState>) => {
    const current = value.fees[key] ?? { enabled: false, amount: 0 };
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

  return (
    <div className="space-y-8">
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
              className="flex items-center gap-2 rounded-md border border-border bg-secondary/30 px-3 py-2 cursor-pointer hover:bg-secondary/50"
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
            <Label className="text-xs text-muted-foreground">Please specify</Label>
            <Input
              value={value.other_payment_text}
              maxLength={120}
              onChange={(e) => onChange({ ...value, other_payment_text: e.target.value })}
              placeholder="e.g. Wire transfer, crypto, etc."
            />
          </div>
        )}
        {showValidation && noMethodSelected && (
          <p className="text-sm text-destructive">
            Please select at least one accepted payment method.
          </p>
        )}

        <div>
          <Label htmlFor="payment_restrictions">
            Payment Method Restrictions / Instructions
          </Label>
          <Textarea
            id="payment_restrictions"
            value={value.payment_restrictions}
            maxLength={1000}
            rows={4}
            placeholder="e.g. Cash rentals require a local utility bill and a DMV printout at pickup."
            onChange={(e) => onChange({ ...value, payment_restrictions: e.target.value })}
          />
          <p className="text-xs text-muted-foreground mt-1">
            Shown to renters on the public listing when any non-credit method is accepted.
          </p>
        </div>
      </section>

      {/* Tax */}
      <section className="space-y-2">
        <Label htmlFor="tax_rate">Local Sales / Rental Tax Rate</Label>
        <div className="relative max-w-xs">
          <Input
            id="tax_rate"
            type="number"
            inputMode="decimal"
            min={0}
            max={100}
            step="0.01"
            value={value.tax_rate}
            onChange={(e) =>
              onChange({ ...value, tax_rate: Math.max(0, Math.min(100, Number(e.target.value) || 0)) })
            }
            className="pr-8"
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
            %
          </span>
        </div>
        <p className="text-xs text-muted-foreground">
          Applied to all non-refundable charges only. Never applied to the security deposit.
        </p>
      </section>

      {/* Fees */}
      <section className="space-y-3">
        <div>
          <h3 className="text-base font-semibold">Additional Fees</h3>
          <p className="text-xs text-muted-foreground">
            Toggle on the fees you charge, then enter the amount.
          </p>
        </div>
        <div className="space-y-2">
          {FEE_DEFINITIONS.map((def) => {
            const state = value.fees[def.key] ?? { enabled: false, amount: 0 };
            return (
              <div
                key={def.key}
                className="rounded-md border border-border bg-secondary/20 p-3"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex-1">
                    <p className="text-sm font-medium">{def.label}</p>
                    <p className="text-xs text-muted-foreground">{def.unit}</p>
                  </div>
                  <Switch
                    checked={state.enabled}
                    onCheckedChange={(c) => updateFee(def.key, { enabled: !!c })}
                    aria-label={`Toggle ${def.label}`}
                  />
                </div>
                {state.enabled && (
                  <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                        $
                      </span>
                      <Input
                        {...moneyInputProps}
                        value={state.amount}
                        onChange={(e) =>
                          updateFee(def.key, { amount: Math.max(0, Math.min(9999, Number(e.target.value) || 0)) })
                        }
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
          {value.custom_fees.map((cf, idx) => (
            <div
              key={idx}
              className="rounded-md border border-border bg-secondary/20 p-3 grid grid-cols-1 sm:grid-cols-[1fr_140px_140px_auto] gap-2 items-end"
            >
              <div>
                <Label className="text-xs text-muted-foreground">Label</Label>
                <Input
                  value={cf.label}
                  maxLength={60}
                  placeholder="e.g. Pet Fee"
                  onChange={(e) => updateCustom(idx, { label: e.target.value })}
                />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Amount</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                    $
                  </span>
                  <Input
                    {...moneyInputProps}
                    value={cf.amount}
                    onChange={(e) =>
                      updateCustom(idx, { amount: Math.max(0, Math.min(9999, Number(e.target.value) || 0)) })
                    }
                    className="pl-7"
                  />
                </div>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Frequency</Label>
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
          ))}
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