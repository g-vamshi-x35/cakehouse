import Ionicons from '@expo/vector-icons/Ionicons';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeOut, LinearTransition } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button, Card, EmptyState, QtyStepper, Row } from '@/components/ui';
import { useCart } from '@/lib/cart';
import { ADVANCE_AMOUNT } from '@/lib/delivery';
import { imageSource, placeholderEmoji } from '@/lib/images';
import { C, F, MAX_W, R, SHADOW } from '@/lib/theme';

export default function CartScreen() {
  const insets = useSafeAreaInsets();
  const { items, setQty, remove, subtotal, count } = useCart();

  if (!items.length) {
    return (
      <EmptyState
        icon="bag-handle-outline"
        title="Your cart is empty"
        body="Fresh cakes, pizza and snacks are waiting for you on the menu."
        action="Browse the menu"
        onAction={() => router.navigate('/menu')}
      />
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={[styles.wrap, { paddingBottom: 140 + insets.bottom }]}>
        {items.map((i) => {
          const src = imageSource(i.image);
          return (
            <Animated.View key={i.key} layout={LinearTransition} exiting={FadeOut.duration(200)} style={styles.item}>
              {src ? (
                <Image source={src} style={styles.img} contentFit="cover" alt={i.name} />
              ) : (
                <View style={[styles.img, styles.noImg]}>
                  <Text style={{ fontSize: 30 }}>{placeholderEmoji(i.categorySlug)}</Text>
                </View>
              )}
              <View style={{ flex: 1, gap: 4 }}>
                <View style={{ flexDirection: 'row', gap: 8 }}>
                  <Text style={styles.name} numberOfLines={2}>
                    {i.name}
                  </Text>
                  <Pressable onPress={() => remove(i.key)} hitSlop={10} accessibilityRole="button" accessibilityLabel={`Remove ${i.name}`}>
                    <Ionicons name="trash-outline" size={18} color={C.muted} />
                  </Pressable>
                </View>
                <Text style={styles.meta}>{[i.weightLabel, i.flavour].filter(Boolean).join(' · ') || 'Regular'}</Text>
                {i.message ? (
                  <Text style={styles.msg} numberOfLines={1}>
                    “{i.message}”
                  </Text>
                ) : null}
                <View style={styles.itemFoot}>
                  <Text style={styles.price}>₹{i.unitPrice * i.qty}</Text>
                  <QtyStepper value={i.qty} onChange={(n) => setQty(i.key, n)} />
                </View>
              </View>
            </Animated.View>
          );
        })}

        <Pressable onPress={() => router.navigate('/menu')} style={styles.more} accessibilityRole="button">
          <Ionicons name="add-circle-outline" size={20} color={C.rose} />
          <Text style={styles.moreText}>Add more items</Text>
        </Pressable>

        <Card>
          <Row label={`Subtotal (${count} item${count === 1 ? '' : 's'})`} value={`₹${subtotal}`} />
          <Row label="Delivery" value="Calculated at checkout" />
          <Text style={styles.note}>
            Pay just ₹{Math.min(ADVANCE_AMOUNT, subtotal)} advance by UPI to confirm — the rest on delivery. Final prices are confirmed by the
            bakery when you place the order.
          </Text>
        </Card>
      </ScrollView>

      <View style={[styles.bottom, { paddingBottom: insets.bottom + 12 }]}>
        <View style={styles.bottomRow}>
          <View>
            <Text style={styles.totalLabel}>Subtotal</Text>
            <Text style={styles.total}>₹{subtotal}</Text>
          </View>
          <Button title="Checkout" icon="arrow-forward" onPress={() => router.push('/checkout')} style={{ flex: 1 }} size="lg" />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { padding: 16, gap: 12, maxWidth: MAX_W, width: '100%', alignSelf: 'center' },
  item: { flexDirection: 'row', gap: 12, backgroundColor: C.surface, borderRadius: R.lg, padding: 10, borderWidth: 1, borderColor: C.border, boxShadow: SHADOW.card },
  img: { width: 92, height: 92, borderRadius: R.md },
  noImg: { backgroundColor: C.cream, alignItems: 'center', justifyContent: 'center' },
  name: { flex: 1, fontFamily: F.headingSemi, fontSize: 16, color: C.ink },
  meta: { fontFamily: F.body, fontSize: 13, color: C.muted },
  msg: { fontFamily: F.headingItalic, fontSize: 13, color: C.brown },
  itemFoot: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto' },
  price: { fontFamily: F.bodyBlack, fontSize: 16, color: C.rose, fontVariant: ['tabular-nums'] },
  more: { flexDirection: 'row', alignItems: 'center', gap: 8, alignSelf: 'center', padding: 10 },
  moreText: { fontFamily: F.bodyBold, color: C.rose, fontSize: 15 },
  note: { fontFamily: F.body, fontSize: 13, color: C.muted, lineHeight: 19 },
  bottom: { position: 'absolute', left: 0, right: 0, bottom: 0, backgroundColor: C.surface, padding: 16, borderTopLeftRadius: R.xl, borderTopRightRadius: R.xl, boxShadow: SHADOW.bar },
  bottomRow: { flexDirection: 'row', alignItems: 'center', gap: 16, maxWidth: MAX_W, width: '100%', alignSelf: 'center' },
  totalLabel: { fontFamily: F.body, fontSize: 12, color: C.muted },
  total: { fontFamily: F.bodyBlack, fontSize: 21, color: C.brown, fontVariant: ['tabular-nums'] },
});
