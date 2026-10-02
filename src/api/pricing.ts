import type { Mode, Offer, Selection } from './types';

export interface FareBreakdown {
  base: number;
  taxes: number;
  fee: number;
  discount: number;
  total: number;
}

const TAX_RATE: Record<Mode, number> = { bus: 0.05, train: 0.05, flight: 0.12, hotel: 0.12 };
const FEE: Record<Mode, number> = { bus: 29, train: 40, flight: 199, hotel: 99 };

export function baseAmount(sel: Selection) {
  return sel.unitPrice * sel.units * (sel.nights ?? 1);
}

export function couponDiscount(offer: Offer | undefined, mode: Mode, preDiscount: number) {
  if (!offer) return 0;
  if (offer.mode !== 'all' && offer.mode !== mode) return 0;
  return Math.min(Math.round((preDiscount * offer.percent) / 100), offer.maxDiscount);
}

export function computeFare(sel: Selection, offer?: Offer): FareBreakdown {
  const base = baseAmount(sel);
  const taxes = Math.round(base * TAX_RATE[sel.mode]);
  const fee = FEE[sel.mode];
  const discount = couponDiscount(offer, sel.mode, base + taxes + fee);
  return { base, taxes, fee, discount, total: base + taxes + fee - discount };
}
