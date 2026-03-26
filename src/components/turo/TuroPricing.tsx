import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { useNavigate } from "react-router-dom";

const foundingFeatures = [
  "National and regional visibility",
  "Reservation request management",
  "Extension requests in-app",
  "Direct customer communication",
  "Owner-controlled approvals",
  "Locked founding rate for life",
];

const standardFeatures = [
  "Everything in Founding Plan",
  "Priority regional placement",
  "Featured agency badge",
  "Enhanced analytics dashboard",
];

const TuroPricing = () => {
  const navigate = useNavigate();

  return (
    <section id="turo-pricing" className="py-20 md:py-28 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-background via-secondary/10 to-background" />
      <div className="container mx-auto px-4 relative max-w-5xl">
        <div className="text-center mb-14">
          <h2 className="font-display text-3xl md:text-5xl font-bold mb-4">
            Simple, <span className="text-gradient">Transparent Pricing</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            No hidden fees. No long-term contracts. No loss of control.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Founding Member */}
          <div className="glass-card glow-border rounded-2xl p-8 flex flex-col relative overflow-hidden">
            <div className="absolute top-4 right-4">
              <span className="bg-accent text-accent-foreground text-xs font-bold px-3 py-1 rounded-full">
                LIMITED — FIRST 50
              </span>
            </div>
            <h3 className="text-xl font-bold mb-1">Founding Member Plan</h3>
            <p className="text-sm font-semibold text-accent mb-4">60 Days FREE + Lifetime Locked Pricing</p>
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
            <Button variant="hero" size="lg" className="w-full" onClick={() => navigate("/signup")}>
              Become a Founding Member
            </Button>
          </div>

          {/* Standard */}
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
  );
};

export default TuroPricing;
