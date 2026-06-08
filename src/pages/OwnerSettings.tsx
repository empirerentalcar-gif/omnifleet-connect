import { useEffect, useState, useMemo, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Loader2, Save } from "lucide-react";
import SEO from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { PaymentSettingsForm } from "@/components/payment/PaymentSettingsForm";
import {
  emptyPaymentSettings,
  normalizePaymentSettings,
  validatePaymentSettings,
  type PaymentSettings,
  type PaymentMethodKey,
} from "@/lib/payment-settings";

// Parse payment_methods from DB (handles both array and object shapes)
const parseDbPaymentMethods = (raw: unknown): { methods: PaymentMethodKey[]; other_text: string } => {
  if (!raw) return { methods: [], other_text: "" };
  if (Array.isArray(raw)) {
    return { methods: raw.filter((m): m is string => typeof m === "string") as PaymentMethodKey[], other_text: "" };
  }
  if (typeof raw === "object" && raw !== null) {
    const obj = raw as Record<string, unknown>;
    const methods = Array.isArray(obj.methods)
      ? (obj.methods.filter((m): m is string => typeof m === "string") as PaymentMethodKey[])
      : [];
    const other_text = typeof obj.other_text === "string" ? obj.other_text : "";
    return { methods, other_text };
  }
  return { methods: [], other_text: "" };
};

const toDbPaymentMethods = (s: PaymentSettings): unknown => {
  if (s.payment_methods.includes("other") && s.other_payment_text.trim()) {
    return { methods: s.payment_methods, other_text: s.other_payment_text.trim() };
  }
  return s.payment_methods;
};

const OwnerSettings = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showValidation, setShowValidation] = useState(false);
  const [agencyId, setAgencyId] = useState<string | null>(null);
  const [settings, setSettings] = useState<PaymentSettings>(emptyPaymentSettings());

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      navigate("/signin");
      return;
    }
    (async () => {
      const { data, error } = await supabase
        .from("agencies")
        .select("id, payment_methods, payment_restrictions, fee_settings, tax_rate, custom_fees, fees_setup_complete")
        .eq("owner_user_id", user.id)
        .maybeSingle();
      if (error) {
        toast({ title: "Failed to load settings", description: error.message, variant: "destructive" });
      } else if (data) {
        setAgencyId(data.id);
        const parsedMethods = parseDbPaymentMethods(data.payment_methods);
        const normalized = normalizePaymentSettings({
          payment_methods: parsedMethods.methods,
          other_payment_text: parsedMethods.other_text,
          payment_restrictions: data.payment_restrictions,
          tax_rate: data.tax_rate,
          fees: data.fee_settings,
          custom_fees: data.custom_fees,
        });
        setSettings(normalized);
      }
      setLoading(false);
    })();
  }, [user, authLoading, navigate, toast]);

  const validationErrors = useMemo(() => validatePaymentSettings(settings), [settings]);
  const isValid = validationErrors.length === 0;

  const handleSave = useCallback(async () => {
    setShowValidation(true);
    if (!isValid) {
      toast({
        title: "Please fix the errors",
        description: validationErrors[0],
        variant: "destructive",
      });
      return;
    }
    if (!agencyId) return;
    setSaving(true);

    const dbPayload = {
      payment_methods: toDbPaymentMethods(settings) as import("@/integrations/supabase/client").Json,
      payment_restrictions: settings.payment_restrictions.trim() || null,
      fee_settings: settings.fees as unknown as import("@/integrations/supabase/client").Json,
      tax_rate: settings.tax_rate,
      custom_fees: settings.custom_fees as unknown as import("@/integrations/supabase/client").Json,
      fees_setup_complete: true,
    };

    const { error } = await supabase
      .from("agencies")
      .update(dbPayload)
      .eq("id", agencyId);

    setSaving(false);
    if (error) {
      toast({ title: "Save failed", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: "Settings saved", description: "Your payment & fee defaults are updated." });
  }, [agencyId, isValid, settings, toast, validationErrors]);

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Payment & Fee Settings | ZUVIO"
        description="Set the payment methods and fees that apply to all your rental vehicles."
        path="/owner/settings"
        noindex
      />
      <main className="pt-6 sm:pt-8 pb-16">
        <div className="container mx-auto px-4 max-w-3xl">
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary mb-4"
          >
            <ArrowLeft className="h-4 w-4" /> Back to Dashboard
          </Link>

          <div className="mb-6">
            <h1 className="text-2xl md:text-3xl font-bold">Payment &amp; Fee Settings</h1>
            <p className="text-muted-foreground text-sm mt-1">
              These are your agency defaults. They apply to all of your vehicles unless you
              override them on a specific listing.
            </p>
          </div>

          <div className="glass-card rounded-xl p-5 sm:p-6">
            <PaymentSettingsForm
              value={settings}
              onChange={setSettings}
              showValidation={showValidation}
            />

            <div className="mt-8 flex flex-col sm:flex-row gap-2 sm:justify-end">
              <Button variant="outline" onClick={() => navigate("/dashboard")} disabled={saving}>
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={saving || (showValidation && !isValid)}>
                {saving ? (
                  <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Saving…</>
                ) : (
                  <><Save className="h-4 w-4 mr-2" /> Save Settings</>
                )}
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default OwnerSettings;
