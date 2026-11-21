import Ionicons from '@expo/vector-icons/Ionicons';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { Alert, Linking, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, Card, ListRow } from '@/components/ui';
import { isPhoneLoginEmail, useAuth } from '@/lib/auth';
import { business, callPhone, openWhatsApp } from '@/lib/business';
import { LOGO, WEBSITE_URL } from '@/lib/images';
import { useNotifications } from '@/lib/notifications';
import { C, F, MAX_W, R, SHADOW } from '@/lib/theme';
import { prettyDate } from '@/lib/validation';

const ROLE_LABEL: Record<string, string> = { owner: 'Owner', employee: 'Employee', delivery: 'Delivery partner', customer: 'Customer' };

export default function AccountScreen() {
  const { session, profile, isStaff, signOut } = useAuth();
  const { unread } = useNotifications();

  if (!session) {
    return (
      <SafeAreaView style={styles.page} edges={['top']}>
        <ScrollView contentContainerStyle={styles.wrap}>
          <Animated.View entering={FadeInDown.duration(450)} style={styles.guest}>
            <Image source={LOGO} style={styles.guestLogo} alt="Cake House logo" />
            <Text style={styles.guestTitle}>Join Cake House</Text>
            <Text style={styles.guestBody}>Save your addresses, track orders, and get a birthday surprise every year.</Text>
            <Button title="Create an account" icon="sparkles" size="lg" onPress={() => router.push('/register/details')} style={{ alignSelf: 'stretch' }} />
            <Button title="Log in" variant="outline" size="lg" onPress={() => router.push('/login')} style={{ alignSelf: 'stretch' }} />
          </Animated.View>
          <ShopCard />
        </ScrollView>
      </SafeAreaView>
    );
  }

  const name = profile?.full_name || 'Cake House customer';
  const initials = name
    .split(/\s+/)
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
  const email = session.user.email;
  const contact = profile?.phone ? `+91 ${profile.phone}` : email && !isPhoneLoginEmail(email) ? email : '';

  function confirmLogout() {
    const go = () => signOut().then(() => router.replace('/'));
    if (Platform.OS === 'web') {
      go();
      return;
    }
    Alert.alert('Log out?', 'You can log back in any time with your phone number and password.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Log out', style: 'destructive', onPress: go },
    ]);
  }

  return (
    <SafeAreaView style={styles.page} edges={['top']}>
      <ScrollView contentContainerStyle={styles.wrap} showsVerticalScrollIndicator={false}>
        <Animated.View entering={FadeInDown.duration(450)} style={styles.profile}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>
          <View style={{ flex: 1, gap: 2 }}>
            <Text style={styles.name} numberOfLines={1}>
              {name}
            </Text>
            {contact ? <Text style={styles.contact}>{contact}</Text> : null}
            <View style={styles.roleRow}>
              <View style={styles.role}>
                <Text style={styles.roleText}>{ROLE_LABEL[profile?.role ?? 'customer']}</Text>
              </View>
              {profile?.birthday ? (
                <Text style={styles.bday}>
                  <Ionicons name="gift-outline" size={12} color={C.cream} /> {prettyDate(profile.birthday)}
                </Text>
              ) : null}
            </View>
          </View>
          <Ionicons name="create-outline" size={22} color={C.cream} onPress={() => router.push('/profile')} accessibilityLabel="Edit personal details" />
        </Animated.View>

        {isStaff ? (
          <Animated.View entering={FadeInDown.duration(450).delay(60)}>
            <Card style={{ padding: 6, gap: 0, backgroundColor: C.cream }}>
              <ListRow
                icon="speedometer-outline"
                title={`${ROLE_LABEL[profile?.role ?? 'employee']} dashboard`}
                sub="Orders, payments and status updates"
                onPress={() => router.push('/staff')}
              />
            </Card>
          </Animated.View>
        ) : null}

        <Animated.View entering={FadeInDown.duration(450).delay(100)}>
          <Card style={{ padding: 6, gap: 0 }}>
            <ListRow icon="receipt-outline" title="My orders" sub="Track status and order again" onPress={() => router.push('/orders')} />
            <ListRow icon="color-palette-outline" title="Custom cake requests" sub="Quotes and approvals" onPress={() => router.push('/custom-requests')} />
            <ListRow icon="notifications-outline" title="Notifications" badge={unread} onPress={() => router.push('/notifications')} />
          </Card>
        </Animated.View>

        <Animated.View entering={FadeInDown.duration(450).delay(150)}>
          <Card style={{ padding: 6, gap: 0 }}>
            <ListRow icon="person-outline" title="Personal details" sub="Name, phone, birthday" onPress={() => router.push('/profile')} />
            <ListRow icon="location-outline" title="Saved addresses" onPress={() => router.push('/addresses')} />
          </Card>
        </Animated.View>

        <ShopCard />

        <Card style={{ padding: 6, gap: 0 }}>
          <ListRow icon="globe-outline" title="Visit our website" onPress={() => Linking.openURL(WEBSITE_URL)} />
          <ListRow icon="log-out-outline" title="Log out" danger onPress={confirmLogout} />
        </Card>
        <Text style={styles.version}>Cake House app · {business.tagline}</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

function ShopCard() {
  return (
    <Card style={{ gap: 12 }}>
      <Text style={styles.shopTitle}>Contact the shop</Text>
      <Text style={styles.shopBody}>{business.address}</Text>
      <Text style={styles.shopMuted}>{business.hours}</Text>
      <View style={{ flexDirection: 'row', gap: 10 }}>
        <Button title="Call" icon="call-outline" variant="dark" size="sm" onPress={() => callPhone(business.phones[0])} style={{ flex: 1 }} />
        <Button title="WhatsApp" icon="logo-whatsapp" variant="whatsapp" size="sm" onPress={() => openWhatsApp(`Hi ${business.name}!`)} style={{ flex: 1 }} />
      </View>
      <Button title="Open in Maps" icon="navigate-outline" variant="outline" size="sm" onPress={() => Linking.openURL(business.mapsUrl)} />
    </Card>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: C.page },
  wrap: { padding: 16, paddingBottom: 32, gap: 14, maxWidth: MAX_W, width: '100%', alignSelf: 'center' },
  profile: { flexDirection: 'row', alignItems: 'center', gap: 14, backgroundColor: C.brown, borderRadius: R.xl, padding: 18, boxShadow: SHADOW.lifted },
  avatar: { width: 62, height: 62, borderRadius: 31, backgroundColor: C.rose, alignItems: 'center', justifyContent: 'center', borderWidth: 3, borderColor: C.cream },
  avatarText: { fontFamily: F.heading, fontSize: 22, color: C.white },
  name: { fontFamily: F.heading, fontSize: 21, color: C.white },
  contact: { fontFamily: F.body, fontSize: 14, color: C.creamLight },
  roleRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4 },
  role: { backgroundColor: 'rgba(240,215,167,0.22)', borderRadius: R.pill, paddingHorizontal: 9, paddingVertical: 2 },
  roleText: { fontFamily: F.bodyBold, fontSize: 11.5, color: C.cream },
  bday: { fontFamily: F.body, fontSize: 12, color: C.cream },
  guest: { alignItems: 'center', gap: 12, backgroundColor: C.surface, borderRadius: R.xl, padding: 22, borderWidth: 1, borderColor: C.border },
  guestLogo: { width: 84, height: 84, borderRadius: 42 },
  guestTitle: { fontFamily: F.heading, fontSize: 26, color: C.brown },
  guestBody: { fontFamily: F.body, fontSize: 14.5, color: C.muted, textAlign: 'center', lineHeight: 21, marginBottom: 4 },
  shopTitle: { fontFamily: F.heading, fontSize: 18, color: C.brown },
  shopBody: { fontFamily: F.body, fontSize: 14.5, color: C.ink, lineHeight: 20 },
  shopMuted: { fontFamily: F.body, fontSize: 13.5, color: C.muted },
  version: { textAlign: 'center', fontFamily: F.headingItalic, color: C.muted, fontSize: 12.5 },
});
