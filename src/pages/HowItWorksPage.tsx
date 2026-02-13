import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";
import { Link } from "react-router-dom";
import { CreditCard, Store, Star, Search, Car, MapPin } from "lucide-react";

const steps = [
  {
    num: 1,
    title: "Search for Rentals Near You",
    desc: "Start by entering your location, pickup dates, and preferred vehicle type. ZUVIO will instantly show you all available rentals from independent agencies in your area.",
    details: ["Search by city, zip code, or airport", "Filter by vehicle type, price range, and amenities", "See agencies that accept cash payments", "View agencies with no credit card requirements", "Check real-time availability across all local agencies"],
  },
  {
    num: 2,
    title: "Compare and Choose Your Rental",
    desc: "Browse through available options and compare vehicles, prices, and agency reviews. Each listing provides detailed information to help you make the best choice.",
    details: ["Vehicle details, photos, and features", "Pricing with no hidden fees", "Agency location and contact information", "Customer reviews and ratings", "Payment options accepted (cash, credit, debit)", "Rental terms and conditions", "Insurance and protection options"],
  },
  {
    num: 3,
    title: "Book and Pick Up Your Vehicle",
    desc: "Once you've found the perfect rental, complete your reservation through ZUVIO. You'll receive instant confirmation and all the details you need for pickup.",
    details: ["Secure your reservation with instant confirmation", "Receive pickup location and directions", "Get agency contact information for any questions", "Review required documents (license, insurance proof, etc.)", "Arrive at the agency to complete paperwork and pick up your vehicle", "Drive away with your rental and enjoy personalized service"],
  },
];

const features = [
  { icon: CreditCard, title: "Flexible Payment", desc: "Many agencies accept cash, debit cards, or credit cards. No credit card? No problem with our network of independent agencies." },
  { icon: Store, title: "Support Local", desc: "Every rental supports independent business owners in your community. Keep your money local and get better service." },
  { icon: Star, title: "Personal Touch", desc: "Work directly with agency owners who care about your experience. Skip the corporate bureaucracy and get real customer service." },
  { icon: Search, title: "Transparent Pricing", desc: "See all costs upfront with no surprise fees. Independent agencies pride themselves on honest, straightforward pricing." },
  { icon: Car, title: "Variety of Vehicles", desc: "From economy cars to SUVs and vans, find exactly what you need from agencies with diverse fleets." },
  { icon: MapPin, title: "Convenient Locations", desc: "Access rentals near airports, city centers, and neighborhoods across the country. Find an agency close to you." },
];

const HowItWorksPage = () => {
  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="How ZUVIO Works | Rent from Independent Car Rental Agencies"
        description="Learn how to rent a car from independent agencies on ZUVIO. Simple 3-step process: search local rentals, compare options, and book with flexible terms including cash payments."
        path="/how-it-works"
      />
      <Header />

      {/* Hero */}
      <section className="pt-24 md:pt-32 pb-16 md:pb-20 bg-gradient-to-br from-primary/10 via-background to-secondary/10 text-center px-4">
        <div className="container mx-auto max-w-3xl">
          <h1 className="font-display text-4xl md:text-5xl font-bold mb-6">How ZUVIO Works for Renters</h1>
          <p className="text-lg md:text-xl text-muted-foreground">
            Renting from independent car rental agencies has never been easier. Follow our simple three-step process to find the perfect rental.
          </p>
        </div>
      </section>

      {/* Intro */}
      <section className="py-16 md:py-20">
        <div className="container mx-auto px-4 max-w-3xl text-center">
          <h2 className="font-display text-3xl md:text-4xl font-bold mb-6">Your Guide to Independent Car Rentals</h2>
          <p className="text-lg text-muted-foreground leading-relaxed">
            ZUVIO connects you with trusted independent car rental agencies across the United States. Whether you need flexible payment options, personalized service, or want to support local businesses, we make it simple to find and book the perfect rental vehicle.
          </p>
        </div>
      </section>

      {/* Steps */}
      <section className="pb-16 md:pb-20">
        <div className="container mx-auto px-4 max-w-3xl space-y-12">
          {steps.map((s) => (
            <div key={s.num} className="flex gap-6 items-start">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-primary-foreground text-3xl font-extrabold flex-shrink-0">
                {s.num}
              </div>
              <div className="bg-card rounded-xl p-6 md:p-8 shadow-sm flex-1 border border-border/50">
                <h3 className="font-display text-2xl font-bold mb-3">{s.title}</h3>
                <p className="text-muted-foreground mb-4">{s.desc}</p>
                <div className="bg-secondary/5 rounded-lg p-5 border-l-4 border-primary">
                  <h4 className="font-display font-bold mb-3">{s.num === 1 ? "What You Can Do:" : s.num === 2 ? "Information You'll See:" : "The Booking Process:"}</h4>
                  <ul className="space-y-2">
                    {s.details.map((d, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                        <span className="text-primary font-bold">✓</span>
                        {d}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="py-16 md:py-20 bg-secondary/5">
        <div className="container mx-auto px-4">
          <h2 className="font-display text-3xl md:text-4xl font-bold mb-12 text-center">Why Rent Through ZUVIO?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {features.map((f, i) => (
              <div key={i} className="bg-card rounded-xl p-6 text-center shadow-sm hover:-translate-y-1 transition-all border border-border/50">
                <f.icon className="h-10 w-10 text-primary mx-auto mb-4" />
                <h3 className="font-display text-lg font-bold mb-2">{f.title}</h3>
                <p className="text-muted-foreground text-sm">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 md:py-20">
        <div className="container mx-auto px-4 max-w-3xl">
          <div className="bg-gradient-to-r from-primary to-accent rounded-2xl p-8 md:p-12 text-center text-primary-foreground">
            <h2 className="font-display text-3xl font-bold mb-4">Ready to Find Your Perfect Rental?</h2>
            <p className="text-lg mb-8 opacity-95">Search our network of independent car rental agencies and discover the ZUVIO difference today.</p>
            <Link to="/search" className="bg-background text-primary font-semibold px-8 py-3 rounded-full hover:bg-background/90 transition-colors inline-block">
              Start Your Search
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default HowItWorksPage;
