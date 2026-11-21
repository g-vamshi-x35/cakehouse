import { StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { C, F } from '@/lib/theme';

export function StepHeader({ step, total, title, subtitle }: { step: number; total: number; title: string; subtitle: string }) {
  return (
    <Animated.View entering={FadeInDown.duration(450)} style={{ gap: 10 }}>
      <View style={styles.bars} accessibilityLabel={`Step ${step} of ${total}`}>
        {Array.from({ length: total }, (_, i) => (
          <View key={i} style={[styles.bar, i < step && { backgroundColor: C.rose }]} />
        ))}
      </View>
      <Text style={styles.eyebrow}>
        Step {step} of {total}
      </Text>
      <Text style={styles.title} accessibilityRole="header">
        {title}
      </Text>
      <Text style={styles.sub}>{subtitle}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  bars: { flexDirection: 'row', gap: 6 },
  bar: { flex: 1, height: 5, borderRadius: 3, backgroundColor: C.cream },
  eyebrow: { fontFamily: F.bodyBold, fontSize: 11, letterSpacing: 2.6, color: C.rose, textTransform: 'uppercase', marginTop: 8 },
  title: { fontFamily: F.heading, fontSize: 30, color: C.brown, lineHeight: 38 },
  sub: { fontFamily: F.body, fontSize: 15, color: C.muted, lineHeight: 22 },
});
