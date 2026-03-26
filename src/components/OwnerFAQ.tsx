import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const ownerFaqs = [
  {
    id: "faq-1",
    question: "Do I keep my phone number?",
    answer:
      "Absolutely. Zuvio never replaces your phone number. Customers can call you directly. We simply route new reservation leads your way — you stay in full control of every conversation.",
  },
  {
    id: "faq-2",
    question: "Who handles payment?",
    answer:
      "You do. Zuvio does not process payments on your behalf. You collect payment however you prefer — cash, card, Zelle, or any method you choose. Your money, your terms.",
  },
  {
    id: "faq-3",
    question: "Can I decline bookings?",
    answer:
      "Yes. You have full authority to accept or decline any reservation request. If a vehicle isn't available or the timing doesn't work, simply decline — no penalties, no questions asked.",
  },
  {
    id: "faq-4",
    question: "How fast can I start?",
    answer:
      "Most owners go live within 24 hours. Once your profile and vehicle listings are approved, you'll start appearing in search results immediately.",
  },
  {
    id: "faq-5",
    question: "What are the fees?",
    answer:
      "Zuvio charges a simple listing fee — not a percentage of your earnings. You keep 100% of what you make from every booking. Check our pricing page for current plans.",
  },
  {
    id: "faq-6",
    question: "Can I list multiple vehicles?",
    answer:
      "Yes. You can manage multiple vehicles and locations from a single dashboard. Each vehicle gets its own listing with pricing, photos, and availability.",
  },
];

const OwnerFAQ = () => {
  return (
    <section id="owner-faq" className="py-24 relative">
      <div className="absolute inset-0 bg-gradient-to-b from-background via-secondary/10 to-background" />

      <div className="container mx-auto px-4 relative">
        <div className="text-center mb-16">
          <span className="inline-block px-4 py-2 rounded-full bg-accent/10 text-accent text-sm font-medium mb-4">
            Owner FAQ
          </span>
          <h2 className="font-display text-3xl md:text-5xl font-bold mb-4">
            Questions from <span className="text-gradient">Owners</span>
          </h2>
        </div>

        <div className="max-w-3xl mx-auto">
          <Accordion type="single" collapsible className="space-y-4">
            {ownerFaqs.map((faq) => (
              <AccordionItem
                key={faq.id}
                value={faq.id}
                className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-xl px-6 data-[state=open]:border-accent/30"
              >
                <AccordionTrigger className="text-left font-semibold hover:text-accent transition-colors py-6">
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

export default OwnerFAQ;
