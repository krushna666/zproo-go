export interface PlaceOption {
  value: string;
  /** Shown in the field when selected, e.g. "Pune". */
  label: string;
  /** Secondary line, e.g. "PNQ · Pune Airport". */
  detail: string;
  /** Extra words to match, e.g. state or station name. */
  keywords?: string;
  /** Short code badge in the list, e.g. "PNQ". */
  badge?: string;
}

/** Ranks prefix matches first, then substring matches; empty query shows everything. */
export function filterPlaces(options: readonly PlaceOption[], query: string): PlaceOption[] {
  const q = query.trim().toLowerCase();
  if (!q) return [...options];
  const scored = options
    .map((o) => {
      const label = o.label.toLowerCase();
      const code = o.value.toLowerCase();
      const all = `${label} ${code} ${o.detail} ${o.keywords ?? ''}`.toLowerCase();
      const score =
        code === q ? 0 : label.startsWith(q) ? 1 : code.startsWith(q) ? 2 : all.includes(q) ? 3 : 9;
      return { o, score };
    })
    .filter((x) => x.score < 9);
  return scored.sort((a, b) => a.score - b.score).map((x) => x.o);
}
