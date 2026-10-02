import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import React from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleProp,
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  View,
  ViewStyle,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { Mode } from '../api/types';
import { colors, font, modeColors, radius, shadow, space } from '../theme';

export const MODE_META: Record<Mode, { label: string; icon: React.ComponentProps<typeof MaterialCommunityIcons>['name'] }> = {
  bus: { label: 'Bus', icon: 'bus-side' },
  train: { label: 'Train', icon: 'train' },
  flight: { label: 'Flight', icon: 'airplane' },
  hotel: { label: 'Hotel', icon: 'bed' },
};

export function ModeIcon({ mode, size = 20, color }: { mode: Mode; size?: number; color?: string }) {
  return <MaterialCommunityIcons name={MODE_META[mode].icon} size={size} color={color ?? modeColors[mode]} />;
}

export function Card({ children, style, onPress }: { children: React.ReactNode; style?: StyleProp<ViewStyle>; onPress?: () => void }) {
  if (onPress) {
    return (
      <Pressable onPress={onPress} style={({ pressed }) => [styles.card, pressed && { opacity: 0.92, transform: [{ scale: 0.995 }] }, style]}>
        {children}
      </Pressable>
    );
  }
  return <View style={[styles.card, style]}>{children}</View>;
}

export function Button({
  title,
  onPress,
  loading,
  disabled,
  variant = 'primary',
  icon,
  style,
}: {
  title: string;
  onPress?: () => void;
  loading?: boolean;
  disabled?: boolean;
  variant?: 'primary' | 'accent' | 'outline' | 'ghost' | 'danger';
  icon?: React.ComponentProps<typeof Ionicons>['name'];
  style?: StyleProp<ViewStyle>;
}) {
  const bg =
    variant === 'primary' ? colors.primary : variant === 'accent' ? colors.accent : variant === 'danger' ? colors.danger : 'transparent';
  const fg = variant === 'outline' || variant === 'ghost' ? colors.primary : colors.white;
  const off = disabled || loading;
  return (
    <Pressable
      onPress={off ? undefined : onPress}
      style={({ pressed }) => [
        styles.btn,
        { backgroundColor: bg },
        variant === 'outline' && { borderWidth: 1.5, borderColor: colors.primary },
        off && { opacity: 0.5 },
        pressed && !off && { opacity: 0.85 },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={fg} />
      ) : (
        <View style={styles.row}>
          {icon && <Ionicons name={icon} size={18} color={fg} style={{ marginRight: 8 }} />}
          <Text style={[styles.btnText, { color: fg }]}>{title}</Text>
        </View>
      )}
    </Pressable>
  );
}

export function Field({
  label,
  value,
  placeholder,
  icon,
  onPress,
  style,
}: {
  label: string;
  value?: string;
  placeholder?: string;
  icon?: React.ComponentProps<typeof Ionicons>['name'];
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.field, pressed && { backgroundColor: colors.primarySoft }, style]}>
      {icon && <Ionicons name={icon} size={20} color={colors.textMuted} style={{ marginRight: 10 }} />}
      <View style={{ flex: 1 }}>
        <Text style={font.label}>{label.toUpperCase()}</Text>
        <Text style={[styles.fieldValue, !value && { color: colors.textFaint }]} numberOfLines={1}>
          {value || placeholder}
        </Text>
      </View>
    </Pressable>
  );
}

export function TextField({ label, error, style, ...props }: TextInputProps & { label: string; error?: string; style?: StyleProp<ViewStyle> }) {
  return (
    <View style={[{ marginBottom: space.md }, style]}>
      <Text style={[font.label, { marginBottom: 6 }]}>{label.toUpperCase()}</Text>
      <TextInput
        placeholderTextColor={colors.textFaint}
        {...props}
        style={[styles.input, !!error && { borderColor: colors.danger }]}
      />
      {!!error && <Text style={[font.small, { color: colors.danger, marginTop: 4 }]}>{error}</Text>}
    </View>
  );
}

