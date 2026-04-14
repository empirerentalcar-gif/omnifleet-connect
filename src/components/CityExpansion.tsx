import { Button } from "@/components/ui/button";
import { ArrowRight, MapPin } from "lucide-react";
import { useNavigate } from "react-router-dom";

const CityExpansion = () => {
  const navigate = useNavigate();

  return (
    <section className="py-20 md:py-28 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-background via-accent/5 to-background" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-accent/8 rounded-full blur-3xl" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 glass-card rounded-full px-4 py-2 mb-6">
            <MapPin className="h-4 w-4 text-accent" />
            <span className="text-sm text-muted-foreground">Expanding Nationwide</span>
          </div>

          <h2 className="font-display text-3xl md:text-5xl font-bold mb-6">
            Independent Car Rentals Available Nationwide —{" "}
            <span className="text-gradient">Las Vegas, Phoenix, Miami & More</span>
          </h2>

          <p className="text-lg text-muted-foreground mb-10 max-w-2xl mx-auto">
            Be the first agency listed in your city and gain early visibility before competitors join.
          </p>

          <Button
            variant="hero"
            size="lg"
            className="group text-base"
            onClick={() => navigate("/cities")}
          >
            <MapPin className="h-5 w-5" />
            <span>Claim Your City</span>
            <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
          </Button>
        </div>
      </div>
    </section>
  );
};

export default CityExpansion;
