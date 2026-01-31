import Header from "@/components/Header";
import Footer from "@/components/Footer";

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-24">
        <div className="max-w-3xl mx-auto">
          <h1 className="font-display text-4xl md:text-5xl font-bold mb-8">
            Privacy <span className="text-gradient">Policy</span>
          </h1>
          
          <p className="text-muted-foreground mb-8">
            Last updated: [Add Date]
          </p>

          <div className="prose prose-invert max-w-none space-y-8">
            <section>
              <h2 className="font-display text-2xl font-bold text-foreground mb-4">
                1. Information We Collect
              </h2>
              <p className="text-muted-foreground">
                [Add details about personal information collected: name, email, phone, payment info, driver's license, etc.]
              </p>
            </section>

            <section>
              <h2 className="font-display text-2xl font-bold text-foreground mb-4">
                2. How We Use Your Information
              </h2>
              <p className="text-muted-foreground">
                [Add purposes for data collection: booking processing, account management, marketing, analytics, etc.]
              </p>
            </section>

            <section>
              <h2 className="font-display text-2xl font-bold text-foreground mb-4">
                3. Information Sharing
              </h2>
              <p className="text-muted-foreground">
                [Add details about sharing with agencies, payment processors, and third parties.]
              </p>
            </section>

            <section>
              <h2 className="font-display text-2xl font-bold text-foreground mb-4">
                4. Data Security
              </h2>
              <p className="text-muted-foreground">
                [Add security measures: encryption, access controls, compliance certifications.]
              </p>
            </section>

            <section>
              <h2 className="font-display text-2xl font-bold text-foreground mb-4">
                5. Cookies and Tracking
              </h2>
              <p className="text-muted-foreground">
                [Add cookie policy, tracking technologies used, and opt-out options.]
              </p>
            </section>

            <section>
              <h2 className="font-display text-2xl font-bold text-foreground mb-4">
                6. Your Rights
              </h2>
              <p className="text-muted-foreground">
                [Add user rights: access, correction, deletion, portability. Include GDPR/CCPA compliance if applicable.]
              </p>
            </section>

            <section>
              <h2 className="font-display text-2xl font-bold text-foreground mb-4">
                7. Data Retention
              </h2>
              <p className="text-muted-foreground">
                [Add retention periods for different types of data.]
              </p>
            </section>

            <section>
              <h2 className="font-display text-2xl font-bold text-foreground mb-4">
                8. Children's Privacy
              </h2>
              <p className="text-muted-foreground">
                [Add age restrictions and children's privacy protections.]
              </p>
            </section>

            <section>
              <h2 className="font-display text-2xl font-bold text-foreground mb-4">
                9. International Transfers
              </h2>
              <p className="text-muted-foreground">
                [Add information about cross-border data transfers and protections.]
              </p>
            </section>

            <section>
              <h2 className="font-display text-2xl font-bold text-foreground mb-4">
                10. Changes to This Policy
              </h2>
              <p className="text-muted-foreground">
                [Add how users will be notified of policy changes.]
              </p>
            </section>

            <section>
              <h2 className="font-display text-2xl font-bold text-foreground mb-4">
                11. Contact Us
              </h2>
              <p className="text-muted-foreground">
                For privacy-related inquiries, contact our Data Protection Officer at:<br />
                Email: privacy@zuvio.com<br />
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

export default PrivacyPolicy;
