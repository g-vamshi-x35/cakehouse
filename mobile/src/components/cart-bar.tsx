import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown, FadeOutDown } from 'react-native-reanimated';
import { tap } from '@/components/ui';
import { useCart } from '@/lib/cart';
import { C, F, R, SHADOW } from '@/lib/theme';

/** Floating "View cart" bar shown above the tab bar while the cart has items. */
export function CartBar() {
  const { count, subtotal } = useCart();
  if (!count) return null;
  return (
    <Animated.View entering={FadeInDown.duration(300)} exiting={FadeOutDown.duration(200)} style={styles.wrap}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`View cart, ${count} items, ₹${subtotal}`}
        onPress={() => {
          tap();
          router.push('/cart');
        }}
        style={({ pressed }) => [styles.bar, pressed && { transform: [{ scale: 0.98 }] }]}>
        <View style={styles.count}>
          <Text style={styles.countText}>{count}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>View cart</Text>
          <Text style={styles.sub}>{count === 1 ? '1 item' : `${count} items`}</Text>
        </View>
        <Text style={styles.total}>₹{subtotal}</Text>
        <Ionicons name="arrow-forward" size={18} color={C.white} />
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: { position: 'absolute', left: 16, right: 16, bottom: 10, maxWidth: 560, alignSelf: 'center' },
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: C.brown,
    borderRadius: R.lg,
    paddingVertical: 12,
    paddingHorizontal: 14,
    boxShadow: SHADOW.lifted,
    borderCurve: 'continuous',
  },
  count: { width: 34, height: 34, borderRadius: 17, backgroundColor: C.rose, alignItems: 'center', justifyContent: 'center' },
  countText: { color: C.white, fontFamily: F.bodyBlack, fontSize: 14 },
  title: { color: C.white, fontFamily: F.bodyBlack, fontSize: 15 },
  sub: { color: C.creamLight, fontFamily: F.body, fontSize: 12 },
  total: { color: C.white, fontFamily: F.bodyBlack, fontSize: 16, fontVariant: ['tabular-nums'] },
});
