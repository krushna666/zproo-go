import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useState } from 'react';
import { Alert, ScrollView, Share } from 'react-native';
import { api } from '../api/services';
import { Button } from '../components/ui';
import { Ticket } from '../components/Ticket';
import type { RootStackParamList } from '../navigation/types';
import { colors, space } from '../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'BookingDetail'>;

export default function BookingDetailScreen({ route }: Props) {
  const [booking, setBooking] = useState(route.params.booking);
  const [busy, setBusy] = useState(false);

  const cancel = () =>
    Alert.alert('Cancel booking?', 'Cancellation charges may apply as per the fare rules.', [
      { text: 'Keep booking', style: 'cancel' },
      {
        text: 'Cancel booking',
        style: 'destructive',
        onPress: async () => {
          setBusy(true);
          try {
            setBooking(await api.cancelBooking(booking.id));
          } catch (e: any) {
            Alert.alert('Could not cancel', e.message);
          } finally {
            setBusy(false);
          }
        },
      },
    ]);

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.bg }} contentContainerStyle={{ padding: space.lg, paddingBottom: 40 }}>
      <Ticket booking={booking} />
      <Button
        title="Share ticket"
        icon="share-social-outline"
        variant="outline"
        style={{ marginTop: space.xl }}
        onPress={() => Share.share({ message: `Zproo booking ${booking.id} · ${booking.selection.title} · ${booking.selection.subtitle} · PNR ${booking.pnr}` })}
      />
      {booking.status === 'CONFIRMED' && <Button title="Cancel booking" variant="danger" loading={busy} onPress={cancel} style={{ marginTop: space.md }} />}
    </ScrollView>
  );
}
