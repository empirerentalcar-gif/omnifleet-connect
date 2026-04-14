import CityLandingTemplate from "@/components/CityLandingTemplate";

const HoustonLanding = () => (
  <CityLandingTemplate
    config={{
      slug: "houston",
      cityName: "Houston",
      state: "Texas",
      stateAbbr: "TX",
      h1: "Independent Car Rentals in Houston, TX — Rent Direct from Local Agencies",
      h2s: [
        "Cash-Friendly Car Rentals Available in Houston",
        "Skip the Big Rental Brands — Book Direct in Houston",
        "Houston Car Rental Owners: Get More Bookings with Zuvio",
        "How to Book an Independent Car Rental in Houston, TX",
        "Why Houston Residents Choose Independent Car Rentals",
        "Sedans, Trucks & SUVs Available for Rent in Houston",
      ],
    }}
  />
);

export default HoustonLanding;
