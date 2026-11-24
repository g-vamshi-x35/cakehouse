import Ionicons from '@expo/vector-icons/Ionicons';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useCallback, useEffect, useState } from 'react';
import { Linking, Pressable, RefreshControl, ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import Animated, { FadeIn, FadeInDown, FadeInRight, useAnimatedStyle, useSharedValue, withTiming, Easing } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ProductCard } from '@/components/product-card';
import { SiteVideo } from '@/components/site-video';
import { Button, ErrorState, IconButton, SectionTitle, Skeleton, tap, type IconName } from '@/components/ui';
import { useAuth } from '@/lib/auth';
import { business, callPhone, openWhatsApp } from '@/lib/business';
import { useCart } from '@/lib/cart';
import { GALLERY, LOGO, imageSource } from '@/lib/images';
import { fetchPremiumCakes, formatPremiumPrice, SIGNATURE_SLUGS, type PremiumCake } from '@/lib/premium';
import { couponLabel, fetchBanners, fetchCoupons, fetchFeaturedReviews, fetchProducts, type Banner, type Coupon, type Product, type Review } from '@/lib/products';
import { C, F, MAX_W, R, SHADOW } from '@/lib/theme';

// Same four occasion tiles as the website's "Premium Collections" section.
const COLLECTIONS = [
  { title: 'Celebration Cakes', sub: 'Birthdays & big moments', tag: 'birthday-cakes', img: '/images/stylish/celebration-slice.jpg' },
  { title: 'Chocolate Indulgence', sub: 'Truffle, ganache & more', tag: 'chocolate-cakes', img: '/images/stylish/chocolate-cherry.jpg' },
  { title: 'Anniversary Cakes', sub: 'Made to say it sweetly', tag: 'anniversary-cakes', img: '/images/stylish/red-velvet.jpg' },
  { title: 'Fresh Fruit Cakes', sub: 'Berries, mango & fruit', tag: 'fruit-cakes', img: '/images/stylish/blueberry-cheesecake.jpg' },
];

