import { XCircle, CheckCircle2 } from "lucide-react";

const traditional = [
  "Take a cut of your revenue",
  "Control your pricing",
  "Own your customer data",
  "Limit how you operate",
];

const zuvio = [
  "No pricing control",
  "No forced policies",
  "Direct customer communication",
  "Built for independent operators",
];

const CompetitorContrast = () => {
  return (
    <section className="py-20 md:py-28 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-background via-primary/5 to-background" />

      <div className="container mx-auto px-4 relative">
        <div className="text-center mb-14">
          <span className="inline-block px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
            Comparison
          </span>
          <h2 className="font-display text-3xl md:text-5xl font-bold mb-4">
            Why Not Just Use Turo or{" "}
            <span className="text-gradient">Big Rental Platforms?</span>
          </h2>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto mb-10">
          {/* Traditional */}
          <div className="glass-card rounded-2xl p-8 border-destructive/20">
            <h3 className="font-display text-xl font-bold mb-6 text-muted-foreground">
              Traditional Platforms
            </h3>
            <div className="space-y-4">
              {traditional.map((item) => (
                <div key={item} className="flex items-start gap-3">
                  <XCircle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
                  <p className="text-muted-foreground">{item}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Zuvio */}
          <div className="glass-card glow-border rounded-2xl p-8">
            <h3 className="font-display text-xl font-bold mb-6 text-accent">
              Zuvio
            </h3>
            <div className="space-y-4">
              {zuvio.map((item) => (
                <div key={item} className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-accent shrink-0 mt-0.5" />
                  <p className="text-foreground font-medium">{item}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <p className="text-center text-lg text-muted-foreground max-w-2xl mx-auto">
          You don't work for the platform —{" "}
          <span className="text-accent font-semibold">the platform works for you.</span>
        </p>
      </div>
    </section>
  );
};

export default CompetitorContrast;
