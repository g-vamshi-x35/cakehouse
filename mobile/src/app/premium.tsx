import Ionicons from '@expo/vector-icons/Ionicons';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { FlatList, Pressable, RefreshControl, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { PremiumCard } from '@/components/premium-card';
import { Skeleton, tap } from '@/components/ui';
import { business, openWhatsApp } from '@/lib/business';
import { imageSource } from '@/lib/images';
import { fetchPremiumCakes, type PremiumCake } from '@/lib/premium';
import { C, F, MAX_W, R } from '@/lib/theme';

export default function PremiumCakesScreen() {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const cardW = (Math.min(width, MAX_W) - 16 * 2 - 12) / 2;
  const [cakes, setCakes] = useState<PremiumCake[] | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback((fresh = false) => fetchPremiumCakes(fresh).then(setCakes), []);
  useEffect(() => {
    load();
  }, [load]);

  const header = (
    <View style={{ marginHorizontal: -16, marginBottom: 8 }}>
      <View style={[styles.hero, { paddingTop: insets.top + 64 }]}>
        <Image source={imageSource('/images/stylish/chocolate-brownies.jpg')} style={[StyleSheet.absoluteFill, { opacity: 0.45 }]} contentFit="cover" alt="" />
        <LinearGradient colors={['rgba(31,20,17,0.7)', 'rgba(31,20,17,0.55)', C.espresso]} style={StyleSheet.absoluteFill} />
        <Animated.Text entering={FadeInDown.duration(500)} style={styles.eyebrow}>
          The Premium Collection
        </Animated.Text>
        <Animated.Text entering={FadeInDown.duration(600).delay(100)} style={styles.title} accessibilityRole="header">
          Cakes Worth <Text style={styles.titleGold}>Celebrating</Text>
        </Animated.Text>
        <View style={styles.rule} />
        <Animated.Text entering={FadeInDown.duration(600).delay(200)} style={styles.sub}>
          {cakes ? `${cakes.length} handcrafted` : 'Handcrafted'} signature cakes — rich chocolate, fresh fruit, playful themes and elegant
          celebration designs. 100% eggless, baked fresh to order.
        </Animated.Text>
      </View>
      <LinearGradient colors={[C.espresso, C.page]} style={{ height: 28 }} />
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: C.page }}>
      <FlatList
        data={cakes ?? []}
        keyExtractor={(c) => c.slug}
        numColumns={2}
        columnWrapperStyle={{ gap: 12 }}
        contentContainerStyle={[styles.list, { paddingBottom: insets.bottom + 30 }]}
        ListHeaderComponent={header}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            tintColor={C.gold}
            colors={[C.gold]}
            progressViewOffset={insets.top + 40}
            onRefresh={async () => {
              setRefreshing(true);
              await load(true);
              setRefreshing(false);
            }}
          />
        }
        ListEmptyComponent={
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
            {[0, 1, 2, 3].map((i) => (
              <Skeleton key={i} style={{ width: cardW, height: cardW * 1.25 + 110, borderRadius: R.xl }} />
            ))}
          </View>
        }
        renderItem={({ item, index }) => (
          <Animated.View entering={FadeInDown.duration(400).delay(Math.min(index, 6) * 50)}>
            <PremiumCard cake={item} width={cardW} />
          </Animated.View>
        )}
        ListFooterComponent={
          cakes ? (
            <View style={styles.cta}>
              <Text style={styles.ctaEyebrow}>Made For Your Moment</Text>
              <Text style={styles.ctaTitle}>Want a size, flavour or design you don’t see?</Text>
              <Text style={styles.ctaBody}>
                Every premium cake can be made in your choice of weight and flavour. Message us and we’ll craft it for you.
              </Text>
              <Pressable
                accessibilityRole="button"
                onPress={() => {
                  tap();
                  openWhatsApp(`Hi ${business.name}! I'd like to order a premium cake. Can you help me choose?`);
                }}
                style={({ pressed }) => [styles.goldBtn, pressed && { backgroundColor: C.cream }]}>
                <Ionicons name="logo-whatsapp" size={18} color={C.espresso} />
                <Text style={styles.goldBtnText}>Chat With Us</Text>
              </Pressable>
              <Pressable onPress={() => router.navigate('/custom-cake')} hitSlop={8} accessibilityRole="button">
                <Text style={styles.ctaLink}>Or design your own custom cake →</Text>
              </Pressable>
            </View>
          ) : undefined
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  list: { paddingHorizontal: 16, gap: 12, maxWidth: MAX_W, width: '100%', alignSelf: 'center' },
  hero: { backgroundColor: C.espresso, paddingHorizontal: 28, paddingBottom: 30, alignItems: 'center', overflow: 'hidden' },
  eyebrow: { color: C.gold, fontFamily: F.bodyBold, fontSize: 11, letterSpacing: 4, textTransform: 'uppercase', marginBottom: 12 },
  title: { color: C.cream, fontFamily: F.heading, fontSize: 38, lineHeight: 44, textAlign: 'center' },
  titleGold: { color: C.gold, fontFamily: F.headingItalic },
  rule: { width: 70, height: 1, backgroundColor: 'rgba(176,141,87,0.6)', marginVertical: 18 },
  sub: { color: 'rgba(238,225,186,0.8)', fontFamily: F.body, fontSize: 14.5, lineHeight: 22, textAlign: 'center', maxWidth: 420 },
  cta: { marginTop: 24, backgroundColor: C.espresso, borderRadius: R.xl, padding: 24, alignItems: 'center', gap: 10 },
  ctaEyebrow: { color: C.gold, fontFamily: F.bodyBold, fontSize: 11, letterSpacing: 3, textTransform: 'uppercase' },
  ctaTitle: { color: C.cream, fontFamily: F.heading, fontSize: 23, textAlign: 'center', lineHeight: 30 },
  ctaBody: { color: 'rgba(238,225,186,0.75)', fontFamily: F.body, fontSize: 14, textAlign: 'center', lineHeight: 21, marginBottom: 6 },
  goldBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: C.gold, borderRadius: R.pill, paddingHorizontal: 28, paddingVertical: 14 },
  goldBtnText: { color: C.espresso, fontFamily: F.bodyBlack, fontSize: 15, letterSpacing: 0.4 },
  ctaLink: { color: C.cream, fontFamily: F.bodyBold, fontSize: 13.5, marginTop: 6, opacity: 0.85 },
});
