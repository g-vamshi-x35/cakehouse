import { router } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { DateField } from '@/components/date-field';
import { StepHeader } from '@/components/step-header';
import { Button, Field } from '@/components/ui';
import { registrationDraft } from '@/lib/auth';
import { C, F, MAX_W } from '@/lib/theme';
import { normalizePhone, validateBirthday, validateName, validatePhone, ymd } from '@/lib/validation';

export default function DetailsScreen() {
  const insets = useSafeAreaInsets();
  const [name, setName] = useState(registrationDraft.fullName);
  const [phone, setPhone] = useState(registrationDraft.phone);
  const [dob, setDob] = useState<Date | null>(registrationDraft.birthday ? new Date(`${registrationDraft.birthday}T00:00:00`) : null);
  const [errors, setErrors] = useState<{ name?: string; phone?: string; dob?: string }>({});
  const [touched, setTouched] = useState(false);

  const maxDob = new Date();
  maxDob.setFullYear(maxDob.getFullYear() - 5);
  const minDob = new Date(1920, 0, 1);

  function validate() {
    const e = { name: validateName(name), phone: validatePhone(phone), dob: validateBirthday(dob) };
    setErrors(e);
    return !e.name && !e.phone && !e.dob;
  }

  function next() {
    setTouched(true);
    if (!validate()) return;
    registrationDraft.fullName = name.trim();
    registrationDraft.phone = normalizePhone(phone);
    registrationDraft.birthday = ymd(dob!);
    router.push('/register/password');
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={[styles.wrap, { paddingBottom: insets.bottom + 24 }]} keyboardShouldPersistTaps="handled">
        <StepHeader
          step={1}
          total={2}
          title="Tell us about you"
          subtitle="We use these to deliver your orders and send you a treat on your birthday every year."
        />

        <Animated.View entering={FadeInDown.duration(450).delay(120)} style={{ gap: 16 }}>
          <Field
            label="Full name"
            icon="person-outline"
            value={name}
            onChangeText={(t) => {
              setName(t);
              if (touched) setErrors((e) => ({ ...e, name: validateName(t) }));
            }}
            placeholder="e.g. Priya Sharma"
            autoComplete="name"
            textContentType="name"
            autoCapitalize="words"
            returnKeyType="next"
            error={errors.name}
          />
          <Field
            label="Phone number"
            icon="call-outline"
            value={phone}
            onChangeText={(t) => {
              setPhone(t.replace(/[^\d+ ]/g, ''));
              if (touched) setErrors((e) => ({ ...e, phone: validatePhone(t) }));
            }}
            placeholder="10-digit mobile number"
            keyboardType="phone-pad"
            autoComplete="tel"
            textContentType="telephoneNumber"
            maxLength={14}
            error={errors.phone}
            hint="You’ll use this number to log in."
            right={<Text style={styles.prefix}>+91</Text>}
          />
          <DateField
            label="Date of birth"
            value={dob}
            onChange={(d) => {
              setDob(d);
              if (touched) setErrors((e) => ({ ...e, dob: validateBirthday(d) }));
            }}
            placeholder="Select your birthday"
            minimumDate={minDob}
            maximumDate={maxDob}
            error={errors.dob}
          />
        </Animated.View>

        <View style={{ flex: 1 }} />
        <Button title="Continue" icon="arrow-forward" size="lg" onPress={next} />
        <Text style={styles.legal}>Your details are stored securely and never shared.</Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  wrap: { flexGrow: 1, padding: 22, gap: 26, maxWidth: MAX_W, width: '100%', alignSelf: 'center' },
  prefix: { fontFamily: F.bodyBold, color: C.muted, paddingRight: 14, fontSize: 15 },
  legal: { fontFamily: F.body, fontSize: 12.5, color: C.muted, textAlign: 'center', marginTop: -12 },
});
