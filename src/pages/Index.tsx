import Header from "@/components/Header";
import Hero from "@/components/Hero";
import HowItWorks from "@/components/HowItWorks";
import Comparison from "@/components/Comparison";
import OwnerCTA from "@/components/OwnerCTA";
import TrustBadges from "@/components/TrustBadges";
import AgencyCTA from "@/components/AgencyCTA";
import OwnerFAQ from "@/components/OwnerFAQ";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="ZUVIO | Independent Car Rentals Near You"
        description="Find and book independent car rentals nationwide. Cash-friendly options available. Rental owners stay in full control with ZUVIO."
        path="/"
      />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "WebSite",
        "name": "ZUVIO",
        "url": "https://zuvio.us",
        "description": "Find and book independent car rentals nationwide.",
        "potentialAction": {
          "@type": "SearchAction",
          "target": "https://zuvio.us/search?q={search_term_string}",
          "query-input": "required name=search_term_string"
        }
      }) }} />
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
