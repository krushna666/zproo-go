/**
 * Timetable for the development (mock) flight provider: airports, airlines and ~100 scheduled
 * services. Airlines are fictional on purpose — invented schedules and fares must not be shown
 * under real airline names. Deterministic and idempotent; also loaded by the API test setup.
 */
import type { PrismaClient } from '@prisma/client';
import { AIRPORTS, airportTimezone } from '@zproo/config';

export const MOCK_AIRLINES = [
  { code: 'SF', name: 'Saffron Air' },
  { code: 'MN', name: 'Monsoon Airways' },
  { code: 'DB', name: 'Deccan Blue' },
  { code: 'CW', name: 'Coral Wings' },
  { code: 'HM', name: 'Himalaya Air' },
  { code: 'GS', name: 'Gulf Star' },
] as const;

/** [from, to, economy base fare in rupees, block time in minutes] — flown in both directions. */
const ROUTES: [string, string, number, number][] = [
  ['PNQ', 'DEL', 3900, 140],
  ['BOM', 'GOI', 2300, 75],
  ['BLR', 'DEL', 4500, 170],
  ['DEL', 'SXR', 3200, 90],
  ['HYD', 'COK', 2900, 100],
  ['BOM', 'DXB', 9800, 190],
  ['PNQ', 'BLR', 3000, 100],
  ['BOM', 'DEL', 4200, 135],
  ['PNQ', 'GOI', 2600, 60],
  ['DEL', 'GOI', 5200, 155],
  ['BLR', 'HYD', 2500, 75],
  ['MAA', 'DEL', 5100, 170],
  ['CCU', 'DEL', 4600, 135],
  ['DEL', 'DXB', 11500, 225],
  ['PNQ', 'HYD', 2800, 85],
  ['BOM', 'BLR', 3400, 105],
  ['DEL', 'JAI', 2100, 60],
  ['BOM', 'COK', 3800, 120],
  ['BLR', 'COK', 2400, 70],
  ['PNQ', 'BOM', 1900, 45],
];

/** One-stop journeys: [from, via, to]. */
const CONNECTIONS: [string, string, string][] = [
  ['PNQ', 'DEL', 'SXR'],
  ['SXR', 'DEL', 'PNQ'],
  ['PNQ', 'BLR', 'COK'],
  ['PNQ', 'BOM', 'DXB'],
  ['GOI', 'BOM', 'DEL'],
  ['HYD', 'BLR', 'DEL'],
];

const SLOTS = [
  '05:40',
  '06:55',
  '08:25',
  '09:50',
  '11:15',
  '13:05',
  '14:40',
  '16:30',
  '18:15',
  '19:45',
  '21:20',
  '22:50',
];
const DOMESTIC = ['SF', 'MN', 'DB', 'CW', 'HM'];

