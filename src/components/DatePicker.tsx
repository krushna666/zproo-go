import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useMemo, useState } from 'react';
import { Modal, Pressable, Text, View } from 'react-native';
import { colors, font, radius, space } from '../theme';
import { fromISODate, pad, today } from '../utils/format';

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const DOW = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

export function DatePicker({
  visible,
  title,
  value,
  minDate = today(),
  onClose,
  onSelect,
}: {
  visible: boolean;
  title: string;
  value: string;
  minDate?: string;
  onClose: () => void;
  onSelect: (d: string) => void;
}) {
  const start = fromISODate(value);
  const [cursor, setCursor] = useState({ y: start.getFullYear(), m: start.getMonth() });
  useEffect(() => {
    if (visible) {
      const d = fromISODate(value);
      setCursor({ y: d.getFullYear(), m: d.getMonth() });
    }
  }, [visible, value]);

  const cells = useMemo(() => {
    const first = new Date(cursor.y, cursor.m, 1).getDay();
    const days = new Date(cursor.y, cursor.m + 1, 0).getDate();
    const out: (string | null)[] = Array(first).fill(null);
    for (let d = 1; d <= days; d++) out.push(`${cursor.y}-${pad(cursor.m + 1)}-${pad(d)}`);
    while (out.length % 7) out.push(null);
    return out;
  }, [cursor]);

  const min = fromISODate(minDate);
  const canPrev = cursor.y > min.getFullYear() || (cursor.y === min.getFullYear() && cursor.m > min.getMonth());
  const shift = (n: number) =>
    setCursor((c) => {
      const d = new Date(c.y, c.m + n, 1);
      return { y: d.getFullYear(), m: d.getMonth() };
    });

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable onPress={onClose} style={{ flex: 1, backgroundColor: 'rgba(10,15,35,0.45)', justifyContent: 'flex-end' }}>
        <Pressable
          onPress={() => {}}
          style={{ backgroundColor: colors.white, borderTopLeftRadius: radius.xl, borderTopRightRadius: radius.xl, padding: space.xl, paddingBottom: 40 }}
        >
          <Text style={[font.h2, { marginBottom: space.lg }]}>{title}</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: space.md }}>
            <Pressable disabled={!canPrev} onPress={() => shift(-1)} hitSlop={10} style={{ opacity: canPrev ? 1 : 0.3 }}>
              <Ionicons name="chevron-back" size={24} color={colors.primary} />
            </Pressable>
            <Text style={font.h3}>
              {MONTHS[cursor.m]} {cursor.y}
            </Text>
            <Pressable onPress={() => shift(1)} hitSlop={10}>
              <Ionicons name="chevron-forward" size={24} color={colors.primary} />
            </Pressable>
          </View>
          <View style={{ flexDirection: 'row' }}>
            {DOW.map((d, i) => (
              <Text key={i} style={[font.label, { flex: 1, textAlign: 'center', marginBottom: 6 }]}>
                {d}
              </Text>
            ))}
          </View>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
            {cells.map((iso, i) => {
              if (!iso) return <View key={i} style={{ width: `${100 / 7}%`, height: 44 }} />;
              const disabled = iso < minDate;
              const selected = iso === value;
              const isToday = iso === today();
              return (
                <Pressable
                  key={i}
                  disabled={disabled}
                  onPress={() => onSelect(iso)}
                  style={{ width: `${100 / 7}%`, height: 44, alignItems: 'center', justifyContent: 'center' }}
                >
                  <View
                    style={{
                      width: 38,
                      height: 38,
                      borderRadius: 19,
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: selected ? colors.primary : 'transparent',
                      borderWidth: isToday && !selected ? 1 : 0,
                      borderColor: colors.primary,
                    }}
                  >
                    <Text style={{ fontSize: 15, fontWeight: selected ? '800' : '500', color: disabled ? colors.textFaint : selected ? colors.white : colors.text }}>
                      {Number(iso.slice(8))}
                    </Text>
                  </View>
                </Pressable>
              );
            })}
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
