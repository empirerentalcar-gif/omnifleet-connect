import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

const TuroFinalCTA = () => {
  const navigate = useNavigate();

  return (
    <section className="py-24 md:py-32 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-hero" />
      <div className="absolute top-1/3 left-1/3 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse-glow" />
      <div className="absolute bottom-1/3 right-1/3 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-pulse-glow delay-500" />

      <div className="container mx-auto px-4 relative z-10 text-center">
        <h2 className="font-display text-3xl md:text-5xl lg:text-6xl font-bold mb-6">
          Start Getting More Bookings
          <br />
          <span className="text-gradient">— On Your Terms</span>
        </h2>
        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
          Build a rental business that works for you — not the platform.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            variant="hero"
            size="xl"
            className="group text-base"
            onClick={() => navigate("/signup")}
          >
            <span>Become a Founding Member</span>
            <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
          </Button>
          <Button
            variant="outline"
            size="xl"
            className="text-base border-accent/30 hover:bg-accent/10"
            onClick={() => navigate("/signup")}
          >
            Start Getting Direct Bookings
          </Button>
        </div>
      </div>
    </section>
  );
};

export default TuroFinalCTA;
