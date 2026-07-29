import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { supabase } from "@/integrations/supabase/client";
import SEO from "@/components/SEO";
import { Helmet } from "react-helmet-async";
import { SafeImage } from "@/components/SafeImage";
import { Button } from "@/components/ui/button";
import { ReserveDrawer } from "@/components/vehicle/ReserveDrawer";
import { InquiryDrawer } from "@/components/vehicle/InquiryDrawer";
import { Calendar, Car, Fuel, Gauge, MapPin, Users, Banknote, ArrowLeft } from "lucide-react";
import { PublicVehiclePaymentSummary } from "@/components/payment/PublicVehiclePaymentSummary";
import { effectiveSettingsFromPublicRow } from "@/lib/payment-settings";
import { PRIVATE_AGENCY_LABEL } from "@/lib/agency-privacy";

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
  bookable: boolean | null;
  cash_accepted: boolean | null;
  agency_photos: string[] | null;
  owner_story: string | null;
  cancellation_policy: string | null;
  deposit_info: string | null;
  requirements: string[] | null;
  vehicle_payment_methods: unknown | null;
  agency_payment_methods: unknown | null;
  vehicle_payment_restrictions: string | null;
  agency_payment_restrictions: string | null;
  vehicle_fee_settings: unknown | null;
  agency_fee_settings: unknown | null;
  vehicle_tax_rate: number | null;
  agency_tax_rate: number | null;
  vehicle_custom_fees: unknown | null;
  agency_custom_fees: unknown | null;
};

