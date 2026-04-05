import SEO from "@/components/SEO";

const TermsOfService = () => {
  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Terms of Service | ZUVIO"
        description="Review ZUVIO's terms of service for renters and independent car rental agencies."
        path="/terms"
      />
      <main className="container mx-auto px-4 py-24">
        <div className="max-w-3xl mx-auto">
          <h1 className="font-display text-4xl md:text-5xl font-bold mb-8">
            Terms of <span className="text-gradient">Service</span>
          </h1>

          <p className="text-muted-foreground mb-4">
            Last updated: April 4, 2026
          </p>

          <p className="text-muted-foreground mb-8">
            Welcome to Zuvio. Please read these Terms of Service carefully before using our platform. By accessing or using www.zuvio.us, you agree to be bound by these terms.
          </p>

          <div className="prose prose-invert max-w-none space-y-8">
            <section>
              <h2 className="font-display text-2xl font-bold text-foreground mb-4">
                1. Acceptance of Terms
              </h2>
              <p className="text-muted-foreground mb-3">
                By accessing or using the Zuvio platform, you confirm that you are at least 18 years of age, that you have read and understood these Terms, and that you agree to be legally bound by them. If you do not agree to these Terms, do not use Zuvio.
              </p>
              <p className="text-muted-foreground">
                These Terms apply to all users of the platform, including renters, rental agency owners, and visitors. Zuvio reserves the right to update these Terms at any time. Continued use of the platform after changes are posted constitutes your acceptance of the revised Terms.
              </p>
            </section>

            <section>
              <h2 className="font-display text-2xl font-bold text-foreground mb-4">
                2. Description of Service
              </h2>
              <p className="text-muted-foreground mb-3">
                Zuvio is an online marketplace that connects renters with independent car rental agencies across the United States. Zuvio provides the technology platform, search tools, and reservation system that allow renters to discover and book vehicles from participating agencies.
              </p>
              <p className="text-muted-foreground">
                Zuvio is not a car rental company. We do not own, operate, or control any of the vehicles listed on our platform. Each rental transaction is a direct agreement between the renter and the independent agency. Zuvio acts solely as the connecting platform.
              </p>
            </section>

            <section>
              <h2 className="font-display text-2xl font-bold text-foreground mb-4">
                3. User Accounts
              </h2>
              <p className="text-muted-foreground mb-3">
                To access certain features of Zuvio, you may be required to create an account. You agree to:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2">
                <li>Provide accurate, current, and complete information during registration</li>
                <li>Keep your password confidential and not share it with others</li>
                <li>Notify us immediately at <a href="mailto:team@zuvio.us" className="text-primary hover:text-primary/80 underline">team@zuvio.us</a> if you suspect unauthorized access to your account</li>
                <li>Take responsibility for all activity that occurs under your account</li>
              </ul>
              <p className="text-muted-foreground mt-3">
                Zuvio reserves the right to suspend or terminate accounts that violate these Terms or that we determine, in our sole discretion, are being used in a harmful or fraudulent manner.
              </p>
            </section>

            <section>
              <h2 className="font-display text-2xl font-bold text-foreground mb-4">
                4. Agency Terms
              </h2>
              <p className="text-muted-foreground mb-3">
                Independent rental agencies that list on Zuvio agree to the following:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2">
                <li>Agencies must provide accurate information about their business, fleet, pricing, location, and availability</li>
                <li>Agencies are responsible for maintaining all required business licenses, permits, and insurance applicable to their operations</li>
                <li>Agencies must honor all reservation requests that are confirmed through the Zuvio platform</li>
                <li>Agencies may not use Zuvio to conduct fraudulent transactions, misrepresent their services, or engage in discriminatory practices</li>
                <li>Agencies are solely responsible for the condition of their vehicles and the safety of renters during the rental period</li>
                <li>Zuvio reserves the right to remove any agency listing that violates these Terms or that receives consistent unresolved complaints</li>
              </ul>
            </section>

            <section>
              <h2 className="font-display text-2xl font-bold text-foreground mb-4">
                5. Rental Agreements
              </h2>
              <p className="text-muted-foreground mb-3">
                When a renter submits a reservation request through Zuvio, they are entering into a direct rental agreement with the independent agency. Zuvio is not a party to that agreement.
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2">
                <li>Renters must have a valid driver's license and meet the agency's minimum age requirement (typically 21 years or older)</li>
                <li>Renters are responsible for returning the vehicle in the same condition it was received</li>
                <li>Insurance requirements vary by agency — renters should confirm coverage before completing their reservation</li>
                <li>Disputes between renters and agencies regarding vehicle condition, damages, or service quality are to be resolved directly between the two parties. Zuvio may assist in communication but is not liable for the outcome</li>
              </ul>
            </section>

            <section>
              <h2 className="font-display text-2xl font-bold text-foreground mb-4">
                6. Payment Terms
              </h2>
              <ul className="list-disc list-inside text-muted-foreground space-y-2">
                <li>Some agencies on Zuvio accept online card payments processed securely through our payment processor. Zuvio does not store full card numbers</li>
                <li>Some agencies accept cash — in those cases, payment is handled directly between the renter and the agency at the time of pickup</li>
                <li>Agency payout schedules and platform fees are governed by the separate Agency Agreement entered into at the time of registration</li>
                <li>Refund policies vary by agency. Renters should review the agency's cancellation and refund policy before booking. Zuvio is not responsible for issuing refunds on behalf of agencies</li>
              </ul>
            </section>

            <section>
              <h2 className="font-display text-2xl font-bold text-foreground mb-4">
                7. Prohibited Activities
              </h2>
              <p className="text-muted-foreground mb-3">
                You agree not to use Zuvio to:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2">
                <li>Submit false, misleading, or fraudulent reservation requests</li>
                <li>Impersonate another person or entity</li>
                <li>Scrape, copy, or reproduce any part of the platform without written permission</li>
                <li>Attempt to gain unauthorized access to any part of the Zuvio system</li>
                <li>Use the platform for any unlawful purpose or in violation of any applicable laws</li>
                <li>Post or transmit harmful, offensive, or spam content through any communication tool on the platform</li>
                <li>Circumvent the platform by contacting agencies directly to avoid a booking fee after discovering them through Zuvio</li>
              </ul>
              <p className="text-muted-foreground mt-3">
                Violations may result in immediate account suspension and, where appropriate, referral to law enforcement.
              </p>
            </section>

            <section>
              <h2 className="font-display text-2xl font-bold text-foreground mb-4">
                8. Intellectual Property
              </h2>
              <p className="text-muted-foreground mb-3">
                All content on the Zuvio platform — including the Zuvio name, logo, design, text, graphics, and software — is the property of Zuvio and is protected by applicable intellectual property laws.
              </p>
              <p className="text-muted-foreground">
                You may not copy, reproduce, distribute, or create derivative works from any Zuvio content without express written permission. Agency listings and user-submitted content remain the property of the respective agency or user, but by submitting content to Zuvio you grant us a non-exclusive, royalty-free license to display and use that content to operate the platform.
              </p>
            </section>

            <section>
              <h2 className="font-display text-2xl font-bold text-foreground mb-4">
                9. Limitation of Liability
              </h2>
              <p className="text-muted-foreground mb-3">
                Zuvio provides its platform on an "as is" and "as available" basis. We make no warranties, express or implied, regarding the reliability, accuracy, or availability of the platform.
              </p>
              <p className="text-muted-foreground mb-3">
                To the fullest extent permitted by law:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2">
                <li>Zuvio is not liable for any damages arising from your use of the platform, including rental disputes, vehicle accidents, personal injury, or property damage</li>
                <li>Zuvio is not liable for the actions, omissions, or representations of any independent agency listed on the platform</li>
                <li>In no event shall Zuvio's total liability to you exceed the amount you paid to Zuvio in the 30 days preceding the claim</li>
              </ul>
              <p className="text-muted-foreground mt-3">
                You agree to indemnify and hold Zuvio harmless from any claims, damages, or expenses arising from your violation of these Terms or your use of the platform.
              </p>
            </section>

            <section>
              <h2 className="font-display text-2xl font-bold text-foreground mb-4">
                10. Governing Law
              </h2>
              <p className="text-muted-foreground mb-3">
                These Terms are governed by and construed in accordance with the laws of the State of Nevada, without regard to its conflict of law provisions. Any disputes arising from these Terms or your use of Zuvio shall be resolved in the state or federal courts located in Clark County, Nevada.
              </p>
              <p className="text-muted-foreground">
                For disputes under $10,000, either party may elect to resolve the matter through binding individual arbitration rather than in court. Class action lawsuits and class-wide arbitration are not permitted under these Terms.
              </p>
            </section>

            <section>
              <h2 className="font-display text-2xl font-bold text-foreground mb-4">
                11. Contact Information
              </h2>
              <p className="text-muted-foreground">
                If you have any questions about these Terms of Service, please contact us:<br />
                Email: <a href="mailto:team@zuvio.us" className="text-primary hover:text-primary/80 underline">team@zuvio.us</a><br />
                Location: Las Vegas, NV
              </p>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
};

export default TermsOfService;
