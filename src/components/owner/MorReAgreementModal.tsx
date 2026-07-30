import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

type Props = {
  agencyId: string;
  onAccepted: () => void;
};

export function MorReAgreementModal({ agencyId, onAccepted }: Props) {
  const { toast } = useToast();
  const [checked, setChecked] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleContinue = async () => {
    if (!checked || submitting) return;
    setSubmitting(true);
    try {
      const { data, error } = await supabase.functions.invoke("record-mor-agreement");
      if (error || !data?.success) {
        toast({
          title: "Couldn't record agreement",
          description: error?.message ?? "Please try again.",
          variant: "destructive",
        });
        return;
      }
      toast({
        title: "Agreement recorded",
        description: "Thank you. You can continue using your dashboard.",
      });
      onAccepted();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="mor-reagree-title"
    >
      <div className="glass-card max-w-lg w-full rounded-2xl border border-white/10 bg-background p-8 shadow-2xl">
        <h2 id="mor-reagree-title" className="text-2xl font-bold mb-3">
          Updated Terms of Service (v2026.07)
        </h2>
        <p className="text-sm text-muted-foreground leading-relaxed mb-6">
          We've updated our Terms of Service. In addition to our Payment Processing terms,
          the updated terms add <strong>Section 5 — Non-Circumvention and Direct Booking
          Prohibition</strong>, which prohibits soliciting, accepting, or diverting bookings
          from Zuvio-sourced renters outside the platform. To continue managing your fleet and
          receiving payouts on Zuvio, please review and accept the updated terms.
        </p>

        <div className="flex items-start gap-3 p-4 rounded-lg border border-white/10 bg-muted/30 mb-6">
          <Checkbox
            id="mor-reagree"
            checked={checked}
            onCheckedChange={(v) => setChecked(v === true)}
            disabled={submitting}
            className="mt-0.5"
          />
          <label
            htmlFor="mor-reagree"
            className="text-sm leading-relaxed cursor-pointer"
          >
            I agree that I am the Merchant of Record for all transactions and accept full
            responsibility for disputes and chargebacks, and I have read and accept the
            updated Terms of Service including the Non-Circumvention and Direct Booking
            Prohibition, as outlined in Zuvio's{" "}
            <a
              href="/terms"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary underline"
            >
              Terms of Service
            </a>
            .
          </label>
        </div>

        <Button
          onClick={handleContinue}
          disabled={!checked || submitting}
          className="w-full"
          size="lg"
        >
          {submitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
          Continue
        </Button>
      </div>
    </div>
  );
}