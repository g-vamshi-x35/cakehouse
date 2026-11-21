import Ionicons from '@expo/vector-icons/Ionicons';
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { FlatList, Pressable, RefreshControl, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { SignInPrompt } from '@/components/sign-in-prompt';
import { Chip, EmptyState, ErrorState, Skeleton, StatusBadge, tap } from '@/components/ui';
import { useAuth } from '@/lib/auth';
import { fetchMyOrders, formatDate, type OrderStatus, type OrderSummary } from '@/lib/orders';
import { C, F, MAX_W, R, SHADOW } from '@/lib/theme';

const ACTIVE: OrderStatus[] = ['pending', 'confirmed', 'baking', 'ready', 'out_for_delivery'];

export default function MyOrders() {
  const { session } = useAuth();
  const [orders, setOrders] = useState<OrderSummary[] | null>(null);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState<'all' | 'active' | 'past'>('all');
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    if (!session) return;
    try {
      setOrders(await fetchMyOrders(session.user.id));
      setError('');
    } catch {
      setError("Couldn't load your orders. Check your connection and try again.");
    }
  }, [session]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  if (!session) return <SignInPrompt what="your orders" />;
  if (error && !orders) return <ErrorState message={error} onRetry={load} />;

  const shown = (orders ?? []).filter((o) =>
    filter === 'all' ? true : filter === 'active' ? ACTIVE.includes(o.order_status) : !ACTIVE.includes(o.order_status)
  );

  return (
    <FlatList
      data={orders ? shown : []}
      keyExtractor={(o) => o.id}
      contentContainerStyle={styles.list}
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
      }
      ListHeaderComponent={
        <View style={{ flexDirection: 'row', gap: 8, marginBottom: 4 }}>
          <Chip label="All" selected={filter === 'all'} onPress={() => setFilter('all')} />
          <Chip label="In progress" selected={filter === 'active'} onPress={() => setFilter('active')} />
          <Chip label="Completed" selected={filter === 'past'} onPress={() => setFilter('past')} />
        </View>
      }
      ListEmptyComponent={
        orders ? (
          <EmptyState
            icon="receipt-outline"
            title={filter === 'all' ? 'No orders yet' : 'Nothing here'}
            body={filter === 'all' ? 'Your cake orders will appear here so you can track them.' : undefined}
            action={filter === 'all' ? 'Browse the menu' : undefined}
            onAction={() => router.navigate('/menu')}
          />
        ) : (
          <View style={{ gap: 10 }}>
            {[0, 1, 2].map((i) => (
              <Skeleton key={i} style={{ height: 96, borderRadius: R.lg }} />
            ))}
          </View>
        )
      }
      renderItem={({ item, index }) => (
        <Animated.View entering={FadeInDown.duration(350).delay(Math.min(index, 8) * 40)}>
          <Pressable
            accessibilityRole="button"
            onPress={() => {
              tap();
              router.push({ pathname: '/orders/[id]', params: { id: item.id } });
            }}
            style={({ pressed }) => [styles.card, pressed && { transform: [{ scale: 0.98 }] }]}>
            <View style={{ flex: 1, gap: 4 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Text style={styles.num}>#{item.order_number}</Text>
                <StatusBadge status={item.order_status} />
              </View>
              <Text style={styles.items} numberOfLines={1}>
                {(item.order_items ?? []).map((i) => `${i.product_name} × ${i.quantity}`).join(', ') || 'Order'}
              </Text>
              <Text style={styles.meta}>
                Placed {formatDate(item.created_at)}
                {item.event_date ? ` · for ${formatDate(item.event_date)}` : ''}
              </Text>
            </View>
            <View style={{ alignItems: 'flex-end', justifyContent: 'space-between' }}>
              <Text style={styles.total}>₹{item.total}</Text>
              <Ionicons name="chevron-forward" size={18} color={C.faint} />
            </View>
          </Pressable>
        </Animated.View>
      )}
    />
  );
}

const styles = StyleSheet.create({
  list: { padding: 16, gap: 10, maxWidth: MAX_W, width: '100%', alignSelf: 'center' },
  card: { flexDirection: 'row', gap: 12, backgroundColor: C.surface, borderRadius: R.lg, padding: 14, borderWidth: 1, borderColor: C.border, boxShadow: SHADOW.card },
  num: { fontFamily: F.bodyBlack, fontSize: 16, color: C.ink },
  items: { fontFamily: F.body, fontSize: 14, color: C.ink },
  meta: { fontFamily: F.body, fontSize: 12.5, color: C.muted },
  total: { fontFamily: F.bodyBlack, fontSize: 16.5, color: C.brown, fontVariant: ['tabular-nums'] },
});
