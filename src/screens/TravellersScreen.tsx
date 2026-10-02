import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, Text, View } from 'react-native';
import type { Traveller } from '../api/types';
import { BottomBar, Button, Card, Chip, ModeIcon, Row, TextField } from '../components/ui';
import type { RootStackParamList } from '../navigation/types';
import { useAuth } from '../store/auth';
import { colors, font, space } from '../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'Travellers'>;

export default function TravellersScreen({ navigation, route }: Props) {
  const { selection } = route.params;
  const { user } = useAuth();
  const count = selection.mode === 'hotel' ? 1 : selection.units;
  const [travellers, setTravellers] = useState<Traveller[]>(
    Array.from({ length: count }, (_, i) => ({ name: i === 0 ? user?.name ?? '' : '', age: '', gender: 'M' as const })),
  );
  const [email, setEmail] = useState(user?.email ?? '');
  const [phone, setPhone] = useState(user?.phone ?? '');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const update = (i: number, patch: Partial<Traveller>) => setTravellers((p) => p.map((t, j) => (j === i ? { ...t, ...patch } : t)));

  const next = () => {
    const e: Record<string, string> = {};
    travellers.forEach((t, i) => {
      if (t.name.trim().length < 2) e[`name${i}`] = 'Enter full name';
      const age = Number(t.age);
      if (selection.mode !== 'hotel' && (!t.age || isNaN(age) || age < 1 || age > 120)) e[`age${i}`] = 'Enter valid age';
      if (selection.mode === 'hotel' && t.age && (isNaN(age) || age < 18)) e[`age${i}`] = 'Lead guest must be 18+';
    });
    if (!/^\S+@\S+\.\S+$/.test(email)) e.email = 'Enter a valid email';
    if (!/^\d{10}$/.test(phone)) e.phone = 'Enter a 10-digit mobile number';
    setErrors(e);
    if (Object.keys(e).length) return;
    navigation.navigate('Payment', { selection, travellers: travellers.map((t) => ({ ...t, name: t.name.trim() })), contact: { email, phone } });
  };

  const who = selection.mode === 'hotel' ? 'Lead guest' : 'Passenger';

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScrollView contentContainerStyle={{ padding: space.lg }} keyboardShouldPersistTaps="handled">
        <Card style={{ marginBottom: space.lg }}>
          <Row>
            <ModeIcon mode={selection.mode} size={22} />
            <Text style={[font.h3, { marginLeft: 8, flex: 1 }]} numberOfLines={1}>
              {selection.title}
            </Text>
          </Row>
          <Text style={[font.small, { marginTop: 6 }]}>{selection.subtitle}</Text>
          <Text style={[font.small, { marginTop: 2, color: colors.primary, fontWeight: '600' }]}>{selection.optionLabel}</Text>
        </Card>

        {travellers.map((t, i) => (
          <Card key={i} style={{ marginBottom: space.lg }}>
            <Text style={[font.h3, { marginBottom: space.md }]}>
              {who} {count > 1 ? i + 1 : ''}
              {selection.seats?.[i] ? `  ·  Seat ${selection.seats[i]}` : ''}
            </Text>
            <TextField label="Full name (as on ID)" value={t.name} onChangeText={(v) => update(i, { name: v })} autoCapitalize="words" error={errors[`name${i}`]} />
            <Row style={{ alignItems: 'flex-start' }}>
              <TextField
                label={selection.mode === 'hotel' ? 'Age (optional)' : 'Age'}
                value={t.age}
                onChangeText={(v) => update(i, { age: v.replace(/\D/g, '').slice(0, 3) })}
                keyboardType="number-pad"
                error={errors[`age${i}`]}
                style={{ width: 100, marginRight: space.md }}
              />
              <View style={{ flex: 1 }}>
                <Text style={[font.label, { marginBottom: 6 }]}>GENDER</Text>
                <Row>
                  {(['M', 'F', 'O'] as const).map((g) => (
                    <Chip key={g} label={g === 'M' ? 'Male' : g === 'F' ? 'Female' : 'Other'} active={t.gender === g} onPress={() => update(i, { gender: g })} />
                  ))}
                </Row>
              </View>
            </Row>
          </Card>
        ))}

        <Card>
          <Text style={[font.h3, { marginBottom: 4 }]}>Contact details</Text>
          <Text style={[font.small, { marginBottom: space.md }]}>Your ticket and updates will be sent here</Text>
          <TextField label="Email" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" error={errors.email} />
          <TextField
            label="Mobile"
            value={phone}
            onChangeText={(v) => setPhone(v.replace(/\D/g, '').slice(0, 10))}
            keyboardType="phone-pad"
            error={errors.phone}
          />
        </Card>
      </ScrollView>
      <BottomBar>
        <Button title="Continue to payment" onPress={next} style={{ flex: 1 }} />
      </BottomBar>
    </KeyboardAvoidingView>
  );
}
