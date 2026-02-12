import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { ArrowRight, Globe, CalendarCheck, Clock, Phone, Megaphone, CheckCircle2, ShieldCheck } from "lucide-react";
import { useNavigate } from "react-router-dom";

const benefits = [
  {
    icon: Globe,
    title: "Regional & National Visibility",
    description: "Your agency becomes discoverable by customers searching:",
    points: [
      "By city or zip code",
      "For cash-friendly rentals",
      "For flexible deposit options",
      "For local alternatives to corporate chains",
    ],
    footer: "We bring regional attention to your business without you increasing ad spend.",
  },
  {
    icon: CalendarCheck,
    title: "More Reservation Opportunities",
    description: "ZUVIO allows customers to search, request reservations, request extensions, and contact you directly. You decide whether to accept or decline.",
    points: [
      "You control deposits",
      "You control requirements",
      "You control cancellation policies",
    ],
    footer: "We don't take over your business — we amplify it.",
  },
  {
    icon: Clock,
    title: "24/7 Digital Presence",
    description: "Even when your office is closed, customers can:",
    points: [
      "View your listing",
      "Submit reservation requests",
      "See vehicle categories",
      "Review your requirements",
    ],
    footer: "That means you're generating leads around the clock.",
  },
  {
    icon: Phone,
    title: "Direct Customer Communication",
    description: "Unlike large corporate platforms:",
    points: [
      "Cancellations require direct phone contact",
      "Customers speak to you",
      "You build repeat relationships",
    ],
    footer: "We help you grow your brand — not replace it.",
  },
  {
    icon: Megaphone,
    title: "Marketing Without the Overhead",
    description: "ZUVIO invests in:",
    points: [
      "Regional marketing campaigns",
      "Search visibility",
      "Platform promotion",
    ],
    footer: "You benefit from collective exposure under one network.",
  },
];

const whyJoin = [
  "Increased inbound calls",
  "Expanded regional reach",
  "Better visibility against corporate chains",
  "More consistent booking flow",
  "Digital credibility",
];

const stayInControl = [
  "Control your pricing",
  "Dictate your policies",
  "Override your approval process",
  "Replace your brand",
];

const OwnerBenefits = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-hero" />
        <div className="absolute top-1/3 left-1/4 w-[500px] h-[500px] bg-primary/8 rounded-full blur-3xl" />
        <div className="container mx-auto px-4 relative z-10 text-center max-w-4xl">
          <h1 className="font-display text-4xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
            Grow Your Independent Rental Business with{" "}
            <span className="text-gradient">ZUVIO</span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
            Independent rental agencies are the backbone of local transportation — but too often, they're invisible online.
            <br /><br />
            <strong className="text-foreground">ZUVIO was built to change that.</strong>
            <br /><br />
            We connect customers directly to independent rental owners like you — while you stay fully in control of your pricing, policies, and operations.
          </p>
        </div>
      </section>

      {/* What ZUVIO Does for You */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <h2 className="font-display text-3xl md:text-5xl font-bold text-center mb-16">
            What ZUVIO Does <span className="text-gradient">for You</span>
          </h2>

          <div className="grid gap-8 max-w-5xl mx-auto">
            {benefits.map((benefit, i) => (
              <div
                key={i}
                className="glass-card rounded-2xl p-8 md:p-10 border border-border/50 hover:border-primary/30 transition-colors"
              >
                <div className="flex items-start gap-5">
                  <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                    <benefit.icon className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-display text-xl md:text-2xl font-bold mb-3">
                      {benefit.title}
                    </h3>
                    <p className="text-muted-foreground mb-4">{benefit.description}</p>
                    <ul className="space-y-2 mb-4">
                      {benefit.points.map((point, j) => (
                        <li key={j} className="flex items-center gap-3 text-muted-foreground">
                          <CheckCircle2 className="h-4 w-4 text-accent flex-shrink-0" />
                          <span>{point}</span>
                        </li>
                      ))}
                    </ul>
                    <p className="text-sm font-medium text-foreground/80 italic">
                      {benefit.footer}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Independent Owners Join */}
      <section className="py-20 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent" />
        <div className="container mx-auto px-4 relative z-10">
          <h2 className="font-display text-3xl md:text-5xl font-bold text-center mb-12">
            Why Independent Owners <span className="text-gradient">Join</span>
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {whyJoin.map((reason, i) => (
              <div
                key={i}
                className="glass-card rounded-xl p-6 text-center border border-border/50"
              >
                <CheckCircle2 className="h-8 w-8 text-accent mx-auto mb-3" />
                <p className="font-medium text-foreground">{reason}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* You Stay in Control */}
      <section className="py-20">
        <div className="container mx-auto px-4 text-center max-w-3xl">
          <div className="inline-flex items-center gap-2 glass-card rounded-full px-4 py-2 mb-6">
            <ShieldCheck className="h-4 w-4 text-accent" />
            <span className="text-sm text-muted-foreground">Your Business, Your Rules</span>
          </div>
          <h2 className="font-display text-3xl md:text-5xl font-bold mb-8">
            You Stay in <span className="text-gradient">Control</span>
          </h2>
          <p className="text-lg text-muted-foreground mb-8">
            ZUVIO does <strong className="text-foreground">not</strong>:
          </p>
          <div className="grid sm:grid-cols-2 gap-4 max-w-lg mx-auto mb-8">
            {stayInControl.map((item, i) => (
              <div key={i} className="flex items-center gap-3 text-muted-foreground">
                <span className="w-5 h-5 rounded-full border-2 border-destructive/50 flex items-center justify-center text-xs text-destructive">✕</span>
                <span>{item}</span>
              </div>
            ))}
          </div>
          <p className="text-xl font-display font-semibold text-foreground mb-2">
            You remain independent.
          </p>
          <p className="text-lg text-muted-foreground">
            We provide the network.
          </p>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 relative">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-accent/5 to-primary/10" />
        <div className="container mx-auto px-4 relative z-10 text-center max-w-3xl">
          <h2 className="font-display text-3xl md:text-5xl font-bold mb-6">
            Ready to grow your rental agency?
          </h2>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              variant="hero"
              size="lg"
              className="group text-base"
              onClick={() => navigate("/signup")}
            >
              <span>Apply to Join ZUVIO</span>
              <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="text-base"
            >
              Schedule a Call
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default OwnerBenefits;