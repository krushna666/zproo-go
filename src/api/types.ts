export type Mode = 'bus' | 'train' | 'flight' | 'hotel';

export interface City {
  code: string;
  name: string;
  state: string;
  airport?: string;
  station?: string;
}

export interface TransportSearch {
  mode: 'bus' | 'train' | 'flight';
  from: City;
  to: City;
  date: string; // YYYY-MM-DD
  passengers: number;
  cabin?: 'Economy' | 'Premium Economy' | 'Business';
}

export interface HotelSearch {
  mode: 'hotel';
  city: City;
  checkIn: string;
  checkOut: string;
  guests: number;
  rooms: number;
}

export type SearchParams = TransportSearch | HotelSearch;

export interface BusResult {
  id: string;
  operator: string;
  busType: string;
  departure: string; // HH:mm
  arrival: string;
  durationMins: number;
  price: number;
  rating: number;
  seatsLeft: number;
  amenities: string[];
  boardingPoints: string[];
  droppingPoints: string[];
}

export interface TrainClass {
  code: string; // SL, 3A, 2A, 1A, CC
  name: string;
  price: number;
  availability: string; // e.g. AVL 42, WL 12, RAC 4
  available: number;
}

export interface TrainResult {
  id: string;
  number: string;
  name: string;
  departure: string;
  arrival: string;
  durationMins: number;
  runsOn: string[];
  classes: TrainClass[];
}

export interface FlightFare {
  id: string;
  name: string; // Saver, Flexi, Super Flexi
  price: number;
  baggage: string;
  cancellation: string;
  meal: boolean;
}

export interface FlightResult {
  id: string;
  airline: string;
  airlineCode: string;
  flightNumber: string;
  departure: string;
  arrival: string;
  durationMins: number;
  stops: number;
  stopCity?: string;
  price: number;
  fares: FlightFare[];
}

export interface HotelRoom {
  id: string;
  name: string;
  bed: string;
  pricePerNight: number;
  refundable: boolean;
  breakfast: boolean;
}

export interface HotelResult {
  id: string;
  name: string;
  area: string;
  stars: number;
  rating: number;
  reviews: number;
  pricePerNight: number;
  amenities: string[];
  hue: number; // used to draw a placeholder header
  rooms: HotelRoom[];
}

export type SearchResult = BusResult | TrainResult | FlightResult | HotelResult;

export interface Traveller {
  name: string;
  age: string;
  gender: 'M' | 'F' | 'O';
}

export interface Selection {
  mode: Mode;
  search: SearchParams;
  title: string; // e.g. "IntrCity SmartBus" or hotel name
  subtitle: string; // route / dates
  optionLabel: string; // seats "L4, L5" / class "3A" / fare "Flexi" / room "Deluxe"
  units: number;
  unitPrice: number;
  nights?: number;
  seats?: string[];
  itemId: string;
}

export type BookingStatus = 'CONFIRMED' | 'CANCELLED';

export interface Booking {
  id: string;
  pnr: string;
  createdAt: string;
  status: BookingStatus;
  selection: Selection;
  travellers: Traveller[];
  contact: { email: string; phone: string };
  fare: { base: number; taxes: number; fee: number; discount: number; total: number };
  paymentMethod: string;
}

export interface User {
  id: string;
  name: string;
  phone: string;
  email: string;
  token: string;
}

export interface Offer {
  id: string;
  code: string;
  title: string;
  description: string;
  mode: Mode | 'all';
  percent: number;
  maxDiscount: number;
}
