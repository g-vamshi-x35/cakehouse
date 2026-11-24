import { useEffect, useMemo } from 'react';
import { StyleSheet, useWindowDimensions, View } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withDelay, withTiming } from 'react-native-reanimated';
import { C } from '@/lib/theme';

/** Deterministic pseudo-random in [0, 1) so renders stay pure. */
function rand(i: number, k: number) {
  const v = Math.sin(i * 12.9898 + k * 78.233) * 43758.5453;
  return v - Math.floor(v);
}

const COLORS = [C.rose, C.cream, C.brown, '#f6c9b8', '#e0a526', C.white];

function Piece({ x, delay, color, size, height, drift, spin }: { x: number; delay: number; color: string; size: number; height: number; drift: number; spin: number }) {
  const t = useSharedValue(0);
  useEffect(() => {
    t.value = withDelay(delay, withTiming(1, { duration: 2600 + delay, easing: Easing.out(Easing.quad) }));
  }, [t, delay]);
  const style = useAnimatedStyle(() => ({
    opacity: t.value < 0.85 ? 1 : (1 - t.value) / 0.15,
    transform: [
      { translateY: -40 + t.value * (height + 80) },
      { translateX: Math.sin(t.value * Math.PI * 2) * drift },
      { rotate: `${t.value * spin}deg` },
    ],
  }));
  return <Animated.View style={[styles.piece, { left: x, width: size, height: size * 1.6, backgroundColor: color }, style]} />;
}

/** One-shot falling confetti (mirrors the website's order celebration). */
export function Confetti({ count = 36 }: { count?: number }) {
  const { width, height } = useWindowDimensions();
  const pieces = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        x: rand(i, 1) * width,
        delay: rand(i, 2) * 700,
        color: COLORS[i % COLORS.length],
        size: 6 + rand(i, 3) * 6,
        drift: 10 + rand(i, 4) * 30,
        spin: 180 + rand(i, 5) * 540,
      })),
    [count, width]
  );
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
      {pieces.map((p, i) => (
        <Piece key={i} {...p} height={height} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  piece: { position: 'absolute', top: 0, borderRadius: 2 },
});
