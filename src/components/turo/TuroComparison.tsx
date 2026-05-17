{/* TODO: i18n — no matching keys in en.json/es.json for this component yet; strings remain English. */}
import { XCircle, CheckCircle2 } from "lucide-react";

const turoItems = [
  "Platform-controlled",
  "Fees reduce margins",
  "Limited ownership of customer",
];

const zuvioItems = [
  "You control everything",
  "Direct customer relationships",
  "Built for independence",
];

const TuroComparison = () => (
  <section className="py-20 md:py-28 relative overflow-hidden">
    <div className="absolute inset-0 bg-gradient-to-b from-background via-primary/5 to-background" />
    <div className="container mx-auto px-4 relative max-w-5xl">
      <div className="text-center mb-14">
        <h2 className="font-display text-3xl md:text-5xl font-bold mb-4">
          Turo vs. <span className="text-gradient">Zuvio</span>
        </h2>
      </div>

      <div className="grid md:grid-cols-2 gap-8 mb-10">
        <div className="glass-card rounded-2xl p-8 border-destructive/20">
          <h3 className="font-display text-xl font-bold mb-6 text-muted-foreground">Turo</h3>
          <div className="space-y-4">
            {turoItems.map((item) => (
              <div key={item} className="flex items-start gap-3">
                <XCircle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
                <p className="text-muted-foreground">{item}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="glass-card glow-border rounded-2xl p-8">
          <h3 className="font-display text-xl font-bold mb-6 text-accent">Zuvio</h3>
          <div className="space-y-4">
            {zuvioItems.map((item) => (
              <div key={item} className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-accent shrink-0 mt-0.5" />
                <p className="text-foreground font-medium">{item}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <p className="text-center text-lg text-muted-foreground">
        Smart hosts don't rely on one platform.{" "}
        <span className="text-accent font-semibold">They diversify.</span>
      </p>
    </div>
  </section>
);

export default TuroComparison;
