import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";
import { Link } from "react-router-dom";
import { Handshake, Scale, Star, Lightbulb, Lock, Globe, Check } from "lucide-react";

const values = [
  { icon: Handshake, title: "Support Independence", desc: "We champion independent businesses and believe local entrepreneurs deserve the tools to succeed against corporate competition." },
  { icon: Scale, title: "Fair Competition", desc: "Small businesses shouldn't be disadvantaged by lack of technology. We provide enterprise-grade tools at accessible pricing." },
  { icon: Star, title: "Quality Service", desc: "We believe personalized service from local agencies creates better experiences than one-size-fits-all corporate policies." },
  { icon: Lightbulb, title: "Innovation", desc: "We continuously improve our platform to give agencies and customers the best possible experience." },
  { icon: Lock, title: "Trust & Transparency", desc: "We build trust through honest communication, transparent pricing, and verified agency listings." },
  { icon: Globe, title: "Community", desc: "We're creating a nationwide community of independent agencies and customers who value local business." },
];

const differences = [
  { title: "Built for Independents", desc: "Unlike generic listing sites, ZUVIO is designed specifically for independent car rental agencies and their unique needs." },
  { title: "Two-Sided Marketplace", desc: "We serve both agencies and customers, creating a win-win ecosystem where local businesses connect with customers seeking their services." },
  { title: "Flexible Solutions", desc: "We understand that agencies offer cash rentals, varied policies, and personalized service. Our platform supports this flexibility." },
  { title: "Agency Empowerment", desc: "Agencies maintain full control over pricing, policies, and customer relationships. We provide the platform, you run your business." },
  { title: "Customer Focus", desc: "We attract customers specifically looking for independent agencies, not just anyone needing a rental car." },
  { title: "Continuous Growth", desc: "We're constantly adding features, expanding our network, and improving the platform based on agency and customer feedback." },
];

const stats = [
  { number: "50+", label: "States Covered" },
  { number: "100%", label: "Independent Agencies" },
  { number: "24/7", label: "Platform Availability" },
  { number: "1", label: "Mission: Your Success" },
];

