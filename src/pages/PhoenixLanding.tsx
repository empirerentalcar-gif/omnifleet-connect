import CityLandingTemplate from "@/components/CityLandingTemplate";

const PhoenixLanding = () => (
  <CityLandingTemplate
    config={{
      slug: "phoenix",
      cityName: "Phoenix",
      state: "Arizona",
      stateAbbr: "AZ",
      h1: "Independent Car Rentals in Phoenix, AZ — Book Direct from Local Agencies",
      description: "Find independent car rentals in Phoenix, AZ. Book direct from local agencies, cash-friendly options available. Skip the big brands with Zuvio.",
      h2s: [
        "Cash-Friendly Car Rentals Available in Phoenix",
        "Skip the Big Brands — Rent Direct from Phoenix-Based Agencies",
        "Phoenix Car Rental Owners: Grow Your Business with Zuvio",
        "How to Book an Independent Car Rental in Phoenix",
        "Why Phoenix Drivers Choose Independent Car Rentals",
        "Find Sedans, SUVs & Trucks for Rent in Phoenix, AZ",
      ],
    }}
  />
);

export default PhoenixLanding;
