import { Image } from 'expo-image';
import { router } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { EyeToggle } from '@/components/eye-toggle';
import { Button, Field, Notice } from '@/components/ui';
import { useAuth } from '@/lib/auth';
import { business, openWhatsApp } from '@/lib/business';
import { LOGO, WEBSITE_URL } from '@/lib/images';
import { supabase } from '@/lib/supabase';
import { C, F, MAX_W } from '@/lib/theme';
import { validatePhone } from '@/lib/validation';

export default function LoginScreen() {
  const insets = useSafeAreaInsets();
  const { signIn, markOnboarded } = useAuth();
  const [id, setId] = useState('');
  const [pw, setPw] = useState('');
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');

  const isEmail = id.includes('@');

  async function submit() {
    setError('');
    setInfo('');
    if (!id.trim() || !pw) {
      setError('Please enter your phone number (or email) and password.');
      return;
    }
    if (!isEmail && validatePhone(id)) {
      setError(validatePhone(id));
      return;
    }
    setBusy(true);
    const res = await signIn(id, pw);
    setBusy(false);
    if (res.error) {
      setError(res.error);
      return;
    }
    markOnboarded();
    if (router.canDismiss()) router.dismissAll();
    router.replace('/');
  }

  async function forgot() {
    setError('');
    if (isEmail) {
      // Same reset flow as the website: the email links to its reset page.
      const { error: e } = await supabase.auth.resetPasswordForEmail(id.trim(), { redirectTo: `${WEBSITE_URL}/reset-password` });
      if (e?.status === 429) setError('Too many attempts — please wait a bit and try again.');
      else setInfo('If an account exists for that email, a reset link is on its way.');
    } else {
      openWhatsApp(`Hi ${business.name}! I forgot the password for my app account (${id.trim() || 'my phone number'}). Please help me reset it.`);
    }
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={[styles.wrap, { paddingBottom: insets.bottom + 24 }]} keyboardShouldPersistTaps="handled">
        <Animated.View entering={FadeInDown.duration(450)} style={{ alignItems: 'center', gap: 10 }}>
          <Image source={LOGO} style={styles.logo} alt="Cake House logo" />
          <Text style={styles.title} accessibilityRole="header">
            Welcome back
          </Text>
          <Text style={styles.sub}>Log in to order, track your cakes and manage your account.</Text>
        </Animated.View>

        <Animated.View entering={FadeInDown.duration(450).delay(120)} style={{ gap: 16 }}>
          <Field
            label="Phone number or email"
            icon={isEmail ? 'mail-outline' : 'call-outline'}
            value={id}
            onChangeText={setId}
            placeholder="10-digit mobile number"
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType={isEmail ? 'email-address' : 'default'}
            autoComplete="username"
            textContentType="username"
            hint="Registered on the website with email? Use your email here."
          />
          <Field
            label="Password"
            icon="lock-closed-outline"
            value={pw}
            onChangeText={setPw}
            secureTextEntry={!show}
            autoCapitalize="none"
            autoCorrect={false}
            autoComplete="current-password"
            textContentType="password"
            placeholder="Your password"
            onSubmitEditing={submit}
            right={<EyeToggle shown={show} onToggle={() => setShow((s) => !s)} />}
          />
          <Pressable onPress={forgot} hitSlop={8} accessibilityRole="button" style={{ alignSelf: 'flex-end' }}>
            <Text style={styles.link}>Forgot password?</Text>
          </Pressable>
        </Animated.View>

        {error ? <Notice tone="error" text={error} /> : null}
        {info ? <Notice tone="success" text={info} /> : null}

        <View style={{ flex: 1 }} />
        <Button title="Log in" icon="log-in-outline" size="lg" onPress={submit} loading={busy} />
        <View style={styles.footer}>
          <Text style={styles.footerText}>New to Cake House?</Text>
          <Pressable onPress={() => router.replace('/register/details')} hitSlop={8} accessibilityRole="button">
            <Text style={styles.link}>Create an account</Text>
          </Pressable>
        </View>
        <Text style={styles.staff}>Owner, employee and delivery staff log in with their work email.</Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  wrap: { flexGrow: 1, padding: 22, gap: 22, maxWidth: MAX_W, width: '100%', alignSelf: 'center' },
  logo: { width: 84, height: 84, borderRadius: 42, borderWidth: 3, borderColor: C.cream },
  title: { fontFamily: F.heading, fontSize: 30, color: C.brown },
  sub: { fontFamily: F.body, fontSize: 15, color: C.muted, textAlign: 'center', lineHeight: 22 },
  link: { fontFamily: F.bodyBold, color: C.rose, fontSize: 14.5 },
  footer: { flexDirection: 'row', justifyContent: 'center', gap: 6 },
  footerText: { fontFamily: F.body, color: C.muted, fontSize: 14.5 },
  staff: { fontFamily: F.body, fontSize: 12.5, color: C.faint, textAlign: 'center', marginTop: -10 },
});
