import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { getStripe } from "@/lib/stripe";
import { Loader2, ShieldCheck } from "lucide-react";
import { BookingFeeBreakdown } from "@/components/payment/BookingFeeBreakdown";
import { type PaymentSettings } from "@/lib/payment-settings";

interface ReserveDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  vehicleId: string;
  vehicleLabel: string;
  dailyRate: number;
  paymentSettings?: PaymentSettings;
  pickupRequirements?: string[] | null;
  pickupInstructions?: string | null;
}

type IntentInfo = {
  booking_id: string;
  client_secret: string;
  intent_type: "payment_intent" | "setup_intent";
  total_amount_cents: number;
  platform_fee_cents: number;
  rental_days: number;
};

const stripePromise = getStripe();

export const ReserveDrawer = ({
  open,
  onOpenChange,
  vehicleId,
  vehicleLabel,
  dailyRate,
  paymentSettings,
  pickupRequirements,
  pickupInstructions,
}: ReserveDrawerProps) => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [step, setStep] = useState<"form" | "pay">("form");
  const [intent, setIntent] = useState<IntentInfo | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const today = new Date().toISOString().slice(0, 10);
  const [pickupDate, setPickupDate] = useState("");
  const [dropoffDate, setDropoffDate] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  useEffect(() => {
    if (!open) {
      setStep("form");
      setIntent(null);
      setSubmitting(false);
    }
  }, [open]);

  const days = (() => {
    if (!pickupDate || !dropoffDate) return 0;
    const d1 = new Date(pickupDate);
    const d2 = new Date(dropoffDate);
    const diff = Math.ceil((d2.getTime() - d1.getTime()) / (1000 * 60 * 60 * 24));
    return diff > 0 ? diff : 0;
  })();
  const estTotal = days * dailyRate;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pickupDate || !dropoffDate || days < 1) {
      toast({ title: t('reserveDrawer.errPickDates'), variant: "destructive" });
      return;
    }
    setSubmitting(true);
    try {
      const { data, error } = await supabase.functions.invoke("create-booking-payment", {
        body: {
          vehicle_id: vehicleId,
          pickup_date: pickupDate,
          dropoff_date: dropoffDate,
          renter_name: name,
          renter_email: email,
          renter_phone: phone,
        },
      });
      if (error) throw new Error(error.message);
      if (!data?.client_secret) throw new Error("No client_secret returned");
      setIntent(data as IntentInfo);
      setStep("pay");
    } catch (err) {
      toast({
        title: t('reserveDrawer.errCouldntStart'),
        description: err instanceof Error ? err.message : String(err),
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="overflow-y-auto sm:max-w-lg" style={{ backgroundColor: "#0d1b2e", color: "#fff", borderColor: "rgba(45,212,191,0.3)" }}>
        <SheetHeader>
          <SheetTitle className="text-white">{t('reserveDrawer.title', { label: vehicleLabel })}</SheetTitle>
          <SheetDescription className="text-white/60">
            {step === "form"
              ? t('reserveDrawer.descForm')
              : t('reserveDrawer.descPay')}
          </SheetDescription>
        </SheetHeader>

        {step === "form" && (
          <form onSubmit={handleSubmit} className="space-y-4 mt-6">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-white/80">{t('reserveDrawer.pickup')}</Label>
                <Input
                  type="date"
                  required
                  min={today}
                  value={pickupDate}
                  onChange={(e) => setPickupDate(e.target.value)}
                  className="bg-white/5 border-white/20 text-white"
                />
              </div>
              <div>
                <Label className="text-white/80">{t('reserveDrawer.dropoff')}</Label>
                <Input
                  type="date"
                  required
                  min={pickupDate || today}
                  value={dropoffDate}
                  onChange={(e) => setDropoffDate(e.target.value)}
                  className="bg-white/5 border-white/20 text-white"
                />
              </div>
            </div>
            <div>
              <Label className="text-white/80">{t('reserveDrawer.fullName')}</Label>
              <Input required minLength={2} maxLength={100} value={name} onChange={(e) => setName(e.target.value)} className="bg-white/5 border-white/20 text-white" />
            </div>
            <div>
              <Label className="text-white/80">{t('reserveDrawer.email')}</Label>
              <Input type="email" required maxLength={255} value={email} onChange={(e) => setEmail(e.target.value)} className="bg-white/5 border-white/20 text-white" />
            </div>
            <div>
              <Label className="text-white/80">{t('reserveDrawer.phone')}</Label>
              <Input type="tel" required maxLength={30} value={phone} onChange={(e) => setPhone(e.target.value)} className="bg-white/5 border-white/20 text-white" />
            </div>

            {days > 0 && (
              <div className="rounded-lg p-4 bg-white/5 border border-white/10 text-sm text-white/80 space-y-1">
                <div className="flex justify-between"><span>{t('reserveDrawer.daysSummary', { count: days, rate: dailyRate })}</span><span>${estTotal.toFixed(2)}</span></div>
                <div className="flex justify-between text-xs text-white/50"><span>{t('reserveDrawer.feeIncluded')}</span></div>
              </div>
            )}

            {days > 0 && (
              <BookingFeeBreakdown
                dailyRate={dailyRate}
                days={days}
                settings={paymentSettings}
                pickupRequirements={pickupRequirements}
                pickupInstructions={pickupInstructions}
              />
            )}

            <Button type="submit" disabled={submitting} className="w-full" style={{ backgroundColor: "#2dd4bf", color: "#0d1b2e" }}>
              {submitting ? (<><Loader2 className="h-4 w-4 mr-2 animate-spin" />{t('reserveDrawer.continuing')}</>) : t('reserveDrawer.continue')}
            </Button>
            <p className="text-xs text-white/50 flex items-center gap-1.5"><ShieldCheck className="h-3 w-3" /> {t('reserveDrawer.stripeSecured')}</p>
          </form>
        )}

        {step === "pay" && intent && (
          <Elements
            stripe={stripePromise}
            options={{
              clientSecret: intent.client_secret,
              appearance: { theme: "night", variables: { colorPrimary: "#2dd4bf" } },
            }}
          >
            <PaymentForm
              intent={intent}
              onDone={() => {
                onOpenChange(false);
                toast({
                  title: t('reserveDrawer.submitted'),
                  description:
                    intent.intent_type === "setup_intent"
                      ? t('reserveDrawer.submittedSetup')
                      : t('reserveDrawer.submittedPay'),
                });
              }}
            />
          </Elements>
        )}
      </SheetContent>
    </Sheet>
  );
};

const PaymentForm = ({ intent, onDone }: { intent: IntentInfo; onDone: () => void }) => {
  const { t } = useTranslation();
  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();
  const [submitting, setSubmitting] = useState(false);

  const handlePay = async () => {
    if (!stripe || !elements) return;
    setSubmitting(true);
    const returnUrl = `${window.location.origin}/reservation-confirmed?booking=${intent.booking_id}`;
    const result =
      intent.intent_type === "payment_intent"
        ? await stripe.confirmPayment({
            elements,
            confirmParams: { return_url: returnUrl },
            redirect: "if_required",
          })
        : await stripe.confirmSetup({
            elements,
            confirmParams: { return_url: returnUrl },
            redirect: "if_required",
          });
    setSubmitting(false);
    if (result.error) {
      toast({ title: t('reserveDrawer.errPayment'), description: result.error.message, variant: "destructive" });
      return;
    }
    // Renter confirmation email is now sent server-side from the Stripe webhook
    // (payment_intent.amount_capturable_updated / setup_intent.succeeded).
    onDone();
  };

  return (
    <div className="space-y-4 mt-6">
      <div className="rounded-lg p-4 bg-white/5 border border-white/10 text-sm">
        <div className="flex justify-between text-white/80"><span>{t('reserveDrawer.totalLine', { count: intent.rental_days })}</span><span>${(intent.total_amount_cents / 100).toFixed(2)}</span></div>
        <p className="text-xs text-white/50 mt-2">
          {intent.intent_type === "payment_intent"
            ? t('reserveDrawer.payNote')
            : t('reserveDrawer.saveNote')}
        </p>
      </div>
      <PaymentElement />
      <Button onClick={handlePay} disabled={!stripe || submitting} className="w-full" style={{ backgroundColor: "#2dd4bf", color: "#0d1b2e" }}>
        {submitting ? (<><Loader2 className="h-4 w-4 mr-2 animate-spin" />{t('reserveDrawer.processing')}</>) : intent.intent_type === "payment_intent" ? t('reserveDrawer.authorizeBtn') : t('reserveDrawer.saveBtn')}
      </Button>
    </div>
  );
};