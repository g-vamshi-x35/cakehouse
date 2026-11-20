import { NativeTabs } from 'expo-router/native-tabs';
import { useAuth } from '@/lib/auth';
import { C } from '@/lib/theme';

export default function AppTabs() {
  const { isStaff } = useAuth();
  return (
    <NativeTabs backgroundColor={C.page} tintColor={C.brown} labelStyle={{ selected: { color: C.brown } }}>
      <NativeTabs.Trigger name="index">
        <NativeTabs.Trigger.Label>Menu</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf={{ default: 'birthday.cake', selected: 'birthday.cake.fill' }} md="cake" />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="orders">
        <NativeTabs.Trigger.Label>{isStaff ? 'Dashboard' : 'Orders'}</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf={{ default: 'bag', selected: 'bag.fill' }} md="shopping_bag" />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="account">
        <NativeTabs.Trigger.Label>Account</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf={{ default: 'person.crop.circle', selected: 'person.crop.circle.fill' }} md="account_circle" />
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
