import Ionicons from '@expo/vector-icons/Ionicons';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { tap } from '@/components/ui';
import { imageSource, placeholderEmoji } from '@/lib/images';
import { priceText, type Product } from '@/lib/products';
import { C, F, R, SHADOW } from '@/lib/theme';

/** Mobile version of the website's ProductCard (src/components/ui/ProductCard.tsx). */
export function ProductCard({ product, width }: { product: Product; width: number }) {
  const src = imageSource(product.image);
  const open = () => {
    tap();
    router.push({ pathname: '/product/[id]', params: { id: product.id } });
  };
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${product.name}, ${priceText(product)}`}
      onPress={open}
      style={({ pressed }) => [styles.card, { width }, pressed && { transform: [{ scale: 0.97 }] }]}>
      <View style={styles.imgWrap}>
        {src ? (
          <Image source={src} style={styles.img} contentFit="cover" transition={250} alt={product.name} recyclingKey={product.id} />
        ) : (
          <View style={[styles.img, styles.noImg]}>
            <Text style={{ fontSize: 44 }}>{placeholderEmoji(product.categorySlug)}</Text>
          </View>
        )}
        {product.note ? (
          <View style={styles.note}>
            <Text style={styles.noteText} numberOfLines={1}>
              {product.note}
            </Text>
          </View>
        ) : null}
      </View>
      <View style={styles.body}>
        <Text style={styles.name} numberOfLines={2}>
          {product.name}
        </Text>
        {product.reviewCount > 0 ? (
          <View style={styles.rating}>
            <Ionicons name="star" size={11} color="#e0a526" />
            <Text style={styles.ratingText}>
              {product.avgRating.toFixed(1)} ({product.reviewCount})
            </Text>
          </View>
        ) : null}
        <View style={styles.footer}>
          <Text style={styles.price}>{priceText(product)}</Text>
          <View style={styles.addBtn}>
            <Ionicons name={product.isCustomCake ? 'color-palette' : 'add'} size={product.isCustomCake ? 15 : 19} color={C.white} />
          </View>
        </View>
      </View>
    </Pressable>
  );
}

/** Wide card for horizontal "Bestsellers" rails on the home screen. */
export function ProductRailCard({ product }: { product: Product }) {
  return <ProductCard product={product} width={172} />;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: C.surface,
    borderRadius: R.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: C.border,
    boxShadow: SHADOW.card,
    borderCurve: 'continuous',
  },
  imgWrap: { aspectRatio: 1, backgroundColor: C.cream, pointerEvents: 'none' },
  img: { width: '100%', height: '100%' },
  noImg: { alignItems: 'center', justifyContent: 'center' },
  note: {
    position: 'absolute',
    top: 8,
    left: 8,
    right: 8,
    alignSelf: 'flex-start',
    flexDirection: 'row',
  },
  noteText: {
    backgroundColor: 'rgba(94,53,42,0.9)',
    color: C.creamLight,
    fontSize: 10.5,
    fontFamily: F.bodyBold,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: R.pill,
    overflow: 'hidden',
  },
  body: { padding: 11, gap: 5, flex: 1 },
  name: { fontFamily: F.headingSemi, fontSize: 15, color: C.ink, lineHeight: 20, minHeight: 40 },
  rating: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  ratingText: { fontSize: 11.5, color: C.muted, fontFamily: F.body },
  footer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto' },
  price: { fontFamily: F.bodyBlack, fontSize: 14.5, color: C.rose, flexShrink: 1 },
  addBtn: { width: 30, height: 30, borderRadius: 15, backgroundColor: C.rose, alignItems: 'center', justifyContent: 'center' },
});
