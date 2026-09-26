import { Button } from '@zproo/ui';
import { ArrowLeft, PlaneTakeoff } from 'lucide-react';
import type { ReactNode } from 'react';
import { Link } from 'react-router';
import { Seo } from '@/components/seo/Seo';
import { BookingSteps } from './BookingSteps';

/** Layout for the checkout steps: progress, title, main column and a sticky summary column. */
export function CheckoutShell({
  step,
  title,
  back,
  aside,
  children,
}: {
  step: number;
  title: string;
  back?: { to: string; label: string };
  aside?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
      <Seo title={title} noIndex />
      <BookingSteps current={step} />
      {back && (
        <Link
          to={back.to}
          className="mt-5 inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline"
        >
          <ArrowLeft aria-hidden className="size-4" /> {back.label}
        </Link>
      )}
      <h1 className="mt-3 text-2xl font-extrabold tracking-tight sm:text-3xl">{title}</h1>
      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_22rem]">
        <div className="min-w-0 space-y-6">{children}</div>
        {aside && (
          <aside className="space-y-4 lg:sticky lg:top-[calc(var(--header-height)+1rem)] lg:self-start">
            {aside}
          </aside>
        )}
      </div>
    </div>
  );
}

/** Shown when a checkout step is opened without a flight chosen (new tab, cleared storage). */
export function NoFlightSelected() {
  return (
    <div className="mx-auto flex max-w-xl flex-col items-center px-4 py-16 text-center">
      <Seo title="Book a flight" noIndex />
      <span className="grid size-14 place-items-center rounded-2xl bg-primary-light text-primary">
        <PlaneTakeoff aria-hidden className="size-7" />
      </span>
      <h1 className="mt-5 text-2xl font-extrabold">No flight selected</h1>
      <p className="mt-2 text-muted">Search for flights and choose a fare to continue booking.</p>
      <Button asChild className="mt-6">
        <Link to="/flights">Search flights</Link>
      </Button>
    </div>
  );
}
