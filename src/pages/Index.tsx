import Hero from "@/components/Hero";
import ProblemSolution from "@/components/ProblemSolution";
import WhoThisIsFor from "@/components/WhoThisIsFor";
import HowYouMakeMoney from "@/components/HowYouMakeMoney";
import CompetitorContrast from "@/components/CompetitorContrast";
import HowItWorks from "@/components/HowItWorks";
import CityExpansion from "@/components/CityExpansion";
import SocialProof from "@/components/SocialProof";
import TrustSection from "@/components/TrustSection";
import OwnerFAQ from "@/components/OwnerFAQ";
import ObjectionHandling from "@/components/ObjectionHandling";
import FinalCTA from "@/components/FinalCTA";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Independent Car Rental Platform for Owners | Zuvio"
        description="List your rental cars, fleet, or agency on Zuvio. Get direct booking requests, keep control of your pricing, and grow your rental business."
        path="/"
      />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "WebSite",
        "name": "Zuvio",
        "url": "https://zuvio.us",
        "description": "Independent car rental platform for owners. List your rental cars and get direct booking requests.",
        "potentialAction": {
          "@type": "SearchAction",
          "target": "https://zuvio.us/search?q={search_term_string}",
          "query-input": "required name=search_term_string"
        }
      }) }} />
      <Hero />
      <ProblemSolution />
      <WhoThisIsFor />
      <HowYouMakeMoney />
      <CompetitorContrast />
      <HowItWorks />
      <CityExpansion />
      <SocialProof />
      <TrustSection />
      <ObjectionHandling />
      <OwnerFAQ />
      <FinalCTA />
      <Footer />
    </div>
  );
};

export default Index;