export function Chip({ label, active, onPress, icon }: { label: string; active?: boolean; onPress?: () => void; icon?: React.ComponentProps<typeof Ionicons>['name'] }) {
  return (
    <Pressable onPress={onPress} style={[styles.chip, active && { backgroundColor: colors.primary, borderColor: colors.primary }]}>
      {icon && <Ionicons name={icon} size={14} color={active ? colors.white : colors.textMuted} style={{ marginRight: 4 }} />}
      <Text style={{ fontSize: 13, fontWeight: '600', color: active ? colors.white : colors.text }}>{label}</Text>
    </Pressable>
  );
}

export function Stepper({ value, min = 1, max = 9, onChange }: { value: number; min?: number; max?: number; onChange: (v: number) => void }) {
  return (
    <View style={styles.row}>
      <Pressable hitSlop={8} onPress={() => value > min && onChange(value - 1)} style={[styles.stepBtn, value <= min && { opacity: 0.35 }]}>
        <Ionicons name="remove" size={18} color={colors.primary} />
      </Pressable>
      <Text style={{ width: 32, textAlign: 'center', fontWeight: '700', fontSize: 16, color: colors.text }}>{value}</Text>
      <Pressable hitSlop={8} onPress={() => value < max && onChange(value + 1)} style={[styles.stepBtn, value >= max && { opacity: 0.35 }]}>
        <Ionicons name="add" size={18} color={colors.primary} />
      </Pressable>
    </View>
  );
}

export function Loading({ label = 'Loading…' }: { label?: string }) {
  return (
    <View style={styles.center}>
      <ActivityIndicator size="large" color={colors.primary} />
      <Text style={[font.small, { marginTop: 12 }]}>{label}</Text>
    </View>
  );
}

export function Empty({
  icon = 'search',
  title,
  message,
  action,
  onAction,
}: {
  icon?: React.ComponentProps<typeof Ionicons>['name'];
  title: string;
  message?: string;
  action?: string;
  onAction?: () => void;
}) {
  return (
    <View style={styles.center}>
      <View style={styles.emptyIcon}>
        <Ionicons name={icon} size={30} color={colors.primary} />
      </View>
      <Text style={[font.h3, { textAlign: 'center' }]}>{title}</Text>
      {!!message && <Text style={[font.small, { textAlign: 'center', marginTop: 6, maxWidth: 280 }]}>{message}</Text>}
      {!!action && <Button title={action} onPress={onAction} variant="outline" style={{ marginTop: 18, paddingHorizontal: 24 }} />}
    </View>
  );
}

export function Rating({ value }: { value: number }) {
  const bg = value >= 4.2 ? colors.success : value >= 3.6 ? colors.warning : colors.danger;
  return (
    <View style={[styles.rating, { backgroundColor: bg }]}>
      <Ionicons name="star" size={11} color={colors.white} />
      <Text style={{ color: colors.white, fontWeight: '700', fontSize: 12, marginLeft: 3 }}>{value.toFixed(1)}</Text>
    </View>
  );
}

export function Divider({ style }: { style?: StyleProp<ViewStyle> }) {
  return <View style={[{ height: 1, backgroundColor: colors.border, marginVertical: space.md }, style]} />;
}

export function Row({ children, style }: { children: React.ReactNode; style?: StyleProp<ViewStyle> }) {
  return <View style={[styles.row, style]}>{children}</View>;
}

export function BottomBar({ children }: { children: React.ReactNode }) {
  const insets = useSafeAreaInsets();
  return <View style={[styles.bottomBar, { paddingBottom: space.lg + insets.bottom }]}>{children}</View>;
}

export const styles = StyleSheet.create({
  card: { backgroundColor: colors.card, borderRadius: radius.lg, padding: space.lg, ...shadow },
  row: { flexDirection: 'row', alignItems: 'center' },
  btn: { height: 50, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center', paddingHorizontal: space.lg },
  btnText: { fontSize: 16, fontWeight: '700' },
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.white,
  },
  fieldValue: { fontSize: 16, fontWeight: '700', color: colors.text, marginTop: 2 },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    color: colors.text,
    backgroundColor: colors.white,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.white,
    marginRight: 8,
  },
  stepBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 1.5,
    borderColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: space.xxl },
  emptyIcon: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  rating: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 },
  bottomBar: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: space.lg,
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
});
