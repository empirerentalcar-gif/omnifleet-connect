import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { MapPin, Phone, Calendar, Car, Filter, ArrowRight, Banknote, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";

const vehicleTypes = ["All", "Sedan", "SUV", "Truck", "Van", "Compact", "Luxury"];

interface Agency {
  id: string;
  name: string;
  cashAccepted: boolean;
  startingPrice: number;
  city: string;
  state: string;
  phone: string;
  vehicleTypes: string[];
  image: string | null;
}

const SearchResults = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [location, setLocation] = useState(searchParams.get("location") || "");
  const [pickupDate, setPickupDate] = useState(searchParams.get("pickup") || "");
  const [dropoffDate, setDropoffDate] = useState(searchParams.get("dropoff") || "");
  const [cashOnly, setCashOnly] = useState(false);
  const [vehicleType, setVehicleType] = useState("All");
  const [agencies, setAgencies] = useState<Agency[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAgencies();
  }, []);

  const fetchAgencies = async () => {
    setLoading(true);
    try {
      const { data: vehicles, error } = await supabase
        .from("available_vehicles_public")
        .select("*");

      if (error) throw error;

      if (!vehicles || vehicles.length === 0) {
        setAgencies([]);
        setLoading(false);
        return;
      }

      // Group vehicles by profile_id to build agency listings
      const agencyMap = new Map<string, Agency>();

      for (const v of vehicles) {
        if (!v.profile_id) continue;
        const existing = agencyMap.get(v.profile_id);
        if (existing) {
          if (v.daily_rate && v.daily_rate < existing.startingPrice) {
            existing.startingPrice = v.daily_rate;
          }
          if (v.vehicle_type && !existing.vehicleTypes.includes(v.vehicle_type)) {
            existing.vehicleTypes.push(v.vehicle_type);
          }
          if (!existing.image && v.images && v.images.length > 0) {
            existing.image = v.images[0];
          }
        } else {
          agencyMap.set(v.profile_id, {
            id: v.profile_id,
            name: (v as any).business_name || "Local Agency",
            cashAccepted: (v as any).cash_accepted || false,
            startingPrice: v.daily_rate || 0,
            city: v.location_city || "",
            state: v.location_state || "",
            phone: (v as any).contact_phone || "",
            vehicleTypes: v.vehicle_type ? [v.vehicle_type] : [],
            image: v.images && v.images.length > 0 ? v.images[0] : null,
          });
        }
      }

      setAgencies(Array.from(agencyMap.values()));
    } catch (err) {
      console.error("Error fetching agencies:", err);
      setAgencies([]);
    } finally {
      setLoading(false);
    }
  };

  const filtered = agencies.filter((a) => {
    if (cashOnly && !a.cashAccepted) return false;
    if (vehicleType !== "All" && !a.vehicleTypes.includes(vehicleType)) return false;
    if (location.trim()) {
      const loc = location.toLowerCase();
      if (!a.city.toLowerCase().includes(loc) && !a.state.toLowerCase().includes(loc)) return false;
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          {/* Search Bar */}
          <div className="glass-card glow-border rounded-2xl p-6 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wider">
                  City / ZIP Code
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-primary" />
                  <input
                    type="text"
                    placeholder="Enter city or ZIP..."
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full bg-secondary/50 border border-border rounded-xl pl-11 pr-4 py-3.5 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                  />
                </div>
              </div>
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
                    className="w-full bg-secondary/50 border border-border rounded-xl pl-11 pr-4 py-3.5 text-foreground focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent transition-all"
                  />
                </div>
              </div>
              <Button variant="hero" size="lg" className="w-full group" onClick={fetchAgencies}>
                <Car className="h-5 w-5" />
                <span>View Available Agencies</span>
                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>

            {/* Filters */}
            <div className="mt-6 pt-6 border-t border-border/50 flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground font-medium">Filters:</span>
              </div>

              <button
                onClick={() => setCashOnly(!cashOnly)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                  cashOnly
                    ? "bg-accent/20 text-accent border border-accent/40"
                    : "bg-secondary/50 text-muted-foreground border border-border hover:border-accent/40"
                }`}
              >
                <Banknote className="h-4 w-4" />
                Cash Accepted
              </button>

              <div className="flex items-center gap-2 flex-wrap">
                {vehicleTypes.map((type) => (
                  <button
                    key={type}
                    onClick={() => setVehicleType(type)}
                    className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                      vehicleType === type
                        ? "bg-primary/20 text-primary border border-primary/40"
                        : "bg-secondary/50 text-muted-foreground border border-border hover:border-primary/40"
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Results */}
          {loading ? (
            <div className="text-center py-16">
              <Loader2 className="h-10 w-10 text-primary animate-spin mx-auto mb-4" />
              <p className="text-muted-foreground">Searching agencies...</p>
            </div>
          ) : (
            <>
              <div className="mb-6">
                <h2 className="font-display text-2xl font-bold">
                  {filtered.length} {filtered.length === 1 ? "Agency" : "Agencies"} Found
                </h2>
                <p className="text-muted-foreground text-sm mt-1">
                  {location ? `Near ${location}` : "Showing all locations"}
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {filtered.map((agency) => (
                  <div
                    key={agency.id}
                    className="glass-card glow-border rounded-2xl overflow-hidden group hover:shadow-glow transition-all duration-300"
                  >
                    <div className="flex flex-col sm:flex-row">
                      <div className="sm:w-48 h-48 sm:h-auto overflow-hidden bg-secondary">
                        {agency.image ? (
                          <img
                            src={agency.image}
                            alt={agency.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Car className="h-12 w-12 text-muted-foreground/30" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 p-6">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h3 className="font-display text-lg font-bold">{agency.name}</h3>
                            <p className="text-sm text-muted-foreground flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {agency.city || "Location TBD"}{agency.state ? `, ${agency.state}` : ""}
                            </p>
                          </div>
                          {agency.cashAccepted && (
                            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-accent/15 text-accent text-xs font-semibold border border-accent/30">
                              <Banknote className="h-3 w-3" />
                              Cash OK
                            </span>
                          )}
                        </div>

                        <div className="flex items-baseline gap-1 mb-4">
                          <span className="text-sm text-muted-foreground">From</span>
                          <span className="font-display text-2xl font-bold text-primary">
                            ${agency.startingPrice}
                          </span>
                          <span className="text-sm text-muted-foreground">/day</span>
                        </div>

                        <div className="flex flex-wrap gap-2 mb-4">
                          {agency.vehicleTypes.map((vt) => (
                            <span key={vt} className="px-2 py-1 rounded-lg bg-secondary text-xs text-muted-foreground">
                              {vt}
                            </span>
                          ))}
                        </div>

                        <div className="flex gap-3">
                          <Button
                            variant="hero"
                            size="sm"
                            className="flex-1"
                            onClick={() => navigate(`/agency/${agency.id}`)}
                          >
                            Request Reservation
                          </Button>
                          {agency.phone && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="border-accent/30 hover:bg-accent/10"
                              onClick={() => window.open(`tel:${agency.phone.replace(/\D/g, "")}`, "_self")}
                            >
                              <Phone className="h-4 w-4" />
                              Call Now
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {filtered.length === 0 && (
                <div className="text-center py-16">
                  <Car className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
                  <h3 className="font-display text-xl font-bold mb-2">No agencies match your filters</h3>
                  <p className="text-muted-foreground">Try adjusting your filters or search a different location.</p>
                </div>
              )}
            </>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default SearchResults;
