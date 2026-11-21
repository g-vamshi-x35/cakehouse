import Ionicons from '@expo/vector-icons/Ionicons';
import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useCallback, useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Button, Card, Divider, ErrorState, LoadingState, Notice, PaymentBadge, Row, SectionTitle, StatusBadge } from '@/components/ui';
import { business, callPhone, openWhatsApp } from '@/lib/business';
import { useCart } from '@/lib/cart';
import { fetchOrder, formatDate, formatTime, PROGRESS, type OrderDetail } from '@/lib/orders';
import { fetchProducts } from '@/lib/products';
import { C, F, MAX_W } from '@/lib/theme';

export default function OrderDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const cart = useCart();
  const [order, setOrder] = useState<OrderDetail | null | undefined>(undefined);
  const [error, setError] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [reorderMsg, setReorderMsg] = useState('');

  const load = useCallback(async () => {
    try {
      setOrder(await fetchOrder(id));
      setError('');
    } catch {
      setError("Couldn't load this order. Check your connection and try again.");
    }
  }, [id]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  if (error && order === undefined) return <ErrorState message={error} onRetry={load} />;
  if (order === undefined) return <LoadingState />;
  if (order === null) return <ErrorState message="We couldn't find this order." />;

  const cancelled = order.order_status === 'cancelled';
  const step = PROGRESS.findIndex((p) => p.status === order.order_status);

  async function reorder() {
    if (!order) return;
    const menu = await fetchProducts().catch(() => []);
    let added = 0;
    for (const it of order.items) {
      const p = menu.find((m) => m.id === it.product_id);
      if (!p || p.isCustomCake) continue;
      const w = p.weights.find((x) => x.label === it.weight_label);
      if (p.weights.length && !w) continue;
      cart.add({
        productId: p.id,
        name: p.name,
        image: p.image,
        categorySlug: p.categorySlug,
        isCake: p.isCake,
        weightLabel: w?.label ?? null,
        flavour: it.flavour,
        message: it.custom_message ?? '',
        qty: it.quantity,
        unitPrice: w?.price ?? p.price,
      });
      added++;
    }
    if (added) router.push('/cart');
    else setReorderMsg('These items are no longer available to order online.');
  }

  return (
    <ScrollView
      contentContainerStyle={styles.wrap}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          tintColor={C.rose}
          colors={[C.rose]}
          onRefresh={async () => {
            setRefreshing(true);
            await load();
            setRefreshing(false);
          }}
        />
      }>
      <Animated.View entering={FadeInDown.duration(400)} style={styles.head}>
        <View style={{ flex: 1, gap: 4 }}>
          <Text style={styles.num}>Order #{order.order_number}</Text>
          <Text style={styles.muted}>Placed on {formatDate(order.created_at)}</Text>
        </View>
        <StatusBadge status={order.order_status} />
      </Animated.View>

      {order.payment_status === 'advance_pending' && !cancelled ? (
        <Card style={{ backgroundColor: C.amberBg, borderColor: 'rgba(154,107,0,0.25)' }}>
          <Text style={styles.payTitle}>Advance payment pending</Text>
          <Text style={styles.payBody}>
            Pay ₹{order.advance_amount} with GPay / PhonePe / Paytm UPI to {business.phones[0]}, then send your order number on WhatsApp.
          </Text>
          <Button
            title="I've paid · Tell us on WhatsApp"
            icon="logo-whatsapp"
            variant="whatsapp"
            size="sm"
            onPress={() => openWhatsApp(`Hi ${business.name}! I paid the ₹${order.advance_amount} advance for order #${order.order_number}.`)}
          />
        </Card>
      ) : null}

      <Card>
        <SectionTitle>Order status</SectionTitle>
        {cancelled ? (
          <Notice tone="error" text="This order was cancelled. Contact us if you have any questions." />
        ) : (
          <View style={{ marginTop: 4 }}>
            {PROGRESS.map((p, i) => {
              const done = i <= step;
              const current = i === step;
              return (
                <View key={p.status} style={styles.step}>
                  <View style={{ alignItems: 'center' }}>
                    <View style={[styles.dot, done && styles.dotDone, current && styles.dotCurrent]}>
                      {done ? <Ionicons name="checkmark" size={13} color={C.white} /> : null}
                    </View>
                    {i < PROGRESS.length - 1 ? <View style={[styles.line, i < step && { backgroundColor: C.rose }]} /> : null}
                  </View>
                  <View style={{ flex: 1, paddingBottom: 14 }}>
                    <Text style={[styles.stepLabel, !done && { color: C.faint }]}>{p.label}</Text>
                    {current ? <Text style={styles.stepHint}>{p.hint}</Text> : null}
                  </View>
                </View>
              );
            })}
          </View>
        )}
      </Card>

      <Card>
        <SectionTitle>Items</SectionTitle>
        {order.items.map((i, n) => (
          <View key={n} style={{ gap: 2 }}>
            <Row label={`${i.product_name} × ${i.quantity}`} value={`₹${i.line_total}`} />
            {[i.weight_label, i.flavour].some(Boolean) ? <Text style={styles.meta}>{[i.weight_label, i.flavour].filter(Boolean).join(' · ')}</Text> : null}
            {i.custom_message ? <Text style={styles.msg}>“{i.custom_message}”</Text> : null}
          </View>
        ))}
        <Divider />
        <Row label="Subtotal" value={`₹${order.subtotal}`} />
        {Number(order.discount) > 0 ? <Row label="Discount" value={`− ₹${order.discount}`} /> : null}
        <Row label="Delivery" value={`₹${order.delivery_charge}`} />
        <Row label="Total" value={`₹${order.total}`} strong />
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <Text style={styles.muted}>Payment</Text>
          <PaymentBadge status={order.payment_status} />
        </View>
      </Card>

      <Card>
        <SectionTitle>Delivery</SectionTitle>
        <Row label="Name" value={order.customer_name} />
        <Row label="Phone" value={order.customer_phone} />
        {order.event_date ? <Row label="When" value={`${formatDate(order.event_date)}${order.event_time ? `, ${formatTime(order.event_time)}` : ''}`} /> : null}
        <Text style={styles.addr}>{order.delivery_address}</Text>
        {order.delivery_instructions ? <Text style={styles.meta}>Note: {order.delivery_instructions}</Text> : null}
      </Card>

      {reorderMsg ? <Notice tone="error" text={reorderMsg} /> : null}
      <Button title="Order again" icon="refresh" onPress={reorder} />
      <View style={{ flexDirection: 'row', gap: 10 }}>
        <Button title="Call shop" icon="call-outline" variant="outline" onPress={() => callPhone(business.phones[0])} style={{ flex: 1 }} />
        <Button
          title="WhatsApp"
          icon="logo-whatsapp"
          variant="outline"
          onPress={() => openWhatsApp(`Hi ${business.name}! I have a question about order #${order.order_number}.`)}
          style={{ flex: 1 }}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  wrap: { padding: 16, paddingBottom: 40, gap: 14, maxWidth: MAX_W, width: '100%', alignSelf: 'center' },
  head: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  num: { fontFamily: F.heading, fontSize: 24, color: C.brown },
  muted: { fontFamily: F.body, fontSize: 14, color: C.muted },
  payTitle: { fontFamily: F.heading, fontSize: 17, color: C.amber },
  payBody: { fontFamily: F.body, fontSize: 14, color: C.ink, lineHeight: 20 },
  step: { flexDirection: 'row', gap: 12 },
  dot: { width: 24, height: 24, borderRadius: 12, borderWidth: 2, borderColor: C.borderStrong, backgroundColor: C.white, alignItems: 'center', justifyContent: 'center' },
  dotDone: { backgroundColor: C.rose, borderColor: C.rose },
  dotCurrent: { boxShadow: '0 0 0 5px rgba(195,121,96,0.2)' },
  line: { width: 2, flex: 1, minHeight: 18, backgroundColor: C.border, marginVertical: 2 },
  stepLabel: { fontFamily: F.bodyBold, fontSize: 15, color: C.ink, marginTop: 2 },
  stepHint: { fontFamily: F.body, fontSize: 13, color: C.rose, marginTop: 1 },
  meta: { fontFamily: F.body, fontSize: 13, color: C.muted },
  msg: { fontFamily: F.headingItalic, fontSize: 13, color: C.brown },
  addr: { fontFamily: F.body, fontSize: 14.5, color: C.ink, lineHeight: 20 },
});
