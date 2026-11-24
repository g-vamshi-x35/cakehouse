import Ionicons from '@expo/vector-icons/Ionicons';
import { useCallback, useEffect, useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown, FadeOut, LinearTransition } from 'react-native-reanimated';
import { SignInPrompt } from '@/components/sign-in-prompt';
import { Button, Card, Chip, EmptyState, ErrorState, Field, LoadingState, Notice } from '@/components/ui';
import { addressText, deleteAddress, fetchAddresses, saveAddress, type Address } from '@/lib/addresses';
import { useAuth } from '@/lib/auth';
import { C, F, MAX_W, R } from '@/lib/theme';

type Draft = { id?: string; label: string; full_address: string; city: string; pincode: string; is_default: boolean };
const EMPTY: Draft = { label: 'Home', full_address: '', city: 'Berhampur', pincode: '', is_default: false };

export default function AddressesScreen() {
  const { session } = useAuth();
  const [list, setList] = useState<Address[] | null>(null);
  const [error, setError] = useState('');
  const [draft, setDraft] = useState<Draft | null>(null);
  const [busy, setBusy] = useState(false);
  const [formError, setFormError] = useState('');

  const load = useCallback(async () => {
    if (!session) return;
    return fetchAddresses(session.user.id).then(
      (rows) => {
        setList(rows);
        setError('');
      },
      () => setError("Couldn't load your addresses.")
    );
  }, [session]);

  useEffect(() => {
    load();
  }, [load]);

  if (!session) return <SignInPrompt what="your saved addresses" />;
  if (error && !list) return <ErrorState message={error} onRetry={load} />;
  if (!list) return <LoadingState />;

  async function submit() {
    if (!draft || !session) return;
    setFormError('');
    if (draft.full_address.trim().length < 8) return setFormError('Please enter the full address (house, street, area).');
    if (draft.pincode && !/^\d{6}$/.test(draft.pincode.trim())) return setFormError('PIN code should be 6 digits.');
    setBusy(true);
    try {
      await saveAddress(session.user.id, { ...draft, is_default: draft.is_default || list!.length === 0 });
      setDraft(null);
      await load();
    } catch {
      setFormError('Could not save the address. Please try again.');
    } finally {
      setBusy(false);
    }
  }

  function remove(a: Address) {
    const go = async () => {
      await deleteAddress(a.id).catch(() => {});
      load();
    };
    if (Platform.OS === 'web') return go();
    Alert.alert('Delete address?', addressText(a), [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: go },
    ]);
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.wrap} keyboardShouldPersistTaps="handled">
        {list.length === 0 && !draft ? (
          <EmptyState icon="location-outline" title="No saved addresses" body="Save your home or office address for faster checkout." />
        ) : null}

        {list.map((a) => (
          <Animated.View key={a.id} layout={LinearTransition} exiting={FadeOut} style={styles.card}>
            <View style={styles.icon}>
              <Ionicons name={a.label?.toLowerCase() === 'work' ? 'briefcase-outline' : 'home-outline'} size={19} color={C.rose} />
            </View>
            <View style={{ flex: 1, gap: 3 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Text style={styles.label}>{a.label || 'Address'}</Text>
                {a.is_default ? (
                  <View style={styles.default}>
                    <Text style={styles.defaultText}>Default</Text>
                  </View>
                ) : null}
              </View>
              <Text style={styles.text}>{addressText(a)}</Text>
              <View style={{ flexDirection: 'row', gap: 16, marginTop: 6 }}>
                <Pressable
                  onPress={() =>
                    setDraft({ id: a.id, label: a.label ?? '', full_address: a.full_address, city: a.city ?? '', pincode: a.pincode ?? '', is_default: a.is_default })
                  }
                  hitSlop={8}
                  accessibilityRole="button">
                  <Text style={styles.action}>Edit</Text>
                </Pressable>
                <Pressable onPress={() => remove(a)} hitSlop={8} accessibilityRole="button">
                  <Text style={[styles.action, { color: C.red }]}>Delete</Text>
                </Pressable>
              </View>
            </View>
          </Animated.View>
        ))}

        {draft ? (
          <Animated.View entering={FadeInDown.duration(300)}>
            <Card style={{ gap: 14 }}>
              <Text style={styles.formTitle}>{draft.id ? 'Edit address' : 'New address'}</Text>
              <View style={{ flexDirection: 'row', gap: 8 }}>
                {['Home', 'Work', 'Other'].map((l) => (
                  <Chip key={l} label={l} selected={draft.label === l} onPress={() => setDraft({ ...draft, label: l })} />
                ))}
              </View>
              <Field
                label="Full address"
                icon="location-outline"
                value={draft.full_address}
                onChangeText={(t) => setDraft({ ...draft, full_address: t })}
                multiline
                placeholder="House no., street, village / area, landmark"
              />
              <View style={{ flexDirection: 'row', gap: 10 }}>
                <View style={{ flex: 1 }}>
                  <Field label="City / town" value={draft.city} onChangeText={(t) => setDraft({ ...draft, city: t })} />
                </View>
                <View style={{ width: 130 }}>
                  <Field label="PIN code" value={draft.pincode} onChangeText={(t) => setDraft({ ...draft, pincode: t.replace(/\D/g, '') })} keyboardType="number-pad" maxLength={6} />
                </View>
              </View>
              <Pressable
                onPress={() => setDraft({ ...draft, is_default: !draft.is_default })}
                style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}
                accessibilityRole="checkbox"
                accessibilityState={{ checked: draft.is_default }}>
                <Ionicons name={draft.is_default ? 'checkbox' : 'square-outline'} size={20} color={C.rose} />
                <Text style={styles.text}>Use as my default address</Text>
              </Pressable>
              {formError ? <Notice tone="error" text={formError} /> : null}
              <View style={{ flexDirection: 'row', gap: 10 }}>
                <Button title="Cancel" variant="outline" onPress={() => setDraft(null)} style={{ flex: 1 }} />
                <Button title="Save" onPress={submit} loading={busy} style={{ flex: 1 }} />
              </View>
            </Card>
          </Animated.View>
        ) : (
          <Button title="Add new address" icon="add" onPress={() => setDraft({ ...EMPTY })} />
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  wrap: { padding: 16, gap: 12, paddingBottom: 40, maxWidth: MAX_W, width: '100%', alignSelf: 'center' },
  card: { flexDirection: 'row', gap: 12, backgroundColor: C.surface, borderRadius: R.lg, padding: 14, borderWidth: 1, borderColor: C.border },
  icon: { width: 38, height: 38, borderRadius: 12, backgroundColor: C.roseSoft, alignItems: 'center', justifyContent: 'center' },
  label: { fontFamily: F.bodyBlack, fontSize: 15, color: C.ink },
  default: { backgroundColor: C.greenBg, borderRadius: R.pill, paddingHorizontal: 8, paddingVertical: 1 },
  defaultText: { fontFamily: F.bodyBold, fontSize: 11, color: C.green },
  text: { fontFamily: F.body, fontSize: 14, color: C.ink, lineHeight: 20 },
  action: { fontFamily: F.bodyBold, fontSize: 14, color: C.rose },
  formTitle: { fontFamily: F.heading, fontSize: 19, color: C.brown },
});
