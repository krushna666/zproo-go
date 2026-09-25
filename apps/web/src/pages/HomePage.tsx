import { BRAND } from '@zproo/config';
import { Button } from '@zproo/ui';
import { ArrowRight, BadgePercent, Headset, ShieldCheck, Zap } from 'lucide-react';
import { Link } from 'react-router';
import { Seo } from '@/components/seo/Seo';
import { SERVICES } from '@/config/services';

const PROMISES = [
  {
    icon: BadgePercent,
    title: 'No surge pricing',
    text: 'Transparent fares with taxes shown upfront.',
  },
  {
    icon: ShieldCheck,
    title: 'Secure payments',
    text: 'UPI, cards, net banking and ZPROO Wallet.',
  },
  { icon: Zap, title: 'Fast & reliable', text: 'Book any trip in a few taps.' },
  { icon: Headset, title: '24×7 support', text: 'Real help whenever plans change.' },
];

/**
 * Home page foundation. Phase 3 adds the hero booking widget, travel imagery, deals,
 * popular routes, destinations, wallet and app promotions.
 */
export default function HomePage() {
  return (
    <>
      <Seo />
      <script type="application/ld+json">
        {JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'Organization',
          name: BRAND.name,
          slogan: BRAND.tagline,
          description: BRAND.description,
          logo: BRAND.assets.logo,
        })}
      </script>

      <section className="relative overflow-hidden bg-primary text-primary-foreground">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-40 -top-40 size-[34rem] rounded-full bg-white/10"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-48 left-1/3 size-[30rem] rounded-full bg-black/10"
        />
        <div className="relative mx-auto max-w-7xl px-4 pb-24 pt-14 sm:px-6 sm:pt-20 lg:px-8 lg:pb-32">
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-white/80 sm:text-sm sm:tracking-[0.2em]">
            {BRAND.description}
          </p>
          <h1 className="mt-4 max-w-3xl text-4xl font-extrabold leading-[1.08] tracking-tight sm:text-5xl lg:text-6xl">
            Travel Smarter.
            <br />
            Go Further with {BRAND.name}
          </h1>
          <p className="mt-5 max-w-2xl text-lg text-white/90">
            Flights, Buses, Trains, Hotels, Cabs, Bikes, Holidays, Parcels & Corporate Travel — All
            in One App.
          </p>
          <Button
            asChild
            size="lg"
            variant="outline"
            className="mt-8 border-transparent bg-white text-primary hover:bg-white/90"
          >
            <a href="#services">
              Start Your Journey <ArrowRight aria-hidden />
            </a>
          </Button>
        </div>
      </section>

      <section
        id="services"
        aria-labelledby="services-heading"
        className="relative z-10 mx-auto -mt-14 max-w-7xl scroll-mt-32 px-4 sm:px-6 lg:px-8"
      >
        <div className="rounded-card border border-border bg-card p-5 shadow-raised sm:p-8">
          <h2 id="services-heading" className="text-xl font-bold sm:text-2xl">
            Our travel services
          </h2>
          <ul className="mt-6 grid grid-cols-3 gap-3 sm:grid-cols-5 lg:grid-cols-9">
            {SERVICES.map(({ label, path, icon: Icon, tagline }) => (
              <li key={path}>
                <Link
                  to={path}
                  title={tagline}
                  className="group flex h-full flex-col items-center gap-2 rounded-2xl border border-border p-3 text-center transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-card sm:p-4"
                >
                  <span className="grid size-12 place-items-center rounded-2xl bg-primary-light text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                    <Icon aria-hidden className="size-6" />
                  </span>
                  <span className="text-sm font-semibold">{label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section
        aria-labelledby="why-heading"
        className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8"
      >
        <h2 id="why-heading" className="text-xl font-bold sm:text-2xl">
          Why travellers choose {BRAND.name}
        </h2>
        <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {PROMISES.map(({ icon: Icon, title, text }) => (
            <li key={title} className="flex gap-4 rounded-card border border-border bg-card p-5">
              <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-primary-light text-primary">
                <Icon aria-hidden className="size-5" />
              </span>
              <div>
                <h3 className="font-bold">{title}</h3>
                <p className="mt-1 text-sm text-muted">{text}</p>
              </div>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}
