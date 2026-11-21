import Ionicons from '@expo/vector-icons/Ionicons';
import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown, ZoomIn } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppHeader } from '@/components/app-header';
import { DateField } from '@/components/date-field';
import { Button, Card, Chip, Field, Notice, QtyStepper, SectionTitle } from '@/components/ui';
import { useAuth } from '@/lib/auth';
import { business, openWhatsApp } from '@/lib/business';
import { MENU_IMAGES } from '@/lib/images';
import { supabase } from '@/lib/supabase';
import { C, F, MAX_W, R } from '@/lib/theme';
import { pickImage, uploadCustomCakeImage, type PickedImage } from '@/lib/upload';
import { normalizePhone, validateName, validatePhone, ymd } from '@/lib/validation';

// Same options as the website's custom cake form (src/components/sections/CustomCakeForm.tsx).
const SHAPES = ['Round', 'Square', 'Heart', 'Number / Letter', 'Custom Sculpted'];
const SIZES = ['0.5 kg', '1 kg', '1.5 kg', '2 kg', '3 kg+'];
const FLAVOURS = ['Vanilla', 'Chocolate', 'Butterscotch', 'Black Forest', 'Red Velvet', 'Pineapple'];
const CREAMS = ['Whipped Cream', 'Fondant', 'Buttercream', 'Ganache'];