const WHY: { icon: IconName; title: string; desc: string }[] = [
  { icon: 'leaf-outline', title: '100% Veg & Egg-Free', desc: 'Every cake is made without eggs, using only vegetarian ingredients.' },
  { icon: 'hand-left-outline', title: 'Handcrafted Fresh', desc: 'Baked and decorated by hand in our own kitchen.' },
  { icon: 'color-palette-outline', title: 'Fully Customized', desc: 'Theme, doll and car cakes — designed how you imagine.' },
  { icon: 'bicycle-outline', title: 'Home Delivery', desc: 'Order ahead in the app and we’ll bring it to your door.' },
];

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const { profile } = useAuth();
  const { count } = useCart();
  const { width, height } = useWindowDimensions();
  const contentW = Math.min(width, MAX_W) - 32;
  const cardW = (contentW - 12) / 2;

  const [products, setProducts] = useState<Product[] | null>(null);
  const [premium, setPremium] = useState<PremiumCake[]>([]);
  const [banners, setBanners] = useState<Banner[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [error, setError] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [heroOnScreen, setHeroOnScreen] = useState(true);

  const load = useCallback(
    (fresh = false) =>
      Promise.all([fetchProducts({ fresh }), fetchPremiumCakes(fresh), fetchBanners(), fetchCoupons(), fetchFeaturedReviews()]).then(
        ([p, pc, b, c, r]) => {
          setProducts(p);
          setPremium(pc);
          setBanners(b.filter((x) => x.image_url));
          setCoupons(c);
          setReviews(r);
          setError('');
        },
        () => setError("Couldn't load the bakery. Check your internet connection and try again.")
      ),
    []
  );

  useEffect(() => {
    load();
  }, [load]);

  // Website hero: the video slowly settles from a 1.15 zoom on load.
  const zoom = useSharedValue(1.15);
  useEffect(() => {
    zoom.value = withTiming(1, { duration: 1600, easing: Easing.out(Easing.cubic) });
  }, [zoom]);
  const zoomStyle = useAnimatedStyle(() => ({ transform: [{ scale: zoom.value }] }));

  const all = products ?? [];
  const featured = all.filter((p) => p.isFeatured);
  const newArrivals = all.filter((p) => p.tags.includes('new-arrivals'));
  const designer = all.filter((p) => p.tags.includes('designer-cakes'));
  const pizzaPrices = all.filter((p) => p.categorySlug === 'pizza' && p.price > 0).map((p) => p.price);
  const pizzaFrom = pizzaPrices.length ? Math.min(...pizzaPrices) : null;
  const signature = SIGNATURE_SLUGS.map((s) => premium.find((c) => c.slug === s)).filter(Boolean) as PremiumCake[];

  const firstName = profile?.full_name?.trim().split(/\s+/)[0];
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const heroH = Math.max(520, Math.min(height * 0.78, 700));

  const goMenu = (params?: { category?: string; tag?: string }) => router.navigate({ pathname: '/menu', params: params ?? {} });

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
        onScroll={(e) => setHeroOnScreen(e.nativeEvent.contentOffset.y < heroH - 80)}
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
        {/* ── Hero (website: hero-berry-cake video) ───────────────────── */}
        <View style={[styles.hero, { height: heroH }]}>
          <Animated.View style={[StyleSheet.absoluteFill, zoomStyle]}>
            <SiteVideo name="hero-berry-cake" style={StyleSheet.absoluteFill} active={heroOnScreen} />
          </Animated.View>
          <LinearGradient colors={['rgba(43,26,21,0.55)', 'rgba(43,26,21,0.2)', 'rgba(43,26,21,0.5)', 'rgba(31,20,17,0.94)']} locations={[0, 0.25, 0.55, 1]} style={StyleSheet.absoluteFill} />

          <View style={[styles.heroTop, { paddingTop: insets.top + 8 }]}>
            <Image source={LOGO} style={styles.logo} alt="Cake House logo" />
            <View style={{ flex: 1 }}>
              <Text style={styles.heroBrand}>{firstName ? `${greeting}, ${firstName}` : business.name}</Text>
              <Text style={styles.heroBrandSub}>100% Eggless · Berhampur</Text>
            </View>
            <IconButton icon="bag-handle-outline" label={`Cart, ${count} items`} badge={count} onPress={() => router.push('/cart')} color={C.white} bg="rgba(255,255,255,0.14)" />
          </View>

          <View style={styles.heroBody}>
            <Animated.Text entering={FadeInDown.duration(700).delay(300)} style={styles.heroEyebrow}>
              {business.subBrand}
            </Animated.Text>
            <Animated.Text entering={FadeInDown.duration(800).delay(450)} style={styles.heroTitle} accessibilityRole="header">
              Fresh Cakes,{'\n'}Baked Daily With Love.
            </Animated.Text>
            <Animated.Text entering={FadeInDown.duration(700).delay(600)} style={styles.heroSub}>
              100% vegetarian, 100% egg-free custom cakes, birthday cakes, wedding cakes & snacks — handcrafted fresh in Berhampur.
            </Animated.Text>
            <Animated.View entering={FadeInDown.duration(700).delay(750)} style={{ flexDirection: 'row', gap: 10, marginTop: 10 }}>
              <Button title="Order Now" icon="bag-handle-outline" onPress={() => goMenu()} style={{ flex: 1 }} />
              <Button title="Premium Cakes" variant="light" onPress={() => router.push('/premium')} style={{ flex: 1 }} />
            </Animated.View>
          </View>
        </View>

        <View style={styles.wrap}>
          {/* Craft stats floating over the hero edge */}
          <Animated.View entering={FadeInDown.duration(600).delay(900)} style={styles.stats}>
            {[
              ['100%', 'Eggless'],
              ['Same-day', 'Fresh bakes'],
              ['Hand', 'Decorated'],
            ].map(([a, b], i) => (
              <View key={b} style={[styles.stat, i > 0 && styles.statDivider]}>
                <Text style={styles.statBig}>{a}</Text>
                <Text style={styles.statSmall}>{b}</Text>
              </View>
            ))}
          </Animated.View>

          {/* ── Offers ─────────────────────────────────────────────────── */}
          {(coupons.length > 0 || banners.length > 0) && (
            <View style={{ gap: 12 }}>
              <SectionTitle eyebrow="Offers">Today at Cake House</SectionTitle>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.rail} style={styles.bleed}>
                {coupons.map((c, i) => (
                  <Animated.View key={c.id} entering={FadeInRight.duration(450).delay(i * 80)} style={[styles.offer, { backgroundColor: C.espresso }]}>
                    <Text style={styles.offerEyebrow}>Coupon</Text>
                    <Text style={styles.offerBig}>{couponLabel(c)}</Text>
                    <Text style={styles.offerSub}>{Number(c.min_order_amount) > 0 ? `On orders above ₹${Number(c.min_order_amount)}` : 'On your order'}</Text>
                    <View style={styles.code}>
                      <Ionicons name="pricetag" size={12} color={C.espresso} />
                      <Text style={styles.codeText} selectable>
                        {c.code}
                      </Text>
                    </View>
                  </Animated.View>
                ))}
                {banners.map((b) => (
                  <Pressable key={b.id} onPress={() => b.link_url && Linking.openURL(b.link_url)} style={[styles.offer, { padding: 0, overflow: 'hidden', backgroundColor: C.cream }]}>
                    <Image source={imageSource(b.image_url)} style={[StyleSheet.absoluteFill, { pointerEvents: 'none' }]} contentFit="cover" alt={b.title ?? 'Offer'} />
                    {b.title ? (
                      <LinearGradient colors={['transparent', 'rgba(31,20,17,0.85)']} style={styles.bannerText}>
                        <Text style={styles.offerTitle} numberOfLines={1}>
                          {b.title}
                        </Text>
                      </LinearGradient>
                    ) : null}
                  </Pressable>
                ))}
              </ScrollView>
            </View>
          )}

          {/* ── Why choose us ──────────────────────────────────────────── */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.rail} style={styles.bleed}>
            {WHY.map((w) => (
              <View key={w.title} style={styles.why}>
                <View style={styles.whyIcon}>
                  <Ionicons name={w.icon} size={20} color={C.gold} />
                </View>
                <Text style={styles.whyTitle}>{w.title}</Text>
                <Text style={styles.whyDesc}>{w.desc}</Text>
              </View>
            ))}
          </ScrollView>
        </View>

        {/* ── Signature Cakes (espresso band) ─────────────────────────── */}
        <View style={styles.dark}>
          <View style={styles.darkInner}>
            <Text style={styles.goldEyebrow}>Signature Cakes</Text>
            <Text style={styles.darkTitle}>
              Our Most <Text style={styles.goldItalic}>Loved</Text> Creations
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.rail} style={[styles.bleed, { marginTop: 18 }]} snapToInterval={width * 0.62 + 14} decelerationRate="fast">
              {signature.length
                ? signature.map((cake, i) => {
                    const price = formatPremiumPrice(cake.price, cake.priceLabel);
                    return (
                      <Animated.View key={cake.slug} entering={FadeIn.duration(500).delay(i * 80)}>
                        <Pressable
                          accessibilityRole="button"
                          accessibilityLabel={`${cake.name}, premium collection`}
                          onPress={() => {
                            tap();
                            router.push('/premium');
                          }}
                          style={({ pressed }) => [styles.sig, { width: width * 0.62 }, pressed && { transform: [{ scale: 0.97 }] }]}>
                          <Image source={imageSource(cake.images[0])} style={[StyleSheet.absoluteFill, { pointerEvents: 'none' }]} contentFit="cover" transition={300} alt={cake.name} />
                          <LinearGradient colors={['transparent', 'transparent', 'rgba(31,20,17,0.85)']} style={StyleSheet.absoluteFill} />
                          <View style={styles.sigText}>
                            <Text style={styles.sigName}>{cake.name}</Text>
                            <Text style={styles.sigPrice}>{price ?? 'Price on request'}</Text>
                          </View>
                        </Pressable>
                      </Animated.View>
                    );
                  })
                : [0, 1].map((i) => <Skeleton key={i} style={{ width: width * 0.62, aspectRatio: 0.75, borderRadius: R.xl, backgroundColor: C.espressoSoft }} />)}
            </ScrollView>
            <Pressable onPress={() => router.push('/premium')} style={styles.darkLink} accessibilityRole="button">
              <Text style={styles.darkLinkText}>View the premium collection</Text>
              <Ionicons name="arrow-forward" size={16} color={C.gold} />
            </Pressable>
          </View>
        </View>

        <View style={styles.wrap}>
          {/* ── Premium Collections ─────────────────────────────────────── */}
          <View style={{ gap: 14, alignItems: 'center' }}>
            <Text style={styles.goldEyebrow}>Premium Collections</Text>
            <Text style={styles.centerTitle}>
              Crafted For Every <Text style={styles.brownItalic}>Occasion</Text>
            </Text>
            <View style={styles.goldRule} />
            <View style={styles.tiles}>
              {COLLECTIONS.map((t, i) => {
                const big = i === 0;
                const wide = i === 3;
                const w = big || wide ? contentW : cardW;
                return (
                  <Animated.View key={t.tag} entering={FadeInDown.duration(500).delay(i * 80)}>
                    <Pressable
                      accessibilityRole="button"
                      accessibilityLabel={`${t.title}: ${t.sub}`}
                      onPress={() => {
                        tap();
                        goMenu({ tag: t.tag });
                      }}
                      style={({ pressed }) => [styles.tile, { width: w, height: big ? w * 0.72 : wide ? w * 0.5 : w * 1.3 }, pressed && { transform: [{ scale: 0.98 }] }]}>
                      <Image source={imageSource(t.img)} style={[StyleSheet.absoluteFill, { pointerEvents: 'none' }]} contentFit="cover" alt="" />
                      <LinearGradient colors={['transparent', 'rgba(31,20,17,0.15)', 'rgba(31,20,17,0.85)']} style={StyleSheet.absoluteFill} />
                      <View style={styles.tileText}>
                        <Text style={styles.tileSub} numberOfLines={1}>
                          {t.sub}
                        </Text>
                        <Text style={[styles.tileTitle, big && { fontSize: 28 }]}>{t.title}</Text>
                        <Text style={styles.tileExplore}>Explore</Text>
                      </View>
                    </Pressable>
                  </Animated.View>
                );
              })}
            </View>
          </View>

          {/* ── Bestsellers ─────────────────────────────────────────────── */}
          <View style={{ gap: 12 }}>
            <SectionTitle eyebrow="Fan Favourites" action="View menu" onAction={() => goMenu({ category: 'regular-cakes' })}>
              Our Bestselling Cakes
            </SectionTitle>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.rail} style={styles.bleed}>
              {products
                ? (featured.length ? featured : all.slice(0, 6)).map((p) => <ProductCard key={p.id} product={p} width={172} />)
                : [0, 1, 2].map((i) => <Skeleton key={i} style={{ width: 172, height: 260, borderRadius: R.lg }} />)}
            </ScrollView>
          </View>

          {/* ── The Craft (craft-cake-slice video) ──────────────────────── */}
          <View style={{ gap: 14 }}>
            <View>
              <SiteVideo name="craft-cake-slice" style={styles.craftVideo} />
              <Image source={imageSource('/images/stylish/cream-piping.jpg')} style={styles.craftInset} contentFit="cover" alt="Piping fresh cream by hand" />
            </View>
            <Text style={[styles.goldEyebrow, { marginTop: 18 }]}>The Craft</Text>
            <Text style={styles.craftTitle}>
              Baked Fresh.{'\n'}
              <Text style={styles.brownItalic}>Finished By Hand.</Text>
            </Text>
            <Text style={styles.body}>
              Every layer is baked the same day, every rosette piped by hand, every cake finished with care — 100% vegetarian and completely egg-free.
            </Text>
            <Button title="Design Your Cake" icon="color-palette-outline" onPress={() => router.navigate('/custom-cake')} />
          </View>

          {newArrivals.length > 0 && <Rail eyebrow="Just Added" title="New Arrivals" items={newArrivals} onAll={() => goMenu({ tag: 'new-arrivals' })} />}
        </View>

        {/* ── Pizza promo (promo-pizza video) ─────────────────────────── */}
        <View style={styles.pizza}>
          <SiteVideo name="promo-pizza" style={StyleSheet.absoluteFill} />
          <LinearGradient start={{ x: 0, y: 0.5 }} end={{ x: 1, y: 0.5 }} colors={['rgba(31,20,17,0.92)', 'rgba(31,20,17,0.6)', 'rgba(31,20,17,0.25)']} style={StyleSheet.absoluteFill} />
          <View style={styles.pizzaBody}>
            <Text style={styles.goldEyebrow}>Hot From Our Oven</Text>
            <Text style={styles.darkTitle}>
              Freshly Made{'\n'}
              <Text style={styles.goldItalic}>Veg Pizzas</Text>
            </Text>
            <Text style={styles.pizzaSub}>
              Hand-stretched dough, rich tomato sauce and loads of cheese.
              {pizzaFrom != null ? (
                <Text>
                  {' '}Starting at just <Text style={{ color: C.gold, fontFamily: F.bodyBlack }}>₹{pizzaFrom}</Text>.
                </Text>
              ) : null}
            </Text>
            <Pressable
              accessibilityRole="button"
              onPress={() => {
                tap();
                goMenu({ category: 'pizza' });
              }}
              style={({ pressed }) => [styles.goldBtn, pressed && { backgroundColor: C.cream }]}>
              <Text style={styles.goldBtnText}>Order Pizza</Text>
            </Pressable>
          </View>
        </View>

        <View style={styles.wrap}>
          {designer.length > 0 && <Rail eyebrow="Something Special" title="Designer Cakes" items={designer} onAll={() => goMenu({ tag: 'designer-cakes' })} />}

          {reviews.length > 0 && (
            <View style={{ gap: 12 }}>
              <SectionTitle eyebrow="Customer Reviews">What Our Customers Say</SectionTitle>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.rail} style={styles.bleed}>
                {reviews.map((r) => (
                  <View key={r.id} style={styles.review}>
                    <View style={{ flexDirection: 'row', gap: 2 }}>
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Ionicons key={s} name={s <= r.rating ? 'star' : 'star-outline'} size={14} color={C.gold} />
                      ))}
                    </View>
                    <Text style={styles.reviewText} numberOfLines={5}>
                      “{r.comment}”
                    </Text>
                    <Text style={styles.reviewAuthor}>{r.author}</Text>
                  </View>
                ))}
              </ScrollView>
            </View>
          )}

          <View style={{ gap: 12 }}>
            <SectionTitle eyebrow="Gallery">Fresh From Our Kitchen</SectionTitle>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.rail} style={styles.bleed}>
              {GALLERY.map((g, i) => (
                <Image key={i} source={g} style={[styles.gallery, i % 2 === 1 && { height: 150, marginTop: 30 }]} contentFit="cover" alt="Cake by Cake House" />
              ))}
            </ScrollView>
          </View>

          {/* ── Visit / CTA ─────────────────────────────────────────────── */}
          <View style={styles.visit}>
            <Text style={styles.goldEyebrow}>Visit Us</Text>
            <Text style={styles.visitTitle}>Order ahead, or drop by the bakery</Text>
            <View style={styles.visitRow}>
              <Ionicons name="location-outline" size={18} color={C.gold} />
              <Text style={styles.visitText}>{business.address}</Text>
            </View>
            <View style={styles.visitRow}>
              <Ionicons name="time-outline" size={18} color={C.gold} />
              <Text style={styles.visitText}>{business.hours}</Text>
            </View>
            <View style={{ flexDirection: 'row', gap: 10, marginTop: 4 }}>
              <Button title="Call" icon="call-outline" size="sm" onPress={() => callPhone(business.phones[0])} style={{ flex: 1 }} />
              <Button title="WhatsApp" icon="logo-whatsapp" variant="whatsapp" size="sm" onPress={() => openWhatsApp(`Hi ${business.name}!`)} style={{ flex: 1 }} />
              <Button title="Map" icon="navigate-outline" variant="light" size="sm" onPress={() => Linking.openURL(business.mapsUrl)} style={{ flex: 1 }} />
            </View>
          </View>
          <Text style={styles.footer}>
            {business.name} · {business.tagline}
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

