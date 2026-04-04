import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Search, MapPin } from "lucide-react";

const RentalCTA = () => {
  return (
    <section className="py-16 px-4" style={{ backgroundColor: "#0f2136" }}>
      <div className="container mx-auto text-center max-w-2xl">
        <h2 className="text-3xl md:text-4xl font-display font-bold text-white mb-4">
          Looking to Rent a Car?
        </h2>
        <p className="text-[#8899aa] text-lg mb-8">
          Search from real independent agencies near you — no big box markup.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button asChild size="lg" className="bg-[#2dd4bf] hover:bg-[#5eead4] text-[#0d1b2e] font-bold">
            <Link to="/search">
              <Search className="mr-2 h-5 w-5" />
              Search Vehicles
            </Link>
          </Button>
          <Button asChild size="lg" className="bg-[#2dd4bf] hover:bg-[#5eead4] text-[#0d1b2e] font-bold">
            <Link to="/cities">
              <MapPin className="mr-2 h-5 w-5" />
              Browse Cities
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default RentalCTA;
