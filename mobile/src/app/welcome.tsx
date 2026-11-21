import Ionicons from '@expo/vector-icons/Ionicons';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { Easing, FadeInDown, useAnimatedStyle, useSharedValue, withTiming, ZoomIn } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button } from '@/components/ui';
import { useAuth } from '@/lib/auth';
import { business } from '@/lib/business';
import { HERO, LOGO } from '@/lib/images';
import { C, F } from '@/lib/theme';

export default function WelcomeScreen() {
  const insets = useSafeAreaInsets();
  const { markOnboarded } = useAuth();
  const scale = useSharedValue(1.18);

  useEffect(() => {
    // Same slow zoom-out the website's hero does on load.
    scale.value = withTiming(1, { duration: 2200, easing: Easing.out(Easing.cubic) });
  }, [scale]);
  const heroStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  return (
    <View style={styles.page}>
      <StatusBar style="light" />
      <Animated.View style={[StyleSheet.absoluteFill, heroStyle]}>
        <Image source={HERO} style={StyleSheet.absoluteFill} contentFit="cover" contentPosition={{ left: '62%', top: '30%' }} alt="" />
      </Animated.View>
      <LinearGradient
        colors={['rgba(43,26,21,0.15)', 'rgba(43,26,21,0.5)', 'rgba(43,26,21,0.94)']}
        locations={[0, 0.45, 0.85]}
        style={StyleSheet.absoluteFill}
      />

      <View style={[styles.content, { paddingTop: insets.top + 24, paddingBottom: insets.bottom + 24 }]}>
        <Animated.View entering={ZoomIn.duration(600).delay(200)} style={styles.logoWrap}>
          <Image source={LOGO} style={styles.logo} contentFit="cover" alt="Cake House logo" />
        </Animated.View>

        <View style={{ flex: 1 }} />

        <Animated.Text entering={FadeInDown.duration(600).delay(450)} style={styles.eyebrow}>
          {business.subBrand}
        </Animated.Text>
        <Animated.Text entering={FadeInDown.duration(700).delay(600)} style={styles.title} accessibilityRole="header">
          Fresh Cakes,{'\n'}Baked Daily With Love.
        </Animated.Text>
        <Animated.Text entering={FadeInDown.duration(600).delay(750)} style={styles.sub}>
          100% vegetarian, 100% egg-free custom cakes, birthday cakes, wedding cakes & snacks — handcrafted fresh in
          Berhampur. Great taste, in every bite.
        </Animated.Text>

        <Animated.View entering={FadeInDown.duration(600).delay(880)} style={styles.badges}>
          {['100% Vegetarian', '100% Egg Free', 'Home Delivery'].map((b) => (
            <View key={b} style={styles.badge}>
              <Ionicons name="leaf" size={12} color={C.cream} />
              <Text style={styles.badgeText}>{b}</Text>
            </View>
          ))}
        </Animated.View>

        <Animated.View entering={FadeInDown.duration(600).delay(1000)} style={{ gap: 12, marginTop: 8 }}>
          <Button title="Get Started" icon="arrow-forward" size="lg" onPress={() => router.push('/register/details')} />
          <Button title="I already have an account" variant="light" size="lg" onPress={() => router.push('/login')} />
          <Pressable
            accessibilityRole="button"
            hitSlop={10}
            onPress={() => {
              markOnboarded();
              router.replace('/');
            }}
            style={{ alignSelf: 'center', paddingVertical: 8 }}>
            <Text style={styles.guest}>Browse the menu as a guest</Text>
          </Pressable>
        </Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: C.ink, overflow: 'hidden' },
  content: { flex: 1, paddingHorizontal: 24, gap: 12, maxWidth: 640, width: '100%', alignSelf: 'center' },
  logoWrap: {
    alignSelf: 'center',
    padding: 4,
    borderRadius: 60,
    backgroundColor: 'rgba(240,215,167,0.35)',
    boxShadow: '0 10px 30px rgba(0,0,0,0.35)',
  },
  logo: { width: 96, height: 96, borderRadius: 48 },
  eyebrow: { color: C.cream, fontFamily: F.bodyBold, fontSize: 12, letterSpacing: 3.6, textTransform: 'uppercase' },
  title: { color: C.white, fontFamily: F.heading, fontSize: 38, lineHeight: 44 },
  sub: { color: 'rgba(238,225,186,0.9)', fontFamily: F.body, fontSize: 15, lineHeight: 23 },
  badges: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    borderWidth: 1,
    borderColor: 'rgba(240,215,167,0.45)',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  badgeText: { color: C.cream, fontFamily: F.bodyBold, fontSize: 12 },
  guest: { color: C.cream, fontFamily: F.bodyBold, fontSize: 14, textDecorationLine: 'underline' },
});
