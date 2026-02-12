import { useState } from "react";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import { User, Phone, Calendar, Car, AlertCircle, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const vehicleTypes = ["Compact", "Sedan", "SUV", "Truck", "Van", "Luxury"];

const ReserveRequest = () => {
  const { agencyId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const agencyName = searchParams.get("agency") || "the Agency";

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [pickupDate, setPickupDate] = useState("");
  const [dropoffDate, setDropoffDate] = useState("");
  const [vehicleType, setVehicleType] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    // Simulate submission
    setTimeout(() => {
      navigate(`/reservation-confirmed?agency=${encodeURIComponent(agencyName)}`);
    }, 1000);
  };

  const isValid = name.trim() && phone.trim() && pickupDate && dropoffDate && vehicleType;

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-2xl">
          <div className="text-center mb-8 animate-slide-up">
            <h1 className="font-display text-3xl md:text-4xl font-bold mb-2">Request a Reservation</h1>
            <p className="text-muted-foreground">
              with <span className="text-primary font-semibold">{agencyName}</span>
            </p>
          </div>

          <form onSubmit={handleSubmit} className="glass-card glow-border rounded-2xl p-6 md:p-8 space-y-6 animate-slide-up delay-100">
            {/* Name */}
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wider">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-primary" />
                <input
                  type="text"
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  maxLength={100}
                  className="w-full bg-secondary/50 border border-border rounded-xl pl-11 pr-4 py-3.5 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                />
              </div>
            </div>

            {/* Phone */}
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wider">
                Phone Number
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-primary" />
                <input
                  type="tel"
                  placeholder="(555) 123-4567"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                  maxLength={20}
                  className="w-full bg-secondary/50 border border-border rounded-xl pl-11 pr-4 py-3.5 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                />
              </div>
            </div>

            {/* Dates */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wider">
                  Pickup Date
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-primary" />
                  <input
                    type="date"
                    value={pickupDate}
                    onChange={(e) => setPickupDate(e.target.value)}
                    required
                    className="w-full bg-secondary/50 border border-border rounded-xl pl-11 pr-4 py-3.5 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wider">
                  Drop-off Date
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-accent" />
                  <input
                    type="date"
                    value={dropoffDate}
                    onChange={(e) => setDropoffDate(e.target.value)}
                    required
                    className="w-full bg-secondary/50 border border-border rounded-xl pl-11 pr-4 py-3.5 text-foreground focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Vehicle Type */}
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wider">
                Vehicle Type
              </label>
              <div className="relative">
                <Car className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-primary" />
                <select
                  value={vehicleType}
                  onChange={(e) => setVehicleType(e.target.value)}
                  required
                  className="w-full bg-secondary/50 border border-border rounded-xl pl-11 pr-4 py-3.5 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all appearance-none"
                >
                  <option value="">Select a type...</option>
                  {vehicleTypes.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Cancellation Notice */}
            <div className="flex items-start gap-3 p-4 rounded-xl bg-destructive/5 border border-destructive/20">
              <AlertCircle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
              <p className="text-sm text-muted-foreground">
                <strong className="text-foreground">Cancellation requires contacting the agency directly by phone.</strong>{" "}
                No online cancellations are available. The agency's phone number will be provided in your confirmation.
              </p>
            </div>

            <Button
              type="submit"
              variant="hero"
              size="lg"
              className="w-full group"
              disabled={!isValid || submitting}
            >
              {submitting ? "Sending Request..." : "Submit Reservation Request"}
              <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Button>
          </form>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ReserveRequest;
