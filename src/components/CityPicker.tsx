import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { FlatList, Modal, Pressable, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { api } from '../api/services';
import type { City, Mode } from '../api/types';
import { colors, font, radius, space } from '../theme';
import { Loading } from './ui';

const POPULAR = ['PNQ', 'BOM', 'DEL', 'BLR', 'HYD', 'GOI'];

export function CityPicker({
  visible,
  title,
  mode,
  exclude,
  onClose,
  onSelect,
}: {
  visible: boolean;
  title: string;
  mode: Mode;
  exclude?: string;
  onClose: () => void;
  onSelect: (c: City) => void;
}) {
  const [q, setQ] = useState('');
  const [cities, setCities] = useState<City[] | null>(null);

  useEffect(() => {
    if (!visible) return;
    let live = true;
    const t = setTimeout(() => {
      api
        .cities(q)
        .then((c) => live && setCities(c))
        .catch(() => live && setCities([]));
    }, 200);
    return () => {
      live = false;
      clearTimeout(t);
    };
  }, [q, visible]);

  useEffect(() => {
    if (!visible) {
      setQ('');
      setCities(null);
    }
  }, [visible]);

  const list = (cities ?? []).filter((c) => c.code !== exclude);
  const sorted = q ? list : [...list.filter((c) => POPULAR.includes(c.code)), ...list.filter((c) => !POPULAR.includes(c.code))];

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', padding: space.lg }}>
          <Pressable onPress={onClose} hitSlop={10}>
            <Ionicons name="close" size={26} color={colors.text} />
          </Pressable>
          <Text style={[font.h2, { marginLeft: 12 }]}>{title}</Text>
        </View>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            marginHorizontal: space.lg,
            backgroundColor: colors.white,
            borderRadius: radius.md,
            borderWidth: 1,
            borderColor: colors.border,
            paddingHorizontal: 12,
          }}
        >
          <Ionicons name="search" size={18} color={colors.textMuted} />
          <TextInput
            autoFocus
            value={q}
            onChangeText={setQ}
            placeholder="Search city or code"
            placeholderTextColor={colors.textFaint}
            style={{ flex: 1, paddingVertical: 12, paddingHorizontal: 8, fontSize: 16, color: colors.text }}
          />
        </View>
        {cities === null ? (
          <Loading />
        ) : (
          <FlatList
            data={sorted}
            keyboardShouldPersistTaps="handled"
            keyExtractor={(c) => c.code}
            contentContainerStyle={{ padding: space.lg }}
            ListHeaderComponent={!q ? <Text style={[font.label, { marginBottom: 8 }]}>POPULAR & ALL CITIES</Text> : null}
            ListEmptyComponent={<Text style={[font.small, { textAlign: 'center', marginTop: 40 }]}>No city matches “{q}”</Text>}
            renderItem={({ item }) => (
              <Pressable
                onPress={() => onSelect(item)}
                style={({ pressed }) => ({
                  flexDirection: 'row',
                  alignItems: 'center',
                  paddingVertical: 14,
                  borderBottomWidth: 1,
                  borderBottomColor: colors.border,
                  opacity: pressed ? 0.6 : 1,
                })}
              >
                <View
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 10,
                    backgroundColor: colors.primarySoft,
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginRight: 12,
                  }}
                >
                  <Text style={{ fontWeight: '800', color: colors.primary, fontSize: 12 }}>{item.code}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={font.h3}>{item.name}</Text>
                  <Text style={font.small} numberOfLines={1}>
                    {mode === 'flight' ? item.airport : mode === 'train' ? item.station : item.state}
                  </Text>
                </View>
              </Pressable>
            )}
          />
        )}
      </SafeAreaView>
    </Modal>
  );
}
