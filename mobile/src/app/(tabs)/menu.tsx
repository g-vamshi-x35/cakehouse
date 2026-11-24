import Ionicons from '@expo/vector-icons/Ionicons';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { FlatList, Pressable, RefreshControl, ScrollView, StyleSheet, Text, TextInput, View, useWindowDimensions } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppHeader } from '@/components/app-header';
import { CartBar } from '@/components/cart-bar';
import { ProductCard } from '@/components/product-card';
import { Chip, EmptyState, ErrorState, Skeleton, tap } from '@/components/ui';
import { imageSource } from '@/lib/images';
import { CATEGORIES, fetchProducts, tagLabel, type Product } from '@/lib/products';
import { C, F, MAX_W, R } from '@/lib/theme';


export default function MenuScreen() {
  const params = useLocalSearchParams<{ category?: string; tag?: string }>();
  const [products, setProducts] = useState<Product[] | null>(null);
  const [error, setError] = useState('');
  const [category, setCategory] = useState(params.category ?? 'all');
  const [tag, setTag] = useState<string | null>(params.tag ?? null);
  const [query, setQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const { width } = useWindowDimensions();
  const cardW = (Math.min(width, MAX_W) - 16 * 2 - 12) / 2;

  // Category chosen on the Home screen.
  // Category / occasion chosen on the Home screen.
  const paramKey = `${params.category ?? ''}|${params.tag ?? ''}`;
  const [lastParam, setLastParam] = useState(paramKey);
  if (paramKey !== lastParam) {
    setLastParam(paramKey);
    if (params.category) setCategory(params.category);
    if (params.tag) {
      setTag(params.tag);
      setCategory('all');
    } else if (params.category) setTag(null);
  }

  const load = useCallback(
    (fresh = false) =>
      fetchProducts({ fresh }).then(
        (list) => {
          setProducts(list);
          setError('');
        },
        () => setError("Couldn't load the menu. Check your internet connection and try again.")
      ),
    []
  );

  useEffect(() => {
    load();
  }, [load]);

  const shown = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = (products ?? []).filter(
      (p) =>
        (category === 'all' || p.categorySlug === category) &&
        (!tag || p.tags.includes(tag)) &&
        (!q || p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q) || p.flavours.some((f) => f.toLowerCase().includes(q)))
    );
    return list;
  }, [products, category, tag, query]);


  const header = (
    <View style={{ gap: 14, paddingBottom: 4 }}>
      <AppHeader title="Our Menu" subtitle={products ? `${products.length} freshly made items` : 'Loading the menu…'} />
      <View style={styles.search}>
        <Ionicons name="search" size={18} color={C.muted} />
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Search cakes, pizza, flavours…"
          placeholderTextColor={C.faint}
          style={styles.searchInput}
          returnKeyType="search"
          accessibilityLabel="Search the menu"
          clearButtonMode="while-editing"
        />
        {query ? (
          <Pressable onPress={() => setQuery('')} hitSlop={8} accessibilityLabel="Clear search">
            <Ionicons name="close-circle" size={18} color={C.muted} />
          </Pressable>
        ) : null}
      </View>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Open the premium cake collection"
        onPress={() => {
          tap();
          router.push('/premium');
        }}
        style={({ pressed }) => [styles.premium, pressed && { transform: [{ scale: 0.98 }] }]}>
        <Image source={imageSource('/images/premium/ferrero-rocher-cake/1.jpg')} style={styles.premiumImg} contentFit="cover" alt="" />
        <LinearGradient start={{ x: 0, y: 0.5 }} end={{ x: 1, y: 0.5 }} colors={[C.espresso, 'rgba(31,20,17,0.85)', 'rgba(31,20,17,0.1)']} style={StyleSheet.absoluteFill} />
        <View style={{ padding: 16, gap: 2, maxWidth: '70%' }}>
          <Text style={styles.premiumEyebrow}>The Premium Collection</Text>
          <Text style={styles.premiumTitle}>
            Cakes Worth <Text style={{ color: C.gold, fontFamily: F.headingItalic }}>Celebrating</Text>
          </Text>
          <Text style={styles.premiumLink}>30 signature cakes →</Text>
        </View>
      </Pressable>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips} style={styles.bleed}>
        {CATEGORIES.map((c) => (
          <Chip key={c.slug} label={c.name} selected={category === c.slug} onPress={() => setCategory(c.slug)} />
        ))}
      </ScrollView>
      {tag || query ? (
        <View style={styles.resultRow}>
          <Text style={styles.resultText}>
            {shown.length} {shown.length === 1 ? 'item' : 'items'}
            {tag ? <Text style={{ fontFamily: F.bodyBlack, color: C.brown }}> · {tagLabel(tag)}</Text> : null}
          </Text>
          <Pressable
            onPress={() => {
              setTag(null);
              setQuery('');
            }}
            hitSlop={8}
            accessibilityRole="button">
            <Text style={styles.resultClear}>Clear filters</Text>
          </Pressable>
        </View>
      ) : null}
    </View>
  );

  if (error && !products) {
    return (
      <SafeAreaView style={styles.page} edges={['top']}>
        <ErrorState message={error} onRetry={() => load(true)} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.page} edges={['top']}>
      {products ? (
        <FlatList
          data={shown}
          key="grid"
          numColumns={2}
          keyExtractor={(p) => p.id}
          columnWrapperStyle={{ gap: 12 }}
          contentContainerStyle={styles.list}
          ListHeaderComponent={header}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
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
          }
          ListEmptyComponent={
            <EmptyState
              icon="search-outline"
              title="No matches"
              body={query ? `We couldn’t find “${query}”. Try another name or category.` : 'Nothing in this category right now.'}
              action="Show all items"
              onAction={() => {
                setQuery('');
                setCategory('all');
                setTag(null);
              }}
            />
          }
          renderItem={({ item }) => (
            <Animated.View entering={FadeIn.duration(300)}>
              <ProductCard product={item} width={cardW} />
            </Animated.View>
          )}
        />
      ) : (
        <View style={styles.list}>
          {header}
          <View style={styles.skeletons}>
            {[0, 1, 2, 3].map((i) => (
              <Skeleton key={i} style={{ width: cardW, height: 250, borderRadius: R.lg }} />
            ))}
          </View>
        </View>
      )}
      <CartBar />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: C.page },
  list: { padding: 16, paddingBottom: 110, gap: 12, maxWidth: MAX_W, width: '100%', alignSelf: 'center' },
  bleed: { marginHorizontal: -16, flexGrow: 0 },
  chips: { paddingHorizontal: 16, gap: 8 },
  search: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: C.white,
    borderRadius: R.pill,
    borderWidth: 1.5,
    borderColor: C.border,
    paddingHorizontal: 16,
    minHeight: 50,
  },
  searchInput: { flex: 1, fontFamily: F.body, fontSize: 15.5, color: C.ink, paddingVertical: 12 },
  premium: { height: 112, borderRadius: R.xl, overflow: 'hidden', backgroundColor: C.espresso, justifyContent: 'center' },
  premiumImg: { position: 'absolute', right: 0, top: 0, bottom: 0, width: '55%' },
  premiumEyebrow: { color: C.gold, fontFamily: F.bodyBold, fontSize: 10, letterSpacing: 2.6, textTransform: 'uppercase' },
  premiumTitle: { color: C.cream, fontFamily: F.heading, fontSize: 20, lineHeight: 26 },
  premiumLink: { color: 'rgba(240,215,167,0.85)', fontFamily: F.bodyBold, fontSize: 12.5, marginTop: 2 },
  resultRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  resultText: { fontFamily: F.body, fontSize: 13.5, color: C.muted },
  resultClear: { fontFamily: F.bodyBold, fontSize: 13.5, color: C.rose },
  skeletons: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
});
