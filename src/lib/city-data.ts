export type MajorCity = {
  city: string;
  state: string;
  slug: string;
};

export const MAJOR_CITIES: MajorCity[] = [
  { city: 'Las Vegas', state: 'Nevada', slug: 'las-vegas' },
  { city: 'Los Angeles', state: 'California', slug: 'los-angeles' },
  { city: 'San Francisco', state: 'California', slug: 'san-francisco' },
  { city: 'San Diego', state: 'California', slug: 'san-diego' },
  { city: 'Phoenix', state: 'Arizona', slug: 'phoenix' },
  { city: 'Scottsdale', state: 'Arizona', slug: 'scottsdale' },
  { city: 'Miami', state: 'Florida', slug: 'miami' },
  { city: 'Orlando', state: 'Florida', slug: 'orlando' },
  { city: 'Tampa', state: 'Florida', slug: 'tampa' },
  { city: 'Fort Lauderdale', state: 'Florida', slug: 'fort-lauderdale' },
  { city: 'Dallas', state: 'Texas', slug: 'dallas' },
  { city: 'Houston', state: 'Texas', slug: 'houston' },
  { city: 'Austin', state: 'Texas', slug: 'austin' },
  { city: 'San Antonio', state: 'Texas', slug: 'san-antonio' },
  { city: 'New York City', state: 'New York', slug: 'new-york-city' },
  { city: 'Reno', state: 'Nevada', slug: 'reno' },
  { city: 'Buffalo', state: 'New York', slug: 'buffalo' },
];

export const FEATURED_CITY_SLUGS = [
  'las-vegas',
  'los-angeles',
  'miami',
  'orlando',
  'dallas',
  'austin',
  'new-york-city',
  'san-francisco',
] as const;

export const MAJOR_CITIES_BY_STATE = MAJOR_CITIES.reduce<Record<string, MajorCity[]>>((acc, city) => {
  if (!acc[city.state]) acc[city.state] = [];
  acc[city.state].push(city);
  return acc;
}, {});

export const MAJOR_CITIES_STATE_ENTRIES = Object.entries(MAJOR_CITIES_BY_STATE).sort(([a], [b]) =>
  a.localeCompare(b),
);

export const citySlugToLabel = (slug: string) => MAJOR_CITIES.find((c) => c.slug === slug) ?? null;

export const normalizeCity = (value: string) => value.trim().toLowerCase();
