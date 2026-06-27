import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle2, AlertCircle, ExternalLink, RefreshCw, Loader2, Banknote } from "lucide-react";

type ConnectStatus = {
  connected: boolean;
  status: string;
  charges_enabled: boolean;
  payouts_enabled: boolean;
  details_submitted?: boolean;
  requirements?: {
    currently_due: string[];
    past_due: string[];
    disabled_reason: string | null;
  } | null;
};

type PayoutInfo = {
  status: string | null;
  amount_cents: number | null;
  at: string | null;
  failure_message: string | null;
};

const STATUS_LABEL: Record<string, string> = {
  not_started: "Not connected",
  pending: "Onboarding incomplete",
  pending_verification: "Pending verification",
  restricted: "Action required",
  active: "Active",
};

export function StripeConnectCard() {
  const { toast } = useToast();
  const [status, setStatus] = useState<ConnectStatus | null>(null);
  const [payout, setPayout] = useState<PayoutInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [morAccepted, setMorAccepted] = useState(false);

  const refresh = async () => {
    setLoading(true);
    const [{ data, error }, { data: userRes }] = await Promise.all([
      supabase.functions.invoke("connect-account-status"),
      supabase.auth.getUser(),
    ]);
    if (error) {
      toast({
        title: "Couldn't load Stripe status",
        description: error.message,
        variant: "destructive",
      });
    } else if (data) {
      setStatus(data as ConnectStatus);
    }

    const userId = userRes?.user?.id;
    if (userId) {
      const { data: agencyRow } = await supabase
        .from("agencies")
        .select("last_payout_status, last_payout_amount_cents, last_payout_at, last_payout_failure_message")
        .eq("owner_user_id", userId)
        .maybeSingle();
      if (agencyRow) {
        setPayout({
          status: agencyRow.last_payout_status,
          amount_cents: agencyRow.last_payout_amount_cents,
          at: agencyRow.last_payout_at,
          failure_message: agencyRow.last_payout_failure_message,
        });
      }
    }
    setLoading(false);
  };

  useEffect(() => {
    refresh();
    // Auto-refresh when returning from Stripe onboarding
    const params = new URLSearchParams(window.location.search);
    if (params.get("stripe_return") || params.get("stripe_refresh")) {
      // Clear params and refetch
      window.history.replaceState({}, "", window.location.pathname);
    }
  }, []);

  const startOnboarding = async () => {
    if (!morAccepted) {
      toast({
        title: "Agreement required",
        description: "Please acknowledge the Merchant of Record terms before connecting Stripe.",
        variant: "destructive",
      });
      return;
    }
    setSubmitting(true);
    try {
      // Guard: if the agency already has charges enabled on Stripe, skip
      // re-onboarding (which can fail for fully-active accounts) and just
      // refresh status.
      const { data: userRes } = await supabase.auth.getUser();
      const userId = userRes?.user?.id;
      if (userId) {
        const { data: agencyRow } = await supabase
          .from("agencies")
          .select("stripe_charges_enabled")
          .eq("owner_user_id", userId)
          .maybeSingle();
        if (agencyRow?.stripe_charges_enabled === true) {
          toast({
            title: "Stripe account connected",
            description: "Your Stripe account is already connected and active.",
          });
          setSubmitting(false);
          await refresh();
          return;
        }
      }

      const { data, error } = await supabase.functions.invoke("create-connect-account");
      if (error || !data?.url) {
        toast({
          title: "Could not start Stripe onboarding",
          description: error?.message ?? "Please try again.",
          variant: "destructive",
        });
        return;
      }
      window.location.href = data.url as string;
    } finally {
      // Always clear submitting so stale guards never block retries.
      setSubmitting(false);
    }
  };

  const isActive = status?.status === "active";
  const isRestricted = status?.status === "restricted";
  const chargesEnabled = status?.charges_enabled === true;
  const setupComplete = isActive && chargesEnabled;

  const badgeClass = isActive
    ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
    : isRestricted
    ? "bg-red-500/15 text-red-400 border-red-500/30"
    : "bg-yellow-500/15 text-yellow-400 border-yellow-500/30";

  return (
    <div className="glass-card rounded-xl p-6 mb-10">
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h2 className="text-lg font-bold">Payouts (Stripe Connect)</h2>
            {status && (
              <Badge variant="outline" className={badgeClass}>
                {isActive ? (
                  <CheckCircle2 className="h-3 w-3 mr-1" />
                ) : (
                  <AlertCircle className="h-3 w-3 mr-1" />
                )}
                {STATUS_LABEL[status.status] ?? status.status}
              </Badge>
            )}
          </div>
          <p className="text-sm text-muted-foreground">
            {setupComplete ? (
              <>
                <span className="text-foreground font-medium">Your account is connected.</span>{" "}
                Stripe is active — charges and payouts are enabled. Zuvio collects
                each rental, deducts the 5% platform fee, and pays the remainder
                directly to your bank on the pickup date.
              </>
            ) : (
              <>
                <span className="text-foreground font-medium">Recommended.</span>{" "}
                Connect a Stripe Express account to start accepting paid bookings and
                receive renter payouts. Zuvio collects the rental, deducts a 5% platform
                fee, and pays the remainder directly to your bank on the pickup date.
                Your listings stay visible during your free trial — Stripe is only required
                to receive paid bookings.
              </>
            )}
          </p>

          {status?.requirements?.currently_due && status.requirements.currently_due.length > 0 && (
            <p className="text-xs text-yellow-400 mt-3">
              Stripe needs more info: {status.requirements.currently_due.slice(0, 3).join(", ")}
              {status.requirements.currently_due.length > 3 ? "…" : ""}
            </p>
          )}
          {status?.requirements?.disabled_reason && (
            <p className="text-xs text-red-400 mt-2">
              Restricted: {status.requirements.disabled_reason}
            </p>
          )}

          {status?.connected && (
            <div className="flex flex-wrap gap-x-6 gap-y-1 text-xs text-muted-foreground mt-3">
              <span>
                Charges:{" "}
                <span className={status.charges_enabled ? "text-emerald-400" : "text-yellow-400"}>
                  {status.charges_enabled ? "Enabled" : "Pending"}
                </span>
              </span>
              <span>
                Payouts:{" "}
                <span className={status.payouts_enabled ? "text-emerald-400" : "text-yellow-400"}>
                  {status.payouts_enabled ? "Enabled" : "Pending"}
                </span>
              </span>
            </div>
          )}

          <div className="mt-4 flex items-start gap-2 text-xs">
            <Banknote className="h-4 w-4 mt-0.5 text-muted-foreground shrink-0" />
            <div>
              {payout?.status ? (
                <>
                  <div className="text-muted-foreground">
                    Last payout:{" "}
                    <span
                      className={
                        payout.status === "paid"
                          ? "text-emerald-400 font-medium"
                          : "text-red-400 font-medium"
                      }
                    >
                      {payout.status === "paid" ? "Paid" : "Failed"}
                    </span>
                    {typeof payout.amount_cents === "number" && (
                      <> · ${(payout.amount_cents / 100).toFixed(2)}</>
                    )}
                    {payout.at && (
                      <> · {new Date(payout.at).toLocaleDateString()}</>
                    )}
                  </div>
                  {payout.status !== "paid" && payout.failure_message && (
                    <div className="text-red-400 mt-1">{payout.failure_message}</div>
                  )}
                </>
              ) : (
                <div className="text-muted-foreground">
                  Last payout: <span className="font-medium text-foreground/80">No payouts yet</span>
                  <div className="text-muted-foreground/80 mt-1">
                    Payouts will appear here once Stripe sends funds to your bank account.
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-2 shrink-0">
          <Button variant="ghost" size="sm" onClick={refresh} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          {!setupComplete && (
            <Button onClick={startOnboarding} disabled={submitting || loading}>
              {submitting ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <ExternalLink className="h-4 w-4 mr-2" />
              )}
              {status?.connected ? "Continue onboarding" : "Connect Stripe"}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}