import { Button } from "@/components/ui/button";
import { ArrowRight, Building2, TrendingUp, Shield } from "lucide-react";

const benefits = [
  {
    icon: TrendingUp,
    title: "Increase Bookings",
    description: "Access millions of customers searching for rentals"
  },
  {
    icon: Building2,
    title: "Manage Easily",
    description: "One dashboard for all your vehicles and locations"
  },
  {
    icon: Shield,
    title: "Secure Payments",
    description: "Guaranteed payments with fraud protection"
  }
];

const AgencyCTA = () => {
  return (
    <section className="py-20 md:py-32 relative overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="relative glass-card glow-border rounded-3xl p-8 md:p-16 overflow-hidden">
          {/* Background Glow */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-accent/20 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-primary/20 rounded-full blur-3xl" />

          <div className="relative z-10 grid lg:grid-cols-2 gap-12 items-center">
            {/* Content */}
            <div>
              <div className="inline-flex items-center gap-2 glass-card rounded-full px-4 py-2 mb-6">
                <Building2 className="h-4 w-4 text-accent" />
                <span className="text-sm text-muted-foreground">For Rental Agencies</span>
              </div>

              <h2 className="font-display text-3xl md:text-5xl font-bold mb-6">
                Grow your fleet with <span className="text-gradient">DriveHub</span>
              </h2>

              <p className="text-lg text-muted-foreground mb-8 max-w-lg">
                Join 2,500+ agencies already using DriveHub to maximize their fleet utilization 
                and reach customers worldwide.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button variant="hero" size="lg" className="group">
                  <span>Partner With Us</span>
                  <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Button>
                <Button variant="outline" size="lg">
                  Learn More
                </Button>
              </div>
            </div>

            {/* Benefits */}
            <div className="space-y-6">
              {benefits.map((benefit) => (
                <div key={benefit.title} className="flex gap-4 items-start">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                    <benefit.icon className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-display text-lg font-bold mb-1">{benefit.title}</h3>
                    <p className="text-muted-foreground">{benefit.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AgencyCTA;
