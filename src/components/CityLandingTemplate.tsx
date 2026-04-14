import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import SEO from "@/components/SEO";
import {
  ArrowRight,
  CheckCircle2,
  MapPin,
  Car,
  Search,
  DollarSign,
  Users,
  ShieldCheck,
} from "lucide-react";

export interface CityLandingConfig {
  slug: string;
  cityName: string;
  state: string;
  stateAbbr: string;
  h1: string;
  h2s: string[];
  description?: string;
}

const CityLandingTemplate = ({ config }: { config: CityLandingConfig }) => {
  const navigate = useNavigate();
  const { slug, cityName, state, stateAbbr, h1, h2s, description: customDescription } = config;

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title={`Independent Car Rentals in ${cityName}, ${stateAbbr} | Zuvio`}
        description={customDescription || `Find independent car rentals in ${cityName}. Book direct from local agencies, pay with cash, and skip the big rental counters.`}
        path={`/${slug}`}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebPage",
            name: `Independent Car Rentals in ${cityName} | Zuvio`,
            url: `https://zuvio.us/${slug}`,
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
              Skip the big rental counters and book direct from trusted independent agencies in {cityName}. Cash-friendly options available.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                variant="hero"
                size="lg"
                className="group text-base"
                onClick={() => navigate(`/search?location=${encodeURIComponent(cityName)}`)}
              >
                <Search className="h-5 w-5" />
                <span>Search {cityName} Car Rentals</span>
                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="text-base border-accent/30 hover:bg-accent/10"
                onClick={() => navigate("/for-agencies")}
              >
                List Your Cars in {cityName}
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
            Many independent agencies in {cityName} accept cash, debit cards, and flexible payment methods — no credit card required.
          </p>
          <div className="grid sm:grid-cols-3 gap-6">
            {[
              { icon: DollarSign, text: "Cash accepted" },
              { icon: ShieldCheck, text: "No credit card needed" },
              { icon: Users, text: "Direct owner contact" },
            ].map(({ icon: Icon, text }) => (
              <div key={text} className="glass-card rounded-xl p-6 flex flex-col items-center gap-3">
                <Icon className="h-8 w-8 text-accent" />
                <p className="font-semibold text-foreground">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Section 2 - Skip the Counter */}
      <section className="py-20 md:py-28">
        <div className="container mx-auto px-4 max-w-3xl text-center">
          <h2 className="font-display text-3xl md:text-5xl font-bold mb-6">{h2s[1]}</h2>
          <p className="text-lg text-muted-foreground mb-10">
            Why wait in long airport lines? Book directly with local {cityName} agencies who offer personalized service and competitive rates.
          </p>
          <div className="glass-card glow-border rounded-2xl p-8 md:p-10 space-y-4">
            {[
              "Skip long airport lines",
              "Get personalized service",
              "Support local businesses",
              "Flexible pickup locations",
            ].map((item) => (
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
            Own rental cars in {cityName}? Get discovered by local and visiting renters. Keep full control of pricing, policies, and customer communication.
          </p>
          <Button
            variant="hero"
            size="lg"
            className="group text-base"
            onClick={() => navigate("/signup")}
          >
            <span>Join Zuvio in {cityName}</span>
            <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
          </Button>
        </div>
      </section>

      {/* Section 4 - How to Book */}
      <section className="py-20 md:py-28">
        <div className="container mx-auto px-4 max-w-3xl">
          <h2 className="font-display text-3xl md:text-5xl font-bold text-center mb-14">{h2s[3]}</h2>
          <div className="space-y-6">
            {[
              { num: "01", title: "Search", desc: `Enter ${cityName} as your location and browse available agencies.` },
              { num: "02", title: "Compare", desc: "View vehicle options, pricing, and payment methods accepted." },
              { num: "03", title: "Book Direct", desc: "Submit a reservation request and connect directly with the agency." },
            ].map((step) => (
              <div key={step.num} className="glass-card rounded-xl p-6 flex items-start gap-5">
                <span className="text-2xl font-bold text-accent shrink-0">{step.num}</span>
                <div>
                  <h3 className="font-bold text-foreground text-lg mb-1">{step.title}</h3>
                  <p className="text-muted-foreground">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Section 5 - Why Independent */}
      <section className="py-20 md:py-28 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-background via-primary/5 to-background" />
        <div className="container mx-auto px-4 relative max-w-3xl text-center">
          <h2 className="font-display text-3xl md:text-5xl font-bold mb-6">{h2s[4]}</h2>
          <p className="text-lg text-muted-foreground mb-10">
            Independent agencies offer better prices, flexible payment, and personal service. No corporate red tape.
          </p>
          <div className="grid sm:grid-cols-2 gap-6">
            {[
              "Lower rates than big brands",
              "Cash & debit accepted",
              "Flexible rental terms",
              "Personalized customer service",
            ].map((item) => (
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
            Browse sedans, SUVs, trucks, vans, and more from local agencies in {cityName}.
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {["Sedans", "SUVs", "Trucks", "Vans"].map((type) => (
              <div key={type} className="glass-card rounded-xl p-6 flex flex-col items-center gap-3">
                <Car className="h-8 w-8 text-accent" />
                <p className="font-semibold text-foreground">{type}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTAs */}
      <section className="py-20 md:py-28 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-hero" />
        <div className="container mx-auto px-4 relative z-10 text-center">
          <h2 className="font-display text-3xl md:text-5xl font-bold mb-8">
            Ready to Get Started in <span className="text-gradient">{cityName}</span>?
          </h2>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              variant="hero"
              size="xl"
              className="group text-base"
              onClick={() => navigate(`/search?location=${encodeURIComponent(cityName)}`)}
            >
              <Search className="h-5 w-5" />
              <span>Search {cityName} Car Rentals</span>
              <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button
              variant="outline"
              size="xl"
              className="text-base border-accent/30 hover:bg-accent/10"
              onClick={() => navigate("/for-agencies")}
            >
              List Your Cars in {cityName}
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default CityLandingTemplate;
