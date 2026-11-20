import { Image } from 'expo-image';
import { Stack, router, useLocalSearchParams } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Button, Card, Centered, Chip, Field, Row, SectionTitle } from '@/components/ui';
import { useAuth } from '@/lib/auth';
import { business, openWhatsApp } from '@/lib/business';
import { ADVANCE_AMOUNT, deliveryChargeFor } from '@/lib/delivery';
import { imageSource } from '@/lib/images';
import { fetchProduct, type Product } from '@/lib/products';
import { supabase } from '@/lib/supabase';
import { C } from '@/lib/theme';

const MIN_LEAD_HOURS = 3;
const SLOTS = ['10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00'];

function ymd(d: Date) {
  const p = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}
function slotLabel(t: string) {
  const [h] = t.split(':').map(Number);
  return `${h % 12 || 12} ${h < 12 ? 'AM' : 'PM'}`;
}

export default function ProductScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { profile, session } = useAuth();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  const [weight, setWeight] = useState<string | null>(null);
  const [flavour, setFlavour] = useState<string | null>(null);
  const [qty, setQty] = useState(1);
  const [message, setMessage] = useState('');
  // null = not typed yet, so the signed-in customer's details show as defaults.
  const [nameInput, setName] = useState<string | null>(null);
  const [phoneInput, setPhone] = useState<string | null>(null);
  const name = nameInput ?? profile?.full_name ?? '';
  const phone = phoneInput ?? profile?.phone ?? '';
  const [now] = useState(() => Date.now());
  const [address, setAddress] = useState('');
  const [instructions, setInstructions] = useState('');
  const [date, setDate] = useState<string | null>(null);
  const [time, setTime] = useState<string | null>(null);
  const [coupon, setCoupon] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchProduct(id)
      .then((p) => {
        setProduct(p);
        if (p?.weights.length) setWeight(p.weights[0].label);
        if (p?.flavours.length) setFlavour(p.flavours[0]);
      })
      .finally(() => setLoading(false));
  }, [id]);

  const days = useMemo(() => {
    const out: { value: string; label: string; sub: string }[] = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(now);
      d.setDate(d.getDate() + i);
      out.push({
        value: ymd(d),
        label: i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : d.toLocaleDateString('en-IN', { weekday: 'short' }),
        sub: d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }),
      });
    }
    return out;
  }, [now]);

  const slotOk = (d: string, t: string) => {
    const at = new Date(`${d}T${t}:00`);
    return at.getTime() - now >= MIN_LEAD_HOURS * 3600 * 1000;
  };

  if (loading) {
    return (
      <Centered>
        <Text style={styles.muted}>Loading…</Text>
      </Centered>
    );
  }
  if (!product) {
    return (
      <Centered>
        <Text style={styles.muted}>This item is no longer available.</Text>
        <Button title="Back to menu" onPress={() => router.back()} />
      </Centered>
    );
  }

  const unit = product.weights.length ? product.weights.find((w) => w.label === weight)?.price ?? 0 : product.price;
  const subtotal = unit * qty;
  const delivery = address.trim() ? deliveryChargeFor(address) : 0;
  const total = subtotal + delivery;
  const advance = Math.min(ADVANCE_AMOUNT, total);
  const needsSchedule = product.isCake;
  const src = imageSource(product.image);

  async function placeOrder() {
    if (!product) return;
    setError('');
    if (!name.trim() || !phone.trim() || !address.trim()) {
      setError('Please fill in your name, phone number and delivery address.');
      return;
    }
    if (!/^\d{10}$/.test(phone.replace(/\D/g, '').slice(-10))) {
      setError('Please enter a valid 10-digit phone number.');
      return;
    }
    if (needsSchedule && (!date || !time)) {
      setError('Please choose a delivery date and time.');
      return;
    }
    setSubmitting(true);
    const { data, error: rpcError } = await supabase.rpc('place_quick_order', {
      p_product_id: product.id,
      p_weight_label: weight ?? '',
      p_flavour: flavour ?? '',
      p_custom_message: message,
      p_qty: qty,
      p_customer_name: name,
      p_phone: phone,
      p_address: address,
      p_instructions: instructions,
      p_event_date: date,
      p_event_time: time,
      p_payment_method: 'qr_manual',
      p_coupon_code: coupon,
      p_delivery_charge: delivery,
      p_distance_km: null,
      p_lat: null,
      p_lng: null,
    });
    setSubmitting(false);
    const row = Array.isArray(data) ? data[0] : data;
    if (rpcError || !row) {
      const msg = rpcError?.message ?? '';
      setError(/^(Please|Quantity|This item)/.test(msg) ? msg : 'Could not place your order. Please try again.');
      return;
    }
    router.replace({ pathname: '/order-placed/[id]', params: { id: row.order_id } });
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <Stack.Screen options={{ title: product.name }} />
      <ScrollView contentContainerStyle={styles.wrap} keyboardShouldPersistTaps="handled" contentInsetAdjustmentBehavior="automatic">
        {src ? (
          <Image source={src} style={styles.hero} contentFit="cover" alt={product.name} />
        ) : (
          <View style={[styles.hero, styles.noImg]}>
            <Text style={{ fontSize: 60 }}>🎂</Text>
          </View>
        )}

        <View style={{ gap: 4 }}>
          <Text style={styles.title}>{product.name}</Text>
          <Text style={styles.price}>₹{unit}</Text>
          {product.sku ? <Text style={styles.muted}>SKU {product.sku}</Text> : null}
          {product.description ? <Text style={styles.desc}>{product.description}</Text> : null}
          {product.note ? <Text style={styles.note}>{product.note}</Text> : null}
        </View>

        {product.weights.length > 0 && (
          <>
            <SectionTitle>Size</SectionTitle>
            <View style={styles.wrapRow}>
              {product.weights.map((w) => (
                <Chip key={w.label} label={w.label} sub={`₹${w.price}`} selected={weight === w.label} onPress={() => setWeight(w.label)} />
              ))}
            </View>
          </>
        )}

        {product.flavours.length > 1 && (
          <>
            <SectionTitle>Flavour</SectionTitle>
            <View style={styles.wrapRow}>
              {product.flavours.map((f) => (
                <Chip key={f} label={f} selected={flavour === f} onPress={() => setFlavour(f)} />
              ))}
            </View>
          </>
        )}

        <View style={styles.qtyRow}>
          <SectionTitle>Quantity</SectionTitle>
          <View style={styles.qtyBox}>
            <Chip label="−" onPress={() => setQty((q) => Math.max(1, q - 1))} />
            <Text style={styles.qty}>{qty}</Text>
            <Chip label="+" onPress={() => setQty((q) => Math.min(50, q + 1))} />
          </View>
        </View>

        {product.isCake && <Field label="Message on cake (optional)" value={message} onChangeText={setMessage} placeholder='e.g. "Happy Birthday Aarav"' />}

        <SectionTitle>Delivery details</SectionTitle>
        <Field label="Your name" value={name} onChangeText={setName} autoComplete="name" textContentType="name" />
        <Field label="Phone number" value={phone} onChangeText={setPhone} keyboardType="phone-pad" autoComplete="tel" textContentType="telephoneNumber" />
        <Field label="Delivery address" value={address} onChangeText={setAddress} multiline placeholder="House, street, village / area" autoComplete="street-address" />

        {needsSchedule && (
          <>
            <SectionTitle>Delivery date</SectionTitle>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
              {days.map((d) => (
                <Chip
                  key={d.value}
                  label={d.label}
                  sub={d.sub}
                  selected={date === d.value}
                  onPress={() => {
                    setDate(d.value);
                    if (time && !slotOk(d.value, time)) setTime(null);
                  }}
                />
              ))}
            </ScrollView>
            {date && (
              <>
                <SectionTitle>Delivery time</SectionTitle>
                <View style={styles.wrapRow}>
                  {SLOTS.filter((t) => slotOk(date, t)).map((t) => (
                    <Chip key={t} label={slotLabel(t)} selected={time === t} onPress={() => setTime(t)} />
                  ))}
                </View>
                {SLOTS.every((t) => !slotOk(date, t)) && (
                  <Text style={styles.note}>No slots left today — please order at least {MIN_LEAD_HOURS} hours ahead.</Text>
                )}
              </>
            )}
          </>
        )}

        <Field label="Special instructions (optional)" value={instructions} onChangeText={setInstructions} />
        <Field label="Coupon code (optional)" value={coupon} onChangeText={setCoupon} autoCapitalize="characters" />

        <Card>
          <Row label={`${product.name}${weight ? ` (${weight})` : ''} × ${qty}`} value={`₹${subtotal}`} />
          <Row label="Delivery" value={address.trim() ? `₹${delivery}` : 'Enter address'} />
          <Row label="Total" value={`₹${total}`} strong />
          <Row label="Advance to pay now" value={`₹${advance}`} />
          <Text style={styles.muted}>Pay the rest on delivery. Coupon discount (if any) is applied when you place the order.</Text>
        </Card>

        {!session && <Text style={styles.muted}>Ordering as a guest. Log in from the Account tab to track your orders in the app.</Text>}
        {error ? <Text style={styles.error}>{error}</Text> : null}

        <Button title={`Place order · Pay ₹${advance} advance`} onPress={placeOrder} loading={submitting} />
        <Button
          title="Order on WhatsApp instead"
          variant="outline"
          onPress={() =>
            openWhatsApp(
              `Hi ${business.name}! I'd like to order ${product.name}${weight ? ` (${weight})` : ''}${flavour ? `, ${flavour}` : ''} × ${qty}.`
            )
          }
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  wrap: { padding: 16, gap: 14, paddingBottom: 40, maxWidth: 700, width: '100%', alignSelf: 'center' },
  hero: { width: '100%', aspectRatio: 1, borderRadius: 22, borderCurve: 'continuous' },
  noImg: { alignItems: 'center', justifyContent: 'center', backgroundColor: C.cream },
  title: { fontSize: 26, fontWeight: '800', color: C.ink },
  price: { fontSize: 22, fontWeight: '800', color: C.rose },
  desc: { fontSize: 15, color: C.ink, lineHeight: 22, marginTop: 4 },
  note: { fontSize: 14, color: C.amber, fontWeight: '600' },
  muted: { color: C.muted, fontSize: 14 },
  wrapRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  qtyRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  qtyBox: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  qty: { fontSize: 18, fontWeight: '800', color: C.ink, minWidth: 24, textAlign: 'center', fontVariant: ['tabular-nums'] },
  error: { color: C.red, backgroundColor: C.redBg, padding: 12, borderRadius: 12, fontWeight: '600' },
});
