import { ShieldCheck, Phone, Ban, Eye } from "lucide-react";

const trustItems = [
  { icon: ShieldCheck, text: "Verified agency profiles" },
  { icon: Phone, text: "Direct communication" },
  { icon: Ban, text: "No platform interference" },
  { icon: Eye, text: "No hidden surprises" },
];

const TrustSection = () => {
  return (
    <section className="py-20 md:py-28 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-background via-primary/5 to-background" />

      <div className="container mx-auto px-4 relative">
        <div className="text-center mb-14">
          <h2 className="font-display text-3xl md:text-5xl font-bold mb-4">
            Built for <span className="text-gradient">Independent Businesses</span>
          </h2>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
          {trustItems.map((item) => (
            <div
              key={item.text}
              className="glass-card glow-border rounded-2xl p-6 text-center hover:scale-105 transition-transform duration-300"
            >
              <div className="w-12 h-12 rounded-full bg-accent/15 flex items-center justify-center mx-auto mb-4">
                <item.icon className="h-6 w-6 text-accent" />
              </div>
              <p className="font-semibold text-foreground text-sm">{item.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TrustSection;
