import { Check, X, Minus } from "lucide-react";

const features = [
  {
    name: "Direct agency relationships",
    zuvio: true,
    aggregators: false,
    traditional: true,
  },
  {
    name: "Transparent pricing (no hidden fees)",
    zuvio: true,
    aggregators: false,
    traditional: "partial",
  },
  {
    name: "Multi-location support",
    zuvio: true,
    aggregators: true,
    traditional: false,
  },
  {
    name: "Agency branding visibility",
    zuvio: true,
    aggregators: false,
    traditional: true,
  },
  {
    name: "Customer data ownership",
    zuvio: true,
    aggregators: false,
    traditional: true,
  },
  {
    name: "Real-time availability",
    zuvio: true,
    aggregators: "partial",
    traditional: false,
  },
  {
    name: "Fleet management tools",
    zuvio: true,
    aggregators: false,
    traditional: "partial",
  },
  {
    name: "Commission-free options",
    zuvio: true,
    aggregators: false,
    traditional: true,
  },
];

const renderFeatureStatus = (status: boolean | string) => {
  if (status === true) {
    return <Check className="h-5 w-5 text-primary" />;
  }
  if (status === false) {
    return <X className="h-5 w-5 text-destructive" />;
  }
  return <Minus className="h-5 w-5 text-muted-foreground" />;
};

const Comparison = () => {
  return (
    <section className="py-24 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-background via-primary/5 to-background" />
      
      <div className="container mx-auto px-4 relative">
        <div className="text-center mb-16">
          <span className="inline-block px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
            Why Zuvio?
          </span>
          <h2 className="font-display text-3xl md:text-5xl font-bold mb-4">
            Zuvio vs <span className="text-gradient">The Competition</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            See why independent agencies choose Zuvio over traditional aggregators
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-2xl overflow-hidden">
            {/* Header */}
            <div className="grid grid-cols-4 gap-4 p-6 bg-secondary/30 border-b border-border">
              <div className="font-semibold text-foreground">Feature</div>
              <div className="text-center">
                <span className="font-display font-bold text-primary">Zuvio</span>
              </div>
              <div className="text-center">
                <span className="font-medium text-muted-foreground">Aggregators</span>
                <p className="text-xs text-muted-foreground/70">Kayak, Priceline, etc.</p>
              </div>
              <div className="text-center">
                <span className="font-medium text-muted-foreground">Traditional</span>
                <p className="text-xs text-muted-foreground/70">Direct booking only</p>
              </div>
            </div>

            {/* Features */}
            <div className="divide-y divide-border/50">
              {features.map((feature, index) => (
                <div 
                  key={index}
                  className="grid grid-cols-4 gap-4 p-6 hover:bg-secondary/20 transition-colors"
                >
                  <div className="text-foreground/80 text-sm md:text-base">
                    {feature.name}
                  </div>
                  <div className="flex justify-center">
                    {renderFeatureStatus(feature.zuvio)}
                  </div>
                  <div className="flex justify-center">
                    {renderFeatureStatus(feature.aggregators)}
                  </div>
                  <div className="flex justify-center">
                    {renderFeatureStatus(feature.traditional)}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <p className="text-center text-sm text-muted-foreground mt-6">
            * Comparison based on typical features. Individual experiences may vary.
          </p>
        </div>
      </div>
    </section>
  );
};

export default Comparison;
