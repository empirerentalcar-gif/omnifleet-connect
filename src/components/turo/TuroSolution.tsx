{/* TODO: i18n — no matching keys in en.json/es.json for this component yet; strings remain English. */}
import { CheckCircle2 } from "lucide-react";

const bullets = [
  "Direct booking requests",
  "Direct communication",
  "Your pricing, your rules",
  "Build repeat business",
];

const TuroSolution = () => (
  <section className="py-20 md:py-28 relative overflow-hidden">
    <div className="absolute inset-0 bg-gradient-to-b from-background via-accent/5 to-background" />
    <div className="container mx-auto px-4 relative max-w-3xl">
      <div className="text-center mb-12">
        <span className="inline-block px-4 py-2 rounded-full bg-accent/10 text-accent text-sm font-medium mb-4">
          The Solution
        </span>
        <h2 className="font-display text-3xl md:text-5xl font-bold mb-4">
          Zuvio Helps Las Vegas Turo Hosts <span className="text-gradient">Take Back Control</span>
        </h2>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Zuvio works alongside Turo — helping you generate direct bookings and build long-term customers.
        </p>
      </div>

      <div className="glass-card glow-border rounded-2xl p-8 md:p-10 space-y-5 mb-8">
        {bullets.map((b) => (
          <div key={b} className="flex items-start gap-3">
            <CheckCircle2 className="h-5 w-5 text-accent shrink-0 mt-0.5" />
            <p className="text-foreground text-lg font-medium">{b}</p>
          </div>
        ))}
      </div>

      <p className="text-center text-xl font-bold text-foreground">
        Use Turo. <span className="text-gradient">Grow with Zuvio.</span>
      </p>
    </div>
  </section>
);

export default TuroSolution;
