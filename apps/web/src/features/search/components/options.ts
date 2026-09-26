import { AIRPORTS, CITIES, TRAIN_STATIONS } from '@zproo/config';
import type { PlaceOption } from './PlaceCombobox';

export const AIRPORT_OPTIONS: readonly PlaceOption[] = AIRPORTS.map((a) => ({
  value: a.code,
  label: a.city,
  detail: `${a.code} · ${a.name}`,
  keywords: a.country,
  badge: a.code,
}));

export const CITY_OPTIONS: readonly PlaceOption[] = CITIES.map((c) => ({
  value: c.code,
  label: c.name,
  detail: c.state,
}));

export const STATION_OPTIONS: readonly PlaceOption[] = TRAIN_STATIONS.map((s) => ({
  value: s.code,
  label: s.name,
  detail: `${s.code} · ${s.city}`,
  keywords: s.city,
  badge: s.code,
}));
