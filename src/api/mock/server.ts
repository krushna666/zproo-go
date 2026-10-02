/**
 * In-app mock of the Zproo REST API. Results are generated deterministically
 * from the route and date, so the same search always returns the same list.
 * Bookings are persisted on the device with AsyncStorage.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import type {
  Booking,
  BusResult,
  City,
  FlightResult,
  HotelResult,
  HotelSearch,
  TrainResult,
  TransportSearch,
  User,
} from '../types';
import { computeFare } from '../pricing';
import type { CreateBookingInput, SeatLayout } from '../services';
import {
  AIRLINES,
  AREAS,
  BUS_AMENITIES,
  BUS_OPERATORS,
  BUS_TYPES,
  CITIES,
  HOTEL_AMENITIES,
  HOTEL_PREFIX,
  HOTEL_SUFFIX,
  OFFERS,
  TRAIN_NAMES,
} from './data';

const BOOKINGS_KEY = 'zproo.mock.bookings.v1';

// ---------- helpers ----------
function hash(str: string) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}
function rng(seed: string) {
  let a = hash(seed);
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const pick = <T,>(r: () => number, arr: T[]) => arr[Math.floor(r() * arr.length)];
const between = (r: () => number, min: number, max: number) => Math.floor(min + r() * (max - min + 1));
const pad = (n: number) => String(n).padStart(2, '0');
const toTime = (mins: number) => `${pad(Math.floor((mins % 1440) / 60))}:${pad(mins % 60)}`;
const round = (n: number, step = 10) => Math.round(n / step) * step;

const COORDS: Record<string, [number, number]> = {
  PNQ: [18.52, 73.86], BOM: [19.08, 72.88], DEL: [28.61, 77.21], BLR: [12.97, 77.59],
  HYD: [17.39, 78.49], MAA: [13.08, 80.27], CCU: [22.57, 88.36], GOI: [15.3, 74.12],
  AMD: [23.02, 72.57], JAI: [26.91, 75.79], NAG: [21.15, 79.09], ISK: [20.0, 73.79],
  IXU: [19.88, 75.34], KLH: [16.7, 74.24], LKO: [26.85, 80.95], COK: [9.93, 76.27],
  IDR: [22.72, 75.86], IXC: [30.73, 76.78],
};
function distanceKm(a: City, b: City) {
  const [la1, lo1] = COORDS[a.code] ?? [20, 77];
  const [la2, lo2] = COORDS[b.code] ?? [21, 78];
  const R = 6371;
  const dLa = ((la2 - la1) * Math.PI) / 180;
  const dLo = ((lo2 - lo1) * Math.PI) / 180;
  const x = Math.sin(dLa / 2) ** 2 + Math.cos((la1 * Math.PI) / 180) * Math.cos((la2 * Math.PI) / 180) * Math.sin(dLo / 2) ** 2;
  return Math.max(80, Math.round(2 * R * Math.asin(Math.sqrt(x)) * 1.25)); // road factor
}

function fail(message: string, status = 400): never {
  throw { message, status };
}

// ---------- generators ----------
function searchBuses(s: TransportSearch): BusResult[] {
  const r = rng(`bus|${s.from.code}|${s.to.code}|${s.date}`);
  const km = distanceKm(s.from, s.to);
  if (km > 1500) return [];
  const count = between(r, 8, 14);
  return Array.from({ length: count }, (_, i) => {
    const dep = between(r, 0, 95) * 15;
    const duration = Math.round((km / between(r, 45, 60)) * 60);
    const type = pick(r, BUS_TYPES);
    const ac = type.includes('A/C') && !type.startsWith('Non');
    const perKm = ac ? (type.includes('Sleeper') ? 1.9 : 1.5) : 1.05;
    return {
      id: `B${hash(`${s.from.code}${s.to.code}${s.date}${i}`).toString(36)}`,
      operator: pick(r, BUS_OPERATORS),
      busType: type,
      departure: toTime(dep),
      arrival: toTime(dep + duration),
      durationMins: duration,
      price: round(Math.max(299, km * perKm * (0.85 + r() * 0.4))),
      rating: Math.round((3.3 + r() * 1.6) * 10) / 10,
      seatsLeft: between(r, 3, 36),
      amenities: BUS_AMENITIES.filter(() => r() > 0.45),
      boardingPoints: [`${s.from.name} Bus Stand`, `${s.from.name} Highway Point`, `${s.from.name} Central`],
      droppingPoints: [`${s.to.name} Bus Stand`, `${s.to.name} Bypass`, `${s.to.name} Main Square`],
    };
  }).sort((a, b) => a.departure.localeCompare(b.departure));
}

function searchTrains(s: TransportSearch): TrainResult[] {
  const r = rng(`train|${s.from.code}|${s.to.code}|${s.date}`);
  const km = distanceKm(s.from, s.to);
  const count = between(r, 5, 9);
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  return Array.from({ length: count }, (_, i) => {
    const name = pick(r, TRAIN_NAMES);
    const fast = /Rajdhani|Vande|Shatabdi|Duronto/.test(name);
    const dep = between(r, 0, 95) * 15;
    const duration = Math.round((km / (fast ? between(r, 70, 85) : between(r, 48, 62))) * 60);
    const chair = /Shatabdi|Vande/.test(name);
    const defs = chair
      ? [
          { code: 'CC', name: 'AC Chair Car', mult: 1.35 },
          { code: 'EC', name: 'Executive Chair', mult: 2.6 },
        ]
      : [
          { code: 'SL', name: 'Sleeper', mult: 0.45 },
          { code: '3A', name: 'AC 3 Tier', mult: 1.15 },
          { code: '2A', name: 'AC 2 Tier', mult: 1.65 },
          { code: '1A', name: 'AC First Class', mult: 2.8 },
        ].filter((c) => !(fast && c.code === 'SL'));
    return {
      id: `T${hash(`${s.from.code}${s.to.code}${s.date}${i}`).toString(36)}`,
      number: String(between(r, 11000, 22999)),
      name: `${s.from.name}–${s.to.name} ${name}`,
      departure: toTime(dep),
      arrival: toTime(dep + duration),
      durationMins: duration,
      runsOn: days.filter(() => r() > 0.25),
      classes: defs.map((c) => {
        const roll = r();
        const available = roll > 0.3 ? between(r, 1, 120) : 0;
        return {
          code: c.code,
          name: c.name,
          price: round(Math.max(150, km * c.mult) + 40, 5),
          available,
          availability: available > 0 ? `AVL ${available}` : roll > 0.15 ? `RAC ${between(r, 1, 20)}` : `WL ${between(r, 1, 60)}`,
        };
      }),
    };
  }).sort((a, b) => a.departure.localeCompare(b.departure));
}

function searchFlights(s: TransportSearch): FlightResult[] {
  const r = rng(`flight|${s.from.code}|${s.to.code}|${s.date}|${s.cabin}`);
  const km = distanceKm(s.from, s.to) / 1.25;
  if (km < 150) return [];
  const count = between(r, 7, 14);
  const cabinMult = s.cabin === 'Business' ? 3.4 : s.cabin === 'Premium Economy' ? 1.6 : 1;
  const hubs = CITIES.filter((c) => ['DEL', 'BOM', 'BLR', 'HYD'].includes(c.code) && c.code !== s.from.code && c.code !== s.to.code);
  return Array.from({ length: count }, (_, i) => {
    const al = pick(r, AIRLINES);
    const stops = r() > 0.72 ? 1 : 0;
    const dep = between(r, 20, 92) * 15;
    const duration = Math.round(35 + km / 8.2) + (stops ? between(r, 70, 200) : 0);
    const base = round((2400 + km * 3.4) * (0.8 + r() * 0.6) * cabinMult * (stops ? 0.88 : 1));
    return {
      id: `F${hash(`${s.from.code}${s.to.code}${s.date}${i}`).toString(36)}`,
      airline: al.name,
      airlineCode: al.code,
      flightNumber: `${al.code} ${between(r, 100, 6999)}`,
      departure: toTime(dep),
      arrival: toTime(dep + duration),
      durationMins: duration,
      stops,
      stopCity: stops ? pick(r, hubs).name : undefined,
      price: base,
      fares: [
        { id: 'saver', name: 'Saver', price: base, baggage: '15 kg check-in, 7 kg cabin', cancellation: 'Cancellation fee ₹3,500', meal: false },
        { id: 'flexi', name: 'Flexi', price: round(base * 1.18), baggage: '15 kg check-in, 7 kg cabin', cancellation: 'Cancellation fee ₹1,500', meal: true },
        { id: 'super', name: 'Super Flexi', price: round(base * 1.38), baggage: '25 kg check-in, 7 kg cabin', cancellation: 'Free cancellation up to 24 hrs', meal: true },
      ],
    };
  }).sort((a, b) => a.price - b.price);
}

function searchHotels(s: HotelSearch): HotelResult[] {
  const r = rng(`hotel|${s.city.code}|${s.checkIn}`);
  const count = between(r, 10, 16);
  const used = new Set<string>();
  const list: HotelResult[] = [];
  for (let i = 0; i < count; i++) {
    let name = `${pick(r, HOTEL_PREFIX)} ${s.city.name} ${pick(r, HOTEL_SUFFIX)}`;
    if (used.has(name)) name = `${name} ${i}`;
    used.add(name);
    const stars = between(r, 2, 5);
    const nightly = round(stars * stars * 380 + between(r, 600, 2400), 50);
    list.push({
      id: `H${hash(`${s.city.code}${i}${name}`).toString(36)}`,
      name,
      area: pick(r, AREAS),
      stars,
      rating: Math.round((3.4 + r() * 1.5) * 10) / 10,
      reviews: between(r, 40, 4800),
      pricePerNight: nightly,
      amenities: HOTEL_AMENITIES.filter(() => r() > 0.4 + (5 - stars) * 0.06),
      hue: between(r, 0, 359),
      rooms: [
        { id: 'std', name: 'Standard Room', bed: '1 Queen bed', pricePerNight: nightly, refundable: false, breakfast: false },
        { id: 'dlx', name: 'Deluxe Room', bed: '1 King bed', pricePerNight: round(nightly * 1.3, 50), refundable: true, breakfast: true },
        { id: 'ste', name: 'Executive Suite', bed: '1 King bed + sofa', pricePerNight: round(nightly * 2.1, 50), refundable: true, breakfast: true },
      ],
    });
  }
  return list.sort((a, b) => b.rating - a.rating);
}

function busSeats(busId: string, date: string): SeatLayout {
  const r = rng(`seats|${busId}|${date}`);
  const price = 0; // per-seat price comes from the bus result on the client
  const mkDeck = (name: string, prefix: string, sleeper: boolean) => {
    const rows: (null | { id: string; type: 'seater' | 'sleeper'; booked: boolean; ladies?: boolean; price: number })[][] = [];
    const rowCount = sleeper ? 6 : 10;
    for (let row = 0; row < rowCount; row++) {
      const cols = sleeper ? [0, null, 1, 2] : [0, 1, null, 2, 3];
      rows.push(
        cols.map((c) =>
          c === null
            ? null
            : {
                id: `${prefix}${row * (sleeper ? 3 : 4) + c + 1}`,
                type: sleeper ? 'sleeper' : 'seater',
                booked: r() < 0.38,
                ladies: r() < 0.08,
                price,
              },
        ),
      );
    }
    return { name, rows };
  };
  return r() > 0.4
    ? { decks: [mkDeck('Lower deck', 'L', true), mkDeck('Upper deck', 'U', true)] }
    : { decks: [mkDeck('Seats', 'S', false)] };
}

// ---------- bookings ----------
async function loadBookings(): Promise<Booking[]> {
  const raw = await AsyncStorage.getItem(BOOKINGS_KEY);
  return raw ? JSON.parse(raw) : [];
}
async function saveBookings(list: Booking[]) {
  await AsyncStorage.setItem(BOOKINGS_KEY, JSON.stringify(list));
}

async function createBooking(input: CreateBookingInput): Promise<Booking> {
  if (!input.travellers.length) fail('Add at least one traveller');
  if (input.travellers.some((t) => !t.name.trim())) fail('Enter the name of every traveller');
  if (!/^\S+@\S+\.\S+$/.test(input.contact.email)) fail('Enter a valid email address');
  if (!/^\d{10}$/.test(input.contact.phone)) fail('Enter a 10-digit mobile number');
  const offer = input.couponCode ? OFFERS.find((o) => o.code === input.couponCode!.toUpperCase()) : undefined;
  const booking: Booking = {
    id: `ZP${Date.now().toString(36).toUpperCase()}`,
    pnr: Math.random().toString(36).slice(2, 8).toUpperCase(),
    createdAt: new Date().toISOString(),
    status: 'CONFIRMED',
    selection: input.selection,
    travellers: input.travellers,
    contact: input.contact,
    fare: computeFare(input.selection, offer),
    paymentMethod: input.paymentMethod,
  };
  const list = await loadBookings();
  await saveBookings([booking, ...list]);
  return booking;
}

// ---------- router ----------
export async function mockServer(method: string, fullPath: string, body: any): Promise<unknown> {
  const [path, qs = ''] = fullPath.split('?');
  const query = Object.fromEntries(qs.split('&').filter(Boolean).map((p) => p.split('=').map(decodeURIComponent)));
  const route = `${method} ${path}`;

  switch (true) {
    case route === 'POST /auth/otp':
      if (!/^\d{10}$/.test(body?.phone ?? '')) fail('Enter a valid 10-digit mobile number');
      return { sent: true };
    case route === 'POST /auth/verify': {
      if (body?.otp !== '123456') fail('Incorrect OTP. Use 123456 in demo mode.', 401);
      const user: User = {
        id: `U${body.phone}`,
        name: body.name?.trim() || 'Zproo Traveller',
        phone: body.phone,
        email: '',
        token: `mock-token-${body.phone}`,
      };
      return user;
    }
    case route === 'GET /cities': {
      const q = (query.q ?? '').toLowerCase();
      return CITIES.filter((c) => !q || c.name.toLowerCase().includes(q) || c.code.toLowerCase().includes(q));
    }
    case route === 'GET /offers':
      return OFFERS;
    case route === 'POST /offers/validate': {
      const offer = OFFERS.find((o) => o.code === String(body?.code ?? '').toUpperCase());
      if (!offer) return { valid: false, discount: 0, message: 'This coupon code is not valid' };
      if (offer.mode !== 'all' && offer.mode !== body.mode)
        return { valid: false, discount: 0, message: `${offer.code} is only valid on ${offer.mode} bookings` };
      const discount = Math.min(Math.round((body.amount * offer.percent) / 100), offer.maxDiscount);
      return { valid: true, discount, message: `${offer.code} applied. You save ₹${discount}` };
    }
    case route === 'POST /search/bus':
      return searchBuses(body);
    case route === 'POST /search/train':
      return searchTrains(body);
    case route === 'POST /search/flight':
      return searchFlights(body);
    case route === 'POST /search/hotel':
      return searchHotels(body);
    case method === 'GET' && /^\/bus\/[^/]+\/seats$/.test(path):
      return busSeats(path.split('/')[2], query.date ?? '');
    case route === 'POST /bookings':
      return createBooking(body);
    case route === 'GET /bookings':
      return loadBookings();
    case method === 'POST' && /^\/bookings\/[^/]+\/cancel$/.test(path): {
      const id = path.split('/')[2];
      const list = await loadBookings();
      const b = list.find((x) => x.id === id);
      if (!b) fail('Booking not found', 404);
      b.status = 'CANCELLED';
      await saveBookings(list);
      return b;
    }
    default:
      fail(`No mock for ${route}`, 404);
  }
}
