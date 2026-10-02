import { Ionicons } from '@expo/vector-icons';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useEffect, useState } from 'react';
import { Alert, Pressable, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { api } from '../api/services';
import type { City, Mode, Offer } from '../api/types';
import { CityPicker } from '../components/CityPicker';
import { DatePicker } from '../components/DatePicker';
import { Button, Card, Chip, Field, MODE_META, ModeIcon, Row, Stepper } from '../components/ui';
import type { RootStackParamList, TabParamList } from '../navigation/types';
import { useAuth } from '../store/auth';
import { colors, font, modeColors, radius, shadow, space } from '../theme';
import { addDays, daysBetween, formatDate, today } from '../utils/format';

const PNQ: City = { code: 'PNQ', name: 'Pune', state: 'Maharashtra', airport: 'Pune Intl (PNQ)', station: 'Pune Jn (PUNE)' };
const BOM: City = { code: 'BOM', name: 'Mumbai', state: 'Maharashtra', airport: 'Chhatrapati Shivaji Intl (BOM)', station: 'Mumbai CSMT (CSMT)' };
const GOI: City = { code: 'GOI', name: 'Goa', state: 'Goa', airport: 'Dabolim (GOI)', station: 'Madgaon (MAO)' };
const DEL: City = { code: 'DEL', name: 'Delhi', state: 'Delhi', airport: 'Indira Gandhi Intl (DEL)', station: 'New Delhi (NDLS)' };

const CABINS = ['Economy', 'Premium Economy', 'Business'] as const;

type Picker = null | 'from' | 'to' | 'city' | 'date' | 'checkIn' | 'checkOut';

export default function HomeScreen() {
  const nav = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<TabParamList, 'Home'>>();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();

  const [mode, setMode] = useState<Mode>('bus');
  const [routes, setRoutes] = useState<Record<'bus' | 'train' | 'flight', { from: City; to: City }>>({
    bus: { from: PNQ, to: BOM },
    train: { from: PNQ, to: DEL },
    flight: { from: PNQ, to: GOI },
  });
  const [date, setDate] = useState(addDays(today(), 1));
  const [passengers, setPassengers] = useState(1);
  const [cabin, setCabin] = useState<(typeof CABINS)[number]>('Economy');
  const [hotelCity, setHotelCity] = useState<City>(GOI);
  const [checkIn, setCheckIn] = useState(addDays(today(), 7));
  const [checkOut, setCheckOut] = useState(addDays(today(), 9));
  const [guests, setGuests] = useState(2);
  const [rooms, setRooms] = useState(1);
  const [picker, setPicker] = useState<Picker>(null);
  const [offers, setOffers] = useState<Offer[]>([]);

  useEffect(() => {
    if (route.params?.mode) setMode(route.params.mode);
  }, [route.params?.mode]);

  useEffect(() => {
    api.offers().then(setOffers).catch(() => {});
  }, []);

  const r = mode !== 'hotel' ? routes[mode] : null;
  const setRoute = (patch: Partial<{ from: City; to: City }>) =>
    mode !== 'hotel' && setRoutes((p) => ({ ...p, [mode]: { ...p[mode], ...patch } }));

  const search = () => {
    if (mode === 'hotel') {
      if (daysBetween(checkIn, checkOut) < 1) return Alert.alert('Check your dates', 'Check-out must be after check-in.');
      if (guests < rooms) return Alert.alert('Check guests', 'Each room needs at least one guest.');
      nav.navigate('Results', { search: { mode: 'hotel', city: hotelCity, checkIn, checkOut, guests, rooms } });
    } else if (r) {
      if (r.from.code === r.to.code) return Alert.alert('Same city', 'Origin and destination must be different.');
      nav.navigate('Results', {
        search: { mode, from: r.from, to: r.to, date, passengers, cabin: mode === 'flight' ? cabin : undefined },
      });
    }
  };

  const nights = daysBetween(checkIn, checkOut);
  const firstName = user?.name?.split(' ')[0] ?? 'there';

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScrollView contentContainerStyle={{ paddingBottom: 32 }} keyboardShouldPersistTaps="handled">
        <View style={{ backgroundColor: colors.primary, paddingTop: insets.top + space.lg, paddingHorizontal: space.xl, paddingBottom: 90 }}>
          <Row style={{ justifyContent: 'space-between' }}>
            <Row>
              <View style={{ width: 34, height: 34, borderRadius: 10, backgroundColor: colors.accent, alignItems: 'center', justifyContent: 'center', marginRight: 8 }}>
                <Text style={{ color: colors.white, fontWeight: '900', fontSize: 18 }}>Z</Text>
              </View>
              <Text style={{ color: colors.white, fontSize: 24, fontWeight: '900' }}>zproo</Text>
            </Row>
            <Pressable onPress={() => nav.navigate('Main', { screen: 'Offers' })} hitSlop={10}>
              <Ionicons name="pricetags-outline" size={24} color={colors.white} />
            </Pressable>
          </Row>
          <Text style={{ color: colors.white, fontSize: 22, fontWeight: '700', marginTop: space.xl }}>Hi {firstName}, where to next?</Text>
        </View>

        <View style={{ marginTop: -70, paddingHorizontal: space.lg }}>
          <View style={{ flexDirection: 'row', backgroundColor: colors.white, borderRadius: radius.lg, padding: 6, ...shadow }}>
            {(Object.keys(MODE_META) as Mode[]).map((m) => {
              const active = m === mode;
              return (
                <Pressable
                  key={m}
                  onPress={() => setMode(m)}
                  style={{
                    flex: 1,
                    alignItems: 'center',
                    paddingVertical: 10,
                    borderRadius: radius.md,
                    backgroundColor: active ? modeColors[m] + '18' : 'transparent',
                  }}
                >
                  <ModeIcon mode={m} size={26} color={active ? modeColors[m] : colors.textMuted} />
                  <Text style={{ marginTop: 4, fontSize: 13, fontWeight: active ? '800' : '600', color: active ? modeColors[m] : colors.textMuted }}>
                    {MODE_META[m].label}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <Card style={{ marginTop: space.md }}>
            {mode !== 'hotel' && r ? (
              <>
                <View>
                  <Field label="From" icon="radio-button-on" value={`${r.from.name} (${r.from.code})`} onPress={() => setPicker('from')} />
                  <Field label="To" icon="location" value={`${r.to.name} (${r.to.code})`} onPress={() => setPicker('to')} style={{ marginTop: 8 }} />
                  <Pressable
                    onPress={() => setRoute({ from: r.to, to: r.from })}
                    style={{
                      position: 'absolute',
                      right: 16,
                      top: 42,
                      width: 40,
                      height: 40,
                      borderRadius: 20,
                      backgroundColor: colors.white,
                      borderWidth: 1,
                      borderColor: colors.border,
                      alignItems: 'center',
                      justifyContent: 'center',
                      ...shadow,
                    }}
                  >
                    <Ionicons name="swap-vertical" size={20} color={colors.primary} />
                  </Pressable>
                </View>
                <Field label="Date of journey" icon="calendar-outline" value={formatDate(date)} onPress={() => setPicker('date')} style={{ marginTop: 8 }} />
                <Row style={{ marginTop: 10 }}>
                  <Chip label="Today" active={date === today()} onPress={() => setDate(today())} />
                  <Chip label="Tomorrow" active={date === addDays(today(), 1)} onPress={() => setDate(addDays(today(), 1))} />
                </Row>
                <Row style={{ justifyContent: 'space-between', marginTop: space.lg }}>
                  <View>
                    <Text style={font.label}>{mode === 'bus' ? 'SEATS' : 'PASSENGERS'}</Text>
                    <Text style={font.small}>Max 6 per booking</Text>
                  </View>
                  <Stepper value={passengers} max={6} onChange={setPassengers} />
                </Row>
                {mode === 'flight' && (
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: space.md }}>
                    {CABINS.map((c) => (
                      <Chip key={c} label={c} active={cabin === c} onPress={() => setCabin(c)} />
                    ))}
                  </ScrollView>
                )}
              </>
            ) : (
              <>
                <Field label="City or area" icon="business-outline" value={`${hotelCity.name}, ${hotelCity.state}`} onPress={() => setPicker('city')} />
                <Row style={{ marginTop: 8 }}>
                  <Field label="Check-in" value={formatDate(checkIn)} onPress={() => setPicker('checkIn')} style={{ flex: 1, marginRight: 8 }} />
                  <Field label="Check-out" value={formatDate(checkOut)} onPress={() => setPicker('checkOut')} style={{ flex: 1 }} />
                </Row>
                <Text style={[font.small, { marginTop: 6 }]}>
                  {nights} night{nights === 1 ? '' : 's'}
                </Text>
                <Row style={{ justifyContent: 'space-between', marginTop: space.lg }}>
                  <Text style={font.label}>ROOMS</Text>
                  <Stepper value={rooms} max={5} onChange={(v) => { setRooms(v); if (guests < v) setGuests(v); }} />
                </Row>
                <Row style={{ justifyContent: 'space-between', marginTop: space.md }}>
                  <Text style={font.label}>GUESTS</Text>
                  <Stepper value={guests} min={rooms} max={rooms * 4} onChange={setGuests} />
                </Row>
              </>
            )}
            <Button
              title={`Search ${mode === 'hotel' ? 'hotels' : mode === 'bus' ? 'buses' : mode + 's'}`}
              icon="search"
              variant="accent"
              onPress={search}
              style={{ marginTop: space.xl }}
            />
          </Card>

          {offers.length > 0 && (
            <>
              <Text style={[font.h2, { marginTop: space.xl, marginBottom: space.md }]}>Offers for you</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingRight: space.lg }}>
                {offers.map((o, i) => (
                  <View
                    key={o.id}
                    style={{
                      width: 250,
                      marginRight: 12,
                      borderRadius: radius.lg,
                      padding: space.lg,
                      backgroundColor: ['#1A3CFF', '#FF6A13', '#14A44D', '#B5179E', '#0F23A8'][i % 5],
                    }}
                  >
                    <Text style={{ color: colors.white, fontSize: 16, fontWeight: '800' }}>{o.title}</Text>
                    <Text style={{ color: 'rgba(255,255,255,0.85)', fontSize: 12, marginTop: 6 }} numberOfLines={2}>
                      {o.description}
                    </Text>
                    <View style={{ alignSelf: 'flex-start', marginTop: 12, borderWidth: 1, borderStyle: 'dashed', borderColor: colors.white, borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3 }}>
                      <Text style={{ color: colors.white, fontWeight: '800', letterSpacing: 1 }}>{o.code}</Text>
                    </View>
                  </View>
                ))}
              </ScrollView>
            </>
          )}

          <Text style={[font.h2, { marginTop: space.xl, marginBottom: space.md }]}>Why Zproo</Text>
          <Row style={{ justifyContent: 'space-between' }}>
            {[
              { icon: 'shield-checkmark-outline', t: 'Secure payments' },
              { icon: 'flash-outline', t: 'Instant tickets' },
              { icon: 'headset-outline', t: '24×7 support' },
            ].map((x) => (
              <View key={x.t} style={{ flex: 1, alignItems: 'center', backgroundColor: colors.white, borderRadius: radius.md, paddingVertical: space.lg, marginHorizontal: 4 }}>
                <Ionicons name={x.icon as any} size={24} color={colors.primary} />
                <Text style={[font.small, { marginTop: 6, fontWeight: '600', color: colors.text }]}>{x.t}</Text>
              </View>
            ))}
          </Row>
        </View>
      </ScrollView>

      <CityPicker
        visible={picker === 'from' || picker === 'to' || picker === 'city'}
        title={picker === 'from' ? 'Leaving from' : picker === 'to' ? 'Going to' : 'Where are you staying?'}
        mode={mode}
        exclude={picker === 'from' ? r?.to.code : picker === 'to' ? r?.from.code : undefined}
        onClose={() => setPicker(null)}
        onSelect={(c) => {
          if (picker === 'city') setHotelCity(c);
          else if (picker === 'from' || picker === 'to') setRoute({ [picker]: c });
          setPicker(null);
        }}
      />
      <DatePicker
        visible={picker === 'date' || picker === 'checkIn' || picker === 'checkOut'}
        title={picker === 'checkIn' ? 'Check-in date' : picker === 'checkOut' ? 'Check-out date' : 'Date of journey'}
        value={picker === 'checkIn' ? checkIn : picker === 'checkOut' ? checkOut : date}
        minDate={picker === 'checkOut' ? addDays(checkIn, 1) : today()}
        onClose={() => setPicker(null)}
        onSelect={(d) => {
          if (picker === 'checkIn') {
            setCheckIn(d);
            if (daysBetween(d, checkOut) < 1) setCheckOut(addDays(d, 1));
          } else if (picker === 'checkOut') setCheckOut(d);
          else setDate(d);
          setPicker(null);
        }}
      />
    </View>
  );
}
