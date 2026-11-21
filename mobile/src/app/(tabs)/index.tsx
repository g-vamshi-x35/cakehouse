import Ionicons from '@expo/vector-icons/Ionicons';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { Linking, Pressable, RefreshControl, ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import Animated, { FadeInDown, FadeInRight } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppHeader } from '@/components/app-header';
import { ProductCard } from '@/components/product-card';
import { Button, Card, ErrorState, SectionTitle, Skeleton, tap, type IconName } from '@/components/ui';
import { useAuth } from '@/lib/auth';
import { business, callPhone, openWhatsApp } from '@/lib/business';
import { GALLERY, HERO, MENU_IMAGES, imageSource } from '@/lib/images';
import {
  couponLabel,
  fetchBanners,
  fetchCoupons,
  fetchFeaturedReviews,
  fetchProducts,
  type Banner,
  type Coupon,
  type Product,
  type Review,
} from '@/lib/products';
import { C, F, MAX_W, R, SHADOW } from '@/lib/theme';

const WHY: { icon: IconName; title: string; desc: string }[] = [
  { icon: 'leaf-outline', title: '100% Veg & Egg-Free', desc: 'Every cake is made without eggs, using only vegetarian ingredients.' },
  { icon: 'hand-left-outline', title: 'Handcrafted Fresh', desc: 'Baked and decorated by hand in our own kitchen — nothing off a shelf.' },
  { icon: 'color-palette-outline', title: 'Fully Customized', desc: 'Theme cakes, doll cakes, car cakes — designed exactly how you imagine.' },
  { icon: 'bicycle-outline', title: 'Home Delivery', desc: 'Order ahead in the app, on WhatsApp or by phone and we’ll get it to your door.' },
];

const CATEGORY_TILES = [
  { slug: 'regular-cakes', name: 'Cakes', image: MENU_IMAGES.fruit },
  { slug: 'customized-cakes', name: 'Customized', image: MENU_IMAGES.doll },
  { slug: 'pizza', name: 'Pizza', image: imageSource('/images/products/pizza/cheese-pizza/1.jpg') },
  { slug: 'snacks', name: 'Samosa & Patties', image: imageSource('/images/products/snacks/samosa/1.jpg') },
];

