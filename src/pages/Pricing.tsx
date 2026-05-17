import { Button } from "@/components/ui/button";
import { Check, Ban, ShieldCheck, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import SEO from "@/components/SEO";
import { PricingCard, PricingROI } from "@/components/pricing/PricingCard";
import StripeBadge from "@/components/StripeBadge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const Pricing = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const standardFeatures = t('pricing.standardFeatures', { returnObjects: true }) as string[];
  const faqs = t('pricing.faqs', { returnObjects: true }) as { q: string; a: string }[];

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title={t('pricing.seoTitle')}
        description={t('pricing.seoDescription')}
        path="/pricing"
      />
{/* Hero */}
      <section className="pt-32 pb-16 md:pt-40 md:pb-20">
        <div className="container mx-auto px-4 max-w-4xl text-center">
          <h1 className="text-3xl md:text-5xl font-bold tracking-tight mb-6">
            {t('pricing.title')}{" "}
            <span className="text-gradient">{t('pricing.titleAccent')}</span>
          </h1>
          <p className="text-muted-foreground text-lg md:text-xl max-w-3xl mx-auto leading-relaxed">
            {t('pricing.intro')}
          </p>
          <p className="mt-4 text-foreground font-semibold text-base md:text-lg">
            {t('pricing.noFees')}
          </p>
        </div>
      </section>

      {/* Plans */}
      <section className="pb-20">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="grid md:grid-cols-2 gap-8">
            {/* Founding Member — shared component */}
            <div>
              <PricingCard />
            </div>

            {/* Standard Growth */}
            <div className="glass-card rounded-2xl p-8 flex flex-col opacity-80 relative overflow-hidden">
              <div className="absolute top-4 right-4">
                <span className="bg-secondary text-muted-foreground text-xs font-bold px-3 py-1 rounded-full">
                  {t('pricing.comingSoon')}
                </span>
              </div>
              <h3 className="text-xl font-bold mb-1">{t('pricing.standardPlan')}</h3>
              <p className="text-sm text-muted-foreground mb-6">{t('pricing.standardTier')}</p>
              <div className="mb-6">
                <span className="text-4xl font-bold text-foreground">$149</span>
                <span className="text-muted-foreground">{t('pricing.perMonth')}</span>
                <span className="block text-sm text-muted-foreground font-medium mt-1">{t('pricing.plus7')}</span>
              </div>
              <ul className="space-y-3 mb-8 flex-1">
                {standardFeatures.map((f) => (
                  <li key={f} className="flex items-start gap-3 text-sm text-foreground">
                    <Check className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
              <Button variant="outline" size="lg" className="w-full" disabled>
                {t('pricing.comingSoon')}
              </Button>
            </div>
          </div>

          {/* ROI section */}
          <PricingROI />

          {/* Payment trust badge */}
          <div className="flex justify-center mt-10">
            <StripeBadge />
          </div>
        </div>
      </section>

      {/* Why Booking Fee */}
      <section className="pb-20">
        <div className="container mx-auto px-4 max-w-3xl text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">{t('pricing.successTitle')}</h2>
          <p className="text-muted-foreground text-lg leading-relaxed mb-4">
            {t('pricing.successBody')}
          </p>
          <p className="text-foreground font-semibold text-lg mb-4">
            {t('pricing.successQuote')}
          </p>
          <p className="text-sm text-accent font-medium mb-6">
            {t('pricing.riskFree')}
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Ban className="h-4 w-4 text-accent" />
              {t('pricing.noSetup')}
            </div>
            <div className="flex items-center gap-2">
              <Ban className="h-4 w-4 text-accent" />
              {t('pricing.noContracts')}
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-accent" />
              {t('pricing.cancelAny')}
            </div>
          </div>
        </div>
      </section>

      {/* Owner FAQ */}
      <section className="pb-20">
        <div className="container mx-auto px-4 max-w-3xl">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-10">{t('pricing.faqTitle')}</h2>
          <Accordion type="single" collapsible className="space-y-2">
            {faqs.map((faq, i) => (
              <AccordionItem
                key={i}
                value={`faq-${i}`}
                className="glass-card rounded-xl px-6 border-border/30"
              >
                <AccordionTrigger className="text-left text-foreground hover:no-underline">
                  {faq.q}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground leading-relaxed">
                  {faq.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* Final CTA */}
      <section className="pb-20">
        <div className="container mx-auto px-4 max-w-3xl text-center">
          <Button variant="hero" size="xl" className="group text-base" onClick={() => navigate("/signup")}>
            <span>{t('pricing.lockBtn')}</span>
            <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
          </Button>
        </div>
      </section>

    </div>
  );
};

export default Pricing;
