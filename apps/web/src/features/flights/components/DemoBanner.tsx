import { FlaskConical } from 'lucide-react';

/** Shown whenever results come from the development provider rather than airline inventory. */
export function DemoBanner() {
  return (
    <p
      role="note"
      className="flex items-start gap-2 rounded-xl border border-warning/40 bg-warning/10 px-3 py-2 text-sm text-amber-900"
    >
      <FlaskConical aria-hidden className="mt-0.5 size-4 shrink-0" />
      <span>
        <strong>Demo inventory.</strong> Flights, airlines and payments here are simulated for
        testing — no real tickets are issued and no money is charged.
      </span>
    </p>
  );
}
