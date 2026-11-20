import { Image } from 'expo-image';
import { router } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { FlatList, Pressable, RefreshControl, ScrollView, StyleSheet, Text, TextInput, View, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, Centered, Chip } from '@/components/ui';
import { business } from '@/lib/business';
import { LOGO, imageSource } from '@/lib/images';
import { CATEGORIES, fetchProducts, type Product } from '@/lib/products';
import { C, R } from '@/lib/theme';

export default function MenuScreen() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [category, setCategory] = useState('all');
  const [query, setQuery] = useState('');
  const { width } = useWindowDimensions();
  const cardWidth = (Math.min(width, 700) - 16 * 2 - 12) / 2;

  const load = useCallback(
    () =>
      fetchProducts()
        .then((list) => {
          setProducts(list);
          setError('');
        })
        .catch(() => setError("Couldn't load the menu. Check your internet connection and try again."))
        .finally(() => setLoading(false)),
    []
  );

  useEffect(() => {
    load();
  }, [load]);

  const shown = useMemo(() => {
    const q = query.trim().toLowerCase();
    return products.filter(
      (p) => (category === 'all' || p.categorySlug === category) && (!q || p.name.toLowerCase().includes(q))
    );
  }, [products, category, query]);

  const header = (
    <View style={{ gap: 14, paddingBottom: 6 }}>
      <View style={styles.brandRow}>
        <Image source={LOGO} style={styles.logo} contentFit="cover" alt="Cake House logo" />
        <View style={{ flex: 1 }}>
          <Text style={styles.brand}>{business.name}</Text>
          <Text style={styles.sub}>{business.subBrand} · 100% Eggless</Text>
        </View>
      </View>
      <TextInput
        value={query}
        onChangeText={setQuery}
        placeholder="Search cakes, pizza, patties…"
        placeholderTextColor="rgba(43,26,21,0.4)"
        style={styles.search}
        clearButtonMode="while-editing"
      />
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
        {CATEGORIES.map((c) => (
          <Chip key={c.slug} label={c.name} selected={category === c.slug} onPress={() => setCategory(c.slug)} />
        ))}
      </ScrollView>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.page}>
        <Centered>
          <Text style={styles.sub}>Loading the menu…</Text>
        </Centered>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.page} edges={['top']}>
      <FlatList
        data={shown}
        key="grid"
        numColumns={2}
        keyExtractor={(p) => p.id}
        contentContainerStyle={styles.list}
        columnWrapperStyle={{ gap: 12 }}
        ListHeaderComponent={header}
        refreshControl={<RefreshControl refreshing={false} onRefresh={load} tintColor={C.brown} />}
        ListEmptyComponent={
          error ? (
            <View style={{ gap: 12, paddingTop: 40 }}>
              <Text style={styles.empty}>{error}</Text>
              <Button title="Try again" onPress={load} />
            </View>
          ) : (
            <Text style={[styles.empty, { paddingTop: 40 }]}>No items match.</Text>
          )
        }
        renderItem={({ item }) => <ProductCard product={item} width={cardWidth} />}
      />
    </SafeAreaView>
  );
}

function ProductCard({ product, width }: { product: Product; width: number }) {
  const src = imageSource(product.image);
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${product.name}, from ₹${product.price}`}
      onPress={() => router.push({ pathname: '/product/[id]', params: { id: product.id } })}
      style={({ pressed }) => [styles.card, { width }, pressed && { opacity: 0.85 }]}>
      {src ? (
        <Image source={src} style={{ width, height: width }} contentFit="cover" transition={150} alt={product.name} />
      ) : (
        <View style={[styles.noImg, { width, height: width }]}>
          <Text style={{ fontSize: 34 }}>🎂</Text>
        </View>
      )}
      <View style={{ padding: 10, gap: 2 }}>
        <Text style={styles.name} numberOfLines={2}>
          {product.name}
        </Text>
        <Text style={styles.price}>
          {product.weights.length > 1 ? 'From ' : ''}₹{product.price}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: C.page },
  list: { padding: 16, gap: 12, maxWidth: 700, width: '100%', alignSelf: 'center' },
  brandRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  logo: { width: 52, height: 52, borderRadius: 26 },
  brand: { fontSize: 26, fontWeight: '800', color: C.brown },
  sub: { color: C.muted, fontSize: 14 },
  search: { backgroundColor: C.white, borderRadius: R.pill, paddingHorizontal: 18, paddingVertical: 12, fontSize: 16, borderWidth: 1.5, borderColor: C.border, color: C.ink },
  card: { backgroundColor: C.creamLight, borderRadius: R.lg, overflow: 'hidden', borderCurve: 'continuous' },
  noImg: { alignItems: 'center', justifyContent: 'center', backgroundColor: C.cream },
  name: { color: C.ink, fontWeight: '700', fontSize: 15 },
  price: { color: C.rose, fontWeight: '800', fontSize: 15 },
  empty: { textAlign: 'center', color: C.muted, fontSize: 15 },
});
