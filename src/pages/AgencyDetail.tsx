import { useParams, useNavigate } from "react-router-dom";
import { MapPin, Phone, Car, Banknote, Star, Shield, Clock, AlertCircle, User, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const agencyData: Record<string, {
  name: string; city: string; state: string; phone: string; rating: number; reviews: number;
  cashAccepted: boolean; startingPrice: number; story: string;
  photos: string[]; vehicleCategories: { name: string; from: number }[];
  requirements: string[]; deposit: string; cancellation: string;
}> = {
  "agency-1": {
    name: "Metro Auto Rentals",
    city: "Miami", state: "FL", phone: "(305) 555-0123",
    rating: 4.8, reviews: 124, cashAccepted: true, startingPrice: 35,
    story: "Founded in 2010 by Carlos & Maria, Metro Auto Rentals started with just 3 vehicles and a dream to provide honest, affordable car rentals to the Miami community. Today we serve hundreds of customers monthly while keeping our family values.",
    photos: [
      "https://images.unsplash.com/photo-1549317661-bd32c8ce0afe?w=800&h=500&fit=crop",
      "https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=800&h=500&fit=crop",
      "https://images.unsplash.com/photo-1502877338535-766e1452684a?w=800&h=500&fit=crop",
    ],
    vehicleCategories: [
      { name: "Compact", from: 35 }, { name: "Sedan", from: 45 },
      { name: "SUV", from: 65 }, { name: "Van", from: 75 },
    ],
    requirements: [
      "Valid driver's license (21+ years old)",
      "Proof of insurance or purchase our coverage",
      "Major credit/debit card or cash deposit",
      "Utility bill or proof of local address",
    ],
    deposit: "$200 cash or card hold. Refunded upon vehicle return in good condition.",
    cancellation: "All cancellations must be made by calling the agency directly. No online cancellations.",
  },
};

const fallback = agencyData["agency-1"];

const AgencyDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const agency = agencyData[id || ""] || { ...fallback, name: "Rental Agency" };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          {/* Photo Gallery */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="md:col-span-2 rounded-2xl overflow-hidden h-64 md:h-80">
              <img src={agency.photos[0]} alt={agency.name} className="w-full h-full object-cover" />
            </div>
            <div className="grid grid-rows-2 gap-4">
              {agency.photos.slice(1, 3).map((p, i) => (
                <div key={i} className="rounded-2xl overflow-hidden">
                  <img src={p} alt="" className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left — Details */}
            <div className="lg:col-span-2 space-y-8">
              {/* Header */}
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="font-display text-3xl md:text-4xl font-bold">{agency.name}</h1>
                  {agency.cashAccepted && (
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-accent/15 text-accent text-sm font-semibold border border-accent/30">
                      <Banknote className="h-4 w-4" /> Cash Accepted
                    </span>
                  )}
                </div>
                <p className="text-muted-foreground flex items-center gap-2">
                  <MapPin className="h-4 w-4" /> {agency.city}, {agency.state}
                  <span className="mx-2">·</span>
                  <Star className="h-4 w-4 text-yellow-400 fill-current" /> {agency.rating} ({agency.reviews} reviews)
                </p>
              </div>

              {/* Vehicle Categories */}
              <section className="glass-card rounded-2xl p-6">
                <h2 className="font-display text-xl font-bold mb-4 flex items-center gap-2">
                  <Car className="h-5 w-5 text-primary" /> Vehicle Categories
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {agency.vehicleCategories.map((cat) => (
                    <div key={cat.name} className="bg-secondary/50 rounded-xl p-4 text-center border border-border">
                      <p className="font-semibold">{cat.name}</p>
                      <p className="text-primary font-display text-lg font-bold">${cat.from}<span className="text-xs text-muted-foreground">/day</span></p>
                    </div>
                  ))}
                </div>
              </section>

              {/* Requirements */}
              <section className="glass-card rounded-2xl p-6">
                <h2 className="font-display text-xl font-bold mb-4 flex items-center gap-2">
                  <Shield className="h-5 w-5 text-primary" /> Requirements
                </h2>
                <ul className="space-y-3">
                  {agency.requirements.map((req, i) => (
                    <li key={i} className="flex items-start gap-3 text-muted-foreground">
                      <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                      {req}
                    </li>
                  ))}
                </ul>
              </section>

              {/* Deposit */}
              <section className="glass-card rounded-2xl p-6">
                <h2 className="font-display text-xl font-bold mb-3 flex items-center gap-2">
                  <Banknote className="h-5 w-5 text-accent" /> Deposit Info
                </h2>
                <p className="text-muted-foreground">{agency.deposit}</p>
              </section>

              {/* Cancellation */}
              <section className="glass-card rounded-2xl p-6 border border-destructive/20">
                <h2 className="font-display text-xl font-bold mb-3 flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-destructive" /> Cancellation Policy
                </h2>
                <p className="text-muted-foreground">{agency.cancellation}</p>
                <p className="mt-3 text-sm text-destructive/80 flex items-center gap-2">
                  <Phone className="h-4 w-4" /> Call only — no online cancellations
                </p>
              </section>

              {/* Owner Story */}
              <section className="glass-card rounded-2xl p-6">
                <h2 className="font-display text-xl font-bold mb-3 flex items-center gap-2">
                  <User className="h-5 w-5 text-primary" /> Our Story
                </h2>
                <p className="text-muted-foreground italic">"{agency.story}"</p>
              </section>
            </div>

            {/* Right — Sticky CTA Card */}
            <div className="lg:col-span-1">
              <div className="glass-card glow-border rounded-2xl p-6 sticky top-28 space-y-4">
                <div className="text-center mb-4">
                  <p className="text-sm text-muted-foreground">Starting from</p>
                  <p className="font-display text-4xl font-bold text-primary">${agency.startingPrice}<span className="text-lg text-muted-foreground">/day</span></p>
                </div>

                <Button
                  variant="hero"
                  size="lg"
                  className="w-full group"
                  onClick={() => navigate(`/reserve/${id}?agency=${encodeURIComponent(agency.name)}`)}
                >
                  Request Reservation
                  <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Button>

                <Button
                  variant="outline"
                  size="lg"
                  className="w-full border-accent/30 hover:bg-accent/10"
                  onClick={() => window.open(`tel:${agency.phone.replace(/\D/g, "")}`, "_self")}
                >
                  <Phone className="h-5 w-5" />
                  Call Agency Now
                </Button>

                <div className="pt-4 border-t border-border/50 space-y-2 text-sm text-muted-foreground">
                  <p className="flex items-center gap-2"><Clock className="h-4 w-4 text-primary" /> Responds within 1 hour</p>
                  <p className="flex items-center gap-2"><Shield className="h-4 w-4 text-accent" /> Verified ZUVIO partner</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default AgencyDetail;
