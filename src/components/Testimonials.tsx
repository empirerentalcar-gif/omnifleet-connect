import { Star, Quote } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const testimonials = [
  {
    id: 1,
    name: "Agency Owner Name",
    role: "Owner, Agency Name",
    location: "City, State",
    image: "/placeholder.svg",
    quote: "Add testimonial quote here. This should highlight growth metrics and success story.",
    rating: 5,
    metric: "+XX%",
    metricLabel: "Revenue Growth",
  },
  {
    id: 2,
    name: "Agency Owner Name",
    role: "Fleet Manager, Agency Name",
    location: "City, State",
    image: "/placeholder.svg",
    quote: "Add testimonial quote here. Focus on fleet utilization improvements.",
    rating: 5,
    metric: "XX%",
    metricLabel: "Fleet Utilization",
  },
  {
    id: 3,
    name: "Agency Owner Name",
    role: "Director, Agency Name",
    location: "City, State",
    image: "/placeholder.svg",
    quote: "Add testimonial quote here. Emphasize customer reach expansion.",
    rating: 5,
    metric: "XXx",
    metricLabel: "More Bookings",
  },
];

const Testimonials = () => {
  return (
    <section className="py-24 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-secondary/20 to-background" />
      <div className="absolute top-1/2 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
      
      <div className="container mx-auto px-4 relative">
        <div className="text-center mb-16">
          <span className="inline-block px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
            Success Stories
          </span>
          <h2 className="font-display text-3xl md:text-5xl font-bold mb-4">
            Trusted by <span className="text-gradient">2,500+</span> Agencies
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            See how independent rental agencies are growing their business with Zuvio
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial) => (
            <Card 
              key={testimonial.id}
              className="group bg-card/50 backdrop-blur-sm border-border/50 hover:border-primary/30 transition-all duration-300"
            >
              <CardContent className="p-8">
                <Quote className="h-10 w-10 text-primary/30 mb-6" />
                
                <p className="text-foreground/80 mb-6 leading-relaxed">
                  "{testimonial.quote}"
                </p>

                <div className="flex items-center gap-1 mb-6">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-primary text-primary" />
                  ))}
                </div>

                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 rounded-full bg-secondary overflow-hidden">
                    <img 
                      src={testimonial.image} 
                      alt={testimonial.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">{testimonial.name}</p>
                    <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                    <p className="text-xs text-muted-foreground">{testimonial.location}</p>
                  </div>
                </div>

                <div className="pt-4 border-t border-border">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-bold text-primary">{testimonial.metric}</span>
                    <span className="text-sm text-muted-foreground">{testimonial.metricLabel}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
