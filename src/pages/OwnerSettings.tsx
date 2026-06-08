import { useEffect, useState } from "react";
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
  type PaymentSettings,
} from "@/lib/payment-settings";

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
        .select("id, payment_settings")
        .eq("owner_user_id", user.id)
        .maybeSingle();
      if (error) {
        toast({ title: "Failed to load settings", description: error.message, variant: "destructive" });
      } else if (data) {
        setAgencyId(data.id);
        setSettings(normalizePaymentSettings(data.payment_settings));
      }
      setLoading(false);
    })();
  }, [user, authLoading, navigate, toast]);

  const handleSave = async () => {
    if (settings.payment_methods.length === 0) {
      setShowValidation(true);
      toast({
        title: "Select a payment method",
        description: "Please select at least one accepted payment method.",
        variant: "destructive",
      });
      return;
    }
    if (!agencyId) return;
    setSaving(true);
    const { error } = await supabase
      .from("agencies")
      .update({ payment_settings: settings as never })
      .eq("id", agencyId);
    setSaving(false);
    if (error) {
      toast({ title: "Save failed", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: "Settings saved", description: "Your payment & fee defaults are updated." });
  };

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
              <Button variant="outline" onClick={() => navigate("/dashboard")}>Cancel</Button>
              <Button onClick={handleSave} disabled={saving}>
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