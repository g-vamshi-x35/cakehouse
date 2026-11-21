import { Image } from 'expo-image';
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { FlatList, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { SignInPrompt } from '@/components/sign-in-prompt';
import { Button, EmptyState, ErrorState, LoadingState, Pill } from '@/components/ui';
import { useAuth } from '@/lib/auth';
import { business, openWhatsApp } from '@/lib/business';
import { formatDate, REQUEST_STATUS_LABEL, type CustomRequestStatus } from '@/lib/orders';
import { supabase } from '@/lib/supabase';
import { C, F, MAX_W, R } from '@/lib/theme';

type Req = {
  id: string;
  shape: string | null;
  size: string | null;
  layers: number | null;
  flavour: string | null;
  cream_type: string | null;
  theme: string | null;
  inspiration_image_url: string | null;
  event_date: string | null;
  status: CustomRequestStatus;
  quoted_price: number | null;
  owner_notes: string | null;
  created_at: string;
};

const TONE: Record<CustomRequestStatus, { fg: string; bg: string }> = {
  pending: { fg: C.amber, bg: C.amberBg },
  quoted: { fg: C.blue, bg: C.blueBg },
  approved: { fg: C.green, bg: C.greenBg },
  rejected: { fg: C.red, bg: C.redBg },
  converted: { fg: C.green, bg: C.greenBg },
};

export default function CustomRequests() {
  const { session } = useAuth();
  const [rows, setRows] = useState<Req[] | null>(null);
  const [error, setError] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    if (!session) return;
    const { data, error: e } = await supabase
      .from('custom_cake_requests')
      .select('id, shape, size, layers, flavour, cream_type, theme, inspiration_image_url, event_date, status, quoted_price, owner_notes, created_at')
      .eq('customer_id', session.user.id)
      .order('created_at', { ascending: false });
    if (e) setError("Couldn't load your requests.");
    else {
      setRows((data as Req[] | null) ?? []);
      setError('');
    }
  }, [session]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  if (!session) return <SignInPrompt what="your custom cake requests" />;
  if (error && !rows) return <ErrorState message={error} onRetry={load} />;
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
      ListEmptyComponent={
        <EmptyState
          icon="color-palette-outline"
          title="No requests yet"
          body="Design a custom cake and we’ll send you a quote."
          action="Design a cake"
          onAction={() => router.navigate('/custom-cake')}
        />
      }
      renderItem={({ item }) => {
        const t = TONE[item.status] ?? TONE.pending;
        return (
          <View style={styles.card}>
            <View style={{ flexDirection: 'row', gap: 12 }}>
              {item.inspiration_image_url ? (
                <Image source={{ uri: item.inspiration_image_url }} style={styles.img} contentFit="cover" alt="Inspiration photo" />
              ) : (
                <View style={[styles.img, styles.noImg]}>
                  <Text style={{ fontSize: 30 }}>🎂</Text>
                </View>
              )}
              <View style={{ flex: 1, gap: 4 }}>
                <Text style={styles.title} numberOfLines={1}>
                  {item.theme || `${item.shape ?? 'Custom'} cake`}
                </Text>
                <Text style={styles.meta}>{[item.size, item.flavour, item.cream_type].filter(Boolean).join(' · ')}</Text>
                <Text style={styles.meta}>
                  Requested {formatDate(item.created_at)}
                  {item.event_date ? ` · for ${formatDate(item.event_date)}` : ''}
                </Text>
                <Pill text={REQUEST_STATUS_LABEL[item.status] ?? item.status} fg={t.fg} bg={t.bg} />
              </View>
            </View>
            {item.quoted_price ? <Text style={styles.quote}>Quote: ₹{item.quoted_price}</Text> : null}
            {item.owner_notes ? <Text style={styles.notes}>{item.owner_notes}</Text> : null}
            {item.status === 'quoted' ? (
              <Button
                title="Accept quote on WhatsApp"
                icon="logo-whatsapp"
                variant="whatsapp"
                size="sm"
                onPress={() => openWhatsApp(`Hi ${business.name}! I'd like to go ahead with my custom cake (${item.theme ?? item.shape}) for ₹${item.quoted_price}.`)}
              />
            ) : null}
          </View>
        );
      }}
    />
  );
}

const styles = StyleSheet.create({
  list: { padding: 16, gap: 12, maxWidth: MAX_W, width: '100%', alignSelf: 'center' },
  card: { backgroundColor: C.surface, borderRadius: R.lg, padding: 12, gap: 10, borderWidth: 1, borderColor: C.border },
  img: { width: 84, height: 84, borderRadius: R.md },
  noImg: { backgroundColor: C.cream, alignItems: 'center', justifyContent: 'center' },
  title: { fontFamily: F.heading, fontSize: 17, color: C.brown },
  meta: { fontFamily: F.body, fontSize: 13, color: C.muted },
  quote: { fontFamily: F.bodyBlack, fontSize: 17, color: C.rose },
  notes: { fontFamily: F.body, fontSize: 14, color: C.ink, lineHeight: 20 },
});