export default function CustomCakeScreen() {
  const params = useLocalSearchParams<{ theme?: string }>();
  const { session, profile } = useAuth();

  // null = not typed yet, so the signed-in customer's details show as defaults.
  const [nameInput, setName] = useState<string | null>(null);
  const [phoneInput, setPhone] = useState<string | null>(null);
  const name = nameInput ?? profile?.full_name ?? '';
  const phone = phoneInput ?? profile?.phone ?? '';
  const [shape, setShape] = useState(SHAPES[0]);
  const [size, setSize] = useState(SIZES[1]);
  const [layers, setLayers] = useState(1);
  const [flavour, setFlavour] = useState(FLAVOURS[0]);
  const [cream, setCream] = useState(CREAMS[0]);
  const [theme, setTheme] = useState(params.theme ?? '');
  const [message, setMessage] = useState('');
  const [instructions, setInstructions] = useState('');
  const [date, setDate] = useState<Date | null>(null);
  const [photo, setPhoto] = useState<PickedImage | null>(null);
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);

  // "Customize this cake" on a product page pre-fills the theme.
  const [lastParam, setLastParam] = useState(params.theme);
  if (params.theme !== lastParam) {
    setLastParam(params.theme);
    if (params.theme) setTheme(params.theme);
  }

  const minDate = new Date();
  minDate.setDate(minDate.getDate() + 1);
  const maxDate = new Date();
  maxDate.setMonth(maxDate.getMonth() + 6);

  async function choose(source: 'library' | 'camera') {
    setError('');
    const res = await pickImage(source);
    if (!res) return;
    if ('error' in res) return setError(res.error);
    setPhoto(res);
    setPhotoUrl(null);
    setUploading(true);
    try {
      setPhotoUrl(await uploadCustomCakeImage(res));
    } catch {
      setPhoto(null);
      setError('Couldn’t upload that image — please try a different photo.');
    } finally {
      setUploading(false);
    }
  }

  async function submit() {
    setError('');
    const e = validateName(name) || validatePhone(phone);
    if (e) return setError(e);
    if (!theme.trim() && !photoUrl && !instructions.trim()) return setError('Tell us the theme, add a photo or describe your idea.');
    if (!date) return setError('Please choose when you need the cake.');
    if (uploading) return setError('Please wait for the photo to finish uploading.');
    setBusy(true);
    const notes = [message.trim() && `Message on cake: "${message.trim()}"`, instructions.trim()].filter(Boolean).join('\n');
    const { error: dbError } = await supabase.from('custom_cake_requests').insert({
      customer_id: session?.user.id ?? null,
      customer_name: name.trim(),
      customer_phone: normalizePhone(phone),
      shape,
      size,
      layers,
      flavour,
      cream_type: cream,
      theme: theme.trim() || null,
      inspiration_image_url: photoUrl,
      instructions: notes || null,
      event_date: ymd(date),
    });
    setBusy(false);
    if (dbError) return setError('Could not send your request. Please check your connection and try again.');
    setDone(true);
  }

  function reset() {
    setDone(false);
    setTheme('');
    setMessage('');
    setInstructions('');
    setPhoto(null);
    setPhotoUrl(null);
    setDate(null);
  }

  if (done) {
    return (
      <SafeAreaView style={styles.page} edges={['top']}>
        <View style={styles.done}>
          <Animated.View entering={ZoomIn.springify().damping(12)} style={styles.doneIcon}>
            <Text style={{ fontSize: 52 }}>🎂</Text>
          </Animated.View>
          <Animated.Text entering={FadeInDown.delay(200)} style={styles.doneTitle}>
            Request Sent!
          </Animated.Text>
          <Animated.Text entering={FadeInDown.delay(300)} style={styles.doneBody}>
            Thanks for sharing your idea — we’ll review it and send you a quote soon. You’ll get a notification when it’s ready.
          </Animated.Text>
          <Animated.View entering={FadeInDown.delay(400)} style={{ gap: 10, alignSelf: 'stretch' }}>
            {session ? <Button title="View my requests" icon="list-outline" onPress={() => router.push('/custom-requests')} /> : null}
            <Button
              title="Discuss on WhatsApp"
              icon="logo-whatsapp"
              variant="whatsapp"
              onPress={() => openWhatsApp(`Hi ${business.name}! I just sent a custom cake request (${theme || shape}, ${size}) from the app.`)}
            />
            <Button title="Design another cake" variant="outline" onPress={reset} />
          </Animated.View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.page} edges={['top']}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.wrap} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          <AppHeader title="Custom Cake" subtitle="Designed exactly how you imagine" />

          <Animated.View entering={FadeInDown.duration(500)} style={styles.intro}>
            <Image source={MENU_IMAGES.doraemon} style={styles.introImg} contentFit="cover" alt="" />
            <View style={{ flex: 1, gap: 4 }}>
              <Text style={styles.eyebrow}>Made to order</Text>
              <Text style={styles.introTitle}>Design Your Dream Cake</Text>
              <Text style={styles.introBody}>Share your idea and a photo. We’ll review it and send you a quote for approval.</Text>
            </View>
          </Animated.View>

          <SectionTitle eyebrow="Your details">Contact</SectionTitle>
          <Field label="Your name" icon="person-outline" value={name} onChangeText={setName} autoComplete="name" />
          <Field label="Phone number" icon="call-outline" value={phone} onChangeText={setPhone} keyboardType="phone-pad" autoComplete="tel" maxLength={14} />

          <SectionTitle eyebrow="The cake">Size & shape</SectionTitle>
          <OptionGroup label="Cake size" options={SIZES} value={size} onChange={setSize} />
          <OptionGroup label="Shape" options={SHAPES} value={shape} onChange={setShape} />
          <View style={styles.layerRow}>
            <View>
              <Text style={styles.label}>Layers / tiers</Text>
              <Text style={styles.hint}>1 to 5</Text>
            </View>
            <QtyStepper value={layers} onChange={setLayers} min={1} max={5} />
          </View>

          <SectionTitle eyebrow="Taste">Flavour & finish</SectionTitle>
          <OptionGroup label="Flavour" options={FLAVOURS} value={flavour} onChange={setFlavour} />
          <OptionGroup label="Cream / finish" options={CREAMS} value={cream} onChange={setCream} />

          <SectionTitle eyebrow="Design">Theme & message</SectionTitle>
          <Field label="Theme / design" icon="color-palette-outline" value={theme} onChangeText={setTheme} placeholder='e.g. "Superheroes", "Unicorn Garden"' />
          <Field
            label="Message on cake (optional)"
            icon="create-outline"
            value={message}
            onChangeText={setMessage}
            placeholder='e.g. "Happy 5th Birthday Riya"'
            maxLength={60}
          />

          <View style={{ gap: 8 }}>
            <Text style={styles.label}>Inspiration photo (optional)</Text>
            {photo ? (
              <View style={styles.photoWrap}>
                <Image source={{ uri: photo.uri }} style={styles.photo} contentFit="cover" alt="Your inspiration photo" />
                {uploading ? (
                  <View style={styles.photoOverlay}>
                    <ActivityIndicator color={C.white} />
                    <Text style={styles.photoOverlayText}>Uploading…</Text>
                  </View>
                ) : (
                  <View style={styles.photoBadge}>
                    <Ionicons name="checkmark-circle" size={16} color={C.green} />
                    <Text style={styles.photoBadgeText}>Uploaded</Text>
                  </View>
                )}
                <Pressable
                  style={styles.photoRemove}
                  onPress={() => {
                    setPhoto(null);
                    setPhotoUrl(null);
                  }}
                  accessibilityRole="button"
                  accessibilityLabel="Remove photo">
                  <Ionicons name="close" size={18} color={C.white} />
                </Pressable>
              </View>
            ) : (
              <View style={styles.uploadRow}>
                <UploadTile icon="images-outline" label="Choose from gallery" onPress={() => choose('library')} />
                {Platform.OS !== 'web' ? <UploadTile icon="camera-outline" label="Take a photo" onPress={() => choose('camera')} /> : null}
              </View>
            )}
          </View>

          <Field
            label="Special instructions"
            icon="chatbubble-ellipses-outline"
            value={instructions}
            onChangeText={setInstructions}
            multiline
            placeholder="Colours, characters, toppers, dietary notes…"
          />

          <SectionTitle eyebrow="Delivery">When do you need it?</SectionTitle>
          <DateField label="Event date" value={date} onChange={setDate} minimumDate={minDate} maximumDate={maxDate} placeholder="Choose a date" />

          <Card style={{ backgroundColor: C.cream }}>
            <Text style={styles.summaryTitle}>Your design</Text>
            <Text style={styles.summary}>
              {size} · {shape} · {layers} layer{layers > 1 ? 's' : ''} · {flavour} · {cream}
              {theme ? ` · “${theme}”` : ''}
            </Text>
          </Card>

          {error ? <Notice tone="error" text={error} /> : null}
          <Button title="Send Request for Approval" icon="paper-plane-outline" size="lg" onPress={submit} loading={busy} />
          <Button
            title="Discuss on WhatsApp"
            icon="logo-whatsapp"
            variant="outline"
            onPress={() => openWhatsApp(`Hi ${business.name}! I'd like to design a custom cake — can you help?`)}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function OptionGroup({ label, options, value, onChange }: { label: string; options: string[]; value: string; onChange: (v: string) => void }) {
  return (
    <View style={{ gap: 8 }}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.wrapRow}>
        {options.map((o) => (
          <Chip key={o} label={o} selected={value === o} onPress={() => onChange(o)} />
        ))}
      </View>
    </View>
  );
}

