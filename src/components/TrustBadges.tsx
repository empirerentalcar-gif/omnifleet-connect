import { Shield, BadgeCheck, Phone, Quote, Star } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const ownerTestimonials = [
  {
    name: "Carlos M.",
    role: "Owner, Metro Auto Rentals",
    location: "Miami, FL",
    quote: "Since joining ZUVIO, my phone rings with new customers I never would have reached. I still run my business my way — ZUVIO just makes me visible.",
    rating: 5,
  },
  {
    name: "Diana R.",
    role: "Owner, SunCoast Car Hire",
    location: "Orlando, FL",
    quote: "I love that customers call me directly to cancel. It keeps the relationship personal. ZUVIO understands how independent agencies work.",
    rating: 5,
  },
];

const customerTestimonials = [
  {
    name: "James T.",
    location: "Atlanta, GA",
    quote: "I found a cash-friendly rental in 5 minutes. No corporate hassle, just a real person who picked up the phone.",
    rating: 5,
  },
  {
    name: "Maria S.",
    location: "Houston, TX",
    quote: "Finally a platform that lets me book with a local agency instead of overpaying at the airport counter.",
    rating: 5,
  },
];

const TrustBadges = () => {
  return (
    <section className="py-24 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-background via-secondary/20 to-background" />

      <div className="container mx-auto px-4 relative">
        {/* Trust Badges */}
        <div className="text-center mb-16">
          <h2 className="font-display text-3xl md:text-5xl font-bold mb-4">
            Trusted by <span className="text-gradient">Owners & Renters</span>
          </h2>
        </div>

        <div className="flex flex-wrap justify-center gap-6 mb-16">
          {[
            { icon: BadgeCheck, label: "Verified independent agencies" },
            { icon: Shield, label: "Secure reservation process" },
            { icon: Phone, label: "Cancellation handled directly by location" },
          ].map((badge) => (
            <div
              key={badge.label}
              className="glass-card rounded-xl px-6 py-4 flex items-center gap-3"
            >
              <badge.icon className="h-5 w-5 text-accent" />
              <span className="text-sm font-medium text-foreground">{badge.label}</span>
            </div>
          ))}
        </div>

        {/* Owner Testimonials */}
        <div className="mb-12">
          <h3 className="font-display text-xl font-bold text-center mb-8 text-muted-foreground">What Owners Say</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {ownerTestimonials.map((t) => (
              <Card key={t.name} className="bg-card/50 backdrop-blur-sm border-border/50">
                <CardContent className="p-6">
                  <Quote className="h-8 w-8 text-accent/30 mb-4" />
                  <p className="text-foreground/80 mb-4 leading-relaxed">"{t.quote}"</p>
                  <div className="flex items-center gap-1 mb-3">
                    {[...Array(t.rating)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-primary text-primary" />
                    ))}
                  </div>
                  <p className="font-semibold text-foreground">{t.name}</p>
                  <p className="text-sm text-muted-foreground">{t.role}</p>
                  <p className="text-xs text-muted-foreground">{t.location}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Customer Testimonials */}
        <div>
          <h3 className="font-display text-xl font-bold text-center mb-8 text-muted-foreground">What Customers Say</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {customerTestimonials.map((t) => (
              <Card key={t.name} className="bg-card/50 backdrop-blur-sm border-border/50">
                <CardContent className="p-6">
                  <Quote className="h-8 w-8 text-primary/30 mb-4" />
                  <p className="text-foreground/80 mb-4 leading-relaxed">"{t.quote}"</p>
                  <div className="flex items-center gap-1 mb-3">
                    {[...Array(t.rating)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-primary text-primary" />
                    ))}
                  </div>
                  <p className="font-semibold text-foreground">{t.name}</p>
                  <p className="text-xs text-muted-foreground">{t.location}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default TrustBadges;
