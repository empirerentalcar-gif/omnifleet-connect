import { Button } from "@/components/ui/button";
import { ArrowRight, MapPin, Building2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import SearchPanel from "./SearchPanel";

const Hero = () => {
  const navigate = useNavigate();

  return (
    <section className="relative min-h-screen flex flex-col justify-center pt-20 pb-12 overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-hero" />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse-glow" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-pulse-glow delay-500" />
      
      {/* Grid Pattern Overlay */}
      <div 
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                           linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
          backgroundSize: '50px 50px'
        }}
      />

      <div className="container mx-auto px-4 relative z-10">
        {/* Hero Content */}
        <div className="text-center mb-12 animate-slide-up">
          <div className="inline-flex items-center gap-2 glass-card rounded-full px-4 py-2 mb-6">
            <span className="w-2 h-2 bg-accent rounded-full animate-pulse" />
            <span className="text-sm text-muted-foreground">Real-time availability across 150+ cities</span>
          </div>
          
          <h1 className="font-display text-4xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
            Find & Book <span className="text-gradient">Independent Car Rentals</span>
            <br />
            — All in One Place
          </h1>
          
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto mb-10">
            ZUVIO connects customers directly to trusted local rental agencies — including 
            cash-friendly options — with full owner control.
          </p>

          {/* Dual CTAs */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Button
              variant="hero"
              size="lg"
              className="group text-base"
              onClick={() => {
                document.getElementById("featured-vehicles")?.scrollIntoView({ behavior: "smooth" });
              }}
            >
              <MapPin className="h-5 w-5" />
              <span>Find a Rental Near Me</span>
              <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="text-base border-accent/30 hover:bg-accent/10"
              onClick={() => navigate("/owner-benefits")}
            >
              <Building2 className="h-5 w-5 text-accent" />
              <span>List Your Rental Agency</span>
            </Button>
          </div>
        </div>

        {/* Search Panel */}
        <div className="animate-slide-up delay-200">
          <SearchPanel />
        </div>

        {/* Trust Badges */}
        <div className="mt-16 flex flex-wrap justify-center items-center gap-8 md:gap-16 opacity-50 animate-fade-in delay-400">
          <div className="text-center">
            <div className="font-display text-2xl md:text-3xl font-bold text-foreground">Enterprise</div>
            <div className="text-xs text-muted-foreground">Partner</div>
          </div>
          <div className="text-center">
            <div className="font-display text-2xl md:text-3xl font-bold text-foreground">Hertz</div>
            <div className="text-xs text-muted-foreground">Partner</div>
          </div>
          <div className="text-center">
            <div className="font-display text-2xl md:text-3xl font-bold text-foreground">Avis</div>
            <div className="text-xs text-muted-foreground">Partner</div>
          </div>
          <div className="text-center">
            <div className="font-display text-2xl md:text-3xl font-bold text-foreground">Budget</div>
            <div className="text-xs text-muted-foreground">Partner</div>
          </div>
          <div className="text-center">
            <div className="font-display text-2xl md:text-3xl font-bold text-foreground">National</div>
            <div className="text-xs text-muted-foreground">Partner</div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
