/**
 * Reference places used by search forms (and, from Phase 4, by the database seed). One list,
 * so the web autocomplete and the API agree on codes.
 */

export interface Airport {
  /** IATA code */
  code: string;
  city: string;
  name: string;
  country: string;
}

export const AIRPORTS: readonly Airport[] = [
  { code: 'DEL', city: 'New Delhi', name: 'Indira Gandhi International Airport', country: 'India' },
  {
    code: 'BOM',
    city: 'Mumbai',
    name: 'Chhatrapati Shivaji Maharaj International Airport',
    country: 'India',
  },
  { code: 'BLR', city: 'Bengaluru', name: 'Kempegowda International Airport', country: 'India' },
  { code: 'HYD', city: 'Hyderabad', name: 'Rajiv Gandhi International Airport', country: 'India' },
  { code: 'MAA', city: 'Chennai', name: 'Chennai International Airport', country: 'India' },
  {
    code: 'CCU',
    city: 'Kolkata',
    name: 'Netaji Subhas Chandra Bose International Airport',
    country: 'India',
  },
  { code: 'PNQ', city: 'Pune', name: 'Pune Airport', country: 'India' },
  { code: 'GOI', city: 'Goa', name: 'Dabolim Airport', country: 'India' },
  { code: 'GOX', city: 'Goa', name: 'Manohar International Airport, Mopa', country: 'India' },
  {
    code: 'AMD',
    city: 'Ahmedabad',
    name: 'Sardar Vallabhbhai Patel International Airport',
    country: 'India',
  },
  { code: 'COK', city: 'Kochi', name: 'Cochin International Airport', country: 'India' },
  {
    code: 'TRV',
    city: 'Thiruvananthapuram',
    name: 'Trivandrum International Airport',
    country: 'India',
  },
  { code: 'JAI', city: 'Jaipur', name: 'Jaipur International Airport', country: 'India' },
  { code: 'UDR', city: 'Udaipur', name: 'Maharana Pratap Airport', country: 'India' },
  { code: 'SXR', city: 'Srinagar', name: 'Sheikh ul-Alam International Airport', country: 'India' },
  { code: 'KUU', city: 'Kullu–Manali', name: 'Bhuntar Airport', country: 'India' },
  { code: 'IXC', city: 'Chandigarh', name: 'Chandigarh International Airport', country: 'India' },
  {
    code: 'LKO',
    city: 'Lucknow',
    name: 'Chaudhary Charan Singh International Airport',
    country: 'India',
  },
  {
    code: 'NAG',
    city: 'Nagpur',
    name: 'Dr. Babasaheb Ambedkar International Airport',
    country: 'India',
  },
  { code: 'IXB', city: 'Bagdogra', name: 'Bagdogra Airport', country: 'India' },
  {
    code: 'GAU',
    city: 'Guwahati',
    name: 'Lokpriya Gopinath Bordoloi International Airport',
    country: 'India',
  },
  {
    code: 'VNS',
    city: 'Varanasi',
    name: 'Lal Bahadur Shastri International Airport',
    country: 'India',
  },
  {
    code: 'DXB',
    city: 'Dubai',
    name: 'Dubai International Airport',
    country: 'United Arab Emirates',
  },
  { code: 'SIN', city: 'Singapore', name: 'Singapore Changi Airport', country: 'Singapore' },
  { code: 'BKK', city: 'Bangkok', name: 'Suvarnabhumi Airport', country: 'Thailand' },
  { code: 'LHR', city: 'London', name: 'Heathrow Airport', country: 'United Kingdom' },
];

export interface City {
  /** Stable slug, used in URLs and as the bus/hotel search key. */
  code: string;
  name: string;
  state: string;
}

export const CITIES: readonly City[] = [
  { code: 'pune', name: 'Pune', state: 'Maharashtra' },
  { code: 'mumbai', name: 'Mumbai', state: 'Maharashtra' },
  { code: 'delhi', name: 'New Delhi', state: 'Delhi' },
  { code: 'bengaluru', name: 'Bengaluru', state: 'Karnataka' },
  { code: 'hyderabad', name: 'Hyderabad', state: 'Telangana' },
  { code: 'chennai', name: 'Chennai', state: 'Tamil Nadu' },
  { code: 'goa', name: 'Goa', state: 'Goa' },
  { code: 'nashik', name: 'Nashik', state: 'Maharashtra' },
  { code: 'nagpur', name: 'Nagpur', state: 'Maharashtra' },
  { code: 'kolhapur', name: 'Kolhapur', state: 'Maharashtra' },
  { code: 'ahmedabad', name: 'Ahmedabad', state: 'Gujarat' },
  { code: 'jaipur', name: 'Jaipur', state: 'Rajasthan' },
  { code: 'udaipur', name: 'Udaipur', state: 'Rajasthan' },
  { code: 'manali', name: 'Manali', state: 'Himachal Pradesh' },
  { code: 'shimla', name: 'Shimla', state: 'Himachal Pradesh' },
  { code: 'srinagar', name: 'Srinagar', state: 'Jammu and Kashmir' },
  { code: 'kochi', name: 'Kochi', state: 'Kerala' },
  { code: 'munnar', name: 'Munnar', state: 'Kerala' },
  { code: 'alleppey', name: 'Alappuzha', state: 'Kerala' },
  { code: 'mysuru', name: 'Mysuru', state: 'Karnataka' },
  { code: 'indore', name: 'Indore', state: 'Madhya Pradesh' },
  { code: 'lucknow', name: 'Lucknow', state: 'Uttar Pradesh' },
  { code: 'chandigarh', name: 'Chandigarh', state: 'Chandigarh' },
  { code: 'kolkata', name: 'Kolkata', state: 'West Bengal' },
];

export interface TrainStation {
  /** Indian Railways station code */
  code: string;
  name: string;
  city: string;
}

export const TRAIN_STATIONS: readonly TrainStation[] = [
  { code: 'PUNE', name: 'Pune Junction', city: 'Pune' },
  { code: 'CSMT', name: 'Mumbai CSMT', city: 'Mumbai' },
  { code: 'MMCT', name: 'Mumbai Central', city: 'Mumbai' },
  { code: 'NDLS', name: 'New Delhi', city: 'New Delhi' },
  { code: 'NZM', name: 'Hazrat Nizamuddin', city: 'New Delhi' },
  { code: 'SBC', name: 'KSR Bengaluru', city: 'Bengaluru' },
  { code: 'SC', name: 'Secunderabad Junction', city: 'Hyderabad' },
  { code: 'MAS', name: 'Chennai Central', city: 'Chennai' },
  { code: 'HWH', name: 'Howrah Junction', city: 'Kolkata' },
  { code: 'MAO', name: 'Madgaon Junction', city: 'Goa' },
  { code: 'ADI', name: 'Ahmedabad Junction', city: 'Ahmedabad' },
  { code: 'JP', name: 'Jaipur Junction', city: 'Jaipur' },
  { code: 'ERS', name: 'Ernakulam Junction', city: 'Kochi' },
  { code: 'NGP', name: 'Nagpur Junction', city: 'Nagpur' },
  { code: 'LKO', name: 'Lucknow Charbagh', city: 'Lucknow' },
  { code: 'BSB', name: 'Varanasi Junction', city: 'Varanasi' },
];

export function findAirport(code: string): Airport | undefined {
  return AIRPORTS.find((a) => a.code === code);
}

export function findCity(code: string): City | undefined {
  return CITIES.find((c) => c.code === code);
}

export function findStation(code: string): TrainStation | undefined {
  return TRAIN_STATIONS.find((s) => s.code === code);
}
