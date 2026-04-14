import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

const bullets = [
  "Get bookings outside of Turo",
  "Keep your pricing and policies",
  "Build your own customer base",
  "No platform interference",
];

const TuroHero = () => {
  const navigate = useNavigate();

  return (
    <section className="relative min-h-screen flex flex-col justify-center pt-20 pb-16 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-hero" />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse-glow" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-pulse-glow delay-500" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center animate-slide-up">
          <div className="inline-flex items-center gap-2 glass-card rounded-full px-4 py-2 mb-8">
            <span className="w-2 h-2 bg-accent rounded-full animate-pulse" />
            <span className="text-sm text-muted-foreground">Built for Turo hosts ready to grow</span>
          </div>

          <h1 className="font-display text-4xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
            Las Vegas Turo Hosts: Get More Bookings
            <br />
            <span className="text-gradient">& Keep More Control with Zuvio</span>
          </h1>

          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto mb-10">
            Zuvio helps you attract direct customers, grow beyond Turo, and build a rental business you actually control.
          </p>

          <div className="flex flex-wrap justify-center gap-x-8 gap-y-3 mb-10">
            {bullets.map((point) => (
              <div key={point} className="flex items-center gap-2 text-foreground">
                <CheckCircle2 className="h-5 w-5 text-accent shrink-0" />
                <span className="text-sm md:text-base font-medium">{point}</span>
              </div>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              variant="hero"
              size="lg"
              className="group text-base"
              onClick={() => navigate("/signup")}
            >
              <span>Start Getting Direct Bookings</span>
              <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="text-base border-accent/30 hover:bg-accent/10"
              onClick={() => {
                document.getElementById("turo-pricing")?.scrollIntoView({ behavior: "smooth" });
              }}
            >
              See Pricing
            </Button>
          </div>

          <p className="text-sm text-muted-foreground mt-6">No contracts. Cancel anytime.</p>
        </div>
      </div>
    </section>
  );
};

export default TuroHero;
