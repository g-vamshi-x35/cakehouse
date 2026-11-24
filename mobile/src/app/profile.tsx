import { router } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet } from 'react-native';
import { DateField } from '@/components/date-field';
import { SignInPrompt } from '@/components/sign-in-prompt';
import { Button, Field, Notice } from '@/components/ui';
import { isPhoneLoginEmail, useAuth } from '@/lib/auth';
import { MAX_W } from '@/lib/theme';
import { normalizePhone, validateBirthday, validateName, validatePhone, ymd } from '@/lib/validation';

export default function ProfileScreen() {
  const { session, profile, updateProfile } = useAuth();
  const [name, setName] = useState(profile?.full_name ?? '');
  const [phone, setPhone] = useState(profile?.phone ?? '');
  const [dob, setDob] = useState<Date | null>(profile?.birthday ? new Date(`${profile.birthday}T00:00:00`) : null);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ text: string; ok: boolean } | null>(null);

  if (!session) return <SignInPrompt what="your details" />;
  const email = session.user.email;
  const phoneAccount = isPhoneLoginEmail(email);
  const maxDob = new Date();
  maxDob.setFullYear(maxDob.getFullYear() - 5);

  async function save() {
    setMsg(null);
    const e = validateName(name) || validatePhone(phone) || (dob ? validateBirthday(dob) : '');
    if (e) return setMsg({ text: e, ok: false });
    setBusy(true);
    const res = await updateProfile({ full_name: name.trim(), phone: normalizePhone(phone), birthday: dob ? ymd(dob) : null });
    setBusy(false);
    if (res.error) return setMsg({ text: res.error, ok: false });
    setMsg({ text: 'Your details have been saved.', ok: true });
    setTimeout(() => router.back(), 700);
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.wrap} keyboardShouldPersistTaps="handled">
        <Field label="Full name" icon="person-outline" value={name} onChangeText={setName} autoComplete="name" />
        <Field
          label="Phone number"
          icon="call-outline"
          value={phone}
          onChangeText={setPhone}
          keyboardType="phone-pad"
          maxLength={14}
          hint={phoneAccount ? 'Contact number for deliveries. Your login number stays the one you registered with.' : undefined}
        />
        {!phoneAccount && email ? <Field label="Email (login)" icon="mail-outline" value={email} editable={false} /> : null}
        <DateField label="Date of birth" value={dob} onChange={setDob} maximumDate={maxDob} minimumDate={new Date(1920, 0, 1)} />
        {msg ? <Notice tone={msg.ok ? 'success' : 'error'} text={msg.text} /> : null}
        <Button title="Save changes" icon="checkmark" size="lg" onPress={save} loading={busy} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  wrap: { padding: 16, gap: 16, maxWidth: MAX_W, width: '100%', alignSelf: 'center' },
});
