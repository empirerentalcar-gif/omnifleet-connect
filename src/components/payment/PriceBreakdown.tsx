import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Minus, Plus } from "lucide-react";
import {
  computeBreakdown,
  depositCollectionLabel,
  type PaymentSettings,
} from "@/lib/payment-settings";

type Props = {
  dailyRate: number;
  settings: PaymentSettings;
  /** When true, show a 1-30 day stepper (owner preview). When false, days is fixed. */
  showStepper?: boolean;
  days?: number;
  title?: string;
  subtitle?: string;
  className?: string;
};

const fmt = (n: number) =>
  n.toLocaleString("en-US", { style: "currency", currency: "USD" });

export const PriceBreakdown = ({
  dailyRate,
  settings,
  showStepper,
  days: fixedDays,
  title = "Price Breakdown Preview",
  subtitle = "This is what your renter will see as their estimated total.",
  className,
}: Props) => {
  const [previewDays, setPreviewDays] = useState(1);
  const days = showStepper ? previewDays : Math.max(1, fixedDays ?? 1);
  const breakdown = computeBreakdown(dailyRate || 0, days, settings);

  return (
    <div
      className={
        "rounded-xl border border-border bg-secondary/30 p-4 sm:p-5 space-y-3 " +
        (className ?? "")
      }
    >
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h4 className="text-sm font-semibold">{title}</h4>
          {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
        </div>
        {showStepper && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Preview for</span>
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="h-7 w-7"
              onClick={() => setPreviewDays((d) => Math.max(1, d - 1))}
              aria-label="Decrease preview days"
            >
              <Minus className="h-3 w-3" />
            </Button>
            <span className="text-sm font-medium w-12 text-center">
              {previewDays} day{previewDays === 1 ? "" : "s"}
            </span>
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="h-7 w-7"
              onClick={() => setPreviewDays((d) => Math.min(30, d + 1))}
              aria-label="Increase preview days"
            >
              <Plus className="h-3 w-3" />
            </Button>
          </div>
        )}
      </div>

      <ul className="text-sm divide-y divide-border/60">
        {breakdown.lines.map((line) => (
          <li
            key={line.key}
            className={
              "flex items-baseline justify-between gap-3 py-1.5 " +
              (line.refundable ? "text-muted-foreground italic" : "")
            }
          >
            <div className="flex-1 min-w-0">
              <p className="truncate">
                {line.label}
                {line.refundable && (
                  <span className="ml-2 text-[10px] uppercase tracking-wide">refundable</span>
                )}
              </p>
              {line.detail && (
                <p className="text-xs text-muted-foreground">{line.detail}</p>
              )}
            </div>
            <span className="font-medium tabular-nums whitespace-nowrap">
              {fmt(line.amount)}
            </span>
          </li>
        ))}
      </ul>

      <div className="border-t border-border pt-3 flex items-baseline justify-between">
        <span className="text-sm font-bold">Estimated Total</span>
        <span className="text-lg font-bold tabular-nums">
          {fmt(breakdown.estimatedTotal)}
        </span>
      </div>

      {breakdown.depositAmount > 0 && (
        <p className="text-xs text-muted-foreground">
          Security deposit of {fmt(breakdown.depositAmount)} is not included in the
          estimated total — collected separately at pickup via{" "}
          <span className="font-medium">
            {depositCollectionLabel(breakdown.depositCollection)}
          </span>
          .
        </p>
      )}
    </div>
  );
};

export default PriceBreakdown;