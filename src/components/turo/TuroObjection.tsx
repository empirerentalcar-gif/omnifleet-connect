import { CheckCircle2 } from "lucide-react";
import { useTranslation } from "react-i18next";

const TuroObjection = () => {
  const { t } = useTranslation();
  const benefits = t("turo.objection.benefits", { returnObjects: true }) as string[];
  return (
  <section className="py-20 md:py-28 relative overflow-hidden">
    <div className="absolute inset-0 bg-gradient-to-b from-background via-accent/5 to-background" />
    <div className="container mx-auto px-4 relative max-w-3xl">
      <div className="text-center mb-10">
        <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
          {t("turo.objection.title")} <span className="text-gradient">{t("turo.objection.titleAccent")}</span>
        </h2>
        <p className="text-xl text-foreground font-semibold mb-2">{t("turo.objection.no")}</p>
        <p className="text-lg text-muted-foreground">
          {t("turo.objection.intro")}
        </p>
      </div>

      <div className="glass-card glow-border rounded-2xl p-8 space-y-4 max-w-md mx-auto">
        {benefits.map((b) => (
          <div key={b} className="flex items-center gap-3">
            <CheckCircle2 className="h-5 w-5 text-accent shrink-0" />
            <p className="text-foreground font-medium text-lg">{b}</p>
          </div>
        ))}
      </div>
    </div>
  </section>
  );
};

export default TuroObjection;
