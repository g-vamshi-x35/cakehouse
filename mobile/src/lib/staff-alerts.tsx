import Ionicons from '@expo/vector-icons/Ionicons';
import { createAudioPlayer, setAudioModeAsync, type AudioPlayer } from 'expo-audio';
import * as Haptics from 'expo-haptics';
import * as Notifications from 'expo-notifications';
import { router } from 'expo-router';
import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import { AppState, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { SlideInUp, SlideOutUp } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from './auth';
import { NEW_ORDER_CHANNEL } from './notifications';
import { readJSON, writeJSON } from './storage';
import { supabase } from './supabase';
import { C, F, R, SHADOW } from './theme';

type NewOrder = { id: string; order_number: string; customer_name: string; total: number; created_at: string };

const POLL_MS = 15_000;
const BELL = require('../../assets/sounds/new_order.wav');

/**
 * New-order alerts for the owner and employees: the moment a customer places
 * an order (from the app or the website) staff hear a bell, get a phone
 * notification and see a banner that opens the order. Uses Supabase Realtime
 * for instant delivery, with a 15-second check as a fallback.
 */
export function StaffAlertsProvider({ children }: { children: ReactNode }) {
  const { session, profile } = useAuth();
  const insets = useSafeAreaInsets();
  const watching = !!session && (profile?.role === 'owner' || profile?.role === 'employee');
  const userId = session?.user.id ?? null;
  const [banner, setBanner] = useState<NewOrder | null>(null);
  const seen = useRef(new Set<string>());
  const bell = useRef<AudioPlayer | null>(null);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const ring = useCallback(async (o: NewOrder) => {
    if (seen.current.has(o.id)) return;
    seen.current.add(o.id);
    if (userId) writeJSON(`staff-seen:${userId}`, o.created_at);

    try {
      if (!bell.current) bell.current = createAudioPlayer(BELL);
      bell.current.seekTo(0);
      bell.current.play();
    } catch {
      // sound is a nice-to-have
    }
    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {});
      Notifications.scheduleNotificationAsync({
        content: {
          title: `🔔 New order #${o.order_number}`,
          body: `${o.customer_name} · ₹${Number(o.total)}`,
          sound: 'new_order.wav',
          data: { url: `/staff-order/${o.id}` },
        },
        trigger: Platform.OS === 'android' ? { channelId: NEW_ORDER_CHANNEL } : null,
      }).catch(() => {});
    }
    setBanner(o);
    if (hideTimer.current) clearTimeout(hideTimer.current);
    hideTimer.current = setTimeout(() => setBanner(null), 15_000);
  }, [userId]);

  const checkNew = useCallback(() => {
    if (!userId) return;
    const since = readJSON<string | null>(`staff-seen:${userId}`, null);
    if (!since) {
      // First time on this device: start from now, don't ring for old orders.
      writeJSON(`staff-seen:${userId}`, new Date().toISOString());
      return;
    }
    supabase
      .from('orders')
      .select('id, order_number, customer_name, total, created_at')
      .gt('created_at', since)
      .order('created_at', { ascending: true })
      .limit(10)
      .then(({ data }) => {
        for (const o of (data as NewOrder[] | null) ?? []) ring(o);
      });
  }, [userId, ring]);

  useEffect(() => {
    if (!watching) return;
    setAudioModeAsync({ playsInSilentMode: true, shouldPlayInBackground: false }).catch(() => {});
    checkNew();

    const channel = supabase
      .channel(`staff-new-orders-${userId}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'orders' }, (payload) => ring(payload.new as NewOrder))
      .subscribe();
    const timer = setInterval(() => {
      if (AppState.currentState === 'active') checkNew();
    }, POLL_MS);
    const sub = AppState.addEventListener('change', (s) => {
      if (s === 'active') checkNew();
    });
    return () => {
      supabase.removeChannel(channel);
      clearInterval(timer);
      sub.remove();
    };
  }, [watching, userId, checkNew, ring]);

  useEffect(
    () => () => {
      bell.current?.remove();
      if (hideTimer.current) clearTimeout(hideTimer.current);
    },
    []
  );

  return (
    <>
      {children}
      {banner ? (
        <Animated.View entering={SlideInUp.springify().damping(16)} exiting={SlideOutUp.duration(200)} style={[styles.wrap, { top: insets.top + 8 }]}>
          <View style={styles.banner}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`New order ${banner.order_number} from ${banner.customer_name}. Open order.`}
              onPress={() => {
                const id = banner.id;
                setBanner(null);
                router.push({ pathname: '/staff-order/[id]', params: { id } });
              }}
              style={styles.bannerMain}>
              <View style={styles.bellIcon}>
                <Ionicons name="notifications" size={22} color={C.espresso} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.title}>New order #{banner.order_number}</Text>
                <Text style={styles.sub} numberOfLines={1}>
                  {banner.customer_name} · ₹{Number(banner.total)} · Tap to open
                </Text>
              </View>
            </Pressable>
            <Pressable onPress={() => setBanner(null)} hitSlop={12} accessibilityRole="button" accessibilityLabel="Dismiss" style={{ padding: 4 }}>
              <Ionicons name="close" size={20} color={C.cream} />
            </Pressable>
          </View>
        </Animated.View>
      ) : null}
    </>
  );
}

const styles = StyleSheet.create({
  wrap: { position: 'absolute', left: 12, right: 12, zIndex: 1000, maxWidth: 560, alignSelf: 'center' },
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: C.espresso,
    borderRadius: R.lg,
    padding: 14,
    borderWidth: 1,
    borderColor: C.gold,
    boxShadow: SHADOW.lifted,
  },
  bannerMain: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 12 },
  bellIcon: { width: 42, height: 42, borderRadius: 21, backgroundColor: C.gold, alignItems: 'center', justifyContent: 'center' },
  title: { fontFamily: F.bodyBlack, fontSize: 16, color: C.cream },
  sub: { fontFamily: F.body, fontSize: 13, color: 'rgba(238,225,186,0.85)' },
});
