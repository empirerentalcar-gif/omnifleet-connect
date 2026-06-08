import { useSearchParams, useNavigate } from "react-router-dom";
import { useTranslation, Trans } from "react-i18next";
import { CheckCircle, Phone, Mail, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import SEO from "@/components/SEO";

const ReservationConfirmed = () => {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const agencyName = searchParams.get("agency") || t('confirmed.defaultAgency');

  return (
    <div className="min-h-screen bg-background">
      <SEO title={t('confirmed.seoTitle')} description={t('confirmed.seoDescription')} path="/reservation-confirmed" noindex />
<main className="pt-8 pb-16">
        <div className="container mx-auto px-4 max-w-xl">
          <div className="glass-card glow-border rounded-2xl p-8 md:p-12 text-center animate-slide-up">
            <div className="w-20 h-20 rounded-full bg-accent/15 flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="h-10 w-10 text-accent" />
            </div>

            <h1 className="font-display text-3xl md:text-4xl font-bold mb-4">{t('confirmed.title')}</h1>

            <p className="text-lg text-muted-foreground mb-8">
              <Trans
                i18nKey="confirmed.body"
                components={{ agency: <span className="text-primary font-semibold">{agencyName}</span> }}
              />
            </p>

            <div className="glass-card rounded-xl p-6 mb-8 text-left space-y-4">
              <h3 className="font-display font-bold text-sm uppercase tracking-wider text-muted-foreground">{t('confirmed.whatNext')}</h3>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-primary/20 text-primary text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">1</span>
                  <p className="text-sm text-muted-foreground">{t('confirmed.step1')}</p>
                </div>
                <div className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-primary/20 text-primary text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">2</span>
                  <p className="text-sm text-muted-foreground">{t('confirmed.step2')}</p>
                </div>
                <div className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-primary/20 text-primary text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">3</span>
                  <p className="text-sm text-muted-foreground">{t('confirmed.step3')}</p>
                </div>
              </div>
            </div>

            <div
              role="note"
              className="rounded-lg p-4 mb-6 text-left text-sm border border-sky-400/30 bg-sky-400/10 text-sky-100"
            >
              <p className="font-semibold mb-1">A note on fees and taxes</p>
              <p>
                The amount charged to your payment method today covers your vehicle
                reservation only. Additional fees and applicable taxes will be collected
                directly by the agency at pickup. Your agency will confirm the final total
                before your rental begins.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                variant="hero"
                size="lg"
                className="flex-1 group"
                onClick={() => navigate("/")}
              >
                {t('confirmed.home')}
                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="flex-1 border-accent/30 hover:bg-accent/10"
                onClick={() => navigate("/search")}
              >
                {t('confirmed.more')}
              </Button>
            </div>
          </div>
        </div>
      </main>

    </div>
  );
};

export default ReservationConfirmed;
