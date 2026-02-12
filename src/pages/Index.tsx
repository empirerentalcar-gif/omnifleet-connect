import Header from "@/components/Header";
import Hero from "@/components/Hero";
import HowItWorks from "@/components/HowItWorks";
import Comparison from "@/components/Comparison";
import OwnerCTA from "@/components/OwnerCTA";
import TrustBadges from "@/components/TrustBadges";
import AgencyCTA from "@/components/AgencyCTA";
import OwnerFAQ from "@/components/OwnerFAQ";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <Hero />
      <HowItWorks />
      <Comparison />
      <OwnerCTA />
      <TrustBadges />
      <OwnerFAQ />
      <AgencyCTA />
      <Footer />
    </div>
  );
};

export default Index;
