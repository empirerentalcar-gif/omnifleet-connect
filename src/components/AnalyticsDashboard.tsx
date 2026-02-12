import { Search, PhoneCall, CalendarCheck, TrendingUp } from "lucide-react";

const funnelSteps = [
  {
    icon: Search,
    label: "Search Leads",
    value: "12,480",
    change: "+18%",
    description: "Customers who searched for your vehicles",
    barWidth: "100%",
  },
  {
    icon: PhoneCall,
    label: "Click-to-Call",
    value: "3,720",
    change: "+24%",
    description: "Direct calls generated from your listings",
    barWidth: "62%",
  },
  {
    icon: CalendarCheck,
    label: "Completed Reservations",
    value: "1,860",
    change: "+31%",
    description: "Bookings confirmed through the platform",
    barWidth: "38%",
  },
];

const AnalyticsDashboard = () => {
  return (
    <section className="py-24 relative">
      <div className="absolute inset-0 bg-gradient-to-b from-background via-primary/5 to-background" />

      <div className="container mx-auto px-4 relative">
        <div className="text-center mb-16">
          <span className="inline-block px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
            <TrendingUp className="inline h-4 w-4 mr-1 -mt-0.5" />
            Revenue Funnel
          </span>
          <h2 className="font-display text-3xl md:text-5xl font-bold mb-4">
            Track Every <span className="text-gradient">Lead to Booking</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Built-in analytics show exactly how customers find you and convert — no third-party tools required.
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          {/* Funnel Visualization */}
          <div className="glass-card rounded-2xl p-8 md:p-12 glow-border">
            <div className="space-y-8">
              {funnelSteps.map((step, index) => (
                <div key={step.label} className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <step.icon className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-display font-bold text-lg">{step.label}</h3>
                        <p className="text-sm text-muted-foreground">{step.description}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="font-display text-2xl font-bold">{step.value}</span>
                      <span className="ml-2 text-sm text-green-400 font-medium">{step.change}</span>
                    </div>
                  </div>

                  {/* Funnel bar */}
                  <div className="w-full bg-muted/30 rounded-full h-3 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-primary to-accent transition-all duration-1000"
                      style={{ width: step.barWidth }}
                    />
                  </div>

                  {index < funnelSteps.length - 1 && (
                    <div className="flex justify-center text-muted-foreground/40">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M12 5v14M19 12l-7 7-7-7" />
                      </svg>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Conversion summary */}
            <div className="mt-10 pt-8 border-t border-border/30 grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
              <div>
                <div className="text-sm text-muted-foreground mb-1">Search → Call Rate</div>
                <div className="font-display text-2xl font-bold text-primary">29.8%</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground mb-1">Call → Booking Rate</div>
                <div className="font-display text-2xl font-bold text-accent">50.0%</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground mb-1">Overall Conversion</div>
                <div className="font-display text-2xl font-bold text-green-400">14.9%</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AnalyticsDashboard;
