import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button, Card, Chip, Divider, EmptyState, Field, Notice, Row, SectionTitle } from '@/components/ui';
import { addressText, fetchAddresses, saveAddress, type Address } from '@/lib/addresses';
import { useAuth } from '@/lib/auth';
import { useCart } from '@/lib/cart';
import { ADVANCE_AMOUNT, deliveryChargeFor } from '@/lib/delivery';
import { couponDiscount, fetchCoupons, type Coupon } from '@/lib/products';
import { supabase } from '@/lib/supabase';
import { C, F, MAX_W, R, SHADOW } from '@/lib/theme';
import { normalizePhone, validateName, validatePhone, ymd } from '@/lib/validation';

// Same ordering rules as the website (src/lib/orders/constants.ts).
const MIN_LEAD_HOURS = 3;
const SLOTS = ['10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00'];

function slotLabel(t: string) {
  const [h] = t.split(':').map(Number);
  return `${h % 12 || 12} ${h < 12 ? 'AM' : 'PM'}`;
}

export default function CheckoutScreen() {
  const insets = useSafeAreaInsets();
  const { session, profile } = useAuth();
  const cart = useCart();

  const [name, setName] = useState(profile?.full_name ?? '');
  const [phone, setPhone] = useState(profile?.phone ?? '');
  const [saved, setSaved] = useState<Address[]>([]);
  const [addressId, setAddressId] = useState<string | 'new'>('new');
  const [address, setAddress] = useState('');
  const [saveNew, setSaveNew] = useState(true);
  const [instructions, setInstructions] = useState('');
  const [now] = useState(() => Date.now());
  const [date, setDate] = useState<string | null>(null);
  const [time, setTime] = useState<string | null>(null);
  const [couponInput, setCouponInput] = useState('');
  const [coupon, setCoupon] = useState<Coupon | null>(null);
  const [showCoupon, setShowCoupon] = useState(false);
  const [couponMsg, setCouponMsg] = useState<{ text: string; ok: boolean } | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!session) return;
    fetchAddresses(session.user.id)
      .then((list) => {
        setSaved(list);
        if (list.length) setAddressId(list[0].id);
      })
      .catch(() => {});
  }, [session]);

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
  const slotOk = (d: string, t: string) => new Date(`${d}T${t}:00`).getTime() - now >= MIN_LEAD_HOURS * 3600 * 1000;

  if (!cart.items.length) {
    return <EmptyState icon="bag-handle-outline" title="Your cart is empty" action="Browse the menu" onAction={() => router.navigate('/menu')} />;
  }

  const chosen = addressId === 'new' ? null : saved.find((a) => a.id === addressId);
  const deliveryAddress = chosen ? addressText(chosen) : address.trim();
  const delivery = deliveryAddress ? deliveryChargeFor(deliveryAddress) : 0;
  const discount = coupon ? couponDiscount(coupon, cart.subtotal) : 0;
  const total = Math.max(cart.subtotal - discount, 0) + delivery;
  const advance = Math.min(ADVANCE_AMOUNT, total);

  async function applyCoupon() {
    const code = couponInput.trim().toUpperCase();
    setCouponMsg(null);
    setCoupon(null);
    if (!code) return;
    const list = await fetchCoupons().catch(() => [] as Coupon[]);
    const c = list.find((x) => x.code.toUpperCase() === code);
    if (!c) return setCouponMsg({ text: 'This coupon code isn’t valid.', ok: false });
    if (cart.subtotal < Number(c.min_order_amount))
      return setCouponMsg({ text: `Add ₹${Number(c.min_order_amount) - cart.subtotal} more to use this coupon.`, ok: false });
    setCoupon(c);
    setCouponMsg({ text: `Coupon applied — you save ₹${couponDiscount(c, cart.subtotal)}.`, ok: true });
  }

  async function placeOrder() {
    setError('');
    const nameErr = validateName(name);
    const phoneErr = validatePhone(phone);
    if (nameErr || phoneErr) return setError(nameErr || phoneErr);
    if (!deliveryAddress || deliveryAddress.length < 8) return setError('Please enter your full delivery address.');
    if (cart.hasCakes && (!date || !time)) return setError('Please choose a delivery date and time for your cake.');
    if (date && time && !slotOk(date, time)) return setError(`Please choose a time at least ${MIN_LEAD_HOURS} hours from now.`);

    setBusy(true);
    const { data, error: rpcError } = await supabase.rpc('place_cart_order', {
      p_items: cart.items.map((i) => ({
        product_id: i.productId,
        weight_label: i.weightLabel ?? '',
        flavour: i.flavour ?? '',
        custom_message: i.message,
        qty: i.qty,
      })),
      p_customer_name: name.trim(),
      p_phone: normalizePhone(phone),
      p_address: deliveryAddress,
      p_instructions: instructions,
      p_event_date: date,
      p_event_time: time,
      p_payment_method: 'qr_manual',
      p_coupon_code: coupon?.code ?? '',
      p_delivery_charge: delivery,
    });
    const row = Array.isArray(data) ? data[0] : data;
    if (rpcError || !row) {
      setBusy(false);
      const msg = rpcError?.message ?? '';
      setError(/^(Please|Quantity|This item|Your cart)/.test(msg) ? msg : 'Could not place your order. Please check your connection and try again.');
      return;
    }
    if (session && addressId === 'new' && saveNew) {
      await saveAddress(session.user.id, { label: 'Home', full_address: address, city: '', pincode: '', is_default: saved.length === 0 }).catch(() => {});
    }
    cart.clear();
    setBusy(false);
    // Leave cart/checkout off the back stack: Home → Order placed.
    if (router.canDismiss()) router.dismissAll();
    router.push({ pathname: '/order-placed/[id]', params: { id: row.order_id } });
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={[styles.wrap, { paddingBottom: 150 + insets.bottom }]} keyboardShouldPersistTaps="handled">
        {!session ? (
          <Pressable onPress={() => router.push('/login')} style={styles.loginHint} accessibilityRole="button">
            <Ionicons name="person-circle-outline" size={22} color={C.brown} />
            <Text style={styles.loginText}>Log in to track this order and use saved addresses</Text>
            <Ionicons name="chevron-forward" size={18} color={C.brown} />
          </Pressable>
        ) : null}

        <SectionTitle>Your details</SectionTitle>
        <Field label="Your name" icon="person-outline" value={name} onChangeText={setName} autoComplete="name" textContentType="name" />
        <Field
          label="Phone number"
          icon="call-outline"
          value={phone}
          onChangeText={setPhone}
          keyboardType="phone-pad"
          autoComplete="tel"
          textContentType="telephoneNumber"
          maxLength={14}
        />

        <SectionTitle>Delivery address</SectionTitle>
        {saved.length > 0 && (
          <View style={{ gap: 8 }}>
            {saved.map((a) => (
              <Pressable
                key={a.id}
                onPress={() => setAddressId(a.id)}
                accessibilityRole="radio"
                accessibilityState={{ checked: addressId === a.id }}
                style={[styles.addr, addressId === a.id && styles.addrOn]}>
                <Ionicons name={addressId === a.id ? 'radio-button-on' : 'radio-button-off'} size={20} color={C.rose} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.addrLabel}>{a.label || 'Address'}</Text>
                  <Text style={styles.addrText}>{addressText(a)}</Text>
                </View>
              </Pressable>
            ))}
            <Pressable
              onPress={() => setAddressId('new')}
              accessibilityRole="radio"
              accessibilityState={{ checked: addressId === 'new' }}
              style={[styles.addr, addressId === 'new' && styles.addrOn]}>
              <Ionicons name={addressId === 'new' ? 'radio-button-on' : 'radio-button-off'} size={20} color={C.rose} />
              <Text style={styles.addrLabel}>Deliver somewhere else</Text>
            </Pressable>
          </View>
        )}
        {addressId === 'new' && (
          <>
            <Field
              label="Full address"
              icon="location-outline"
              value={address}
              onChangeText={setAddress}
              multiline
              placeholder="House no., street, village / area, landmark"
              autoComplete="street-address"
            />
            {session ? (
              <Pressable onPress={() => setSaveNew((s) => !s)} style={styles.check} accessibilityRole="checkbox" accessibilityState={{ checked: saveNew }}>
                <Ionicons name={saveNew ? 'checkbox' : 'square-outline'} size={20} color={C.rose} />
                <Text style={styles.checkText}>Save this address for next time</Text>
              </Pressable>
            ) : null}
          </>
        )}

        <SectionTitle>{cart.hasCakes ? 'When should we deliver?' : 'Delivery time (optional)'}</SectionTitle>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingHorizontal: 16 }} style={{ marginHorizontal: -16 }}>
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
        {date ? (
          SLOTS.some((t) => slotOk(date, t)) ? (
            <View style={styles.wrapRow}>
              {SLOTS.filter((t) => slotOk(date, t)).map((t) => (
                <Chip key={t} label={slotLabel(t)} selected={time === t} onPress={() => setTime(t)} />
              ))}
            </View>
          ) : (
            <Notice text={`No slots left today — please order at least ${MIN_LEAD_HOURS} hours ahead.`} />
          )
        ) : null}
        <Field
          label="Special instructions (optional)"
          icon="chatbubble-ellipses-outline"
          value={instructions}
          onChangeText={setInstructions}
          placeholder="e.g. Call before delivery, less sugar…"
          multiline
        />

        {!showCoupon ? (
          <Pressable onPress={() => setShowCoupon(true)} hitSlop={8} accessibilityRole="button" style={styles.couponLink}>
            <Ionicons name="pricetag-outline" size={16} color={C.rose} />
            <Text style={styles.couponLinkText}>Have a coupon code?</Text>
          </Pressable>
        ) : (
        <View style={{ flexDirection: 'row', gap: 10, alignItems: 'flex-end' }}>
          <View style={{ flex: 1 }}>
            <Field label="Coupon code" icon="pricetag-outline" value={couponInput} onChangeText={setCouponInput} autoCapitalize="characters" placeholder="Enter code" />
          </View>
          <Button title="Apply" variant="dark" onPress={applyCoupon} style={{ marginBottom: 2 }} />
        </View>
        )}
        {couponMsg ? <Notice tone={couponMsg.ok ? 'success' : 'error'} text={couponMsg.text} /> : null}

        <SectionTitle>Order summary</SectionTitle>
        <Card>
          {cart.items.map((i) => (
            <Row key={i.key} label={`${i.name}${i.weightLabel ? ` (${i.weightLabel})` : ''} × ${i.qty}`} value={`₹${i.unitPrice * i.qty}`} />
          ))}
          <Divider />
          <Row label="Subtotal" value={`₹${cart.subtotal}`} />
          {discount ? <Row label={`Coupon ${coupon?.code}`} value={`− ₹${discount}`} /> : null}
          <Row label="Delivery" value={deliveryAddress ? `₹${delivery}` : 'Enter address'} />
          <Divider />
          <Row label="Total" value={`₹${total}`} strong />
          <Row label="Advance to pay now (UPI)" value={`₹${advance}`} />
          <Row label="Pay on delivery" value={`₹${total - advance}`} />
        </Card>
        <View style={styles.pay}>
          <Ionicons name="shield-checkmark-outline" size={20} color={C.green} />
          <Text style={styles.payText}>Pay just ₹{advance} now by UPI. The rest on delivery.</Text>
        </View>
        {error ? <Notice tone="error" text={error} /> : null}
      </ScrollView>

      <View style={[styles.bottom, { paddingBottom: insets.bottom + 12 }]}>
        <View style={styles.bottomRow}>
          <View>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.total}>₹{total}</Text>
          </View>
          <Button title={`Place order · ₹${advance} advance`} onPress={placeOrder} loading={busy} style={{ flex: 1 }} size="lg" />
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  wrap: { padding: 16, gap: 14, maxWidth: MAX_W, width: '100%', alignSelf: 'center' },
  loginHint: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: C.cream, padding: 14, borderRadius: R.md },
  loginText: { flex: 1, fontFamily: F.bodyBold, color: C.brown, fontSize: 14 },
  addr: { flexDirection: 'row', gap: 12, alignItems: 'center', padding: 14, borderRadius: R.md, borderWidth: 1.5, borderColor: C.border, backgroundColor: C.surface },
  addrOn: { borderColor: C.rose, backgroundColor: C.white },
  addrLabel: { fontFamily: F.bodyBold, fontSize: 14.5, color: C.ink },
  addrText: { fontFamily: F.body, fontSize: 13.5, color: C.muted, lineHeight: 19 },
  check: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  checkText: { fontFamily: F.body, fontSize: 14, color: C.ink },
  wrapRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  couponLink: { flexDirection: 'row', alignItems: 'center', gap: 6, alignSelf: 'flex-start' },
  couponLinkText: { fontFamily: F.bodyBold, color: C.rose, fontSize: 14.5 },
  pay: { flexDirection: 'row', gap: 10, padding: 14, backgroundColor: C.greenBg, borderRadius: R.md },
  payText: { flex: 1, fontFamily: F.body, fontSize: 13.5, color: C.ink, lineHeight: 19 },
  bottom: { position: 'absolute', left: 0, right: 0, bottom: 0, backgroundColor: C.surface, padding: 16, borderTopLeftRadius: R.xl, borderTopRightRadius: R.xl, boxShadow: SHADOW.bar },
  bottomRow: { flexDirection: 'row', alignItems: 'center', gap: 14, maxWidth: MAX_W, width: '100%', alignSelf: 'center' },
  totalLabel: { fontFamily: F.body, fontSize: 12, color: C.muted },
  total: { fontFamily: F.bodyBlack, fontSize: 21, color: C.brown, fontVariant: ['tabular-nums'] },
});
