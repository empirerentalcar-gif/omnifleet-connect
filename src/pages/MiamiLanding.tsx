import CityLandingTemplate from "@/components/CityLandingTemplate";

const MiamiLanding = () => (
  <CityLandingTemplate
    config={{
      slug: "miami",
      cityName: "Miami",
      state: "Florida",
      stateAbbr: "FL",
      h1: "Independent Car Rentals in Miami, FL — Book Direct from Local Agencies",
      description: "Find independent car rentals in Miami, FL. Book direct from local agencies, cash-friendly options available. Skip the airport counter markups.",
      h2s: [
        "Cash-Friendly Car Rentals Near You in Miami",
        "Skip Miami Airport Rental Counters — Rent from Local Agencies",
        "Miami Car Rental Owners: List Your Fleet & Get More Bookings",
        "How to Book an Independent Car Rental in Miami, FL",
        "Why Miami Visitors Rent from Independent Agencies",
        "Find Convertibles, SUVs & Sedans for Rent in Miami",
      ],
    }}
  />
);

export default MiamiLanding;
