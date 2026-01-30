import { MapPin, Clock, Car, Star } from "lucide-react";

interface LocationCardProps {
  city: string;
  country: string;
  agencies: number;
  vehicles: number;
  rating: number;
  imageUrl: string;
}

const LocationCard = ({ city, country, agencies, vehicles, rating, imageUrl }: LocationCardProps) => {
  return (
    <div className="group relative glass-card glow-border rounded-2xl overflow-hidden cursor-pointer hover:scale-[1.02] transition-all duration-500">
      {/* Image */}
      <div className="relative h-48 overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center group-hover:scale-110 transition-transform duration-700"
          style={{ backgroundImage: `url(${imageUrl})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
        
        {/* Rating Badge */}
        <div className="absolute top-4 right-4 flex items-center gap-1 glass-card rounded-full px-3 py-1.5">
          <Star className="h-4 w-4 text-accent fill-accent" />
          <span className="text-sm font-semibold">{rating}</span>
        </div>
      </div>

      {/* Content */}
      <div className="p-5">
        <h3 className="font-display text-xl font-bold mb-1">{city}</h3>
        <p className="text-sm text-muted-foreground mb-4">{country}</p>

        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-primary" />
            <span className="text-muted-foreground">{agencies} agencies</span>
          </div>
          <div className="flex items-center gap-2">
            <Car className="h-4 w-4 text-accent" />
            <span className="text-muted-foreground">{vehicles.toLocaleString()}+ cars</span>
          </div>
        </div>
      </div>

      {/* Hover Overlay */}
      <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
    </div>
  );
};

const popularLocations = [
  {
    city: "New York",
    country: "United States",
    agencies: 45,
    vehicles: 3200,
    rating: 4.8,
    imageUrl: "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=800&q=80"
  },
  {
    city: "Los Angeles",
    country: "United States",
    agencies: 52,
    vehicles: 4100,
    rating: 4.7,
    imageUrl: "https://images.unsplash.com/photo-1515896769750-31548aa180ed?w=800&q=80"
  },
  {
    city: "Miami",
    country: "United States",
    agencies: 38,
    vehicles: 2800,
    rating: 4.9,
    imageUrl: "https://images.unsplash.com/photo-1533106497176-45ae19e68ba2?w=800&q=80"
  },
  {
    city: "London",
    country: "United Kingdom",
    agencies: 61,
    vehicles: 5200,
    rating: 4.6,
    imageUrl: "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=800&q=80"
  },
  {
    city: "Paris",
    country: "France",
    agencies: 43,
    vehicles: 3600,
    rating: 4.7,
    imageUrl: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800&q=80"
  },
  {
    city: "Dubai",
    country: "United Arab Emirates",
    agencies: 29,
    vehicles: 2100,
    rating: 4.9,
    imageUrl: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800&q=80"
  },
];

const PopularLocations = () => {
  return (
    <section className="py-20 md:py-32 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-secondary/20 to-background" />

      <div className="container mx-auto px-4 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 glass-card rounded-full px-4 py-2 mb-6">
            <Clock className="h-4 w-4 text-primary" />
            <span className="text-sm text-muted-foreground">Real-time availability</span>
          </div>
          
          <h2 className="font-display text-3xl md:text-5xl font-bold mb-4">
            Popular <span className="text-gradient">Destinations</span>
          </h2>
          
          <p className="text-lg text-muted-foreground max-w-xl mx-auto">
            Explore our most booked locations with guaranteed availability and instant confirmation
          </p>
        </div>

        {/* Locations Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {popularLocations.map((location) => (
            <LocationCard key={location.city} {...location} />
          ))}
        </div>

        {/* View All Link */}
        <div className="text-center mt-12">
          <button className="text-primary hover:text-accent transition-colors font-medium inline-flex items-center gap-2 group">
            View all 150+ locations
            <span className="group-hover:translate-x-1 transition-transform">→</span>
          </button>
        </div>
      </div>
    </section>
  );
};

export default PopularLocations;
