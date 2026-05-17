import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useTranslation } from "react-i18next";

const OwnerFAQ = () => {
  const { t } = useTranslation();
  const items = t("home.ownerFaq.items", { returnObjects: true }) as { q: string; a: string }[];
  return (
    <section id="owner-faq" className="py-24 relative">
      <div className="absolute inset-0 bg-gradient-to-b from-background via-secondary/10 to-background" />
      <div className="container mx-auto px-4 relative">
        <div className="text-center mb-16">
          <span className="inline-block px-4 py-2 rounded-full bg-accent/10 text-accent text-sm font-medium mb-4">{t("home.ownerFaq.badge")}</span>
          <h2 className="font-display text-3xl md:text-5xl font-bold mb-4">
            {t("home.ownerFaq.title")} <span className="text-gradient">{t("home.ownerFaq.titleAccent")}</span>
          </h2>
        </div>
        <div className="max-w-3xl mx-auto">
          <Accordion type="single" collapsible className="space-y-4">
            {items.map((faq, i) => (
              <AccordionItem key={i} value={`faq-${i}`} className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-xl px-6 data-[state=open]:border-accent/30">
                <AccordionTrigger className="text-left font-semibold hover:text-accent transition-colors py-6">{faq.q}</AccordionTrigger>
                <AccordionContent className="text-muted-foreground pb-6">{faq.a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
};

export default OwnerFAQ;
