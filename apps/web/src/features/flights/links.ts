import type { PaxCounts } from '@zproo/types';

const paxQuery = (pax: PaxCounts) =>
  new URLSearchParams({
    adults: String(pax.adults),
    children: String(pax.children),
    infants: String(pax.infants),
  }).toString();

export const offerUrl = (offerId: string, pax: PaxCounts) =>
  `/flights/${encodeURIComponent(offerId)}?${paxQuery(pax)}`;

export const paymentUrl = (reference: string) =>
  `/flights/payment?ref=${encodeURIComponent(reference)}`;

export const confirmationUrl = (reference: string) =>
  `/flights/confirmation?ref=${encodeURIComponent(reference)}`;
