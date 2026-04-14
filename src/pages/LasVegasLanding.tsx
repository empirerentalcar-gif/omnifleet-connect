import { useState } from "react";
import SEO from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import {
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  TrendingUp,
  DollarSign,
  Users,
  BarChart3,
  MapPin,
  Check,
  Ban,
  ShieldCheck,
  Quote,
  XCircle,
  Search,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { PricingCard, PricingROI } from "@/components/pricing/PricingCard";
import ObjectionHandling from "@/components/ObjectionHandling";

/* ─── 1. HERO ─── */
const heroPoints = [
  "Get bookings beyond Turo and corporate platforms",
  "Connect directly with Las Vegas visitors",
  "Keep your pricing and policies",
  "Build your own customer base",
];

/* ─── 2. LOCAL OPPORTUNITY ─── */
const missedItems = [
  "Hard to find online",
  "Buried under corporate listings",
  "Missing out on direct bookings",
];

/* ─── 3. EARLY ADVANTAGE ─── */
const earlyBenefits = [
  "Increased visibility in a growing network",
  "Less competition on the platform",
  "Stronger positioning as demand grows",
];

/* ─── 4. MONEY ─── */
const moneyBullets = [
  { icon: Users, text: "Capture tourists searching for alternatives" },
  { icon: BarChart3, text: "Fill gaps in your rental calendar" },
  { icon: TrendingUp, text: "Build repeat local customers" },
  { icon: DollarSign, text: "Accept cash or your preferred payment method" },
];

/* ─── 5. PRICING ─── */
const foundingFeatures = [
  "Las Vegas regional visibility",
  "National listing exposure",
  "Reservation request management",
  "Direct customer communication",
  "Owner-controlled approvals",
  "Lock your rate for life",
];

/* ─── 7. HOW IT WORKS ─── */
const steps = [
  { num: "01", title: "Create your profile", desc: "Set up your Las Vegas agency profile in minutes." },
  { num: "02", title: "List your vehicles", desc: "Add your cars with pricing, photos, and policies." },
  { num: "03", title: "Receive booking requests", desc: "Vegas visitors find you and submit reservation requests." },
  { num: "04", title: "Approve or decline", desc: "You choose which bookings to accept." },
  { num: "05", title: "Handle payment your way", desc: "Cash, card, Zelle — your payment, your rules." },
];

/* ─── 8. OBJECTION ─── */
const objectionBenefits = [
  "Increase bookings",
  "Build independence",
  "Grow your customer base",
];

/* ─── 9. TESTIMONIALS ─── */
const testimonials = [
  {
    quote: "Zuvio is bringing customers I wasn't reaching before — especially visitors looking for local options.",
    name: "Marcus T.",
    role: "Independent Fleet Owner · Las Vegas, NV",
  },
  {
    quote: "I used to rely only on Turo. Now I get direct calls from tourists and have more control over my business.",
    name: "Daniela R.",
    role: "Turo Host & Agency Owner · Las Vegas, NV",
  },
  {
    quote: "Setup took 10 minutes and I started getting inquiries the same week. No complicated onboarding — just business.",
    name: "James K.",
    role: "Small Fleet Owner · Las Vegas, NV",
  },
];

const LasVegasLanding = () => {
  const navigate = useNavigate();

  /* calculator state */
  const [pricePerDay, setPricePerDay] = useState(85);
  const [rentalDays, setRentalDays] = useState(3);
  const [bookingsPerMonth, setBookingsPerMonth] = useState(5);

  const monthlyRevenue = pricePerDay * rentalDays * bookingsPerMonth;
  const bookingFee = monthlyRevenue * 0.05;
  const subscriptionCost = 79;
  const netIncome = monthlyRevenue - bookingFee - subscriptionCost;

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Las Vegas Car Rental Owners | Get More Bookings with Zuvio"
        description="Own rental cars in Las Vegas? Get direct booking requests, keep control of pricing, and grow your rental business with Zuvio."
        path="/las-vegas"
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebPage",
            name: "Zuvio Las Vegas — Independent Car Rental Platform",
            url: "https://zuvio.us/las-vegas",
            description:
              "Own rental cars in Las Vegas? Get direct booking requests, keep control of pricing, and grow your rental business with Zuvio.",
          }),
        }}
      />
{/* ─── 1. HERO ─── */}
      <section className="relative min-h-screen flex flex-col justify-center pt-20 pb-16 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-hero" />
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse-glow" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-pulse-glow delay-500" />

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center animate-slide-up">
            <div className="inline-flex items-center gap-2 glass-card rounded-full px-4 py-2 mb-8">
              <MapPin className="h-4 w-4 text-accent" />
              <span className="text-sm text-muted-foreground">Las Vegas, Nevada</span>
            </div>

            <h1 className="font-display text-4xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
              Independent Car Rentals in Las Vegas, NV — Book Direct, Pay Less
            </h1>

            <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto mb-10">
              Zuvio helps independent rental car owners and Turo hosts in Las Vegas attract direct customers, increase bookings, and stay fully in control of their business.
            </p>

            <div className="flex flex-wrap justify-center gap-x-8 gap-y-3 mb-10">
              {heroPoints.map((p) => (
                <div key={p} className="flex items-center gap-2 text-foreground">
                  <CheckCircle2 className="h-5 w-5 text-accent shrink-0" />
                  <span className="text-sm md:text-base font-medium">{p}</span>
                </div>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button variant="hero" size="lg" className="group text-base" onClick={() => navigate("/signup")}>
                <span>Start Getting Vegas Bookings</span>
                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="text-base border-accent/30 hover:bg-accent/10"
                onClick={() => navigate("/signup")}
              >
                List My Vehicles in Las Vegas
              </Button>
            </div>
            <p className="text-sm text-muted-foreground mt-6">No contracts. Cancel anytime.</p>
          </div>
        </div>
      </section>

      {/* ─── 2. LOCAL OPPORTUNITY ─── */}
      <section className="py-20 md:py-28 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-background via-primary/5 to-background" />
        <div className="container mx-auto px-4 relative max-w-3xl">
          <div className="text-center mb-12">
            <span className="inline-block px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
              Local Opportunity
            </span>
            <h2 className="font-display text-3xl md:text-5xl font-bold mb-4">
              Cash-Friendly Car Rentals Near You in Las Vegas
            </h2>
            <p className="text-lg text-muted-foreground">
              Millions of visitors come to Las Vegas every year — many looking for flexible, local, and cash-friendly rental options.
            </p>
          </div>

          <div className="glass-card rounded-2xl p-8 md:p-10 mb-6">
            <p className="text-foreground font-medium mb-5">Independent rental owners are often:</p>
            <div className="space-y-4">
              {missedItems.map((item) => (
                <div key={item} className="flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
                  <p className="text-muted-foreground text-lg">{item}</p>
                </div>
              ))}
            </div>
          </div>
          <p className="text-center text-xl font-bold text-accent">Zuvio changes that.</p>
        </div>
      </section>

      {/* ─── 3. EARLY ADVANTAGE ─── */}
      <section className="py-20 md:py-28 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-background via-accent/5 to-background" />
        <div className="container mx-auto px-4 relative max-w-3xl">
          <div className="text-center mb-12">
            <span className="inline-block px-4 py-2 rounded-full bg-accent/10 text-accent text-sm font-medium mb-4">
              First-Mover Advantage
            </span>
            <h2 className="font-display text-3xl md:text-5xl font-bold mb-4">
              Skip the Airport Counter — Rent Direct from Local Las Vegas Agencies
            </h2>
            <p className="text-lg text-muted-foreground">
              Zuvio is expanding city-by-city — and Las Vegas is a priority market.
            </p>
          </div>

          <div className="glass-card glow-border rounded-2xl p-8 md:p-10 space-y-5 mb-8">
            <p className="text-foreground font-medium mb-2">Early members benefit from:</p>
            {earlyBenefits.map((b) => (
              <div key={b} className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-accent shrink-0 mt-0.5" />
                <p className="text-foreground text-lg font-medium">{b}</p>
              </div>
            ))}
          </div>

          <p className="text-center text-xl font-bold text-foreground mb-6">
            First movers win <span className="text-accent">the most visibility.</span>
          </p>

          <div className="text-center">
            <Button variant="hero" size="lg" className="group" onClick={() => navigate("/signup")}>
              <span>Claim Your Spot in Las Vegas</span>
              <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>
        </div>
      </section>

      {/* ─── 4. MONEY ─── */}
      <section className="py-20 md:py-28 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-background via-primary/5 to-background" />
        <div className="container mx-auto px-4 relative max-w-4xl">
          <div className="text-center mb-12">
            <span className="inline-block px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
              Revenue
            </span>
            <h2 className="font-display text-3xl md:text-5xl font-bold mb-4">
              Las Vegas Car Rental Owners: List Your Fleet on Zuvio
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 gap-6 mb-10">
            {moneyBullets.map(({ icon: Icon, text }) => (
              <div key={text} className="glass-card rounded-xl p-6 flex items-center gap-4">
                <div className="p-3 rounded-lg bg-primary/10">
                  <Icon className="h-6 w-6 text-primary" />
                </div>
                <p className="text-foreground font-medium text-lg">{text}</p>
              </div>
            ))}
          </div>

          <p className="text-center text-xl font-bold text-accent">
            Zuvio helps you convert Las Vegas traffic into real revenue.
          </p>
        </div>
      </section>

      {/* ─── 5. PRICING ─── */}
      <section id="vegas-pricing" className="py-20 md:py-28 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-background via-secondary/10 to-background" />
        <div className="container mx-auto px-4 relative max-w-3xl">
          <div className="text-center mb-14">
            <h2 className="font-display text-3xl md:text-5xl font-bold mb-4">
              How to Book an Independent Car Rental in Las Vegas
            </h2>
            <p className="text-lg text-muted-foreground">
              Built for independent rental owners — no hidden fees.
            </p>
          </div>

          <PricingCard badgeText="LIMITED — FIRST 50 LAS VEGAS AGENCIES" />
          <PricingROI />
        </div>
      </section>

      <ObjectionHandling />

      {/* ─── 6. PROFIT CALCULATOR ─── */}
      <section className="py-20 md:py-28 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-background via-accent/5 to-background" />
        <div className="container mx-auto px-4 relative max-w-4xl">
          <div className="text-center mb-12">
            <span className="inline-block px-4 py-2 rounded-full bg-accent/10 text-accent text-sm font-medium mb-4">
              💰 Profit Calculator
            </span>
            <h2 className="font-display text-3xl md:text-5xl font-bold mb-4">
              Why Las Vegas Travelers Choose <span className="text-gradient">Independent Car Rentals</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Even a few extra bookings per month can significantly increase your income.
            </p>
          </div>

          <div className="glass-card glow-border rounded-2xl p-8 md:p-10">
            <div className="space-y-8 mb-10">
              <div>
                <div className="flex justify-between items-center mb-3">
                  <label className="text-foreground font-medium">Average Rental Price Per Day</label>
                  <span className="text-2xl font-bold text-accent">${pricePerDay}</span>
                </div>
                <Slider value={[pricePerDay]} onValueChange={([v]) => setPricePerDay(v)} min={30} max={300} step={5} />
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  <span>$30</span>
                  <span>$300</span>
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-3">
                  <label className="text-foreground font-medium">Average Rental Length (Days)</label>
                  <span className="text-2xl font-bold text-accent">{rentalDays}</span>
                </div>
                <Slider value={[rentalDays]} onValueChange={([v]) => setRentalDays(v)} min={1} max={14} step={1} />
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  <span>1 day</span>
                  <span>14 days</span>
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-3">
                  <label className="text-foreground font-medium">Additional Bookings Per Month from Zuvio</label>
                  <span className="text-2xl font-bold text-accent">{bookingsPerMonth}</span>
                </div>
                <Slider value={[bookingsPerMonth]} onValueChange={([v]) => setBookingsPerMonth(v)} min={1} max={15} step={1} />
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  <span>1 booking</span>
                  <span>15 bookings</span>
                </div>
              </div>
            </div>

            <div className="border-t border-border pt-8 space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Estimated Monthly Revenue</span>
                <span className="text-foreground font-semibold text-lg">${monthlyRevenue.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Zuvio Booking Fee (5%)</span>
                <span className="text-muted-foreground">-${bookingFee.toFixed(0)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Subscription Cost</span>
                <span className="text-muted-foreground">-$79</span>
              </div>
              <div className="border-t border-border pt-4 flex justify-between items-center">
                <span className="text-foreground font-bold text-lg">Your Net Additional Income</span>
                <span className={`text-3xl font-bold ${netIncome >= 0 ? "text-accent" : "text-destructive"}`}>
                  ${netIncome.toFixed(0)}
                </span>
              </div>
            </div>

            <div className="mt-8 p-4 rounded-xl bg-accent/10 border border-accent/20 text-center">
              <p className="text-foreground font-medium">
                🔥 Las Vegas demand is constant — even a few bookings can cover your monthly cost.{" "}
                <span className="text-accent font-bold">Everything beyond that is profit.</span>
              </p>
            </div>

            <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
              <Button variant="hero" size="lg" className="group" onClick={() => navigate("/signup")}>
                <TrendingUp className="h-5 w-5" />
                <span>Start Getting Vegas Bookings</span>
                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* ─── 7. HOW IT WORKS ─── */}
      <section className="py-20 md:py-28 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-background via-secondary/10 to-background" />
        <div className="container mx-auto px-4 relative max-w-3xl">
          <div className="text-center mb-14">
            <h2 className="font-display text-3xl md:text-5xl font-bold mb-4">
              Find the Right Vehicle for Las Vegas — <span className="text-gradient">Sedans, SUVs, Trucks & More</span>
            </h2>
          </div>
          <div className="space-y-6">
            {steps.map((step) => (
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

      {/* ─── 8. OBJECTION ─── */}
      <section className="py-20 md:py-28 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-background via-accent/5 to-background" />
        <div className="container mx-auto px-4 relative max-w-3xl">
          <div className="text-center mb-10">
            <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
              Do I Have to <span className="text-gradient">Stop Using Turo?</span>
            </h2>
            <p className="text-xl text-foreground font-semibold mb-2">No.</p>
            <p className="text-lg text-muted-foreground">
              Many Las Vegas hosts use Zuvio alongside Turo to increase bookings and reduce reliance on one platform.
            </p>
          </div>
          <div className="glass-card glow-border rounded-2xl p-8 space-y-4 max-w-md mx-auto">
            {objectionBenefits.map((b) => (
              <div key={b} className="flex items-center gap-3">
                <CheckCircle2 className="h-5 w-5 text-accent shrink-0" />
                <p className="text-foreground font-medium text-lg">{b}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── 9. TESTIMONIALS ─── */}
      <section className="py-20 md:py-28 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-background via-secondary/10 to-background" />
        <div className="container mx-auto px-4 relative">
          <div className="text-center mb-14">
            <h2 className="font-display text-3xl md:text-5xl font-bold mb-4">
              What Las Vegas Hosts Are <span className="text-gradient">Saying</span>
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {testimonials.map((t) => (
              <div key={t.name} className="glass-card glow-border rounded-2xl p-8 flex flex-col">
                <Quote className="h-8 w-8 text-accent/40 mb-4" />
                <p className="text-muted-foreground mb-6 flex-1 leading-relaxed">"{t.quote}"</p>
                <div>
                  <p className="font-display font-bold text-foreground">{t.name}</p>
                  <p className="text-sm text-muted-foreground">{t.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── SEARCH CTAs ─── */}
      <section className="py-24 md:py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-hero" />
        <div className="absolute top-1/3 left-1/3 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse-glow" />

        <div className="container mx-auto px-4 relative z-10 text-center">
          <h2 className="font-display text-3xl md:text-5xl lg:text-6xl font-bold mb-8">
            Get Started in <span className="text-gradient">Las Vegas</span>
          </h2>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button variant="hero" size="xl" className="group text-base" onClick={() => navigate(`/search?location=${encodeURIComponent("Las Vegas")}`)}>
              <Search className="h-5 w-5" />
              <span>Search Las Vegas Car Rentals</span>
              <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button
              variant="outline"
              size="xl"
              className="text-base border-accent/30 hover:bg-accent/10"
              onClick={() => navigate("/for-agencies")}
            >
              List Your Cars in Las Vegas
            </Button>
          </div>
        </div>
      </section>

    </div>
  );
};

export default LasVegasLanding;
