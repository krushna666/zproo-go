import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Alert, Pressable, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { API_CONFIG } from '../api/config';
import { Button, Card, TextField } from '../components/ui';
import { useAuth } from '../store/auth';
import { colors, font, space } from '../theme';

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const { user, updateUser, signOut } = useAuth();
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(user?.name ?? '');
  const [email, setEmail] = useState(user?.email ?? '');

  const save = async () => {
    if (name.trim().length < 2) return Alert.alert('Enter your name');
    if (email && !/^\S+@\S+\.\S+$/.test(email)) return Alert.alert('Enter a valid email');
    await updateUser({ name: name.trim(), email: email.trim() });
    setEditing(false);
  };

  const initials = (user?.name ?? 'Z')
    .split(' ')
    .map((p) => p[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const items: { icon: any; label: string; onPress: () => void }[] = [
    { icon: 'people-outline', label: 'Saved travellers', onPress: () => Alert.alert('Saved travellers', 'Travellers you book with will appear here.') },
    { icon: 'card-outline', label: 'Payment methods', onPress: () => Alert.alert('Payment methods', 'Saved cards and UPI IDs will appear here.') },
    { icon: 'notifications-outline', label: 'Notifications', onPress: () => Alert.alert('Notifications', 'Trip alerts are on.') },
    { icon: 'help-circle-outline', label: 'Help & support', onPress: () => Alert.alert('Zproo support', 'support@zproo.com\nAvailable 24×7') },
    { icon: 'document-text-outline', label: 'Terms & privacy', onPress: () => Alert.alert('Terms & privacy', 'Available at zproo.com/legal') },
  ];

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.bg }} contentContainerStyle={{ paddingTop: insets.top + space.lg, padding: space.lg, paddingBottom: 40 }}>
      <Text style={font.h1}>Profile</Text>
      <Card style={{ marginTop: space.lg }}>
        {editing ? (
          <>
            <TextField label="Name" value={name} onChangeText={setName} autoCapitalize="words" />
            <TextField label="Email" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
            <View style={{ flexDirection: 'row' }}>
              <Button title="Cancel" variant="outline" onPress={() => setEditing(false)} style={{ flex: 1, marginRight: 8 }} />
              <Button title="Save" onPress={save} style={{ flex: 1 }} />
            </View>
          </>
        ) : (
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <View style={{ width: 60, height: 60, borderRadius: 30, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' }}>
              <Text style={{ color: colors.white, fontSize: 22, fontWeight: '800' }}>{initials}</Text>
            </View>
            <View style={{ flex: 1, marginLeft: space.md }}>
              <Text style={font.h2}>{user?.name}</Text>
              <Text style={font.small}>+91 {user?.phone}</Text>
              {!!user?.email && <Text style={font.small}>{user.email}</Text>}
            </View>
            <Pressable onPress={() => setEditing(true)} hitSlop={10}>
              <Ionicons name="create-outline" size={22} color={colors.primary} />
            </Pressable>
          </View>
        )}
      </Card>

      <Card style={{ marginTop: space.lg, paddingVertical: space.sm }}>
        {items.map((it, i) => (
          <Pressable
            key={it.label}
            onPress={it.onPress}
            style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 14, borderTopWidth: i ? 1 : 0, borderTopColor: colors.border }}
          >
            <Ionicons name={it.icon} size={22} color={colors.textMuted} />
            <Text style={[font.body, { flex: 1, marginLeft: 14, fontSize: 15 }]}>{it.label}</Text>
            <Ionicons name="chevron-forward" size={18} color={colors.textFaint} />
          </Pressable>
        ))}
      </Card>

      <Button
        title="Log out"
        variant="outline"
        icon="log-out-outline"
        style={{ marginTop: space.xl }}
        onPress={() => Alert.alert('Log out?', '', [{ text: 'Cancel', style: 'cancel' }, { text: 'Log out', style: 'destructive', onPress: signOut }])}
      />
      <Text style={[font.small, { textAlign: 'center', marginTop: space.lg, color: colors.textFaint }]}>
        Zproo v1.0.0 · {API_CONFIG.USE_MOCK ? 'Demo data' : 'Live API'}
      </Text>
    </ScrollView>
  );
}
