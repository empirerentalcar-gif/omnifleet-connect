import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const ownerFaqs = [
  {
    id: "owner-faq-1",
    question: "Do I keep my phone number?",
    answer:
      "Absolutely. ZUVIO never replaces your phone number. Customers can still call you directly. We simply route new reservation leads your way — you stay in full control of every conversation.",
  },
  {
    id: "owner-faq-2",
    question: "How do reservations arrive?",
    answer:
      "When a customer books through ZUVIO, you receive an instant notification via email and your ZUVIO dashboard. You'll see the customer name, dates, vehicle requested, and pickup location — all in real time.",
  },
  {
    id: "owner-faq-3",
    question: "Can I say no to a reservation?",
    answer:
      "Yes. You have full authority to accept or decline any reservation. If a vehicle isn't available or the timing doesn't work, simply decline — no penalties, no questions asked.",
  },
  {
    id: "owner-faq-4",
    question: "What are the fees?",
    answer:
      "ZUVIO charges a small commission only on completed reservations — no upfront costs, no monthly minimums. You choose your own daily rates, and we never undercut your pricing. Check our pricing page for current commission tiers.",
  },
  {
    id: "owner-faq-5",
    question: "How quickly can I start receiving bookings?",
    answer:
      "Most owners go live within 24 hours. Once your profile and vehicle listings are approved, you'll start appearing in search results immediately.",
  },
  {
    id: "owner-faq-6",
    question: "Do customers pay through ZUVIO or directly to me?",
    answer:
      "ZUVIO handles payment processing securely. Funds are deposited directly into your bank account on a regular payout schedule — no chasing payments.",
  },
  {
    id: "owner-faq-7",
    question: "What if a customer damages my vehicle?",
    answer:
      "ZUVIO partners with insurance providers to offer optional coverage. You can also require a security deposit through the platform. Our support team assists with any damage claims.",
  },
  {
    id: "owner-faq-8",
    question: "Can I list vehicles across multiple locations?",
    answer:
      "Yes. You can manage multiple pickup and drop-off locations from a single dashboard. Each location gets its own availability calendar and pricing.",
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
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Everything you need to know before listing your fleet on ZUVIO
          </p>
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
