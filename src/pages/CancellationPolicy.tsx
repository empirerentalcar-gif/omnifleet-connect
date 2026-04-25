import SEO from "@/components/SEO";

const CancellationPolicy = () => {
  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Cancellation Policy | ZUVIO"
        description="Zuvio's simple, fair cancellation policy. Full refund 48+ hours before pickup. No surprises."
        path="/cancellation-policy"
      />
      <main className="container mx-auto px-4 sm:px-6 pt-16 pb-20 sm:pt-20 sm:pb-24 md:pt-24">
        <div className="max-w-3xl mx-auto">
          <h1 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold leading-tight mb-3 sm:mb-4">
            Zuvio <span className="text-gradient">Cancellation Policy</span>
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground mb-6 sm:mb-8">
            Last updated: April 24, 2026
          </p>

          <p className="text-base sm:text-lg text-muted-foreground mb-8 sm:mb-10 leading-relaxed">
            Changed your mind? No problem — here's how it works:
          </p>

          <div className="space-y-8 sm:space-y-10">
            <section>
              <h2 className="font-display text-xl sm:text-2xl font-bold text-foreground mb-2 sm:mb-3 leading-snug">
                Cancel 48 hours or more before your pickup — You get ALL your money back. 💚
              </h2>
              <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                Life happens. If you cancel at least 2 days before you were supposed to pick up the car, we will give you every single dollar back. No questions asked.
              </p>
            </section>

            <section>
              <h2 className="font-display text-xl sm:text-2xl font-bold text-foreground mb-2 sm:mb-3 leading-snug">
                Cancel less than 48 hours before your pickup — No refund. ❌
              </h2>
              <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                When you cancel this close to pickup day, the agency has already turned away other customers who wanted that car. Because of that we are not able to give your money back if you cancel within 48 hours of your scheduled pickup.
              </p>
            </section>

            <section>
              <h2 className="font-display text-xl sm:text-2xl font-bold text-foreground mb-2 sm:mb-3 leading-snug">
                Didn't show up? — No refund. ❌
              </h2>
              <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                If you don't show up within 2 hours of your pickup time and didn't cancel, the booking is gone and no refund will be issued.
              </p>
            </section>

            <section>
              <h2 className="font-display text-xl sm:text-2xl font-bold text-foreground mb-2 sm:mb-3 leading-snug">
                Flight delayed or something unexpected happened?
              </h2>
              <p className="text-sm sm:text-base text-muted-foreground leading-relaxed break-words">
                Reach out to us right away at{" "}
                <a href="mailto:team@zuvio.us" className="text-primary hover:text-primary/80 underline break-all">
                  team@zuvio.us
                </a>{" "}
                or{" "}
                <a href="tel:+17252392300" className="text-primary hover:text-primary/80 underline whitespace-nowrap">
                  (725) 239-2300
                </a>
                . We will do our best to work something out with the agency.
              </p>
            </section>

            <section>
              <h2 className="font-display text-xl sm:text-2xl font-bold text-foreground mb-2 sm:mb-3 leading-snug">
                What if the AGENCY cancels on you?
              </h2>
              <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                That should never happen — but if it does, you get every single dollar back automatically. Every time. No fighting for it.
              </p>
            </section>

            <section>
              <h2 className="font-display text-xl sm:text-2xl font-bold text-foreground mb-2 sm:mb-3 leading-snug">
                When does my money come back?
              </h2>
              <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                Within 5–7 business days back to the card you used to book.
              </p>
            </section>
          </div>

          <p className="text-sm sm:text-base text-foreground font-medium mt-10 sm:mt-12 pt-6 sm:pt-8 border-t border-border leading-relaxed break-words">
            Simple. Fair. No surprises. Questions? Email{" "}
            <a href="mailto:team@zuvio.us" className="text-primary hover:text-primary/80 underline break-all">
              team@zuvio.us
            </a>{" "}
            or call{" "}
            <a href="tel:+17252392300" className="text-primary hover:text-primary/80 underline whitespace-nowrap">
              (725) 239-2300
            </a>
            .
          </p>
        </div>
      </main>
    </div>
  );
};

export default CancellationPolicy;
