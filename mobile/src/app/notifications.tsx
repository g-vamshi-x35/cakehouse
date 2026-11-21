import Ionicons from '@expo/vector-icons/Ionicons';
import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { FlatList, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { SignInPrompt } from '@/components/sign-in-prompt';
import { EmptyState, LoadingState } from '@/components/ui';
import { useAuth } from '@/lib/auth';
import { useNotifications, type AppNotification } from '@/lib/notifications';
import { supabase } from '@/lib/supabase';
import { C, F, MAX_W, R } from '@/lib/theme';

function ago(iso: string) {
  const s = (Date.now() - new Date(iso).getTime()) / 1000;
  if (s < 60) return 'Just now';
  if (s < 3600) return `${Math.floor(s / 60)} min ago`;
  if (s < 86400) return `${Math.floor(s / 3600)} h ago`;
  return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
}

export default function NotificationsScreen() {
  const { session } = useAuth();
  const { refresh } = useNotifications();
  const [rows, setRows] = useState<AppNotification[] | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    if (!session) return;
    const { data } = await supabase
      .from('notifications')
      .select('id, title, body, type, is_read, created_at')
      .eq('user_id', session.user.id)
      .order('created_at', { ascending: false })
      .limit(100);
    const list = (data as AppNotification[] | null) ?? [];
    setRows(list);
    // Opening the list marks everything as read (same as the website).
    if (list.some((r) => !r.is_read)) {
      await supabase.from('notifications').update({ is_read: true }).eq('user_id', session.user.id).eq('is_read', false);
      refresh();
    }
  }, [session, refresh]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  if (!session) return <SignInPrompt what="your notifications" />;
  if (!rows) return <LoadingState />;

  return (
    <FlatList
      data={rows}
      keyExtractor={(r) => r.id}
      contentContainerStyle={styles.list}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          tintColor={C.rose}
          colors={[C.rose]}
          onRefresh={async () => {
            setRefreshing(true);
            await load();
            setRefreshing(false);
          }}
        />
      }
      ListEmptyComponent={<EmptyState icon="notifications-outline" title="No notifications yet" body="Order updates and offers will show up here." />}
      renderItem={({ item }) => (
        <View style={[styles.row, !item.is_read && styles.unread]}>
          <View style={styles.icon}>
            <Ionicons name={item.type === 'order' ? 'receipt-outline' : item.type === 'birthday' ? 'gift-outline' : 'notifications-outline'} size={18} color={C.rose} />
          </View>
          <View style={{ flex: 1, gap: 3 }}>
            <Text style={styles.title}>{item.title}</Text>
            {item.body ? <Text style={styles.body}>{item.body}</Text> : null}
            <Text style={styles.time}>{ago(item.created_at)}</Text>
          </View>
        </View>
      )}
    />
  );
}

const styles = StyleSheet.create({
  list: { padding: 16, gap: 10, maxWidth: MAX_W, width: '100%', alignSelf: 'center' },
  row: { flexDirection: 'row', gap: 12, backgroundColor: C.surface, borderRadius: R.lg, padding: 14, borderWidth: 1, borderColor: C.border },
  unread: { borderColor: C.rose, backgroundColor: C.white },
  icon: { width: 36, height: 36, borderRadius: 18, backgroundColor: C.roseSoft, alignItems: 'center', justifyContent: 'center' },
  title: { fontFamily: F.bodyBlack, fontSize: 14.5, color: C.ink },
  body: { fontFamily: F.body, fontSize: 14, color: C.ink, lineHeight: 20 },
  time: { fontFamily: F.body, fontSize: 12, color: C.muted },
});
