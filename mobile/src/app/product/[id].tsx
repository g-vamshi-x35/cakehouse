import Ionicons from '@expo/vector-icons/Ionicons';
import * as Haptics from 'expo-haptics';
import { Image } from 'expo-image';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button, Chip, ErrorState, Field, IconButton, LoadingState, Notice, QtyStepper, SectionTitle } from '@/components/ui';
import { useCart } from '@/lib/cart';
import { imageSource, placeholderEmoji } from '@/lib/images';
import { fetchProduct, type Product } from '@/lib/products';
import { C, F, MAX_W, R, SHADOW } from '@/lib/theme';

export default function ProductScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const imgW = Math.min(width, MAX_W);
  const cart = useCart();

  const [product, setProduct] = useState<Product | null | undefined>(undefined);
  const [error, setError] = useState('');
  const [weight, setWeight] = useState<string | null>(null);
  const [flavour, setFlavour] = useState<string | null>(null);
  const [qty, setQty] = useState(1);
  const [message, setMessage] = useState('');
  const [slide, setSlide] = useState(0);
  const [added, setAdded] = useState(false);

  const load = useCallback(() => {
    fetchProduct(id)
      .then((p) => {
        setError('');
        setProduct(p);
        if (p?.weights.length) setWeight(p.weights[0].label);
        if (p?.flavours.length) setFlavour(p.flavours[0]);
      })
      .catch(() => setError("Couldn't load this item. Check your connection and try again."));
  }, [id]);

  useEffect(load, [load]);

  if (error) return <ErrorState message={error} onRetry={load} />;
  if (product === undefined) return <LoadingState text="Loading…" />;
  if (product === null) {
    return (
      <ErrorState
        message="This item is no longer available."
        onRetry={() => router.back()}
      />
    );
  }

  const unit = product.weights.length ? (product.weights.find((w) => w.label === weight)?.price ?? 0) : product.price;
  const canOrder = unit > 0 && !product.isCustomCake;
  const images = product.images.length ? product.images : [null];

  function addToCart(goToCart: boolean) {
    if (!product) return;
    cart.add({
      productId: product.id,
      name: product.name,
      image: product.image,
      categorySlug: product.categorySlug,
      isCake: product.isCake,
      weightLabel: weight,
      flavour: product.flavours.length > 1 ? flavour : null,
      message: message.trim(),
      qty,
      unitPrice: unit,
    });
    if (Platform.OS !== 'web') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    if (goToCart) router.push('/cart');
    else {
      setAdded(true);
      setTimeout(() => setAdded(false), 2200);
    }
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: C.page }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <Stack.Screen
        options={{
          title: '',
          headerLeft: () => <IconButton icon="chevron-back" label="Back" onPress={() => router.back()} bg="rgba(251,245,233,0.92)" size={40} />,
          headerRight: () => (
            <IconButton icon="bag-handle-outline" label="Cart" badge={cart.count} onPress={() => router.push('/cart')} bg="rgba(251,245,233,0.92)" size={40} />
          ),
        }}
      />
      <ScrollView contentContainerStyle={{ paddingBottom: 130 + insets.bottom }} keyboardShouldPersistTaps="handled">
        <View style={{ width: imgW, alignSelf: 'center' }}>
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={(e) => setSlide(Math.round(e.nativeEvent.contentOffset.x / imgW))}>
            {images.map((url, i) => {
              const src = imageSource(url);
              return src ? (
                <Image key={i} source={src} style={{ width: imgW, height: imgW * 0.95 }} contentFit="cover" transition={250} alt={product.name} />
              ) : (
                <View key={i} style={[{ width: imgW, height: imgW * 0.8 }, styles.noImg]}>
                  <Text style={{ fontSize: 90 }}>{placeholderEmoji(product.categorySlug)}</Text>
                </View>
              );
            })}
          </ScrollView>
          {images.length > 1 ? (
            <View style={styles.dots}>
              {images.map((_, i) => (
                <View key={i} style={[styles.dot, i === slide && styles.dotOn]} />
              ))}
            </View>
          ) : null}
        </View>

        <Animated.View entering={FadeInUp.duration(450)} style={styles.sheet}>
          <View style={{ gap: 6 }}>
            <Text style={styles.cat}>{product.categoryName}</Text>
            <Text style={styles.title} accessibilityRole="header">
              {product.name}
            </Text>
            <View style={styles.priceRow}>
              <Text style={styles.price}>{unit > 0 ? `₹${unit}` : 'Price on request'}</Text>
              {product.reviewCount > 0 ? (
                <View style={styles.rating}>
                  <Ionicons name="star" size={13} color="#e0a526" />
                  <Text style={styles.ratingText}>
                    {product.avgRating.toFixed(1)} · {product.reviewCount} review{product.reviewCount === 1 ? '' : 's'}
                  </Text>
                </View>
              ) : null}
            </View>
            <View style={styles.tags}>
              <Tag icon="leaf" text="100% Eggless" />
              {product.isCake ? <Tag icon="hand-left" text="Handcrafted" /> : null}
              {product.note ? <Tag icon="information-circle" text={product.note} /> : null}
            </View>
          </View>

          {product.description ? <Text style={styles.desc}>{product.description}</Text> : null}

          {product.isCustomCake ? (
            <Animated.View entering={FadeInDown.duration(400)} style={{ gap: 12 }}>
              <Notice text="Theme & design cakes are made to order. Send us your idea and we’ll confirm the price before baking." />
              <Button
                title="Customize this cake"
                icon="color-palette-outline"
                size="lg"
                onPress={() => router.navigate({ pathname: '/custom-cake', params: { theme: product.name } })}
              />
            </Animated.View>
          ) : (
            <>
              {product.weights.length > 0 && (
                <View style={{ gap: 10 }}>
                  <SectionTitle>Choose size</SectionTitle>
                  <View style={styles.wrapRow}>
                    {product.weights.map((w) => (
                      <Chip key={w.label} label={w.label} sub={`₹${w.price}`} selected={weight === w.label} onPress={() => setWeight(w.label)} />
                    ))}
                  </View>
                </View>
              )}

              {product.flavours.length > 1 && (
                <View style={{ gap: 10 }}>
                  <SectionTitle>Flavour</SectionTitle>
                  <View style={styles.wrapRow}>
                    {product.flavours.map((f) => (
                      <Chip key={f} label={f} selected={flavour === f} onPress={() => setFlavour(f)} />
                    ))}
                  </View>
                </View>
              )}

              {product.isCake && (
                <Field
                  label="Message on cake (optional)"
                  icon="create-outline"
                  value={message}
                  onChangeText={setMessage}
                  placeholder='e.g. "Happy Birthday Aarav"'
                  maxLength={60}
                  hint={`${message.length}/60`}
                />
              )}

              <View style={styles.qtyRow}>
                <SectionTitle>Quantity</SectionTitle>
                <QtyStepper value={qty} onChange={setQty} />
              </View>
            </>
          )}
        </Animated.View>
      </ScrollView>

      {canOrder ? (
        <View style={[styles.bottom, { paddingBottom: insets.bottom + 12 }]}>
          {added ? (
            <Animated.View entering={FadeInDown.duration(250)} style={styles.toast}>
              <Ionicons name="checkmark-circle" size={18} color={C.green} />
              <Text style={styles.toastText}>Added to cart</Text>
              <Text style={styles.toastLink} onPress={() => router.push('/cart')}>
                View cart
              </Text>
            </Animated.View>
          ) : null}
          <View style={styles.bottomRow}>
            <View>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.total}>₹{unit * qty}</Text>
            </View>
            <Button title="Add to cart" variant="outline" onPress={() => addToCart(false)} style={{ flex: 1, paddingHorizontal: 10 }} />
            <Button title="Buy now" onPress={() => addToCart(true)} style={{ flex: 1 }} />
          </View>
        </View>
      ) : null}
    </KeyboardAvoidingView>
  );
}

