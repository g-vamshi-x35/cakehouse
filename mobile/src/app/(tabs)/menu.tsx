import Ionicons from '@expo/vector-icons/Ionicons';
import { useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { FlatList, Pressable, RefreshControl, ScrollView, StyleSheet, TextInput, View, useWindowDimensions } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppHeader } from '@/components/app-header';
import { CartBar } from '@/components/cart-bar';
import { ProductCard } from '@/components/product-card';
import { Chip, EmptyState, ErrorState, Skeleton } from '@/components/ui';
import { CATEGORIES, fetchProducts, type Product } from '@/lib/products';
import { C, F, MAX_W, R } from '@/lib/theme';

type Sort = 'featured' | 'low' | 'high' | 'rating';
const SORTS: { key: Sort; label: string }[] = [
  { key: 'featured', label: 'Recommended' },
  { key: 'low', label: 'Price: Low' },
  { key: 'high', label: 'Price: High' },
  { key: 'rating', label: 'Top rated' },
];

export default function MenuScreen() {
  const params = useLocalSearchParams<{ category?: string }>();
  const [products, setProducts] = useState<Product[] | null>(null);
  const [error, setError] = useState('');
  const [category, setCategory] = useState(params.category ?? 'all');
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState<Sort>('featured');
  const [refreshing, setRefreshing] = useState(false);
  const { width } = useWindowDimensions();
  const cardW = (Math.min(width, MAX_W) - 16 * 2 - 12) / 2;

  // Category chosen on the Home screen.
  const [lastParam, setLastParam] = useState(params.category);
  if (params.category !== lastParam) {
    setLastParam(params.category);
    if (params.category) setCategory(params.category);
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
        (!q || p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q) || p.flavours.some((f) => f.toLowerCase().includes(q)))
    );
    if (sort === 'low') return [...list].sort((a, b) => a.price - b.price);
    if (sort === 'high') return [...list].sort((a, b) => b.price - a.price);
    if (sort === 'rating') return [...list].sort((a, b) => b.avgRating - a.avgRating || b.reviewCount - a.reviewCount);
    return list;
  }, [products, category, query, sort]);

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
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips} style={styles.bleed}>
        {CATEGORIES.map((c) => (
          <Chip key={c.slug} label={c.name} selected={category === c.slug} onPress={() => setCategory(c.slug)} />
        ))}
      </ScrollView>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips} style={styles.bleed}>
        {SORTS.map((s) => (
          <Pressable key={s.key} onPress={() => setSort(s.key)} style={[styles.sort, sort === s.key && styles.sortOn]} accessibilityRole="button" accessibilityState={{ selected: sort === s.key }}>
            <Animated.Text style={[styles.sortText, sort === s.key && { color: C.rose }]}>{s.label}</Animated.Text>
          </Pressable>
        ))}
      </ScrollView>
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
  sort: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: R.pill },
  sortOn: { backgroundColor: C.roseSoft },
  sortText: { fontFamily: F.bodyBold, fontSize: 13, color: C.muted },
  skeletons: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
});
