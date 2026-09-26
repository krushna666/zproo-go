import type { BookingStatus, CabinClass, PaymentStatus } from './enums';

export interface AirportInfo {
  code: string;
  city: string;
  name: string;
  country: string;
  /** IANA time zone; flight times are shown in the airport's local time. */
  timezone: string;
}

export interface AirlineInfo {
  code: string;
  name: string;
}

export interface FlightSegmentInfo {
  airline: AirlineInfo;
  flightNumber: string;
  from: AirportInfo;
  to: AirportInfo;
  /** ISO 8601 instant (UTC). */
  departureAt: string;
  arrivalAt: string;
  durationMinutes: number;
  aircraft: string;
}

export interface PaxFare {
  basePaise: number;
  taxesPaise: number;
  totalPaise: number;
}

export type PassengerType = 'ADULT' | 'CHILD' | 'INFANT';

export interface PaxCounts {
  adults: number;
  children: number;
  infants: number;
}

export interface FlightOffer {
  /** Opaque, provider-scoped; pass back to fetch or book the offer. */
  id: string;
  provider: string;
  airline: AirlineInfo;
  flightNumber: string;
  from: AirportInfo;
  to: AirportInfo;
  departureAt: string;
  arrivalAt: string;
  durationMinutes: number;
  stops: number;
  segments: FlightSegmentInfo[];
  layovers: { airport: AirportInfo; minutes: number }[];
  cabin: CabinClass;
  fareFamily: string;
  refundable: boolean;
  /** Airline cancellation charge per passenger, or null when non-refundable. */
  cancellationFeePaise: number | null;
  baggage: { cabinKg: number; checkInKg: number };
  seatsLeft: number;
  fares: Record<PassengerType, PaxFare>;
  /** Price for the passengers in the search. */
  totalPaise: number;
}

export interface FlightSearchLeg {
  from: string;
  to: string;
  date: string;
  offers: FlightOffer[];
}

export interface FlightSearchResult {
  legs: FlightSearchLeg[];
  passengers: { adults: number; children: number; infants: number };
  cabin: CabinClass;
  /** True when results come from the development provider, not real airline inventory. */
  demo: boolean;
}

export interface PriceLine {
  label: string;
  amountPaise: number;
}

export interface PriceBreakdown {
  lines: PriceLine[];
  basePaise: number;
  taxesPaise: number;
  feesPaise: number;
  discountPaise: number;
  totalPaise: number;
  currency: 'INR';
}

export interface BookingPassengerInfo {
  id: string;
  type: PassengerType;
  title: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string | null;
  gender: 'MALE' | 'FEMALE' | 'OTHER';
}

export interface FlightBookingLeg {
  sequence: number;
  offer: FlightOffer;
  pnr: string | null;
  tickets: { passengerId: string; ticketNumber: string }[];
}

export interface BookingDetails {
  reference: string;
  serviceType: 'FLIGHT';
  status: BookingStatus;
  paymentStatus: PaymentStatus;
  createdAt: string;
  holdExpiresAt: string | null;
  confirmedAt: string | null;
  cancelledAt: string | null;
  travelDate: string;
  price: PriceBreakdown;
  contact: { email: string; phone: string };
  passengers: BookingPassengerInfo[];
  flights: FlightBookingLeg[];
}

export interface BookingListItem {
  reference: string;
  serviceType: string;
  status: BookingStatus;
  paymentStatus: PaymentStatus;
  title: string;
  subtitle: string;
  travelDate: string;
  totalPaise: number;
  createdAt: string;
}

export interface PaymentOrder {
  paymentId: string;
  provider: string;
  providerOrderId: string;
  amountPaise: number;
  currency: 'INR';
  /** Public key for the provider's checkout (never a secret). */
  publicKey: string | null;
  bookingReference: string;
  holdExpiresAt: string | null;
}
