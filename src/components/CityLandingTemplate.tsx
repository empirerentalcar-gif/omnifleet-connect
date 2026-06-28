import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import SEO from "@/components/SEO";
import { useTranslation } from "react-i18next";
import {
  ArrowRight,
  CheckCircle2,
  MapPin,
  Car,
  Search,
  DollarSign,
  Users,
  ShieldCheck,
  Scale,
  UtensilsCrossed,
} from "lucide-react";

export interface CityLandingConfig {
  slug: string;
  cityName: string;
  state: string;
  stateAbbr: string;
  h1: string;
  h2s: string[];
  description?: string;
  localFlavor?: {
    intro?: string;
    regulations: string[];
    restaurants: { name: string; note: string }[];
    popularCars: { type: string; note: string }[];
  };
}

const CityLandingTemplate = ({ config }: { config: CityLandingConfig }) => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { slug, cityName, state, stateAbbr, h1, h2s, description: customDescription, localFlavor } = config;
  const sec1Items = t("cityLanding.sec1Items", { returnObjects: true }) as string[];
  const sec2Items = t("cityLanding.sec2Items", { returnObjects: true }) as string[];
  const sec4Steps = t("cityLanding.sec4Steps", { returnObjects: true }) as Array<{ title: string; desc: string }>;
  const sec5Items = t("cityLanding.sec5Items", { returnObjects: true }) as string[];
  const vehicleTypes = t("cityLanding.vehicleTypes", { returnObjects: true }) as string[];
  const sec1Icons = [DollarSign, ShieldCheck, Users];

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title={t("cityLanding.seoTitle", { city: cityName, state: stateAbbr })}
        description={customDescription || t("cityLanding.seoDescription", { city: cityName })}
        path={`/${slug}`}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebPage",
            name: `Independent Car Rentals in ${cityName} | Zuvio`,
            url: `https://gozuvio.com/${slug}`,
            description: `Find independent car rentals in ${cityName}. Book direct from local agencies.`,
          }),
        }}
      />

      {/* Hero */}
      <section className="relative min-h-[70vh] flex flex-col justify-center pt-20 pb-16 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-hero" />
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse-glow" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-pulse-glow delay-500" />

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center animate-slide-up">
            <div className="inline-flex items-center gap-2 glass-card rounded-full px-4 py-2 mb-8">
              <MapPin className="h-4 w-4 text-accent" />
              <span className="text-sm text-muted-foreground">
                {cityName}, {stateAbbr}
              </span>
            </div>

            <h1 className="font-display text-4xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
              {h1}
            </h1>

            <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto mb-10">
              {t("cityLanding.heroSubtitle", { city: cityName })}
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                variant="hero"
                size="lg"
                className="group text-base"
                onClick={() => navigate(`/search?location=${encodeURIComponent(cityName)}`)}
              >
                <Search className="h-5 w-5" />
                <span>{t("cityLanding.searchBtn", { city: cityName })}</span>
                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="text-base border-accent/30 hover:bg-accent/10"
                onClick={() => navigate("/for-agencies")}
              >
                {t("cityLanding.listBtn", { city: cityName })}
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Section 1 - Cash Friendly */}
      <section className="py-20 md:py-28 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-background via-primary/5 to-background" />
        <div className="container mx-auto px-4 relative max-w-3xl text-center">
          <h2 className="font-display text-3xl md:text-5xl font-bold mb-6">{h2s[0]}</h2>
          <p className="text-lg text-muted-foreground mb-10">
            {t("cityLanding.sec1Body", { city: cityName })}
          </p>
          <div className="grid sm:grid-cols-3 gap-6">
            {sec1Items.map((text, i) => {
              const Icon = sec1Icons[i] ?? DollarSign;
              return (
                <div key={text} className="glass-card rounded-xl p-6 flex flex-col items-center gap-3">
                  <Icon className="h-8 w-8 text-accent" />
                  <p className="font-semibold text-foreground">{text}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Section 2 - Skip the Counter */}
      <section className="py-20 md:py-28">
        <div className="container mx-auto px-4 max-w-3xl text-center">
          <h2 className="font-display text-3xl md:text-5xl font-bold mb-6">{h2s[1]}</h2>
          <p className="text-lg text-muted-foreground mb-10">
            {t("cityLanding.sec2Body", { city: cityName })}
          </p>
          <div className="glass-card glow-border rounded-2xl p-8 md:p-10 space-y-4">
            {sec2Items.map((item) => (
              <div key={item} className="flex items-center gap-3">
                <CheckCircle2 className="h-5 w-5 text-accent shrink-0" />
                <p className="text-foreground font-medium text-lg">{item}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Section 3 - For Owners */}
      <section className="py-20 md:py-28 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-background via-accent/5 to-background" />
        <div className="container mx-auto px-4 relative max-w-3xl text-center">
          <h2 className="font-display text-3xl md:text-5xl font-bold mb-6">{h2s[2]}</h2>
          <p className="text-lg text-muted-foreground mb-10">
            {t("cityLanding.sec3Body", { city: cityName })}
          </p>
          <Button
            variant="hero"
            size="lg"
            className="group text-base"
            onClick={() => navigate("/signup")}
          >
            <span>{t("cityLanding.sec3Cta", { city: cityName })}</span>
            <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
          </Button>
        </div>
      </section>

      {/* Section 4 - How to Book */}
      <section className="py-20 md:py-28">
        <div className="container mx-auto px-4 max-w-3xl">
          <h2 className="font-display text-3xl md:text-5xl font-bold text-center mb-14">{h2s[3]}</h2>
          <div className="space-y-6">
            {sec4Steps.map((step, i) => {
              const num = String(i + 1).padStart(2, "0");
              const desc = i === 0 ? t("cityLanding.sec4Steps.0.desc", { city: cityName }) : step.desc;
              return (
                <div key={num} className="glass-card rounded-xl p-6 flex items-start gap-5">
                  <span className="text-2xl font-bold text-accent shrink-0">{num}</span>
                  <div>
                    <h3 className="font-bold text-foreground text-lg mb-1">{step.title}</h3>
                    <p className="text-muted-foreground">{desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Section 5 - Why Independent */}
      <section className="py-20 md:py-28 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-background via-primary/5 to-background" />
        <div className="container mx-auto px-4 relative max-w-3xl text-center">
          <h2 className="font-display text-3xl md:text-5xl font-bold mb-6">{h2s[4]}</h2>
          <p className="text-lg text-muted-foreground mb-10">
            {t("cityLanding.sec5Body")}
          </p>
          <div className="grid sm:grid-cols-2 gap-6">
            {sec5Items.map((item) => (
              <div key={item} className="glass-card rounded-xl p-5 flex items-center gap-3">
                <CheckCircle2 className="h-5 w-5 text-accent shrink-0" />
                <p className="text-foreground font-medium">{item}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Section 6 - Vehicle Types */}
      <section className="py-20 md:py-28">
        <div className="container mx-auto px-4 max-w-3xl text-center">
          <h2 className="font-display text-3xl md:text-5xl font-bold mb-6">{h2s[5]}</h2>
          <p className="text-lg text-muted-foreground mb-10">
            {t("cityLanding.sec6Body", { city: cityName })}
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {vehicleTypes.map((type) => (
              <div key={type} className="glass-card rounded-xl p-6 flex flex-col items-center gap-3">
                <Car className="h-8 w-8 text-accent" />
                <p className="font-semibold text-foreground">{type}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Local Flavor — unique per-city content */}
      {localFlavor && (
        <section className="py-20 md:py-28 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-background via-accent/5 to-background" />
          <div className="container mx-auto px-4 relative max-w-5xl">
            <div className="text-center mb-14">
              <span className="inline-block px-4 py-2 rounded-full bg-accent/10 text-accent text-sm font-medium mb-4">
                {t("cityLanding.localBadge")}
              </span>
              <h2 className="font-display text-3xl md:text-5xl font-bold mb-4">
                {t("cityLanding.localTitle", { city: cityName })}
              </h2>
              {localFlavor.intro && (
                <p className="text-lg text-muted-foreground max-w-3xl mx-auto">{localFlavor.intro}</p>
              )}
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {/* Regulations */}
              <div className="glass-card rounded-2xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Scale className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="font-bold text-foreground text-lg">{t("cityLanding.rules")}</h3>
                </div>
                <ul className="space-y-3">
                  {localFlavor.regulations.map((r) => (
                    <li key={r} className="flex items-start gap-2 text-muted-foreground text-sm leading-relaxed">
                      <CheckCircle2 className="h-4 w-4 text-accent shrink-0 mt-0.5" />
                      <span>{r}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Restaurants */}
              <div className="glass-card rounded-2xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 rounded-lg bg-accent/10">
                    <UtensilsCrossed className="h-5 w-5 text-accent" />
                  </div>
                  <h3 className="font-bold text-foreground text-lg">{t("cityLanding.worthDrive")}</h3>
                </div>
                <ul className="space-y-3">
                  {localFlavor.restaurants.map((r) => (
                    <li key={r.name} className="text-sm">
                      <p className="font-semibold text-foreground">{r.name}</p>
                      <p className="text-muted-foreground leading-relaxed">{r.note}</p>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Popular Cars */}
              <div className="glass-card rounded-2xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Car className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="font-bold text-foreground text-lg">{t("cityLanding.whatDrives", { city: cityName })}</h3>
                </div>
                <ul className="space-y-3">
                  {localFlavor.popularCars.map((c) => (
                    <li key={c.type} className="text-sm">
                      <p className="font-semibold text-foreground">{c.type}</p>
                      <p className="text-muted-foreground leading-relaxed">{c.note}</p>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* CTAs */}
      <section className="py-20 md:py-28 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-hero" />
        <div className="container mx-auto px-4 relative z-10 text-center">
          <h2 className="font-display text-3xl md:text-5xl font-bold mb-8">
            {t("cityLanding.readyTitle")} <span className="text-gradient">{cityName}</span>?
          </h2>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              variant="hero"
              size="xl"
              className="group text-base"
              onClick={() => navigate(`/search?location=${encodeURIComponent(cityName)}`)}
            >
              <Search className="h-5 w-5" />
              <span>{t("cityLanding.finalSearch", { city: cityName })}</span>
              <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button
              variant="outline"
              size="xl"
              className="text-base border-accent/30 hover:bg-accent/10"
              onClick={() => navigate("/for-agencies")}
            >
              {t("cityLanding.finalList", { city: cityName })}
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default CityLandingTemplate;
