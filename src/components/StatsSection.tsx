import { TrendingUp, Users, MapPin, Car, Shield, Clock } from "lucide-react";

const stats = [
  {
    icon: Users,
    value: "2,500+",
    label: "Partner Agencies",
    description: "Verified and trusted partners worldwide"
  },
  {
    icon: Car,
    value: "50,000+",
    label: "Active Vehicles",
    description: "Available for instant booking"
  },
  {
    icon: MapPin,
    value: "150+",
    label: "Cities",
    description: "Across 45 countries"
  },
  {
    icon: TrendingUp,
    value: "2M+",
    label: "Bookings",
    description: "Completed successfully"
  }
];

const StatsSection = () => {
  return (
    <section className="py-20 relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-accent/5 to-primary/5" />
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
          {stats.map((stat, index) => (
            <div 
              key={stat.label}
              className="glass-card glow-border rounded-2xl p-6 md:p-8 text-center hover:scale-105 transition-transform duration-300"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-primary/10 mb-4">
                <stat.icon className="h-7 w-7 text-primary" />
              </div>
              <div className="font-display text-3xl md:text-4xl font-bold text-gradient mb-2">
                {stat.value}
              </div>
              <div className="font-semibold text-foreground mb-1">{stat.label}</div>
              <div className="text-sm text-muted-foreground">{stat.description}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default StatsSection;
