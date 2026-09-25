import { Button, DialogTitle, Separator, Sheet, SheetContent } from '@zproo/ui';
import { BadgePercent, CircleHelp, LogIn } from 'lucide-react';
import { useRef } from 'react';
import { Link } from 'react-router';
import { Logo } from '@/components/brand/Logo';
import { SERVICES } from '@/config/services';
import { CurrencySelect } from './CurrencySelect';

interface MobileMenuProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function MobileMenu({ open, onOpenChange }: MobileMenuProps) {
  const close = () => onOpenChange(false);
  const panelRef = useRef<HTMLDivElement>(null);
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        ref={panelRef}
        aria-describedby={undefined}
        // Radix skips links when auto-focusing, which would land on the currency select.
        // Focus the panel so screen readers announce the menu and Tab starts at the top.
        onOpenAutoFocus={(event) => {
          event.preventDefault();
          panelRef.current?.focus();
        }}
      >
        <div className="flex items-center gap-3 border-b border-border px-5 py-4">
          <Logo height={30} />
          <DialogTitle className="sr-only">Menu</DialogTitle>
        </div>
        <div className="flex flex-col gap-5 p-5">
          <Button asChild size="lg" className="w-full">
            <Link to="/login" onClick={close}>
              <LogIn aria-hidden /> Login / Sign up
            </Link>
          </Button>
          <nav aria-label="Services">
            <p className="mb-2 text-xs font-bold uppercase tracking-wider text-muted">
              Book travel
            </p>
            <ul className="grid grid-cols-3 gap-2">
              {SERVICES.map(({ label, path, icon: Icon }) => (
                <li key={path}>
                  <Link
                    to={path}
                    onClick={close}
                    className="flex flex-col items-center gap-1.5 rounded-xl border border-border px-1 py-3 text-xs font-semibold transition-colors hover:border-primary/40 hover:bg-primary-light"
                  >
                    <Icon aria-hidden className="size-5 text-primary" />
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <Separator />
          <ul className="flex flex-col gap-1 text-sm font-semibold">
            <li>
              <Link
                to="/offers"
                onClick={close}
                className="flex items-center gap-3 rounded-xl px-2 py-2.5 hover:bg-background"
              >
                <BadgePercent aria-hidden className="size-5 text-primary" /> Offers
              </Link>
            </li>
            <li>
              <Link
                to="/help"
                onClick={close}
                className="flex items-center gap-3 rounded-xl px-2 py-2.5 hover:bg-background"
              >
                <CircleHelp aria-hidden className="size-5 text-primary" /> Help & support
              </Link>
            </li>
          </ul>
          <CurrencySelect className="self-start" />
        </div>
      </SheetContent>
    </Sheet>
  );
}
