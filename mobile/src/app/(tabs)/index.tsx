import Ionicons from '@expo/vector-icons/Ionicons';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useFocusEffect } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useCallback, useEffect, useState } from 'react';
import { Pressable, RefreshControl, ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ProductCard } from '@/components/product-card';
import { SiteVideo } from '@/components/site-video';
import { Button, ErrorState, IconButton, SectionTitle, Skeleton, tap } from '@/components/ui';
import { useAuth } from '@/lib/auth';
import { business } from '@/lib/business';
import { useCart } from '@/lib/cart';
import { LOGO, imageSource } from '@/lib/images';
import { fetchPremiumCakes, formatPremiumPrice, SIGNATURE_SLUGS, type PremiumCake } from '@/lib/premium';
import { fetchMyOrders, ORDER_STATUS_LABEL, type OrderSummary } from '@/lib/orders';
import { couponLabel, fetchCoupons, fetchProducts, type Coupon, type Product } from '@/lib/products';
import { C, F, MAX_W, R } from '@/lib/theme';

const CATEGORIES = [
  { slug: 'regular-cakes', name: 'Cakes', img: '/images/products/cakes/black-forest-cake/2.jpg' },
  { slug: 'customized-cakes', name: 'Theme Cakes', img: '/images/menu/menu-doll-barbie-cake.jpg' },
  { slug: 'pizza', name: 'Pizza', img: '/images/products/pizza/cheese-pizza/1.jpg' },
  { slug: 'snacks', name: 'Snacks', img: '/images/products/snacks/samosa/1.jpg' },
];

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const { profile, session, isStaff } = useAuth();
  const [active, setActive] = useState<OrderSummary | null>(null);
  const { count } = useCart();
  const { width, height } = useWindowDimensions();
  const contentW = Math.min(width, MAX_W) - 32;
  const cardW = (contentW - 12) / 2;

  const [products, setProducts] = useState<Product[] | null>(null);
  const [premium, setPremium] = useState<PremiumCake[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [error, setError] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [heroOnScreen, setHeroOnScreen] = useState(true);

  const load = useCallback(
    (fresh = false) =>
      Promise.all([fetchProducts({ fresh }), fetchPremiumCakes(fresh), fetchCoupons()]).then(
        ([p, pc, c]) => {
          setProducts(p);
          setPremium(pc);
          setCoupons(c);
          setError('');
        },
        () => setError("Couldn't load the bakery. Check your internet connection and try again.")
      ),
    []
  );

  useEffect(() => {
    load();
  }, [load]);

  // The customer's latest order that is still on its way.
  useFocusEffect(
    useCallback(() => {
      if (!session || isStaff) return;
      fetchMyOrders(session.user.id)
        .then((list) => setActive(list.find((o) => o.order_status !== 'delivered' && o.order_status !== 'cancelled') ?? null))
        .catch(() => {});
    }, [session, isStaff])
  );

  const all = products ?? [];
  const featured = all.filter((p) => p.isFeatured && !p.isCustomCake);
  const bestsellers = (featured.length >= 4 ? featured : all.filter((p) => !p.isCustomCake)).slice(0, 4);
  const pizzaPrices = all.filter((p) => p.categorySlug === 'pizza' && p.price > 0).map((p) => p.price);
  const pizzaFrom = pizzaPrices.length ? Math.min(...pizzaPrices) : null;
  const signature = SIGNATURE_SLUGS.map((s) => premium.find((c) => c.slug === s)).filter(Boolean) as PremiumCake[];
  const coupon = coupons[0];

  const firstName = profile?.full_name?.trim().split(/\s+/)[0];
  const heroH = Math.max(440, Math.min(height * 0.6, 560));
  const goMenu = (category?: string) => router.navigate({ pathname: '/menu', params: category ? { category } : {} });

  if (error && !products) {
    return (
      <View style={[styles.page, { paddingTop: insets.top }]}>
        <ErrorState message={error} onRetry={() => load(true)} />
      </View>
    );
  }

  return (
    <View style={styles.page}>
      <StatusBar style={heroOnScreen ? 'light' : 'dark'} />
      <ScrollView
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={32}
        onScroll={(e) => setHeroOnScreen(e.nativeEvent.contentOffset.y < heroH - 60)}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            tintColor={C.gold}
            colors={[C.rose]}
            progressViewOffset={insets.top + 20}
            onRefresh={async () => {
              setRefreshing(true);
              await load(true);
              setRefreshing(false);
            }}
          />
        }>
        {/* 1. Hero */}
        <View style={[styles.hero, { height: heroH }]}>
          <SiteVideo name="hero-berry-cake" style={StyleSheet.absoluteFill} active={heroOnScreen} />
          <LinearGradient colors={['rgba(31,20,17,0.55)', 'rgba(31,20,17,0.1)', 'rgba(31,20,17,0.92)']} locations={[0, 0.35, 1]} style={StyleSheet.absoluteFill} />
          <View style={[styles.heroTop, { paddingTop: insets.top + 8 }]}>
            <Image source={LOGO} style={styles.logo} alt="Cake House logo" />
            <Text style={styles.heroBrand} numberOfLines={1}>
              {firstName ? `Hi, ${firstName}` : business.name}
            </Text>
            <IconButton icon="bag-handle-outline" label={`Cart, ${count} items`} badge={count} onPress={() => router.push('/cart')} color={C.white} bg="rgba(255,255,255,0.16)" />
          </View>
          <View style={styles.heroBody}>
            <Animated.Text entering={FadeInDown.duration(700).delay(200)} style={styles.heroTitle} accessibilityRole="header">
              Fresh Cakes,{'\n'}Baked With Love.
            </Animated.Text>
            <Animated.Text entering={FadeInDown.duration(700).delay(350)} style={styles.heroSub}>
              100% eggless · Delivered in Berhampur
            </Animated.Text>
            <Animated.View entering={FadeInDown.duration(700).delay(500)}>
              <Button title="Order Now" icon="bag-handle-outline" size="lg" onPress={() => goMenu()} style={{ marginTop: 12 }} />
            </Animated.View>
          </View>
        </View>

        <View style={styles.wrap}>
          {isStaff ? (
            <Pressable
              accessibilityRole="button"
              onPress={() => {
                tap();
                router.push('/staff');
              }}
              style={({ pressed }) => [styles.track, pressed && { transform: [{ scale: 0.98 }] }]}>
              <View style={styles.trackIcon}>
                <Ionicons name="speedometer" size={20} color={C.espresso} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.trackTitle}>Open dashboard</Text>
                <Text style={styles.trackSub}>New orders ring a bell while the app is open</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={C.gold} />
            </Pressable>
          ) : null}

          {session && active ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`Track order ${active.order_number}`}
              onPress={() => {
                tap();
                router.push({ pathname: '/orders/[id]', params: { id: active.id } });
              }}
              style={({ pressed }) => [styles.track, pressed && { transform: [{ scale: 0.98 }] }]}>
              <View style={styles.trackIcon}>
                <Ionicons name="navigate" size={20} color={C.espresso} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.trackTitle}>Track your order</Text>
                <Text style={styles.trackSub}>
                  #{active.order_number} · {ORDER_STATUS_LABEL[active.order_status]}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={C.gold} />
            </Pressable>
          ) : null}

          {/* Offer (only when the owner has an active coupon) */}
          {coupon ? (
            <View style={styles.offer}>
              <Ionicons name="pricetag" size={18} color={C.gold} />
              <Text style={styles.offerText}>
                <Text style={{ fontFamily: F.bodyBlack, color: C.cream }}>{couponLabel(coupon)}</Text> with code{' '}
                <Text style={{ fontFamily: F.bodyBlack, color: C.gold }}>{coupon.code}</Text>
              </Text>
            </View>
          ) : null}

          {/* 2. Categories */}
          <View style={styles.cats}>
            {CATEGORIES.map((c) => (
              <Pressable
                key={c.slug}
                accessibilityRole="button"
                accessibilityLabel={`Browse ${c.name}`}
                onPress={() => {
                  tap();
                  goMenu(c.slug);
                }}
                style={({ pressed }) => [styles.cat, pressed && { transform: [{ scale: 0.94 }] }]}>
                <Image source={imageSource(c.img)} style={styles.catImg} contentFit="cover" alt="" />
                <Text style={styles.catName} numberOfLines={1}>
                  {c.name}
                </Text>
              </Pressable>
            ))}
          </View>

          {/* 3. Premium cakes */}
          <View style={{ gap: 12 }}>
            <SectionTitle eyebrow="Premium" action="See all" onAction={() => router.push('/premium')}>
              Signature Cakes
            </SectionTitle>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.rail} style={styles.bleed}>
              {signature.length
                ? signature.map((cake) => {
                    const price = formatPremiumPrice(cake.price, cake.priceLabel);
                    return (
                      <Pressable
                        key={cake.slug}
                        accessibilityRole="button"
                        accessibilityLabel={`${cake.name}, premium collection`}
                        onPress={() => {
                          tap();
                          router.push('/premium');
                        }}
                        style={({ pressed }) => [styles.sig, pressed && { transform: [{ scale: 0.97 }] }]}>
                        <Image source={imageSource(cake.images[0])} style={[StyleSheet.absoluteFill, { pointerEvents: 'none' }]} contentFit="cover" transition={300} alt={cake.name} />
                        <LinearGradient colors={['transparent', 'rgba(31,20,17,0.85)']} style={styles.sigText}>
                          <Text style={styles.sigName} numberOfLines={1}>
                            {cake.name}
                          </Text>
                          <Text style={styles.sigPrice}>{price ?? 'Price on request'}</Text>
                        </LinearGradient>
                      </Pressable>
                    );
                  })
                : [0, 1, 2].map((i) => <Skeleton key={i} style={{ width: 150, height: 200, borderRadius: R.lg }} />)}
            </ScrollView>
          </View>

          {/* 4. Bestsellers */}
          <View style={{ gap: 12 }}>
            <SectionTitle eyebrow="Most ordered" action="Full menu" onAction={() => goMenu()}>
              Bestsellers
            </SectionTitle>
            <View style={styles.grid}>
              {products
                ? bestsellers.map((p) => <ProductCard key={p.id} product={p} width={cardW} />)
                : [0, 1, 2, 3].map((i) => <Skeleton key={i} style={{ width: cardW, height: 250, borderRadius: R.lg }} />)}
            </View>
          </View>

          {/* 5. Pizza */}
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Order pizza"
            onPress={() => {
              tap();
              goMenu('pizza');
            }}
            style={({ pressed }) => [styles.pizza, pressed && { transform: [{ scale: 0.98 }] }]}>
            <SiteVideo name="promo-pizza" style={StyleSheet.absoluteFill} />
            <LinearGradient start={{ x: 0, y: 0.5 }} end={{ x: 1, y: 0.5 }} colors={['rgba(31,20,17,0.92)', 'rgba(31,20,17,0.35)']} style={StyleSheet.absoluteFill} />
            <View style={{ padding: 20, gap: 4 }}>
              <Text style={styles.pizzaEyebrow}>Hot from our oven</Text>
              <Text style={styles.pizzaTitle}>Veg Pizzas</Text>
              <Text style={styles.pizzaSub}>{pizzaFrom != null ? `Starting at ₹${pizzaFrom}` : 'Freshly made'}</Text>
              <View style={styles.pizzaBtn}>
                <Text style={styles.pizzaBtnText}>Order Pizza</Text>
                <Ionicons name="arrow-forward" size={15} color={C.espresso} />
              </View>
            </View>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: C.page },
  wrap: { padding: 16, paddingTop: 20, paddingBottom: 28, gap: 28, maxWidth: MAX_W, width: '100%', alignSelf: 'center' },
  bleed: { marginHorizontal: -16 },
  rail: { paddingHorizontal: 16, gap: 12 },

  hero: { backgroundColor: C.espresso, overflow: 'hidden' },
  heroTop: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16, maxWidth: MAX_W, width: '100%', alignSelf: 'center' },
  logo: { width: 42, height: 42, borderRadius: 21, borderWidth: 2, borderColor: 'rgba(240,215,167,0.7)' },
  heroBrand: { flex: 1, fontFamily: F.heading, color: C.white, fontSize: 19 },
  heroBody: { position: 'absolute', left: 0, right: 0, bottom: 26, paddingHorizontal: 20, gap: 6, maxWidth: MAX_W, width: '100%', alignSelf: 'center' },
  heroTitle: { color: C.white, fontFamily: F.heading, fontSize: 36, lineHeight: 42 },
  heroSub: { color: C.cream, fontFamily: F.bodyBold, fontSize: 14.5 },

  track: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: C.espresso, borderRadius: R.lg, padding: 14, borderWidth: 1, borderColor: 'rgba(176,141,87,0.4)' },
  trackIcon: { width: 40, height: 40, borderRadius: 20, backgroundColor: C.gold, alignItems: 'center', justifyContent: 'center' },
  trackTitle: { fontFamily: F.bodyBlack, fontSize: 15.5, color: C.cream },
  trackSub: { fontFamily: F.body, fontSize: 13, color: 'rgba(238,225,186,0.8)' },
  offer: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: C.espresso, borderRadius: R.lg, paddingHorizontal: 16, paddingVertical: 12 },
  offerText: { flex: 1, color: 'rgba(238,225,186,0.85)', fontFamily: F.body, fontSize: 14 },

  cats: { flexDirection: 'row', justifyContent: 'space-between' },
  cat: { alignItems: 'center', gap: 8, width: '24%' },
  catImg: { width: 70, height: 70, borderRadius: 35, borderWidth: 2, borderColor: C.goldLine },
  catName: { fontFamily: F.bodyBold, fontSize: 13, color: C.ink },

  sig: { width: 150, height: 200, borderRadius: R.lg, overflow: 'hidden', backgroundColor: C.cream },
  sigText: { position: 'absolute', left: 0, right: 0, bottom: 0, padding: 12, paddingTop: 36 },
  sigName: { color: C.cream, fontFamily: F.heading, fontSize: 15.5 },
  sigPrice: { color: C.gold, fontFamily: F.bodyBold, fontSize: 12, marginTop: 1 },

  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },

  pizza: { height: 170, borderRadius: R.xl, overflow: 'hidden', backgroundColor: C.espresso, justifyContent: 'center' },
  pizzaEyebrow: { color: C.gold, fontFamily: F.bodyBold, fontSize: 10.5, letterSpacing: 2.4, textTransform: 'uppercase' },
  pizzaTitle: { color: C.cream, fontFamily: F.heading, fontSize: 26 },
  pizzaSub: { color: 'rgba(238,225,186,0.85)', fontFamily: F.body, fontSize: 14 },
  pizzaBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, alignSelf: 'flex-start', backgroundColor: C.gold, borderRadius: R.pill, paddingHorizontal: 16, paddingVertical: 8, marginTop: 8 },
  pizzaBtnText: { color: C.espresso, fontFamily: F.bodyBlack, fontSize: 13.5 },
});
