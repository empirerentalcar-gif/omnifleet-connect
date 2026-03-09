export type MajorCity = {
  city: string;
  state: string;
  slug: string;
  tagline: string;
  tips: string[];
};

export const MAJOR_CITIES: MajorCity[] = [
  {
    city: 'Las Vegas', state: 'Nevada', slug: 'las-vegas',
    tagline: 'Skip the Strip rental counters and rent from local agencies for better rates on your Vegas trip.',
    tips: ['Airport rentals charge premium fees. Local agencies often offer free hotel delivery.', 'Book early during CES, EDC, and major fight weekends.', 'Ask about unlimited-mileage deals for day trips to the Grand Canyon or Red Rock.'],
  },
  {
    city: 'Los Angeles', state: 'California', slug: 'los-angeles',
    tagline: 'Navigate LA like a local with affordable rentals from independent agencies across the city.',
    tips: ['Avoid LAX rental lots. Local pickups skip the shuttle and save time.', 'Convertibles are popular for PCH drives; book early in summer.', 'Ask about weekly rates if you are staying 5+ days.'],
  },
  {
    city: 'San Francisco', state: 'California', slug: 'san-francisco',
    tagline: 'Explore the Bay Area beyond BART with a local rental, from wine country to Big Sur.',
    tips: ['Compact cars are easier to park in the city.', 'If heading to Napa, ask about mileage policies before booking.', 'Many local agencies offer one-way drops to SFO or OAK.'],
  },
  {
    city: 'San Diego', state: 'California', slug: 'san-diego',
    tagline: 'Beach days, Balboa Park, and border runs. Rent locally and keep more money for tacos.',
    tips: ['SUVs are great for surf trips with gear.', 'Weekend rates are often lower during the off-season (Nov-Feb).', 'Ask about cross-border insurance if you plan to visit Tijuana.'],
  },
  {
    city: 'Phoenix', state: 'Arizona', slug: 'phoenix',
    tagline: 'Beat the heat in style. Rent from a Phoenix local and skip the Sky Harbor crowds.',
    tips: ['Tinted windows are a big perk in desert heat. Ask your agency.', 'Book SUVs for Sedona and Grand Canyon trips.', 'Spring training season (Feb-Mar) drives up demand. Book early.'],
  },
  {
    city: 'Scottsdale', state: 'Arizona', slug: 'scottsdale',
    tagline: 'Luxury without the markup. Scottsdale local agencies offer premium vehicles at fair prices.',
    tips: ['Many agencies specialize in luxury and exotic vehicles.', 'Golf season (Oct-Apr) is peak. Reserve well in advance.', 'Ask about delivery to your resort or Airbnb.'],
  },
  {
    city: 'Miami', state: 'Florida', slug: 'miami',
    tagline: 'From South Beach to the Everglades. Skip the airport lines and rent from a Miami local.',
    tips: ['Convertibles book fast in winter; reserve at least two weeks ahead.', 'Many local agencies offer free delivery to Miami Beach hotels.', 'Check for toll-pass options. Miami has many express lanes.'],
  },
  {
    city: 'Orlando', state: 'Florida', slug: 'orlando',
    tagline: 'Theme parks, outlets, and road trips. Orlando locals offer family-friendly vehicles at great rates.',
    tips: ['Minivans and SUVs are popular for families. Book early during school breaks.', 'Ask about car seats and booster seats for kids.', 'Local agencies often have better daily rates than the big chains at MCO.'],
  },
  {
    city: 'Tampa', state: 'Florida', slug: 'tampa',
    tagline: 'Explore Tampa Bay and the Gulf Coast with a local rental that fits your itinerary.',
    tips: ['Great base for day trips to Clearwater Beach and St. Pete.', 'Ask about weekly rates for extended beach vacations.', 'Off-peak summer rates can save you 30% or more.'],
  },
  {
    city: 'Fort Lauderdale', state: 'Florida', slug: 'fort-lauderdale',
    tagline: 'Cruise port, beach town, and gateway to the Keys. Fort Lauderdale locals have you covered.',
    tips: ['Many agencies offer cruise-port pickup and drop-off.', 'Convertibles are a hit for A1A coastal drives.', 'Compare daily vs. weekly rates. Longer rentals save significantly.'],
  },
  {
    city: 'Dallas', state: 'Texas', slug: 'dallas',
    tagline: 'Everything is bigger in Texas, including the savings when you rent from a Dallas local.',
    tips: ['Full-size sedans and trucks handle Texas distances comfortably.', 'Love Field agencies are often cheaper than DFW options.', 'Ask about unlimited mileage for Austin or Houston day trips.'],
  },
  {
    city: 'Houston', state: 'Texas', slug: 'houston',
    tagline: 'Space City sprawls. Rent from a Houston local and explore at your own pace.',
    tips: ['Houston traffic is no joke. GPS and a comfortable car are key.', 'SUVs are popular for Galveston beach trips.', 'Many local agencies offer Hobby Airport pickup for free.'],
  },
  {
    city: 'Austin', state: 'Texas', slug: 'austin',
    tagline: 'Keep Austin weird and your rental affordable with independent local agencies.',
    tips: ['SXSW and ACL drive massive demand. Book months in advance.', 'Compact cars work great for the city; SUVs for Hill Country exploring.', 'Ask about pet-friendly vehicles if traveling with a dog.'],
  },
  {
    city: 'San Antonio', state: 'Texas', slug: 'san-antonio',
    tagline: 'The Riverwalk, the Alamo, and beyond. Rent local in San Antonio and save.',
    tips: ['San Antonio is a great base for Texas Hill Country wine tours.', 'Parking downtown is tricky. Compact cars have an advantage.', 'Look for agencies near the airport for the best convenience.'],
  },
  {
    city: 'New York City', state: 'New York', slug: 'new-york-city',
    tagline: 'Escape the city or explore the boroughs. NYC local rentals beat Manhattan garage prices.',
    tips: ['Most visitors do not need a car in Manhattan. Rent for day trips instead.', 'Great for Hamptons, Hudson Valley, or upstate getaways.', 'Ask about parking-included deals if you do need the car in the city.'],
  },
  {
    city: 'Reno', state: 'Nevada', slug: 'reno',
    tagline: 'Gateway to Tahoe and the Sierra. Rent from a Reno local for mountain adventures.',
    tips: ['AWD/4WD vehicles are a must for winter Tahoe trips.', 'Summer rates are peak season. Book early for lake weekends.', 'Ask about ski-rack availability in winter months.'],
  },
  {
    city: 'Buffalo', state: 'New York', slug: 'buffalo',
    tagline: 'Niagara Falls and beyond. Buffalo local agencies keep it affordable and friendly.',
    tips: ['AWD vehicles are smart for snowy winters.', 'Great for day trips to Niagara Falls (US and Canadian sides).', 'Ask about cross-border rental policies for visits to Canada.'],
  },
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
