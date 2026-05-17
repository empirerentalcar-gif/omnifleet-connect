// TODO: i18n — no matching keys in en.json/es.json for this component yet; strings remain English.
import { DollarSign, TrendingUp, Users, BarChart3 } from "lucide-react";

const benefits = [
  { icon: BarChart3, text: "Fill unused calendar days" },
  { icon: TrendingUp, text: "Capture off-platform demand" },
  { icon: Users, text: "Increase repeat customers" },
  { icon: DollarSign, text: "Reduce reliance on platform fees" },
];

const TuroMoney = () => (
  <section className="py-20 md:py-28 relative overflow-hidden">
    <div className="absolute inset-0 bg-gradient-to-b from-background via-primary/5 to-background" />
    <div className="container mx-auto px-4 relative max-w-4xl">
      <div className="text-center mb-12">
        <span className="inline-block px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
          Revenue
        </span>
        <h2 className="font-display text-3xl md:text-5xl font-bold mb-4">
          Earn More From Your Rental Cars — <span className="text-gradient">Keep More of What You Make</span>
        </h2>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          One or two additional bookings can cover your entire monthly cost.
        </p>
      </div>

      <div className="grid sm:grid-cols-2 gap-6 mb-10">
        {benefits.map(({ icon: Icon, text }) => (
          <div key={text} className="glass-card rounded-xl p-6 flex items-center gap-4">
            <div className="p-3 rounded-lg bg-primary/10">
              <Icon className="h-6 w-6 text-primary" />
            </div>
            <p className="text-foreground font-medium text-lg">{text}</p>
          </div>
        ))}
      </div>

      <p className="text-center text-xl font-bold text-accent">
        Zuvio is designed to pay for itself — quickly.
      </p>
    </div>
  </section>
);

export default TuroMoney;
