import SEO from "@/components/SEO";

const CancellationPolicy = () => {
  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Cancellation Policy | ZUVIO"
        description="Zuvio's simple, fair cancellation policy. Full refund 48+ hours before pickup. No surprises."
        path="/cancellation-policy"
      />
      <main className="container mx-auto px-4 py-24">
        <div className="max-w-3xl mx-auto">
          <h1 className="font-display text-4xl md:text-5xl font-bold mb-4">
            Zuvio <span className="text-gradient">Cancellation Policy</span>
          </h1>
          <p className="text-muted-foreground mb-10">Last updated: April 24, 2026</p>

          <p className="text-muted-foreground mb-10 text-lg">
            Changed your mind? No problem — here's how it works:
          </p>

          <div className="space-y-10">
            <section>
              <h2 className="font-display text-2xl font-bold text-foreground mb-3">
                Cancel 48 hours or more before your pickup — You get ALL your money back. 💚
              </h2>
              <p className="text-muted-foreground">
                Life happens. If you cancel at least 2 days before you were supposed to pick up the car, we will give you every single dollar back. No questions asked.
              </p>
            </section>

            <section>
              <h2 className="font-display text-2xl font-bold text-foreground mb-3">
                Cancel less than 48 hours before your pickup — No refund. ❌
              </h2>
              <p className="text-muted-foreground">
                When you cancel this close to pickup day, the agency has already turned away other customers who wanted that car. Because of that we are not able to give your money back if you cancel within 48 hours of your scheduled pickup.
              </p>
            </section>

            <section>
              <h2 className="font-display text-2xl font-bold text-foreground mb-3">
                Didn't show up? — No refund. ❌
              </h2>
              <p className="text-muted-foreground">
                If you don't show up within 2 hours of your pickup time and didn't cancel, the booking is gone and no refund will be issued.
              </p>
            </section>

            <section>
              <h2 className="font-display text-2xl font-bold text-foreground mb-3">
                Flight delayed or something unexpected happened?
              </h2>
              <p className="text-muted-foreground">
                Reach out to us right away at{" "}
                <a href="mailto:team@zuvio.us" className="text-primary hover:text-primary/80 underline">
                  team@zuvio.us
                </a>{" "}
                or{" "}
                <a href="tel:+17252392300" className="text-primary hover:text-primary/80 underline">
                  (725) 239-2300
                </a>
                . We will do our best to work something out with the agency.
              </p>
            </section>

            <section>
              <h2 className="font-display text-2xl font-bold text-foreground mb-3">
                What if the AGENCY cancels on you?
              </h2>
              <p className="text-muted-foreground">
                That should never happen — but if it does, you get every single dollar back automatically. Every time. No fighting for it.
              </p>
            </section>

            <section>
              <h2 className="font-display text-2xl font-bold text-foreground mb-3">
                When does my money come back?
              </h2>
              <p className="text-muted-foreground">
                Within 5–7 business days back to the card you used to book.
              </p>
            </section>
          </div>

          <p className="text-foreground font-medium mt-12 pt-8 border-t border-border">
            Simple. Fair. No surprises. Questions? Email{" "}
            <a href="mailto:team@zuvio.us" className="text-primary hover:text-primary/80 underline">
              team@zuvio.us
            </a>{" "}
            or call{" "}
            <a href="tel:+17252392300" className="text-primary hover:text-primary/80 underline">
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
