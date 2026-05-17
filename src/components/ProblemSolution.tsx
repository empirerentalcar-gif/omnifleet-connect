import { XCircle, CheckCircle2 } from "lucide-react";
import { useTranslation } from "react-i18next";

const ProblemSolution = () => {
  const { t } = useTranslation();
  const problems = t("home.problem.items", { returnObjects: true }) as string[];
  const solutions = t("home.problem.solutionItems", { returnObjects: true }) as string[];

  return (
    <section className="py-20 md:py-28 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-border to-transparent" />
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          <div className="glass-card rounded-2xl p-8 md:p-10 border-destructive/20">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-destructive/10 text-destructive text-sm font-semibold mb-8">
              <XCircle className="h-4 w-4" />{t("home.problem.badge")}
            </div>
            <h2 className="font-display text-2xl md:text-3xl font-bold mb-6">{t("home.problem.title")}</h2>
            <div className="space-y-4">
              {problems.map((item) => (
                <div key={item} className="flex items-start gap-3">
                  <XCircle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
                  <p className="text-muted-foreground">{item}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="glass-card glow-border rounded-2xl p-8 md:p-10">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 text-accent text-sm font-semibold mb-8">
              <CheckCircle2 className="h-4 w-4" />{t("home.problem.solutionBadge")}
            </div>
            <h2 className="font-display text-2xl md:text-3xl font-bold mb-4">
              {t("home.problem.solutionTitle")} <span className="text-gradient">{t("home.problem.solutionTitleAccent")}</span>
            </h2>
            <p className="text-muted-foreground mb-6">{t("home.problem.solutionIntro")}</p>
            <div className="space-y-4">
              {solutions.map((item) => (
                <div key={item} className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-accent shrink-0 mt-0.5" />
                  <p className="text-foreground font-medium">{item}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProblemSolution;
