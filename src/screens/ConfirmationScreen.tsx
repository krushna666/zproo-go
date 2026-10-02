import { Ionicons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useEffect } from 'react';
import { ScrollView, Share, Text, View } from 'react-native';
import { Button } from '../components/ui';
import { Ticket } from '../components/Ticket';
import type { RootStackParamList } from '../navigation/types';
import { colors, font, space } from '../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'Confirmation'>;

export default function ConfirmationScreen({ navigation, route }: Props) {
  const { booking } = route.params;
  useEffect(() => {
    navigation.setOptions({ headerBackVisible: false, gestureEnabled: false });
  }, [navigation]);

  const share = () =>
    Share.share({
      message: `My Zproo booking ${booking.id}\n${booking.selection.title}\n${booking.selection.subtitle}\n${booking.selection.optionLabel}\nPNR: ${booking.pnr}`,
    });

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.bg }} contentContainerStyle={{ padding: space.lg, paddingBottom: 40 }}>
      <View style={{ alignItems: 'center', marginVertical: space.xl }}>
        <View style={{ width: 72, height: 72, borderRadius: 36, backgroundColor: colors.successSoft, alignItems: 'center', justifyContent: 'center' }}>
          <Ionicons name="checkmark-circle" size={56} color={colors.success} />
        </View>
        <Text style={[font.h1, { marginTop: space.md }]}>Booking confirmed!</Text>
        <Text style={[font.small, { marginTop: 4, textAlign: 'center' }]}>Your ticket has been sent to {booking.contact.email}</Text>
      </View>
      <Ticket booking={booking} />
      <Button title="Share ticket" icon="share-social-outline" variant="outline" onPress={share} style={{ marginTop: space.xl }} />
      <Button title="Go to My Trips" onPress={() => navigation.navigate('Main', { screen: 'Bookings' })} style={{ marginTop: space.md }} />
      <Button title="Book another trip" variant="ghost" onPress={() => navigation.navigate('Main', { screen: 'Home' })} style={{ marginTop: space.sm }} />
    </ScrollView>
  );
}
