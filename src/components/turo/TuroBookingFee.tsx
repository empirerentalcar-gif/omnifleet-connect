import { Ban, ShieldCheck } from "lucide-react";
import { useTranslation } from "react-i18next";

const TuroBookingFee = () => {
  const { t } = useTranslation();
  return (
  <section className="py-20 md:py-28 relative overflow-hidden">
    <div className="absolute inset-0 bg-gradient-to-b from-background via-primary/5 to-background" />
    <div className="container mx-auto px-4 relative max-w-3xl text-center">
      <h2 className="font-display text-3xl md:text-4xl font-bold mb-6">
        {t("turo.bookingFee.title")} <span className="text-gradient">{t("turo.bookingFee.titleAccent")}</span>
      </h2>
      <p className="text-lg text-muted-foreground mb-4">
        {t("turo.bookingFee.body")}
      </p>
      <p className="text-xl font-bold text-foreground mb-8">
        {t("turo.bookingFee.footer")} <span className="text-accent">{t("turo.bookingFee.footerAccent")}</span>
      </p>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-6 text-sm text-muted-foreground mb-4">
        <div className="flex items-center gap-2">
          <Ban className="h-4 w-4 text-accent" />
          {t("turo.bookingFee.noSetup")}
        </div>
        <div className="flex items-center gap-2">
          <Ban className="h-4 w-4 text-accent" />
          {t("turo.bookingFee.noLongContracts")}
        </div>
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 text-accent" />
          {t("turo.bookingFee.cancelAnytime")}
        </div>
      </div>
    </div>
  </section>
  );
};

export default TuroBookingFee;
