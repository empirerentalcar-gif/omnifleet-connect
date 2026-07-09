import { useEffect, useRef, useState } from "react";
import { Input } from "@/components/ui/input";

type Props = Omit<React.InputHTMLAttributes<HTMLInputElement>, "value" | "onChange" | "type"> & {
  value: number;
  onChange: (next: number) => void;
  min?: number;
  max: number;
  step?: number | string;
  allowDecimals?: boolean;
};

/**
 * Number input that keeps its own string state while the field is focused so
 * users can freely type over a leading "0", clear the field, or enter a
 * partial decimal like "0." or ".5" without the value snapping back to 0.
 * On blur (or when the parent's value changes externally) it re-syncs to the
 * clamped, canonical numeric value.
 */
export const NumberInput = ({
  value,
  onChange,
  min = 0,
  max,
  step,
  allowDecimals = true,
  onBlur,
  onFocus,
  ...rest
}: Props) => {
  const [text, setText] = useState<string>(() => (Number.isFinite(value) ? String(value) : ""));
  const focusedRef = useRef(false);

  // Sync from parent when the field is NOT actively being edited.
  useEffect(() => {
    if (!focusedRef.current) {
      setText(Number.isFinite(value) ? String(value) : "");
    }
  }, [value]);

  const clamp = (n: number) => Math.max(min, Math.min(max, n));

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    setText(raw);

    // Allow intermediate/empty states while typing without stomping to 0.
    if (raw === "" || raw === "-" || raw === "." || raw === "-.") return;

    const parsed = Number(raw);
    if (!Number.isFinite(parsed)) return;

    const clamped = clamp(parsed);
    if (clamped !== value) onChange(clamped);
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    focusedRef.current = false;
    // Canonicalize on blur: empty / invalid resets to min (typically 0).
    const parsed = Number(text);
    const finalVal = text === "" || !Number.isFinite(parsed) ? min : clamp(parsed);
    if (finalVal !== value) onChange(finalVal);
    setText(String(finalVal));
    onBlur?.(e);
  };

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    focusedRef.current = true;
    onFocus?.(e);
  };

  return (
    <Input
      {...rest}
      type="number"
      inputMode={allowDecimals ? "decimal" : "numeric"}
      min={min}
      max={max}
      step={step ?? (allowDecimals ? "0.01" : 1)}
      value={text}
      onChange={handleChange}
      onBlur={handleBlur}
      onFocus={handleFocus}
    />
  );
};