export default function HomeScreen() {
  const { profile } = useAuth();
  const { width } = useWindowDimensions();
  const contentW = Math.min(width, MAX_W) - 32;
  const cardW = (contentW - 12) / 2;

  const [products, setProducts] = useState<Product[] | null>(null);
  const [banners, setBanners] = useState<Banner[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [error, setError] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(
    (fresh = false) =>
      Promise.all([fetchProducts({ fresh }), fetchBanners(), fetchCoupons(), fetchFeaturedReviews()]).then(
        ([p, b, c, r]) => {
          setProducts(p);
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

  const featured = (products ?? []).filter((p) => p.isFeatured);
  const bestsellers = featured.length ? featured : (products ?? []).filter((p) => p.categorySlug === 'regular-cakes').slice(0, 6);
  const popular = (products ?? [])
    .filter((p) => !bestsellers.includes(p) && !p.isCustomCake)
    .sort((a, b) => b.reviewCount - a.reviewCount || b.avgRating - a.avgRating)
    .slice(0, 4);

  const firstName = profile?.full_name?.trim().split(/\s+/)[0];
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  const goMenu = (category?: string) => router.navigate({ pathname: '/menu', params: category ? { category } : {} });

  if (error && !products) {
    return (
      <SafeAreaView style={styles.page} edges={['top']}>
        <ErrorState message={error} onRetry={() => load(true)} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.page} edges={['top']}>
      <ScrollView
        contentContainerStyle={styles.wrap}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            tintColor={C.rose}
            colors={[C.rose]}
            onRefresh={async () => {
              setRefreshing(true);
              await load(true);
              setRefreshing(false);
            }}
          />
        }>
        <AppHeader title={firstName ? `${greeting}, ${firstName}` : business.name} />

        {/* Hero — same copy and imagery as the website hero */}
        <Animated.View entering={FadeInDown.duration(600)} style={styles.hero}>
          <Image source={HERO} style={[StyleSheet.absoluteFill, { pointerEvents: 'none' }]} contentFit="cover" contentPosition={{ left: '65%', top: '30%' }} alt="" />
          <LinearGradient colors={['rgba(43,26,21,0.1)', 'rgba(43,26,21,0.55)', 'rgba(43,26,21,0.92)']} style={StyleSheet.absoluteFill} />
          <View style={styles.heroBody}>
            <Text style={styles.heroEyebrow}>{business.subBrand}</Text>
            <Text style={styles.heroTitle}>Fresh Cakes,{'\n'}Baked Daily With Love.</Text>
            <Text style={styles.heroSub} numberOfLines={2}>
              100% vegetarian, 100% egg-free cakes & snacks — handcrafted fresh in Berhampur.
            </Text>
            <View style={{ flexDirection: 'row', gap: 10, marginTop: 6 }}>
              <Button title="Order Now" icon="bag-handle-outline" size="sm" onPress={() => goMenu()} />
              <Button title="Custom Cake" variant="light" size="sm" onPress={() => router.navigate('/custom-cake')} />
            </View>
          </View>
        </Animated.View>

        {/* Offers */}
        <View style={{ gap: 12 }}>
          <SectionTitle eyebrow="Offers & Updates">Today at Cake House</SectionTitle>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.rail} style={styles.bleed}>
            {banners.map((b, i) => (
              <Animated.View key={b.id} entering={FadeInRight.duration(450).delay(i * 80)}>
                <Pressable
                  accessibilityRole={b.link_url ? 'link' : undefined}
                  onPress={() => b.link_url && Linking.openURL(b.link_url)}
                  style={[styles.offer, { backgroundColor: C.creamLight, padding: 0, overflow: 'hidden' }]}>
                  <Image source={imageSource(b.image_url)} style={[StyleSheet.absoluteFill, { pointerEvents: 'none' }]} contentFit="cover" alt={b.title ?? 'Offer'} />
                  {b.title ? (
                    <LinearGradient colors={['transparent', 'rgba(43,26,21,0.85)']} style={styles.bannerText}>
                      <Text style={styles.offerTitleLight} numberOfLines={1}>
                        {b.title}
                      </Text>
                      {b.subtitle ? (
                        <Text style={styles.offerSubLight} numberOfLines={1}>
                          {b.subtitle}
                        </Text>
                      ) : null}
                    </LinearGradient>
                  ) : null}
                </Pressable>
              </Animated.View>
            ))}
            {coupons.map((c, i) => (
              <Animated.View key={c.id} entering={FadeInRight.duration(450).delay((banners.length + i) * 80)}>
                <View style={[styles.offer, { backgroundColor: C.brown }]}>
                  <Text style={styles.offerBig}>{couponLabel(c)}</Text>
                  <Text style={styles.offerSubLight}>
                    {Number(c.min_order_amount) > 0 ? `On orders above ₹${Number(c.min_order_amount)}` : 'On your order'}
                  </Text>
                  <View style={styles.code}>
                    <Ionicons name="pricetag" size={13} color={C.brown} />
                    <Text style={styles.codeText} selectable>
                      {c.code}
                    </Text>
                  </View>
                </View>
              </Animated.View>
            ))}
            <OfferCard
              tone={C.rose}
              icon="color-palette"
              title="Design your dream cake"
              sub="Upload a photo — we’ll quote you fast"
              onPress={() => router.navigate('/custom-cake')}
            />
            <OfferCard
              tone={C.brownDark}
              icon="gift"
              title="Birthday treat"
              sub="Add your birthday to your profile for a yearly surprise"
              onPress={() => router.navigate('/account')}
            />
            <OfferCard
              tone="#128C4A"
              icon="logo-whatsapp"
              title="Order on WhatsApp"
              sub="Questions? Chat with the bakery"
              onPress={() => openWhatsApp(`Hi ${business.name}! I'd like to place an order.`)}
            />
          </ScrollView>
        </View>

        {/* Categories */}
        <View style={{ gap: 12 }}>
          <SectionTitle eyebrow="Our Menu" action="See all" onAction={() => goMenu()}>
            Shop by Category
          </SectionTitle>
          <View style={styles.catGrid}>
            {CATEGORY_TILES.map((c, i) => (
              <Animated.View key={c.slug} entering={FadeInDown.duration(450).delay(i * 70)} style={{ width: cardW }}>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={`Browse ${c.name}`}
                  onPress={() => {
                    tap();
                    goMenu(c.slug);
                  }}
                  style={({ pressed }) => [styles.cat, pressed && { transform: [{ scale: 0.97 }] }]}>
                  {c.image ? <Image source={c.image} style={[StyleSheet.absoluteFill, { pointerEvents: 'none' }]} contentFit="cover" alt="" /> : null}
                  <LinearGradient colors={['transparent', 'rgba(43,26,21,0.82)']} style={StyleSheet.absoluteFill} />
                  <Text style={styles.catName}>{c.name}</Text>
                </Pressable>
              </Animated.View>
            ))}
          </View>
        </View>

        {/* Bestsellers */}
        <View style={{ gap: 12 }}>
          <SectionTitle eyebrow="Fan Favourites" action="View menu" onAction={() => goMenu('regular-cakes')}>
            Our Bestselling Cakes
          </SectionTitle>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.rail} style={styles.bleed}>
            {products
              ? bestsellers.map((p) => <ProductCard key={p.id} product={p} width={172} />)
              : [0, 1, 2].map((i) => <Skeleton key={i} style={{ width: 172, height: 260, borderRadius: R.lg }} />)}
          </ScrollView>
        </View>

        {/* Popular */}
        {popular.length > 0 && (
          <View style={{ gap: 12 }}>
            <SectionTitle eyebrow="Popular Picks">Loved by Berhampur</SectionTitle>
            <View style={styles.grid}>
              {popular.map((p) => (
                <ProductCard key={p.id} product={p} width={cardW} />
              ))}
            </View>
            <Button title="View Full Menu" variant="outline" icon="restaurant-outline" onPress={() => goMenu()} />
          </View>
        )}

        {/* Why choose us */}
        <View style={{ gap: 12 }}>
          <SectionTitle eyebrow="Why Cake House">Baked With Care</SectionTitle>
          <View style={styles.grid}>
            {WHY.map((w) => (
              <View key={w.title} style={[styles.why, { width: cardW }]}>
                <View style={styles.whyIcon}>
                  <Ionicons name={w.icon} size={22} color={C.rose} />
                </View>
                <Text style={styles.whyTitle}>{w.title}</Text>
                <Text style={styles.whyDesc}>{w.desc}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Reviews (only when there are some, like the website) */}
        {reviews.length > 0 && (
          <View style={{ gap: 12 }}>
            <SectionTitle eyebrow="Customer Reviews">What Our Customers Say</SectionTitle>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.rail} style={styles.bleed}>
              {reviews.map((r) => (
                <View key={r.id} style={styles.review}>
                  <View style={{ flexDirection: 'row', gap: 2 }}>
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Ionicons key={s} name={s <= r.rating ? 'star' : 'star-outline'} size={14} color="#e0a526" />
                    ))}
                  </View>
                  <Text style={styles.reviewText} numberOfLines={5}>
                    “{r.comment}”
                  </Text>
                  <Text style={styles.reviewAuthor}>{r.author}</Text>
                  {r.productName ? <Text style={styles.reviewProduct}>{r.productName}</Text> : null}
                </View>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Gallery */}
        <View style={{ gap: 12 }}>
          <SectionTitle eyebrow="Gallery">Fresh From Our Kitchen</SectionTitle>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.rail} style={styles.bleed}>
            {GALLERY.map((g, i) => (
              <Image key={i} source={g} style={[styles.gallery, i % 2 === 1 && { height: 150, marginTop: 30 }]} contentFit="cover" alt="Cake by Cake House" />
            ))}
          </ScrollView>
        </View>

        {/* Visit us */}
        <Card style={{ backgroundColor: C.cream, gap: 12 }}>
          <Text style={styles.visitTitle}>Visit or call us</Text>
          <View style={styles.visitRow}>
            <Ionicons name="location-outline" size={18} color={C.brown} />
            <Text style={styles.visitText}>{business.address}</Text>
          </View>
          <View style={styles.visitRow}>
            <Ionicons name="time-outline" size={18} color={C.brown} />
            <Text style={styles.visitText}>{business.hours}</Text>
          </View>
          <View style={{ flexDirection: 'row', gap: 10 }}>
            <Button title="Call" icon="call-outline" variant="dark" size="sm" onPress={() => callPhone(business.phones[0])} style={{ flex: 1 }} />
            <Button title="WhatsApp" icon="logo-whatsapp" variant="whatsapp" size="sm" onPress={() => openWhatsApp(`Hi ${business.name}!`)} style={{ flex: 1 }} />
            <Button title="Map" icon="navigate-outline" variant="outline" size="sm" onPress={() => Linking.openURL(business.mapsUrl)} style={{ flex: 1 }} />
          </View>
        </Card>

        <Text style={styles.footer}>
          {business.name} · {business.tagline}
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

function OfferCard({ tone, icon, title, sub, onPress }: { tone: string; icon: IconName; title: string; sub: string; onPress: () => void }) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={() => {
        tap();
        onPress();
      }}
      style={({ pressed }) => [styles.offer, { backgroundColor: tone }, pressed && { transform: [{ scale: 0.97 }] }]}>
      <View style={styles.offerIcon}>
        <Ionicons name={icon} size={20} color={C.white} />
      </View>
      <Text style={styles.offerTitleLight}>{title}</Text>
      <Text style={styles.offerSubLight} numberOfLines={2}>
        {sub}
      </Text>
      <Ionicons name="arrow-forward" size={16} color={C.white} style={{ marginTop: 'auto' }} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: C.page },
  wrap: { padding: 16, paddingBottom: 32, gap: 28, maxWidth: MAX_W, width: '100%', alignSelf: 'center' },
  bleed: { marginHorizontal: -16 },
  rail: { paddingHorizontal: 16, gap: 12 },
  hero: { height: 360, borderRadius: R.xl, overflow: 'hidden', backgroundColor: C.ink, boxShadow: SHADOW.lifted, borderCurve: 'continuous' },
  heroBody: { position: 'absolute', left: 0, right: 0, bottom: 0, padding: 20, gap: 8 },
  heroEyebrow: { color: C.cream, fontFamily: F.bodyBold, fontSize: 11, letterSpacing: 3, textTransform: 'uppercase' },
  heroTitle: { color: C.white, fontFamily: F.heading, fontSize: 30, lineHeight: 36 },
  heroSub: { color: 'rgba(238,225,186,0.92)', fontFamily: F.body, fontSize: 14, lineHeight: 20 },
  offer: { width: 230, height: 150, borderRadius: R.lg, padding: 16, gap: 4, borderCurve: 'continuous' },
  offerIcon: { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center', marginBottom: 4 },
  offerTitleLight: { color: C.white, fontFamily: F.heading, fontSize: 17 },
  offerSubLight: { color: 'rgba(255,255,255,0.85)', fontFamily: F.body, fontSize: 12.5, lineHeight: 17 },
  offerBig: { color: C.cream, fontFamily: F.heading, fontSize: 30 },
  bannerText: { position: 'absolute', left: 0, right: 0, bottom: 0, padding: 12, paddingTop: 30 },
  code: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: C.cream, alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 5, borderRadius: R.pill, marginTop: 'auto' },
  codeText: { fontFamily: F.bodyBlack, color: C.brown, letterSpacing: 1.5 },
  catGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  cat: { height: 120, borderRadius: R.lg, overflow: 'hidden', justifyContent: 'flex-end', padding: 12, backgroundColor: C.cream, borderCurve: 'continuous' },
  catName: { color: C.white, fontFamily: F.heading, fontSize: 18 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  why: { backgroundColor: C.surface, borderRadius: R.lg, padding: 14, gap: 6, borderWidth: 1, borderColor: C.border },
  whyIcon: { width: 44, height: 44, borderRadius: 22, backgroundColor: C.roseSoft, alignItems: 'center', justifyContent: 'center', marginBottom: 2 },
  whyTitle: { fontFamily: F.heading, fontSize: 15.5, color: C.brown },
  whyDesc: { fontFamily: F.body, fontSize: 12.5, color: C.muted, lineHeight: 18 },
  review: { width: 260, backgroundColor: C.surface, borderRadius: R.lg, padding: 16, gap: 8, borderWidth: 1, borderColor: C.border },
  reviewText: { fontFamily: F.headingItalic, fontSize: 14.5, color: C.ink, lineHeight: 21 },
  reviewAuthor: { fontFamily: F.bodyBold, color: C.brown, fontSize: 13.5 },
  reviewProduct: { fontFamily: F.body, color: C.muted, fontSize: 12 },
  gallery: { width: 150, height: 180, borderRadius: R.lg },
  visitTitle: { fontFamily: F.heading, fontSize: 20, color: C.brown },
  visitRow: { flexDirection: 'row', gap: 10, alignItems: 'flex-start' },
  visitText: { flex: 1, fontFamily: F.body, fontSize: 14.5, color: C.ink, lineHeight: 20 },
  footer: { textAlign: 'center', fontFamily: F.headingItalic, color: C.muted, fontSize: 13 },
});
