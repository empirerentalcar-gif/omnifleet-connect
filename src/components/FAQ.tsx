import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    id: "faq-1",
    question: "How does Zuvio work for agencies?",
    answer: "Add answer here. Explain the onboarding process, how listings work, and how agencies get paid.",
  },
  {
    id: "faq-2",
    question: "What are the fees for listing my fleet?",
    answer: "Add answer here. Detail the pricing structure, commission rates, and any subscription tiers.",
  },
  {
    id: "faq-3",
    question: "How are payments handled?",
    answer: "Add answer here. Explain payment processing, payout schedules, and supported payment methods.",
  },
  {
    id: "faq-4",
    question: "What insurance options are available?",
    answer: "Add answer here. Detail insurance partnerships, coverage options, and claims process.",
  },
  {
    id: "faq-5",
    question: "How do I handle disputes or damages?",
    answer: "Add answer here. Explain the dispute resolution process, damage documentation, and support system.",
  },
  {
    id: "faq-6",
    question: "Can I manage multiple locations?",
    answer: "Add answer here. Describe multi-location support, fleet distribution, and location management features.",
  },
  {
    id: "faq-7",
    question: "What support does Zuvio provide?",
    answer: "Add answer here. Detail customer support channels, response times, and dedicated account management.",
  },
  {
    id: "faq-8",
    question: "How do I get started?",
    answer: "Add answer here. Provide step-by-step onboarding instructions and requirements.",
  },
];

const FAQ = () => {
  return (
    <section className="py-24 relative">
      <div className="absolute inset-0 bg-gradient-to-b from-background via-secondary/10 to-background" />
      
      <div className="container mx-auto px-4 relative">
        <div className="text-center mb-16">
          <span className="inline-block px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
            FAQ
          </span>
          <h2 className="font-display text-3xl md:text-5xl font-bold mb-4">
            Frequently Asked <span className="text-gradient">Questions</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Everything you need to know about partnering with Zuvio
          </p>
        </div>

        <div className="max-w-3xl mx-auto">
          <Accordion type="single" collapsible className="space-y-4">
            {faqs.map((faq) => (
              <AccordionItem 
                key={faq.id} 
                value={faq.id}
                className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-xl px-6 data-[state=open]:border-primary/30"
              >
                <AccordionTrigger className="text-left font-semibold hover:text-primary transition-colors py-6">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground pb-6">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
};

export default FAQ;
