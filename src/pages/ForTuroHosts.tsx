import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";
import TuroHero from "@/components/turo/TuroHero";
import TuroPain from "@/components/turo/TuroPain";
import TuroSolution from "@/components/turo/TuroSolution";
import TuroMoney from "@/components/turo/TuroMoney";
import TuroPricing from "@/components/turo/TuroPricing";
import TuroProfitCalculator from "@/components/turo/TuroProfitCalculator";
import TuroBookingFee from "@/components/turo/TuroBookingFee";
import TuroHowItWorks from "@/components/turo/TuroHowItWorks";
import ObjectionHandling from "@/components/ObjectionHandling";
import TuroComparison from "@/components/turo/TuroComparison";
import TuroTestimonials from "@/components/turo/TuroTestimonials";
import TuroFinalCTA from "@/components/turo/TuroFinalCTA";

const ForTuroHosts = () => {
  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Turo Alternative for Hosts | Get Direct Bookings with Zuvio"
        description="Get more bookings outside of Turo. Keep control of pricing, build repeat customers, and grow your rental business with Zuvio."
        path="/for-turo-hosts"
      />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "WebPage",
        "name": "Zuvio for Turo Hosts",
        "url": "https://zuvio.us/for-turo-hosts",
        "description": "Get more bookings outside of Turo. Keep control of pricing, build repeat customers, and grow your rental business with Zuvio."
      }) }} />
      <Header />
      <TuroHero />
      <TuroPain />
      <TuroSolution />
      <TuroMoney />
      <TuroPricing />
      <TuroProfitCalculator />
      <TuroBookingFee />
      <TuroHowItWorks />
      <ObjectionHandling />
      <TuroComparison />
      <TuroTestimonials />
      <TuroFinalCTA />
      <Footer />
    </div>
  );
};

export default ForTuroHosts;
