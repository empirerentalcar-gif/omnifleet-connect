import CityLandingTemplate from "@/components/CityLandingTemplate";

const NewYorkLanding = () => (
  <CityLandingTemplate
    config={{
      slug: "new-york",
      cityName: "New York",
      state: "New York",
      stateAbbr: "NY",
      h1: "Independent Car Rentals in New York — Book Direct, Skip the Big Platforms",
      description: "Find independent car rentals in New York. Book direct from local agencies, cash-friendly options available. No big platform fees with Zuvio.",
      h2s: [
        "Cash-Friendly Car Rentals Available in New York",
        "Skip the Airport Counter — Rent Direct from New York Agencies",
        "New York Car Rental Owners: Grow Your Business with Zuvio",
        "How to Book an Independent Car Rental in New York",
        "Why New Yorkers and Visitors Choose Independent Car Rentals",
        "Sedans, SUVs & Vans Available for Rent in New York",
      ],
    }}
  />
);

export default NewYorkLanding;
