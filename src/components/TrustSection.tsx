import { ShieldCheck, Phone, Ban, Eye } from "lucide-react";
import { useTranslation } from "react-i18next";
const icons = [ShieldCheck, Phone, Ban, Eye];
const TrustSection = () => {
  const { t } = useTranslation();
  const items = t("home.trust.items", { returnObjects: true }) as string[];
  return (
    <section className="py-20 md:py-28 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-background via-primary/5 to-background" />
      <div className="container mx-auto px-4 relative">
        <div className="text-center mb-14">
          <h2 className="font-display text-3xl md:text-5xl font-bold mb-4">
            {t("home.trust.title")} <span className="text-gradient">{t("home.trust.titleAccent")}</span>
          </h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
          {items.map((text, i) => {
            const Icon = icons[i];
            return (
              <div key={text} className="glass-card glow-border rounded-2xl p-6 text-center hover:scale-105 transition-transform duration-300">
                <div className="w-12 h-12 rounded-full bg-accent/15 flex items-center justify-center mx-auto mb-4">
                  <Icon className="h-6 w-6 text-accent" />
                </div>
                <p className="font-semibold text-foreground text-sm">{text}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
export default TrustSection;
