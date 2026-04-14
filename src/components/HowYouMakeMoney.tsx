import { PhoneCall, MapPin, Users, Banknote, ShieldCheck } from "lucide-react";

const bullets = [
  { icon: PhoneCall, text: "Receive direct reservation requests" },
  { icon: MapPin, text: "Get discovered in your city" },
  { icon: Users, text: "Build repeat customers" },
  { icon: Banknote, text: "Accept cash or your preferred payment method" },
  { icon: ShieldCheck, text: "Keep full control of pricing and policies" },
];

const HowYouMakeMoney = () => {
  return (
    <section className="py-20 md:py-28 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-accent/5 to-primary/10" />
      <div className="absolute top-1/3 left-1/3 w-[500px] h-[500px] bg-primary/8 rounded-full blur-3xl" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-14">
            <span className="inline-block px-4 py-2 rounded-full bg-accent/10 text-accent text-sm font-medium mb-4">
              Revenue Engine
            </span>
            <h2 className="font-display text-3xl md:text-5xl font-bold mb-4">
              Get More Visibility for Your Car Rental Business —{" "}
              <span className="text-gradient">Locally & Nationwide</span>
            </h2>
          </div>

          <div className="space-y-5 mb-10">
            {bullets.map((item) => (
              <div
                key={item.text}
                className="flex gap-4 items-center glass-card rounded-xl p-5 hover:scale-[1.02] transition-transform"
              >
                <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center shrink-0">
                  <item.icon className="h-6 w-6 text-accent" />
                </div>
                <p className="font-display text-lg font-semibold">{item.text}</p>
              </div>
            ))}
          </div>

          <p className="text-center text-xl md:text-2xl font-display font-bold text-foreground">
            This is <span className="text-gradient">YOUR</span> business — not ours.
          </p>
        </div>
      </div>
    </section>
  );
};

export default HowYouMakeMoney;
