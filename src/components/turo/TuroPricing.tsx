import { PricingCard, PricingROI } from "@/components/pricing/PricingCard";
import { useTranslation } from "react-i18next";

const TuroPricing = () => {
  const { t } = useTranslation();
  return (
    <section id="turo-pricing" className="py-20 md:py-28 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-background via-secondary/10 to-background" />
      <div className="container mx-auto px-4 relative max-w-lg">
        <div className="text-center mb-14">
          <h2 className="font-display text-3xl md:text-5xl font-bold mb-4">
            {t("turo.pricingSection.title")} <span className="text-gradient">{t("turo.pricingSection.titleAccent")}</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            {t("turo.pricingSection.subtitle")}
          </p>
        </div>
        <PricingCard />
        <PricingROI />
      </div>
    </section>
  );
};

export default TuroPricing;
