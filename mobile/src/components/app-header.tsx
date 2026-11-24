import { Image } from 'expo-image';
import { router } from 'expo-router';
import type { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { IconButton } from '@/components/ui';
import { business } from '@/lib/business';
import { useCart } from '@/lib/cart';
import { LOGO } from '@/lib/images';
import { C, F } from '@/lib/theme';

/** Brand header used on the tab screens: logo, title and the cart button. */
export function AppHeader({ title, subtitle, right }: { title?: string; subtitle?: string; right?: ReactNode }) {
  const { count } = useCart();
  return (
    <View style={styles.row}>
      <Image source={LOGO} style={styles.logo} contentFit="cover" alt="Cake House logo" />
      <View style={{ flex: 1 }}>
        <Text style={styles.title} numberOfLines={1} accessibilityRole="header">
          {title ?? business.name}
        </Text>
        <Text style={styles.sub} numberOfLines={1}>
          {subtitle ?? `${business.subBrand} · 100% Eggless`}
        </Text>
      </View>
      {right}
      <IconButton icon="bag-handle-outline" label={`Cart, ${count} items`} badge={count} onPress={() => router.push('/cart')} />
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  logo: { width: 46, height: 46, borderRadius: 23, borderWidth: 2, borderColor: C.cream },
  title: { fontFamily: F.heading, fontSize: 22, color: C.brown },
  sub: { fontFamily: F.body, fontSize: 12.5, color: C.muted },
});
