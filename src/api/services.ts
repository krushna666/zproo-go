import { request, setAuthToken } from './client';
import type {
  Booking,
  BusResult,
  City,
  FlightResult,
  HotelResult,
  HotelSearch,
  Offer,
  Selection,
  TrainResult,
  TransportSearch,
  Traveller,
  User,
} from './types';

export interface SeatLayout {
  decks: { name: string; rows: (Seat | null)[][] }[];
}
export interface Seat {
  id: string;
  type: 'seater' | 'sleeper';
  booked: boolean;
  ladies?: boolean;
  price: number;
}

export interface CreateBookingInput {
  selection: Selection;
  travellers: Traveller[];
  contact: { email: string; phone: string };
  couponCode?: string;
  paymentMethod: string;
}

export const api = {
  // Auth
  sendOtp: (phone: string) => request<{ sent: boolean }>('POST', '/auth/otp', { phone }),
  verifyOtp: async (phone: string, otp: string, name?: string) => {
    const user = await request<User>('POST', '/auth/verify', { phone, otp, name });
    setAuthToken(user.token);
    return user;
  },

  // Masters
  cities: (q = '') => request<City[]>('GET', `/cities?q=${encodeURIComponent(q)}`),
  offers: () => request<Offer[]>('GET', '/offers'),
  validateCoupon: (code: string, mode: string, amount: number) =>
    request<{ valid: boolean; discount: number; message: string }>('POST', '/offers/validate', {
      code,
      mode,
      amount,
    }),

  // Search
  searchBuses: (s: TransportSearch) => request<BusResult[]>('POST', '/search/bus', s),
  searchTrains: (s: TransportSearch) => request<TrainResult[]>('POST', '/search/train', s),
  searchFlights: (s: TransportSearch) => request<FlightResult[]>('POST', '/search/flight', s),
  searchHotels: (s: HotelSearch) => request<HotelResult[]>('POST', '/search/hotel', s),
  busSeats: (busId: string, date: string) =>
    request<SeatLayout>('GET', `/bus/${busId}/seats?date=${date}`),

  // Bookings
  createBooking: (input: CreateBookingInput) => request<Booking>('POST', '/bookings', input),
  bookings: () => request<Booking[]>('GET', '/bookings'),
  cancelBooking: (id: string) => request<Booking>('POST', `/bookings/${id}/cancel`),
};

export { setAuthToken };
