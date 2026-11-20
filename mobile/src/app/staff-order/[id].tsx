import { Stack, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Button, Card, Centered, Chip, Row, SectionTitle, StatusBadge } from '@/components/ui';
import { useAuth } from '@/lib/auth';
import { callPhone, openWhatsApp } from '@/lib/business';
import { formatDate, ORDER_STATUS_LABEL, PAYMENT_STATUS_LABEL, STATUS_STEPS, type OrderStatus, type PaymentStatus } from '@/lib/orders';
import { supabase } from '@/lib/supabase';
import { C } from '@/lib/theme';

type Order = {
  id: string;
  order_number: string;
  customer_id: string | null;
  customer_name: string;
  customer_phone: string;
  delivery_address: string;
  delivery_instructions: string | null;
  event_date: string | null;
  event_time: string | null;
  subtotal: number;
  discount: number;
  delivery_charge: number;
  total: number;
  advance_amount: number;
  order_status: OrderStatus;
  payment_status: PaymentStatus;
  cash_collected: boolean;
};
type Item = { product_name: string; weight_label: string | null; flavour: string | null; custom_message: string | null; quantity: number; line_total: number };

export default function StaffOrderScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { profile } = useAuth();
  const [order, setOrder] = useState<Order | null>(null);
  const [items, setItems] = useState<Item[]>([]);
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);
  const role = profile?.role === 'owner' || profile?.role === 'employee' || profile?.role === 'delivery' ? profile.role : null;

  const [version, setVersion] = useState(0);
  const load = useCallback(() => setVersion((v) => v + 1), []);

  useEffect(() => {
    let alive = true;
    Promise.all([
      supabase.from('orders').select('*').eq('id', id).maybeSingle(),
      supabase.from('order_items').select('product_name, weight_label, flavour, custom_message, quantity, line_total').eq('order_id', id),
    ]).then(([{ data: o }, { data: it }]) => {
      if (!alive) return;
      setOrder((o as Order | null) ?? null);
      setItems((it as Item[] | null) ?? []);
      setLoading(false);
    });
    return () => {
      alive = false;
    };
  }, [id, version]);

  async function update(patch: Partial<Order>, notice?: { title: string; body: string }) {
    if (!order) return;
    setBusy(true);
    const { error } = await supabase.from('orders').update({ ...patch, updated_at: new Date().toISOString() }).eq('id', order.id);
    if (!error && notice && order.customer_id) {
      await supabase.from('notifications').insert({ user_id: order.customer_id, title: notice.title, body: notice.body, type: 'order' });
    }
    setBusy(false);
    if (error) Alert.alert("Couldn't update", error.message);
    else load();
  }

  if (loading) return <Centered><Text style={styles.muted}>Loading…</Text></Centered>;
  if (!order || !role) return <Centered><Text style={styles.muted}>Order not found.</Text></Centered>;

  const canConfirmAdvance = role !== 'delivery' && (order.payment_status === 'advance_pending' || order.payment_status === 'unpaid');

  return (
    <ScrollView contentContainerStyle={styles.wrap}>
      <Stack.Screen options={{ title: `#${order.order_number}` }} />
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <Text style={styles.title}>#{order.order_number}</Text>
        <StatusBadge status={order.order_status} />
      </View>

      <Card>
        <Row label="Customer" value={order.customer_name} />
        <Row label="Phone" value={order.customer_phone} />
        <Row label="Address" value={order.delivery_address} />
        {order.delivery_instructions ? <Row label="Instructions" value={order.delivery_instructions} /> : null}
        {order.event_date ? (
          <Row label="Deliver on" value={`${formatDate(order.event_date)}${order.event_time ? `, ${order.event_time.slice(0, 5)}` : ''}`} />
        ) : null}
        <View style={{ flexDirection: 'row', gap: 10, marginTop: 4 }}>
          <Button title="Call" variant="outline" onPress={() => callPhone(order.customer_phone)} style={{ flex: 1 }} />
          <Button
            title="WhatsApp"
            variant="whatsapp"
            onPress={() => openWhatsApp(`Hi ${order.customer_name}, this is Cake House about your order #${order.order_number}.`, order.customer_phone)}
            style={{ flex: 1 }}
          />
        </View>
      </Card>

      <SectionTitle>Items</SectionTitle>
      <Card>
        {items.map((i, n) => (
          <View key={n} style={{ gap: 2 }}>
            <Row label={`${i.product_name} × ${i.quantity}`} value={`₹${i.line_total}`} />
            <Text style={styles.small}>{[i.weight_label, i.flavour].filter(Boolean).join(' · ')}</Text>
            {i.custom_message ? <Text style={styles.small}>Message: “{i.custom_message}”</Text> : null}
          </View>
        ))}
        {Number(order.discount) > 0 ? <Row label="Discount" value={`−₹${order.discount}`} /> : null}
        <Row label="Delivery" value={`₹${order.delivery_charge}`} />
        <Row label="Total" value={`₹${order.total}`} strong />
        <Row label="Advance" value={`₹${order.advance_amount}`} />
        <Row label="Payment" value={PAYMENT_STATUS_LABEL[order.payment_status]} />
      </Card>

      {canConfirmAdvance && (
        <Button
          title={`Confirm ₹${order.advance_amount} advance received`}
          loading={busy}
          onPress={() =>
            update(
              { payment_status: 'advance_paid', order_status: order.order_status === 'pending' ? 'confirmed' : order.order_status },
              { title: `Payment confirmed for #${order.order_number}`, body: `We've confirmed your advance payment of ₹${order.advance_amount}. Thank you!` }
            )
          }
        />
      )}

      <SectionTitle>Update status</SectionTitle>
      <View style={styles.wrapRow}>
        {STATUS_STEPS[role].map((s) => (
          <Chip
            key={s}
            label={ORDER_STATUS_LABEL[s]}
            selected={order.order_status === s}
            onPress={() =>
              s !== order.order_status &&
              update({ order_status: s }, { title: `Order #${order.order_number}: ${ORDER_STATUS_LABEL[s]}`, body: `Your order is now ${ORDER_STATUS_LABEL[s].toLowerCase()}.` })
            }
          />
        ))}
      </View>

      {(role === 'delivery' || role === 'owner') && (
        <Button
          title={order.cash_collected ? 'Cash collected ✓ (tap to undo)' : 'Mark remaining cash collected'}
          variant="outline"
          loading={busy}
          onPress={() => update({ cash_collected: !order.cash_collected })}
        />
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  wrap: { padding: 16, gap: 14, paddingBottom: 40, maxWidth: 700, width: '100%', alignSelf: 'center' },
  title: { fontSize: 26, fontWeight: '800', color: C.brown },
  muted: { color: C.muted, fontSize: 15 },
  small: { color: C.muted, fontSize: 13 },
  wrapRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
});
