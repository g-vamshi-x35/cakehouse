import Ionicons from '@expo/vector-icons/Ionicons';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { tap } from '@/components/ui';
import { business, openWhatsApp } from '@/lib/business';
import { imageSource } from '@/lib/images';
import { formatPremiumPrice, type PremiumCake } from '@/lib/premium';
import { C, F, R, SHADOW } from '@/lib/theme';

/** Mobile version of the website's PremiumCakeCard: swipeable photos, owner price, WhatsApp order. */
export function PremiumCard({ cake, width }: { cake: PremiumCake; width: number }) {
  const [index, setIndex] = useState(0);
  const price = formatPremiumPrice(cake.price, cake.priceLabel);
  const h = width * 1.25;
  const order = () => {
    tap();
    openWhatsApp(
      `Hi ${business.name}! I'd like to order the ${cake.name} from your Premium Cakes collection${price ? ` (${price})` : ''}. Please share the details.`
    );
  };

  return (
    <View style={[styles.card, { width }]}>
      <View style={{ width, height: h, backgroundColor: C.cream }}>
        <ScrollView
          horizontal
          pagingEnabled
          nestedScrollEnabled
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={(e) => setIndex(Math.round(e.nativeEvent.contentOffset.x / width))}
          accessibilityLabel={`${cake.name} photos`}>
          {cake.images.map((src, i) => (
            <Image
              key={src}
              source={imageSource(src)}
              style={{ width, height: h }}
              contentFit="cover"
              transition={250}
              alt={`${cake.name}${cake.images.length > 1 ? ` — photo ${i + 1} of ${cake.images.length}` : ''}`}
            />
          ))}
        </ScrollView>
        <LinearGradient colors={['transparent', 'rgba(31,20,17,0.5)']} style={styles.fade} pointerEvents="none" />
        {cake.images.length > 1 ? (
          <>
            <View style={styles.count} pointerEvents="none">
              <Ionicons name="images-outline" size={11} color={C.white} />
              <Text style={styles.countText}>{cake.images.length}</Text>
            </View>
            <View style={styles.dots} pointerEvents="none">
              {cake.images.map((src, i) => (
                <View key={src} style={[styles.dot, i === index && styles.dotOn]} />
              ))}
            </View>
          </>
        ) : null}
      </View>
      <View style={styles.body}>
        <Text style={styles.name} numberOfLines={2}>
          {cake.name}
        </Text>
        <Text style={price ? styles.price : styles.onRequest}>{price ?? 'Price on request'}</Text>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`${price ? 'Order' : 'Ask for price of'} ${cake.name} on WhatsApp`}
          onPress={order}
          style={({ pressed }) => [styles.btn, pressed && { backgroundColor: C.gold }]}>
          <Ionicons name="logo-whatsapp" size={15} color={C.cream} />
          <Text style={styles.btnText} numberOfLines={1}>
            {price ? 'Order' : 'Ask for price'}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: R.xl,
    overflow: 'hidden',
    backgroundColor: 'rgba(255,255,255,0.75)',
    borderWidth: 1,
    borderColor: C.goldLine,
    boxShadow: SHADOW.card,
    borderCurve: 'continuous',
  },
  fade: { position: 'absolute', left: 0, right: 0, bottom: 0, height: 70 },
  count: {
    position: 'absolute',
    top: 10,
    right: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: 'rgba(31,20,17,0.6)',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: R.pill,
  },
  countText: { color: C.white, fontFamily: F.bodyBold, fontSize: 11 },
  dots: { position: 'absolute', bottom: 10, left: 0, right: 0, flexDirection: 'row', justifyContent: 'center', gap: 5 },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.6)' },
  dotOn: { width: 16, backgroundColor: C.white },
  body: { padding: 12, gap: 6, flex: 1 },
  name: { fontFamily: F.heading, fontSize: 16, color: C.espresso, lineHeight: 21, minHeight: 42 },
  price: { fontFamily: F.bodyBlack, fontSize: 16, color: C.brown },
  onRequest: { fontFamily: F.headingItalic, fontSize: 14, color: C.muted },
  btn: {
    marginTop: 4,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: C.espresso,
    borderRadius: R.pill,
    paddingVertical: 10,
  },
  btnText: { color: C.cream, fontFamily: F.bodyBold, fontSize: 13.5, letterSpacing: 0.3 },
});