function prng(seed: number) {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const toMinutes = (hhmm: string) => Number(hhmm.slice(0, 2)) * 60 + Number(hhmm.slice(3));
const toHhmm = (minutes: number) => {
  const m = ((minutes % 1440) + 1440) % 1440;
  return `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`;
};

interface SegmentPlan {
  from: string;
  to: string;
  departureTime: string;
  dayOffset: number;
  durationMinutes: number;
}

interface FlightPlan {
  airline: string;
  flightNumber: string;
  segments: SegmentPlan[];
  baseFareRupees: number;
  aircraft: string;
  daysOfWeek: number[];
  premium: boolean;
}

export function buildTimetable(): FlightPlan[] {
  const random = prng(4242);
  const pick = <T>(list: readonly T[]) => list[Math.floor(random() * list.length)] as T;
  const counters = new Map<string, number>();
  const nextNumber = (airline: string) => {
    const n =
      (counters.get(airline) ?? 100 + Math.floor(random() * 50)) + 7 + Math.floor(random() * 40);
    counters.set(airline, n);
    return `${airline} ${n}`;
  };
  const route = new Map(
    ROUTES.flatMap(([a, b, fare, mins]) => [
      [`${a}-${b}`, { fare, mins }],
      [`${b}-${a}`, { fare, mins }],
    ]),
  );
  const plans: FlightPlan[] = [];

  for (const [a, b, fare, mins] of ROUTES) {
    for (const [from, to] of [
      [a, b],
      [b, a],
    ] as const) {
      const international = from === 'DXB' || to === 'DXB';
      const services = international ? 2 : fare > 4000 ? 3 : 2 + Math.floor(random() * 2);
      const slots = [...SLOTS]
        .sort(() => random() - 0.5)
        .slice(0, services)
        .sort();
      slots.forEach((slot, i) => {
        const airline = international ? (i === 0 ? 'GS' : pick(['SF', 'MN'])) : pick(DOMESTIC);
        const daily = random() < 0.75;
        plans.push({
          airline,
          flightNumber: nextNumber(airline),
          segments: [
            {
              from,
              to,
              departureTime: slot,
              dayOffset: 0,
              durationMinutes: mins + Math.floor(random() * 3) * 5,
            },
          ],
          baseFareRupees: Math.round((fare * (0.9 + random() * 0.25)) / 10) * 10,
          aircraft: international
            ? pick(['A321neo', 'B737-8'])
            : mins <= 75
              ? pick(['ATR 72-600', 'A320neo'])
              : pick(['A320neo', 'A321neo', 'B737-8']),
          daysOfWeek: daily ? [1, 2, 3, 4, 5, 6, 7] : [1, 3, 5, 6, 7],
          premium: !international && mins >= 120 && random() < 0.5,
        });
      });
    }
  }

  for (const [from, via, to] of CONNECTIONS) {
    const first = route.get(`${from}-${via}`);
    const second = route.get(`${via}-${to}`);
    if (!first || !second) throw new Error(`Missing route for connection ${from}-${via}-${to}`);
    const airline = to === 'DXB' || from === 'DXB' ? 'SF' : pick(DOMESTIC);
    const departure = toMinutes(pick(SLOTS.slice(0, 8)));
    const layover = 70 + Math.floor(random() * 6) * 15;
    const secondDeparture = departure + first.mins + layover;
    plans.push({
      airline,
      flightNumber: nextNumber(airline),
      segments: [
        {
          from,
          to: via,
          departureTime: toHhmm(departure),
          dayOffset: 0,
          durationMinutes: first.mins,
        },
        {
          from: via,
          to,
          departureTime: toHhmm(secondDeparture),
          dayOffset: Math.floor(secondDeparture / 1440),
          durationMinutes: second.mins,
        },
      ],
      baseFareRupees: Math.round(((first.fare + second.fare) * 0.72) / 10) * 10,
      aircraft: 'A320neo',
      daysOfWeek: [1, 2, 3, 4, 5, 6, 7],
      premium: false,
    });
  }
  return plans;
}

export async function seedFlightData(prisma: PrismaClient): Promise<{ flights: number }> {
  for (const airport of AIRPORTS) {
    await prisma.airport.upsert({
      where: { code: airport.code },
      update: {
        name: airport.name,
        city: airport.city,
        country: airport.country,
        timezone: airportTimezone(airport),
      },
      create: {
        code: airport.code,
        name: airport.name,
        city: airport.city,
        country: airport.country,
        timezone: airportTimezone(airport),
      },
    });
  }
  for (const airline of MOCK_AIRLINES) {
    await prisma.airline.upsert({
      where: { code: airline.code },
      update: { name: airline.name },
      create: airline,
    });
  }
  const airports = new Map((await prisma.airport.findMany()).map((a) => [a.code, a.id]));
  const airlines = new Map((await prisma.airline.findMany()).map((a) => [a.code, a.id]));
  const id = (map: Map<string, string>, key: string) => {
    const value = map.get(key);
    if (!value) throw new Error(`Unknown code ${key}`);
    return value;
  };

  const plans = buildTimetable();
  for (const plan of plans) {
    const first = plan.segments[0];
    const last = plan.segments.at(-1);
    if (!first || !last) continue;
    const airlineId = id(airlines, plan.airline);
    const data = {
      originId: id(airports, first.from),
      destinationId: id(airports, last.to),
      daysOfWeek: plan.daysOfWeek,
      baseFarePaise: plan.baseFareRupees * 100,
      seatsEconomy: plan.aircraft.startsWith('ATR') ? 70 : 150,
      seatsPremium: plan.premium ? 12 : 0,
      seatsBusiness: plan.premium ? 8 : 0,
      seatsFirst: 0,
      aircraft: plan.aircraft,
    };
    const flight = await prisma.flight.upsert({
      where: { airlineId_flightNumber: { airlineId, flightNumber: plan.flightNumber } },
      update: data,
      create: { airlineId, flightNumber: plan.flightNumber, ...data },
    });
    await prisma.flightSegment.deleteMany({ where: { flightId: flight.id } });
    await prisma.flightSegment.createMany({
      data: plan.segments.map((seg, i) => ({
        flightId: flight.id,
        sequence: i + 1,
        airlineId,
        flightNumber: plan.flightNumber,
        originId: id(airports, seg.from),
        destinationId: id(airports, seg.to),
        departureTime: seg.departureTime,
        dayOffset: seg.dayOffset,
        durationMinutes: seg.durationMinutes,
      })),
    });
  }
  return { flights: plans.length };
}
