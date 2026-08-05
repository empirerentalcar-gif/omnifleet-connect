import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Clock, DollarSign, Landmark, Receipt } from "lucide-react";

type Props = {
  agencyId: string;
  bookingPriceCents: number;
  platformFeeCents: number;
  stripeChargeId: string | null;
  capturedAt: string | null; // bookings.updated_at when payment_status='captured'
  paymentStatus: string;
};

type AgencyPayout = {
  last_payout_status: string | null;
  last_payout_amount_cents: number | null;
  last_payout_at: string | null;
  last_payout_failure_message: string | null;
};

const fmtMoney = (cents: number) =>
  `$${(cents / 100).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const fmtDateTime = (iso: string) =>
  new Date(iso).toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZoneName: "short",
  });

const fmtDate = (d: Date) =>
  d.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });

// Add N business days (skipping Sat/Sun) to a date
const addBusinessDays = (start: Date, days: number) => {
  const d = new Date(start);
  let added = 0;
  while (added < days) {
    d.setDate(d.getDate() + 1);
    const dow = d.getDay();
    if (dow !== 0 && dow !== 6) added++;
  }
  return d;
};

const shortId = (id: string) => (id.length > 14 ? `${id.slice(0, 12)}…` : id);

export const BookingPaymentDetails = ({
  agencyId,
  bookingPriceCents,
  platformFeeCents,
  stripeChargeId,
  capturedAt,
  paymentStatus,
}: Props) => {
  const [agency, setAgency] = useState<AgencyPayout | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data } = await supabase
        .from("agencies")
        .select("last_payout_status,last_payout_amount_cents,last_payout_at,last_payout_failure_message")
        .eq("id", agencyId)
        .maybeSingle();
      if (!cancelled) setAgency((data as AgencyPayout) ?? null);
    })();
    return () => { cancelled = true; };
  }, [agencyId]);

  const payoutCents = Math.max(bookingPriceCents - platformFeeCents, 0);
  const captured = paymentStatus === "captured" && !!capturedAt;
  const expectedPayoutDate = captured && capturedAt
    ? fmtDate(addBusinessDays(new Date(capturedAt), 2))
    : null;

  const payoutPaid = agency?.last_payout_status === "paid" && !!agency?.last_payout_at;

  return (
    <div className="bg-secondary/20 border-t border-border/50 px-4 py-4">
      <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
        <Receipt className="h-4 w-4 text-primary" /> Payment &amp; Payout
      </h3>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {/* 1. Payment captured */}
        <div className="rounded-lg border border-border/60 bg-background/40 p-3">
          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
            <DollarSign className="h-3.5 w-3.5" /> Payment captured
          </div>
          <div className="text-base font-semibold">{fmtMoney(bookingPriceCents)} USD</div>
          {captured ? (
            <div className="mt-1 flex items-center gap-1.5 text-xs text-green-400">
              <CheckCircle2 className="h-3 w-3" /> Captured · {fmtDateTime(capturedAt!)}
            </div>
          ) : (
            <div className="mt-1 flex items-center gap-1.5 text-xs text-yellow-400">
              <Clock className="h-3 w-3" /> {paymentStatus.replace("_", " ")}
            </div>
          )}
          {stripeChargeId && (
            <div className="mt-2 text-[11px] font-mono text-muted-foreground break-all" title={stripeChargeId}>
              {shortId(stripeChargeId)}
            </div>
          )}
        </div>

        {/* 2. Zuvio platform fee */}
        <div className="rounded-lg border border-border/60 bg-background/40 p-3">
          <div className="text-xs text-muted-foreground mb-1">
            Zuvio commission{bookingPriceCents > 0 ? ` (${((platformFeeCents / bookingPriceCents) * 100).toFixed(((platformFeeCents / bookingPriceCents) * 100) % 1 === 0 ? 0 : 1)}%)` : ''}
          </div>
          <div className="text-base font-semibold text-muted-foreground">
            −{fmtMoney(platformFeeCents)}
          </div>
          <div className="mt-1 text-[11px] text-muted-foreground">
            Deducted automatically at capture.
          </div>
        </div>

        {/* 3. Your payout */}
        <div className="rounded-lg border border-primary/40 bg-primary/5 p-3">
          <div className="text-xs text-muted-foreground mb-1">Your payout</div>
          <div className="text-base font-semibold text-primary">{fmtMoney(payoutCents)}</div>
          <div className="mt-1 flex items-center gap-2 flex-wrap">
            {payoutPaid ? (
              <Badge className="bg-green-500/20 text-green-400 border-green-500/30">Paid</Badge>
            ) : (
              <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">Pending</Badge>
            )}
            {expectedPayoutDate && !payoutPaid && (
              <span className="text-[11px] text-muted-foreground">Expected by {expectedPayoutDate}</span>
            )}
          </div>
        </div>

        {/* 4. Actual payout */}
        <div className="rounded-lg border border-border/60 bg-background/40 p-3">
          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
            <Landmark className="h-3.5 w-3.5" /> Actual payout
          </div>
          {payoutPaid && agency?.last_payout_at ? (
            <>
              <div className="text-sm font-medium text-green-400">
                Paid on {fmtDateTime(agency.last_payout_at)}
              </div>
              {typeof agency.last_payout_amount_cents === "number" && (
                <div className="mt-1 text-xs text-muted-foreground">
                  Amount: {fmtMoney(agency.last_payout_amount_cents)}
                </div>
              )}
            </>
          ) : agency?.last_payout_status === "failed" ? (
            <div className="text-xs text-destructive">
              Last payout failed{agency.last_payout_failure_message ? `: ${agency.last_payout_failure_message}` : ""}
            </div>
          ) : (
            <div className="text-xs text-muted-foreground">
              Pending — typically arrives within 2 business days of capture.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};