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
import SEO from "@/components/SEO";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Independent Car Rental Platform for Owners | Zuvio"
        description="Zuvio connects independent car rental owners & agencies with real customers nationwide. Keep your pricing, policies, and control. No middlemen."
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
    </div>
  );
};

export default Index;
