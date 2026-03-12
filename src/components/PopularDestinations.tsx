import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Building2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { FEATURED_CITY_SLUGS, MAJOR_CITIES, normalizeCity } from '@/lib/city-data';

type PublicAgency = {
  city: string | null;
};

const cityVisuals: Record<string, string> = {
  'las-vegas': 'from-accent/40 to-primary/20',
  'los-angeles': 'from-primary/30 to-accent/20',
  miami: 'from-accent/30 to-primary/25',
  orlando: 'from-primary/35 to-secondary',
  dallas: 'from-secondary to-primary/20',
  austin: 'from-accent/25 to-secondary',
  'new-york-city': 'from-primary/25 to-secondary',
  'san-francisco': 'from-accent/20 to-primary/20',
};

const PopularDestinations = () => {
  const [agencyRows, setAgencyRows] = useState<PublicAgency[]>([]);

  useEffect(() => {
    const fetchCounts = async () => {
      const { data } = await supabase.rpc('get_public_agencies');
      setAgencyRows((data as PublicAgency[]) || []);
    };

    fetchCounts();
  }, []);

  const counts = useMemo(() => {
    const map = new Map<string, number>();
    for (const row of agencyRows) {
      const city = normalizeCity(row.city || '');
      if (!city) continue;
      map.set(city, (map.get(city) || 0) + 1);
    }
    return map;
  }, [agencyRows]);

  const featured = MAJOR_CITIES.filter((city) => FEATURED_CITY_SLUGS.includes(city.slug as (typeof FEATURED_CITY_SLUGS)[number]));

  return (
    <section className="py-20 bg-gradient-to-b from-background to-secondary/30">
      <div className="container mx-auto px-4">
        <div className="mb-8 text-center">
          <h2 className="font-display text-3xl md:text-4xl font-bold">Popular Destinations</h2>
          <p className="text-muted-foreground mt-2">Find rentals in major cities across the U.S.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {featured.map((city) => {
            const count = counts.get(normalizeCity(city.city)) || 0;
            return (
              <Link key={city.slug} to={`/city/${city.slug}`}>
                <Card className="overflow-hidden hover:shadow-glow transition-all duration-300 border-border/70">
                  <div className={`h-24 bg-gradient-to-br ${cityVisuals[city.slug] || 'from-secondary to-primary/20'} flex items-center justify-end px-4`}>
                    <MapPin className="h-6 w-6 text-foreground/80" />
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-semibold text-foreground">{city.city}</h3>
                    <p className="text-sm text-muted-foreground">{city.state}</p>
                    <div className="mt-3 inline-flex items-center gap-2 text-xs px-2 py-1 rounded-md bg-secondary text-secondary-foreground">
                      <Building2 className="h-3.5 w-3.5" />
                      {count > 0 ? `${count} agencies` : 'Coming Soon'}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default PopularDestinations;
