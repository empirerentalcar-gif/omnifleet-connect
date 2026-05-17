import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

const TuroFinalCTA = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <section className="py-24 md:py-32 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-hero" />
      <div className="absolute top-1/3 left-1/3 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse-glow" />
      <div className="absolute bottom-1/3 right-1/3 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-pulse-glow delay-500" />

      <div className="container mx-auto px-4 relative z-10 text-center">
        <h2 className="font-display text-3xl md:text-5xl lg:text-6xl font-bold mb-6">
          {t("turo.finalCta.title")}
          <br />
          <span className="text-gradient">{t("turo.finalCta.titleAccent")}</span>
        </h2>
        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-2">
          {t("turo.finalCta.pricing")}
        </p>
        <p className="text-sm text-muted-foreground mb-8">
          {t("turo.finalCta.risk")}
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            variant="hero"
            size="xl"
            className="group text-base"
            onClick={() => navigate("/signup")}
          >
            <span>{t("turo.finalCta.lockRate")}</span>
            <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
          </Button>
          <Button
            variant="outline"
            size="xl"
            className="text-base border-accent/30 hover:bg-accent/10"
            onClick={() => navigate("/signup")}
          >
            {t("turo.finalCta.getBookings")}
          </Button>
        </div>
      </div>
    </section>
  );
};

export default TuroFinalCTA;
