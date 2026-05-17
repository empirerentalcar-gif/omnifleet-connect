import { Building2, Car, Users, TrendingUp } from "lucide-react";
import { useTranslation } from "react-i18next";

const icons = [Building2, Car, Users, TrendingUp];

const WhoThisIsFor = () => {
  const { t } = useTranslation();
  const items = t("home.whoFor.items", { returnObjects: true }) as string[];
  return (
    <section className="py-20 md:py-28 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-background via-secondary/10 to-background" />
      <div className="container mx-auto px-4 relative">
        <div className="text-center mb-14">
          <h2 className="font-display text-3xl md:text-5xl font-bold mb-4">
            {t("home.whoFor.title")} <span className="text-gradient">{t("home.whoFor.titleAccent")}</span>
          </h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto mb-10">
          {items.map((title, i) => {
            const Icon = icons[i];
            return (
              <div key={title} className="glass-card glow-border rounded-2xl p-8 text-center hover:scale-105 transition-transform duration-300">
                <div className="w-14 h-14 rounded-2xl bg-accent/10 flex items-center justify-center mx-auto mb-5">
                  <Icon className="h-7 w-7 text-accent" />
                </div>
                <p className="font-display font-semibold text-foreground">{title}</p>
              </div>
            );
          })}
        </div>
        <p className="text-center text-lg text-muted-foreground font-medium">
          {t("home.whoFor.footer")} <span className="text-accent">{t("home.whoFor.footerAccent")}</span>
        </p>
      </div>
    </section>
  );
};

export default WhoThisIsFor;
