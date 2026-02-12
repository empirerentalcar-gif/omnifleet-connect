import { Button } from "@/components/ui/button";
import { ArrowRight, Building2, Eye, CalendarCheck, Clock, Phone, ShieldCheck } from "lucide-react";
import { useNavigate } from "react-router-dom";

const benefits = [
  { icon: Eye, title: "Increased regional visibility" },
  { icon: CalendarCheck, title: "More reservation opportunities" },
  { icon: Clock, title: "24/7 digital presence" },
  { icon: Phone, title: "Direct customer communication" },
  { icon: ShieldCheck, title: "Full control of pricing & policies" },
];

const OwnerCTA = () => {
  const navigate = useNavigate();

  return (
    <section className="relative py-20 md:py-28 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-accent/5 to-primary/10" />
      <div className="absolute top-1/3 left-1/3 w-[500px] h-[500px] bg-primary/8 rounded-full blur-3xl" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center max-w-6xl mx-auto">
          {/* Content */}
          <div>
            <div className="inline-flex items-center gap-2 glass-card rounded-full px-4 py-2 mb-6">
              <Building2 className="h-4 w-4 text-accent" />
              <span className="text-sm text-muted-foreground">For Independent Rental Owners</span>
            </div>

            <h2 className="font-display text-3xl md:text-5xl font-bold mb-6 leading-tight">
              Built for Independent{" "}
              <span className="text-gradient">Rental Owners</span>
            </h2>

            <p className="text-lg text-muted-foreground mb-8 max-w-lg">
              ZUVIO does not replace your business — it strengthens it.
            </p>

            <Button
              variant="hero"
              size="lg"
              className="group text-base"
              onClick={() => navigate("/owner-benefits")}
            >
              <Building2 className="h-5 w-5" />
              <span>List Your Agency</span>
              <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>

          {/* Benefits */}
          <div className="space-y-5">
            {benefits.map((benefit) => (
              <div key={benefit.title} className="flex gap-4 items-center glass-card rounded-xl p-4 hover:scale-[1.02] transition-transform">
                <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center shrink-0">
                  <benefit.icon className="h-6 w-6 text-accent" />
                </div>
                <p className="font-display text-lg font-semibold">{benefit.title}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default OwnerCTA;
