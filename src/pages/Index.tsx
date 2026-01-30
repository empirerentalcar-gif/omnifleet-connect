import Header from "@/components/Header";
import Hero from "@/components/Hero";
import StatsSection from "@/components/StatsSection";
import FeaturedVehicles from "@/components/FeaturedVehicles";
import PopularLocations from "@/components/PopularLocations";
import HowItWorks from "@/components/HowItWorks";
import AgencyCTA from "@/components/AgencyCTA";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <Hero />
      <StatsSection />
      <FeaturedVehicles />
      <PopularLocations />
      <HowItWorks />
      <AgencyCTA />
      <Footer />
    </div>
  );
};

export default Index;
