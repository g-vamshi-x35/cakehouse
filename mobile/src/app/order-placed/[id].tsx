import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Button, Card, Centered, Row } from '@/components/ui';
import { business, openWhatsApp } from '@/lib/business';
import { formatDate, PAYMENT_STATUS_LABEL, type PaymentStatus } from '@/lib/orders';
import { supabase } from '@/lib/supabase';
import { C } from '@/lib/theme';

type Confirmation = {
  order_number: string;
  customer_name: string;
  total: number;
  advance_amount: number;
  delivery_charge: number;
  delivery_address: string;
  event_date: string | null;
  payment_status: PaymentStatus;
  items: { product_name: string; weight_label: string | null; flavour: string | null; quantity: number }[];
};

export default function OrderPlacedScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [order, setOrder] = useState<Confirmation | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .rpc('get_order_confirmation', { p_order_id: id })
      .then(({ data }) => setOrder((data as Confirmation | null) ?? null))
      .then(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <Centered>
        <Text style={styles.muted}>Loading your order…</Text>
      </Centered>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.wrap}>
      <View style={{ alignItems: 'center', gap: 6 }}>
        <Text style={{ fontSize: 54 }}>🎉</Text>
        <Text style={styles.title}>Thank you!</Text>
        <Text style={styles.muted}>Your order has been placed.</Text>
      </View>

      {order && (
        <Card>
          <Row label="Order" value={`#${order.order_number}`} strong />
          {order.items.map((i, n) => (
            <Row
              key={n}
              label={[i.product_name, i.weight_label, i.flavour].filter(Boolean).join(' · ')}
              value={`× ${i.quantity}`}
            />
          ))}
          {order.event_date ? <Row label="Delivery date" value={formatDate(order.event_date)} /> : null}
          <Row label="Delivery charge" value={`₹${order.delivery_charge}`} />
          <Row label="Total" value={`₹${order.total}`} strong />
          <Row label="Advance" value={`₹${order.advance_amount}`} />
          <Row label="Payment" value={PAYMENT_STATUS_LABEL[order.payment_status]} />
        </Card>
      )}

      <Card style={{ backgroundColor: C.cream }}>
        <Text style={styles.payTitle}>Pay ₹{order?.advance_amount ?? 100} advance</Text>
        <Text style={styles.body}>
          Pay with GPay / PhonePe / Paytm to <Text style={{ fontWeight: '800' }} selectable>{business.phones[0]}</Text> ({business.name}),
          then send us your order number on WhatsApp. We confirm your order once the advance is received.
        </Text>
      </Card>

      <Button
        title="Send order number on WhatsApp"
        variant="whatsapp"
        onPress={() => openWhatsApp(`Hi ${business.name}! I placed order #${order?.order_number ?? ''} in the app and paid the advance.`)}
      />
      <Button title="Back to menu" variant="outline" onPress={() => router.dismissTo('/')} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  wrap: { padding: 16, gap: 16, paddingBottom: 40, maxWidth: 700, width: '100%', alignSelf: 'center' },
  title: { fontSize: 28, fontWeight: '800', color: C.brown },
  muted: { color: C.muted, fontSize: 15 },
  payTitle: { fontSize: 18, fontWeight: '800', color: C.brown },
  body: { fontSize: 15, color: C.ink, lineHeight: 22 },
});
