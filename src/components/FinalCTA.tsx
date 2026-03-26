import { Button } from "@/components/ui/button";
import { ArrowRight, Building2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

const FinalCTA = () => {
  const navigate = useNavigate();

  return (
    <section className="py-20 md:py-28 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-primary/15 via-accent/10 to-primary/15" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-primary/10 rounded-full blur-3xl" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="font-display text-3xl md:text-5xl font-bold mb-6 leading-tight">
            Start Turning Your Vehicles Into{" "}
            <span className="text-gradient">Income</span>
          </h2>

          <p className="text-lg text-muted-foreground mb-10 max-w-2xl mx-auto">
            Stop relying on platforms that control your business. Start building one you control.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              variant="hero"
              size="lg"
              className="group text-base"
              onClick={() => navigate("/pricing")}
            >
              <Building2 className="h-5 w-5" />
              <span>List My Rental Business</span>
              <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="text-base border-accent/30 hover:bg-accent/10"
              onClick={() => navigate("/signup")}
            >
              <span>Start Getting Customers</span>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FinalCTA;