function Rail({ eyebrow, title, items, onAll }: { eyebrow: string; title: string; items: Product[]; onAll: () => void }) {
  return (
    <View style={{ gap: 12 }}>
      <SectionTitle eyebrow={eyebrow} action="View all" onAction={onAll}>
        {title}
      </SectionTitle>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.rail} style={styles.bleed}>
        {items.slice(0, 8).map((p) => (
          <ProductCard key={p.id} product={p} width={172} />
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: C.page },
  wrap: { padding: 16, paddingVertical: 24, gap: 30, maxWidth: MAX_W, width: '100%', alignSelf: 'center' },
  bleed: { marginHorizontal: -16 },
  rail: { paddingHorizontal: 16, gap: 12 },

  hero: { backgroundColor: C.espresso, overflow: 'hidden' },
  heroTop: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16, maxWidth: MAX_W, width: '100%', alignSelf: 'center' },
  logo: { width: 44, height: 44, borderRadius: 22, borderWidth: 2, borderColor: 'rgba(240,215,167,0.7)' },
  heroBrand: { fontFamily: F.heading, color: C.white, fontSize: 19 },
  heroBrandSub: { fontFamily: F.body, color: 'rgba(238,225,186,0.85)', fontSize: 12 },
  heroBody: { position: 'absolute', left: 0, right: 0, bottom: 82, paddingHorizontal: 20, gap: 8, maxWidth: MAX_W, width: '100%', alignSelf: 'center' },
  heroEyebrow: { color: C.cream, fontFamily: F.bodyBold, fontSize: 11.5, letterSpacing: 3.6, textTransform: 'uppercase' },
  heroTitle: { color: C.white, fontFamily: F.heading, fontSize: 38, lineHeight: 44 },
  heroSub: { color: 'rgba(238,225,186,0.9)', fontFamily: F.body, fontSize: 14.5, lineHeight: 22 },

  stats: {
    flexDirection: 'row',
    backgroundColor: C.surface,
    borderRadius: R.xl,
    marginTop: -58,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: C.goldLine,
    boxShadow: SHADOW.lifted,
  },
  stat: { flex: 1, alignItems: 'center', gap: 2 },
  statDivider: { borderLeftWidth: 1, borderLeftColor: C.goldLine },
  statBig: { fontFamily: F.heading, fontSize: 19, color: C.brown },
  statSmall: { fontFamily: F.body, fontSize: 12, color: C.muted },

  offer: { width: 220, height: 140, borderRadius: R.lg, padding: 16, gap: 3 },
  offerEyebrow: { color: C.gold, fontFamily: F.bodyBold, fontSize: 10.5, letterSpacing: 2.4, textTransform: 'uppercase' },
  offerBig: { color: C.cream, fontFamily: F.heading, fontSize: 28 },
  offerSub: { color: 'rgba(255,255,255,0.8)', fontFamily: F.body, fontSize: 12.5 },
  offerTitle: { color: C.white, fontFamily: F.heading, fontSize: 17 },
  bannerText: { position: 'absolute', left: 0, right: 0, bottom: 0, padding: 12, paddingTop: 30 },
  code: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: C.gold, alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 5, borderRadius: R.pill, marginTop: 'auto' },
  codeText: { fontFamily: F.bodyBlack, color: C.espresso, letterSpacing: 1.5 },

  why: { width: 170, backgroundColor: C.surface, borderRadius: R.lg, padding: 14, gap: 6, borderWidth: 1, borderColor: C.border },
  whyIcon: { width: 40, height: 40, borderRadius: 20, backgroundColor: C.goldSoft, alignItems: 'center', justifyContent: 'center' },
  whyTitle: { fontFamily: F.heading, fontSize: 15, color: C.brown },
  whyDesc: { fontFamily: F.body, fontSize: 12.5, color: C.muted, lineHeight: 18 },

  dark: { backgroundColor: C.espresso, paddingVertical: 34 },
  darkInner: { paddingHorizontal: 16, maxWidth: MAX_W, width: '100%', alignSelf: 'center' },
  goldEyebrow: { color: C.gold, fontFamily: F.bodyBold, fontSize: 11, letterSpacing: 4, textTransform: 'uppercase', marginBottom: 6 },
  darkTitle: { color: C.cream, fontFamily: F.heading, fontSize: 31, lineHeight: 38 },
  goldItalic: { color: C.gold, fontFamily: F.headingItalic },
  brownItalic: { color: C.brown, fontFamily: F.headingItalic },
  sig: { aspectRatio: 0.75, borderRadius: R.xl, overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(176,141,87,0.25)', backgroundColor: C.espressoSoft },
  sigText: { position: 'absolute', left: 0, right: 0, bottom: 0, padding: 16 },
  sigName: { color: C.cream, fontFamily: F.heading, fontSize: 20 },
  sigPrice: { color: C.gold, fontFamily: F.bodyBold, fontSize: 13.5, marginTop: 2 },
  darkLink: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 18 },
  darkLinkText: { color: 'rgba(240,215,167,0.9)', fontFamily: F.bodyBold, fontSize: 14.5 },

  centerTitle: { fontFamily: F.heading, fontSize: 30, lineHeight: 37, color: C.espresso, textAlign: 'center' },
  goldRule: { width: 60, height: 1, backgroundColor: 'rgba(176,141,87,0.6)', marginBottom: 6 },
  tiles: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  tile: { borderRadius: R.xl, overflow: 'hidden', backgroundColor: C.cream, justifyContent: 'flex-end', borderCurve: 'continuous' },
  tileText: { padding: 16 },
  tileSub: { color: C.gold, fontFamily: F.bodyBold, fontSize: 9.5, letterSpacing: 1.6, textTransform: 'uppercase', marginBottom: 3 },
  tileTitle: { color: C.cream, fontFamily: F.heading, fontSize: 19, lineHeight: 24 },
  tileExplore: {
    alignSelf: 'flex-start',
    marginTop: 8,
    color: 'rgba(240,215,167,0.85)',
    fontFamily: F.bodyBold,
    fontSize: 12.5,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(176,141,87,0.6)',
    paddingBottom: 1,
  },

  craftVideo: { aspectRatio: 16 / 10, borderRadius: R.xl, boxShadow: '0 24px 50px -20px rgba(31,20,17,0.55)' },
  craftInset: { position: 'absolute', right: 10, bottom: -26, width: 96, height: 128, borderRadius: R.lg, borderWidth: 5, borderColor: C.page },
  craftTitle: { fontFamily: F.heading, fontSize: 31, lineHeight: 38, color: C.espresso, marginTop: -6 },
  body: { fontFamily: F.body, fontSize: 15, color: C.muted, lineHeight: 23 },

  pizza: { minHeight: 380, justifyContent: 'center', backgroundColor: C.espresso, overflow: 'hidden' },
  pizzaBody: { paddingHorizontal: 20, paddingVertical: 40, maxWidth: MAX_W, width: '100%', alignSelf: 'center', gap: 4 },
  pizzaSub: { color: 'rgba(238,225,186,0.82)', fontFamily: F.body, fontSize: 14.5, lineHeight: 22, maxWidth: 300, marginTop: 8, marginBottom: 18 },
  goldBtn: { alignSelf: 'flex-start', backgroundColor: C.gold, borderRadius: R.pill, paddingHorizontal: 28, paddingVertical: 14 },
  goldBtnText: { color: C.espresso, fontFamily: F.bodyBlack, fontSize: 15, letterSpacing: 0.4 },

  review: { width: 260, backgroundColor: C.surface, borderRadius: R.lg, padding: 16, gap: 8, borderWidth: 1, borderColor: C.goldLine },
  reviewText: { fontFamily: F.headingItalic, fontSize: 14.5, color: C.ink, lineHeight: 21 },
  reviewAuthor: { fontFamily: F.bodyBold, color: C.brown, fontSize: 13.5 },
  gallery: { width: 150, height: 180, borderRadius: R.lg },

  visit: { backgroundColor: C.espresso, borderRadius: R.xl, padding: 20, gap: 10 },
  visitTitle: { fontFamily: F.heading, fontSize: 22, color: C.cream, lineHeight: 28, marginBottom: 4 },
  visitRow: { flexDirection: 'row', gap: 10, alignItems: 'flex-start' },
  visitText: { flex: 1, fontFamily: F.body, fontSize: 14, color: 'rgba(238,225,186,0.85)', lineHeight: 20 },
  footer: { textAlign: 'center', fontFamily: F.headingItalic, color: C.muted, fontSize: 13 },
});
