{/* TODO: i18n — no matching keys in en.json/es.json for this component yet; strings remain English. */}
import { PricingCard, PricingROI } from "@/components/pricing/PricingCard";

const TuroPricing = () => {
  return (
    <section id="turo-pricing" className="py-20 md:py-28 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-background via-secondary/10 to-background" />
      <div className="container mx-auto px-4 relative max-w-lg">
        <div className="text-center mb-14">
          <h2 className="font-display text-3xl md:text-5xl font-bold mb-4">
            Simple, <span className="text-gradient">Transparent Pricing</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            No hidden fees. No contracts. No loss of control.
          </p>
        </div>
        <PricingCard />
        <PricingROI />
      </div>
    </section>
  );
};

export default TuroPricing;