function Tag({ icon, text }: { icon: 'leaf' | 'hand-left' | 'information-circle'; text: string }) {
  return (
    <View style={styles.tag}>
      <Ionicons name={icon} size={12} color={C.brown} />
      <Text style={styles.tagText}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  noImg: { alignItems: 'center', justifyContent: 'center', backgroundColor: C.cream },
  dots: { position: 'absolute', bottom: 40, alignSelf: 'center', flexDirection: 'row', gap: 6 },
  dot: { width: 7, height: 7, borderRadius: 4, backgroundColor: 'rgba(255,255,255,0.6)' },
  dotOn: { width: 20, backgroundColor: C.white },
  sheet: {
    marginTop: -26,
    backgroundColor: C.page,
    borderTopLeftRadius: R.xl,
    borderTopRightRadius: R.xl,
    padding: 20,
    gap: 20,
    maxWidth: MAX_W,
    width: '100%',
    alignSelf: 'center',
  },
  cat: { fontFamily: F.bodyBold, fontSize: 11, letterSpacing: 2.4, color: C.rose, textTransform: 'uppercase' },
  title: { fontFamily: F.heading, fontSize: 28, color: C.ink, lineHeight: 34 },
  priceRow: { flexDirection: 'row', alignItems: 'center', gap: 14, flexWrap: 'wrap' },
  price: { fontFamily: F.bodyBlack, fontSize: 24, color: C.rose, fontVariant: ['tabular-nums'] },
  rating: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  ratingText: { fontFamily: F.body, fontSize: 13, color: C.muted },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 4 },
  tag: { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: C.cream, paddingHorizontal: 10, paddingVertical: 5, borderRadius: R.pill },
  tagText: { fontFamily: F.bodyBold, fontSize: 12, color: C.brown },
  desc: { fontFamily: F.body, fontSize: 15.5, color: C.ink, lineHeight: 24 },
  ingredients: { fontFamily: F.body, fontSize: 13.5, color: C.muted, lineHeight: 20 },
  wrapRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  qtyRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  muted: { fontFamily: F.body, color: C.muted, fontSize: 14 },
  review: { backgroundColor: C.surface, borderRadius: R.md, padding: 14, gap: 6, borderWidth: 1, borderColor: C.border },
  reviewText: { fontFamily: F.body, fontSize: 14.5, color: C.ink, lineHeight: 21 },
  reviewAuthor: { fontFamily: F.bodyBold, fontSize: 13, color: C.brown },
  bottom: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: C.surface,
    paddingHorizontal: 16,
    paddingTop: 12,
    borderTopLeftRadius: R.xl,
    borderTopRightRadius: R.xl,
    boxShadow: SHADOW.bar,
    gap: 10,
  },
  bottomRow: { flexDirection: 'row', alignItems: 'center', gap: 10, maxWidth: MAX_W, width: '100%', alignSelf: 'center' },
  totalLabel: { fontFamily: F.body, fontSize: 12, color: C.muted },
  total: { fontFamily: F.bodyBlack, fontSize: 20, color: C.brown, fontVariant: ['tabular-nums'] },
  toast: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: C.greenBg, borderRadius: R.md, padding: 10, maxWidth: MAX_W, width: '100%', alignSelf: 'center' },
  toastText: { flex: 1, fontFamily: F.bodyBold, color: C.green },
  toastLink: { fontFamily: F.bodyBlack, color: C.green, textDecorationLine: 'underline' },
});
