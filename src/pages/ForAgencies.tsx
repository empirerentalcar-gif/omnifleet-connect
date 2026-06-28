import SEO from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  ArrowRight, Check, DollarSign, TrendingUp, Eye, Phone, ShieldCheck,
  Ban, Users, CalendarCheck, CreditCard, ClipboardList, UserCheck,
  XCircle, Clock,
} from "lucide-react";
import { PricingCard, PricingROI } from "@/components/pricing/PricingCard";
import ObjectionHandling from "@/components/ObjectionHandling";

const ForAgencies = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const heroBullets = t('forAgencies.heroBullets', { returnObjects: true }) as string[];
  const moneyItems = t('forAgencies.moneyItems', { returnObjects: true }) as string[];
  const problemItems = t('forAgencies.problemItems', { returnObjects: true }) as string[];
  const solutionItems = t('forAgencies.solutionItems', { returnObjects: true }) as string[];
  const features = t('forAgencies.features', { returnObjects: true }) as string[];
  const howSteps = t('forAgencies.howSteps', { returnObjects: true }) as string[];
  const controlItems = t('forAgencies.controlItems', { returnObjects: true }) as string[];

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title={t('forAgencies.seoTitle')}
        description={t('forAgencies.seoDescription')}
        path="/for-agencies"
      />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "WebPage",
        "name": "For Agencies — ZUVIO",
        "description": "Grow your car rental business with Zuvio. Get direct booking requests, keep control of pricing, and increase revenue.",
        "url": "https://gozuvio.com/for-agencies",
        "isPartOf": { "@type": "WebSite", "name": "ZUVIO", "url": "https://gozuvio.com" }
      }) }} />
{/* 1. HERO */}
      <section className="pt-28 md:pt-36 pb-16 md:pb-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-hero" />
        <div className="absolute top-1/3 right-1/4 w-[500px] h-[500px] bg-primary/8 rounded-full blur-3xl" />
        <div className="container mx-auto px-4 relative z-10 max-w-4xl">
          <h1 className="font-display text-4xl md:text-6xl font-bold mb-6 leading-tight">
            {t('forAgencies.heroTitle')}{" "}
            <span className="text-gradient">{t('forAgencies.heroTitleAccent')}</span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-3xl">
            {t('forAgencies.heroSubtitle')}
          </p>
          <ul className="space-y-3 mb-10">
            {heroBullets.map((b) => (
              <li key={b} className="flex items-center gap-3 text-foreground">
                <Check className="h-5 w-5 text-accent shrink-0" />
                <span className="font-medium">{b}</span>
              </li>
            ))}
          </ul>
          <div className="flex flex-col sm:flex-row gap-4">
            <Button variant="hero" size="xl" className="group text-base" onClick={() => navigate("/signup")}>
              <span>{t('forAgencies.ctaFounding')}</span>
              <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button variant="outline" size="xl" className="text-base border-accent/30 hover:bg-accent/10" onClick={() => navigate("/signup")}>
              {t('forAgencies.ctaStart')}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-4">{t('forAgencies.noContracts')}</p>
        </div>
      </section>

      {/* 2. MONEY SECTION */}
      <section className="py-20 md:py-28 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-accent/5 to-primary/10" />
        <div className="container mx-auto px-4 relative z-10 max-w-3xl text-center">
          <span className="inline-block px-4 py-2 rounded-full bg-accent/10 text-accent text-sm font-medium mb-4">
            {t('forAgencies.moneyBadge')}
          </span>
          <h2 className="font-display text-3xl md:text-5xl font-bold mb-4">
            {t('forAgencies.moneyTitle')} <span className="text-gradient">{t('forAgencies.moneyTitleAccent')}</span>
          </h2>
          <p className="text-lg text-muted-foreground mb-10">
            {t('forAgencies.moneyBody')}
          </p>
          <div className="grid sm:grid-cols-3 gap-6 mb-10">
            {[
              { icon: CalendarCheck, text: moneyItems[0] },
              { icon: TrendingUp, text: moneyItems[1] },
              { icon: ShieldCheck, text: moneyItems[2] },
            ].map(({ icon: Icon, text }) => (
              <div key={text} className="glass-card rounded-xl p-6 flex flex-col items-center gap-3">
                <Icon className="h-8 w-8 text-accent" />
                <p className="font-semibold text-foreground">{text}</p>
              </div>
            ))}
          </div>
          <p className="text-xl font-display font-bold text-foreground">
            {t('forAgencies.moneyFooter')} <span className="text-gradient">{t('forAgencies.moneyFooterAccent')}</span>
          </p>
        </div>
      </section>

      {/* 3. PROBLEM */}
      <section className="py-20 md:py-28">
        <div className="container mx-auto px-4 max-w-3xl text-center">
          <h2 className="font-display text-3xl md:text-5xl font-bold mb-10">
            {t('forAgencies.problemTitle')} <span className="text-gradient">{t('forAgencies.problemTitleAccent')}</span>
          </h2>
          <div className="space-y-5 max-w-xl mx-auto">
            {problemItems.map((text) => (
              <div key={text} className="flex items-center gap-4 glass-card rounded-xl p-5">
                <XCircle className="h-6 w-6 text-destructive shrink-0" />
                <p className="font-semibold text-foreground text-left">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. SOLUTION */}
      <section className="py-20 md:py-28 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent" />
        <div className="container mx-auto px-4 relative z-10 max-w-3xl text-center">
          <h2 className="font-display text-3xl md:text-5xl font-bold mb-4">
            {t('forAgencies.solutionTitle')} <span className="text-gradient">{t('forAgencies.solutionTitleAccent')}</span>
          </h2>
          <p className="text-lg text-muted-foreground mb-10">
            {t('forAgencies.solutionBody')}
          </p>
          <div className="space-y-4 max-w-xl mx-auto">
            {solutionItems.map((s) => (
              <div key={s} className="flex items-center gap-4 glass-card rounded-xl p-5">
                <Check className="h-5 w-5 text-accent shrink-0" />
                <p className="font-semibold text-foreground text-left">{s}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. FEATURES */}
      <section className="py-20 md:py-28">
        <div className="container mx-auto px-4 max-w-4xl">
          <h2 className="font-display text-3xl md:text-5xl font-bold text-center mb-14">
            {t('forAgencies.featuresTitle')} <span className="text-gradient">{t('forAgencies.featuresTitleAccent')}</span>
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: Eye, title: features[0] },
              { icon: Phone, title: features[1] },
              { icon: UserCheck, title: features[2] },
              { icon: CreditCard, title: features[3] },
              { icon: ClipboardList, title: features[4] },
              { icon: ShieldCheck, title: features[5] },
            ].map(({ icon: Icon, title }) => (
              <div key={title} className="glass-card rounded-xl p-6 flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center shrink-0">
                  <Icon className="h-6 w-6 text-accent" />
                </div>
                <p className="font-display font-semibold text-foreground">{title}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. HOW IT WORKS */}
      <section className="py-20 md:py-28 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-background via-secondary/10 to-background" />
        <div className="container mx-auto px-4 relative z-10 max-w-3xl">
          <h2 className="font-display text-3xl md:text-5xl font-bold text-center mb-14">
            {t('forAgencies.howTitle')} <span className="text-gradient">{t('forAgencies.howTitleAccent')}</span>
          </h2>
          <div className="space-y-6">
            {howSteps.map((step, i) => (
              <div key={step} className="flex gap-5 items-center">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-primary-foreground text-lg font-bold shrink-0">
                  {i + 1}
                </div>
                <p className="font-display text-lg font-semibold text-foreground">{step}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 7. PRICING */}
      <section className="py-20 md:py-28 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-background via-secondary/10 to-background" />
        <div className="container mx-auto px-4 relative z-10 max-w-lg">
          <div className="text-center mb-14">
            <h2 className="font-display text-3xl md:text-5xl font-bold mb-4">
              {t('forAgencies.pricingTitle')} <span className="text-gradient">{t('forAgencies.pricingTitleAccent')}</span>
            </h2>
            <p className="text-lg text-muted-foreground">
              {t('forAgencies.pricingSub')}
            </p>
          </div>
          <PricingCard />
          <PricingROI />
        </div>
      </section>

      <ObjectionHandling />

      {/* 8. WHY BOOKING FEE */}
      <section className="py-20 md:py-28">
        <div className="container mx-auto px-4 max-w-3xl text-center">
          <h2 className="font-display text-3xl md:text-4xl font-bold mb-6">
            {t('forAgencies.successTitle')} <span className="text-gradient">{t('forAgencies.successTitleAccent')}</span>
          </h2>
          <p className="text-lg text-muted-foreground mb-4">
            {t('forAgencies.successBody')}
          </p>
          <p className="text-xl font-bold text-foreground mb-8">
            {t('forAgencies.successQuote')} <span className="text-accent">{t('forAgencies.successQuoteAccent')}</span>
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Ban className="h-4 w-4 text-accent" />
              {t('forAgencies.noSetup')}
            </div>
            <div className="flex items-center gap-2">
              <Ban className="h-4 w-4 text-accent" />
              {t('forAgencies.noLong')}
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-accent" />
              {t('forAgencies.cancel')}
            </div>
          </div>
        </div>
      </section>

      {/* 9. TRUST */}
      <section className="py-20 md:py-28 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent" />
        <div className="container mx-auto px-4 relative z-10 max-w-3xl text-center">
          <h2 className="font-display text-3xl md:text-5xl font-bold mb-10">
            {t('forAgencies.controlTitle')} <span className="text-gradient">{t('forAgencies.controlTitleAccent')}</span>
          </h2>
          <div className="grid sm:grid-cols-3 gap-6">
            {[
              { icon: DollarSign, text: controlItems[0] },
              { icon: ShieldCheck, text: controlItems[1] },
              { icon: Users, text: controlItems[2] },
            ].map(({ icon: Icon, text }) => (
              <div key={text} className="glass-card rounded-xl p-6 flex flex-col items-center gap-3">
                <Icon className="h-8 w-8 text-accent" />
                <p className="font-semibold text-foreground">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 10. URGENCY */}
      <section className="py-20 md:py-28">
        <div className="container mx-auto px-4 max-w-3xl text-center">
          <div className="glass-card glow-border rounded-2xl p-10">
            <Clock className="h-10 w-10 text-accent mx-auto mb-4" />
            <h2 className="font-display text-2xl md:text-4xl font-bold mb-4">
              {t('forAgencies.urgencyTitle')}
            </h2>
            <p className="text-lg text-muted-foreground">
              {t('forAgencies.urgencyBody')}
            </p>
          </div>
        </div>
      </section>

      {/* 11. FINAL CTA */}
      <section className="py-24 md:py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-hero" />
        <div className="absolute top-1/3 left-1/3 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse-glow" />
        <div className="container mx-auto px-4 relative z-10 text-center">
          <h2 className="font-display text-3xl md:text-5xl lg:text-6xl font-bold mb-6">
            {t('forAgencies.finalTitle')}
            <br />
            <span className="text-gradient">{t('forAgencies.finalTitleAccent')}</span>
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-2">
            {t('forAgencies.finalPricing')}
          </p>
          <p className="text-sm text-muted-foreground mb-6">
            {t('forAgencies.finalRisk')}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button variant="hero" size="xl" className="group text-base" onClick={() => navigate("/signup")}>
              <span>{t('forAgencies.finalLock')}</span>
              <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button variant="outline" size="xl" className="text-base border-accent/30 hover:bg-accent/10" onClick={() => navigate("/signup")}>
              {t('forAgencies.finalGet')}
            </Button>
          </div>
        </div>
      </section>

    </div>
  );
};

export default ForAgencies;
