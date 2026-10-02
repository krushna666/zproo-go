import { Ionicons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useEffect, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { BottomBar, Button, Card, Rating, Row } from '../components/ui';
import type { RootStackParamList } from '../navigation/types';
import { colors, font, radius, space } from '../theme';
import { daysBetween, formatDate, inr } from '../utils/format';

type Props = NativeStackScreenProps<RootStackParamList, 'HotelDetail'>;

const AMENITY_ICONS: Record<string, any> = {
  'Free WiFi': 'wifi',
  Pool: 'water-outline',
  Gym: 'barbell-outline',
  Spa: 'leaf-outline',
  Restaurant: 'restaurant-outline',
  Parking: 'car-outline',
  Bar: 'wine-outline',
  'Airport shuttle': 'bus-outline',
  AC: 'snow-outline',
  'Room service': 'notifications-outline',
  Breakfast: 'cafe-outline',
};

export default function HotelDetailScreen({ navigation, route }: Props) {
  const { hotel, search } = route.params;
  const [roomId, setRoomId] = useState(hotel.rooms[0].id);
  const room = hotel.rooms.find((r) => r.id === roomId)!;
  const nights = daysBetween(search.checkIn, search.checkOut);

  useEffect(() => {
    navigation.setOptions({ title: '' });
  }, [navigation]);

  const proceed = () =>
    navigation.navigate('Travellers', {
      selection: {
        mode: 'hotel',
        search,
        itemId: hotel.id,
        title: hotel.name,
        subtitle: `${formatDate(search.checkIn)} – ${formatDate(search.checkOut)} · ${search.guests} guests`,
        optionLabel: `${search.rooms} × ${room.name}${room.breakfast ? ' · Breakfast' : ''}`,
        units: search.rooms,
        unitPrice: room.pricePerNight,
        nights,
      },
    });

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScrollView>
        <View style={{ height: 200, backgroundColor: `hsl(${hotel.hue}, 55%, 40%)`, justifyContent: 'flex-end', padding: space.xl, overflow: 'hidden' }}>
          <View style={{ position: 'absolute', right: -40, top: -40, width: 200, height: 200, borderRadius: 100, backgroundColor: 'rgba(255,255,255,0.12)' }} />
          <View style={{ position: 'absolute', left: -30, bottom: -60, width: 160, height: 160, borderRadius: 80, backgroundColor: 'rgba(255,255,255,0.08)' }} />
          <Text style={{ color: '#FFD45C', fontSize: 14 }}>{'★'.repeat(hotel.stars)}</Text>
          <Text style={{ color: colors.white, fontSize: 24, fontWeight: '800' }}>{hotel.name}</Text>
          <Row style={{ marginTop: 4 }}>
            <Ionicons name="location" size={14} color="rgba(255,255,255,0.85)" />
            <Text style={{ color: 'rgba(255,255,255,0.85)', marginLeft: 4 }}>
              {hotel.area}, {search.city.name}
            </Text>
          </Row>
        </View>

        <View style={{ padding: space.lg }}>
          <Card>
            <Row style={{ justifyContent: 'space-between' }}>
              <Row>
                <Rating value={hotel.rating} />
                <Text style={[font.small, { marginLeft: 8 }]}>{hotel.reviews.toLocaleString('en-IN')} verified reviews</Text>
              </Row>
            </Row>
            <Row style={{ marginTop: space.md, justifyContent: 'space-between' }}>
              <View>
                <Text style={font.label}>CHECK-IN</Text>
                <Text style={font.h3}>{formatDate(search.checkIn)}</Text>
                <Text style={font.small}>from 12:00</Text>
              </View>
              <View style={{ alignItems: 'center', justifyContent: 'center' }}>
                <Text style={font.small}>
                  {nights} night{nights > 1 ? 's' : ''}
                </Text>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={font.label}>CHECK-OUT</Text>
                <Text style={font.h3}>{formatDate(search.checkOut)}</Text>
                <Text style={font.small}>until 11:00</Text>
              </View>
            </Row>
          </Card>

          <Text style={[font.h3, { marginTop: space.xl, marginBottom: space.sm }]}>Amenities</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
            {hotel.amenities.map((a) => (
              <Row key={a} style={{ width: '50%', marginBottom: 10 }}>
                <Ionicons name={AMENITY_ICONS[a] ?? 'checkmark-circle-outline'} size={18} color={colors.primary} />
                <Text style={[font.body, { marginLeft: 8 }]}>{a}</Text>
              </Row>
            ))}
          </View>

          <Text style={[font.h3, { marginTop: space.lg, marginBottom: space.sm }]}>Choose your room</Text>
          {hotel.rooms.map((r) => {
            const active = r.id === roomId;
            return (
              <Pressable
                key={r.id}
                onPress={() => setRoomId(r.id)}
                style={{
                  backgroundColor: colors.white,
                  borderRadius: radius.md,
                  padding: space.lg,
                  marginBottom: 10,
                  borderWidth: 1.5,
                  borderColor: active ? colors.primary : colors.border,
                }}
              >
                <Row style={{ justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <Row style={{ flex: 1 }}>
                    <Ionicons name={active ? 'radio-button-on' : 'radio-button-off'} size={22} color={active ? colors.primary : colors.textFaint} />
                    <View style={{ marginLeft: 10, flex: 1 }}>
                      <Text style={font.h3}>{r.name}</Text>
                      <Text style={font.small}>{r.bed}</Text>
                    </View>
                  </Row>
                  <View style={{ alignItems: 'flex-end' }}>
                    <Text style={{ fontSize: 18, fontWeight: '800', color: colors.text }}>{inr(r.pricePerNight)}</Text>
                    <Text style={{ fontSize: 11, color: colors.textMuted }}>per room / night</Text>
                  </View>
                </Row>
                <Row style={{ marginLeft: 32, marginTop: 8 }}>
                  <Text style={{ fontSize: 12, fontWeight: '600', color: r.refundable ? colors.success : colors.danger, marginRight: 12 }}>
                    {r.refundable ? '✓ Free cancellation' : 'Non-refundable'}
                  </Text>
                  <Text style={{ fontSize: 12, fontWeight: '600', color: r.breakfast ? colors.success : colors.textFaint }}>
                    {r.breakfast ? '✓ Breakfast included' : 'Room only'}
                  </Text>
                </Row>
              </Pressable>
            );
          })}
        </View>
      </ScrollView>
      <BottomBar>
        <View style={{ flex: 1 }}>
          <Text style={font.small}>
            {search.rooms} room × {nights} night{nights > 1 ? 's' : ''}
          </Text>
          <Text style={{ fontSize: 20, fontWeight: '800', color: colors.text }}>{inr(room.pricePerNight * search.rooms * nights)}</Text>
        </View>
        <Button title="Reserve" onPress={proceed} style={{ paddingHorizontal: 28 }} />
      </BottomBar>
    </View>
  );
}
