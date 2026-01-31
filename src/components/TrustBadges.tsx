import { Shield, Lock, BadgeCheck, CreditCard } from "lucide-react";

const badges = [
  {
    id: 1,
    icon: Shield,
    title: "Insurance Partner",
    description: "Add insurance partner name",
    placeholder: "Partner Logo",
  },
  {
    id: 2,
    icon: Lock,
    title: "Secure Payments",
    description: "256-bit SSL encryption",
    placeholder: "Payment Badge",
  },
  {
    id: 3,
    icon: BadgeCheck,
    title: "Verified Agencies",
    description: "All agencies background-checked",
    placeholder: "Verification Seal",
  },
  {
    id: 4,
    icon: CreditCard,
    title: "Payment Partners",
    description: "Add payment processors",
    placeholder: "Payment Logos",
  },
];

const TrustBadges = () => {
  return (
    <section className="py-16 bg-secondary/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h3 className="font-display text-xl font-semibold text-muted-foreground">
            Trusted & Secure Platform
          </h3>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {badges.map((badge) => (
            <div 
              key={badge.id}
              className="flex flex-col items-center text-center group"
            >
              <div className="w-16 h-16 rounded-2xl bg-card border border-border flex items-center justify-center mb-4 group-hover:border-primary/30 transition-colors">
                <badge.icon className="h-8 w-8 text-primary" />
              </div>
              <h4 className="font-semibold text-foreground mb-1">{badge.title}</h4>
              <p className="text-sm text-muted-foreground">{badge.description}</p>
              {/* Placeholder for actual badge/logo image */}
              <div className="mt-3 px-3 py-1 bg-muted rounded text-xs text-muted-foreground">
                {badge.placeholder}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TrustBadges;
