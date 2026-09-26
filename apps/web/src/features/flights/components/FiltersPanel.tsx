import { Button, cn } from '@zproo/ui';
import { Moon, Sun, Sunrise, Sunset } from 'lucide-react';
import { useId, type ReactNode } from 'react';
import {
  activeFilterCount,
  EMPTY_FILTERS,
  TIME_BANDS,
  type FilterFacets,
  type FlightFilters,
  type TimeBand,
} from '../filters';
import { inr, stopsLabel } from '../format';

const BAND_ICONS: Record<TimeBand, typeof Sun> = {
  EARLY: Sunrise,
  MORNING: Sun,
  AFTERNOON: Sunset,
  NIGHT: Moon,
};

const toggle = <T,>(list: T[], value: T): T[] =>
  list.includes(value) ? list.filter((v) => v !== value) : [...list, value];

interface FiltersPanelProps {
  facets: FilterFacets;
  value: FlightFilters;
  onChange: (next: FlightFilters) => void;
  fromCity: string;
  toCity: string;
}

export function FiltersPanel({ facets, value, onChange, fromCity, toCity }: FiltersPanelProps) {
  const priceId = useId();
  const set = (patch: Partial<FlightFilters>) => onChange({ ...value, ...patch });
  const maxPrice = value.maxPricePaise ?? facets.maxPricePaise;
  // Whole rupees, rounded up to ₹100, so the slider lands on tidy values.
  const step = 10_000;
  const sliderMax = Math.ceil(facets.maxPricePaise / step) * step;
  const sliderMin = Math.floor(facets.minPricePaise / step) * step;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-bold">Filters</h2>
        {activeFilterCount(value) > 0 && (
          <Button variant="ghost" size="sm" onClick={() => onChange(EMPTY_FILTERS)}>
            Clear all
          </Button>
        )}
      </div>

      <Group title="Stops">
        {facets.stops.map((s) => (
          <Check
            key={s.stops}
            label={s.stops === 2 ? '2+ stops' : stopsLabel(s.stops)}
            hint={inr(s.fromPaise)}
            checked={value.stops.includes(s.stops)}
            onChange={() => set({ stops: toggle(value.stops, s.stops) })}
          />
        ))}
      </Group>

      {facets.maxPricePaise > facets.minPricePaise && (
        <Group title="Price">
          <label htmlFor={priceId} className="flex justify-between text-sm">
            <span className="text-muted">Up to</span>
            <span className="font-semibold tabular-nums">{inr(Math.min(maxPrice, sliderMax))}</span>
          </label>
          <input
            id={priceId}
            type="range"
            min={sliderMin}
            max={sliderMax}
            step={step}
            value={Math.min(maxPrice, sliderMax)}
            onChange={(e) => {
              const v = Number(e.target.value);
              set({ maxPricePaise: v >= sliderMax ? null : v });
            }}
            className="w-full accent-primary"
          />
          <div className="flex justify-between text-xs text-muted tabular-nums">
            <span>{inr(sliderMin)}</span>
            <span>{inr(sliderMax)}</span>
          </div>
        </Group>
      )}

      <TimeGroup
        title={`Departure from ${fromCity}`}
        selected={value.departure}
        onToggle={(b) => set({ departure: toggle(value.departure, b) })}
      />
      <TimeGroup
        title={`Arrival at ${toCity}`}
        selected={value.arrival}
        onToggle={(b) => set({ arrival: toggle(value.arrival, b) })}
      />

      {facets.airlines.length > 1 && (
        <Group title="Airlines">
          {facets.airlines.map((a) => (
            <Check
              key={a.code}
              label={a.name}
              hint={inr(a.fromPaise)}
              checked={value.airlines.includes(a.code)}
              onChange={() => set({ airlines: toggle(value.airlines, a.code) })}
            />
          ))}
        </Group>
      )}

      <Group title="Fare type">
        <Check
          label="Refundable only"
          checked={value.refundableOnly}
          onChange={() => set({ refundableOnly: !value.refundableOnly })}
        />
      </Group>
    </div>
  );
}

function Group({ title, children }: { title: string; children: ReactNode }) {
  return (
    <fieldset className="space-y-2">
      <legend className="mb-2 text-sm font-semibold">{title}</legend>
      {children}
    </fieldset>
  );
}

function Check({
  label,
  hint,
  checked,
  onChange,
}: {
  label: string;
  hint?: string;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <label className="flex cursor-pointer items-center gap-3 rounded-lg py-1 text-sm">
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="size-4 accent-primary"
      />
      <span className="flex-1">{label}</span>
      {hint && <span className="text-xs text-muted tabular-nums">{hint}</span>}
    </label>
  );
}

function TimeGroup({
  title,
  selected,
  onToggle,
}: {
  title: string;
  selected: TimeBand[];
  onToggle: (b: TimeBand) => void;
}) {
  return (
    <Group title={title}>
      <div className="grid grid-cols-2 gap-2">
        {TIME_BANDS.map((band) => {
          const Icon = BAND_ICONS[band.id];
          const on = selected.includes(band.id);
          return (
            <button
              key={band.id}
              type="button"
              aria-pressed={on}
              onClick={() => onToggle(band.id)}
              className={cn(
                'flex flex-col items-center gap-1 rounded-xl border px-2 py-2 text-xs font-medium transition-colors',
                on
                  ? 'border-primary bg-primary-light text-primary'
                  : 'border-border hover:border-foreground/30',
              )}
            >
              <Icon aria-hidden className="size-4" />
              {band.label}
            </button>
          );
        })}
      </div>
    </Group>
  );
}
