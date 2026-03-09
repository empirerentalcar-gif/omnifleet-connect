import { MAJOR_CITIES_STATE_ENTRIES } from '@/lib/city-data';

type CitySelectorProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  allowCustom?: boolean;
  id?: string;
};

const CUSTOM_VALUE = '__custom_city__';

const CitySelector = ({
  value,
  onChange,
  placeholder = 'Select a city',
  allowCustom = true,
  id,
}: CitySelectorProps) => {
  const cityValues = MAJOR_CITIES_STATE_ENTRIES.flatMap(([, cities]) => cities.map((c) => c.city));
  const isPreset = cityValues.includes(value);
  const selectValue = value ? (isPreset ? value : CUSTOM_VALUE) : '';

  return (
    <div className="space-y-2">
      <select
        id={id}
        value={selectValue}
        onChange={(e) => {
          const next = e.target.value;
          if (next === CUSTOM_VALUE) {
            if (isPreset) onChange('');
            return;
          }
          onChange(next);
        }}
        className="w-full bg-secondary/50 border border-border rounded-xl px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
      >
        <option value="">{placeholder}</option>
        {MAJOR_CITIES_STATE_ENTRIES.map(([state, cities]) => (
          <optgroup key={state} label={state}>
            {cities.map((city) => (
              <option key={`${state}-${city.city}`} value={city.city}>
                {city.city}
              </option>
            ))}
          </optgroup>
        ))}
        {allowCustom && <option value={CUSTOM_VALUE}>Other city…</option>}
      </select>

      {allowCustom && selectValue === CUSTOM_VALUE && (
        <input
          type="text"
          placeholder="Type custom city..."
          value={isPreset ? '' : value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full bg-secondary/50 border border-border rounded-xl px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
        />
      )}
    </div>
  );
};

export default CitySelector;
