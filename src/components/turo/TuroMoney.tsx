import { DollarSign, TrendingUp, Users, BarChart3 } from "lucide-react";
import { useTranslation } from "react-i18next";

const TuroMoney = () => {
  const { t } = useTranslation();
  const items = t("turo.money.items", { returnObjects: true }) as string[];
  const icons = [BarChart3, TrendingUp, Users, DollarSign];
  return (
  <section className="py-20 md:py-28 relative overflow-hidden">
    <div className="absolute inset-0 bg-gradient-to-b from-background via-primary/5 to-background" />
    <div className="container mx-auto px-4 relative max-w-4xl">
      <div className="text-center mb-12">
        <span className="inline-block px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
          {t("turo.money.badge")}
        </span>
        <h2 className="font-display text-3xl md:text-5xl font-bold mb-4">
          {t("turo.money.title")} <span className="text-gradient">{t("turo.money.titleAccent")}</span>
        </h2>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          {t("turo.money.subtitle")}
        </p>
      </div>

      <div className="grid sm:grid-cols-2 gap-6 mb-10">
        {items.map((text, i) => {
          const Icon = icons[i] ?? BarChart3;
          return (
            <div key={text} className="glass-card rounded-xl p-6 flex items-center gap-4">
              <div className="p-3 rounded-lg bg-primary/10">
                <Icon className="h-6 w-6 text-primary" />
              </div>
              <p className="text-foreground font-medium text-lg">{text}</p>
            </div>
          );
        })}
      </div>

      <p className="text-center text-xl font-bold text-accent">
        {t("turo.money.footer")}
      </p>
    </div>
  </section>
  );
};

export default TuroMoney;
