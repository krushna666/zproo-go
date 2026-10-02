import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { api } from '../api/services';
import { Button, Card, TextField } from '../components/ui';
import { useAuth } from '../store/auth';
import { colors, font, space } from '../theme';
import { API_CONFIG } from '../api/config';

export default function LoginScreen() {
  const { signIn } = useAuth();
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [phone, setPhone] = useState('');
  const [name, setName] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const sendOtp = async () => {
    setError('');
    if (!/^\d{10}$/.test(phone)) return setError('Enter a valid 10-digit mobile number');
    setLoading(true);
    try {
      await api.sendOtp(phone);
      setStep('otp');
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const verify = async () => {
    setError('');
    if (otp.length !== 6) return setError('Enter the 6-digit OTP');
    setLoading(true);
    try {
      const user = await api.verifyOtp(phone, otp, name);
      await signIn(user);
    } catch (e: any) {
      setError(e.message);
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.primary }}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
          <View style={{ padding: space.xxl, paddingTop: 56, paddingBottom: 48 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <View
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 12,
                  backgroundColor: colors.accent,
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: 10,
                }}
              >
                <Text style={{ color: colors.white, fontSize: 24, fontWeight: '900' }}>Z</Text>
              </View>
              <Text style={{ color: colors.white, fontSize: 32, fontWeight: '900', letterSpacing: -0.5 }}>zproo</Text>
            </View>
            <Text style={{ color: '#C9D2FF', fontSize: 16, marginTop: 14, lineHeight: 23 }}>
              Buses, trains, flights and hotels.{'\n'}One app for every trip.
            </Text>
            <View style={{ flexDirection: 'row', marginTop: 22 }}>
              {(['bus', 'train', 'airplane', 'bed'] as const).map((i) => (
                <View key={i} style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.14)', alignItems: 'center', justifyContent: 'center', marginRight: 10 }}>
                  <Ionicons name={i} size={20} color={colors.white} />
                </View>
              ))}
            </View>
          </View>

          <View style={{ flex: 1, backgroundColor: colors.bg, borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: space.xl }}>
            <Card>
              {step === 'phone' ? (
                <>
                  <Text style={[font.h2, { marginBottom: 4 }]}>Log in or sign up</Text>
                  <Text style={[font.small, { marginBottom: space.lg }]}>We'll send a one-time password to your mobile.</Text>
                  <TextField label="Your name (optional)" value={name} onChangeText={setName} placeholder="e.g. Krushna Deore" autoCapitalize="words" />
                  <TextField
                    label="Mobile number"
                    value={phone}
                    onChangeText={(t) => setPhone(t.replace(/\D/g, '').slice(0, 10))}
                    placeholder="10-digit mobile number"
                    keyboardType="phone-pad"
                    error={error}
                  />
                  <Button title="Get OTP" onPress={sendOtp} loading={loading} />
                </>
              ) : (
                <>
                  <Text style={[font.h2, { marginBottom: 4 }]}>Verify OTP</Text>
                  <Text style={[font.small, { marginBottom: space.lg }]}>Sent to +91 {phone}</Text>
                  <TextField
                    label="One-time password"
                    value={otp}
                    onChangeText={(t) => setOtp(t.replace(/\D/g, '').slice(0, 6))}
                    placeholder="••••••"
                    keyboardType="number-pad"
                    autoFocus
                    error={error}
                  />
                  {API_CONFIG.USE_MOCK && (
                    <Text style={[font.small, { marginBottom: space.md, color: colors.accent }]}>Demo mode: use OTP 123456</Text>
                  )}
                  <Button title="Verify & continue" onPress={verify} loading={loading} />
                  <Button
                    title="Change number"
                    variant="ghost"
                    onPress={() => {
                      setStep('phone');
                      setOtp('');
                      setError('');
                    }}
                    style={{ marginTop: 6 }}
                  />
                </>
              )}
            </Card>
            <Text style={[font.small, { textAlign: 'center', marginTop: space.lg, color: colors.textFaint }]}>
              By continuing you agree to Zproo's Terms & Privacy Policy
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
