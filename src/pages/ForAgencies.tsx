import SEO from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import {
  ArrowRight, Check, DollarSign, TrendingUp, Eye, Phone, ShieldCheck,
  Ban, Users, CalendarCheck, CreditCard, ClipboardList, UserCheck,
  XCircle, Clock,
} from "lucide-react";
import { PricingCard, PricingROI } from "@/components/pricing/PricingCard";
import ObjectionHandling from "@/components/ObjectionHandling";

const ForAgencies = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Independent Car Rental Agencies | Get More Bookings with Zuvio"
        description="Grow your car rental business with Zuvio. Get direct booking requests, keep control of pricing, and increase revenue."
        path="/for-agencies"
      />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "WebPage",
        "name": "For Agencies — ZUVIO",
        "description": "Grow your car rental business with Zuvio. Get direct booking requests, keep control of pricing, and increase revenue.",
        "url": "https://zuvio.us/for-agencies",
        "isPartOf": { "@type": "WebSite", "name": "ZUVIO", "url": "https://zuvio.us" }
      }) }} />
{/* 1. HERO */}
      <section className="pt-28 md:pt-36 pb-16 md:pb-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-hero" />
        <div className="absolute top-1/3 right-1/4 w-[500px] h-[500px] bg-primary/8 rounded-full blur-3xl" />
        <div className="container mx-auto px-4 relative z-10 max-w-4xl">
          <h1 className="font-display text-4xl md:text-6xl font-bold mb-6 leading-tight">
            Get More Car Rental Bookings for Independent Agencies in{" "}
            <span className="text-gradient">Las Vegas & Beyond</span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-3xl">
            Zuvio helps independent car rental agencies attract direct customers, increase bookings, and grow revenue — while keeping full control of pricing, policies, and operations.
          </p>
          <ul className="space-y-3 mb-10">
            {["Direct customer communication", "No corporate restrictions", "Built for independent agencies"].map((t) => (
              <li key={t} className="flex items-center gap-3 text-foreground">
                <Check className="h-5 w-5 text-accent shrink-0" />
                <span className="font-medium">{t}</span>
              </li>
            ))}
          </ul>
          <div className="flex flex-col sm:flex-row gap-4">
            <Button variant="hero" size="xl" className="group text-base" onClick={() => navigate("/signup")}>
              <span>Become a Founding Member</span>
              <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button variant="outline" size="xl" className="text-base border-accent/30 hover:bg-accent/10" onClick={() => navigate("/signup")}>
              Start Getting Booking Requests
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-4">No contracts. Cancel anytime.</p>
        </div>
      </section>

      {/* 2. MONEY SECTION */}
      <section className="py-20 md:py-28 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-accent/5 to-primary/10" />
        <div className="container mx-auto px-4 relative z-10 max-w-3xl text-center">
          <span className="inline-block px-4 py-2 rounded-full bg-accent/10 text-accent text-sm font-medium mb-4">
            Revenue Engine
          </span>
          <h2 className="font-display text-3xl md:text-5xl font-bold mb-4">
            More Car Rental Bookings = <span className="text-gradient">More Revenue for Your Agency</span>
          </h2>
          <p className="text-lg text-muted-foreground mb-10">
            Even a few additional bookings per month can cover your cost and increase your total income.
          </p>
          <div className="grid sm:grid-cols-3 gap-6 mb-10">
            {[
              { icon: CalendarCheck, text: "Fill unused inventory" },
              { icon: TrendingUp, text: "Increase monthly revenue" },
              { icon: ShieldCheck, text: "Reduce reliance on one platform" },
            ].map(({ icon: Icon, text }) => (
              <div key={text} className="glass-card rounded-xl p-6 flex flex-col items-center gap-3">
                <Icon className="h-8 w-8 text-accent" />
                <p className="font-semibold text-foreground">{text}</p>
              </div>
            ))}
          </div>
          <p className="text-xl font-display font-bold text-foreground">
            Zuvio is designed to <span className="text-gradient">pay for itself quickly.</span>
          </p>
        </div>
      </section>

      {/* 3. PROBLEM */}
      <section className="py-20 md:py-28">
        <div className="container mx-auto px-4 max-w-3xl text-center">
          <h2 className="font-display text-3xl md:text-5xl font-bold mb-10">
            Why Independent Car Rental Agencies <span className="text-gradient">Struggle to Compete Online</span>
          </h2>
          <div className="space-y-5 max-w-xl mx-auto">
            {[
              { icon: XCircle, text: "Corporate chains dominate search results" },
              { icon: XCircle, text: "Independent agencies are hard to find" },
              { icon: XCircle, text: "Platforms control pricing and customers" },
            ].map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-4 glass-card rounded-xl p-5">
                <Icon className="h-6 w-6 text-destructive shrink-0" />
                <p className="font-semibold text-foreground text-left">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. SOLUTION */}
      <section className="py-20 md:py-28 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent" />
        <div className="container mx-auto px-4 relative z-10 max-w-3xl text-center">
          <h2 className="font-display text-3xl md:text-5xl font-bold mb-4">
            Zuvio Levels the Playing Field for <span className="text-gradient">Independent Rental Agencies</span>
          </h2>
          <p className="text-lg text-muted-foreground mb-10">
            Zuvio gives independent agencies the visibility and tools needed to compete — without taking control away from you.
          </p>
          <div className="space-y-4 max-w-xl mx-auto">
            {[
              "Get discovered by local and traveling customers",
              "Receive direct booking requests",
              "Maintain full independence",
            ].map((t) => (
              <div key={t} className="flex items-center gap-4 glass-card rounded-xl p-5">
                <Check className="h-5 w-5 text-accent shrink-0" />
                <p className="font-semibold text-foreground text-left">{t}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. FEATURES */}
      <section className="py-20 md:py-28">
        <div className="container mx-auto px-4 max-w-4xl">
          <h2 className="font-display text-3xl md:text-5xl font-bold text-center mb-14">
            Built for <span className="text-gradient">Independent Rental Agencies</span>
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: Eye, title: "Increased visibility" },
              { icon: Phone, title: "Direct customer communication" },
              { icon: UserCheck, title: "Owner-controlled approvals" },
              { icon: CreditCard, title: "Flexible payment options" },
              { icon: ClipboardList, title: "Booking request management" },
              { icon: ShieldCheck, title: "Full control of your business" },
            ].map(({ icon: Icon, title }) => (
              <div key={title} className="glass-card rounded-xl p-6 flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center shrink-0">
                  <Icon className="h-6 w-6 text-accent" />
                </div>
                <p className="font-display font-semibold text-foreground">{title}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. HOW IT WORKS */}
      <section className="py-20 md:py-28 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-background via-secondary/10 to-background" />
        <div className="container mx-auto px-4 relative z-10 max-w-3xl">
          <h2 className="font-display text-3xl md:text-5xl font-bold text-center mb-14">
            How It <span className="text-gradient">Works</span>
          </h2>
          <div className="space-y-6">
            {[
              "Create your profile",
              "List your vehicles",
              "Receive booking requests",
              "Approve or decline",
              "Serve customers your way",
            ].map((step, i) => (
              <div key={step} className="flex gap-5 items-center">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-primary-foreground text-lg font-bold shrink-0">
                  {i + 1}
                </div>
                <p className="font-display text-lg font-semibold text-foreground">{step}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 7. PRICING */}
      <section className="py-20 md:py-28 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-background via-secondary/10 to-background" />
        <div className="container mx-auto px-4 relative z-10 max-w-lg">
          <div className="text-center mb-14">
            <h2 className="font-display text-3xl md:text-5xl font-bold mb-4">
              Simple, <span className="text-gradient">Transparent Pricing</span>
            </h2>
            <p className="text-lg text-muted-foreground">
              No hidden fees. No contracts. No loss of control.
            </p>
          </div>
          <PricingCard />
          <PricingROI />
        </div>
      </section>

      <ObjectionHandling />

      {/* 8. WHY BOOKING FEE */}
      <section className="py-20 md:py-28">
        <div className="container mx-auto px-4 max-w-3xl text-center">
          <h2 className="font-display text-3xl md:text-4xl font-bold mb-6">
            We Only Succeed <span className="text-gradient">When You Do</span>
          </h2>
          <p className="text-lg text-muted-foreground mb-4">
            Zuvio earns a small percentage only when you receive bookings.
          </p>
          <p className="text-xl font-bold text-foreground mb-8">
            If you don't grow — <span className="text-accent">we don't grow.</span>
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Ban className="h-4 w-4 text-accent" />
              No setup fees
            </div>
            <div className="flex items-center gap-2">
              <Ban className="h-4 w-4 text-accent" />
              No long contracts
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-accent" />
              Cancel anytime
            </div>
          </div>
        </div>
      </section>

      {/* 9. TRUST */}
      <section className="py-20 md:py-28 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent" />
        <div className="container mx-auto px-4 relative z-10 max-w-3xl text-center">
          <h2 className="font-display text-3xl md:text-5xl font-bold mb-10">
            You Stay in <span className="text-gradient">Control</span>
          </h2>
          <div className="grid sm:grid-cols-3 gap-6">
            {[
              { icon: DollarSign, text: "You set pricing" },
              { icon: ShieldCheck, text: "You control policies" },
              { icon: Users, text: "You manage your customers" },
            ].map(({ icon: Icon, text }) => (
              <div key={text} className="glass-card rounded-xl p-6 flex flex-col items-center gap-3">
                <Icon className="h-8 w-8 text-accent" />
                <p className="font-semibold text-foreground">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 10. URGENCY */}
      <section className="py-20 md:py-28">
        <div className="container mx-auto px-4 max-w-3xl text-center">
          <div className="glass-card glow-border rounded-2xl p-10">
            <Clock className="h-10 w-10 text-accent mx-auto mb-4" />
            <h2 className="font-display text-2xl md:text-4xl font-bold mb-4">
              Limited Founding Member Spots for Independent Car Rental Agencies
            </h2>
            <p className="text-lg text-muted-foreground">
              We are onboarding a limited number of agencies to ensure strong visibility and performance.
            </p>
          </div>
        </div>
      </section>

      {/* 11. FINAL CTA */}
      <section className="py-24 md:py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-hero" />
        <div className="absolute top-1/3 left-1/3 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse-glow" />
        <div className="container mx-auto px-4 relative z-10 text-center">
          <h2 className="font-display text-3xl md:text-5xl lg:text-6xl font-bold mb-6">
            Start Getting More Bookings
            <br />
            <span className="text-gradient">— On Your Terms</span>
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-2">
            $79/month + 5% per confirmed booking. 60 days free for founding members. Limited availability.
          </p>
          <p className="text-sm text-muted-foreground mb-6">
            Try it risk-free for 60 days. If it doesn't bring value, you don't continue.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button variant="hero" size="xl" className="group text-base" onClick={() => navigate("/signup")}>
              <span>Lock My Founding Rate</span>
              <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button variant="outline" size="xl" className="text-base border-accent/30 hover:bg-accent/10" onClick={() => navigate("/signup")}>
              Get My First Bookings
            </Button>
          </div>
        </div>
      </section>

    </div>
  );
};

export default ForAgencies;
