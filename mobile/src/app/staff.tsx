import { Redirect, router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { FlatList, Pressable, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { Chip, LoadingState, StatusBadge } from '@/components/ui';
import { useAuth } from '@/lib/auth';
import { formatDate, PAYMENT_STATUS_LABEL, type OrderStatus, type PaymentStatus } from '@/lib/orders';
import { supabase } from '@/lib/supabase';
import { C, F, MAX_W, R } from '@/lib/theme';

type OrderRow = {
  id: string;
  order_number: string;
  customer_name: string;
  total: number;
  order_status: OrderStatus;
  payment_status: PaymentStatus;
  event_date: string | null;
  event_time: string | null;
  created_at: string;
};

const ACTIVE: OrderStatus[] = ['pending', 'confirmed', 'baking', 'ready', 'out_for_delivery'];

function startOfToday() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

export default function OrdersScreen() {
  const { session, profile, isStaff, loading: authLoading } = useAuth();
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'active' | 'today' | 'all'>('active');

  const load = useCallback(async () => {
    if (!session) {
      setOrders([]);
      setLoading(false);
      return;
    }
    let q = supabase
      .from('orders')
      .select('id, order_number, customer_name, total, order_status, payment_status, event_date, event_time, created_at')
      .order('created_at', { ascending: false })
      .limit(200);
    // Row Level Security already limits this: customers get their own
    // orders, delivery staff their assigned ones, owner/employee everything.
    if (!isStaff) q = q.eq('customer_id', session.user.id);
    const { data } = await q;
    setOrders((data as OrderRow[] | null) ?? []);
    setLoading(false);
  }, [session, isStaff]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  if (authLoading) return <LoadingState />;
  // Customers use My Orders; this screen is the staff dashboard.
  if (!session) return <Redirect href="/login" />;
  if (!isStaff) return <Redirect href="/orders" />;

  const today = startOfToday().getTime();
  const shown = isStaff
    ? orders.filter((o) =>
        filter === 'all' ? true : filter === 'today' ? new Date(o.created_at).getTime() >= today : ACTIVE.includes(o.order_status)
      )
    : orders;
  const todays = orders.filter((o) => new Date(o.created_at).getTime() >= today && o.order_status !== 'cancelled');
  const revenue = todays.reduce((s, o) => s + Number(o.total), 0);

  return (
    <View style={styles.page}>
      <FlatList
        data={shown}
        keyExtractor={(o) => o.id}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={false} onRefresh={load} tintColor={C.brown} />}
        ListHeaderComponent={
          <View style={{ gap: 12, marginBottom: 4 }}>
            <Text style={styles.title}>{`${roleTitle(profile?.role)} Dashboard`}</Text>
            {isStaff && profile?.role !== 'delivery' && (
              <View style={styles.stats}>
                <Stat label="Today's orders" value={String(todays.length)} />
                <Stat label="Today's revenue" value={`₹${revenue}`} />
                <Stat label="In progress" value={String(orders.filter((o) => ACTIVE.includes(o.order_status)).length)} />
              </View>
            )}
            {isStaff && (
              <View style={{ flexDirection: 'row', gap: 8 }}>
                <Chip label="Active" selected={filter === 'active'} onPress={() => setFilter('active')} />
                <Chip label="Today" selected={filter === 'today'} onPress={() => setFilter('today')} />
                <Chip label="All" selected={filter === 'all'} onPress={() => setFilter('all')} />
              </View>
            )}
          </View>
        }
        ListEmptyComponent={
          <Text style={[styles.muted, { textAlign: 'center', paddingTop: 30 }]}>
            {loading ? 'Loading…' : isStaff ? 'No orders here.' : "You haven't placed any orders yet."}
          </Text>
        }
        renderItem={({ item }) => (
          <Pressable
            disabled={!isStaff}
            onPress={() => router.push({ pathname: '/staff-order/[id]', params: { id: item.id } })}
            style={({ pressed }) => [styles.card, pressed && { opacity: 0.85 }]}>
            <View style={{ flex: 1, gap: 4 }}>
              <Text style={styles.num}>#{item.order_number}</Text>
              <Text style={styles.muted} numberOfLines={1}>
                {isStaff ? item.customer_name : formatDate(item.created_at)}
                {item.event_date ? ` · for ${formatDate(item.event_date)}${item.event_time ? ` ${item.event_time.slice(0, 5)}` : ''}` : ''}
              </Text>
              <Text style={styles.small}>{PAYMENT_STATUS_LABEL[item.payment_status]}</Text>
            </View>
            <View style={{ alignItems: 'flex-end', gap: 6 }}>
              <Text style={styles.total}>₹{item.total}</Text>
              <StatusBadge status={item.order_status} />
            </View>
          </Pressable>
        )}
      />
    </View>
  );
}

function roleTitle(role?: string) {
  return role === 'owner' ? 'Owner' : role === 'employee' ? 'Employee' : 'Delivery';
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.stat}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.small}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: C.page },
  list: { padding: 16, gap: 10, maxWidth: MAX_W, width: '100%', alignSelf: 'center' },
  title: { fontSize: 26, fontFamily: F.heading, color: C.brown },
  muted: { color: C.muted, fontSize: 15, fontFamily: F.body },
  small: { color: C.muted, fontSize: 13, fontFamily: F.body },
  card: { flexDirection: 'row', gap: 12, backgroundColor: C.surface, borderRadius: R.lg, padding: 14, borderCurve: 'continuous', borderWidth: 1, borderColor: C.border },
  num: { fontSize: 17, fontFamily: F.bodyBlack, color: C.ink },
  total: { fontSize: 17, fontFamily: F.bodyBlack, color: C.brown, fontVariant: ['tabular-nums'] },
  stats: { flexDirection: 'row', gap: 8 },
  stat: { flex: 1, backgroundColor: C.surface, borderWidth: 1, borderColor: C.border, borderRadius: R.md, padding: 12, gap: 2 },
  statValue: { fontSize: 20, fontFamily: F.bodyBlack, color: C.brown, fontVariant: ['tabular-nums'] },
});
