/**
 * UI page map. Every customer-facing route is registered from day one so navigation never
 * leads to a broken link; each renders a placeholder until its phase ships and replaces it
 * with the real page.
 */
export interface PlannedRoute {
  path: string;
  title: string;
  description: string;
  phase: number;
}

export const PUBLIC_ROUTES: readonly PlannedRoute[] = [
  // Flights — Phase 4
  {
    path: '/flights',
    title: 'Flights',
    description: 'Search one-way, round-trip and multi-city flights.',
    phase: 4,
  },
  {
    path: '/flights/results',
    title: 'Flight results',
    description: 'Compare fares, timings, stops and baggage.',
    phase: 4,
  },
  {
    path: '/flights/booking',
    title: 'Passenger details',
    description: 'Add travellers, seats and add-ons.',
    phase: 4,
  },
  {
    path: '/flights/review',
    title: 'Review flight',
    description: 'Check your itinerary and fare breakdown.',
    phase: 4,
  },
  {
    path: '/flights/payment',
    title: 'Flight payment',
    description: 'Pay securely with UPI, cards, net banking or wallet.',
    phase: 4,
  },
  {
    path: '/flights/confirmation',
    title: 'Flight confirmed',
    description: 'Your e-ticket and booking reference.',
    phase: 4,
  },
  {
    path: '/flights/:id',
    title: 'Flight details',
    description: 'Fare rules, baggage and refundability.',
    phase: 4,
  },
  // Buses — Phase 5
  {
    path: '/buses',
    title: 'Buses',
    description: 'AC, sleeper, seater, Volvo and electric buses.',
    phase: 5,
  },
  {
    path: '/buses/results',
    title: 'Bus results',
    description: 'Operators, ratings, amenities and live seat counts.',
    phase: 5,
  },
  {
    path: '/buses/:id',
    title: 'Bus details',
    description: 'Route, amenities, boarding and dropping points.',
    phase: 5,
  },
  {
    path: '/buses/:id/seats',
    title: 'Choose seats',
    description: 'Pick window, aisle or ladies seats.',
    phase: 5,
  },
  // Trains — Phase 6
  { path: '/trains', title: 'Trains', description: 'Search trains across all classes.', phase: 6 },
  {
    path: '/trains/results',
    title: 'Train results',
    description: 'Availability and fares by class.',
    phase: 6,
  },
  // Hotels — Phase 7
  { path: '/hotels', title: 'Hotels', description: 'Stays in top destinations.', phase: 7 },
  {
    path: '/hotels/results',
    title: 'Hotel results',
    description: 'Filter by price, rating, amenities and location.',
    phase: 7,
  },
  {
    path: '/hotels/:id',
    title: 'Hotel details',
    description: 'Photos, amenities, policies and reviews.',
    phase: 7,
  },
  {
    path: '/hotels/:id/rooms',
    title: 'Choose a room',
    description: 'Room types, inclusions and cancellation terms.',
    phase: 7,
  },
  // Mobility — Phases 8–9
  {
    path: '/cabs',
    title: 'Cabs',
    description: 'Book a mini, sedan, SUV or premium ride.',
    phase: 8,
  },
  {
    path: '/cabs/booking',
    title: 'Confirm your cab',
    description: 'Fare estimate, ETA and driver assignment.',
    phase: 8,
  },
  {
    path: '/rides/:id',
    title: 'Track your ride',
    description: 'Live driver location and trip status.',
    phase: 8,
  },
  {
    path: '/bikes',
    title: 'Bike taxi',
    description: 'Beat traffic with a quick bike ride.',
    phase: 9,
  },
  // Holidays, parcel, corporate — Phases 10–12
  {
    path: '/holidays',
    title: 'Holiday packages',
    description: 'Domestic, international, honeymoon, family and more.',
    phase: 10,
  },
  {
    path: '/holidays/:id',
    title: 'Holiday details',
    description: 'Itinerary, inclusions and terms.',
    phase: 10,
  },
  {
    path: '/parcel',
    title: 'Parcel delivery',
    description: 'Send parcels safely, tracked end to end.',
    phase: 11,
  },
  {
    path: '/parcel/track/:id',
    title: 'Track parcel',
    description: 'Live status of your parcel.',
    phase: 11,
  },
  {
    path: '/corporate',
    title: 'Corporate travel',
    description: 'Policies, approvals, GST invoices and reports.',
    phase: 12,
  },
  // Account & money — Phases 2, 13, 15
  {
    path: '/offers',
    title: 'Offers',
    description: 'Coupons, cashback and bank offers.',
    phase: 13,
  },
  {
    path: '/wallet',
    title: 'ZPROO Wallet',
    description: 'Add money, pay faster and earn cashback.',
    phase: 13,
  },
  {
    path: '/bookings',
    title: 'My bookings',
    description: 'Upcoming, completed and cancelled trips.',
    phase: 15,
  },
  {
    path: '/bookings/:id',
    title: 'Booking details',
    description: 'Tickets, invoices, cancellation and refunds.',
    phase: 15,
  },
  {
    path: '/profile',
    title: 'My profile',
    description: 'Account, travellers, addresses and settings.',
    phase: 2,
  },
  // Support & company — Phases 3, 17
  { path: '/help', title: 'Help center', description: 'Answers and 24×7 support.', phase: 17 },
  { path: '/contact', title: 'Contact us', description: 'Reach the ZPROO GO team.', phase: 17 },
  { path: '/about', title: 'About ZPROO GO', description: 'One app for every journey.', phase: 3 },
  {
    path: '/terms',
    title: 'Terms of use',
    description: 'The terms that govern ZPROO GO.',
    phase: 3,
  },
  { path: '/privacy', title: 'Privacy policy', description: 'How we protect your data.', phase: 3 },
  {
    path: '/refund-policy',
    title: 'Refund policy',
    description: 'Cancellations and refunds explained.',
    phase: 3,
  },
];

export const AUTH_ROUTES: readonly PlannedRoute[] = [
  {
    path: '/login',
    title: 'Welcome back',
    description: 'Log in with your mobile number or email.',
    phase: 2,
  },
  {
    path: '/signup',
    title: 'Create your account',
    description: 'Sign up with your mobile number in seconds.',
    phase: 2,
  },
  {
    path: '/verify-otp',
    title: 'Verify OTP',
    description: 'Enter the 6-digit code sent to your mobile.',
    phase: 2,
  },
  {
    path: '/forgot-password',
    title: 'Forgot password',
    description: 'We will send you a reset code.',
    phase: 2,
  },
  {
    path: '/reset-password',
    title: 'Reset password',
    description: 'Choose a new password.',
    phase: 2,
  },
];
