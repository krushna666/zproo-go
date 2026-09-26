import type { BookingDetails, BookingListItem, FlightOffer, PassengerType } from '@zproo/types';
import type { BookingRecord } from '../repositories/booking.repository';
import { flightPriceBreakdown } from '../services/flightPricing';

const iso = (d: Date | null) => (d ? d.toISOString() : null);
const isoDate = (d: Date) => d.toISOString().slice(0, 10);

function paxCounts(booking: BookingRecord) {
  const count = (t: PassengerType) => booking.passengers.filter((p) => p.type === t).length;
  return { adults: count('ADULT'), children: count('CHILD'), infants: count('INFANT') };
}

export function toBookingDetails(booking: BookingRecord): BookingDetails {
  const offers = booking.flights.map((f) => f.offer as unknown as FlightOffer);
  const price = flightPriceBreakdown(offers, paxCounts(booking));
  return {
    reference: booking.reference,
    serviceType: 'FLIGHT',
    status: booking.status,
    paymentStatus: booking.paymentStatus,
    createdAt: booking.createdAt.toISOString(),
    holdExpiresAt: iso(booking.holdExpiresAt),
    confirmedAt: iso(booking.confirmedAt),
    cancelledAt: iso(booking.cancelledAt),
    travelDate: isoDate(booking.travelDate),
    // Amounts come from the stored booking (what was charged), not re-computed.
    price: {
      ...price,
      basePaise: booking.baseAmountPaise,
      taxesPaise: booking.taxAmountPaise,
      feesPaise: booking.feeAmountPaise,
      discountPaise: booking.discountAmountPaise,
      totalPaise: booking.totalAmountPaise,
    },
    contact: { email: booking.contactEmail, phone: booking.contactPhone },
    passengers: booking.passengers.map((p) => ({
      id: p.id,
      type: p.type,
      title: p.title,
      firstName: p.firstName,
      lastName: p.lastName,
      dateOfBirth: p.dateOfBirth ? isoDate(p.dateOfBirth) : null,
      gender: p.gender,
    })),
    flights: booking.flights.map((f, i) => ({
      sequence: f.sequence,
      offer: offers[i] as FlightOffer,
      pnr: f.pnr,
      tickets: (f.tickets as { passengerId: string; ticketNumber: string }[] | null) ?? [],
    })),
  };
}

export function toBookingListItem(booking: BookingRecord): BookingListItem {
  const first = booking.flights[0];
  const last = booking.flights.at(-1);
  const roundTrip = booking.flights.length === 2 && first?.originCode === last?.destinationCode;
  return {
    reference: booking.reference,
    serviceType: booking.serviceType,
    status: booking.status,
    paymentStatus: booking.paymentStatus,
    title:
      first && last
        ? `${first.originCode} ${roundTrip ? '⇄' : '→'} ${roundTrip ? first.destinationCode : last.destinationCode}`
        : 'Booking',
    subtitle: `${booking.passengers.length} traveller${booking.passengers.length === 1 ? '' : 's'} · ${booking.flights.length} flight${booking.flights.length === 1 ? '' : 's'}`,
    travelDate: isoDate(booking.travelDate),
    totalPaise: booking.totalAmountPaise,
    createdAt: booking.createdAt.toISOString(),
  };
}
