import { Ionicons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useEffect, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { BottomBar, Button, Card, Divider, Row } from '../components/ui';
import type { RootStackParamList } from '../navigation/types';
import { colors, font, modeColors, radius, space } from '../theme';
import { formatDate, formatDuration, inr } from '../utils/format';

type Props = NativeStackScreenProps<RootStackParamList, 'FlightDetail'>;

export default function FlightDetailScreen({ navigation, route }: Props) {
  const { flight, search } = route.params;
  const [fareId, setFareId] = useState(flight.fares[1]?.id ?? flight.fares[0].id);
  const fare = flight.fares.find((f) => f.id === fareId)!;

  useEffect(() => {
    navigation.setOptions({ title: flight.flightNumber });
  }, [navigation, flight.flightNumber]);

  const proceed = () =>
    navigation.navigate('Travellers', {
      selection: {
        mode: 'flight',
        search,
        itemId: flight.id,
        title: `${flight.airline} ${flight.flightNumber}`,
        subtitle: `${search.from.code} → ${search.to.code} · ${formatDate(search.date)} · ${flight.departure}`,
        optionLabel: `${search.cabin ?? 'Economy'} · ${fare.name} fare`,
        units: search.passengers,
        unitPrice: fare.price,
      },
    });

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScrollView contentContainerStyle={{ padding: space.lg }}>
        <Card>
          <Row>
            <View style={{ width: 40, height: 40, borderRadius: 10, backgroundColor: modeColors.flight + '15', alignItems: 'center', justifyContent: 'center', marginRight: 10 }}>
              <Text style={{ fontWeight: '900', color: modeColors.flight }}>{flight.airlineCode}</Text>
            </View>
            <View>
              <Text style={font.h3}>{flight.airline}</Text>
              <Text style={font.small}>
                {flight.flightNumber} · {search.cabin ?? 'Economy'}
              </Text>
            </View>
          </Row>
          <Divider />
          <Row style={{ justifyContent: 'space-between' }}>
            <View>
              <Text style={{ fontSize: 22, fontWeight: '800', color: colors.text }}>{flight.departure}</Text>
              <Text style={font.h3}>{search.from.code}</Text>
              <Text style={font.small}>{search.from.name}</Text>
            </View>
            <View style={{ alignItems: 'center' }}>
              <Ionicons name="airplane" size={20} color={colors.primary} />
              <Text style={font.small}>{formatDuration(flight.durationMins)}</Text>
              <Text style={[font.small, { fontSize: 11 }]}>{flight.stops ? `via ${flight.stopCity}` : 'Non-stop'}</Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={{ fontSize: 22, fontWeight: '800', color: colors.text }}>{flight.arrival}</Text>
              <Text style={font.h3}>{search.to.code}</Text>
              <Text style={font.small}>{search.to.name}</Text>
            </View>
          </Row>
        </Card>

        <Text style={[font.h3, { marginTop: space.xl, marginBottom: space.sm }]}>Select a fare</Text>
        {flight.fares.map((f) => {
          const active = f.id === fareId;
          return (
            <Pressable
              key={f.id}
              onPress={() => setFareId(f.id)}
              style={{
                backgroundColor: colors.white,
                borderRadius: radius.md,
                padding: space.lg,
                marginBottom: 10,
                borderWidth: 1.5,
                borderColor: active ? colors.primary : colors.border,
              }}
            >
              <Row style={{ justifyContent: 'space-between' }}>
                <Row>
                  <Ionicons name={active ? 'radio-button-on' : 'radio-button-off'} size={22} color={active ? colors.primary : colors.textFaint} />
                  <Text style={[font.h3, { marginLeft: 10 }]}>{f.name}</Text>
                </Row>
                <Text style={{ fontSize: 18, fontWeight: '800', color: colors.text }}>{inr(f.price)}</Text>
              </Row>
              <View style={{ marginLeft: 32, marginTop: 8 }}>
                <Perk icon="briefcase-outline" text={f.baggage} />
                <Perk icon="refresh-outline" text={f.cancellation} />
                <Perk icon="restaurant-outline" text={f.meal ? 'Complimentary meal' : 'Meals for purchase'} muted={!f.meal} />
              </View>
            </Pressable>
          );
        })}
      </ScrollView>
      <BottomBar>
        <View style={{ flex: 1 }}>
          <Text style={font.small}>
            {search.passengers} traveller{search.passengers > 1 ? 's' : ''} · {fare.name}
          </Text>
          <Text style={{ fontSize: 20, fontWeight: '800', color: colors.text }}>{inr(fare.price * search.passengers)}</Text>
        </View>
        <Button title="Continue" onPress={proceed} style={{ paddingHorizontal: 28 }} />
      </BottomBar>
    </View>
  );
}

function Perk({ icon, text, muted }: { icon: any; text: string; muted?: boolean }) {
  return (
    <Row style={{ marginTop: 4 }}>
      <Ionicons name={icon} size={14} color={muted ? colors.textFaint : colors.success} />
      <Text style={[font.small, { marginLeft: 6, color: muted ? colors.textFaint : colors.textMuted }]}>{text}</Text>
    </Row>
  );
}
