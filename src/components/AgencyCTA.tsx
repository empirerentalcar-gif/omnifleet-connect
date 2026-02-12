import { Button } from "@/components/ui/button";
import { ArrowRight, MapPin, Building2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

const AgencyCTA = () => {
  const navigate = useNavigate();

  return (
    <section className="py-20 md:py-32 relative overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="relative glass-card glow-border rounded-3xl p-8 md:p-16 overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-accent/20 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-primary/20 rounded-full blur-3xl" />

          <div className="relative z-10 grid md:grid-cols-2 gap-12 items-center">
            {/* Ready to Book? */}
            <div className="text-center md:text-left">
              <h2 className="font-display text-3xl md:text-4xl font-bold mb-6">
                Ready to <span className="text-gradient">Book?</span>
              </h2>
              <Button
                variant="hero"
                size="lg"
                className="group text-base"
                onClick={() => navigate("/search")}
              >
                <MapPin className="h-5 w-5" />
                <span>Search Rentals</span>
                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>

            {/* Ready to Grow? */}
            <div className="text-center md:text-left">
              <h2 className="font-display text-3xl md:text-4xl font-bold mb-6">
                Ready to <span className="text-gradient">Grow?</span>
              </h2>
              <Button
                variant="outline"
                size="lg"
                className="text-base border-accent/30 hover:bg-accent/10 group"
                onClick={() => navigate("/pricing")}
              >
                <Building2 className="h-5 w-5 text-accent" />
                <span>Join the Network</span>
                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AgencyCTA;
