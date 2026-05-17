import { Button } from "@/components/ui/button";
import { ArrowRight, Globe, CalendarCheck, Clock, Phone, Megaphone, CheckCircle2, ShieldCheck } from "lucide-react";
import { useNavigate } from "react-router-dom";
import SEO from "@/components/SEO";
import { useTranslation, Trans } from "react-i18next";

const benefitIcons = [Globe, CalendarCheck, Clock, Phone, Megaphone];

const OwnerBenefits = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const benefits = t("ownerBenefits.benefits", { returnObjects: true }) as Array<{
    title: string;
    description: string;
    points: string[];
    footer: string;
  }>;
  const whyJoin = t("ownerBenefits.why", { returnObjects: true }) as string[];
  const stayInControl = t("ownerBenefits.controlItems", { returnObjects: true }) as string[];

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title={t("ownerBenefits.seoTitle")}
        description={t("ownerBenefits.seoDescription")}
        path="/owner-benefits"
      />
{/* Hero */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-hero" />
        <div className="absolute top-1/3 left-1/4 w-[500px] h-[500px] bg-primary/8 rounded-full blur-3xl" />
        <div className="container mx-auto px-4 relative z-10 text-center max-w-4xl">
          <h1 className="font-display text-4xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
            {t("ownerBenefits.heroTitle")}{" "}
            <span className="text-gradient">{t("ownerBenefits.heroTitleAccent")}</span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
            {t("ownerBenefits.heroBody1")}
            <br /><br />
            <strong className="text-foreground">{t("ownerBenefits.heroBody2")}</strong>
            <br /><br />
            {t("ownerBenefits.heroBody3")}
          </p>
        </div>
      </section>

      {/* What ZUVIO Does for You */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <h2 className="font-display text-3xl md:text-5xl font-bold text-center mb-16">
            {t("ownerBenefits.whatTitle")} <span className="text-gradient">{t("ownerBenefits.whatTitleAccent")}</span>
          </h2>

          <div className="grid gap-8 max-w-5xl mx-auto">
            {benefits.map((benefit, i) => {
              const Icon = benefitIcons[i] ?? Globe;
              return (
              <div
                key={i}
                className="glass-card rounded-2xl p-8 md:p-10 border border-border/50 hover:border-primary/30 transition-colors"
              >
                <div className="flex items-start gap-5">
                  <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Icon className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-display text-xl md:text-2xl font-bold mb-3">
                      {benefit.title}
                    </h3>
                    <p className="text-muted-foreground mb-4">{benefit.description}</p>
                    <ul className="space-y-2 mb-4">
                      {benefit.points.map((point, j) => (
                        <li key={j} className="flex items-center gap-3 text-muted-foreground">
                          <CheckCircle2 className="h-4 w-4 text-accent flex-shrink-0" />
                          <span>{point}</span>
                        </li>
                      ))}
                    </ul>
                    <p className="text-sm font-medium text-foreground/80 italic">
                      {benefit.footer}
                    </p>
                  </div>
                </div>
              </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Why Independent Owners Join */}
      <section className="py-20 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent" />
        <div className="container mx-auto px-4 relative z-10">
          <h2 className="font-display text-3xl md:text-5xl font-bold text-center mb-12">
            {t("ownerBenefits.whyTitle")} <span className="text-gradient">{t("ownerBenefits.whyTitleAccent")}</span>
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {whyJoin.map((reason, i) => (
              <div
                key={i}
                className="glass-card rounded-xl p-6 text-center border border-border/50"
              >
                <CheckCircle2 className="h-8 w-8 text-accent mx-auto mb-3" />
                <p className="font-medium text-foreground">{reason}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* You Stay in Control */}
      <section className="py-20">
        <div className="container mx-auto px-4 text-center max-w-3xl">
          <div className="inline-flex items-center gap-2 glass-card rounded-full px-4 py-2 mb-6">
            <ShieldCheck className="h-4 w-4 text-accent" />
            <span className="text-sm text-muted-foreground">{t("ownerBenefits.controlChip")}</span>
          </div>
          <h2 className="font-display text-3xl md:text-5xl font-bold mb-8">
            {t("ownerBenefits.controlTitle")} <span className="text-gradient">{t("ownerBenefits.controlTitleAccent")}</span>
          </h2>
          <p className="text-lg text-muted-foreground mb-8">
            <Trans i18nKey="ownerBenefits.doesNot" components={{ strong: <strong className="text-foreground" /> }} />
          </p>
          <div className="grid sm:grid-cols-2 gap-4 max-w-lg mx-auto mb-8">
            {stayInControl.map((item, i) => (
              <div key={i} className="flex items-center gap-3 text-muted-foreground">
                <span className="w-5 h-5 rounded-full border-2 border-destructive/50 flex items-center justify-center text-xs text-destructive">✕</span>
                <span>{item}</span>
              </div>
            ))}
          </div>
          <p className="text-xl font-display font-semibold text-foreground mb-2">
            {t("ownerBenefits.independent")}
          </p>
          <p className="text-lg text-muted-foreground">
            {t("ownerBenefits.weProvide")}
          </p>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 relative">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-accent/5 to-primary/10" />
        <div className="container mx-auto px-4 relative z-10 text-center max-w-3xl">
          <h2 className="font-display text-3xl md:text-5xl font-bold mb-6">
            {t("ownerBenefits.ctaTitle")}
          </h2>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              variant="hero"
              size="lg"
              className="group text-base"
              onClick={() => navigate("/signup")}
            >
              <span>{t("ownerBenefits.ctaApply")}</span>
              <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="text-base"
            >
              {t("ownerBenefits.ctaCall")}
            </Button>
          </div>
        </div>
      </section>

    </div>
  );
};

export default OwnerBenefits;