import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import SEO from "@/components/SEO";
import { Helmet } from "react-helmet-async";
import { SafeImage } from "@/components/SafeImage";
import { Button } from "@/components/ui/button";
import { ReserveDrawer } from "@/components/vehicle/ReserveDrawer";
import { Calendar, Car, Fuel, Gauge, MapPin, Users, Banknote, ArrowLeft } from "lucide-react";

type VehicleRow = {
  id: string;
  make: string;
  model: string;
  year: number;
  vehicle_type: string;
  daily_rate: number;
  description: string | null;
  features: string[] | null;
  fuel_type: string | null;
  transmission: string | null;
  seats: number | null;
  images: string[] | null;
  location_city: string | null;
  location_state: string | null;
  profile_id: string;
  business_name: string | null;
  cash_accepted: boolean | null;
  agency_photos: string[] | null;
  owner_story: string | null;
  cancellation_policy: string | null;
  deposit_info: string | null;
  requirements: string[] | null;
};

const VehicleDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [vehicle, setVehicle] = useState<VehicleRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [reserveOpen, setReserveOpen] = useState(false);
  const [activePhoto, setActivePhoto] = useState(0);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!id) return;
      setLoading(true);
      const { data, error } = await supabase
        .from("available_vehicles_public")
        .select("*")
        .eq("id", id)
        .maybeSingle();
      if (cancelled) return;
      if (error) {
        console.error("vehicle fetch failed", error);
        setVehicle(null);
      } else {
        setVehicle(data as VehicleRow);
      }
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "#0d1b2e" }}>
        <div className="w-8 h-8 border-2 border-[#2dd4bf] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!vehicle) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4" style={{ backgroundColor: "#0d1b2e" }}>
        <h1 className="text-2xl font-bold text-white mb-2">Vehicle not available</h1>
        <p className="text-white/60 mb-6">It may have been removed or is no longer listed.</p>
        <Link to="/search"><Button style={{ backgroundColor: "#2dd4bf", color: "#0d1b2e" }}>Browse vehicles</Button></Link>
      </div>
    );
  }

  const photos = vehicle.images?.length ? vehicle.images : [];
  const label = `${vehicle.year} ${vehicle.make} ${vehicle.model}`;

  const productJsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: label,
    description:
      vehicle.description ||
      `Rent a ${label} from ${vehicle.business_name ?? "an independent agency"} on Zuvio.`,
    image: photos.length ? photos : undefined,
    brand: { "@type": "Brand", name: vehicle.make },
    category: vehicle.vehicle_type,
    offers: {
      "@type": "Offer",
      price: Number(vehicle.daily_rate),
      priceCurrency: "USD",
      availability: "https://schema.org/InStock",
      url: `https://zuvio.us/vehicles/${vehicle.id}`,
      seller: {
        "@type": "Organization",
        name: vehicle.business_name ?? "Independent agency",
      },
      priceSpecification: {
        "@type": "UnitPriceSpecification",
        price: Number(vehicle.daily_rate),
        priceCurrency: "USD",
        unitCode: "DAY",
      },
    },
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#0d1b2e" }}>
      <SEO
        title={`${label} for rent | ZUVIO`}
        description={`Reserve a ${label} from ${vehicle.business_name ?? "an independent agency"} on ZUVIO. Cash-friendly options.`}
        path={`/vehicles/${vehicle.id}`}
        ready={!loading}
      />
      <Helmet>
        <script type="application/ld+json">{JSON.stringify(productJsonLd)}</script>
      </Helmet>
      <main className="container mx-auto px-4 pt-8 pb-16 max-w-6xl">
        <Link to="/search" className="inline-flex items-center gap-2 text-white/60 hover:text-[#2dd4bf] text-sm mb-6">
          <ArrowLeft className="h-4 w-4" /> Back to search
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Photos + details */}
          <div className="lg:col-span-2 space-y-6">
            <div className="rounded-2xl overflow-hidden aspect-video relative" style={{ backgroundColor: "#132640", border: "1px solid rgba(255,255,255,0.08)" }}>
              {photos.length ? (
                <SafeImage src={photos[activePhoto]} alt={label} className="w-full h-full object-cover" />
              ) : (
                <SafeImage src="" alt={label} className="w-full h-full object-cover" />
              )}
            </div>
            {photos.length > 1 && (
              <div className="grid grid-cols-5 gap-2">
                {photos.slice(0, 5).map((p, i) => (
                  <button
                    key={p}
                    onClick={() => setActivePhoto(i)}
                    className="aspect-square rounded-lg overflow-hidden"
                    style={{ border: i === activePhoto ? "2px solid #2dd4bf" : "1px solid rgba(255,255,255,0.1)" }}
                  >
                    <SafeImage src={p} alt={`${label} photo ${i + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}

            <div>
              <h1 className="text-3xl font-bold text-white mb-1">{label}</h1>
              <p className="text-white/50 text-sm flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5" />
                {vehicle.location_city || "Location TBD"}{vehicle.location_state ? `, ${vehicle.location_state}` : ""}
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { icon: Car, label: vehicle.vehicle_type },
                { icon: Users, label: vehicle.seats ? `${vehicle.seats} seats` : "—" },
                { icon: Gauge, label: vehicle.transmission ?? "—" },
                { icon: Fuel, label: vehicle.fuel_type ?? "—" },
              ].map((item, i) => (
                <div key={i} className="rounded-lg p-3 text-white/80 text-sm flex items-center gap-2 capitalize" style={{ backgroundColor: "#132640", border: "1px solid rgba(255,255,255,0.08)" }}>
                  <item.icon className="h-4 w-4 text-[#2dd4bf]" />
                  {item.label}
                </div>
              ))}
            </div>

            {vehicle.description && (
              <section>
                <h2 className="text-lg font-bold text-white mb-2">About this vehicle</h2>
                <p className="text-white/70 text-sm whitespace-pre-line">{vehicle.description}</p>
              </section>
            )}

            {vehicle.features?.length ? (
              <section>
                <h2 className="text-lg font-bold text-white mb-2">Features</h2>
                <div className="flex flex-wrap gap-2">
                  {vehicle.features.map((f) => (
                    <span key={f} className="px-3 py-1 rounded-full text-xs text-white/70" style={{ backgroundColor: "rgba(255,255,255,0.06)" }}>{f}</span>
                  ))}
                </div>
              </section>
            ) : null}

            <section className="rounded-xl p-5" style={{ backgroundColor: "#132640", border: "1px solid rgba(255,255,255,0.08)" }}>
              <h2 className="text-lg font-bold text-white mb-2">{vehicle.business_name ?? "Independent agency"}</h2>
              {vehicle.owner_story && (
                <p className="text-white/70 text-sm whitespace-pre-line mb-3">{vehicle.owner_story}</p>
              )}
              {vehicle.cash_accepted && (
                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-semibold" style={{ backgroundColor: "rgba(45,212,191,0.15)", color: "#2dd4bf", border: "1px solid rgba(45,212,191,0.3)" }}>
                  <Banknote className="h-3 w-3" /> Cash accepted
                </span>
              )}
              <Link to={`/agency/${vehicle.profile_id}`} className="block mt-3 text-sm text-[#2dd4bf] hover:underline">View agency profile →</Link>
            </section>

            {(vehicle.requirements?.length || vehicle.deposit_info || vehicle.cancellation_policy) && (
              <section className="rounded-xl p-5 space-y-3 text-sm text-white/70" style={{ backgroundColor: "#132640", border: "1px solid rgba(255,255,255,0.08)" }}>
                <h2 className="text-lg font-bold text-white">Booking details</h2>
                {vehicle.requirements?.length ? (
                  <div>
                    <p className="font-semibold text-white/90 mb-1">Requirements</p>
                    <ul className="list-disc pl-5 space-y-1">{vehicle.requirements.map((r) => <li key={r}>{r}</li>)}</ul>
                  </div>
                ) : null}
                {vehicle.deposit_info && <div><p className="font-semibold text-white/90 mb-1">Deposit</p><p>{vehicle.deposit_info}</p></div>}
                {vehicle.cancellation_policy && <div><p className="font-semibold text-white/90 mb-1">Cancellation</p><p>{vehicle.cancellation_policy}</p></div>}
              </section>
            )}
          </div>

          {/* Reserve sidebar */}
          <aside>
            <div className="lg:sticky lg:top-24 rounded-2xl p-6 space-y-4" style={{ backgroundColor: "#132640", border: "1px solid rgba(45,212,191,0.3)" }}>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-bold" style={{ color: "#2dd4bf" }}>${vehicle.daily_rate}</span>
                <span className="text-white/50">/ day</span>
              </div>
              <p className="text-white/60 text-sm flex items-center gap-1.5"><Calendar className="h-4 w-4" /> Card authorized at booking, charged when the agency confirms.</p>
              <Button onClick={() => setReserveOpen(true)} className="w-full text-base h-12 font-bold" style={{ backgroundColor: "#2dd4bf", color: "#0d1b2e" }}>
                Reserve this vehicle
              </Button>
              <p className="text-white/50 text-xs">A 5% platform fee is included in the total. No charge until your booking is confirmed by the agency.</p>
            </div>
          </aside>
        </div>
      </main>

      <ReserveDrawer
        open={reserveOpen}
        onOpenChange={setReserveOpen}
        vehicleId={vehicle.id}
        vehicleLabel={label}
        dailyRate={Number(vehicle.daily_rate)}
      />
    </div>
  );
};

export default VehicleDetail;