import { Tabs, TabList, TabTrigger, TabSlot, type TabTriggerSlotProps } from 'expo-router/ui';
import { Pressable, StyleSheet, Text, View, type PressableProps } from 'react-native';
import { useAuth } from '@/lib/auth';
import { C, R } from '@/lib/theme';

// Web preview (npx expo start --web): a simple bottom tab bar.
export default function AppTabs() {
  const { isStaff } = useAuth();
  return (
    <Tabs>
      <TabSlot style={{ flex: 1 }} />
      <TabList asChild>
        <View style={styles.bar}>
        <TabTrigger name="index" href="/" asChild>
          <TabButton>Menu</TabButton>
        </TabTrigger>
        <TabTrigger name="orders" href="/orders" asChild>
          <TabButton>{isStaff ? 'Dashboard' : 'Orders'}</TabButton>
        </TabTrigger>
        <TabTrigger name="account" href="/account" asChild>
          <TabButton>Account</TabButton>
        </TabTrigger>
        </View>
      </TabList>
    </Tabs>
  );
}

function TabButton({ children, isFocused, ...props }: TabTriggerSlotProps) {
  return (
    <Pressable {...(props as PressableProps)} style={styles.tab}>
      <View style={[styles.pill, isFocused && { backgroundColor: C.brown }]}>
        <Text style={[styles.text, isFocused && { color: C.white }]}>{children}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  bar: { flexDirection: 'row', backgroundColor: C.creamLight, borderTopWidth: 1, borderColor: C.border, paddingVertical: 8 },
  tab: { flex: 1, alignItems: 'center' },
  pill: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: R.pill },
  text: { color: C.brown, fontWeight: '700' },
});
