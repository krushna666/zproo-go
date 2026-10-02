import type { NavigatorScreenParams } from '@react-navigation/native';
import type {
  Booking,
  BusResult,
  FlightResult,
  HotelResult,
  HotelSearch,
  Mode,
  SearchParams,
  Selection,
  TrainResult,
  TransportSearch,
  Traveller,
} from '../api/types';

export type TabParamList = {
  Home: { mode?: Mode } | undefined;
  Bookings: undefined;
  Offers: undefined;
  Profile: undefined;
};

export type RootStackParamList = {
  Login: undefined;
  Main: NavigatorScreenParams<TabParamList> | undefined;
  Results: { search: SearchParams };
  BusSeats: { search: TransportSearch; bus: BusResult };
  TrainDetail: { search: TransportSearch; train: TrainResult };
  FlightDetail: { search: TransportSearch; flight: FlightResult };
  HotelDetail: { search: HotelSearch; hotel: HotelResult };
  Travellers: { selection: Selection };
  Payment: { selection: Selection; travellers: Traveller[]; contact: { email: string; phone: string } };
  Confirmation: { booking: Booking };
  BookingDetail: { booking: Booking };
};

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
