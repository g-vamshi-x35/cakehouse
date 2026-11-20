import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { AuthProvider } from '@/lib/auth';
import { C } from '@/lib/theme';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  useEffect(() => {
    SplashScreen.hideAsync();
  }, []);

  return (
    <AuthProvider>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerTintColor: C.brown,
          headerStyle: { backgroundColor: C.page },
          headerTitleStyle: { fontWeight: '800' },
          contentStyle: { backgroundColor: C.page },
          headerBackButtonDisplayMode: 'minimal',
        }}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="product/[id]" options={{ title: '' }} />
        <Stack.Screen name="order-placed/[id]" options={{ title: 'Order Placed', headerBackVisible: false, gestureEnabled: false }} />
        <Stack.Screen name="staff-order/[id]" options={{ title: 'Order' }} />
      </Stack>
    </AuthProvider>
  );
}
