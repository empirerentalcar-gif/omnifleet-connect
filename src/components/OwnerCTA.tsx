import { Button } from "@/components/ui/button";
import { ArrowRight, Rocket } from "lucide-react";
import { useNavigate } from "react-router-dom";

const OwnerCTA = () => {
  const navigate = useNavigate();

  return (
    <section className="relative py-16 md:py-20 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-accent/5 to-primary/10" />
      <div className="absolute top-0 left-1/3 w-[500px] h-[500px] bg-primary/8 rounded-full blur-3xl" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 glass-card rounded-full px-4 py-2 mb-6">
            <Rocket className="h-4 w-4 text-accent" />
            <span className="text-sm text-muted-foreground">For Independent Owners & Agencies</span>
          </div>

          <h2 className="font-display text-3xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
            Grow Your Rental Business —{" "}
            <span className="text-gradient">Join ZUVIO</span>
          </h2>

          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
            List your vehicles, receive reservations, and grow your revenue — all while keeping your
            existing phone number and full control of your fleet.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              variant="hero"
              size="lg"
              className="group text-base"
              onClick={() => navigate("/signup")}
            >
              <span>Apply to Join</span>
              <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="text-base"
              onClick={() => {
                document.getElementById("how-it-works")?.scrollIntoView({ behavior: "smooth" });
              }}
            >
              Learn How It Works
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default OwnerCTA;
