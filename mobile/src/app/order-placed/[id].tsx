import Ionicons from '@expo/vector-icons/Ionicons';
import * as Haptics from 'expo-haptics';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown, ZoomIn } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Confetti } from '@/components/confetti';
import { Button, Card, Divider, LoadingState, Row } from '@/components/ui';
import { useAuth } from '@/lib/auth';
import { business, openWhatsApp } from '@/lib/business';
import { formatDate, PAYMENT_STATUS_LABEL, type PaymentStatus } from '@/lib/orders';
import { supabase } from '@/lib/supabase';
import { C, F, MAX_W, R } from '@/lib/theme';

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
  const insets = useSafeAreaInsets();
  const { session } = useAuth();
  const [order, setOrder] = useState<Confirmation | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .rpc('get_order_confirmation', { p_order_id: id })
      .then(({ data }) => setOrder((data as Confirmation | null) ?? null))
      .then(() => setLoading(false));
    if (Platform.OS !== 'web') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
  }, [id]);

  if (loading) return <LoadingState text="Confirming your order…" />;

  const advance = order?.advance_amount ?? 100;

  return (
    <View style={{ flex: 1, backgroundColor: C.page }}>
      <Confetti />
      <ScrollView contentContainerStyle={[styles.wrap, { paddingTop: insets.top + 30, paddingBottom: insets.bottom + 30 }]}>
        <View style={{ alignItems: 'center', gap: 8 }}>
          <Animated.View entering={ZoomIn.springify().damping(11)} style={styles.circle}>
            <Ionicons name="checkmark" size={50} color={C.white} />
          </Animated.View>
          <Animated.Text entering={FadeInDown.delay(250)} style={styles.title} accessibilityRole="header">
            Thank you{order?.customer_name ? `, ${order.customer_name.split(' ')[0]}` : ''}!
          </Animated.Text>
          <Animated.Text entering={FadeInDown.delay(350)} style={styles.muted}>
            Your order {order ? `#${order.order_number} ` : ''}has been placed.
          </Animated.Text>
        </View>

        <Animated.View entering={FadeInDown.delay(450)}>
          <Card style={{ backgroundColor: C.brown, borderColor: C.brown }}>
            <Text style={styles.payTitle}>Pay ₹{advance} advance to confirm</Text>
            <Text style={styles.payBody}>
              Pay with GPay / PhonePe / Paytm UPI to{' '}
              <Text style={{ fontFamily: F.bodyBlack, color: C.white }} selectable>
                {business.phones[0]}
              </Text>{' '}
              ({business.name}), then send us your order number on WhatsApp. We confirm your order once the advance arrives.
            </Text>
            <Button
              title="Send on WhatsApp"
              icon="logo-whatsapp"
              variant="whatsapp"
              onPress={() => openWhatsApp(`Hi ${business.name}! I placed order #${order?.order_number ?? ''} in the app and paid the ₹${advance} advance.`)}
            />
          </Card>
        </Animated.View>

        {order && (
          <Animated.View entering={FadeInDown.delay(550)}>
            <Card>
              <Row label="Order" value={`#${order.order_number}`} strong />
              {order.items.map((i, n) => (
                <Row key={n} label={[i.product_name, i.weight_label, i.flavour].filter(Boolean).join(' · ')} value={`× ${i.quantity}`} />
              ))}
              <Divider />
              {order.event_date ? <Row label="Delivery date" value={formatDate(order.event_date)} /> : null}
              <Row label="Delivery charge" value={`₹${order.delivery_charge}`} />
              <Row label="Total" value={`₹${order.total}`} strong />
              <Row label="Advance" value={`₹${order.advance_amount}`} />
              <Row label="Payment" value={PAYMENT_STATUS_LABEL[order.payment_status]} />
            </Card>
          </Animated.View>
        )}

        <View style={{ gap: 10 }}>
          {session ? (
            <Button title="Track this order" icon="navigate-outline" onPress={() => router.replace({ pathname: '/orders/[id]', params: { id } })} />
          ) : null}
          <Button title="Back to Home" variant="outline" onPress={() => (router.canGoBack() ? router.back() : router.replace('/'))} />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { padding: 20, gap: 18, maxWidth: MAX_W, width: '100%', alignSelf: 'center' },
  circle: { width: 92, height: 92, borderRadius: 46, backgroundColor: C.green, alignItems: 'center', justifyContent: 'center', boxShadow: '0 10px 24px rgba(47,125,79,0.4)' },
  title: { fontFamily: F.heading, fontSize: 30, color: C.brown, marginTop: 8 },
  muted: { fontFamily: F.body, color: C.muted, fontSize: 15.5 },
  payTitle: { fontFamily: F.heading, fontSize: 21, color: C.cream },
  payBody: { fontFamily: F.body, fontSize: 14.5, color: C.creamLight, lineHeight: 21 },
  card: { borderRadius: R.lg },
});
