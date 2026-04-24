import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import {
  CreditCard,
  CheckCircle2,
  AlertTriangle,
  Clock,
  RefreshCw,
  Loader2,
  ExternalLink,
} from "lucide-react";

type SubStatus = {
  subscription_status: "trial" | "active" | "payment_required" | "expired" | string;
  stripe_status: string | null;
  grace_period_end: string | null;
  subscription_current_period_end: string | null;
  trial_end_date: string | null;
  is_founding_member: boolean;
  founding_member_number: number | null;
  has_subscription: boolean;
  cancel_at_period_end: boolean;
};

const formatDate = (iso: string | null) => {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

const daysFromNow = (iso: string | null): number | null => {
  if (!iso) return null;
  return Math.ceil((new Date(iso).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
};

export function SubscriptionCard() {
  const { toast } = useToast();
  const [status, setStatus] = useState<SubStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [openingPortal, setOpeningPortal] = useState(false);

  const refresh = async () => {
    setLoading(true);
    const { data, error } = await supabase.functions.invoke("check-subscription-status");
    if (error) {
      toast({
        title: "Couldn't load billing status",
        description: error.message,
        variant: "destructive",
      });
    } else if (data) {
      setStatus(data as SubStatus);
    }
    setLoading(false);
  };

  useEffect(() => {
    refresh();
    const params = new URLSearchParams(window.location.search);
    if (params.get("subscription") === "success") {
      toast({
        title: "Subscription active",
        description: "Your $79/month Founding Member plan is now active.",
      });
      window.history.replaceState({}, "", window.location.pathname);
    } else if (params.get("subscription") === "cancelled") {
      window.history.replaceState({}, "", window.location.pathname);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const subscribe = async () => {
    setSubmitting(true);
    const { data, error } = await supabase.functions.invoke(
      "create-subscription-checkout",
    );
    setSubmitting(false);
    if (error || !data?.url) {
      toast({
        title: "Could not start checkout",
        description: error?.message ?? "Please try again.",
        variant: "destructive",
      });
      return;
    }
    window.location.href = data.url as string;
  };

  const openPortal = async () => {
    setOpeningPortal(true);
    const { data, error } = await supabase.functions.invoke("customer-portal");
    setOpeningPortal(false);
    if (error || !data?.url) {
      toast({
        title: "Could not open billing portal",
        description: error?.message ?? "Please try again.",
        variant: "destructive",
      });
      return;
    }
    window.location.href = data.url as string;
  };

  const s = status?.subscription_status;
  const isActive = s === "active";
  const isPaymentRequired = s === "payment_required";
  const isExpired = s === "expired";
  const isTrial = s === "trial";

  const trialDays = daysFromNow(status?.trial_end_date ?? null);
  const graceDays = daysFromNow(status?.grace_period_end ?? null);

  let badgeClass = "bg-yellow-500/15 text-yellow-400 border-yellow-500/30";
  let badgeLabel = "Loading";
  let Icon = Clock;
  if (isActive) {
    badgeClass = "bg-emerald-500/15 text-emerald-400 border-emerald-500/30";
    badgeLabel = status?.cancel_at_period_end ? "Active (cancels soon)" : "Active";
    Icon = CheckCircle2;
  } else if (isPaymentRequired) {
    badgeClass = "bg-red-500/15 text-red-400 border-red-500/30";
    badgeLabel = "Payment required";
    Icon = AlertTriangle;
  } else if (isExpired) {
    badgeClass = "bg-red-500/15 text-red-400 border-red-500/30";
    badgeLabel = "Expired";
    Icon = AlertTriangle;
  } else if (isTrial) {
    badgeClass = "bg-primary/15 text-primary border-primary/30";
    badgeLabel = trialDays !== null ? `Trial · ${trialDays}d left` : "Trial";
    Icon = Clock;
  }

  return (
    <div className="glass-card rounded-xl p-6 mb-10">
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2 flex-wrap">
            <h2 className="text-lg font-bold flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-primary" />
              Billing & Subscription
            </h2>
            {status && (
              <Badge variant="outline" className={badgeClass}>
                <Icon className="h-3 w-3 mr-1" />
                {badgeLabel}
              </Badge>
            )}
            {status?.is_founding_member && (
              <Badge variant="outline" className="bg-amber-500/15 text-amber-400 border-amber-500/30">
                Founding Member #{status.founding_member_number}
              </Badge>
            )}
          </div>

          <p className="text-sm text-muted-foreground">
            $79/month + 5% per confirmed booking. Cancel anytime from the billing portal.
          </p>

          {/* Soft block / payment required banner */}
          {isPaymentRequired && (
            <div className="mt-3 p-3 rounded-lg bg-red-500/10 border border-red-500/30">
              <p className="text-sm font-semibold text-red-400">
                Your last payment failed.
              </p>
              <p className="text-xs text-red-400/90 mt-1">
                {graceDays !== null && graceDays > 0
                  ? `You have ${graceDays} day${graceDays === 1 ? "" : "s"} to update your payment method before your vehicles are hidden from public search.`
                  : "Your grace period has ended. Update your payment method to restore your listing."}
              </p>
            </div>
          )}

          {isExpired && (
            <div className="mt-3 p-3 rounded-lg bg-red-500/10 border border-red-500/30">
              <p className="text-sm font-semibold text-red-400">
                Your trial has ended. Subscribe to make your vehicles visible again.
              </p>
            </div>
          )}

          {isActive && (
            <div className="flex flex-wrap gap-x-6 gap-y-1 text-xs text-muted-foreground mt-3">
              <span>
                Next billing date:{" "}
                <span className="text-foreground">
                  {formatDate(status?.subscription_current_period_end ?? null)}
                </span>
              </span>
              {status?.cancel_at_period_end && (
                <span className="text-yellow-400">
                  Cancels at end of period
                </span>
              )}
            </div>
          )}

          {isTrial && trialDays !== null && (
            <p className="text-xs text-muted-foreground mt-3">
              Trial ends {formatDate(status?.trial_end_date ?? null)} ({trialDays} day
              {trialDays === 1 ? "" : "s"} left).
            </p>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-2 shrink-0">
          <Button variant="ghost" size="sm" onClick={refresh} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>

          {status?.has_subscription ? (
            <Button onClick={openPortal} disabled={openingPortal || loading}>
              {openingPortal ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <ExternalLink className="h-4 w-4 mr-2" />
              )}
              Manage billing
            </Button>
          ) : (
            <Button onClick={subscribe} disabled={submitting || loading}>
              {submitting ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <CreditCard className="h-4 w-4 mr-2" />
              )}
              Subscribe — $79/mo
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}