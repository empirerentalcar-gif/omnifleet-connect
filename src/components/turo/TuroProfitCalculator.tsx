import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { ArrowRight, TrendingUp } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

const TuroProfitCalculator = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [pricePerDay, setPricePerDay] = useState(75);
  const [rentalDays, setRentalDays] = useState(3);
  const [bookingsPerMonth, setBookingsPerMonth] = useState(4);

  const monthlyRevenue = pricePerDay * rentalDays * bookingsPerMonth;
  const bookingFee = monthlyRevenue * 0.05;
  const subscriptionCost = 79;
  const netIncome = monthlyRevenue - bookingFee - subscriptionCost;

  return (
    <section className="py-20 md:py-28 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-background via-accent/5 to-background" />
      <div className="container mx-auto px-4 relative max-w-4xl">
        <div className="text-center mb-12">
          <span className="inline-block px-4 py-2 rounded-full bg-accent/10 text-accent text-sm font-medium mb-4">
            {t("turo.calculator.badge")}
          </span>
          <h2 className="font-display text-3xl md:text-5xl font-bold mb-4">
            {t("turo.calculator.title")} <span className="text-gradient">{t("turo.calculator.titleAccent")}</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {t("turo.calculator.subtitle")}
          </p>
        </div>

        <div className="glass-card glow-border rounded-2xl p-8 md:p-10">
          {/* Sliders */}
          <div className="space-y-8 mb-10">
            <div>
              <div className="flex justify-between items-center mb-3">
                <label className="text-foreground font-medium">{t("turo.calculator.pricePerDay")}</label>
                <span className="text-2xl font-bold text-accent">${pricePerDay}</span>
              </div>
              <Slider
                value={[pricePerDay]}
                onValueChange={([v]) => setPricePerDay(v)}
                min={30}
                max={300}
                step={5}
              />
              <div className="flex justify-between text-xs text-muted-foreground mt-1">
                <span>$30</span>
                <span>$300</span>
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-3">
                <label className="text-foreground font-medium">{t("turo.calculator.rentalLength")}</label>
                <span className="text-2xl font-bold text-accent">{rentalDays}</span>
              </div>
              <Slider
                value={[rentalDays]}
                onValueChange={([v]) => setRentalDays(v)}
                min={1}
                max={14}
                step={1}
              />
              <div className="flex justify-between text-xs text-muted-foreground mt-1">
                <span>1 {t("turo.calculator.day")}</span>
                <span>14 {t("turo.calculator.days")}</span>
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-3">
                <label className="text-foreground font-medium">{t("turo.calculator.additionalBookings")}</label>
                <span className="text-2xl font-bold text-accent">{bookingsPerMonth}</span>
              </div>
              <Slider
                value={[bookingsPerMonth]}
                onValueChange={([v]) => setBookingsPerMonth(v)}
                min={1}
                max={15}
                step={1}
              />
              <div className="flex justify-between text-xs text-muted-foreground mt-1">
                <span>1 {t("turo.calculator.booking")}</span>
                <span>15 {t("turo.calculator.bookings")}</span>
              </div>
            </div>
          </div>

          {/* Results */}
          <div className="border-t border-border pt-8 space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">{t("turo.calculator.monthlyRevenue")}</span>
              <span className="text-foreground font-semibold text-lg">${monthlyRevenue.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">{t("turo.calculator.bookingFee")}</span>
              <span className="text-muted-foreground">-${bookingFee.toFixed(0)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">{t("turo.calculator.subscriptionCost")}</span>
              <span className="text-muted-foreground">-$79</span>
            </div>
            <div className="border-t border-border pt-4 flex justify-between items-center">
              <span className="text-foreground font-bold text-lg">{t("turo.calculator.netIncome")}</span>
              <span className={`text-3xl font-bold ${netIncome >= 0 ? "text-accent" : "text-destructive"}`}>
                ${netIncome.toFixed(0)}
              </span>
            </div>
          </div>

          {/* Conversion message */}
          <div className="mt-8 p-4 rounded-xl bg-accent/10 border border-accent/20 text-center">
            <p className="text-foreground font-medium">
              {t("turo.calculator.conversion")}{" "}
              <span className="text-accent font-bold">{t("turo.calculator.conversionAccent")}</span>
            </p>
          </div>

          {/* CTAs */}
          <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
            <Button variant="hero" size="lg" className="group" onClick={() => navigate("/signup")}>
              <TrendingUp className="h-5 w-5" />
              <span>{t("turo.calculator.ctaStart")}</span>
              <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="border-accent/30 hover:bg-accent/10"
              onClick={() => navigate("/signup")}
            >
              {t("turo.calculator.ctaFounding")}
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TuroProfitCalculator;
