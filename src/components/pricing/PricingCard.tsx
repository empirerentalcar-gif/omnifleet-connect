import { Check, Ban, ShieldCheck, TrendingUp, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const foundingFeatures = [
  "National + regional visibility",
  "Reservation request management",
  "Direct customer communication",
  "Owner-controlled approvals",
  "Lock your rate for life",
];

interface PricingCardProps {
  badgeText?: string;
}

export const PricingCard = ({ badgeText = "LIMITED — FIRST 25" }: PricingCardProps) => {
  const navigate = useNavigate();

  return (
    <div className="glass-card glow-border rounded-2xl p-8 flex flex-col relative overflow-hidden">
      <div className="absolute top-4 right-4">
        <span className="bg-accent text-accent-foreground text-xs font-bold px-3 py-1 rounded-full">
          {badgeText}
        </span>
      </div>
      <h3 className="text-xl font-bold mb-1">Founding Member Plan</h3>
      <p className="text-sm font-semibold text-accent mb-4">
        Limited to First 25 Agencies — Early Members Lock This Rate for Life
      </p>
      <div className="mb-4">
        <span className="text-4xl font-bold text-foreground">$79</span>
        <span className="text-muted-foreground">/month</span>
        <span className="block text-sm text-accent font-medium mt-1">+ 10% per confirmed booking</span>
      </div>

      {/* Micro-clarity */}
      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground mb-6">
        <span className="flex items-center gap-1"><Ban className="h-3 w-3 text-accent" />No setup fees</span>
        <span className="flex items-center gap-1"><Ban className="h-3 w-3 text-accent" />No contracts</span>
        <span className="flex items-center gap-1"><ShieldCheck className="h-3 w-3 text-accent" />Cancel anytime</span>
        <span className="flex items-center gap-1"><ShieldCheck className="h-3 w-3 text-accent" />You stay fully in control</span>
      </div>

      <ul className="space-y-3 mb-6 flex-1">
        {foundingFeatures.map((f) => (
          <li key={f} className="flex items-start gap-3 text-sm text-foreground">
            <Check className="h-4 w-4 text-accent mt-0.5 shrink-0" />
            <span>{f}</span>
          </li>
        ))}
      </ul>

      <Button variant="hero" size="lg" className="w-full group" onClick={() => navigate("/signup")}>
        <span>Lock My Founding Rate</span>
        <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
      </Button>

      {/* Risk reversal */}
      <p className="text-xs text-muted-foreground text-center mt-3">
        Try it risk-free for 30 days. If it doesn't bring value, you don't continue.
      </p>

      {/* Scarcity */}
      <p className="text-xs text-accent font-medium text-center mt-2">
        Once these spots are filled, pricing will increase.
      </p>
    </div>
  );
};

export const PricingROI = () => (
  <div className="mt-10 text-center">
    <p className="text-lg md:text-xl font-bold text-foreground mb-6">
      One or two bookings can cover your entire monthly cost.{" "}
      <span className="text-accent">Everything beyond that is profit.</span>
    </p>

    {/* Decision simplifier */}
    <div className="glass-card rounded-2xl p-6 md:p-8 max-w-md mx-auto">
      <h3 className="font-display text-lg font-bold mb-4">Is This Worth It?</h3>
      <div className="space-y-3 text-left">
        {[
          { bookings: "1–2 extra bookings", result: "it pays for itself", icon: "✅" },
          { bookings: "3–5 bookings", result: "strong profit increase", icon: "📈" },
          { bookings: "More", result: "scalable growth", icon: "🚀" },
        ].map(({ bookings, result, icon }) => (
          <div key={bookings} className="flex items-center gap-3">
            <span className="text-lg">{icon}</span>
            <p className="text-sm text-foreground">
              <strong>{bookings}</strong> → <span className="text-muted-foreground">{result}</span>
            </p>
          </div>
        ))}
      </div>
    </div>
  </div>
);

export default PricingCard;
