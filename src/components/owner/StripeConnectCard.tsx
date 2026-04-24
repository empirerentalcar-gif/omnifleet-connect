import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle2, AlertCircle, ExternalLink, RefreshCw, Loader2 } from "lucide-react";

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
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const refresh = async () => {
    setLoading(true);
    const { data, error } = await supabase.functions.invoke("connect-account-status");
    if (error) {
      toast({
        title: "Couldn't load Stripe status",
        description: error.message,
        variant: "destructive",
      });
    } else if (data) {
      setStatus(data as ConnectStatus);
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
    setSubmitting(true);
    const { data, error } = await supabase.functions.invoke("create-connect-account");
    setSubmitting(false);
    if (error || !data?.url) {
      toast({
        title: "Could not start Stripe onboarding",
        description: error?.message ?? "Please try again.",
        variant: "destructive",
      });
      return;
    }
    window.location.href = data.url as string;
  };

  const isActive = status?.status === "active";
  const isRestricted = status?.status === "restricted";

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
            Connect a Stripe Express account to receive renter payouts. Zuvio collects
            the rental, deducts a 5% platform fee, and pays the remainder directly to
            your bank on the pickup date.
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
        </div>

        <div className="flex flex-col sm:flex-row gap-2 shrink-0">
          <Button variant="ghost" size="sm" onClick={refresh} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <Button onClick={startOnboarding} disabled={submitting || loading}>
            {submitting ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <ExternalLink className="h-4 w-4 mr-2" />
            )}
            {isActive
              ? "Update Stripe details"
              : status?.connected
              ? "Continue onboarding"
              : "Connect Stripe"}
          </Button>
        </div>
      </div>
    </div>
  );
}