const VehicleDetail = () => {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const [vehicle, setVehicle] = useState<VehicleRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [reserveOpen, setReserveOpen] = useState(false);
  const [inquiryOpen, setInquiryOpen] = useState(false);
  const [activePhoto, setActivePhoto] = useState(0);
  const [isRented, setIsRented] = useState(false);

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
    (async () => {
      if (!id) return;
      const { data, error } = await supabase.rpc("get_rented_vehicle_ids");
      if (cancelled || error) return;
      const rented = (data ?? []).some((r: any) => r.vehicle_id === id);
      setIsRented(rented);
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
        <h1 className="text-2xl font-bold text-white mb-2">{t('vehicle.notAvailable')}</h1>
        <p className="text-white/60 mb-6">{t('vehicle.notAvailableBody')}</p>
        <Link to="/search"><Button style={{ backgroundColor: "#2dd4bf", color: "#0d1b2e" }}>{t('vehicle.browse')}</Button></Link>
      </div>
    );
  }

  const photos = vehicle.images?.length ? vehicle.images : [];
  const label = `${vehicle.year} ${vehicle.make} ${vehicle.model}`;
  // Always merge agency defaults with vehicle overrides via the shared helper —
  // never read the raw columns directly on the public page.
  const paymentSettings = effectiveSettingsFromPublicRow(vehicle);
  // Agencies that haven't finished Stripe onboarding can't take payments, so we
  // show an honest inquiry form instead of a checkout that would fail.
  const canBook = vehicle.bookable !== false;

  const productJsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: label,
    description:
      vehicle.description ||
      `Rent a ${label} from a verified local agency on Zuvio.`,
    image: photos.length ? photos : undefined,
    brand: { "@type": "Brand", name: vehicle.make },
    category: vehicle.vehicle_type,
    offers: {
      "@type": "Offer",
      price: Number(vehicle.daily_rate),
      priceCurrency: "USD",
      availability: "https://schema.org/InStock",
      url: `https://gozuvio.com/vehicles/${vehicle.id}`,
      seller: {
        "@type": "Organization",
        name: PRIVATE_AGENCY_LABEL,
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
        title={t('vehicle.seoTitle', { label })}
        description={t('vehicle.seoDescription', { label, agency: t('vehicle.independentAgency') })}
        path={`/vehicles/${vehicle.id}`}
        ready={!loading}
      />
      <Helmet>
        <script type="application/ld+json">{JSON.stringify(productJsonLd)}</script>
      </Helmet>
      <main className="container mx-auto px-4 pt-8 pb-16 max-w-6xl">
        <Link to="/search" className="inline-flex items-center gap-2 text-white/60 hover:text-[#2dd4bf] text-sm mb-6">
          <ArrowLeft className="h-4 w-4" /> {t('vehicle.back')}
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
              {isRented && (
                <div
                  aria-label="Currently rented"
                  className="absolute inset-0 flex items-center justify-center pointer-events-none"
                  style={{ backgroundColor: "rgba(13,27,46,0.45)" }}
                >
                  <span
                    className="px-5 py-2 rounded-md text-base font-extrabold tracking-widest"
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
                {vehicle.location_city || t('vehicle.locationTBD')}{vehicle.location_state ? `, ${vehicle.location_state}` : ""}
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { icon: Car, label: vehicle.vehicle_type },
                { icon: Users, label: vehicle.seats ? t('vehicle.seats', { count: vehicle.seats }) : "—" },
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
                <h2 className="text-lg font-bold text-white mb-2">{t('vehicle.about')}</h2>
                <p className="text-white/70 text-sm whitespace-pre-line">{vehicle.description}</p>
              </section>
            )}

            {vehicle.features?.length ? (
              <section>
                <h2 className="text-lg font-bold text-white mb-2">{t('vehicle.features')}</h2>
                <div className="flex flex-wrap gap-2">
                  {vehicle.features.map((f) => (
                    <span key={f} className="px-3 py-1 rounded-full text-xs text-white/70" style={{ backgroundColor: "rgba(255,255,255,0.06)" }}>{f}</span>
                  ))}
                </div>
              </section>
            ) : null}

            <section className="rounded-xl p-5" style={{ backgroundColor: "#132640", border: "1px solid rgba(255,255,255,0.08)" }}>
              <h2 className="text-lg font-bold text-white mb-2">{t('vehicle.independentAgency')}</h2>
              {vehicle.owner_story && (
                <p className="text-white/70 text-sm whitespace-pre-line mb-3">{vehicle.owner_story}</p>
              )}
              {vehicle.cash_accepted && (
                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-semibold" style={{ backgroundColor: "rgba(45,212,191,0.15)", color: "#2dd4bf", border: "1px solid rgba(45,212,191,0.3)" }}>
                  <Banknote className="h-3 w-3" /> {t('vehicle.cashAccepted')}
                </span>
              )}
              <Link to={`/agency/${vehicle.profile_id}`} className="block mt-3 text-sm text-[#2dd4bf] hover:underline">{t('vehicle.viewAgency')}</Link>
            </section>

            {(vehicle.deposit_info || vehicle.cancellation_policy) && (
              <section className="rounded-xl p-5 space-y-3 text-sm text-white/70" style={{ backgroundColor: "#132640", border: "1px solid rgba(255,255,255,0.08)" }}>
                <h2 className="text-lg font-bold text-white">{t('vehicle.bookingDetails')}</h2>
                {vehicle.deposit_info && <div><p className="font-semibold text-white/90 mb-1">{t('vehicle.deposit')}</p><p>{vehicle.deposit_info}</p></div>}
                {vehicle.cancellation_policy && <div><p className="font-semibold text-white/90 mb-1">{t('vehicle.cancellation')}</p><p>{vehicle.cancellation_policy}</p></div>}
              </section>
            )}

          </div>

          {/* Reserve sidebar */}
          <aside>
            <div className="lg:sticky lg:top-24 rounded-2xl p-6 space-y-4" style={{ backgroundColor: "#132640", border: "1px solid rgba(45,212,191,0.3)" }}>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-bold" style={{ color: "#2dd4bf" }}>${vehicle.daily_rate}</span>
                <span className="text-white/50">{t('vehicle.perDay')}</span>
              </div>
              <p className="text-white/60 text-sm flex items-center gap-1.5"><Calendar className="h-4 w-4" /> {t('vehicle.authNote')}</p>
              {!canBook && (
                <p className="text-sm rounded-lg p-3" style={{ backgroundColor: "rgba(251,191,36,0.1)", border: "1px solid rgba(251,191,36,0.35)", color: "#fde68a" }}>
                  This agency isn't set up for online payments yet. You can request this vehicle and they'll contact you to confirm availability and payment.
                </p>
              )}
              <PublicVehiclePaymentSummary
                settings={paymentSettings}
                pickupRequirements={vehicle.requirements}
              />
              <Button onClick={() => (canBook ? setReserveOpen(true) : setInquiryOpen(true))} className="w-full text-base h-12 font-bold" style={{ backgroundColor: "#2dd4bf", color: "#0d1b2e" }}>
                {canBook ? t('vehicle.reserveBtn') : "Request this vehicle"}
              </Button>
              <p className="text-white/50 text-xs">
                {canBook
                  ? t('vehicle.feeNote')
                  : "The agency will contact you to confirm availability and payment. No payment is collected here."}
              </p>
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
        paymentSettings={paymentSettings}
      />

      <InquiryDrawer
        open={inquiryOpen}
        onOpenChange={setInquiryOpen}
        vehicleId={vehicle.id}
        vehicleLabel={label}
        agencyName={null}
      />
    </div>
  );
};

export default VehicleDetail;