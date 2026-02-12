import { Search, Calendar, Key, CheckCircle } from "lucide-react";

const steps = [
  {
    icon: Search,
    number: "01",
    title: "Search & Compare",
    description: "Enter your pickup and drop-off locations. Compare thousands of vehicles from verified agencies in real-time."
  },
  {
    icon: Calendar,
    number: "02",
    title: "Book Instantly",
    description: "Select your dates, choose your vehicle, and book instantly. No waiting, no hassle."
  },
  {
    icon: Key,
    number: "03",
    title: "Pick Up & Drive",
    description: "Show up at your chosen location, pick up your keys, and hit the road. It's that simple."
  },
  {
    icon: CheckCircle,
    number: "04",
    title: "Return & Rate",
    description: "Drop off at your chosen location. Rate your experience to help others find great rentals."
  }
];

const HowItWorks = () => {
  return (
    <section id="how-it-works" className="py-20 md:py-32 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-border to-transparent" />
      <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-border to-transparent" />

      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="font-display text-3xl md:text-5xl font-bold mb-4">
            How It <span className="text-gradient">Works</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto">
            Book your perfect rental in minutes with our streamlined process
          </p>
        </div>

        {/* Steps */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <div key={step.number} className="relative group">
              {/* Connector Line */}
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-10 left-[60%] w-full h-px bg-gradient-to-r from-primary/50 to-transparent" />
              )}

              <div className="glass-card glow-border rounded-2xl p-8 h-full hover:scale-105 transition-transform duration-300">
                {/* Number Badge */}
                <div className="absolute -top-4 -left-4 w-10 h-10 rounded-xl bg-gradient-primary flex items-center justify-center font-display font-bold text-sm text-primary-foreground shadow-glow">
                  {step.number}
                </div>

                {/* Icon */}
                <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-6 group-hover:bg-primary/20 transition-colors">
                  <step.icon className="h-8 w-8 text-primary" />
                </div>

                {/* Content */}
                <h3 className="font-display text-xl font-bold mb-3">{step.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{step.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
