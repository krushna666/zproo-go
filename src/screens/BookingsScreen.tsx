import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useCallback, useState } from 'react';
import { FlatList, RefreshControl, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { api } from '../api/services';
import type { Booking } from '../api/types';
import { Card, Chip, Empty, Loading, ModeIcon, Row } from '../components/ui';
import type { RootStackParamList } from '../navigation/types';
import { colors, font, space } from '../theme';
import { inr } from '../utils/format';

type Tab = 'Upcoming' | 'Cancelled' | 'All';

export default function BookingsScreen() {
  const nav = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const insets = useSafeAreaInsets();
  const [list, setList] = useState<Booking[] | null>(null);
  const [error, setError] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [tab, setTab] = useState<Tab>('Upcoming');

  const load = useCallback(async () => {
    setError('');
    try {
      setList(await api.bookings());
    } catch (e: any) {
      setError(e.message);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  const shown = (list ?? []).filter((b) => (tab === 'All' ? true : tab === 'Cancelled' ? b.status === 'CANCELLED' : b.status === 'CONFIRMED'));

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg, paddingTop: insets.top }}>
      <View style={{ padding: space.lg, paddingBottom: space.sm }}>
        <Text style={font.h1}>My Trips</Text>
        <Row style={{ marginTop: space.md }}>
          {(['Upcoming', 'Cancelled', 'All'] as Tab[]).map((t) => (
            <Chip key={t} label={t} active={tab === t} onPress={() => setTab(t)} />
          ))}
        </Row>
      </View>
      {error ? (
        <Empty icon="cloud-offline-outline" title="Couldn't load trips" message={error} action="Retry" onAction={load} />
      ) : !list ? (
        <Loading />
      ) : (
        <FlatList
          data={shown}
          keyExtractor={(b) => b.id}
          contentContainerStyle={{ padding: space.lg, flexGrow: 1 }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              colors={[colors.primary]}
              onRefresh={async () => {
                setRefreshing(true);
                await load();
                setRefreshing(false);
              }}
            />
          }
          ListEmptyComponent={
            <Empty
              icon="briefcase-outline"
              title={tab === 'Cancelled' ? 'No cancelled trips' : 'No trips yet'}
              message="Book a bus, train, flight or hotel and it will show up here."
              action={tab === 'Cancelled' ? undefined : 'Plan a trip'}
              onAction={() => nav.navigate('Main', { screen: 'Home' })}
            />
          }
          renderItem={({ item: b }) => (
            <Card onPress={() => nav.navigate('BookingDetail', { booking: b })} style={{ marginBottom: space.md }}>
              <Row style={{ justifyContent: 'space-between' }}>
                <Row style={{ flex: 1 }}>
                  <ModeIcon mode={b.selection.mode} size={22} />
                  <Text style={[font.h3, { marginLeft: 8, flex: 1 }]} numberOfLines={1}>
                    {b.selection.title}
                  </Text>
                </Row>
                <Text style={{ fontSize: 11, fontWeight: '800', color: b.status === 'CONFIRMED' ? colors.success : colors.danger }}>{b.status}</Text>
              </Row>
              <Text style={[font.small, { marginTop: 6 }]}>{b.selection.subtitle}</Text>
              <Row style={{ justifyContent: 'space-between', marginTop: space.md }}>
                <Text style={font.small}>
                  {b.selection.mode === 'hotel' ? 'ID' : 'PNR'} {b.selection.mode === 'hotel' ? b.id : b.pnr}
                </Text>
                <Row>
                  <Text style={[font.h3, { marginRight: 4 }]}>{inr(b.fare.total)}</Text>
                  <Ionicons name="chevron-forward" size={16} color={colors.textFaint} />
                </Row>
              </Row>
            </Card>
          )}
        />
      )}
    </View>
  );
}
