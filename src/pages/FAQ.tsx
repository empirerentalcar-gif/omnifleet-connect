import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";
import { Link } from "react-router-dom";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useState } from "react";

const categories = ["For Renters", "For Agencies", "General"] as const;

const faqData = {
  "For Renters": [
    { q: "What is ZUVIO and how does it work?", a: "ZUVIO is a nationwide platform that connects customers with independent car rental agencies across the United States. Think of us as a one-stop shop where you can discover and book from local, independent rental businesses that you might not otherwise find.\n\nWe work by aggregating rental options from independent agencies into a single, easy-to-use platform. You search for rentals in your area, compare options from different agencies, and book directly through ZUVIO." },
    { q: "Can I pay with cash or without a credit card?", a: "Yes! Many independent agencies on ZUVIO accept cash payments and don't require credit cards. This is one of the major advantages of renting from independent agencies versus large corporate chains.\n\nWhen browsing rentals, you can filter specifically for agencies that accept cash or debit cards. Payment requirements are clearly displayed on each listing so you know exactly what to expect before booking." },
    { q: "How do I book a rental through ZUVIO?", a: "Booking is simple and takes just a few minutes:\n\n• Enter your location, pickup date, and return date\n• Browse available vehicles from independent agencies\n• Select the rental that fits your needs\n• Complete your reservation through our secure booking system\n• Receive instant confirmation with pickup details\n\nAfter booking, you'll get the agency's contact information and location so you can pick up your vehicle at the scheduled time." },
    { q: "Are the rental agencies on ZUVIO legitimate and safe?", a: "Absolutely. Every agency on ZUVIO goes through a verification process before being listed. We verify business licenses, insurance coverage, and legitimate operations.\n\nAdditionally, all agencies have customer reviews and ratings visible on their profiles. You can read experiences from other renters before making your decision, just like you would on any reputable platform." },
    { q: "What's the difference between ZUVIO and major rental chains?", a: "ZUVIO connects you with independent, locally-owned rental agencies rather than corporate chains. Key differences include:\n\n• Personalized Service: Work directly with business owners who care about your experience\n• Flexible Terms: Many agencies accept cash, offer negotiable terms, and have more flexible policies\n• Support Local: Your rental dollars support local business owners in your community\n• Better Value: Independent agencies often have competitive pricing without sacrificing quality" },
    { q: "What if I have a problem with my rental?", a: "For issues during your rental, contact the agency directly using the information provided in your booking confirmation. Independent agencies typically respond quickly and work hard to resolve any concerns.\n\nIf you're unable to resolve an issue with the agency, ZUVIO customer support is here to help mediate and ensure a fair outcome. We take customer satisfaction seriously and work with our partner agencies to maintain high standards." },
    { q: "Do I need insurance to rent a car through ZUVIO?", a: "Insurance requirements vary by agency and state. Most agencies require proof of insurance coverage, either through your personal auto policy, credit card coverage, or by purchasing insurance from the agency.\n\nInsurance options and requirements are clearly stated in each listing. Many agencies offer affordable insurance options if you need coverage for your rental period." },
  ],
  "For Agencies": [
    { q: "How much does it cost to join ZUVIO?", a: "We offer flexible pricing options to fit different business models:\n\n• Free Trial: Get started with 3 months free to test the platform\n• Commission-Based: Pay a small percentage only when you get bookings through ZUVIO\n• Monthly Subscription: Fixed monthly fee with no per-booking commissions\n\nThere are no hidden fees, setup costs, or long-term contracts. Choose the plan that makes sense for your agency size and booking volume." },
    { q: "What do I need to get started as an agency partner?", a: "To join ZUVIO, you'll need:\n\n• Valid business license for car rental operations\n• Proof of liability insurance\n• Photos and details of your rental fleet\n• Business contact information and location\n\nThe signup process is straightforward and our team helps you get set up quickly. Most agencies are live on the platform within a few days." },
    { q: "How do I manage bookings and availability?", a: "ZUVIO provides an easy-to-use dashboard where you can:\n\n• Update vehicle availability in real-time\n• View and manage incoming reservations\n• Set pricing and rental terms\n• Communicate with customers\n• Track your bookings and revenue\n\nYou have complete control over your inventory and can block out dates, adjust pricing, or make changes anytime." },
    { q: "Can I set my own prices and rental policies?", a: "Absolutely! You maintain complete control over your business. You set:\n\n• Daily, weekly, and monthly rental rates\n• Security deposit requirements\n• Mileage limits and policies\n• Payment methods accepted (cash, credit, debit)\n• Age requirements and driver restrictions\n• Insurance options and requirements\n\nZUVIO is simply the platform that connects you with customers. You run your business your way." },
    { q: "How quickly will I start getting bookings?", a: "Booking volume varies based on your location, fleet size, and pricing. Many agencies receive their first booking within the first week of going live.\n\nTo maximize bookings, we recommend:\n\n• Uploading quality photos of your vehicles\n• Setting competitive pricing\n• Clearly describing your rental terms and what makes your agency special\n• Responding quickly to customer inquiries\n• Encouraging satisfied customers to leave reviews" },
    { q: "What support does ZUVIO provide to agencies?", a: "We're committed to your success. ZUVIO provides:\n\n• Dedicated customer support team\n• Help with platform setup and optimization\n• Marketing to drive customers to the platform\n• Regular platform updates and improvements\n• Resources and best practices for maximizing bookings\n• Dispute resolution assistance when needed" },
  ],
  "General": [
    { q: "Where is ZUVIO available?", a: "ZUVIO operates nationwide across the United States. We're actively partnering with independent car rental agencies in all 50 states.\n\nCoverage varies by location — some areas have many agency options while we're still growing in others. Enter your location on our search page to see available agencies near you." },
    { q: "How does ZUVIO make money?", a: "ZUVIO earns revenue through agency partnerships. Depending on the plan they choose, agencies either pay a monthly subscription fee or a small commission on bookings made through our platform.\n\nFor renters, using ZUVIO is completely free. We never charge customers booking fees or mark up rental prices." },
    { q: "Is my personal information secure?", a: "Yes. ZUVIO takes data security seriously. We use industry-standard encryption to protect your personal and payment information. We never sell your data to third parties.\n\nWhen you book a rental, we share only the necessary information with the agency (name, contact info, reservation details) to complete your rental." },
    { q: "Can I cancel or modify my reservation?", a: "Cancellation and modification policies are set by each individual rental agency and are clearly displayed when you book. Policies vary but many agencies offer free cancellation up to 24-48 hours before pickup.\n\nTo modify or cancel a reservation, contact the agency directly using the information in your booking confirmation." },
    { q: "How can I contact ZUVIO support?", a: "We're here to help! You can reach our support team through:\n\n• Email: team@zuvio.us\n• Phone: Available on our Contact page\n\nWe typically respond to all inquiries within 24 hours, often much sooner." },
  ],
};

