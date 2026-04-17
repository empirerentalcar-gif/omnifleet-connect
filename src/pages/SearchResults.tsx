import { useState, useEffect } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { MapPin, Calendar, Car, Search, Banknote } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import SEO from "@/components/SEO";
import { supabase } from "@/integrations/supabase/client";
import CitySelector from "@/components/CitySelector";

const vehicleTypes = ["All", "Sedan", "SUV", "Truck", "Van", "Compact", "Luxury"];

interface Agency {
  id: string;
  name: string;
  cashAccepted: boolean;
  startingPrice: number;
  city: string;
  state: string;
  vehicleTypes: string[];
  image: string | null;
}

const SearchResults = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [location, setLocation] = useState(searchParams.get("location") || "");
  const [pickupDate, setPickupDate] = useState(searchParams.get("pickup") || "");
  const [dropoffDate, setDropoffDate] = useState(searchParams.get("dropoff") || "");
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

      if (error) {
        console.error("[SearchResults] Supabase error fetching vehicles:", error.message, error);
        throw error;
      }

      if (!vehicles || vehicles.length === 0) {
        console.error("[SearchResults] No vehicles returned from available_vehicles_public. Vehicles count:", vehicles?.length ?? 0);
        setAgencies([]);
        setLoading(false);
        return;
      }

      const agencyMap = new Map<string, Agency>();

      for (const v of vehicles) {
        if (!v.profile_id) continue;
        const name = (v as any).business_name || "Local Agency";
        // Hide admin/test agencies
        if (name.toLowerCase() === "admin" || name.toLowerCase() === "test") continue;

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
            name,
            cashAccepted: (v as any).cash_accepted || false,
            startingPrice: v.daily_rate || 0,
            city: v.location_city || "",
            state: v.location_state || "",
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
    if (vehicleType !== "All" && !a.vehicleTypes.includes(vehicleType)) return false;
    if (location.trim()) {
      const loc = location.toLowerCase();
      if (!a.city.toLowerCase().includes(loc) && !a.state.toLowerCase().includes(loc)) return false;
    }
    return true;
  });

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#0d1b2e" }}>
      <SEO
        title="Search Car Rentals | ZUVIO"
        description="Search independent car rental agencies near you. Filter by location, vehicle type, and cash-friendly options."
        path="/search"
      />

      {/* Hero Section */}
      <section className="pt-10 pb-10 border-b-2 border-[#2dd4bf]/40" style={{ backgroundColor: "#0d1b2e" }}>
        <div className="container mx-auto px-4">
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">Search Car Rentals</h1>
            <p className="text-white/50 text-base">Independent agencies • Cash-friendly options</p>
          </div>

          {/* Search Bar */}
          <div className="max-w-4xl mx-auto rounded-2xl p-1" style={{ backgroundColor: "#1a2d45", border: "1px solid rgba(45,212,191,0.3)" }}>
            <div className="flex flex-col md:flex-row items-stretch">
              <div className="flex-1 p-4 border-b md:border-b-0 md:border-r border-white/10">
                <label className="block text-[10px] uppercase tracking-widest text-white/40 mb-1 font-medium">City / Zip</label>
                <CitySelector
                  value={location}
                  onChange={setLocation}
                  placeholder="Select a city"
                />
              </div>
              <div className="flex-1 p-4 border-b md:border-b-0 md:border-r border-white/10">
                <label className="block text-[10px] uppercase tracking-widest text-white/40 mb-1 font-medium">Pickup Date</label>
                <input
                  type="date"
                  value={pickupDate}
                  onChange={(e) => setPickupDate(e.target.value)}
                  className="w-full bg-transparent text-white border-none outline-none text-sm py-2"
                />
              </div>
              <div className="flex-1 p-4 border-b md:border-b-0 md:border-r border-white/10">
                <label className="block text-[10px] uppercase tracking-widest text-white/40 mb-1 font-medium">Drop-off Date</label>
                <input
                  type="date"
                  value={dropoffDate}
                  onChange={(e) => setDropoffDate(e.target.value)}
                  className="w-full bg-transparent text-white border-none outline-none text-sm py-2"
                />
              </div>
              <div className="p-3 flex items-center">
                <button
                  onClick={fetchAgencies}
                  className="w-full md:w-auto px-8 py-3 rounded-xl font-bold text-sm transition-colors"
                  style={{ backgroundColor: "#2dd4bf", color: "#0d1b2e" }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#5eead4")}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#2dd4bf")}
                >
                  <span className="flex items-center gap-2 justify-center">
                    <Search className="h-4 w-4" />
                    Search
                  </span>
                </button>
              </div>
            </div>
          </div>

          {/* Filter Pills */}
          <div className="max-w-4xl mx-auto mt-6 flex flex-wrap gap-2 justify-center">
            {vehicleTypes.map((type) => (
              <button
                key={type}
                onClick={() => setVehicleType(type)}
                className="px-4 py-2 rounded-full text-sm font-medium transition-all"
                style={
                  vehicleType === type
                    ? { backgroundColor: "#2dd4bf", color: "#0d1b2e" }
                    : { backgroundColor: "transparent", color: "rgba(255,255,255,0.6)", border: "1px solid rgba(255,255,255,0.2)" }
                }
                onMouseEnter={(e) => {
                  if (vehicleType !== type) e.currentTarget.style.borderColor = "rgba(45,212,191,0.5)";
                }}
                onMouseLeave={(e) => {
                  if (vehicleType !== type) e.currentTarget.style.borderColor = "rgba(255,255,255,0.2)";
                }}
              >
                {type}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Results Section */}
      <section className="py-10" style={{ backgroundColor: "#0d1b2e" }}>
        <div className="container mx-auto px-4">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="rounded-xl p-6 space-y-4" style={{ backgroundColor: "#132640", border: "1px solid rgba(255,255,255,0.08)" }}>
                  <Skeleton className="h-5 w-40 bg-white/10" />
                  <Skeleton className="h-3 w-28 bg-white/10" />
                  <Skeleton className="h-8 w-24 bg-white/10" />
                  <div className="flex gap-2">
                    <Skeleton className="h-6 w-16 rounded-lg bg-white/10" />
                    <Skeleton className="h-6 w-16 rounded-lg bg-white/10" />
                  </div>
                  <Skeleton className="h-10 w-full rounded-xl bg-white/10" />
                </div>
              ))}
            </div>
          ) : (
            <>
              <p className="text-white/40 text-sm mb-6">
                {filtered.length} {filtered.length === 1 ? "agency" : "agencies"} found{location ? ` near ${location}` : ""}.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filtered.map((agency) => (
                  <div
                    key={agency.id}
                    className="rounded-xl p-6 transition-all duration-200 hover:border-[#2dd4bf]/30"
                    style={{ backgroundColor: "#132640", border: "1px solid rgba(255,255,255,0.08)" }}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <Link
                          to={`/agency/${agency.id}`}
                          className="text-lg font-bold text-white hover:text-[#2dd4bf] transition-colors"
                        >
                          {agency.name}
                        </Link>
                        <p className="text-white/40 text-sm flex items-center gap-1 mt-1">
                          <MapPin className="h-3 w-3" />
                          {agency.city || "Location TBD"}{agency.state ? `, ${agency.state}` : ""}
                        </p>
                      </div>
                      {agency.cashAccepted && (
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-semibold"
                          style={{ backgroundColor: "rgba(45,212,191,0.15)", color: "#2dd4bf", border: "1px solid rgba(45,212,191,0.3)" }}>
                          <Banknote className="h-3 w-3" />
                          Cash
                        </span>
                      )}
                    </div>

                    <div className="flex items-baseline gap-1 mb-4">
                      <span className="text-white/40 text-sm">From</span>
                      <span className="text-2xl font-bold" style={{ color: "#2dd4bf" }}>${agency.startingPrice}</span>
                      <span className="text-white/40 text-sm">/day</span>
                    </div>

                    <div className="flex flex-wrap gap-1.5 mb-5">
                      {agency.vehicleTypes.map((vt) => (
                        <span key={vt} className="px-2 py-0.5 rounded text-[11px] text-white/50"
                          style={{ backgroundColor: "rgba(255,255,255,0.06)" }}>
                          {vt}
                        </span>
                      ))}
                    </div>

                    <button
                      onClick={() => navigate(`/agency/${agency.id}`)}
                      className="w-full py-2.5 rounded-lg font-bold text-sm transition-colors"
                      style={{ backgroundColor: "#2dd4bf", color: "#0d1b2e" }}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#5eead4")}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#2dd4bf")}
                    >
                      Request Reservation
                    </button>
                  </div>
                ))}
              </div>

              {filtered.length === 0 && (
                <div className="text-center py-16">
                  <Car className="h-16 w-16 mx-auto mb-4" style={{ color: "rgba(255,255,255,0.15)" }} />
                  <p className="text-xl font-bold text-white mb-2">No agencies match your filters</p>
                  <p className="text-white/40">Try adjusting your filters or search a different location.</p>
                </div>
              )}
            </>
          )}
        </div>
      </section>
    </div>
  );
};

export default SearchResults;
