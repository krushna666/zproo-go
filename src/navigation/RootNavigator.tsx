import { Ionicons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { DefaultTheme, NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import { Loading } from '../components/ui';
import BookingDetailScreen from '../screens/BookingDetailScreen';
import BookingsScreen from '../screens/BookingsScreen';
import BusSeatsScreen from '../screens/BusSeatsScreen';
import ConfirmationScreen from '../screens/ConfirmationScreen';
import FlightDetailScreen from '../screens/FlightDetailScreen';
import HomeScreen from '../screens/HomeScreen';
import HotelDetailScreen from '../screens/HotelDetailScreen';
import LoginScreen from '../screens/LoginScreen';
import OffersScreen from '../screens/OffersScreen';
import PaymentScreen from '../screens/PaymentScreen';
import ProfileScreen from '../screens/ProfileScreen';
import ResultsScreen from '../screens/ResultsScreen';
import TrainDetailScreen from '../screens/TrainDetailScreen';
import TravellersScreen from '../screens/TravellersScreen';
import { useAuth } from '../store/auth';
import { colors } from '../theme';
import type { RootStackParamList, TabParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<TabParamList>();

const TAB_ICONS: Record<keyof TabParamList, [any, any]> = {
  Home: ['home', 'home-outline'],
  Bookings: ['briefcase', 'briefcase-outline'],
  Offers: ['pricetags', 'pricetags-outline'],
  Profile: ['person', 'person-outline'],
};

function Tabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textFaint,
        tabBarLabelStyle: { fontWeight: '600', fontSize: 11 },
        tabBarIcon: ({ focused, color, size }) => <Ionicons name={TAB_ICONS[route.name][focused ? 0 : 1]} size={size} color={color} />,
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Bookings" component={BookingsScreen} options={{ title: 'My Trips' }} />
      <Tab.Screen name="Offers" component={OffersScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

const theme = {
  ...DefaultTheme,
  colors: { ...DefaultTheme.colors, primary: colors.primary, background: colors.bg, card: colors.white, text: colors.text, border: colors.border },
};

export default function RootNavigator() {
  const { user, ready } = useAuth();
  if (!ready) return <Loading label="" />;

  return (
    <NavigationContainer theme={theme}>
      <Stack.Navigator
        screenOptions={{
          headerTintColor: colors.text,
          headerTitleStyle: { fontWeight: '700' },
          headerShadowVisible: false,
          contentStyle: { backgroundColor: colors.bg },
        }}
      >
        {!user ? (
          <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
        ) : (
          <>
            <Stack.Screen name="Main" component={Tabs} options={{ headerShown: false }} />
            <Stack.Screen name="Results" component={ResultsScreen} />
            <Stack.Screen name="BusSeats" component={BusSeatsScreen} options={{ title: 'Select seats' }} />
            <Stack.Screen name="TrainDetail" component={TrainDetailScreen} />
            <Stack.Screen name="FlightDetail" component={FlightDetailScreen} />
            <Stack.Screen name="HotelDetail" component={HotelDetailScreen} />
            <Stack.Screen name="Travellers" component={TravellersScreen} options={{ title: 'Traveller details' }} />
            <Stack.Screen name="Payment" component={PaymentScreen} options={{ title: 'Review & pay' }} />
            <Stack.Screen name="Confirmation" component={ConfirmationScreen} options={{ title: 'Ticket' }} />
            <Stack.Screen name="BookingDetail" component={BookingDetailScreen} options={{ title: 'Booking details' }} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
