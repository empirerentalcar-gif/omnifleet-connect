import { Building2, Car, Users, TrendingUp } from "lucide-react";

const audiences = [
  { icon: Building2, title: "Independent rental agencies" },
  { icon: Car, title: "Turo hosts" },
  { icon: Users, title: "Individuals with 2+ vehicles" },
  { icon: TrendingUp, title: "Fleet owners scaling locally" },
];

const WhoThisIsFor = () => {
  return (
    <section className="py-20 md:py-28 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-background via-secondary/10 to-background" />

      <div className="container mx-auto px-4 relative">
        <div className="text-center mb-14">
          <h2 className="font-display text-3xl md:text-5xl font-bold mb-4">
            Built for Owners Who Want{" "}
            <span className="text-gradient">More Control & More Income</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto mb-10">
          {audiences.map((item) => (
            <div
              key={item.title}
              className="glass-card glow-border rounded-2xl p-8 text-center hover:scale-105 transition-transform duration-300"
            >
              <div className="w-14 h-14 rounded-2xl bg-accent/10 flex items-center justify-center mx-auto mb-5">
                <item.icon className="h-7 w-7 text-accent" />
              </div>
              <p className="font-display font-semibold text-foreground">{item.title}</p>
            </div>
          ))}
        </div>

        <p className="text-center text-lg text-muted-foreground font-medium">
          If you own vehicles, <span className="text-accent">Zuvio helps you monetize them.</span>
        </p>
      </div>
    </section>
  );
};

export default WhoThisIsFor;
