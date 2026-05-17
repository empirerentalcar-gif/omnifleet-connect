import SEO from "@/components/SEO";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { CreditCard, Store, Star, Search, Car, MapPin } from "lucide-react";

const FEATURE_ICONS = [CreditCard, Store, Star, Search, Car, MapPin];

const HowItWorksPage = () => {
  const { t } = useTranslation();
  const rawSteps = t('howItWorksPage.steps', { returnObjects: true }) as {
    title: string; desc: string; subTitle: string; details: string[];
  }[];
  const steps = rawSteps.map((s, i) => ({ ...s, num: i + 1 }));
  const features = (t('howItWorksPage.features', { returnObjects: true }) as { title: string; desc: string }[])
    .map((f, i) => ({ ...f, icon: FEATURE_ICONS[i] ?? Car }));

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title={t('howItWorksPage.seoTitle')}
        description={t('howItWorksPage.seoDescription')}
        path="/how-it-works"
      />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "HowTo",
        "name": "How to Rent a Car on ZUVIO",
        "description": "Simple 3-step process to rent from independent agencies.",
        "step": steps.map((s, i) => ({
          "@type": "HowToStep",
          "position": i + 1,
          "name": s.title,
          "text": s.desc
        }))
      }) }} />
{/* Hero */}
      <section className="pt-8 md:pt-32 pb-16 md:pb-20 bg-gradient-to-br from-primary/10 via-background to-secondary/10 text-center px-4">
        <div className="container mx-auto max-w-3xl">
          <h1 className="font-display text-4xl md:text-5xl font-bold mb-6">{t('howItWorksPage.title')}</h1>
          <p className="text-lg md:text-xl text-muted-foreground">
            {t('howItWorksPage.subtitle')}
          </p>
        </div>
      </section>

      {/* Intro */}
      <section className="py-16 md:py-20">
        <div className="container mx-auto px-4 max-w-3xl text-center">
          <h2 className="font-display text-3xl md:text-4xl font-bold mb-6">{t('howItWorksPage.introTitle')}</h2>
          <p className="text-lg text-muted-foreground leading-relaxed">
            {t('howItWorksPage.introBody')}
          </p>
        </div>
      </section>

      {/* Steps */}
      <section className="pb-16 md:pb-20">
        <div className="container mx-auto px-4 max-w-3xl space-y-12">
          {steps.map((s) => (
            <div key={s.num} className="flex gap-6 items-start">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-primary-foreground text-3xl font-extrabold flex-shrink-0">
                {s.num}
              </div>
              <div className="bg-card rounded-xl p-6 md:p-8 shadow-sm flex-1 border border-border/50">
                <h3 className="font-display text-2xl font-bold mb-3">{s.title}</h3>
                <p className="text-muted-foreground mb-4">{s.desc}</p>
                <div className="bg-secondary/5 rounded-lg p-5 border-l-4 border-primary">
                  <h4 className="font-display font-bold mb-3">{s.subTitle}</h4>
                  <ul className="space-y-2">
                    {s.details.map((d, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                        <span className="text-primary font-bold">✓</span>
                        {d}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="py-16 md:py-20 bg-secondary/5">
        <div className="container mx-auto px-4">
          <h2 className="font-display text-3xl md:text-4xl font-bold mb-12 text-center">{t('howItWorksPage.featuresTitle')}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {features.map((f, i) => (
              <div key={i} className="bg-card rounded-xl p-6 text-center shadow-sm hover:-translate-y-1 transition-all border border-border/50">
                <f.icon className="h-10 w-10 text-primary mx-auto mb-4" />
                <h3 className="font-display text-lg font-bold mb-2">{f.title}</h3>
                <p className="text-muted-foreground text-sm">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 md:py-20">
        <div className="container mx-auto px-4 max-w-3xl">
          <div className="bg-gradient-to-r from-primary to-accent rounded-2xl p-8 md:p-12 text-center text-primary-foreground">
            <h2 className="font-display text-3xl font-bold mb-4">{t('howItWorksPage.ctaTitle')}</h2>
            <p className="text-lg mb-8 opacity-95">{t('howItWorksPage.ctaBody')}</p>
            <Link to="/search" className="bg-background text-primary font-semibold px-8 py-3 rounded-full hover:bg-background/90 transition-colors inline-block">
              {t('howItWorksPage.ctaBtn')}
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
};

export default HowItWorksPage;
