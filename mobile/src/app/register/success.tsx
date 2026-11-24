import Ionicons from '@expo/vector-icons/Ionicons';
import * as Haptics from 'expo-haptics';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect } from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown, ZoomIn } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Confetti } from '@/components/confetti';
import { Button } from '@/components/ui';
import { useAuth } from '@/lib/auth';
import { C, F } from '@/lib/theme';

export default function RegistrationSuccess() {
  const insets = useSafeAreaInsets();
  const { profile } = useAuth();
  const { name } = useLocalSearchParams<{ name?: string }>();
  const firstName = (profile?.full_name || name || 'friend').trim().split(/\s+/)[0];

  useEffect(() => {
    if (Platform.OS !== 'web') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
  }, []);

  return (
    <View style={[styles.page, { paddingTop: insets.top + 40, paddingBottom: insets.bottom + 24 }]}>
      <Confetti />
      <View style={styles.center}>
        <Animated.View entering={ZoomIn.springify().damping(11).delay(150)} style={styles.ring}>
          <View style={styles.circle}>
            <Ionicons name="checkmark" size={58} color={C.white} />
          </View>
        </Animated.View>
        <Animated.Text entering={FadeInDown.duration(600).delay(450)} style={styles.eyebrow}>
          Congratulations
        </Animated.Text>
        <Animated.Text entering={FadeInDown.duration(600).delay(560)} style={styles.title} accessibilityRole="header">
          Welcome to Cake House, {firstName}! 🎂
        </Animated.Text>
        <Animated.Text entering={FadeInDown.duration(600).delay(680)} style={styles.body}>
          Your account is ready. Order fresh eggless cakes, design your own custom cake and track every order — all from
          your phone.
        </Animated.Text>
        <Animated.View entering={FadeInDown.duration(600).delay(800)} style={styles.perks}>
          {[
            { icon: 'gift-outline' as const, text: 'A birthday treat every year' },
            { icon: 'location-outline' as const, text: 'Save your delivery addresses' },
            { icon: 'notifications-outline' as const, text: 'Live order status updates' },
          ].map((p) => (
            <View key={p.text} style={styles.perk}>
              <Ionicons name={p.icon} size={18} color={C.rose} />
              <Text style={styles.perkText}>{p.text}</Text>
            </View>
          ))}
        </Animated.View>
      </View>
      <Animated.View entering={FadeInDown.duration(600).delay(950)}>
        <Button title="Continue to Home" icon="arrow-forward" size="lg" onPress={() => router.replace('/')} />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: C.page, paddingHorizontal: 24, maxWidth: 640, width: '100%', alignSelf: 'center' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 14 },
  ring: { padding: 12, borderRadius: 80, backgroundColor: C.roseSoft },
  circle: { width: 104, height: 104, borderRadius: 52, backgroundColor: C.rose, alignItems: 'center', justifyContent: 'center', boxShadow: '0 12px 30px rgba(195,121,96,0.45)' },
  eyebrow: { fontFamily: F.bodyBold, fontSize: 12, letterSpacing: 3.2, color: C.rose, textTransform: 'uppercase', marginTop: 10 },
  title: { fontFamily: F.heading, fontSize: 30, color: C.brown, textAlign: 'center', lineHeight: 38 },
  body: { fontFamily: F.body, fontSize: 15.5, color: C.muted, textAlign: 'center', lineHeight: 23, maxWidth: 360 },
  perks: { gap: 10, marginTop: 10, alignSelf: 'stretch', backgroundColor: C.surface, borderRadius: 20, padding: 16, borderWidth: 1, borderColor: C.border },
  perk: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  perkText: { fontFamily: F.bodyBold, fontSize: 14.5, color: C.ink },
});
