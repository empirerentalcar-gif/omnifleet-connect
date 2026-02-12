import { Check } from "lucide-react";

const benefits = [
  "Local businesses",
  "Flexible policies",
  "Direct communication",
  "Cash-friendly options",
];

const Comparison = () => {
  return (
    <section className="py-24 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-background via-primary/5 to-background" />

      <div className="container mx-auto px-4 relative">
        <div className="max-w-3xl mx-auto text-center">
          <span className="inline-block px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
            Why Independent?
          </span>

          <h2 className="font-display text-3xl md:text-5xl font-bold mb-6">
            Why Choose <span className="text-gradient">Independent?</span>
          </h2>

          <p className="text-lg text-muted-foreground mb-12 max-w-2xl mx-auto">
            Large corporate chains dominate search results. Independent rental agencies often go unseen.
            <br /><br />
            ZUVIO brings them together under one network — making local businesses easier to find and easier to book.
          </p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {benefits.map((benefit) => (
              <div
                key={benefit}
                className="glass-card glow-border rounded-2xl p-6 text-center hover:scale-105 transition-transform duration-300"
              >
                <div className="w-10 h-10 rounded-full bg-accent/15 flex items-center justify-center mx-auto mb-3">
                  <Check className="h-5 w-5 text-accent" />
                </div>
                <p className="font-semibold text-foreground text-sm">{benefit}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Comparison;
