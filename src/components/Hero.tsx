import { Button } from "@/components/ui/button";
import { ArrowRight, MapPin, Building2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Hero = () => {
  const navigate = useNavigate();

  return (
    <section className="relative min-h-screen flex flex-col justify-center pt-20 pb-12 overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-hero" />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse-glow" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-pulse-glow delay-500" />
      
      <div 
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                           linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
          backgroundSize: '50px 50px'
        }}
      />

      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-12 animate-slide-up">
          <div className="inline-flex items-center gap-2 glass-card rounded-full px-4 py-2 mb-6">
            <span className="w-2 h-2 bg-accent rounded-full animate-pulse" />
            <span className="text-sm text-muted-foreground">Connecting renters to independent agencies nationwide</span>
          </div>
          
          <h1 className="font-display text-4xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
            Independent Car Rentals
            <br />
            <span className="text-gradient">Near You</span>
          </h1>

          <h2 className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto mb-4">
            Find Cash-Friendly Local Rental Agencies
          </h2>

          <h2 className="text-base md:text-lg text-accent max-w-2xl mx-auto mb-10 font-medium">
            Grow Your Rental Business with ZUVIO
          </h2>

          {/* Dual CTAs */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              variant="hero"
              size="lg"
              className="group text-base"
              onClick={() => navigate("/search")}
            >
              <MapPin className="h-5 w-5" />
              <span>Find a Rental Near You</span>
              <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="text-base border-accent/30 hover:bg-accent/10"
              onClick={() => navigate("/pricing")}
            >
              <Building2 className="h-5 w-5 text-accent" />
              <span>Grow Your Rental Business</span>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
