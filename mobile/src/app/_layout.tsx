import { Lato_400Regular, Lato_700Bold, Lato_900Black } from '@expo-google-fonts/lato';
import {
  PlayfairDisplay_400Regular_Italic,
  PlayfairDisplay_600SemiBold,
  PlayfairDisplay_700Bold,
} from '@expo-google-fonts/playfair-display';
import * as Notifications from 'expo-notifications';
import { useFonts } from 'expo-font';
import { Stack, router } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { Platform } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { AuthProvider, useAuth } from '@/lib/auth';
import { CartProvider } from '@/lib/cart';
import { NotificationsProvider } from '@/lib/notifications';
import { StaffAlertsProvider } from '@/lib/staff-alerts';
import { C, F } from '@/lib/theme';

SplashScreen.preventAutoHideAsync().catch(() => {});
SplashScreen.setOptions({ duration: 400, fade: true });

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    PlayfairDisplay_700Bold,
    PlayfairDisplay_600SemiBold,
    PlayfairDisplay_400Regular_Italic,
    Lato_400Regular,
    Lato_700Bold,
    Lato_900Black,
  });

  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: C.page }}>
      <AuthProvider>
        <CartProvider>
          <NotificationsProvider>
            <StatusBar style="dark" />
            <StaffAlertsProvider>{fontsLoaded || fontError ? <RootStack /> : null}</StaffAlertsProvider>
          </NotificationsProvider>
        </CartProvider>
      </AuthProvider>
    </GestureHandlerRootView>
  );
}

function RootStack() {
  const { loading } = useAuth();

  useEffect(() => {
    if (!loading) SplashScreen.hideAsync().catch(() => {});
  }, [loading]);

  // Tapping an order-update notification opens the notifications list.
  useEffect(() => {
    if (Platform.OS === 'web') return;
    const sub = Notifications.addNotificationResponseReceivedListener((res) => {
      const url = res.notification.request.content.data?.url;
      if (typeof url === 'string') router.push(url as '/notifications');
    });
    return () => sub.remove();
  }, []);

  if (loading) return null;

  return (
    <Stack
      screenOptions={{
        headerTintColor: C.brown,
        headerStyle: { backgroundColor: C.page },
        headerTitleStyle: { fontFamily: F.heading, fontSize: 19, color: C.brown },
        headerShadowVisible: false,
        contentStyle: { backgroundColor: C.page },
        headerBackButtonDisplayMode: 'minimal',
        animation: 'slide_from_right',
      }}>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="welcome" options={{ headerShown: false, animation: 'fade' }} />
      <Stack.Screen name="register/details" options={{ title: '' }} />
      <Stack.Screen name="register/password" options={{ title: '' }} />
      <Stack.Screen name="register/success" options={{ headerShown: false, gestureEnabled: false, animation: 'fade' }} />
      <Stack.Screen name="login" options={{ title: '' }} />
      <Stack.Screen name="product/[id]" options={{ title: '', headerTransparent: true }} />
      <Stack.Screen name="premium" options={{ title: '', headerTransparent: true, headerTintColor: C.cream }} />
      <Stack.Screen name="cart" options={{ title: 'Your Cart' }} />
      <Stack.Screen name="checkout" options={{ title: 'Checkout' }} />
      <Stack.Screen name="order-placed/[id]" options={{ headerShown: false, gestureEnabled: false, animation: 'fade' }} />
      <Stack.Screen name="orders/index" options={{ title: 'My Orders' }} />
      <Stack.Screen name="orders/[id]" options={{ title: 'Track Order' }} />
      <Stack.Screen name="profile" options={{ title: 'Personal Details' }} />
      <Stack.Screen name="addresses" options={{ title: 'Saved Addresses' }} />
      <Stack.Screen name="notifications" options={{ title: 'Notifications' }} />
      <Stack.Screen name="custom-requests" options={{ title: 'Custom Cake Requests' }} />
      <Stack.Screen name="staff" options={{ title: 'Dashboard' }} />
      <Stack.Screen name="staff-order/[id]" options={{ title: 'Order' }} />
    </Stack>
  );
}
