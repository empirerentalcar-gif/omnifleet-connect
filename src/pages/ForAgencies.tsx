import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";
import { Link } from "react-router-dom";
import { Globe, TrendingUp, Briefcase, Target, Handshake, Dumbbell, Check } from "lucide-react";

const benefits = [
  { icon: Globe, title: "Nationwide Visibility", desc: "Get discovered by customers across the United States. ZUVIO puts your agency in front of travelers searching for rentals in your area, dramatically expanding your reach beyond local advertising." },
  { icon: TrendingUp, title: "Increase Bookings", desc: "Tap into a growing market of customers who prefer supporting local businesses and value personalized service. Our platform attracts renters specifically looking for independent agencies." },
  { icon: Briefcase, title: "Professional Platform", desc: "Present your fleet professionally with easy-to-use listing tools. Upload photos, set pricing, manage availability, and showcase what makes your agency special." },
  { icon: Target, title: "Target Your Market", desc: "Reach customers looking for flexible payment options including cash rentals. Attract the clients who need what you offer and value independent service." },
  { icon: Handshake, title: "Keep Your Independence", desc: "You set your own rates, policies, and terms. ZUVIO connects you with customers but you remain completely independent and in control of your business." },
  { icon: Dumbbell, title: "Compete with Chains", desc: "Level the playing field against Enterprise, Hertz, and other corporate chains. Gain the technology and reach you need while maintaining your personal touch." },
];

const steps = [
  { num: 1, title: "Sign Up and Create Your Profile", desc: "Complete a simple registration process and set up your agency profile. Add your business information, location details, operating hours, and what makes your agency unique." },
  { num: 2, title: "List Your Fleet", desc: "Upload your available vehicles with photos, descriptions, and pricing. Update availability in real-time and manage your inventory through an easy-to-use dashboard." },
  { num: 3, title: "Receive Bookings", desc: "Get instant notifications when customers book through ZUVIO. Review reservation details, communicate with renters, and manage your bookings all in one place." },
  { num: 4, title: "Serve Your Customers", desc: "Provide the excellent, personalized service that sets independent agencies apart. Complete the rental process at your location and build your reputation through reviews." },
];

const features = [
  { title: "Booking Management", desc: "Intuitive dashboard to manage all reservations, track customer information, and handle schedule conflicts with ease." },
  { title: "Marketing Tools", desc: "Get found by customers actively searching for independent rentals. SEO-optimized listings ensure maximum visibility." },
  { title: "Customer Reviews", desc: "Build your reputation through authentic customer reviews. Positive feedback drives more bookings." },
  { title: "Analytics & Insights", desc: "Track your performance with detailed analytics. Understand booking trends and optimize your business." },
  { title: "Secure Payments", desc: "Accept various payment methods securely. You control payment terms and can offer cash, cards, or both." },
  { title: "Dedicated Support", desc: "Access responsive customer support from people who understand the car rental business." },
];

