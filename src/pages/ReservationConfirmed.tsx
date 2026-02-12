import { useSearchParams, useNavigate } from "react-router-dom";
import { CheckCircle, Phone, Mail, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const ReservationConfirmed = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const agencyName = searchParams.get("agency") || "the Agency";

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-xl">
          <div className="glass-card glow-border rounded-2xl p-8 md:p-12 text-center animate-slide-up">
            <div className="w-20 h-20 rounded-full bg-accent/15 flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="h-10 w-10 text-accent" />
            </div>

            <h1 className="font-display text-3xl md:text-4xl font-bold mb-4">Request Sent!</h1>

            <p className="text-lg text-muted-foreground mb-8">
              Your reservation request has been sent to{" "}
              <span className="text-primary font-semibold">{agencyName}</span>.
              They will contact you directly to confirm availability and finalize your booking.
            </p>

            <div className="glass-card rounded-xl p-6 mb-8 text-left space-y-4">
              <h3 className="font-display font-bold text-sm uppercase tracking-wider text-muted-foreground">What happens next?</h3>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-primary/20 text-primary text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">1</span>
                  <p className="text-sm text-muted-foreground">The agency reviews your request and checks availability.</p>
                </div>
                <div className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-primary/20 text-primary text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">2</span>
                  <p className="text-sm text-muted-foreground">You'll receive a call or email confirming your reservation.</p>
                </div>
                <div className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-primary/20 text-primary text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">3</span>
                  <p className="text-sm text-muted-foreground">Show up with required documents and enjoy your ride!</p>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                variant="hero"
                size="lg"
                className="flex-1 group"
                onClick={() => navigate("/")}
              >
                Back to Home
                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="flex-1 border-accent/30 hover:bg-accent/10"
                onClick={() => navigate("/search")}
              >
                Search More Agencies
              </Button>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ReservationConfirmed;
