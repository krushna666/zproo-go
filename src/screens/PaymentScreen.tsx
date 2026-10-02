import { Ionicons } from '@expo/vector-icons';
import { CommonActions } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useEffect, useMemo, useState } from 'react';
import { Alert, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { computeFare } from '../api/pricing';
import { api } from '../api/services';
import type { Offer } from '../api/types';
import { BottomBar, Button, Card, Divider, ModeIcon, Row } from '../components/ui';
import type { RootStackParamList } from '../navigation/types';
import { colors, font, radius, space } from '../theme';
import { inr } from '../utils/format';

type Props = NativeStackScreenProps<RootStackParamList, 'Payment'>;

const METHODS = [
  { id: 'UPI', label: 'UPI', sub: 'Google Pay, PhonePe, Paytm & more', icon: 'phone-portrait-outline' },
  { id: 'Card', label: 'Credit / Debit card', sub: 'Visa, Mastercard, RuPay, Amex', icon: 'card-outline' },
  { id: 'Net Banking', label: 'Net banking', sub: 'All major Indian banks', icon: 'business-outline' },
  { id: 'Wallet', label: 'Wallets', sub: 'Paytm, Amazon Pay, Mobikwik', icon: 'wallet-outline' },
] as const;

export default function PaymentScreen({ navigation, route }: Props) {
  const { selection, travellers, contact } = route.params;
  const [offers, setOffers] = useState<Offer[]>([]);
  const [code, setCode] = useState('');
  const [applied, setApplied] = useState<Offer | undefined>();
  const [couponMsg, setCouponMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [checking, setChecking] = useState(false);
  const [method, setMethod] = useState<string>('UPI');
  const [paying, setPaying] = useState(false);

  useEffect(() => {
    api.offers().then(setOffers).catch(() => {});
  }, []);

  const fare = useMemo(() => computeFare(selection, applied), [selection, applied]);
  const relevant = offers.filter((o) => o.mode === 'all' || o.mode === selection.mode);

  const apply = async (c = code) => {
    if (!c.trim()) return;
    setChecking(true);
    try {
      const pre = computeFare(selection);
      const res = await api.validateCoupon(c.trim(), selection.mode, pre.total);
      setCouponMsg({ ok: res.valid, text: res.message });
      setApplied(res.valid ? offers.find((o) => o.code === c.trim().toUpperCase()) : undefined);
      if (res.valid) setCode(c.trim().toUpperCase());
    } catch (e: any) {
      setCouponMsg({ ok: false, text: e.message });
    } finally {
      setChecking(false);
    }
  };

  const pay = async () => {
    setPaying(true);
    try {
      const booking = await api.createBooking({ selection, travellers, contact, couponCode: applied?.code, paymentMethod: method });
      navigation.dispatch(
        CommonActions.reset({
          index: 1,
          routes: [{ name: 'Main', params: { screen: 'Bookings' } }, { name: 'Confirmation', params: { booking } }],
        }),
      );
    } catch (e: any) {
      Alert.alert('Payment failed', e.message);
      setPaying(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScrollView contentContainerStyle={{ padding: space.lg }} keyboardShouldPersistTaps="handled">
        <Card>
          <Row>
            <ModeIcon mode={selection.mode} />
            <Text style={[font.h3, { marginLeft: 8, flex: 1 }]} numberOfLines={1}>
              {selection.title}
            </Text>
          </Row>
          <Text style={[font.small, { marginTop: 4 }]}>{selection.subtitle}</Text>
          <Text style={[font.small, { marginTop: 2 }]}>{travellers.map((t) => t.name).join(', ')}</Text>
        </Card>

        <Text style={[font.h3, { marginTop: space.xl, marginBottom: space.sm }]}>Offers & coupons</Text>
        <Card>
          <Row>
            <TextInput
              value={code}
              onChangeText={(t) => {
                setCode(t.toUpperCase());
                setCouponMsg(null);
              }}
              placeholder="Enter coupon code"
              placeholderTextColor={colors.textFaint}
              autoCapitalize="characters"
              style={{ flex: 1, borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, paddingHorizontal: 12, paddingVertical: 10, fontSize: 15, color: colors.text, marginRight: 8 }}
            />
            {applied ? (
              <Button
                title="Remove"
                variant="ghost"
                onPress={() => {
                  setApplied(undefined);
                  setCode('');
                  setCouponMsg(null);
                }}
              />
            ) : (
              <Button title="Apply" variant="outline" loading={checking} onPress={() => apply()} style={{ paddingHorizontal: 18 }} />
            )}
          </Row>
          {couponMsg && <Text style={{ marginTop: 8, fontSize: 13, fontWeight: '600', color: couponMsg.ok ? colors.success : colors.danger }}>{couponMsg.text}</Text>}
          {!applied &&
            relevant.map((o) => (
              <Pressable key={o.id} onPress={() => apply(o.code)} style={{ flexDirection: 'row', alignItems: 'center', marginTop: space.md }}>
                <View style={{ borderWidth: 1, borderStyle: 'dashed', borderColor: colors.accent, borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3, marginRight: 10 }}>
                  <Text style={{ color: colors.accent, fontWeight: '800', fontSize: 12 }}>{o.code}</Text>
                </View>
                <Text style={[font.small, { flex: 1 }]} numberOfLines={1}>
                  {o.title}
                </Text>
                <Text style={{ color: colors.primary, fontWeight: '700', fontSize: 13 }}>Apply</Text>
              </Pressable>
            ))}
        </Card>

        <Text style={[font.h3, { marginTop: space.xl, marginBottom: space.sm }]}>Fare summary</Text>
        <Card>
          <Line label={`Base fare (${selection.units}${selection.nights ? ` × ${selection.nights} night${selection.nights > 1 ? 's' : ''}` : ''})`} value={inr(fare.base)} />
          <Line label="Taxes & GST" value={inr(fare.taxes)} />
          <Line label="Convenience fee" value={inr(fare.fee)} />
          {fare.discount > 0 && <Line label={`Coupon ${applied?.code}`} value={`– ${inr(fare.discount)}`} color={colors.success} />}
          <Divider />
          <Line label="Total payable" value={inr(fare.total)} bold />
        </Card>

        <Text style={[font.h3, { marginTop: space.xl, marginBottom: space.sm }]}>Pay with</Text>
        {METHODS.map((m) => {
          const active = method === m.id;
          return (
            <Pressable
              key={m.id}
              onPress={() => setMethod(m.id)}
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
              <Ionicons name={m.icon as any} size={22} color={colors.primary} />
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={font.h3}>{m.label}</Text>
                <Text style={font.small}>{m.sub}</Text>
              </View>
              <Ionicons name={active ? 'radio-button-on' : 'radio-button-off'} size={22} color={active ? colors.primary : colors.textFaint} />
            </Pressable>
          );
        })}
        <Row style={{ justifyContent: 'center', marginTop: space.sm }}>
          <Ionicons name="lock-closed" size={12} color={colors.textFaint} />
          <Text style={[font.small, { marginLeft: 4, color: colors.textFaint }]}>100% secure payments</Text>
        </Row>
      </ScrollView>
      <BottomBar>
        <View style={{ flex: 1 }}>
          <Text style={font.small}>Total</Text>
          <Text style={{ fontSize: 22, fontWeight: '800', color: colors.text }}>{inr(fare.total)}</Text>
        </View>
        <Button title={`Pay ${inr(fare.total)}`} variant="accent" loading={paying} onPress={pay} style={{ paddingHorizontal: 24 }} />
      </BottomBar>
    </View>
  );
}

function Line({ label, value, bold, color }: { label: string; value: string; bold?: boolean; color?: string }) {
  return (
    <Row style={{ justifyContent: 'space-between', marginBottom: 8 }}>
      <Text style={[bold ? font.h3 : font.body, { color: color ?? colors.text, flex: 1 }]}>{label}</Text>
      <Text style={[bold ? { fontSize: 18, fontWeight: '800' } : font.body, { color: color ?? colors.text }]}>{value}</Text>
    </Row>
  );
}
