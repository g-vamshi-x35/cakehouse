import { Image } from 'expo-image';
import { useState } from 'react';
import { KeyboardAvoidingView, Linking, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, Card, Chip, Field, Row } from '@/components/ui';
import { useAuth } from '@/lib/auth';
import { business, callPhone, openWhatsApp } from '@/lib/business';
import { LOGO } from '@/lib/images';
import { supabase } from '@/lib/supabase';
import { C } from '@/lib/theme';

const ROLE_LABEL: Record<string, string> = { owner: 'Owner', employee: 'Employee', delivery: 'Delivery', customer: 'Customer' };

export default function AccountScreen() {
  const { session, profile, signOut } = useAuth();

  return (
    <SafeAreaView style={styles.page} edges={['top']}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.wrap} keyboardShouldPersistTaps="handled">
          <View style={{ alignItems: 'center', gap: 8 }}>
            <Image source={LOGO} style={styles.logo} alt="Cake House logo" />
            <Text style={styles.title}>{business.name}</Text>
            <Text style={styles.muted}>{business.tagline}</Text>
          </View>

          {session ? (
            <Card>
              <Row label="Signed in as" value={profile?.full_name || session.user.email || ''} strong />
              <Row label="Email" value={session.user.email ?? ''} />
              <Row label="Account" value={ROLE_LABEL[profile?.role ?? 'customer']} />
              <Button title="Log out" variant="outline" onPress={signOut} />
            </Card>
          ) : (
            <AuthForm />
          )}

          <Card>
            <Text style={styles.section}>Contact the shop</Text>
            <Text style={styles.body}>{business.address}</Text>
            <Text style={styles.muted}>{business.hours}</Text>
            <View style={{ flexDirection: 'row', gap: 10 }}>
              <Button title="Call" variant="outline" onPress={() => callPhone(business.phones[0])} style={{ flex: 1 }} />
              <Button title="WhatsApp" variant="whatsapp" onPress={() => openWhatsApp(`Hi ${business.name}!`)} style={{ flex: 1 }} />
            </View>
            <Button title="Open in Maps" variant="outline" onPress={() => Linking.openURL(business.mapsUrl)} />
          </Card>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function AuthForm() {
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ text: string; ok?: boolean } | null>(null);

  async function submit() {
    setMessage(null);
    if (!email.trim() || password.length < 6) {
      setMessage({ text: 'Enter your email and a password of at least 6 characters.' });
      return;
    }
    setBusy(true);
    if (mode === 'login') {
      const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
      if (error) setMessage({ text: error.message });
    } else {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: { data: { full_name: fullName.trim(), phone: phone.trim() } },
      });
      if (error) setMessage({ text: error.message });
      else if (!data.session) setMessage({ text: 'Account created! Check your email to confirm it, then log in.', ok: true });
    }
    setBusy(false);
  }

  return (
    <Card>
      <View style={{ flexDirection: 'row', gap: 8 }}>
        <Chip label="Log in" selected={mode === 'login'} onPress={() => setMode('login')} />
        <Chip label="Sign up" selected={mode === 'signup'} onPress={() => setMode('signup')} />
      </View>
      {mode === 'signup' && (
        <>
          <Field label="Full name" value={fullName} onChangeText={setFullName} autoComplete="name" textContentType="name" />
          <Field label="Phone number" value={phone} onChangeText={setPhone} keyboardType="phone-pad" autoComplete="tel" />
        </>
      )}
      <Field
        label="Email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
        autoComplete="email"
        textContentType="emailAddress"
      />
      <Field
        label="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
        textContentType={mode === 'login' ? 'password' : 'newPassword'}
        onSubmitEditing={submit}
      />
      {message ? <Text style={{ color: message.ok ? C.green : C.red, fontWeight: '600' }}>{message.text}</Text> : null}
      <Button title={mode === 'login' ? 'Log in' : 'Create account'} onPress={submit} loading={busy} />
      <Text style={styles.small}>Staff (owner, employee, delivery) log in here with their work email to open the dashboard.</Text>
    </Card>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: C.page },
  wrap: { padding: 16, gap: 16, paddingBottom: 40, maxWidth: 700, width: '100%', alignSelf: 'center' },
  logo: { width: 84, height: 84, borderRadius: 42 },
  title: { fontSize: 26, fontWeight: '800', color: C.brown },
  section: { fontSize: 17, fontWeight: '800', color: C.brown },
  body: { fontSize: 15, color: C.ink, lineHeight: 21 },
  muted: { color: C.muted, fontSize: 15 },
  small: { color: C.muted, fontSize: 13 },
});
