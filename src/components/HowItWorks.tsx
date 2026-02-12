import { Search, MapPin, CalendarCheck, Phone, UserCheck, ClipboardCheck, Eye, ShieldCheck } from "lucide-react";

const HowItWorks = () => {
  return (
    <section id="how-it-works" className="py-20 md:py-32 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-border to-transparent" />
      <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-border to-transparent" />

      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="font-display text-3xl md:text-5xl font-bold mb-4">
            How It <span className="text-gradient">Works</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto">
            Simple for renters. Powerful for owners.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
          {/* For Renters */}
          <div className="glass-card glow-border rounded-2xl p-8 md:p-10">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-semibold mb-8">
              <Search className="h-4 w-4" />
              For Renters
            </div>

            <div className="space-y-6">
              {[
                { icon: MapPin, text: "Search by city or ZIP" },
                { icon: ClipboardCheck, text: "Compare independent agencies" },
                { icon: CalendarCheck, text: "Request your reservation" },
                { icon: Phone, text: "Connect directly with the owner" },
              ].map((step, i) => (
                <div key={i} className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                    <step.icon className="h-5 w-5 text-primary" />
                  </div>
                  <div className="pt-2">
                    <p className="text-foreground font-medium">{step.text}</p>
                  </div>
                </div>
              ))}
            </div>

            <p className="mt-8 text-muted-foreground italic text-sm border-t border-border/50 pt-6">
              No corporate runaround. No hidden surprises.
            </p>
          </div>

          {/* For Owners */}
          <div className="glass-card glow-border rounded-2xl p-8 md:p-10">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 text-accent text-sm font-semibold mb-8">
              <ShieldCheck className="h-4 w-4" />
              For Owners
            </div>

            <div className="space-y-6">
              {[
                { icon: UserCheck, text: "Create your agency profile" },
                { icon: CalendarCheck, text: "Receive reservation requests" },
                { icon: ClipboardCheck, text: "Approve or decline" },
                { icon: Eye, text: "Grow regional visibility" },
              ].map((step, i) => (
                <div key={i} className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center shrink-0">
                    <step.icon className="h-5 w-5 text-accent" />
                  </div>
                  <div className="pt-2">
                    <p className="text-foreground font-medium">{step.text}</p>
                  </div>
                </div>
              ))}
            </div>

            <p className="mt-8 text-muted-foreground italic text-sm border-t border-border/50 pt-6">
              You keep your policies. You keep your customers.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
