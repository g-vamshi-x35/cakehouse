import { Redirect, Tabs } from 'expo-router';
import TabBar from '@/components/tab-bar';
import { useAuth } from '@/lib/auth';

export default function TabsLayout() {
  const { session, onboarded } = useAuth();

  // First launch: show the welcome / registration flow.
  if (!session && !onboarded) return <Redirect href="/welcome" />;

  return (
    <Tabs tabBar={(props) => <TabBar {...props} />} screenOptions={{ headerShown: false }}>
      <Tabs.Screen name="index" options={{ title: 'Home' }} />
      <Tabs.Screen name="menu" options={{ title: 'Menu' }} />
      <Tabs.Screen name="custom-cake" options={{ title: 'Custom Cake' }} />
      <Tabs.Screen name="account" options={{ title: 'Account' }} />
    </Tabs>
  );
}