const FAQ = () => {
  const [activeCategory, setActiveCategory] = useState<typeof categories[number]>("For Renters");

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="FAQ | ZUVIO — Independent Car Rental Questions Answered"
        description="Get answers to frequently asked questions about ZUVIO. Learn about booking rentals, cash payments, agency partnerships, pricing, and how our independent car rental network works."
        path="/faq"
      />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": Object.values(faqData).flat().map(item => ({
          "@type": "Question",
          "name": item.q,
          "acceptedAnswer": { "@type": "Answer", "text": item.a }
        }))
      }) }} />
      <Header />

      {/* Hero */}
      <section className="pt-24 md:pt-32 pb-16 md:pb-20 bg-gradient-to-br from-primary/10 via-background to-secondary/10 text-center px-4">
        <div className="container mx-auto max-w-3xl">
          <h1 className="font-display text-4xl md:text-5xl font-bold mb-6">Frequently Asked Questions</h1>
          <p className="text-lg md:text-xl text-muted-foreground">
            Find answers to common questions about renting from independent agencies and joining the ZUVIO network.
          </p>
        </div>
      </section>

      <section className="py-16 md:py-20">
        <div className="container mx-auto px-4 max-w-3xl">
          {/* Category Nav */}
          <div className="flex flex-wrap gap-3 justify-center mb-12">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-5 py-2.5 rounded-full font-semibold text-sm transition-all ${
                  activeCategory === cat
                    ? "bg-primary text-primary-foreground"
                    : "bg-card border border-border text-muted-foreground hover:border-primary hover:text-foreground"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* FAQ Accordion */}
          {categories.map((cat) => (
            <div key={cat} className={activeCategory === cat ? "block" : "hidden"}>
              <h2 className="font-display text-2xl font-bold mb-6 pb-3 border-b-2 border-primary">{cat === "For Agencies" ? "For Rental Agencies" : cat}</h2>
              <Accordion type="single" collapsible className="space-y-4">
                {faqData[cat].map((item, i) => (
                  <AccordionItem key={i} value={`${cat}-${i}`} className="bg-card rounded-xl border border-border/50 px-6">
                    <AccordionTrigger className="text-left font-semibold text-base md:text-lg hover:no-underline">
                      {item.q}
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground leading-relaxed whitespace-pre-line">
                      {item.a}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          ))}

          {/* CTA */}
          <div className="mt-16 bg-gradient-to-r from-primary to-accent rounded-2xl p-8 md:p-12 text-center text-primary-foreground">
            <h2 className="font-display text-2xl md:text-3xl font-bold mb-4">Still Have Questions?</h2>
            <p className="text-lg mb-6 opacity-95">Can't find the answer you're looking for? Our support team is ready to help.</p>
            <a href="mailto:team@zuvio.us" className="bg-background text-primary font-semibold px-8 py-3 rounded-full hover:bg-background/90 transition-colors inline-block">
              Contact Support
            </a>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default FAQ;
