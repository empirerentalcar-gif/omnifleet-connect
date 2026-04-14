import CityLandingTemplate from "@/components/CityLandingTemplate";

const LosAngelesLanding = () => (
  <CityLandingTemplate
    config={{
      slug: "los-angeles",
      cityName: "Los Angeles",
      state: "California",
      stateAbbr: "CA",
      h1: "Independent Car Rentals in Los Angeles, CA — Book Direct, No Middleman",
      h2s: [
        "Cash-Friendly Car Rentals Near You in Los Angeles",
        "Skip the LAX Counter — Rent Direct from Local LA Agencies",
        "Los Angeles Car Rental Owners: List Your Fleet on Zuvio",
        "How to Book an Independent Car Rental in Los Angeles",
        "Why LA Travelers Book Independent Instead of Big Rental Brands",
        "Find SUVs, Sedans & Luxury Cars for Rent in Los Angeles",
      ],
    }}
  />
);

export default LosAngelesLanding;
