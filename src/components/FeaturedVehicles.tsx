import { Car, Zap, Shield, Clock, Gauge, Users } from "lucide-react";

interface VehicleCardProps {
  name: string;
  category: string;
  price: number;
  imageUrl: string;
  features: string[];
  available: boolean;
  rating: number;
}

const VehicleCard = ({ name, category, price, imageUrl, features, available, rating }: VehicleCardProps) => {
  return (
    <div className="group glass-card glow-border rounded-2xl overflow-hidden hover:shadow-glow transition-all duration-500">
      {/* Image Container */}
      <div className="relative h-56 overflow-hidden bg-gradient-to-br from-secondary to-muted">
        <img 
          src={imageUrl} 
          alt={name}
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700"
        />
        
        {/* Availability Badge */}
        <div className={`absolute top-4 left-4 flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold ${
          available 
            ? 'bg-accent/20 text-accent border border-accent/30' 
            : 'bg-destructive/20 text-destructive border border-destructive/30'
        }`}>
          <span className={`w-2 h-2 rounded-full ${available ? 'bg-accent animate-pulse' : 'bg-destructive'}`} />
          {available ? 'Available Now' : 'Booked'}
        </div>

        {/* Category Badge */}
        <div className="absolute top-4 right-4 glass-card rounded-full px-3 py-1.5 text-xs font-medium">
          {category}
        </div>
      </div>

      {/* Content */}
      <div className="p-5">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="font-display text-lg font-bold mb-1">{name}</h3>
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <span className="text-accent">★</span>
              <span>{rating}</span>
              <span className="mx-1">•</span>
              <span>124 reviews</span>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-primary">${price}</div>
            <div className="text-xs text-muted-foreground">per day</div>
          </div>
        </div>

        {/* Features */}
        <div className="flex flex-wrap gap-2 mb-5">
          {features.map((feature) => (
            <span key={feature} className="text-xs bg-secondary px-2.5 py-1 rounded-lg text-muted-foreground">
              {feature}
            </span>
          ))}
        </div>

        {/* Action */}
        <button className="w-full bg-gradient-primary text-primary-foreground font-semibold py-3 rounded-xl hover:opacity-90 transition-opacity flex items-center justify-center gap-2 group">
          <span>View Details</span>
          <span className="group-hover:translate-x-1 transition-transform">→</span>
        </button>
      </div>
    </div>
  );
};

const vehicles = [
  {
    name: "Tesla Model 3",
    category: "Electric",
    price: 89,
    imageUrl: "https://images.unsplash.com/photo-1560958089-b8a1929cea89?w=800&q=80",
    features: ["Autopilot", "400mi Range", "Fast Charge"],
    available: true,
    rating: 4.9
  },
  {
    name: "BMW X5",
    category: "SUV",
    price: 125,
    imageUrl: "https://images.unsplash.com/photo-1555215695-3004980ad54e?w=800&q=80",
    features: ["AWD", "7 Seats", "Panoramic Roof"],
    available: true,
    rating: 4.8
  },
  {
    name: "Mercedes C-Class",
    category: "Luxury",
    price: 110,
    imageUrl: "https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=800&q=80",
    features: ["Leather", "Navigation", "Premium Audio"],
    available: false,
    rating: 4.7
  },
  {
    name: "Porsche 911",
    category: "Sports",
    price: 299,
    imageUrl: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800&q=80",
    features: ["385 HP", "Sport Mode", "Convertible"],
    available: true,
    rating: 4.9
  }
];

const FeaturedVehicles = () => {
  return (
    <section className="py-20 md:py-32 relative">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-16">
          <div>
            <div className="inline-flex items-center gap-2 glass-card rounded-full px-4 py-2 mb-6">
              <Zap className="h-4 w-4 text-accent" />
              <span className="text-sm text-muted-foreground">Updated in real-time</span>
            </div>
            
            <h2 className="font-display text-3xl md:text-5xl font-bold mb-4">
              Featured <span className="text-gradient">Vehicles</span>
            </h2>
            
            <p className="text-lg text-muted-foreground max-w-xl">
              Top-rated vehicles from verified agencies with instant booking
            </p>
          </div>

          {/* Category Filters */}
          <div className="flex flex-wrap gap-2">
            {['All', 'Electric', 'SUV', 'Luxury', 'Sports', 'Economy'].map((cat, i) => (
              <button
                key={cat}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                  i === 0 
                    ? 'bg-primary text-primary-foreground' 
                    : 'bg-secondary text-muted-foreground hover:text-foreground'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Vehicles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {vehicles.map((vehicle) => (
            <VehicleCard key={vehicle.name} {...vehicle} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturedVehicles;
