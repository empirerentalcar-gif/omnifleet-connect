import { Quote } from "lucide-react";
import { useTranslation } from "react-i18next";

type Testimonial = { quote: string; name: string; role: string };

const TuroTestimonials = () => {
  const { t } = useTranslation();
  const testimonials = t("turo.testimonials.items", { returnObjects: true }) as Testimonial[];
  return (
  <section className="py-20 md:py-28 relative overflow-hidden">
    <div className="absolute inset-0 bg-gradient-to-b from-background via-secondary/10 to-background" />
    <div className="container mx-auto px-4 relative">
      <div className="text-center mb-14">
        <h2 className="font-display text-3xl md:text-5xl font-bold mb-4">
          {t("turo.testimonials.title")} <span className="text-gradient">{t("turo.testimonials.titleAccent")}</span>
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
};

export default TuroTestimonials;
