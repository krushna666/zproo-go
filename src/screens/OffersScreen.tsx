import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useEffect, useState } from 'react';
import { Alert, FlatList, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { api } from '../api/services';
import type { Offer } from '../api/types';
import { Button, Card, Empty, Loading, MODE_META, ModeIcon, Row } from '../components/ui';
import type { RootStackParamList } from '../navigation/types';
import { colors, font, space } from '../theme';

export default function OffersScreen() {
  const nav = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const insets = useSafeAreaInsets();
  const [offers, setOffers] = useState<Offer[] | null>(null);
  const [error, setError] = useState('');

  const load = () => {
    setError('');
    api.offers().then(setOffers).catch((e) => setError(e.message));
  };
  useEffect(load, []);

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg, paddingTop: insets.top }}>
      <Text style={[font.h1, { padding: space.lg, paddingBottom: 0 }]}>Offers</Text>
      {error ? (
        <Empty icon="cloud-offline-outline" title="Couldn't load offers" message={error} action="Retry" onAction={load} />
      ) : !offers ? (
        <Loading />
      ) : (
        <FlatList
          data={offers}
          keyExtractor={(o) => o.id}
          contentContainerStyle={{ padding: space.lg }}
          renderItem={({ item: o }) => (
            <Card style={{ marginBottom: space.md }}>
              <Row>
                {o.mode === 'all' ? (
                  <Text style={{ fontSize: 12, fontWeight: '800', color: colors.primary }}>ALL TRIPS</Text>
                ) : (
                  <Row>
                    <ModeIcon mode={o.mode} size={18} />
                    <Text style={{ fontSize: 12, fontWeight: '800', color: colors.textMuted, marginLeft: 6 }}>{MODE_META[o.mode].label.toUpperCase()}</Text>
                  </Row>
                )}
              </Row>
              <Text style={[font.h3, { marginTop: 6 }]}>{o.title}</Text>
              <Text style={[font.small, { marginTop: 4 }]}>{o.description}</Text>
              <Row style={{ marginTop: space.md, justifyContent: 'space-between' }}>
                <View style={{ borderWidth: 1.5, borderStyle: 'dashed', borderColor: colors.accent, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 6, backgroundColor: colors.accentSoft }}>
                  <Text style={{ color: colors.accent, fontWeight: '900', letterSpacing: 1.5 }}>{o.code}</Text>
                </View>
                <Button
                  title="Use now"
                  variant="ghost"
                  onPress={() => {
                    Alert.alert(o.code, 'Apply this code on the payment screen.');
                    nav.navigate('Main', { screen: 'Home', params: { mode: o.mode === 'all' ? undefined : o.mode } });
                  }}
                />
              </Row>
            </Card>
          )}
        />
      )}
    </View>
  );
}
