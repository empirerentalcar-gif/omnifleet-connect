import Header from "@/components/Header";
import Hero from "@/components/Hero";
import StatsSection from "@/components/StatsSection";
import FeaturedVehicles from "@/components/FeaturedVehicles";
import PopularLocations from "@/components/PopularLocations";
import HowItWorks from "@/components/HowItWorks";
import Testimonials from "@/components/Testimonials";
import TrustBadges from "@/components/TrustBadges";
import PartnerLogos from "@/components/PartnerLogos";
import Comparison from "@/components/Comparison";
import FAQ from "@/components/FAQ";
import AgencyCTA from "@/components/AgencyCTA";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <Hero />
      <PartnerLogos />
      <StatsSection />
      <FeaturedVehicles />
      <PopularLocations />
      <HowItWorks />
      <Comparison />
      <Testimonials />
      <TrustBadges />
      <FAQ />
      <AgencyCTA />
      <Footer />
    </div>
  );
};

export default Index;