const About = () => {
  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="About ZUVIO | Empowering Independent Car Rental Agencies"
        description="Learn about ZUVIO's mission to connect independent car rental agencies with customers nationwide. Discover our story, values, and commitment to supporting local businesses."
        path="/about"
      />
      <Header />

      {/* Hero */}
      <section className="pt-24 md:pt-32 pb-16 md:pb-20 bg-gradient-to-br from-primary/10 via-background to-secondary/10 text-center px-4">
        <div className="container mx-auto max-w-3xl">
          <h1 className="font-display text-4xl md:text-5xl font-bold mb-6">About ZUVIO</h1>
          <p className="text-lg md:text-xl text-muted-foreground">
            Empowering independent car rental agencies and connecting them with customers who value local service and flexibility.
          </p>
        </div>
      </section>

      {/* Mission */}
      <section className="py-16 md:py-20">
        <div className="container mx-auto px-4 max-w-3xl text-center">
          <h2 className="font-display text-3xl md:text-4xl font-bold mb-6 text-primary">Our Mission</h2>
          <p className="text-lg text-muted-foreground leading-relaxed mb-8">
            ZUVIO exists to level the playing field for independent car rental agencies competing in a market dominated by national chains. We believe that local businesses deserve access to the same technology and customer reach as corporate giants, while maintaining their independence and personal touch.
          </p>
          <div className="bg-gradient-to-r from-primary to-accent rounded-2xl p-8 text-primary-foreground">
            <h3 className="font-display text-2xl font-bold mb-3">Independent Car Rentals. One Network.</h3>
            <p className="text-lg opacity-95">
              We're building a nationwide platform where independent rental agencies can thrive, and customers can discover the benefits of renting local.
            </p>
          </div>
        </div>
      </section>

      {/* Story */}
      <section className="py-16 md:py-20 bg-secondary/5">
        <div className="container mx-auto px-4 max-w-3xl">
          <h2 className="font-display text-3xl md:text-4xl font-bold mb-8 text-primary">Our Story</h2>
          <div className="space-y-6 text-muted-foreground text-lg leading-relaxed">
            <p>The idea for ZUVIO was born from a simple observation: while national car rental chains have sophisticated booking platforms and massive marketing budgets, independent rental agencies struggle to be discovered by customers who would actually prefer their personalized service and flexible terms.</p>
            <p>We saw talented business owners with quality vehicles and exceptional customer service being overshadowed simply because they lacked the digital infrastructure to compete. Customers looking for cash rentals, flexible policies, or just wanting to support local businesses couldn't easily find these independent agencies.</p>
            <p>ZUVIO changes that. We've created a dedicated platform that puts independent car rental agencies on equal footing with the big chains, giving them the tools to showcase their services to customers across America who are actively seeking alternatives to corporate rentals.</p>
            <p>Today, we're building a community of independent rental agencies and customers who value quality service, local business, and flexibility over corporate standardization.</p>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-16 md:py-20">
        <div className="container mx-auto px-4">
          <h2 className="font-display text-3xl md:text-4xl font-bold mb-4 text-primary text-center">What We Believe</h2>
          <p className="text-center text-lg text-muted-foreground mb-12">Our core values guide everything we do at ZUVIO</p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {values.map((v, i) => (
              <div key={i} className="bg-card rounded-2xl p-8 text-center shadow-sm hover:shadow-lg transition-all hover:-translate-y-1 border border-border/50">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center mx-auto mb-5">
                  <v.icon className="h-7 w-7 text-primary-foreground" />
                </div>
                <h3 className="font-display text-xl font-bold mb-3">{v.title}</h3>
                <p className="text-muted-foreground">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Difference */}
      <section className="py-16 md:py-20">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="bg-card rounded-2xl p-8 md:p-12 shadow-sm border border-border/50">
            <h2 className="font-display text-3xl md:text-4xl font-bold mb-10 text-primary text-center">The ZUVIO Difference</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {differences.map((d, i) => (
                <div key={i} className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Check className="h-4 w-4 text-primary-foreground" />
                  </div>
                  <div>
                    <h3 className="font-display font-bold text-lg mb-2">{d.title}</h3>
                    <p className="text-muted-foreground text-sm">{d.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 md:py-20 bg-gradient-to-br from-primary/10 via-background to-secondary/10">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto text-center">
            {stats.map((s, i) => (
              <div key={i}>
                <div className="font-display text-4xl md:text-5xl font-extrabold text-primary mb-2">{s.number}</div>
                <div className="text-muted-foreground">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Join */}
      <section className="py-16 md:py-20">
        <div className="container mx-auto px-4 max-w-3xl text-center">
          <h2 className="font-display text-3xl md:text-4xl font-bold mb-6">Join Our Mission</h2>
          <p className="text-lg text-muted-foreground mb-10">
            ZUVIO is more than a platform—it's a movement to support independent businesses and give customers better rental options. Whether you're an agency owner looking to grow or a customer seeking personalized service, we invite you to be part of our community.
          </p>
        </div>
        <div className="container mx-auto px-4 max-w-3xl">
          <div className="bg-gradient-to-r from-primary to-accent rounded-2xl p-8 md:p-12 text-center text-primary-foreground">
            <h2 className="font-display text-3xl font-bold mb-4">Be Part of the ZUVIO Network</h2>
            <p className="text-lg mb-8 opacity-95">Join us in revolutionizing the car rental industry, one independent agency at a time.</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/search" className="bg-background text-primary font-semibold px-8 py-3 rounded-full hover:bg-background/90 transition-colors">
                Find a Rental
              </Link>
              <Link to="/pricing" className="bg-background text-primary font-semibold px-8 py-3 rounded-full hover:bg-background/90 transition-colors">
                Become a Partner
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default About;
