import type { City, Offer } from '../types';

export const CITIES: City[] = [
  { code: 'PNQ', name: 'Pune', state: 'Maharashtra', airport: 'Pune Intl (PNQ)', station: 'Pune Jn (PUNE)' },
  { code: 'BOM', name: 'Mumbai', state: 'Maharashtra', airport: 'Chhatrapati Shivaji Intl (BOM)', station: 'Mumbai CSMT (CSMT)' },
  { code: 'DEL', name: 'Delhi', state: 'Delhi', airport: 'Indira Gandhi Intl (DEL)', station: 'New Delhi (NDLS)' },
  { code: 'BLR', name: 'Bengaluru', state: 'Karnataka', airport: 'Kempegowda Intl (BLR)', station: 'KSR Bengaluru (SBC)' },
  { code: 'HYD', name: 'Hyderabad', state: 'Telangana', airport: 'Rajiv Gandhi Intl (HYD)', station: 'Secunderabad Jn (SC)' },
  { code: 'MAA', name: 'Chennai', state: 'Tamil Nadu', airport: 'Chennai Intl (MAA)', station: 'Chennai Central (MAS)' },
  { code: 'CCU', name: 'Kolkata', state: 'West Bengal', airport: 'Netaji Subhas Intl (CCU)', station: 'Howrah Jn (HWH)' },
  { code: 'GOI', name: 'Goa', state: 'Goa', airport: 'Dabolim (GOI)', station: 'Madgaon (MAO)' },
  { code: 'AMD', name: 'Ahmedabad', state: 'Gujarat', airport: 'SVPI Airport (AMD)', station: 'Ahmedabad Jn (ADI)' },
  { code: 'JAI', name: 'Jaipur', state: 'Rajasthan', airport: 'Jaipur Intl (JAI)', station: 'Jaipur Jn (JP)' },
  { code: 'NAG', name: 'Nagpur', state: 'Maharashtra', airport: 'Dr. Ambedkar Intl (NAG)', station: 'Nagpur Jn (NGP)' },
  { code: 'ISK', name: 'Nashik', state: 'Maharashtra', airport: 'Nashik (ISK)', station: 'Nasik Road (NK)' },
  { code: 'IXU', name: 'Aurangabad', state: 'Maharashtra', airport: 'Aurangabad (IXU)', station: 'Aurangabad (AWB)' },
  { code: 'KLH', name: 'Kolhapur', state: 'Maharashtra', airport: 'Kolhapur (KLH)', station: 'Kolhapur (KOP)' },
  { code: 'LKO', name: 'Lucknow', state: 'Uttar Pradesh', airport: 'CCS Intl (LKO)', station: 'Lucknow (LKO)' },
  { code: 'COK', name: 'Kochi', state: 'Kerala', airport: 'Cochin Intl (COK)', station: 'Ernakulam Jn (ERS)' },
  { code: 'IDR', name: 'Indore', state: 'Madhya Pradesh', airport: 'Devi Ahilya Bai Holkar (IDR)', station: 'Indore Jn (INDB)' },
  { code: 'IXC', name: 'Chandigarh', state: 'Chandigarh', airport: 'Chandigarh Intl (IXC)', station: 'Chandigarh (CDG)' },
];

export const BUS_OPERATORS = [
  'Zproo Express',
  'IntrCity SmartBus',
  'Neeta Travels',
  'Prasanna Purple',
  'VRL Travels',
  'Orange Tours',
  'Hans Travels',
  'Shrinath Travels',
  'MSRTC Shivneri',
  'Kesari Tours',
];
export const BUS_TYPES = [
  'A/C Sleeper (2+1)',
  'Volvo Multi-Axle A/C Semi Sleeper (2+2)',
  'Non A/C Seater (2+2)',
  'A/C Seater / Sleeper (2+1)',
  'Bharat Benz A/C Sleeper (2+1)',
];
export const BUS_AMENITIES = ['WiFi', 'Charging point', 'Water bottle', 'Blanket', 'Reading light', 'CCTV', 'Track my bus'];

export const AIRLINES = [
  { name: 'IndiGo', code: '6E' },
  { name: 'Air India', code: 'AI' },
  { name: 'Akasa Air', code: 'QP' },
  { name: 'SpiceJet', code: 'SG' },
  { name: 'Air India Express', code: 'IX' },
];

export const TRAIN_NAMES = [
  'Rajdhani Express',
  'Duronto Express',
  'Shatabdi Express',
  'Vande Bharat Express',
  'Superfast Express',
  'Garib Rath',
  'Deccan Queen',
  'Humsafar Express',
  'Sampark Kranti',
];

export const HOTEL_PREFIX = ['The Grand', 'Hotel', 'Zproo Stays', 'Treebo', 'Lemon Tree', 'Taj', 'Hyatt Regency', 'Ibis', 'FabHotel', 'Radisson Blu', 'Novotel', 'The Orchid'];
export const HOTEL_SUFFIX = ['Residency', 'Palace', 'Suites', 'Inn', 'Premier', 'Comfort', 'Plaza', 'Heritage', 'Grand'];
export const AREAS = ['City Centre', 'Near Airport', 'Railway Station', 'Business District', 'Old Town', 'Lakeside', 'Mall Road', 'Tech Park'];
export const HOTEL_AMENITIES = ['Free WiFi', 'Pool', 'Gym', 'Spa', 'Restaurant', 'Parking', 'Bar', 'Airport shuttle', 'AC', 'Room service', 'Breakfast'];

export const OFFERS: Offer[] = [
  { id: 'o1', code: 'ZPFIRST', title: 'Flat 15% off on your first trip', description: 'Valid on all buses, trains, flights and hotels. Max ₹500 off.', mode: 'all', percent: 15, maxDiscount: 500 },
  { id: 'o2', code: 'ZPBUS', title: 'Up to ₹250 off on buses', description: '10% off on bus tickets above ₹500.', mode: 'bus', percent: 10, maxDiscount: 250 },
  { id: 'o3', code: 'ZPFLY', title: 'Save up to ₹1,200 on flights', description: '8% off on domestic flights.', mode: 'flight', percent: 8, maxDiscount: 1200 },
  { id: 'o4', code: 'ZPSTAY', title: '20% off hotel stays', description: 'On stays of 2 nights or more. Max ₹2,000 off.', mode: 'hotel', percent: 20, maxDiscount: 2000 },
  { id: 'o5', code: 'ZPRAIL', title: 'Zero convenience fee on trains', description: 'Flat ₹40 off train bookings.', mode: 'train', percent: 100, maxDiscount: 40 },
];
