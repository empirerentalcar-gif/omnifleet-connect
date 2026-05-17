// TODO: i18n — no matching keys in en.json/es.json for this component yet; strings remain English.
import { Ban, ShieldCheck } from "lucide-react";

const TuroBookingFee = () => (
  <section className="py-20 md:py-28 relative overflow-hidden">
    <div className="absolute inset-0 bg-gradient-to-b from-background via-primary/5 to-background" />
    <div className="container mx-auto px-4 relative max-w-3xl text-center">
      <h2 className="font-display text-3xl md:text-4xl font-bold mb-6">
        Why We Charge a <span className="text-gradient">Small Booking Fee</span>
      </h2>
      <p className="text-lg text-muted-foreground mb-4">
        Zuvio only succeeds when you succeed. We charge a small percentage of confirmed bookings to ensure we are motivated to bring real, qualified reservation opportunities to you.
      </p>
      <p className="text-xl font-bold text-foreground mb-8">
        If you don't grow — <span className="text-accent">we don't grow.</span>
      </p>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-6 text-sm text-muted-foreground mb-4">
        <div className="flex items-center gap-2">
          <Ban className="h-4 w-4 text-accent" />
          No setup fees
        </div>
        <div className="flex items-center gap-2">
          <Ban className="h-4 w-4 text-accent" />
          No long contracts
        </div>
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 text-accent" />
          Cancel anytime
        </div>
      </div>
    </div>
  </section>
);

export default TuroBookingFee;
