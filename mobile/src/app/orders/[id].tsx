import Ionicons from '@expo/vector-icons/Ionicons';
import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useCallback, useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { Button, Card, Divider, ErrorState, LoadingState, Row, type IconName } from '@/components/ui';
import { useAuth } from '@/lib/auth';
import { business, callPhone, openWhatsApp } from '@/lib/business';
import { useCart } from '@/lib/cart';
import { fetchOrder, formatDate, formatTime, PROGRESS, type OrderDetail, type OrderStatus } from '@/lib/orders';
import { fetchProducts } from '@/lib/products';
import { supabase } from '@/lib/supabase';
import { C, F, MAX_W, R } from '@/lib/theme';

const REFRESH_MS = 20_000;

const STATUS_VIEW: Record<OrderStatus, { icon: IconName; title: string }> = {
  pending: { icon: 'time-outline', title: 'Order received' },
  confirmed: { icon: 'checkmark-done-outline', title: 'Order confirmed' },
  baking: { icon: 'flame-outline', title: 'Your order is baking' },
  ready: { icon: 'gift-outline', title: 'Packed & ready' },
  out_for_delivery: { icon: 'bicycle-outline', title: 'On the way to you' },
  delivered: { icon: 'happy-outline', title: 'Delivered — enjoy!' },
  cancelled: { icon: 'close-circle-outline', title: 'Order cancelled' },
};

type Update = { id: string; title: string; body: string | null; created_at: string };

function when(iso: string) {
  const d = new Date(iso);
  return `${d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}, ${d.toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit' })}`;
}

export default function TrackOrderScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { session } = useAuth();
  const cart = useCart();
  const [order, setOrder] = useState<OrderDetail | null | undefined>(undefined);
  const [updates, setUpdates] = useState<Update[]>([]);
  const [error, setError] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [reorderMsg, setReorderMsg] = useState('');

  const load = useCallback(async () => {
    try {
      const o = await fetchOrder(id);
      setOrder(o);
      setError('');
      // The bakery's messages about this order (same notifications the website sends).
      if (o && session) {
        const { data } = await supabase
          .from('notifications')
          .select('id, title, body, created_at')
          .eq('user_id', session.user.id)
          .or(`title.ilike.%${o.order_number}%,body.ilike.%${o.order_number}%`)
          .order('created_at', { ascending: true });
        setUpdates((data as Update[] | null) ?? []);
        await supabase
          .from('notifications')
          .update({ is_read: true })
          .eq('user_id', session.user.id)
          .eq('is_read', false)
          .or(`title.ilike.%${o.order_number}%,body.ilike.%${o.order_number}%`);
      }
    } catch {
      setError("Couldn't load this order. Check your connection and try again.");
    }
  }, [id, session]);

  // Live tracking: refresh while this screen is open.
  useFocusEffect(
    useCallback(() => {
      load();
      const t = setInterval(load, REFRESH_MS);
      // Instant: refresh the moment staff change this order.
      const channel = supabase
        .channel(`track-${id}`)
        .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'orders', filter: `id=eq.${id}` }, () => load())
        .subscribe();
      return () => {
        clearInterval(t);
        supabase.removeChannel(channel);
      };
    }, [load, id])
  );

  if (error && order === undefined) return <ErrorState message={error} onRetry={load} />;
  if (order === undefined) return <LoadingState text="Loading your order…" />;
  if (order === null) return <ErrorState message="We couldn't find this order." />;

  const cancelled = order.order_status === 'cancelled';
  const step = PROGRESS.findIndex((p) => p.status === order.order_status);
  const view = STATUS_VIEW[order.order_status] ?? STATUS_VIEW.pending;
  const hint = PROGRESS[step]?.hint;
  const deliverAt = order.event_date ? `${formatDate(order.event_date)}${order.event_time ? `, ${formatTime(order.event_time)}` : ''}` : null;

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
      {/* Live status */}
      <Animated.View entering={FadeInDown.duration(450)} style={[styles.status, cancelled && { backgroundColor: C.red }]}>
        <View style={styles.statusTop}>
          <View style={styles.statusIcon}>
            <Ionicons name={view.icon} size={28} color={cancelled ? C.red : C.espresso} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.statusNum}>Order #{order.order_number}</Text>
            <Text style={styles.statusTitle}>{view.title}</Text>
            {hint && !cancelled ? <Text style={styles.statusHint}>{hint}</Text> : null}
          </View>
        </View>
        {!cancelled ? (
          <>
            <View style={styles.bar} accessibilityLabel={`Step ${step + 1} of ${PROGRESS.length}`}>
              {PROGRESS.map((p, i) => (
                <View key={p.status} style={[styles.barSeg, i <= step && styles.barOn]} />
              ))}
            </View>
            <View style={styles.barLabels}>
              <Text style={styles.barLabel}>Placed</Text>
              <Text style={styles.barLabel}>Baking</Text>
              <Text style={styles.barLabel}>Delivered</Text>
            </View>
          </>
        ) : null}
        {deliverAt && !cancelled ? (
          <View style={styles.deliver}>
            <Ionicons name="calendar-outline" size={15} color={C.gold} />
            <Text style={styles.deliverText}>Delivery: {deliverAt}</Text>
          </View>
        ) : null}
      </Animated.View>

      {/* Advance payment reminder */}
      {order.payment_status === 'advance_pending' && !cancelled ? (
        <Card style={{ backgroundColor: C.amberBg, borderColor: 'rgba(154,107,0,0.25)' }}>
          <Text style={styles.payTitle}>Pay ₹{order.advance_amount} advance to confirm</Text>
          <Text style={styles.payBody}>
            GPay / PhonePe / Paytm to {business.phones[0]}, then tell us on WhatsApp.
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

      {/* Messages from the bakery */}
      <View style={{ gap: 10 }}>
        <Text style={styles.h}>Updates</Text>
        <View style={styles.chat}>
          <Bubble title="Order placed" body={`We've received your order for ₹${order.total}.`} at={order.created_at} />
          {updates
            .filter((u) => !/ placed$/i.test(u.title))
            .map((u, i) => (
              <Animated.View key={u.id} entering={FadeInUp.duration(350).delay(i * 40)}>
                <Bubble title={u.title} body={u.body} at={u.created_at} />
              </Animated.View>
            ))}
          {!cancelled && order.order_status !== 'delivered' ? (
            <Text style={styles.live}>
              <Ionicons name="radio-button-on" size={10} color={C.green} /> Live — new updates appear here automatically
            </Text>
          ) : null}
        </View>
        <View style={{ flexDirection: 'row', gap: 10 }}>
          <Button
            title="Message us"
            icon="logo-whatsapp"
            variant="whatsapp"
            onPress={() => openWhatsApp(`Hi ${business.name}! I have a question about order #${order.order_number}.`)}
            style={{ flex: 1 }}
          />
          <Button title="Call" icon="call-outline" variant="outline" onPress={() => callPhone(business.phones[0])} style={{ flex: 1 }} />
        </View>
      </View>

      {/* What you ordered */}
      <Card>
        {order.items.map((i, n) => (
          <View key={n} style={{ gap: 2 }}>
            <Row label={`${i.product_name} × ${i.quantity}`} value={`₹${i.line_total}`} />
            {[i.weight_label, i.flavour].some(Boolean) ? <Text style={styles.meta}>{[i.weight_label, i.flavour].filter(Boolean).join(' · ')}</Text> : null}
            {i.custom_message ? <Text style={styles.msg}>“{i.custom_message}”</Text> : null}
          </View>
        ))}
        <Divider />
        {Number(order.discount) > 0 ? <Row label="Discount" value={`− ₹${order.discount}`} /> : null}
        <Row label="Delivery" value={`₹${order.delivery_charge}`} />
        <Row label="Total" value={`₹${order.total}`} strong />
        <Text style={styles.meta}>{order.delivery_address}</Text>
      </Card>

      {reorderMsg ? <Text style={[styles.meta, { color: C.red }]}>{reorderMsg}</Text> : null}
      <Button title="Order again" icon="refresh" variant="outline" onPress={reorder} />
    </ScrollView>
  );
}

