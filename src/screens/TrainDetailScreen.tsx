import { Ionicons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useEffect, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { BottomBar, Button, Card, Row } from '../components/ui';
import type { RootStackParamList } from '../navigation/types';
import { colors, font, radius, space } from '../theme';
import { formatDate, formatDuration, inr } from '../utils/format';

type Props = NativeStackScreenProps<RootStackParamList, 'TrainDetail'>;

export default function TrainDetailScreen({ navigation, route }: Props) {
  const { train, search } = route.params;
  const firstAvail = train.classes.find((c) => c.available > 0) ?? train.classes[0];
  const [cls, setCls] = useState(firstAvail.code);
  const chosen = train.classes.find((c) => c.code === cls)!;

  useEffect(() => {
    navigation.setOptions({ title: `${train.number}` });
  }, [navigation, train.number]);

  const proceed = () =>
    navigation.navigate('Travellers', {
      selection: {
        mode: 'train',
        search,
        itemId: train.id,
        title: `${train.number} ${train.name}`,
        subtitle: `${search.from.station ?? search.from.name} → ${search.to.station ?? search.to.name} · ${formatDate(search.date)} · ${train.departure}`,
        optionLabel: `${chosen.name} (${chosen.code}) · ${chosen.availability}`,
        units: search.passengers,
        unitPrice: chosen.price,
      },
    });

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScrollView contentContainerStyle={{ padding: space.lg }}>
        <Card>
          <Text style={font.h3}>{train.name}</Text>
          <Text style={font.small}>
            Train #{train.number} · Runs {train.runsOn.length === 7 ? 'daily' : train.runsOn.join(', ')}
          </Text>
          <Row style={{ marginTop: space.lg, justifyContent: 'space-between' }}>
            <View>
              <Text style={{ fontSize: 22, fontWeight: '800', color: colors.text }}>{train.departure}</Text>
              <Text style={font.small}>{search.from.station}</Text>
            </View>
            <Text style={font.small}>{formatDuration(train.durationMins)}</Text>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={{ fontSize: 22, fontWeight: '800', color: colors.text }}>{train.arrival}</Text>
              <Text style={font.small}>{search.to.station}</Text>
            </View>
          </Row>
        </Card>

        <Text style={[font.h3, { marginTop: space.xl, marginBottom: space.sm }]}>Choose class</Text>
        {train.classes.map((c) => {
          const active = c.code === cls;
          const avl = c.available > 0;
          const wl = c.availability.startsWith('WL');
          return (
            <Pressable
              key={c.code}
              onPress={() => setCls(c.code)}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: colors.white,
                borderRadius: radius.md,
                padding: space.lg,
                marginBottom: 10,
                borderWidth: 1.5,
                borderColor: active ? colors.primary : colors.border,
              }}
            >
              <Ionicons name={active ? 'radio-button-on' : 'radio-button-off'} size={22} color={active ? colors.primary : colors.textFaint} />
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={font.h3}>
                  {c.name} ({c.code})
                </Text>
                <Text style={{ marginTop: 3, fontWeight: '700', fontSize: 13, color: avl ? colors.success : wl ? colors.danger : '#B07C00' }}>{c.availability}</Text>
              </View>
              <Text style={{ fontSize: 18, fontWeight: '800', color: colors.text }}>{inr(c.price)}</Text>
            </Pressable>
          );
        })}
        {chosen.available === 0 && (
          <Card style={{ backgroundColor: '#FFF8E1', marginTop: 4 }}>
            <Text style={[font.small, { color: '#7A5A00' }]}>
              This class is {chosen.availability.startsWith('WL') ? 'waitlisted' : 'on RAC'}. Your ticket will be confirmed if seats free up; otherwise the
              fare is refunded automatically.
            </Text>
          </Card>
        )}
      </ScrollView>
      <BottomBar>
        <View style={{ flex: 1 }}>
          <Text style={font.small}>
            {search.passengers} × {inr(chosen.price)}
          </Text>
          <Text style={{ fontSize: 20, fontWeight: '800', color: colors.text }}>{inr(chosen.price * search.passengers)}</Text>
        </View>
        <Button title="Book now" onPress={proceed} style={{ paddingHorizontal: 28 }} />
      </BottomBar>
    </View>
  );
}