const ForAgencies = () => {
  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Join ZUVIO | Partner with the Independent Car Rental Network"
        description="Grow your independent car rental business with ZUVIO. Connect with customers nationwide, increase bookings, and join a network designed for independent agencies."
        path="/for-agencies"
      />
      <Header />

      {/* Hero */}
      <section className="pt-24 md:pt-32 pb-16 md:pb-20 bg-gradient-to-br from-primary/10 via-background to-secondary/10 text-center px-4">
        <div className="container mx-auto max-w-3xl">
          <h1 className="font-display text-4xl md:text-5xl font-bold mb-6">Grow Your Car Rental Business</h1>
          <p className="text-lg md:text-xl text-muted-foreground mb-8">
            Join ZUVIO and connect with customers across America. Built specifically for independent car rental agencies to thrive in the digital age.
          </p>
          <Link to="/pricing" className="bg-primary text-primary-foreground font-semibold px-8 py-3 rounded-full hover:bg-primary/90 transition-colors inline-block">
            Become a Partner Agency
          </Link>
        </div>
      </section>

      {/* Intro */}
      <section className="py-16 md:py-20">
        <div className="container mx-auto px-4 max-w-3xl text-center">
          <h2 className="font-display text-3xl md:text-4xl font-bold mb-6">Why Independent Agencies Choose ZUVIO</h2>
          <p className="text-lg text-muted-foreground leading-relaxed">
            We understand the challenges independent car rental agencies face competing against national chains. ZUVIO levels the playing field by giving you access to a nationwide customer base while maintaining your independence and local identity.
          </p>
        </div>
      </section>

      {/* Benefits */}
      <section className="pb-16 md:pb-20">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {benefits.map((b, i) => (
              <div key={i} className="bg-card rounded-2xl p-8 shadow-sm hover:shadow-lg transition-all hover:-translate-y-1 border-t-4 border-primary">
                <b.icon className="h-10 w-10 text-primary mb-4" />
                <h3 className="font-display text-xl font-bold mb-3">{b.title}</h3>
                <p className="text-muted-foreground">{b.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 md:py-20 bg-secondary/5">
        <div className="container mx-auto px-4 max-w-3xl">
          <h2 className="font-display text-3xl md:text-4xl font-bold mb-4 text-center">How ZUVIO Works for Agencies</h2>
          <p className="text-center text-lg text-muted-foreground mb-12">Getting started is simple and straightforward</p>
          <div className="space-y-8">
            {steps.map((s) => (
              <div key={s.num} className="flex gap-6 items-start">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-primary-foreground text-2xl font-extrabold flex-shrink-0">
                  {s.num}
                </div>
                <div className="bg-card rounded-xl p-6 shadow-sm flex-1 border border-border/50">
                  <h3 className="font-display text-xl font-bold mb-2">{s.title}</h3>
                  <p className="text-muted-foreground">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Preview */}
      <section className="py-16 md:py-20">
        <div className="container mx-auto px-4 max-w-4xl text-center">
          <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">Simple, Transparent Pricing</h2>
          <p className="text-lg text-muted-foreground mb-12 max-w-2xl mx-auto">Choose the plan that works best for your business. No hidden fees, no surprises.</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { name: "Free Trial", price: "$0/month for first 3 months", items: ["Full platform access", "Unlimited vehicle listings", "Customer support", "No commitment required"] },
              { name: "Commission Based", price: "Small commission per booking", items: ["Pay only when you get business", "No monthly fees", "Unlimited listings", "Perfect for growing agencies"], featured: true },
              { name: "Monthly Plan", price: "Fixed monthly subscription", items: ["Predictable monthly cost", "No per-booking fees", "Priority support", "Best for high-volume agencies"] },
            ].map((plan, i) => (
              <div key={i} className={`bg-card rounded-2xl p-8 border-2 transition-all hover:-translate-y-1 ${plan.featured ? "border-primary shadow-lg relative" : "border-border/50 hover:border-primary"}`}>
                {plan.featured && <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-xs font-semibold px-4 py-1 rounded-full">Most Popular</span>}
                <h3 className="font-display text-xl font-bold mb-2">{plan.name}</h3>
                <p className="text-muted-foreground mb-6 text-sm">{plan.price}</p>
                <ul className="text-left space-y-3 mb-6">
                  {plan.items.map((item, j) => (
                    <li key={j} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <Check className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                      {item}
                    </li>
                  ))}
                </ul>
                <Link to="/pricing" className="block bg-primary text-primary-foreground font-semibold px-6 py-2.5 rounded-full hover:bg-primary/90 transition-colors text-sm">
                  {plan.featured ? "Learn More" : "Get Started"}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 md:py-20">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="bg-card rounded-2xl p-8 md:p-12 shadow-sm border border-border/50">
            <h3 className="font-display text-2xl md:text-3xl font-bold mb-8 text-center text-primary">Everything You Need to Succeed</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {features.map((f, i) => (
                <div key={i}>
                  <h4 className="font-display font-bold text-lg mb-2">{f.title}</h4>
                  <p className="text-muted-foreground text-sm">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 md:py-20">
        <div className="container mx-auto px-4 max-w-3xl">
          <div className="bg-gradient-to-r from-primary to-accent rounded-2xl p-8 md:p-12 text-center text-primary-foreground">
            <h2 className="font-display text-3xl font-bold mb-4">Ready to Grow Your Business?</h2>
            <p className="text-lg mb-8 opacity-95">Join hundreds of independent car rental agencies already thriving on ZUVIO. Start your free trial today.</p>
            <Link to="/pricing" className="bg-background text-primary font-semibold px-8 py-3 rounded-full hover:bg-background/90 transition-colors inline-block">
              Become a Partner Agency
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default ForAgencies;
