import SEO from "@/components/SEO";

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Privacy Policy | ZUVIO"
        description="Read ZUVIO's privacy policy. Learn how we collect, use, and protect your personal information."
        path="/privacy"
      />
      <main className="container mx-auto px-4 py-24">
        <div className="max-w-3xl mx-auto">
          <h1 className="font-display text-4xl md:text-5xl font-bold mb-8">
            Privacy <span className="text-gradient">Policy</span>
          </h1>

          <p className="text-muted-foreground mb-4">
            Last updated: April 4, 2026
          </p>

          <p className="text-muted-foreground mb-8">
            Zuvio ("we," "us," or "our") operates the website www.gozuvio.com, an online marketplace that connects renters with independent car rental agencies. This Privacy Policy explains how we collect, use, share, and protect your information when you use our platform.
          </p>
          <p className="text-muted-foreground mb-8">
            By using Zuvio, you agree to the collection and use of information in accordance with this policy.
          </p>

          <div className="prose prose-invert max-w-none space-y-8">
            <section>
              <h2 className="font-display text-2xl font-bold text-foreground mb-4">
                1. Information We Collect
              </h2>
              <p className="text-muted-foreground mb-3">
                We collect the following types of personal information when you use Zuvio:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2">
                <li><strong className="text-foreground">Identity information:</strong> Full name, date of birth, and driver's license details (collected during the reservation process to verify eligibility)</li>
                <li><strong className="text-foreground">Contact information:</strong> Email address and phone number</li>
                <li><strong className="text-foreground">Account information:</strong> Username and password if you create an account</li>
                <li><strong className="text-foreground">Reservation information:</strong> Pickup and drop-off dates, selected vehicle type, and agency selected</li>
                <li><strong className="text-foreground">Payment information:</strong> If paying online, card details are processed securely through our payment processor. We do not store full card numbers. Some agencies on Zuvio accept cash — in those cases, payment is handled directly between you and the agency and we do not collect payment information</li>
                <li><strong className="text-foreground">Usage information:</strong> Pages visited, search queries, clicks, and time spent on the site</li>
                <li><strong className="text-foreground">Device information:</strong> IP address, browser type, and operating system</li>
              </ul>
            </section>

            <section>
              <h2 className="font-display text-2xl font-bold text-foreground mb-4">
                2. How We Use Your Information
              </h2>
              <p className="text-muted-foreground mb-3">
                We use the information we collect to:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2">
                <li>Process and manage your vehicle rental reservation</li>
                <li>Communicate with you about your booking, including confirmation emails and updates</li>
                <li>Connect you with the independent agency you selected</li>
                <li>Improve and personalize your experience on the Zuvio platform</li>
                <li>Send you occasional marketing emails about new agencies, cities, or offers (you may opt out at any time)</li>
                <li>Analyze how renters use the platform so we can improve it</li>
                <li>Comply with legal obligations and resolve disputes</li>
              </ul>
            </section>

            <section>
              <h2 className="font-display text-2xl font-bold text-foreground mb-4">
                3. Information Sharing
              </h2>
              <p className="text-muted-foreground mb-3">
                We do not sell your personal information. We share your information only in the following circumstances:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2">
                <li><strong className="text-foreground">With the rental agency you book:</strong> When you submit a reservation request, we share your name, contact information, dates, and relevant rental details with the agency so they can fulfill your booking</li>
                <li><strong className="text-foreground">With payment processors:</strong> If you pay online, your payment information is handled by our third-party payment processor. We do not have access to your full card details</li>
                <li><strong className="text-foreground">With service providers:</strong> We use third-party tools to operate our platform (such as email delivery, data hosting, and analytics). These providers only access your data to perform services on our behalf</li>
                <li><strong className="text-foreground">For legal reasons:</strong> We may disclose your information if required by law, court order, or to protect the rights and safety of Zuvio, our users, or the public</li>
              </ul>
            </section>

            <section>
              <h2 className="font-display text-2xl font-bold text-foreground mb-4">
                4. Data Security
              </h2>
              <p className="text-muted-foreground mb-3">
                We take reasonable measures to protect your personal information, including:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2">
                <li>Encrypted data transmission using HTTPS/SSL across all pages</li>
                <li>Secure cloud-based data storage with access controls</li>
                <li>Limiting access to personal data to only those who need it to operate the platform</li>
              </ul>
              <p className="text-muted-foreground mt-3">
                While we take these precautions, no method of transmission over the internet is 100% secure. We encourage you to use a strong password and to contact us immediately if you suspect unauthorized access to your account.
              </p>
            </section>

            <section>
              <h2 className="font-display text-2xl font-bold text-foreground mb-4">
                5. Cookies and Tracking
              </h2>
              <p className="text-muted-foreground mb-3">
                Zuvio uses cookies and similar tracking technologies to improve your experience. This includes:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2">
                <li><strong className="text-foreground">Essential cookies:</strong> Required for the site to function (login sessions, reservation flow)</li>
                <li><strong className="text-foreground">Analytics cookies:</strong> Help us understand how visitors use the site so we can improve it</li>
                <li><strong className="text-foreground">Preference cookies:</strong> Remember your settings and search preferences</li>
              </ul>
              <p className="text-muted-foreground mt-3">
                You can control cookie settings through your browser. Disabling cookies may affect certain features of the site. We do not use cookies to sell your data to advertisers.
              </p>
            </section>

            <section>
              <h2 className="font-display text-2xl font-bold text-foreground mb-4">
                6. Your Rights
              </h2>
              <p className="text-muted-foreground mb-3">
                Depending on where you live, you may have the following rights regarding your personal data:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2">
                <li><strong className="text-foreground">Access:</strong> Request a copy of the personal information we hold about you</li>
                <li><strong className="text-foreground">Correction:</strong> Ask us to correct inaccurate or incomplete information</li>
                <li><strong className="text-foreground">Deletion:</strong> Request that we delete your personal information, subject to legal and operational requirements</li>
                <li><strong className="text-foreground">Opt-out of marketing:</strong> Unsubscribe from marketing emails at any time using the link in any email we send</li>
              </ul>
              <p className="text-muted-foreground mt-3">
                <strong className="text-foreground">California residents (CCPA):</strong> You have the right to know what personal information we collect, request deletion, and opt out of the sale of your data. We do not sell personal information.
              </p>
              <p className="text-muted-foreground mt-2">
                To exercise any of these rights, contact us at{" "}
                <a href="mailto:team@zuvio.us" className="text-primary hover:text-primary/80 underline">team@zuvio.us</a>.
              </p>
            </section>

            <section>
              <h2 className="font-display text-2xl font-bold text-foreground mb-4">
                7. Data Retention
              </h2>
              <p className="text-muted-foreground mb-3">
                We retain your personal information for as long as necessary to provide our services and comply with legal obligations:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2">
                <li><strong className="text-foreground">Reservation data:</strong> Retained for up to 3 years for record-keeping and dispute resolution</li>
                <li><strong className="text-foreground">Account data:</strong> Retained while your account is active and for up to 1 year after deletion</li>
                <li><strong className="text-foreground">Usage and analytics data:</strong> Retained for up to 2 years in aggregated or anonymized form</li>
              </ul>
              <p className="text-muted-foreground mt-3">
                You may request early deletion of your data by contacting us at{" "}
                <a href="mailto:team@zuvio.us" className="text-primary hover:text-primary/80 underline">team@zuvio.us</a>.
              </p>
            </section>

            <section>
              <h2 className="font-display text-2xl font-bold text-foreground mb-4">
                8. Children's Privacy
              </h2>
              <p className="text-muted-foreground">
                Zuvio is not intended for use by anyone under the age of 18. We do not knowingly collect personal information from children. If you believe a minor has submitted information through our platform, please contact us at{" "}
                <a href="mailto:team@zuvio.us" className="text-primary hover:text-primary/80 underline">team@zuvio.us</a>{" "}
                and we will promptly delete it.
              </p>
            </section>

            <section>
              <h2 className="font-display text-2xl font-bold text-foreground mb-4">
                9. International Transfers
              </h2>
              <p className="text-muted-foreground">
                Zuvio is operated from the United States. If you are accessing our platform from outside the United States, please be aware that your information may be transferred to and processed in the United States, where data protection laws may differ from those in your country. By using Zuvio, you consent to this transfer.
              </p>
            </section>

            <section>
              <h2 className="font-display text-2xl font-bold text-foreground mb-4">
                10. Changes to This Policy
              </h2>
              <p className="text-muted-foreground">
                We may update this Privacy Policy from time to time. When we do, we will update the "Last updated" date at the top of this page. For significant changes, we will notify users by email or by placing a notice on the Zuvio homepage. We encourage you to review this policy periodically.
              </p>
            </section>

            <section>
              <h2 className="font-display text-2xl font-bold text-foreground mb-4">
                11. Contact Us
              </h2>
              <p className="text-muted-foreground">
                If you have any questions, concerns, or requests related to this Privacy Policy, please contact us:<br />
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

export default PrivacyPolicy;
