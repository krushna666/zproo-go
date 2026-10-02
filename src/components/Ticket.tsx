import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Text, View } from 'react-native';
import type { Booking } from '../api/types';
import { colors, font, modeColors, radius, shadow, space } from '../theme';
import { inr } from '../utils/format';
import { MODE_META, ModeIcon, Row } from './ui';

export function Ticket({ booking }: { booking: Booking }) {
  const s = booking.selection;
  const cancelled = booking.status === 'CANCELLED';
  const accent = modeColors[s.mode];
  return (
    <View style={{ backgroundColor: colors.white, borderRadius: radius.lg, overflow: 'hidden', ...shadow }}>
      <View style={{ backgroundColor: cancelled ? colors.textFaint : accent, padding: space.lg }}>
        <Row style={{ justifyContent: 'space-between' }}>
          <Row>
            <ModeIcon mode={s.mode} color={colors.white} size={22} />
            <Text style={{ color: colors.white, fontWeight: '800', marginLeft: 8, fontSize: 15 }}>{MODE_META[s.mode].label} ticket</Text>
          </Row>
          <View style={{ backgroundColor: 'rgba(255,255,255,0.22)', borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3 }}>
            <Text style={{ color: colors.white, fontWeight: '800', fontSize: 12 }}>{booking.status}</Text>
          </View>
        </Row>
        <Text style={{ color: colors.white, fontSize: 19, fontWeight: '800', marginTop: space.md }}>{s.title}</Text>
        <Text style={{ color: 'rgba(255,255,255,0.9)', marginTop: 4 }}>{s.subtitle}</Text>
      </View>

      <View style={{ padding: space.lg }}>
        <Row style={{ justifyContent: 'space-between' }}>
          <Info label={s.mode === 'hotel' ? 'BOOKING ID' : 'PNR'} value={s.mode === 'hotel' ? booking.id : booking.pnr} />
          <Info label="BOOKING ID" value={booking.id} right hide={s.mode === 'hotel'} />
        </Row>
        <Info label={s.mode === 'hotel' ? 'ROOM' : s.mode === 'bus' ? 'SEATS & POINTS' : 'CLASS / FARE'} value={s.optionLabel} style={{ marginTop: space.md }} />
      </View>

      <Row style={{ alignItems: 'center' }}>
        <View style={{ width: 20, height: 20, borderRadius: 10, backgroundColor: colors.bg, marginLeft: -10 }} />
        <View style={{ flex: 1, borderTopWidth: 1.5, borderStyle: 'dashed', borderColor: colors.border, marginHorizontal: 6 }} />
        <View style={{ width: 20, height: 20, borderRadius: 10, backgroundColor: colors.bg, marginRight: -10 }} />
      </Row>

      <View style={{ padding: space.lg }}>
        <Text style={font.label}>{s.mode === 'hotel' ? 'GUEST' : 'TRAVELLERS'}</Text>
        {booking.travellers.map((t, i) => (
          <Row key={i} style={{ justifyContent: 'space-between', marginTop: 6 }}>
            <Text style={font.body}>
              {t.name}
              {t.age ? `, ${t.age}${t.gender}` : ''}
            </Text>
            {s.seats?.[i] && <Text style={[font.body, { fontWeight: '700' }]}>Seat {s.seats[i]}</Text>}
          </Row>
        ))}
        <Row style={{ justifyContent: 'space-between', marginTop: space.lg }}>
          <View>
            <Text style={font.label}>PAID VIA {booking.paymentMethod.toUpperCase()}</Text>
            <Text style={{ fontSize: 20, fontWeight: '800', color: colors.text, marginTop: 2 }}>{inr(booking.fare.total)}</Text>
          </View>
          <QR seed={booking.id} />
        </Row>
        {cancelled && (
          <Row style={{ marginTop: space.md, backgroundColor: colors.dangerSoft, padding: space.md, borderRadius: radius.sm }}>
            <Ionicons name="information-circle" size={18} color={colors.danger} />
            <Text style={[font.small, { color: colors.danger, marginLeft: 6, flex: 1 }]}>Cancelled. Refund will reach your original payment method in 5–7 days.</Text>
          </Row>
        )}
      </View>
    </View>
  );
}

function Info({ label, value, right, hide, style }: { label: string; value: string; right?: boolean; hide?: boolean; style?: any }) {
  if (hide) return null;
  return (
    <View style={[{ alignItems: right ? 'flex-end' : 'flex-start' }, style]}>
      <Text style={font.label}>{label}</Text>
      <Text style={[font.h3, { marginTop: 2 }]}>{value}</Text>
    </View>
  );
}

/** Decorative QR-style code derived from the booking id. */
function QR({ seed }: { seed: string }) {
  const n = 11;
  let h = 0;
  for (const c of seed) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  const cells: boolean[] = [];
  for (let i = 0; i < n * n; i++) {
    h ^= h << 13;
    h ^= h >>> 17;
    h ^= h << 5;
    h >>>= 0;
    cells.push(h % 2 === 0);
  }
  const finder = (r: number, c: number) => (r < 3 && c < 3) || (r < 3 && c >= n - 3) || (r >= n - 3 && c < 3);
  return (
    <View style={{ width: n * 6, height: n * 6, flexDirection: 'row', flexWrap: 'wrap' }}>
      {cells.map((on, i) => {
        const r = Math.floor(i / n);
        const c = i % n;
        return <View key={i} style={{ width: 6, height: 6, backgroundColor: finder(r, c) || on ? colors.text : colors.white }} />;
      })}
    </View>
  );
}
