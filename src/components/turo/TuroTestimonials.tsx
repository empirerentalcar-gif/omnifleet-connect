import { Quote } from "lucide-react";

const testimonials = [
  {
    quote: "I was tired of Turo taking a cut and controlling my prices. With Zuvio, I set my own rates and customers call me directly. My bookings have increased since joining.",
    name: "Marcus T.",
    role: "Turo Host & Fleet Owner · Las Vegas, NV",
  },
  {
    quote: "As a Turo host I was always worried about account suspensions. Zuvio gave me a second channel where I'm in full control. It's exactly what independent owners need.",
    name: "Daniela R.",
    role: "Turo Host & Agency Owner · Miami, FL",
  },
  {
    quote: "The setup was simple and I started getting calls within the first week. No complicated onboarding, no corporate policies — just business.",
    name: "James K.",
    role: "Small Fleet Owner · Dallas, TX",
  },
];

const TuroTestimonials = () => (
  <section className="py-20 md:py-28 relative overflow-hidden">
    <div className="absolute inset-0 bg-gradient-to-b from-background via-secondary/10 to-background" />
    <div className="container mx-auto px-4 relative">
      <div className="text-center mb-14">
        <h2 className="font-display text-3xl md:text-5xl font-bold mb-4">
          What Hosts Are <span className="text-gradient">Saying</span>
        </h2>
      </div>

      <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
        {testimonials.map((t) => (
          <div key={t.name} className="glass-card glow-border rounded-2xl p-8 flex flex-col">
            <Quote className="h-8 w-8 text-accent/40 mb-4" />
            <p className="text-muted-foreground mb-6 flex-1 leading-relaxed">"{t.quote}"</p>
            <div>
              <p className="font-display font-bold text-foreground">{t.name}</p>
              <p className="text-sm text-muted-foreground">{t.role}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default TuroTestimonials;
