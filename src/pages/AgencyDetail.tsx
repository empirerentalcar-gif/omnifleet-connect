import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { MapPin, Car, Banknote, Shield, Clock, AlertCircle, User, ArrowRight, Loader2, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";
import SEO from "@/components/SEO";

interface AgencyData {
  name: string;
  city: string;
  state: string;
  cashAccepted: boolean;
  startingPrice: number;
  story: string;
  photos: string[];
  vehicleCategories: { name: string; from: number }[];
  requirements: string[];
  deposit: string;
  cancellation: string;
}

const AgencyDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [agency, setAgency] = useState<AgencyData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAgency();
  }, [id]);

  const fetchAgency = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const { data: vehicles, error } = await supabase
        .from("available_vehicles_public")
        .select("*")
        .eq("profile_id", id);

      if (error) throw error;

      if (!vehicles || vehicles.length === 0) {
        setAgency(null);
        setLoading(false);
        return;
      }

      const vehicleCats = new Map<string, number>();
      const vehiclePhotos: string[] = [];
      let minPrice = Infinity;
      let city = "";
      let state = "";

      // Pull agency info from first vehicle row (all share same profile)
      const first = vehicles[0] as any;
      const agencyName = first.business_name || "Local Rental Agency";
      const cashAccepted = first.cash_accepted || false;
      const ownerStory = first.owner_story || "We're a local, independent rental agency committed to providing reliable vehicles and honest service to our community.";
      const depositInfo = first.deposit_info || "$200 cash or card hold. Refunded upon vehicle return in good condition.";
      const cancellationPolicy = first.cancellation_policy || "All cancellations must be made by calling the agency directly. No online cancellations.";
      const requirements = first.requirements || [
        "Valid driver's license (21+ years old)",
        "Proof of insurance or purchase our coverage",
        "Major credit/debit card or cash deposit",
        "Utility bill or proof of local address",
      ];
      const agencyPhotos: string[] = first.agency_photos || [];

      for (const v of vehicles) {
        if (v.vehicle_type) {
          const existing = vehicleCats.get(v.vehicle_type);
          if (!existing || (v.daily_rate && v.daily_rate < existing)) {
            vehicleCats.set(v.vehicle_type, v.daily_rate || 0);
          }
        }
        if (v.daily_rate && v.daily_rate < minPrice) minPrice = v.daily_rate;
        if (v.images) vehiclePhotos.push(...v.images);
        if (v.location_city) city = v.location_city;
        if (v.location_state) state = v.location_state;
      }

      const allPhotos = [...agencyPhotos, ...vehiclePhotos];

      setAgency({
        name: agencyName,
        city,
        state,
        cashAccepted,
        startingPrice: minPrice === Infinity ? 0 : minPrice,
        story: ownerStory,
        photos: allPhotos.length > 0 ? allPhotos.slice(0, 3) : [
          "https://images.unsplash.com/photo-1549317661-bd32c8ce0afe?w=800&h=500&fit=crop",
        ],
        vehicleCategories: Array.from(vehicleCats.entries()).map(([name, from]) => ({ name, from })),
        requirements: Array.isArray(requirements) ? requirements : [requirements],
        deposit: depositInfo,
        cancellation: cancellationPolicy,
      });
    } catch (err) {
      console.error("Error fetching agency:", err);
      setAgency(null);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="pt-24 pb-16 flex items-center justify-center">
          <Loader2 className="h-10 w-10 text-primary animate-spin" />
        </main>
        <Footer />
      </div>
    );
  }

  if (!agency) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="pt-24 pb-16 text-center">
          <Car className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
          <h2 className="font-display text-2xl font-bold mb-2">Agency Not Found</h2>
          <p className="text-muted-foreground mb-6">This agency doesn't have any available vehicles right now.</p>
          <Button variant="hero" onClick={() => navigate("/search")}>Back to Search</Button>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <SEO
        title={`${agency.name} | Car Rental on ZUVIO`}
        description={`Rent cars from ${agency.name} in ${agency.city || "your area"}${agency.state ? `, ${agency.state}` : ""}. Starting at $${agency.startingPrice}/day.${agency.cashAccepted ? " Cash accepted." : ""}`}
        path={`/agency/${id}`}
      />

      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          {/* Photo Gallery */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="md:col-span-2 rounded-2xl overflow-hidden h-64 md:h-80">
              <img src={agency.photos[0]} alt={agency.name} className="w-full h-full object-cover" />
            </div>
            {agency.photos.length > 1 && (
              <div className="grid grid-rows-2 gap-4">
                {agency.photos.slice(1, 3).map((p, i) => (
                  <div key={i} className="rounded-2xl overflow-hidden">
                    <img src={p} alt="" className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left — Details */}
            <div className="lg:col-span-2 space-y-8">
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
                  <MapPin className="h-4 w-4" /> {agency.city || "Location TBD"}{agency.state ? `, ${agency.state}` : ""}
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
