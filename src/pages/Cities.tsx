import { Link } from 'react-router-dom';
import { MapPin } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import SEO from '@/components/SEO';
import { MAJOR_CITIES_STATE_ENTRIES } from '@/lib/city-data';

const Cities = () => {
  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="All Cities | Car Rentals from Local Agencies | ZUVIO"
        description="Browse car rental agencies in major cities across the United States. Find independent, local car rentals in Las Vegas, Miami, Los Angeles, and more."
        path="/cities"
      />
      <Header />

      <main className="pt-24 pb-16">
        <section className="container mx-auto px-4 mb-10">
          <div className="rounded-2xl bg-gradient-hero p-8 md:p-12 border border-border/50">
            <p className="text-sm uppercase tracking-wider text-muted-foreground mb-3">City directory</p>
            <h1 className="font-display text-4xl md:text-5xl font-bold mb-4">Find Car Rentals by City</h1>
            <p className="text-muted-foreground max-w-2xl">Browse independent car rental agencies in major cities across the United States. Support local businesses and save money on your next trip.</p>
          </div>
        </section>

        <section className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {MAJOR_CITIES_STATE_ENTRIES.map(([state, cities]) => (
              <div key={state} className="rounded-xl border border-border bg-card p-6">
                <h2 className="font-bold text-lg text-foreground mb-4 flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-primary" /> {state}
                </h2>
                <ul className="space-y-2">
                  {cities.map((c) => (
                    <li key={c.slug}>
                      <Link
                        to={`/city/${c.slug}`}
                        className="text-muted-foreground hover:text-primary transition-colors"
                      >
                        Car Rentals in {c.city} →
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'CollectionPage',
          name: 'Car Rentals by City',
          description: 'Browse car rental agencies in major cities across the United States.',
          url: 'https://zuvio.us/cities',
        }) }} />
      </main>
      <Footer />
    </div>
  );
};

export default Cities;
