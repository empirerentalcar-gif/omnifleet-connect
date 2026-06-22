import { useState, useEffect, useRef } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { MapPin, Car, Search, Banknote } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import SEO from "@/components/SEO";
import { supabase } from "@/integrations/supabase/client";
import CitySelector from "@/components/CitySelector";
import { logVehicleFetchFailure, logVehicleFetchEmpty } from "@/lib/telemetry";
import { SafeImage } from "@/components/SafeImage";
import { useTranslation } from "react-i18next";

const vehicleTypes = ["All", "Sedan", "SUV", "Truck", "Van", "Compact", "Luxury"];

interface VehicleCard {
  id: string;
  profileId: string;
  agencyName: string;
  cashAccepted: boolean;
  dailyRate: number;
  make: string;
  model: string;
  year: number;
  vehicleType: string;
  city: string;
  state: string;
  image: string | null;
}

const SearchResults = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [location, setLocation] = useState(searchParams.get("location") || "");
  const [pickupDate, setPickupDate] = useState(searchParams.get("pickup") || "");
  const [dropoffDate, setDropoffDate] = useState(searchParams.get("dropoff") || "");
  const [vehicleType, setVehicleType] = useState("All");
  const [vehicles, setVehicles] = useState<VehicleCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [rentedIds, setRentedIds] = useState<Set<string>>(new Set());
  const isMountedRef = useRef(true);
  const latestRequestRef = useRef(0);

  useEffect(() => {
    isMountedRef.current = true;
    fetchAgencies();
    fetchRented();

    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const fetchRented = async () => {
    const { data, error } = await supabase.rpc("get_rented_vehicle_ids");
    if (error || !isMountedRef.current) return;
    const ids = new Set<string>((data ?? []).map((r: any) => r.vehicle_id).filter(Boolean));
    setRentedIds(ids);
  };

  const fetchAgencies = async () => {
    const requestId = ++latestRequestRef.current;

    if (isMountedRef.current) {
      setLoading(true);
    }

    try {
      const { data: rows, error } = await supabase
        .from("available_vehicles_public")
        .select("*");

      if (error) {
        logVehicleFetchFailure("search_results", error.message, { code: (error as any).code });
        throw error;
      }

      if (!rows || rows.length === 0) {
        logVehicleFetchEmpty("search_results", { count: rows?.length ?? 0 });
        if (isMountedRef.current && requestId === latestRequestRef.current) {
          setVehicles([]);
          setLoading(false);
        }
        return;
      }

      const list: VehicleCard[] = [];
      for (const v of rows as any[]) {
        if (!v.profile_id) continue;
        const name = v.business_name || "Local Agency";
        if (name.toLowerCase() === "admin" || name.toLowerCase() === "test") continue;
        list.push({
          id: v.id,
          profileId: v.profile_id,
          agencyName: name,
          cashAccepted: !!v.cash_accepted,
          dailyRate: Number(v.daily_rate) || 0,
          make: v.make,
          model: v.model,
          year: v.year,
          vehicleType: v.vehicle_type || "",
          city: v.location_city || "",
          state: v.location_state || "",
          image: Array.isArray(v.images) && v.images.length > 0 ? v.images[0] : null,
        });
      }

      if (isMountedRef.current && requestId === latestRequestRef.current) {
        setVehicles(list);
      }
    } catch (err) {
      logVehicleFetchFailure("search_results", err instanceof Error ? err.message : String(err));
      if (isMountedRef.current && requestId === latestRequestRef.current) {
        setVehicles([]);
      }
    } finally {
      if (isMountedRef.current && requestId === latestRequestRef.current) {
        setLoading(false);
      }
    }
  };

  const filtered = vehicles.filter((v) => {
    if (vehicleType !== "All" && v.vehicleType !== vehicleType) return false;
    if (location.trim()) {
      const loc = location.toLowerCase();
      if (!v.city.toLowerCase().includes(loc) && !v.state.toLowerCase().includes(loc)) return false;
    }
    return true;
  });

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#0d1b2e" }}>
      <SEO
        title={t("search.seoTitle")}
        description={t("search.seoDescription")}
        path="/search"
      />

      {/* Hero Section */}
      <section className="pt-10 pb-10 border-b-2 border-[#2dd4bf]/40" style={{ backgroundColor: "#0d1b2e" }}>
        <div className="container mx-auto px-4">
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">{t("search.heading")}</h1>
            <p className="text-white/50 text-base">{t("search.subtitle")}</p>
          </div>

          {/* Search Bar */}
          <div className="max-w-4xl mx-auto rounded-2xl p-1" style={{ backgroundColor: "#1a2d45", border: "1px solid rgba(45,212,191,0.3)" }}>
            <div className="flex flex-col md:flex-row items-stretch">
              <div className="flex-1 p-4 border-b md:border-b-0 md:border-r border-white/10">
                <label className="block text-[10px] uppercase tracking-widest text-white/40 mb-1 font-medium">{t("search.cityLabel")}</label>
                <CitySelector
                  value={location}
                  onChange={setLocation}
                  placeholder={t("search.cityPlaceholder")}
                />
              </div>
              <div className="flex-1 p-4 border-b md:border-b-0 md:border-r border-white/10">
                <label className="block text-[10px] uppercase tracking-widest text-white/40 mb-1 font-medium">{t("search.pickupLabel")}</label>
                <input
                  type="date"
                  value={pickupDate}
                  onChange={(e) => setPickupDate(e.target.value)}
                  className="w-full bg-transparent text-white border-none outline-none text-sm py-2"
                />
              </div>
              <div className="flex-1 p-4 border-b md:border-b-0 md:border-r border-white/10">
                <label className="block text-[10px] uppercase tracking-widest text-white/40 mb-1 font-medium">{t("search.dropoffLabel")}</label>
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
                    {t("search.searchBtn")}
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
                {t(`search.type.${type}`, { defaultValue: type })}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Results Section */}
      <section className="py-10" style={{ backgroundColor: "#0d1b2e" }}>
        <div className="container mx-auto px-4">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" style={{ display: "grid" }}>
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
              <p className="text-white/40 text-sm mb-6">{t("search.resultsCount", { count: filtered.length, near: location ? t("search.near", { location }) : "" })}</p>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" style={{ display: "grid" }}>
                {filtered.map((v) => {
                  const label = `${v.year} ${v.make} ${v.model}`;
                  return (
                    <div
                      key={v.id}
                      className="rounded-xl overflow-hidden transition-all duration-200 hover:border-[#2dd4bf]/30 flex flex-col"
                      style={{ backgroundColor: "#132640", border: "1px solid rgba(255,255,255,0.08)" }}
                    >
                      <Link to={`/vehicles/${v.id}`} className="block aspect-video relative" style={{ backgroundColor: "#0d1b2e" }}>
                        <SafeImage src={v.image ?? ""} alt={label} className="w-full h-full object-cover" />
                        {rentedIds.has(v.id) && (
                          <div
                            aria-label="Currently rented"
                            className="absolute inset-0 flex items-center justify-center pointer-events-none"
                            style={{ backgroundColor: "rgba(13,27,46,0.45)" }}
                          >
                            <span
                              className="px-4 py-1.5 rounded-md text-sm font-extrabold tracking-widest"
                              style={{
                                backgroundColor: "rgba(13,27,46,0.85)",
                                color: "#fbbf24",
                                border: "1px solid rgba(251,191,36,0.6)",
                                letterSpacing: "0.2em",
                              }}
                            >
                              RENTED
                            </span>
                          </div>
                        )}
                      </Link>
                      <div className="p-5 flex flex-col flex-1">
                        <div className="flex items-start justify-between mb-2 gap-2">
                          <Link to={`/vehicles/${v.id}`} className="text-lg font-bold text-white hover:text-[#2dd4bf] transition-colors leading-tight">
                            {label}
                          </Link>
                          {v.cashAccepted && (
                            <span className="shrink-0 inline-flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-semibold"
                              style={{ backgroundColor: "rgba(45,212,191,0.15)", color: "#2dd4bf", border: "1px solid rgba(45,212,191,0.3)" }}>
                              <Banknote className="h-3 w-3" /> {t("common.cash")}
                            </span>
                          )}
                        </div>
                        <Link to={`/agency/${v.profileId}`} className="text-white/50 text-xs hover:text-[#2dd4bf] mb-1">
                          {v.agencyName}
                        </Link>
                        <p className="text-white/40 text-xs flex items-center gap-1 mb-3">
                          <MapPin className="h-3 w-3" />
                          {v.city || t("search.locationTBD")}{v.state ? `, ${v.state}` : ""}
                          {v.vehicleType && <span className="ml-2 px-1.5 py-0.5 rounded text-[10px]" style={{ backgroundColor: "rgba(255,255,255,0.06)" }}>{v.vehicleType}</span>}
                        </p>
                        <div className="flex items-baseline gap-1 mb-4 mt-auto">
                          <span className="text-2xl font-bold" style={{ color: "#2dd4bf" }}>${v.dailyRate}</span>
                          <span className="text-white/40 text-sm">{t("common.perDay")}</span>
                        </div>
                        <button
                          onClick={() => navigate(`/vehicles/${v.id}`)}
                          className="w-full py-2.5 rounded-lg font-bold text-sm transition-colors"
                          style={{ backgroundColor: "#2dd4bf", color: "#0d1b2e" }}
                        >
                          {t("search.viewDetails")}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {filtered.length === 0 && (
                <div className="text-center py-16 rounded-xl" style={{ backgroundColor: "#132640", border: "1px solid rgba(255,255,255,0.08)" }}>
                  <Car className="h-16 w-16 mx-auto mb-4" style={{ color: "rgba(255,255,255,0.15)" }} />
                  <p className="text-xl font-bold text-white mb-2">
                    {vehicles.length === 0 ? t("search.emptyTitleNone") : t("search.emptyTitleFiltered")}
                  </p>
                  <p className="text-white/40 mb-6">
                    {vehicles.length === 0 ? t("search.emptyBodyNone") : t("search.emptyBodyFiltered", { count: vehicles.length })}
                  </p>
                  {vehicles.length > 0 && (
                    <button
                      onClick={() => { setLocation(""); setVehicleType("All"); setPickupDate(""); setDropoffDate(""); }}
                      className="px-6 py-2.5 rounded-lg font-bold text-sm transition-colors"
                      style={{ backgroundColor: "#2dd4bf", color: "#0d1b2e" }}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#5eead4")}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#2dd4bf")}
                    >
                      {t("common.reset")}
                    </button>
                  )}
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
