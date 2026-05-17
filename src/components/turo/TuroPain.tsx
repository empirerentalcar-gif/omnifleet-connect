import { AlertTriangle } from "lucide-react";
import { useTranslation } from "react-i18next";

const TuroPain = () => {
  const { t } = useTranslation();
  const pains = t("turo.pain.items", { returnObjects: true }) as string[];
  return (
  <section className="py-20 md:py-28 relative overflow-hidden">
    <div className="absolute inset-0 bg-gradient-to-b from-background via-destructive/5 to-background" />
    <div className="container mx-auto px-4 relative max-w-3xl">
      <div className="text-center mb-12">
        <span className="inline-block px-4 py-2 rounded-full bg-destructive/10 text-destructive text-sm font-medium mb-4">
          {t("turo.pain.badge")}
        </span>
        <h2 className="font-display text-3xl md:text-5xl font-bold mb-4">
          {t("turo.pain.title")} <span className="text-gradient">{t("turo.pain.titleAccent")}</span>
        </h2>
      </div>

      <div className="glass-card rounded-2xl p-8 md:p-10 space-y-5 mb-8">
        {pains.map((pain) => (
          <div key={pain} className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
            <p className="text-foreground text-lg">{pain}</p>
          </div>
        ))}
      </div>

      <p className="text-center text-lg text-muted-foreground italic">
        {t("turo.pain.footer")}{" "}
        <span className="text-foreground font-semibold">{t("turo.pain.footerAccent")}</span>
      </p>
    </div>
  </section>
  );
};

export default TuroPain;
