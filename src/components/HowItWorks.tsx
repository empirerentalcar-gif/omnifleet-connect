import { UserCheck, Car, CalendarCheck, ThumbsUp, Banknote, Search, MapPin, Phone, ShieldCheck } from "lucide-react";
import { useTranslation } from "react-i18next";

const ownerIcons = [UserCheck, Car, CalendarCheck, ThumbsUp, Banknote];
const renterIcons = [Search, MapPin, Phone];

const HowItWorks = () => {
  const { t } = useTranslation();
  const ownerSteps = t("home.howItWorks.ownerSteps", { returnObjects: true }) as string[];
  const renterSteps = t("home.howItWorks.renterSteps", { returnObjects: true }) as string[];

  return (
    <section id="how-it-works" className="py-20 md:py-32 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-border to-transparent" />
      <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-border to-transparent" />
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="font-display text-3xl md:text-5xl font-bold mb-4">
            {t("home.howItWorks.title")} <span className="text-gradient">{t("home.howItWorks.titleAccent")}</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto">{t("home.howItWorks.subtitle")}</p>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
          <div className="glass-card glow-border rounded-2xl p-8 md:p-10">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 text-accent text-sm font-semibold mb-8">
              <ShieldCheck className="h-4 w-4" />{t("home.howItWorks.forOwners")}
            </div>
            <div className="space-y-5">
              {ownerSteps.map((step, i) => {
                const Icon = ownerIcons[i];
                return (
                  <div key={i} className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center shrink-0">
                      <Icon className="h-5 w-5 text-accent" />
                    </div>
                    <div className="pt-2"><p className="text-foreground font-medium">{step}</p></div>
                  </div>
                );
              })}
            </div>
            <p className="mt-8 text-muted-foreground italic text-sm border-t border-border/50 pt-6">{t("home.howItWorks.ownerFooter")}</p>
          </div>
          <div className="glass-card rounded-2xl p-8 md:p-10">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-semibold mb-8">
              <Search className="h-4 w-4" />{t("home.howItWorks.forRenters")}
            </div>
            <div className="space-y-5">
              {renterSteps.map((step, i) => {
                const Icon = renterIcons[i];
                return (
                  <div key={i} className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                      <Icon className="h-5 w-5 text-primary" />
                    </div>
                    <div className="pt-2"><p className="text-foreground font-medium">{step}</p></div>
                  </div>
                );
              })}
            </div>
            <p className="mt-8 text-muted-foreground italic text-sm border-t border-border/50 pt-6">{t("home.howItWorks.renterFooter")}</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
