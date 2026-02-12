import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Check, ShieldCheck, Star, Users, Phone, DollarSign, Ban } from "lucide-react";
import { useNavigate } from "react-router-dom";
import SEO from "@/components/SEO";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const foundingFeatures = [
  "National and regional listing visibility",
  "Reservation request management",
  "Extension requests in-app",
  "Direct customer communication",
  "Owner-controlled approval process",
  "Lock in founding rate for life",
];

const standardFeatures = [
  "Everything in Founding Plan",
  "Priority regional placement",
  "Featured agency badge",
  "Enhanced analytics dashboard",
];

const faqs = [
  {
    q: "Do I lose control of my pricing?",
    a: "No. You control daily rates, deposits, requirements, and vehicle availability. ZUVIO does not dictate pricing.",
  },
  {
    q: "Can customers cancel without calling me?",
    a: "No. All cancellations require direct phone contact with your agency. You maintain control of your reservation policies.",
  },
  {
    q: "Do I have to accept every reservation request?",
    a: "No. You approve or decline each request.",
  },
  {
    q: "Does ZUVIO replace my brand?",
    a: "No. Your agency name, phone number, and identity remain front and center. ZUVIO increases your visibility — it does not replace your brand.",
  },
  {
    q: "How do I get paid?",
    a: "Customers pay you directly according to your payment policies. ZUVIO collects its booking fee only on confirmed reservations.",
  },
  {
    q: "What if I don't see results?",
    a: "You can cancel anytime. No long-term contracts.",
  },
  {
    q: "How is this different from large corporate platforms?",
    a: "ZUVIO focuses only on independent rental agencies, keeps cancellation control with owners, encourages direct communication, and builds regional visibility for local businesses. We are a network — not a replacement.",
  },
];

const Pricing = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Pricing | ZUVIO — Plans for Independent Rental Agencies"
        description="Transparent pricing for independent car rental agencies. No hidden fees, no long-term contracts. Founding member plan at $79/month."
        path="/pricing"
      />
      <Header />

      {/* Hero */}
      <section className="pt-32 pb-16 md:pt-40 md:pb-20">
        <div className="container mx-auto px-4 max-w-4xl text-center">
          <h1 className="text-3xl md:text-5xl font-bold tracking-tight mb-6">
            Simple, Transparent Pricing for{" "}
            <span className="text-gradient">Independent Rental Agencies</span>
          </h1>
          <p className="text-muted-foreground text-lg md:text-xl max-w-3xl mx-auto leading-relaxed">
            ZUVIO is built to help independent rental agencies grow regional visibility and generate more reservation opportunities — while staying fully in control of their business.
          </p>
          <p className="mt-4 text-foreground font-semibold text-base md:text-lg">
            No hidden fees. No long-term contracts. No loss of control.
          </p>
        </div>
      </section>

      {/* Plans */}
      <section className="pb-20">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="grid md:grid-cols-2 gap-8">
            {/* Founding Member */}
            <div className="glass-card glow-border rounded-2xl p-8 flex flex-col relative overflow-hidden">
              <div className="absolute top-4 right-4">
                <span className="bg-accent text-accent-foreground text-xs font-bold px-3 py-1 rounded-full">
                  LIMITED
                </span>
              </div>
              <h3 className="text-xl font-bold mb-1">Founding Member Plan</h3>
              <p className="text-sm text-muted-foreground mb-6">Limited to the first 50 agencies</p>
              <div className="mb-6">
                <span className="text-4xl font-bold text-foreground">$79</span>
                <span className="text-muted-foreground">/month</span>
                <span className="block text-sm text-accent font-medium mt-1">+ 5% per confirmed booking</span>
              </div>
              <ul className="space-y-3 mb-8 flex-1">
                {foundingFeatures.map((f) => (
                  <li key={f} className="flex items-start gap-3 text-sm text-foreground">
                    <Check className="h-4 w-4 text-accent mt-0.5 shrink-0" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
              <Button
                variant="hero"
                size="lg"
                className="w-full"
                onClick={() => navigate("/signup")}
              >
                Become a Founding Member
              </Button>
            </div>

            {/* Standard Growth */}
            <div className="glass-card rounded-2xl p-8 flex flex-col opacity-80 relative overflow-hidden">
              <div className="absolute top-4 right-4">
                <span className="bg-secondary text-muted-foreground text-xs font-bold px-3 py-1 rounded-full">
                  COMING SOON
                </span>
              </div>
              <h3 className="text-xl font-bold mb-1">Standard Growth Plan</h3>
              <p className="text-sm text-muted-foreground mb-6">Future Tier</p>
              <div className="mb-6">
                <span className="text-4xl font-bold text-foreground">$149</span>
                <span className="text-muted-foreground">/month</span>
                <span className="block text-sm text-muted-foreground font-medium mt-1">+ 7% per confirmed booking</span>
              </div>
              <ul className="space-y-3 mb-8 flex-1">
                {standardFeatures.map((f) => (
                  <li key={f} className="flex items-start gap-3 text-sm text-foreground">
                    <Check className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
              <Button variant="outline" size="lg" className="w-full" disabled>
                Coming Soon
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Why Booking Fee */}
      <section className="pb-20">
        <div className="container mx-auto px-4 max-w-3xl text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">Why We Use a Booking Fee</h2>
          <p className="text-muted-foreground text-lg leading-relaxed mb-4">
            ZUVIO only succeeds when you succeed. We charge a small percentage of confirmed bookings to ensure we are motivated to bring real, qualified reservation opportunities to your agency.
          </p>
          <p className="text-foreground font-semibold text-lg">
            If you don't grow — we don't grow.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-6 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Ban className="h-4 w-4 text-accent" />
              No Setup Fees
            </div>
            <div className="flex items-center gap-2">
              <Ban className="h-4 w-4 text-accent" />
              No Long Contracts
            </div>
          </div>
          <p className="mt-4 text-sm text-muted-foreground">
            Cancel anytime. Your business remains independent.
          </p>
        </div>
      </section>

      {/* Owner FAQ */}
      <section className="pb-20">
        <div className="container mx-auto px-4 max-w-3xl">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-10">Owner FAQ</h2>
          <Accordion type="single" collapsible className="space-y-2">
            {faqs.map((faq, i) => (
              <AccordionItem
                key={i}
                value={`faq-${i}`}
                className="glass-card rounded-xl px-6 border-border/30"
              >
                <AccordionTrigger className="text-left text-foreground hover:no-underline">
                  {faq.q}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground leading-relaxed">
                  {faq.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Pricing;
