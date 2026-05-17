import SEO from "@/components/SEO";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useState } from "react";

const categoryKeys = ["renters", "agencies", "general"] as const;
type CategoryKey = typeof categoryKeys[number];

const FAQ = () => {
  const { t } = useTranslation();
  const [activeCategory, setActiveCategory] = useState<CategoryKey>("renters");
  const faqData: Record<CategoryKey, { q: string; a: string }[]> = {
    renters: t('faq.renters', { returnObjects: true }) as { q: string; a: string }[],
    agencies: t('faq.agencies', { returnObjects: true }) as { q: string; a: string }[],
    general: t('faq.general', { returnObjects: true }) as { q: string; a: string }[],
  };

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title={t('faq.seoTitle')}
        description={t('faq.seoDescription')}
        path="/faq"
      />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": Object.values(faqData).flat().map(item => ({
          "@type": "Question",
          "name": item.q,
          "acceptedAnswer": { "@type": "Answer", "text": item.a }
        }))
      }) }} />
{/* Hero */}
      <section className="pt-8 md:pt-32 pb-16 md:pb-20 bg-gradient-to-br from-primary/10 via-background to-secondary/10 text-center px-4">
        <div className="container mx-auto max-w-3xl">
          <h1 className="font-display text-4xl md:text-5xl font-bold mb-6">{t('faq.title')}</h1>
          <p className="text-lg md:text-xl text-muted-foreground">
            {t('faq.subtitle')}
          </p>
        </div>
      </section>

      <section className="py-16 md:py-20">
        <div className="container mx-auto px-4 max-w-3xl">
          {/* Category Nav */}
          <div className="flex flex-wrap gap-3 justify-center mb-12">
            {categoryKeys.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-5 py-2.5 rounded-full font-semibold text-sm transition-all ${
                  activeCategory === cat
                    ? "bg-primary text-primary-foreground"
                    : "bg-card border border-border text-muted-foreground hover:border-primary hover:text-foreground"
                }`}
              >
                {t(`faq.cat.${cat}`)}
              </button>
            ))}
          </div>

          {/* FAQ Accordion */}
          {categoryKeys.map((cat) => (
            <div key={cat} className={activeCategory === cat ? "block" : "hidden"}>
              <h2 className="font-display text-2xl font-bold mb-6 pb-3 border-b-2 border-primary">{cat === "agencies" ? t('faq.cat.agenciesAlt') : t(`faq.cat.${cat}`)}</h2>
              <Accordion type="single" collapsible className="space-y-4">
                {faqData[cat].map((item, i) => (
                  <AccordionItem key={i} value={`${cat}-${i}`} className="bg-card rounded-xl border border-border/50 px-6">
                    <AccordionTrigger className="text-left font-semibold text-base md:text-lg hover:no-underline">
                      {item.q}
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground leading-relaxed whitespace-pre-line">
                      {item.a}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          ))}

          {/* CTA */}
          <div className="mt-16 bg-gradient-to-r from-primary to-accent rounded-2xl p-8 md:p-12 text-center text-primary-foreground">
            <h2 className="font-display text-2xl md:text-3xl font-bold mb-4">{t('faq.ctaTitle')}</h2>
            <p className="text-lg mb-6 opacity-95">{t('faq.ctaBody')}</p>
            <a href="mailto:team@zuvio.us" className="bg-background text-primary font-semibold px-8 py-3 rounded-full hover:bg-background/90 transition-colors inline-block">
              {t('faq.ctaBtn')}
            </a>
          </div>
        </div>
      </section>

    </div>
  );
};

export default FAQ;