function UploadTile({ icon, label, onPress }: { icon: 'images-outline' | 'camera-outline'; label: string; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.upload, pressed && { backgroundColor: C.cream }]} accessibilityRole="button">
      <Ionicons name={icon} size={26} color={C.rose} />
      <Text style={styles.uploadText}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: C.page },
  wrap: { padding: 16, paddingBottom: 40, gap: 16, maxWidth: MAX_W, width: '100%', alignSelf: 'center' },
  intro: { flexDirection: 'row', gap: 14, backgroundColor: C.brown, borderRadius: R.xl, padding: 12, alignItems: 'center' },
  introImg: { width: 96, height: 112, borderRadius: R.lg },
  eyebrow: { fontFamily: F.bodyBold, fontSize: 10.5, letterSpacing: 2.4, color: C.cream, textTransform: 'uppercase' },
  introTitle: { fontFamily: F.heading, fontSize: 20, color: C.white },
  introBody: { fontFamily: F.body, fontSize: 13, color: C.creamLight, lineHeight: 18 },
  label: { color: C.brownDark, fontFamily: F.bodyBold, fontSize: 13.5 },
  hint: { color: C.muted, fontFamily: F.body, fontSize: 12.5 },
  wrapRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  layerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  uploadRow: { flexDirection: 'row', gap: 10 },
  upload: {
    flex: 1,
    height: 110,
    borderRadius: R.lg,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: C.borderStrong,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: C.surface,
  },
  uploadText: { fontFamily: F.bodyBold, color: C.brown, fontSize: 13.5 },
  photoWrap: { borderRadius: R.lg, overflow: 'hidden', height: 220, backgroundColor: C.cream },
  photo: { width: '100%', height: '100%' },
  photoOverlay: { ...StyleSheet.absoluteFill, backgroundColor: 'rgba(43,26,21,0.45)', alignItems: 'center', justifyContent: 'center', gap: 8 },
  photoOverlayText: { color: C.white, fontFamily: F.bodyBold },
  photoBadge: { position: 'absolute', left: 10, bottom: 10, flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: C.white, borderRadius: R.pill, paddingHorizontal: 10, paddingVertical: 4 },
  photoBadgeText: { fontFamily: F.bodyBold, color: C.green, fontSize: 12.5 },
  photoRemove: { position: 'absolute', right: 10, top: 10, width: 34, height: 34, borderRadius: 17, backgroundColor: 'rgba(43,26,21,0.7)', alignItems: 'center', justifyContent: 'center' },
  summaryTitle: { fontFamily: F.heading, fontSize: 17, color: C.brown },
  summary: { fontFamily: F.body, fontSize: 14, color: C.ink, lineHeight: 20 },
  done: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24, gap: 14, maxWidth: MAX_W, width: '100%', alignSelf: 'center' },
  doneIcon: { width: 110, height: 110, borderRadius: 55, backgroundColor: C.cream, alignItems: 'center', justifyContent: 'center' },
  doneTitle: { fontFamily: F.heading, fontSize: 30, color: C.brown },
  doneBody: { fontFamily: F.body, fontSize: 15, color: C.muted, textAlign: 'center', lineHeight: 22, marginBottom: 8 },
});
