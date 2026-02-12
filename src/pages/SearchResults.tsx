import { useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { MapPin, Phone, Calendar, DollarSign, Car, Filter, Star, ArrowRight, Banknote } from "lucide-react";
import { Button } from "@/components/ui/button";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const vehicleTypes = ["All", "Sedan", "SUV", "Truck", "Van", "Compact", "Luxury"];

const mockAgencies = [
  {
    id: "agency-1",
    name: "Metro Auto Rentals",
    cashAccepted: true,
    startingPrice: 35,
    distance: 1.2,
    rating: 4.8,
    reviews: 124,
    city: "Miami",
    state: "FL",
    phone: "(305) 555-0123",
    vehicleTypes: ["Sedan", "SUV", "Compact"],
    image: "https://images.unsplash.com/photo-1549317661-bd32c8ce0afe?w=400&h=250&fit=crop",
  },
  {
    id: "agency-2",
    name: "SunCoast Car Hire",
    cashAccepted: true,
    startingPrice: 29,
    distance: 2.5,
    rating: 4.6,
    reviews: 89,
    city: "Miami",
    state: "FL",
    phone: "(305) 555-0456",
    vehicleTypes: ["Sedan", "SUV", "Van", "Truck"],
    image: "https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=400&h=250&fit=crop",
  },
  {
    id: "agency-3",
    name: "Downtown Drive",
    cashAccepted: false,
    startingPrice: 42,
    distance: 3.8,
    rating: 4.9,
    reviews: 201,
    city: "Miami",
    state: "FL",
    phone: "(305) 555-0789",
    vehicleTypes: ["Luxury", "SUV", "Sedan"],
    image: "https://images.unsplash.com/photo-1502877338535-766e1452684a?w=400&h=250&fit=crop",
  },
  {
    id: "agency-4",
    name: "EZ Ride Rentals",
    cashAccepted: true,
    startingPrice: 25,
    distance: 5.1,
    rating: 4.4,
    reviews: 56,
    city: "Miami",
    state: "FL",
    phone: "(305) 555-1011",
    vehicleTypes: ["Compact", "Sedan", "Van"],
    image: "https://images.unsplash.com/photo-1489824904134-891ab64532f1?w=400&h=250&fit=crop",
  },
];

const SearchResults = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [location, setLocation] = useState(searchParams.get("location") || "");
  const [pickupDate, setPickupDate] = useState(searchParams.get("pickup") || "");
  const [dropoffDate, setDropoffDate] = useState(searchParams.get("dropoff") || "");
  const [cashOnly, setCashOnly] = useState(false);
  const [vehicleType, setVehicleType] = useState("All");

  const filtered = mockAgencies.filter((a) => {
    if (cashOnly && !a.cashAccepted) return false;
    if (vehicleType !== "All" && !a.vehicleTypes.includes(vehicleType)) return false;
    return true;
  });

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          {/* Search Bar */}
          <div className="glass-card glow-border rounded-2xl p-6 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wider">
                  City / ZIP Code
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-primary" />
                  <input
                    type="text"
                    placeholder="Enter city or ZIP..."
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full bg-secondary/50 border border-border rounded-xl pl-11 pr-4 py-3.5 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wider">
                  Pickup Date
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-primary" />
                  <input
                    type="date"
                    value={pickupDate}
                    onChange={(e) => setPickupDate(e.target.value)}
                    className="w-full bg-secondary/50 border border-border rounded-xl pl-11 pr-4 py-3.5 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wider">
                  Drop-off Date
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-accent" />
                  <input
                    type="date"
                    value={dropoffDate}
                    onChange={(e) => setDropoffDate(e.target.value)}
                    className="w-full bg-secondary/50 border border-border rounded-xl pl-11 pr-4 py-3.5 text-foreground focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent transition-all"
                  />
                </div>
              </div>
              <Button variant="hero" size="lg" className="w-full group">
                <Car className="h-5 w-5" />
                <span>View Available Agencies</span>
                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>

            {/* Filters */}
            <div className="mt-6 pt-6 border-t border-border/50 flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground font-medium">Filters:</span>
              </div>

              <button
                onClick={() => setCashOnly(!cashOnly)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                  cashOnly
                    ? "bg-accent/20 text-accent border border-accent/40"
                    : "bg-secondary/50 text-muted-foreground border border-border hover:border-accent/40"
                }`}
              >
                <Banknote className="h-4 w-4" />
                Cash Accepted
              </button>

              <div className="flex items-center gap-2 flex-wrap">
                {vehicleTypes.map((type) => (
                  <button
                    key={type}
                    onClick={() => setVehicleType(type)}
                    className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                      vehicleType === type
                        ? "bg-primary/20 text-primary border border-primary/40"
                        : "bg-secondary/50 text-muted-foreground border border-border hover:border-primary/40"
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Results Count */}
          <div className="mb-6">
            <h2 className="font-display text-2xl font-bold">
              {filtered.length} {filtered.length === 1 ? "Agency" : "Agencies"} Found
            </h2>
            <p className="text-muted-foreground text-sm mt-1">
              {location ? `Near ${location}` : "Showing all locations"}
            </p>
          </div>

          {/* Agency Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filtered.map((agency) => (
              <div
                key={agency.id}
                className="glass-card glow-border rounded-2xl overflow-hidden group hover:shadow-glow transition-all duration-300"
              >
                <div className="flex flex-col sm:flex-row">
                  <div className="sm:w-48 h-48 sm:h-auto overflow-hidden">
                    <img
                      src={agency.image}
                      alt={agency.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  <div className="flex-1 p-6">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="font-display text-lg font-bold">{agency.name}</h3>
                        <p className="text-sm text-muted-foreground flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {agency.city}, {agency.state} · {agency.distance} mi away
                        </p>
                      </div>
                      {agency.cashAccepted && (
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-accent/15 text-accent text-xs font-semibold border border-accent/30">
                          <Banknote className="h-3 w-3" />
                          Cash OK
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-3 mb-4 text-sm">
                      <span className="flex items-center gap-1 text-yellow-400">
                        <Star className="h-4 w-4 fill-current" />
                        {agency.rating}
                      </span>
                      <span className="text-muted-foreground">({agency.reviews} reviews)</span>
                    </div>

                    <div className="flex items-baseline gap-1 mb-4">
                      <span className="text-sm text-muted-foreground">From</span>
                      <span className="font-display text-2xl font-bold text-primary">
                        ${agency.startingPrice}
                      </span>
                      <span className="text-sm text-muted-foreground">/day</span>
                    </div>

                    <div className="flex flex-wrap gap-2 mb-4">
                      {agency.vehicleTypes.map((vt) => (
                        <span key={vt} className="px-2 py-1 rounded-lg bg-secondary text-xs text-muted-foreground">
                          {vt}
                        </span>
                      ))}
                    </div>

                    <div className="flex gap-3">
                      <Button
                        variant="hero"
                        size="sm"
                        className="flex-1"
                        onClick={() => navigate(`/agency/${agency.id}`)}
                      >
                        Request Reservation
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-accent/30 hover:bg-accent/10"
                        onClick={() => window.open(`tel:${agency.phone.replace(/\D/g, "")}`, "_self")}
                      >
                        <Phone className="h-4 w-4" />
                        Call Now
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filtered.length === 0 && (
            <div className="text-center py-16">
              <Car className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
              <h3 className="font-display text-xl font-bold mb-2">No agencies match your filters</h3>
              <p className="text-muted-foreground">Try adjusting your filters or search a different location.</p>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default SearchResults;
