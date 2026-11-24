import * as Notifications from 'expo-notifications';
import { AndroidImportance } from 'expo-notifications';
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { AppState, Platform } from 'react-native';
import { useAuth } from './auth';
import { readJSON, writeJSON } from './storage';
import { supabase } from './supabase';

/**
 * Order updates come from the website's existing `notifications` table: the
 * database / staff dashboards insert a row whenever an order is placed or its
 * status changes. While the app is open (or brought back to the foreground)
 * it checks for new rows and shows them as system notifications, plus an
 * unread badge on the Account tab.
 */

export type AppNotification = { id: string; title: string; body: string | null; type: string | null; is_read: boolean; created_at: string };

const POLL_MS = 45_000;
/** Android channel used for the staff new-order bell (custom sound, max priority). */
export const NEW_ORDER_CHANNEL = 'new-orders';
const isNative = Platform.OS !== 'web';

if (isNative) {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });
}

export async function ensureNotificationPermission() {
  if (!isNative) return false;
  try {
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('orders', {
        name: 'Order updates',
        importance: AndroidImportance.HIGH,
        lightColor: '#c37960',
      });
      await Notifications.setNotificationChannelAsync(NEW_ORDER_CHANNEL, {
        name: 'New orders (staff)',
        importance: AndroidImportance.MAX,
        sound: 'new_order.wav',
        vibrationPattern: [0, 400, 200, 400],
        lightColor: '#b08d57',
      });
    }
    const current = await Notifications.getPermissionsAsync();
    if (current.granted) return true;
    if (!current.canAskAgain) return false;
    const asked = await Notifications.requestPermissionsAsync();
    return asked.granted;
  } catch {
    return false;
  }
}

type NotifState = { unread: number; refresh: () => PromiseLike<void> };
const NotifContext = createContext<NotifState>({ unread: 0, refresh: async () => {} });

export function NotificationsProvider({ children }: { children: ReactNode }) {
  const { session } = useAuth();
  const userId = session?.user.id ?? null;
  const [unread, setUnread] = useState(0);
  const permitted = useRef(false);

  const check = useCallback(() => {
    if (!userId) return Promise.resolve();
    const seenKey = `notif-seen:${userId}`;
    return supabase
      .from('notifications')
      .select('id, title, body, created_at, is_read')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(30)
      .then(async ({ data }) => {
        const rows = (data as AppNotification[] | null) ?? [];
        setUnread(rows.filter((r) => !r.is_read).length);
        if (!rows.length) return;
        // First run on this device: remember the newest without alerting old ones.
        const lastSeen = readJSON<string | null>(seenKey, null);
        if (lastSeen && permitted.current) {
          const fresh = rows.filter((r) => r.created_at > lastSeen).reverse();
          for (const r of fresh.slice(-3)) {
            await Notifications.scheduleNotificationAsync({
              content: { title: r.title, body: r.body ?? undefined, data: { url: '/notifications' } },
              trigger: Platform.OS === 'android' ? { channelId: 'orders' } : null,
            }).catch(() => {});
          }
        }
        writeJSON(seenKey, rows[0].created_at);
      });
  }, [userId]);

  useEffect(() => {
    if (!userId) return;
    ensureNotificationPermission().then((ok) => {
      permitted.current = ok;
    });
    check();
    const timer = setInterval(() => {
      if (AppState.currentState === 'active') check();
    }, POLL_MS);
    const sub = AppState.addEventListener('change', (s) => {
      if (s === 'active') check();
    });
    // Instant: the bakery's messages arrive the moment staff update an order.
    const channel = supabase
      .channel(`my-notifications-${userId}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'notifications', filter: `user_id=eq.${userId}` }, () => check())
      .subscribe();
    return () => {
      clearInterval(timer);
      sub.remove();
      supabase.removeChannel(channel);
    };
  }, [userId, check]);

  const value = useMemo(() => ({ unread: userId ? unread : 0, refresh: check }), [userId, unread, check]);
  return <NotifContext.Provider value={value}>{children}</NotifContext.Provider>;
}

export function useNotifications() {
  return useContext(NotifContext);
}
