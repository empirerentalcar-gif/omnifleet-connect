import { useState } from "react";
import { MapPin, Calendar, ArrowRight, Car } from "lucide-react";
import { Button } from "@/components/ui/button";

const locations = [
  "New York, NY",
  "Los Angeles, CA",
  "Chicago, IL",
  "Houston, TX",
  "Phoenix, AZ",
  "Miami, FL",
  "San Francisco, CA",
  "Seattle, WA",
  "Denver, CO",
  "Boston, MA",
];

const SearchPanel = () => {
  const [pickupLocation, setPickupLocation] = useState("");
  const [dropoffLocation, setDropoffLocation] = useState("");
  const [pickupDate, setPickupDate] = useState("");
  const [dropoffDate, setDropoffDate] = useState("");
  const [showPickupSuggestions, setShowPickupSuggestions] = useState(false);
  const [showDropoffSuggestions, setShowDropoffSuggestions] = useState(false);

  const filteredPickupLocations = locations.filter((loc) =>
    loc.toLowerCase().includes(pickupLocation.toLowerCase())
  );

  const filteredDropoffLocations = locations.filter((loc) =>
    loc.toLowerCase().includes(dropoffLocation.toLowerCase())
  );

  return (
    <div className="glass-card glow-border rounded-2xl p-6 md:p-8 w-full max-w-5xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
        {/* Pickup Location */}
        <div className="lg:col-span-1 relative">
          <label className="block text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wider">
            Pickup Location
          </label>
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-primary" />
            <input
              type="text"
              placeholder="Enter city..."
              value={pickupLocation}
              onChange={(e) => setPickupLocation(e.target.value)}
              onFocus={() => setShowPickupSuggestions(true)}
              onBlur={() => setTimeout(() => setShowPickupSuggestions(false), 200)}
              className="w-full bg-secondary/50 border border-border rounded-xl pl-11 pr-4 py-3.5 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
            />
            {showPickupSuggestions && pickupLocation && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-popover border border-border rounded-xl shadow-card z-50 overflow-hidden">
                {filteredPickupLocations.slice(0, 5).map((loc) => (
                  <button
                    key={loc}
                    onClick={() => {
                      setPickupLocation(loc);
                      setShowPickupSuggestions(false);
                    }}
                    className="w-full px-4 py-3 text-left hover:bg-secondary transition-colors flex items-center gap-3"
                  >
                    <MapPin className="h-4 w-4 text-primary" />
                    <span>{loc}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Drop-off Location */}
        <div className="lg:col-span-1 relative">
          <label className="block text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wider">
            Drop-off Location
          </label>
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-accent" />
            <input
              type="text"
              placeholder="Same as pickup"
              value={dropoffLocation}
              onChange={(e) => setDropoffLocation(e.target.value)}
              onFocus={() => setShowDropoffSuggestions(true)}
              onBlur={() => setTimeout(() => setShowDropoffSuggestions(false), 200)}
              className="w-full bg-secondary/50 border border-border rounded-xl pl-11 pr-4 py-3.5 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent transition-all"
            />
            {showDropoffSuggestions && dropoffLocation && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-popover border border-border rounded-xl shadow-card z-50 overflow-hidden">
                {filteredDropoffLocations.slice(0, 5).map((loc) => (
                  <button
                    key={loc}
                    onClick={() => {
                      setDropoffLocation(loc);
                      setShowDropoffSuggestions(false);
                    }}
                    className="w-full px-4 py-3 text-left hover:bg-secondary transition-colors flex items-center gap-3"
                  >
                    <MapPin className="h-4 w-4 text-accent" />
                    <span>{loc}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Pickup Date */}
        <div className="lg:col-span-1">
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

        {/* Drop-off Date */}
        <div className="lg:col-span-1">
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

        {/* Search Button */}
        <div className="lg:col-span-1">
          <Button variant="hero" size="lg" className="w-full group">
            <Car className="h-5 w-5" />
            <span>Search</span>
            <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="mt-6 pt-6 border-t border-border/50 flex flex-wrap justify-center gap-8 text-sm">
        <div className="flex items-center gap-2">
          <span className="text-primary font-bold">2,500+</span>
          <span className="text-muted-foreground">Partner Agencies</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-accent font-bold">50,000+</span>
          <span className="text-muted-foreground">Available Vehicles</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-primary font-bold">150+</span>
          <span className="text-muted-foreground">Cities Worldwide</span>
        </div>
      </div>
    </div>
  );
};

export default SearchPanel;