function Bubble({ title, body, at }: { title: string; body: string | null; at: string }) {
  return (
    <View style={styles.bubbleRow}>
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>CH</Text>
      </View>
      <View style={styles.bubble}>
        <Text style={styles.bubbleTitle}>{title}</Text>
        {body ? <Text style={styles.bubbleBody}>{body}</Text> : null}
        <Text style={styles.bubbleTime}>{when(at)}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { padding: 16, paddingBottom: 40, gap: 16, maxWidth: MAX_W, width: '100%', alignSelf: 'center' },
  status: { backgroundColor: C.espresso, borderRadius: R.xl, padding: 18, gap: 14 },
  statusTop: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  statusIcon: { width: 56, height: 56, borderRadius: 28, backgroundColor: C.gold, alignItems: 'center', justifyContent: 'center' },
  statusNum: { fontFamily: F.bodyBold, fontSize: 12, color: C.gold, letterSpacing: 1 },
  statusTitle: { fontFamily: F.heading, fontSize: 22, color: C.cream },
  statusHint: { fontFamily: F.body, fontSize: 13.5, color: 'rgba(238,225,186,0.8)' },
  bar: { flexDirection: 'row', gap: 5 },
  barSeg: { flex: 1, height: 6, borderRadius: 3, backgroundColor: 'rgba(240,215,167,0.2)' },
  barOn: { backgroundColor: C.gold },
  barLabels: { flexDirection: 'row', justifyContent: 'space-between', marginTop: -8 },
  barLabel: { fontFamily: F.body, fontSize: 11.5, color: 'rgba(238,225,186,0.6)' },
  deliver: { flexDirection: 'row', alignItems: 'center', gap: 8, borderTopWidth: 1, borderTopColor: 'rgba(176,141,87,0.25)', paddingTop: 12 },
  deliverText: { fontFamily: F.bodyBold, fontSize: 14, color: C.cream },
  payTitle: { fontFamily: F.heading, fontSize: 17, color: C.amber },
  payBody: { fontFamily: F.body, fontSize: 14, color: C.ink, lineHeight: 20 },
  h: { fontFamily: F.heading, fontSize: 21, color: C.brown },
  chat: { gap: 10 },
  bubbleRow: { flexDirection: 'row', gap: 10, alignItems: 'flex-end' },
  avatar: { width: 32, height: 32, borderRadius: 16, backgroundColor: C.espresso, alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: C.gold, fontFamily: F.bodyBlack, fontSize: 11 },
  bubble: { flex: 1, backgroundColor: C.white, borderRadius: R.lg, borderBottomLeftRadius: 4, padding: 12, gap: 3, borderWidth: 1, borderColor: C.border },
  bubbleTitle: { fontFamily: F.bodyBlack, fontSize: 14.5, color: C.ink },
  bubbleBody: { fontFamily: F.body, fontSize: 14, color: C.ink, lineHeight: 20 },
  bubbleTime: { fontFamily: F.body, fontSize: 11.5, color: C.muted, alignSelf: 'flex-end' },
  live: { fontFamily: F.body, fontSize: 12.5, color: C.green, textAlign: 'center' },
  meta: { fontFamily: F.body, fontSize: 13, color: C.muted, lineHeight: 19 },
  msg: { fontFamily: F.headingItalic, fontSize: 13, color: C.brown },
});
