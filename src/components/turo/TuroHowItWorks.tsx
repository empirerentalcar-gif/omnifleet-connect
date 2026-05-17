import { useTranslation } from "react-i18next";

type Step = { title: string; desc: string };

const TuroHowItWorks = () => {
  const { t } = useTranslation();
  const rawSteps = t("turo.howItWorks.steps", { returnObjects: true }) as Step[];
  const steps = rawSteps.map((s, i) => ({ ...s, num: String(i + 1).padStart(2, "0") }));
  return (
  <section className="py-20 md:py-28 relative overflow-hidden">
    <div className="absolute inset-0 bg-gradient-to-b from-background via-secondary/10 to-background" />
    <div className="container mx-auto px-4 relative max-w-3xl">
      <div className="text-center mb-14">
        <h2 className="font-display text-3xl md:text-5xl font-bold mb-4">
          {t("turo.howItWorks.title")} <span className="text-gradient">{t("turo.howItWorks.titleAccent")}</span>
        </h2>
      </div>

      <div className="space-y-6">
        {steps.map((step) => (
          <div key={step.num} className="glass-card rounded-xl p-6 flex items-start gap-5">
            <span className="text-2xl font-bold text-accent shrink-0">{step.num}</span>
            <div>
              <h3 className="font-bold text-foreground text-lg mb-1">{step.title}</h3>
              <p className="text-muted-foreground">{step.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  </section>
  );
};

export default TuroHowItWorks;
