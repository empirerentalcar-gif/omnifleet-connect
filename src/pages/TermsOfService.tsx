import Header from "@/components/Header";
import Footer from "@/components/Footer";

const TermsOfService = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-24">
        <div className="max-w-3xl mx-auto">
          <h1 className="font-display text-4xl md:text-5xl font-bold mb-8">
            Terms of <span className="text-gradient">Service</span>
          </h1>
          
          <p className="text-muted-foreground mb-8">
            Last updated: [Add Date]
          </p>

          <div className="prose prose-invert max-w-none space-y-8">
            <section>
              <h2 className="font-display text-2xl font-bold text-foreground mb-4">
                1. Acceptance of Terms
              </h2>
              <p className="text-muted-foreground">
                [Add terms acceptance language here. Include agreement to be bound by terms, eligibility requirements, etc.]
              </p>
            </section>

            <section>
              <h2 className="font-display text-2xl font-bold text-foreground mb-4">
                2. Description of Service
              </h2>
              <p className="text-muted-foreground">
                [Add description of Zuvio's services, platform functionality, and scope of offerings.]
              </p>
            </section>

            <section>
              <h2 className="font-display text-2xl font-bold text-foreground mb-4">
                3. User Accounts
              </h2>
              <p className="text-muted-foreground">
                [Add account registration requirements, responsibilities, and security obligations.]
              </p>
            </section>

            <section>
              <h2 className="font-display text-2xl font-bold text-foreground mb-4">
                4. Agency Terms
              </h2>
              <p className="text-muted-foreground">
                [Add specific terms for rental agencies, including listing requirements, verification, and obligations.]
              </p>
            </section>

            <section>
              <h2 className="font-display text-2xl font-bold text-foreground mb-4">
                5. Rental Agreements
              </h2>
              <p className="text-muted-foreground">
                [Add terms regarding rental contracts, liability, insurance requirements, and dispute resolution.]
              </p>
            </section>

            <section>
              <h2 className="font-display text-2xl font-bold text-foreground mb-4">
                6. Payment Terms
              </h2>
              <p className="text-muted-foreground">
                [Add payment processing terms, fees, refund policies, and payout schedules for agencies.]
              </p>
            </section>

            <section>
              <h2 className="font-display text-2xl font-bold text-foreground mb-4">
                7. Prohibited Activities
              </h2>
              <p className="text-muted-foreground">
                [Add list of prohibited uses, fraudulent activities, and enforcement measures.]
              </p>
            </section>

            <section>
              <h2 className="font-display text-2xl font-bold text-foreground mb-4">
                8. Intellectual Property
              </h2>
              <p className="text-muted-foreground">
                [Add IP rights, trademarks, user content licensing, and restrictions.]
              </p>
            </section>

            <section>
              <h2 className="font-display text-2xl font-bold text-foreground mb-4">
                9. Limitation of Liability
              </h2>
              <p className="text-muted-foreground">
                [Add liability limitations, disclaimers, and indemnification clauses.]
              </p>
            </section>

            <section>
              <h2 className="font-display text-2xl font-bold text-foreground mb-4">
                10. Governing Law
              </h2>
              <p className="text-muted-foreground">
                [Add jurisdiction, governing law, and dispute resolution procedures.]
              </p>
            </section>

            <section>
              <h2 className="font-display text-2xl font-bold text-foreground mb-4">
                11. Contact Information
              </h2>
              <p className="text-muted-foreground">
                For questions about these Terms, contact us at:<br />
                Email: legal@zuvio.com<br />
                Address: [Add Address]
              </p>
            </section>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default TermsOfService;
