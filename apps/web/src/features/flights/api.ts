import type {
  BookingDetails,
  BookingListItem,
  FlightOffer,
  FlightSearchResult,
  PaxCounts,
  PaymentOrder,
} from '@zproo/types';
import type { BookFlightInput, FlightSearch } from '@zproo/validation';
import { useQueries, useQuery } from '@tanstack/react-query';
import { apiGet, apiPost, http } from '@/services/http';

export const flightKeys = {
  search: (s: FlightSearch) => ['flights', 'search', s] as const,
  offer: (id: string, pax: PaxCounts) => ['flights', 'offer', id, pax] as const,
  booking: (reference: string) => ['bookings', reference] as const,
  bookings: ['bookings'] as const,
};

/** Search query parameters in the API's URL format (the same one the results page uses). */
function searchParams(s: FlightSearch): Record<string, string> {
  const params: Record<string, string> = {
    trip: s.tripType,
    adults: String(s.adults),
    children: String(s.children),
    infants: String(s.infants),
    cabin: s.cabin,
  };
  if (s.tripType === 'MULTI_CITY') {
    params.legs = s.legs.map((l) => `${l.from}.${l.to}.${l.date}`).join(',');
  } else {
    const [leg] = s.legs;
    if (leg) Object.assign(params, { from: leg.from, to: leg.to, date: leg.date });
    if (s.tripType === 'ROUND_TRIP' && s.returnDate) params.return = s.returnDate;
  }
  return params;
}

export function useFlightSearch(search: FlightSearch | null) {
  return useQuery({
    queryKey: search ? flightKeys.search(search) : ['flights', 'search', null],
    queryFn: () =>
      apiGet<FlightSearchResult>('/flights/search', {
        params: searchParams(search as FlightSearch),
      }),
    enabled: search !== null,
    staleTime: 60_000,
  });
}

export function useFlightOffer(offerId: string | undefined, pax: PaxCounts) {
  return useQuery({
    queryKey: flightKeys.offer(offerId ?? '', pax),
    queryFn: () =>
      apiGet<FlightOffer>(`/flights/${encodeURIComponent(offerId ?? '')}`, { params: pax }),
    enabled: Boolean(offerId),
    staleTime: 30_000,
  });
}

export function useBooking(reference: string | null, options: { poll?: boolean } = {}) {
  return useQuery({
    queryKey: flightKeys.booking(reference ?? ''),
    queryFn: () => apiGet<BookingDetails>(`/bookings/${reference}`),
    enabled: Boolean(reference),
    // After payment, tickets are issued in the background: poll (for about a minute) until every PNR is in.
    refetchInterval: (query) => {
      const booking = query.state.data;
      const waiting = booking?.status === 'CONFIRMED' && booking.flights.some((f) => !f.pnr);
      return options.poll && waiting && query.state.dataUpdateCount < 20 ? 3_000 : false;
    },
  });
}

export function useMyBookings() {
  return useQuery({
    queryKey: flightKeys.bookings,
    queryFn: () => apiGet<BookingListItem[]>('/bookings'),
  });
}

export const flightsApi = {
  book: (input: BookFlightInput, idempotencyKey: string) =>
    apiPost<BookingDetails>('/flights/book', input, {
      headers: { 'Idempotency-Key': idempotencyKey },
    }),
  createPayment: (bookingReference: string) =>
    apiPost<PaymentOrder>('/payments/create', { bookingReference }),
  /** Development gateway only: stands in for the checkout popup of a real gateway. */
  completeMockPayment: (paymentId: string, outcome: 'success' | 'failure') =>
    apiPost<{ reference: string; status: 'SUCCESS' | 'FAILED' }>('/payments/mock/complete', {
      paymentId,
      outcome,
    }),
  verifyPayment: (body: {
    paymentId: string;
    providerPaymentId: string;
    signature: string;
    method?: string;
  }) => apiPost<{ reference: string }>('/payments/verify', body),
  failPayment: (paymentId: string, reason: string) =>
    apiPost<null>(`/payments/${paymentId}/fail`, { reason }),
  /** Fetched with the access token (a plain link can't send it), then saved via a blob URL. */
  async downloadTicket(reference: string): Promise<void> {
    const res = await http.get<Blob>(`/bookings/${reference}/ticket.pdf`, { responseType: 'blob' });
    const url = URL.createObjectURL(res.data);
    const link = document.createElement('a');
    link.href = url;
    link.download = `ZPROO-GO-${reference}.pdf`;
    document.body.append(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 10_000);
  },
};

/** Current price and availability of every flight in the itinerary. */
export function useItineraryOffers(offerIds: string[], pax: PaxCounts) {
  return useQueries({
    queries: offerIds.map((id) => ({
      queryKey: flightKeys.offer(id, pax),
      queryFn: () => apiGet<FlightOffer>(`/flights/${encodeURIComponent(id)}`, { params: pax }),
      enabled: true,
      staleTime: 30_000,
    })),
    combine: (results) => ({
      offers: results.every((r) => r.data) ? results.map((r) => r.data as FlightOffer) : null,
      isPending: results.some((r) => r.isPending),
      error: results.find((r) => r.error)?.error ?? null,
      refetch: () => Promise.all(results.map((r) => r.refetch())),
    }),
  });
}
