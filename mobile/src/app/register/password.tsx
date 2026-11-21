import Ionicons from '@expo/vector-icons/Ionicons';
import { Redirect, router } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { EyeToggle } from '@/components/eye-toggle';
import { StepHeader } from '@/components/step-header';
import { Button, Field, Notice } from '@/components/ui';
import { registrationDraft, useAuth } from '@/lib/auth';
import { C, F, MAX_W } from '@/lib/theme';
import { passwordChecks } from '@/lib/validation';

export default function PasswordScreen() {
  const insets = useSafeAreaInsets();
  const { signUp, markOnboarded } = useAuth();
  const [pw, setPw] = useState('');
  const [confirm, setConfirm] = useState('');
  const [show, setShow] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');

  // Opened directly (e.g. after an app restart) without step 1.
  if (!registrationDraft.phone) return <Redirect href="/register/details" />;

  const checks = passwordChecks(pw);
  const strong = checks.every((c) => c.ok);
  const mismatch = confirm.length > 0 && confirm !== pw;

  async function create() {
    setSubmitted(true);
    setError('');
    if (!strong || confirm !== pw) return;
    setBusy(true);
    const res = await signUp({ ...registrationDraft, password: pw });
    setBusy(false);
    if (res.error) {
      setError(res.error);
      return;
    }
    if (res.needsConfirmation) {
      setInfo('Account created! Please verify your account, then log in.');
      return;
    }
    markOnboarded();
    router.replace({ pathname: '/register/success', params: { name: registrationDraft.fullName } });
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={[styles.wrap, { paddingBottom: insets.bottom + 24 }]} keyboardShouldPersistTaps="handled">
        <StepHeader step={2} total={2} title="Create a password" subtitle={`You'll log in with +91 ${registrationDraft.phone} and this password.`} />

        <Animated.View entering={FadeInDown.duration(450).delay(120)} style={{ gap: 16 }}>
          <Field
            label="Password"
            icon="lock-closed-outline"
            value={pw}
            onChangeText={setPw}
            secureTextEntry={!show}
            autoCapitalize="none"
            autoCorrect={false}
            autoComplete="new-password"
            textContentType="newPassword"
            placeholder="Create a password"
            right={<EyeToggle shown={show} onToggle={() => setShow((s) => !s)} />}
            error={submitted && !strong ? 'Please meet all the password rules below.' : undefined}
          />
          <View style={styles.checks}>
            {checks.map((c) => (
              <View key={c.label} style={styles.check}>
                <Ionicons name={c.ok ? 'checkmark-circle' : 'ellipse-outline'} size={16} color={c.ok ? C.green : C.faint} />
                <Text style={[styles.checkText, c.ok && { color: C.green }]}>{c.label}</Text>
              </View>
            ))}
          </View>
          <Field
            label="Confirm password"
            icon="shield-checkmark-outline"
            value={confirm}
            onChangeText={setConfirm}
            secureTextEntry={!showConfirm}
            autoCapitalize="none"
            autoCorrect={false}
            autoComplete="new-password"
            textContentType="newPassword"
            placeholder="Type it again"
            onSubmitEditing={create}
            right={<EyeToggle shown={showConfirm} onToggle={() => setShowConfirm((s) => !s)} />}
            error={mismatch || (submitted && confirm !== pw) ? 'Passwords don’t match.' : undefined}
          />
        </Animated.View>

        {error ? <Notice tone="error" text={error} /> : null}
        {info ? <Notice tone="success" text={info} /> : null}
        {error.includes('already registered') || info ? (
          <Button title="Go to log in" variant="outline" onPress={() => router.replace('/login')} />
        ) : null}

        <View style={{ flex: 1 }} />
        <Button title="Create Account" icon="sparkles" size="lg" onPress={create} loading={busy} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  wrap: { flexGrow: 1, padding: 22, gap: 22, maxWidth: MAX_W, width: '100%', alignSelf: 'center' },
  checks: { gap: 6, marginTop: -6 },
  check: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  checkText: { fontFamily: F.body, fontSize: 13.5, color: C.muted },
});
