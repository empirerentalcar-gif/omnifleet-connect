import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Car, MapPin, Lightbulb, ChevronRight, Building2 } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import SEO from '@/components/SEO';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { MAJOR_CITIES, citySlugToLabel, normalizeCity, FEATURED_CITY_SLUGS } from '@/lib/city-data';

/* ── types ── */
type VehicleRow = {
  profile_id: string | null;
  business_name: string | null;
  location_city: string | null;
  location_state: string | null;
  vehicle_type: string | null;
  images: string[] | null;
};

type AgencySummary = {
  profileId: string;
  name: string;
  city: string;
  state: string;
  vehicleCount: number;
  vehicleTypes: string[];
  image: string | null;
};

const vehicleTypeOptions = ['All', 'Sedan', 'SUV', 'Truck', 'Van', 'Compact', 'Luxury'];

const CityLanding = () => {
  const { citySlug = '' } = useParams();
  const navigate = useNavigate();
  const cityMeta = citySlugToLabel(citySlug);
  const [agencies, setAgencies] = useState<AgencySummary[]>([]);
  const [query, setQuery] = useState('');
  const [vehicleType, setVehicleType] = useState('All');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCityVehicles = async () => {
      setLoading(true);
      const { data, error } = await supabase.from('available_vehicles_public').select('*');
      if (error || !data) { setAgencies([]); setLoading(false); return; }

      const labelCity = cityMeta?.city ?? citySlug.split('-').map((w) => w[0]?.toUpperCase() + w.slice(1)).join(' ');
      const cityName = normalizeCity(labelCity);
      const cityVehicles = (data as VehicleRow[]).filter((v) => normalizeCity(v.location_city || '') === cityName);

      const agencyMap = new Map<string, AgencySummary>();
      for (const v of cityVehicles) {
        if (!v.profile_id) continue;
        const existing = agencyMap.get(v.profile_id);
        if (existing) {
          existing.vehicleCount += 1;
          if (v.vehicle_type && !existing.vehicleTypes.includes(v.vehicle_type)) existing.vehicleTypes.push(v.vehicle_type);
          if (!existing.image && v.images?.[0]) existing.image = v.images[0];
        } else {
          agencyMap.set(v.profile_id, {
            profileId: v.profile_id,
            name: v.business_name || 'Local Agency',
            city: v.location_city || cityMeta?.city || labelCity,
            state: v.location_state || cityMeta?.state || '',
            vehicleCount: 1,
            vehicleTypes: v.vehicle_type ? [v.vehicle_type] : [],
            image: v.images?.[0] || null,
          });
        }
      }
      setAgencies(Array.from(agencyMap.values()));
      setLoading(false);
    };
    fetchCityVehicles();
  }, [cityMeta, citySlug]);

  const cityLabel = cityMeta?.city ?? citySlug.split('-').map((w) => w[0]?.toUpperCase() + w.slice(1)).join(' ');

  const filtered = useMemo(() => {
    return agencies.filter((a) => {
      if (vehicleType !== 'All' && !a.vehicleTypes.includes(vehicleType)) return false;
      if (query.trim()) {
        const q = query.toLowerCase();
        if (!a.name.toLowerCase().includes(q) && !a.vehicleTypes.some((t) => t.toLowerCase().includes(q))) return false;
      }
      return true;
    });
  }, [agencies, query, vehicleType]);

  const otherCities = MAJOR_CITIES.filter((c) => c.slug !== citySlug && FEATURED_CITY_SLUGS.includes(c.slug as any)).slice(0, 6);
  const seoDescription = cityMeta?.tagline || `Find independent car rental agencies in ${cityLabel}. Support local businesses and save money.`;

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title={`Car Rentals in ${cityLabel} | ZUVIO`}
        description={seoDescription}
        path={`/city/${citySlug}`}
      />
      <Header />

      <main className="pt-24 pb-16">
        {/* ── Hero ── */}
        <section className="container mx-auto px-4 mb-10">
          <div className="rounded-2xl bg-gradient-hero p-8 md:p-12 border border-border/50">
            <p className="text-sm uppercase tracking-wider text-muted-foreground mb-3">City guide</p>
            <h1 className="font-display text-4xl md:text-5xl font-bold mb-4">Car Rentals in {cityLabel}</h1>
            <p className="text-muted-foreground max-w-2xl text-lg">{seoDescription}</p>
            <div className="mt-6 flex gap-3 flex-wrap">
              <Button variant="hero" onClick={() => navigate(`/search?location=${encodeURIComponent(cityLabel)}`)}>
                Browse agencies in {cityLabel}
              </Button>
              <Button variant="outline" onClick={() => navigate('/pricing')}>Join as an Agency</Button>
            </div>
          </div>
        </section>

        {/* ── Local Tips ── */}
        {cityMeta?.tips && cityMeta.tips.length > 0 && (
          <section className="container mx-auto px-4 mb-10">
            <div className="rounded-2xl border border-border bg-card p-6 md:p-8">
              <h2 className="text-2xl font-bold flex items-center gap-2 mb-4">
                <Lightbulb className="h-5 w-5 text-primary" /> Local Rental Tips for {cityLabel}
              </h2>
              <ul className="space-y-3">
                {cityMeta.tips.map((tip, i) => (
                  <li key={i} className="flex items-start gap-3 text-muted-foreground">
                    <ChevronRight className="h-4 w-4 mt-1 shrink-0 text-primary" />
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          </section>
        )}

        {/* ── Search / Filter ── */}
        <section className="container mx-auto px-4 mb-8">
          <div className="glass-card rounded-2xl p-5 border border-border/50 grid grid-cols-1 md:grid-cols-3 gap-4">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search agencies or vehicle types..."
              className="w-full bg-secondary/50 border border-border rounded-xl px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
            />
            <select
              value={vehicleType}
              onChange={(e) => setVehicleType(e.target.value)}
              className="w-full bg-secondary/50 border border-border rounded-xl px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
            >
              {vehicleTypeOptions.map((type) => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
            <Button variant="outline" onClick={() => { setQuery(''); setVehicleType('All'); }}>Reset Filters</Button>
          </div>
        </section>

        {/* ── Agency Listings ── */}
        <section className="container mx-auto px-4">
          <h2 className="text-2xl font-bold mb-4">Agencies in {cityLabel}</h2>
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[1, 2].map((n) => (
                <div key={n} className="h-64 rounded-xl bg-secondary/50 animate-pulse" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="rounded-xl border border-border p-8 text-center">
              <Building2 className="h-10 w-10 mx-auto text-muted-foreground/50 mb-3" />
              <p className="font-medium">No agencies are listed in {cityLabel} yet.</p>
              <p className="text-sm text-muted-foreground mt-2">We are actively expanding this market. Check back soon!</p>
              <Button variant="outline" className="mt-4" onClick={() => navigate('/search')}>Browse All Agencies</Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filtered.map((agency) => (
                <Card key={agency.profileId} className="overflow-hidden hover:shadow-glow transition-shadow duration-300">
                  <CardContent className="p-0">
                    <div className="h-40 bg-secondary">
                      {agency.image ? (
                        <img src={agency.image} alt={`${agency.name} in ${cityLabel}`} className="h-full w-full object-cover" loading="lazy" />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center"><Car className="h-10 w-10 text-muted-foreground/50" /></div>
                      )}
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold text-lg">{agency.name}</h3>
                      <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                        <MapPin className="h-3.5 w-3.5" /> {agency.city}{agency.state ? `, ${agency.state}` : ''}
                      </p>
                      <p className="text-sm mt-3"><span className="font-medium">Vehicles:</span> {agency.vehicleCount}</p>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {agency.vehicleTypes.slice(0, 4).map((type) => (
                          <span key={type} className="text-xs px-2 py-1 rounded bg-secondary text-secondary-foreground">{type}</span>
                        ))}
                      </div>
                      <Button className="w-full mt-4" variant="hero" onClick={() => navigate(`/search?location=${encodeURIComponent(cityLabel)}`)}>
                        View Listings
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </section>

        {/* ── Owner CTA ── */}
        <section className="container mx-auto px-4 mt-12">
          <div className="rounded-2xl border border-border bg-card p-6 text-center">
            <h2 className="text-2xl font-bold">Own an agency in {cityLabel}?</h2>
            <p className="text-muted-foreground mt-2">Join ZUVIO and start getting discovered by renters in your city.</p>
            <Button variant="hero" className="mt-4" onClick={() => navigate('/pricing')}>Apply to Join ZUVIO</Button>
          </div>
        </section>

        {/* ── Other Cities ── */}
        <section className="container mx-auto px-4 mt-12">
          <h2 className="text-2xl font-bold mb-4">Explore Other Cities</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {otherCities.map((c) => (
              <Link key={c.slug} to={`/city/${c.slug}`} className="rounded-xl border border-border bg-card p-4 text-center hover:border-primary/50 hover:shadow-glow transition-all duration-300">
                <p className="font-semibold text-foreground">{c.city}</p>
                <p className="text-xs text-muted-foreground">{c.state}</p>
              </Link>
            ))}
          </div>
          <div className="text-center mt-4">
            <Link to="/cities" className="text-sm text-primary hover:underline">View all cities →</Link>
          </div>
        </section>

        {/* ── JSON-LD ── */}
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'WebPage',
          name: `Car Rentals in ${cityLabel}`,
          description: seoDescription,
          url: `https://zuvio.us/city/${citySlug}`,
          breadcrumb: {
            '@type': 'BreadcrumbList',
            itemListElement: [
              { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://zuvio.us/' },
              { '@type': 'ListItem', position: 2, name: 'Cities', item: 'https://zuvio.us/cities' },
              { '@type': 'ListItem', position: 3, name: `Car Rentals in ${cityLabel}`, item: `https://zuvio.us/city/${citySlug}` },
            ],
          },
        }) }} />
      </main>
      <Footer />
    </div>
  );
};

export default CityLanding;
