import { Ionicons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useCallback, useEffect, useState } from 'react';
import { Alert, Pressable, ScrollView, Text, View } from 'react-native';
import { api, SeatLayout } from '../api/services';
import { BottomBar, Button, Card, Chip, Empty, Loading, Row } from '../components/ui';
import type { RootStackParamList } from '../navigation/types';
import { colors, font, radius, space } from '../theme';
import { formatDate, formatDuration, inr } from '../utils/format';

type Props = NativeStackScreenProps<RootStackParamList, 'BusSeats'>;

export default function BusSeatsScreen({ navigation, route }: Props) {
  const { bus, search } = route.params;
  const [layout, setLayout] = useState<SeatLayout | null>(null);
  const [error, setError] = useState('');
  const [deck, setDeck] = useState(0);
  const [picked, setPicked] = useState<string[]>([]);
  const [boarding, setBoarding] = useState(bus.boardingPoints[0]);
  const [dropping, setDropping] = useState(bus.droppingPoints[0]);

  useEffect(() => {
    navigation.setOptions({ title: bus.operator });
  }, [navigation, bus.operator]);

  const load = useCallback(() => {
    setError('');
    setLayout(null);
    api.busSeats(bus.id, search.date).then(setLayout).catch((e) => setError(e.message));
  }, [bus.id, search.date]);
  useEffect(load, [load]);

  const toggle = (id: string) => {
    setPicked((p) => {
      if (p.includes(id)) return p.filter((x) => x !== id);
      if (p.length >= search.passengers) {
        Alert.alert('Seat limit', `You searched for ${search.passengers} seat${search.passengers > 1 ? 's' : ''}. Deselect a seat to pick another.`);
        return p;
      }
      return [...p, id];
    });
  };

  const proceed = () =>
    navigation.navigate('Travellers', {
      selection: {
        mode: 'bus',
        search,
        itemId: bus.id,
        title: bus.operator,
        subtitle: `${search.from.name} → ${search.to.name} · ${formatDate(search.date)} · ${bus.departure}`,
        optionLabel: `Seat ${picked.join(', ')} · ${boarding} → ${dropping}`,
        seats: picked,
        units: picked.length,
        unitPrice: bus.price,
      },
    });

  if (error) return <Empty icon="cloud-offline-outline" title="Couldn't load seats" message={error} action="Retry" onAction={load} />;
  if (!layout) return <Loading label="Loading seat map…" />;

  const d = layout.decks[deck];
  const sleeper = d.rows[0]?.find(Boolean)?.type === 'sleeper';

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScrollView contentContainerStyle={{ padding: space.lg, paddingBottom: 30 }}>
        <Card>
          <Text style={font.small}>{bus.busType}</Text>
          <Row style={{ marginTop: 6, justifyContent: 'space-between' }}>
            <Text style={font.h3}>
              {bus.departure} → {bus.arrival}
            </Text>
            <Text style={font.small}>{formatDuration(bus.durationMins)}</Text>
          </Row>
          <Row style={{ marginTop: 8, flexWrap: 'wrap' }}>
            {bus.amenities.map((a) => (
              <Text key={a} style={[font.small, { marginRight: 10 }]}>
                • {a}
              </Text>
            ))}
          </Row>
        </Card>

        {layout.decks.length > 1 && (
          <Row style={{ marginTop: space.lg }}>
            {layout.decks.map((x, i) => (
              <Chip key={x.name} label={x.name} active={deck === i} onPress={() => setDeck(i)} />
            ))}
          </Row>
        )}

        <Card style={{ marginTop: space.md, alignItems: 'center' }}>
          <Row style={{ alignSelf: 'stretch', justifyContent: 'flex-end', marginBottom: space.md }}>
            <Ionicons name="disc-outline" size={26} color={colors.textFaint} />
          </Row>
          {d.rows.map((row, ri) => (
            <Row key={ri} style={{ marginBottom: 10 }}>
              {row.map((seat, ci) => {
                if (!seat) return <View key={ci} style={{ width: 26 }} />;
                const sel = picked.includes(seat.id);
                const bg = seat.booked ? colors.border : sel ? colors.success : colors.white;
                const border = seat.booked ? colors.border : seat.ladies ? '#E85D9A' : colors.success;
                return (
                  <Pressable
                    key={seat.id}
                    disabled={seat.booked}
                    onPress={() => toggle(seat.id)}
                    style={{
                      width: sleeper ? 46 : 40,
                      height: sleeper ? 78 : 40,
                      marginHorizontal: 4,
                      borderRadius: 8,
                      borderWidth: 1.5,
                      borderColor: border,
                      backgroundColor: bg,
                      alignItems: 'center',
                      justifyContent: sleeper ? 'flex-end' : 'center',
                      paddingBottom: sleeper ? 6 : 0,
                    }}
                  >
                    {sleeper && <View style={{ position: 'absolute', bottom: 6, width: 26, height: 5, borderRadius: 3, backgroundColor: seat.booked ? colors.textFaint : sel ? colors.white : border, opacity: 0.6 }} />}
                    <Text style={{ fontSize: 10, fontWeight: '700', color: sel ? colors.white : seat.booked ? colors.textFaint : colors.text, marginBottom: sleeper ? 12 : 0 }}>
                      {seat.id}
                    </Text>
                  </Pressable>
                );
              })}
            </Row>
          ))}
          <Row style={{ marginTop: space.md, flexWrap: 'wrap', justifyContent: 'center' }}>
            {[
              { c: colors.white, b: colors.success, t: 'Available' },
              { c: colors.success, b: colors.success, t: 'Selected' },
              { c: colors.border, b: colors.border, t: 'Booked' },
              { c: colors.white, b: '#E85D9A', t: 'Ladies' },
            ].map((l) => (
              <Row key={l.t} style={{ marginHorizontal: 8, marginTop: 4 }}>
                <View style={{ width: 14, height: 14, borderRadius: 3, borderWidth: 1.5, borderColor: l.b, backgroundColor: l.c, marginRight: 5 }} />
                <Text style={font.small}>{l.t}</Text>
              </Row>
            ))}
          </Row>
        </Card>

        <Text style={[font.h3, { marginTop: space.xl, marginBottom: space.sm }]}>Boarding point</Text>
        {bus.boardingPoints.map((p) => (
          <PointRow key={p} label={p} active={boarding === p} onPress={() => setBoarding(p)} />
        ))}
        <Text style={[font.h3, { marginTop: space.lg, marginBottom: space.sm }]}>Dropping point</Text>
        {bus.droppingPoints.map((p) => (
          <PointRow key={p} label={p} active={dropping === p} onPress={() => setDropping(p)} />
        ))}
      </ScrollView>
      <BottomBar>
        <View style={{ flex: 1 }}>
          <Text style={font.small}>{picked.length ? `Seats: ${picked.join(', ')}` : `Select ${search.passengers} seat${search.passengers > 1 ? 's' : ''}`}</Text>
          <Text style={{ fontSize: 20, fontWeight: '800', color: colors.text }}>{inr(bus.price * picked.length)}</Text>
        </View>
        <Button title="Continue" disabled={picked.length === 0} onPress={proceed} style={{ paddingHorizontal: 28 }} />
      </BottomBar>
    </View>
  );
}

function PointRow({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        padding: space.md,
        borderRadius: radius.md,
        backgroundColor: colors.white,
        borderWidth: 1.5,
        borderColor: active ? colors.primary : colors.border,
        marginBottom: 8,
      }}
    >
      <Ionicons name={active ? 'radio-button-on' : 'radio-button-off'} size={20} color={active ? colors.primary : colors.textFaint} />
      <Text style={[font.body, { marginLeft: 10, fontWeight: active ? '700' : '400' }]}>{label}</Text>
    </Pressable>
  );
}
