import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Search, MapPin } from "lucide-react";
import { useTranslation } from "react-i18next";

const RentalCTA = () => {
  const { t } = useTranslation();
  return (
    <section className="py-16 px-4" style={{ backgroundColor: "#0f2136" }}>
      <div className="container mx-auto text-center max-w-2xl">
        <h2 className="text-3xl md:text-4xl font-display font-bold text-white mb-4">
          {t("rentalCta.title")}
        </h2>
        <p className="text-[#8899aa] text-lg mb-8">
          {t("rentalCta.subtitle")}
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button asChild size="lg" className="bg-[#2dd4bf] hover:bg-[#5eead4] text-[#0d1b2e] font-bold">
            <Link to="/search">
              <Search className="mr-2 h-5 w-5" />
              {t("rentalCta.searchVehicles")}
            </Link>
          </Button>
          <Button asChild size="lg" className="bg-[#2dd4bf] hover:bg-[#5eead4] text-[#0d1b2e] font-bold">
            <Link to="/cities">
              <MapPin className="mr-2 h-5 w-5" />
              {t("rentalCta.browseCities")}
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default RentalCTA;
