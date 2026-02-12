import Header from "@/components/Header";
import Hero from "@/components/Hero";
import OwnerCTA from "@/components/OwnerCTA";
import StatsSection from "@/components/StatsSection";
import FeaturedVehicles from "@/components/FeaturedVehicles";
import PopularLocations from "@/components/PopularLocations";
import HowItWorks from "@/components/HowItWorks";
import AnalyticsDashboard from "@/components/AnalyticsDashboard";
import Testimonials from "@/components/Testimonials";
import TrustBadges from "@/components/TrustBadges";
import OwnerFAQ from "@/components/OwnerFAQ";
import FAQ from "@/components/FAQ";
import Comparison from "@/components/Comparison";
import PartnerLogos from "@/components/PartnerLogos";
import AgencyCTA from "@/components/AgencyCTA";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <Hero />
      <OwnerCTA />
      <PartnerLogos />
      <StatsSection />
      <FeaturedVehicles />
      <PopularLocations />
      <HowItWorks />
      <AnalyticsDashboard />
      <Comparison />
      <Testimonials />
      <TrustBadges />
      <OwnerFAQ />
      <FAQ />
      <AgencyCTA />
      <Footer />
    </div>
  );
};

export default Index;
