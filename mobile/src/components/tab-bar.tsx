import Ionicons from '@expo/vector-icons/Ionicons';
import type { BottomTabBarProps } from 'expo-router/js-tabs';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { tap, type IconName } from '@/components/ui';
import { useNotifications } from '@/lib/notifications';
import { C, F, SHADOW } from '@/lib/theme';

const ICONS: Record<string, { on: IconName; off: IconName; label: string }> = {
  index: { on: 'home', off: 'home-outline', label: 'Home' },
  menu: { on: 'restaurant', off: 'restaurant-outline', label: 'Menu' },
  'custom-cake': { on: 'color-palette', off: 'color-palette-outline', label: 'Custom Cake' },
  account: { on: 'person-circle', off: 'person-circle-outline', label: 'Account' },
};

export default function TabBar({ state, emitter, navigateToTab, insets }: BottomTabBarProps) {
  const { unread } = useNotifications();
  return (
    <View style={[styles.wrap, { paddingBottom: Math.max(insets.bottom, 10) }]}>
      <View style={styles.bar} role="tablist">
        {state.routes.map((route, index) => {
          const focused = index === state.index;
          const meta = ICONS[route.name] ?? { on: 'ellipse', off: 'ellipse-outline', label: route.name };
          const onPress = () => {
            tap();
            const event = emitter.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
            if (!focused && !event.defaultPrevented) navigateToTab(route.key);
          };
          return (
            <Tab
              key={route.key}
              focused={focused}
              icon={focused ? meta.on : meta.off}
              label={meta.label}
              badge={route.name === 'account' ? unread : 0}
              onPress={onPress}
              position={`${index + 1} of ${state.routes.length}`}
            />
          );
        })}
      </View>
    </View>
  );
}

function Tab({
  focused,
  icon,
  label,
  badge,
  onPress,
  position,
}: {
  focused: boolean;
  icon: IconName;
  label: string;
  badge: number;
  onPress: () => void;
  position: string;
}) {
  const pill = useAnimatedStyle(() => ({
    transform: [{ scale: withSpring(focused ? 1 : 0.6, { damping: 16, stiffness: 220 }) }],
    opacity: withSpring(focused ? 1 : 0, { damping: 20 }),
  }));
  return (
    <Pressable
      role="tab"
      accessibilityRole="tab"
      accessibilityState={{ selected: focused }}
      accessibilityLabel={`${label}, tab, ${position}`}
      onPress={onPress}
      style={styles.tab}>
      <View style={styles.iconWrap}>
        <Animated.View style={[styles.pill, pill]} />
        <Ionicons name={icon} size={22} color={focused ? C.white : C.muted} />
        {badge > 0 ? (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{badge > 9 ? '9+' : badge}</Text>
          </View>
        ) : null}
      </View>
      <Text numberOfLines={1} style={[styles.label, focused && { color: C.brown, fontFamily: F.bodyBlack }]}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: { backgroundColor: C.page, paddingHorizontal: 12, paddingTop: 6 },
  bar: {
    flexDirection: 'row',
    backgroundColor: C.surface,
    borderRadius: 26,
    paddingVertical: 8,
    paddingHorizontal: 6,
    borderWidth: 1,
    borderColor: C.border,
    boxShadow: SHADOW.bar,
    borderCurve: 'continuous',
    maxWidth: 560,
    width: '100%',
    alignSelf: 'center',
  },
  tab: { flex: 1, alignItems: 'center', gap: 3, minHeight: 52, justifyContent: 'center' },
  iconWrap: { width: 54, height: 32, alignItems: 'center', justifyContent: 'center' },
  pill: { ...StyleSheet.absoluteFill, borderRadius: 16, backgroundColor: C.rose },
  label: { fontSize: 11.5, fontFamily: F.bodyBold, color: C.muted, letterSpacing: 0.2 },
  badge: {
    position: 'absolute',
    top: -4,
    right: 6,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    paddingHorizontal: 4,
    backgroundColor: C.brownDark,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: C.surface,
  },
  badgeText: { color: C.white, fontSize: 9.5, fontFamily: F.bodyBlack },
});
