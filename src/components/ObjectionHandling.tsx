import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useTranslation } from "react-i18next";

function renderLine(line: string) {
  const parts = line.split(/\*\*(.*?)\*\*/g);
  return parts.map((part, i) => (i % 2 === 1 ? <strong key={i} className="text-foreground">{part}</strong> : <span key={i}>{part}</span>));
}

const ObjectionHandling = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const items = t("home.objections.items", { returnObjects: true }) as { q: string; a: string[] }[];
  return (
    <section className="py-20 md:py-28 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-background via-secondary/5 to-background" />
      <div className="container mx-auto px-4 relative z-10 max-w-3xl">
        <div className="text-center mb-12">
          <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
            {t("home.objections.title")} <span className="text-gradient">{t("home.objections.titleAccent")}</span>
          </h2>
        </div>
        <Accordion type="multiple" className="space-y-3">
          {items.map((obj, i) => (
            <AccordionItem key={i} value={`objection-${i}`} className="glass-card rounded-xl border-none px-6">
              <AccordionTrigger className="text-left font-display font-semibold text-foreground text-base md:text-lg hover:no-underline py-5">{obj.q}</AccordionTrigger>
              <AccordionContent className="pb-5">
                <div className="space-y-3 text-muted-foreground text-sm md:text-base leading-relaxed">
                  {obj.a.map((line, j) => (<p key={j}>{renderLine(line)}</p>))}
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
        <p className="text-center text-lg font-display font-bold text-foreground mt-10 mb-8">
          {t("home.objections.footer")} <span className="text-accent">{t("home.objections.footerAccent")}</span>
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button variant="hero" size="xl" className="group text-base" onClick={() => navigate("/signup")}>
            <span>{t("home.objections.ctaPrimary")}</span>
            <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
          </Button>
          <Button variant="outline" size="xl" className="text-base border-accent/30 hover:bg-accent/10" onClick={() => navigate("/signup")}>
            {t("home.objections.ctaSecondary")}
          </Button>
        </div>
      </div>
    </section>
  );
};

export default ObjectionHandling;
