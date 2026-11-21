import Ionicons from '@expo/vector-icons/Ionicons';
import * as Haptics from 'expo-haptics';
import { useEffect, useState, type ComponentProps, type ReactNode } from 'react';
import {
  ActivityIndicator,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  type StyleProp,
  type TextInputProps,
  type ViewStyle,
} from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withRepeat, withTiming } from 'react-native-reanimated';
import { ORDER_STATUS_LABEL, PAYMENT_STATUS_LABEL, type OrderStatus, type PaymentStatus } from '@/lib/orders';
import { C, F, R, SHADOW } from '@/lib/theme';

export type IconName = ComponentProps<typeof Ionicons>['name'];

export function tap() {
  if (Platform.OS !== 'web') Haptics.selectionAsync().catch(() => {});
}

type Variant = 'primary' | 'dark' | 'outline' | 'ghost' | 'whatsapp' | 'danger' | 'light';

const VARIANTS: Record<Variant, { bg: string; fg: string; border: string }> = {
  primary: { bg: C.rose, fg: C.white, border: C.rose },
  dark: { bg: C.brown, fg: C.white, border: C.brown },
  outline: { bg: 'transparent', fg: C.brown, border: C.borderStrong },
  ghost: { bg: 'transparent', fg: C.rose, border: 'transparent' },
  whatsapp: { bg: C.whatsapp, fg: C.white, border: C.whatsapp },
  danger: { bg: 'transparent', fg: C.red, border: 'rgba(179,38,30,0.35)' },
  light: { bg: 'transparent', fg: C.white, border: C.white },
};

export function Button({
  title,
  onPress,
  variant = 'primary',
  disabled,
  loading,
  icon,
  size = 'md',
  style,
}: {
  title: string;
  onPress: () => void;
  variant?: Variant;
  disabled?: boolean;
  loading?: boolean;
  icon?: IconName;
  size?: 'sm' | 'md' | 'lg';
  style?: StyleProp<ViewStyle>;
}) {
  const v = VARIANTS[variant];
  const h = size === 'sm' ? 40 : size === 'lg' ? 56 : 50;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={title}
      accessibilityState={{ disabled: !!(disabled || loading), busy: !!loading }}
      onPress={() => {
        tap();
        onPress();
      }}
      disabled={disabled || loading}
      style={({ pressed }) => [
        styles.btn,
        { minHeight: h, backgroundColor: v.bg, borderColor: v.border, paddingHorizontal: size === 'sm' ? 16 : 22 },
        (variant === 'primary' || variant === 'dark') && { boxShadow: '0 6px 14px rgba(195,121,96,0.30)' },
        (disabled || loading) && { opacity: 0.5 },
        pressed && { transform: [{ scale: 0.97 }], opacity: 0.92 },
        style,
      ]}>
      {loading ? (
        <ActivityIndicator color={v.fg} />
      ) : (
        <View style={styles.btnInner}>
          {icon ? <Ionicons name={icon} size={size === 'sm' ? 16 : 19} color={v.fg} /> : null}
          <Text numberOfLines={1} style={[styles.btnText, { color: v.fg, fontSize: size === 'sm' ? 14 : 16 }]}>{title}</Text>
        </View>
      )}
    </Pressable>
  );
}

export function IconButton({
  icon,
  onPress,
  label,
  badge,
  color = C.brown,
  bg = C.surface,
  size = 42,
}: {
  icon: IconName;
  onPress: () => void;
  label: string;
  badge?: number;
  color?: string;
  bg?: string;
  size?: number;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      hitSlop={6}
      onPress={() => {
        tap();
        onPress();
      }}
      style={({ pressed }) => [
        styles.iconBtn,
        { width: size, height: size, borderRadius: size / 2, backgroundColor: bg },
        pressed && { transform: [{ scale: 0.92 }] },
      ]}>
      <Ionicons name={icon} size={size * 0.5} color={color} />
      {badge ? (
        <View style={styles.badgeDot}>
          <Text style={styles.badgeDotText}>{badge > 9 ? '9+' : badge}</Text>
        </View>
      ) : null}
    </Pressable>
  );
}

export function Chip({
  label,
  selected,
  onPress,
  sub,
  icon,
  disabled,
}: {
  label: string;
  selected?: boolean;
  onPress: () => void;
  sub?: string;
  icon?: IconName;
  disabled?: boolean;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected, disabled }}
      disabled={disabled}
      onPress={() => {
        tap();
        onPress();
      }}
      style={({ pressed }) => [
        styles.chip,
        selected && styles.chipOn,
        disabled && { opacity: 0.4 },
        pressed && { transform: [{ scale: 0.96 }] },
      ]}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
        {icon ? <Ionicons name={icon} size={15} color={selected ? C.white : C.brown} /> : null}
        <Text style={[styles.chipText, selected && { color: C.white }]}>{label}</Text>
      </View>
      {sub ? <Text style={[styles.chipSub, selected && { color: C.creamLight }]}>{sub}</Text> : null}
    </Pressable>
  );
}

export function Field({
  label,
  error,
  hint,
  right,
  icon,
  ...props
}: TextInputProps & { label: string; error?: string; hint?: string; right?: ReactNode; icon?: IconName }) {
  const [focused, setFocused] = useState(false);
  return (
    <View style={{ gap: 6 }}>
      <Text style={styles.label}>{label}</Text>
      <View
        style={[
          styles.inputWrap,
          focused && { borderColor: C.rose, boxShadow: '0 0 0 3px rgba(195,121,96,0.15)' },
          !!error && { borderColor: C.red },
        ]}>
        {icon ? <Ionicons name={icon} size={18} color={focused ? C.rose : C.muted} style={{ marginLeft: 14 }} /> : null}
        <TextInput
          placeholderTextColor={C.faint}
          accessibilityLabel={label}
          {...props}
          onFocus={(e) => {
            setFocused(true);
            props.onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            props.onBlur?.(e);
          }}
          style={[styles.input, props.multiline && { minHeight: 92, textAlignVertical: 'top' }, props.style]}
        />
        {right}
      </View>
      {error ? (
        <Text style={styles.fieldError} accessibilityLiveRegion="polite">
          {error}
        </Text>
      ) : hint ? (
        <Text style={styles.hint}>{hint}</Text>
      ) : null}
    </View>
  );
}

/** Tappable field that looks like an input (used for date pickers / selects). */
export function SelectField({
  label,
  value,
  placeholder,
  onPress,
  icon = 'calendar-outline',
  error,
}: {
  label: string;
  value: string;
  placeholder: string;
  onPress: () => void;
  icon?: IconName;
  error?: string;
}) {
  return (
    <View style={{ gap: 6 }}>
      <Text style={styles.label}>{label}</Text>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${label}: ${value || placeholder}`}
        onPress={onPress}
        style={[styles.inputWrap, { minHeight: 52, paddingHorizontal: 14, gap: 10 }, !!error && { borderColor: C.red }]}>
        <Ionicons name={icon} size={18} color={C.muted} />
        <Text style={[styles.selectText, !value && { color: C.faint }]}>{value || placeholder}</Text>
        <Ionicons name="chevron-down" size={16} color={C.muted} />
      </Pressable>
      {error ? <Text style={styles.fieldError}>{error}</Text> : null}
    </View>
  );
}

export function Card({ children, style }: { children: ReactNode; style?: StyleProp<ViewStyle> }) {
  return <View style={[styles.card, style]}>{children}</View>;
}

/** Website-style section heading: small rose eyebrow + Playfair title. */
export function SectionTitle({
  children,
  eyebrow,
  action,
  onAction,
}: {
  children: ReactNode;
  eyebrow?: string;
  action?: string;
  onAction?: () => void;
}) {
  return (
    <View style={styles.sectionRow}>
      <View style={{ flex: 1, gap: 2 }}>
        {eyebrow ? <Text style={styles.eyebrow}>{eyebrow}</Text> : null}
        <Text style={styles.section} accessibilityRole="header">
          {children}
        </Text>
      </View>
      {action && onAction ? (
        <Pressable onPress={onAction} hitSlop={8} accessibilityRole="button">
          <Text style={styles.sectionAction}>{action}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const STATUS_TONE: Record<OrderStatus, { fg: string; bg: string }> = {
  pending: { fg: C.amber, bg: C.amberBg },
  confirmed: { fg: C.blue, bg: C.blueBg },
  baking: { fg: C.rose, bg: C.roseSoft },
  ready: { fg: C.blue, bg: C.blueBg },
  out_for_delivery: { fg: C.brown, bg: C.cream },
  delivered: { fg: C.green, bg: C.greenBg },
  cancelled: { fg: C.red, bg: C.redBg },
};

export function StatusBadge({ status }: { status: OrderStatus }) {
  const t = STATUS_TONE[status] ?? STATUS_TONE.pending;
  return <Pill text={ORDER_STATUS_LABEL[status] ?? status} fg={t.fg} bg={t.bg} />;
}

export function PaymentBadge({ status }: { status: PaymentStatus }) {
  const ok = status === 'advance_paid' || status === 'paid_full';
  return (
    <Pill
      text={PAYMENT_STATUS_LABEL[status] ?? status}
      fg={ok ? C.green : status === 'refunded' ? C.blue : C.amber}
      bg={ok ? C.greenBg : status === 'refunded' ? C.blueBg : C.amberBg}
    />
  );
}

export function Pill({ text, fg, bg }: { text: string; fg: string; bg: string }) {
  return (
    <View style={[styles.pill, { backgroundColor: bg }]}>
      <Text style={[styles.pillText, { color: fg }]}>{text}</Text>
    </View>
  );
}

export function Row({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <View style={styles.row}>
      <Text style={[styles.rowLabel, strong && { color: C.ink, fontFamily: F.bodyBold }]}>{label}</Text>
      <Text style={[styles.rowValue, strong && { fontFamily: F.bodyBlack, color: C.brown, fontSize: 17 }]} selectable>
        {value}
      </Text>
    </View>
  );
}

export function Divider() {
  return <View style={{ height: StyleSheet.hairlineWidth, backgroundColor: C.borderStrong, marginVertical: 2 }} />;
}

export function Centered({ children }: { children: ReactNode }) {
  return <View style={styles.centered}>{children}</View>;
}

export function LoadingState({ text = 'Loading…' }: { text?: string }) {
  return (
    <Centered>
      <ActivityIndicator color={C.rose} size="large" />
      <Text style={styles.muted}>{text}</Text>
    </Centered>
  );
}

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <Centered>
      <View style={[styles.stateIcon, { backgroundColor: C.redBg }]}>
        <Ionicons name="cloud-offline-outline" size={30} color={C.red} />
      </View>
      <Text style={styles.stateTitle}>Something went wrong</Text>
      <Text style={[styles.muted, { textAlign: 'center' }]}>{message}</Text>
      {onRetry ? <Button title="Try again" icon="refresh" onPress={onRetry} variant="outline" /> : null}
    </Centered>
  );
}

export function EmptyState({
  icon = 'sparkles-outline',
  title,
  body,
  action,
  onAction,
}: {
  icon?: IconName;
  title: string;
  body?: string;
  action?: string;
  onAction?: () => void;
}) {
  return (
    <View style={[styles.centered, { paddingVertical: 48 }]}>
      <View style={styles.stateIcon}>
        <Ionicons name={icon} size={30} color={C.rose} />
      </View>
      <Text style={styles.stateTitle}>{title}</Text>
      {body ? <Text style={[styles.muted, { textAlign: 'center', maxWidth: 300 }]}>{body}</Text> : null}
      {action && onAction ? <Button title={action} onPress={onAction} style={{ marginTop: 6 }} /> : null}
    </View>
  );
}

export function Skeleton({ style }: { style?: StyleProp<ViewStyle> }) {
  const o = useSharedValue(0.5);
  useEffect(() => {
    o.value = withRepeat(withTiming(1, { duration: 750 }), -1, true);
  }, [o]);
  const a = useAnimatedStyle(() => ({ opacity: o.value }));
  return <Animated.View style={[{ backgroundColor: C.cream, borderRadius: R.md }, style, a]} />;
}

export function QtyStepper({ value, onChange, min = 1, max = 50 }: { value: number; onChange: (n: number) => void; min?: number; max?: number }) {
  return (
    <View style={styles.stepper}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Decrease quantity"
        disabled={value <= min}
        onPress={() => {
          tap();
          onChange(Math.max(min, value - 1));
        }}
        style={[styles.stepBtn, value <= min && { opacity: 0.35 }]}>
        <Ionicons name="remove" size={18} color={C.brown} />
      </Pressable>
      <Text style={styles.stepVal} accessibilityLabel={`Quantity ${value}`}>
        {value}
      </Text>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Increase quantity"
        disabled={value >= max}
        onPress={() => {
          tap();
          onChange(Math.min(max, value + 1));
        }}
        style={[styles.stepBtn, value >= max && { opacity: 0.35 }]}>
        <Ionicons name="add" size={18} color={C.brown} />
      </Pressable>
    </View>
  );
}

export function Notice({ text, tone = 'info' }: { text: string; tone?: 'info' | 'error' | 'success' }) {
  const t =
    tone === 'error'
      ? { fg: C.red, bg: C.redBg, icon: 'alert-circle' as const }
      : tone === 'success'
        ? { fg: C.green, bg: C.greenBg, icon: 'checkmark-circle' as const }
        : { fg: C.brownDark, bg: C.cream, icon: 'information-circle' as const };
  return (
    <View style={[styles.notice, { backgroundColor: t.bg }]} accessibilityLiveRegion="polite">
      <Ionicons name={t.icon} size={18} color={t.fg} />
      <Text style={[styles.noticeText, { color: t.fg }]}>{text}</Text>
    </View>
  );
}

export function ListRow({
  icon,
  title,
  sub,
  onPress,
  badge,
  danger,
}: {
  icon: IconName;
  title: string;
  sub?: string;
  onPress: () => void;
  badge?: number;
  danger?: boolean;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={() => {
        tap();
        onPress();
      }}
      style={({ pressed }) => [styles.listRow, pressed && { backgroundColor: C.cream }]}>
      <View style={[styles.listIcon, danger && { backgroundColor: C.redBg }]}>
        <Ionicons name={icon} size={19} color={danger ? C.red : C.rose} />
      </View>
      <View style={{ flex: 1, gap: 1 }}>
        <Text style={[styles.listTitle, danger && { color: C.red }]}>{title}</Text>
        {sub ? <Text style={styles.small}>{sub}</Text> : null}
      </View>
      {badge ? (
        <View style={styles.countPill}>
          <Text style={styles.countPillText}>{badge}</Text>
        </View>
      ) : null}
      {!danger ? <Ionicons name="chevron-forward" size={18} color={C.faint} /> : null}
    </Pressable>
  );
}

export const T = StyleSheet.create({
  h1: { fontFamily: F.heading, fontSize: 30, color: C.brown, lineHeight: 38 },
  h2: { fontFamily: F.heading, fontSize: 23, color: C.brown, lineHeight: 30 },
  h3: { fontFamily: F.heading, fontSize: 18, color: C.ink, lineHeight: 24 },
  body: { fontFamily: F.body, fontSize: 15, color: C.ink, lineHeight: 22 },
  bold: { fontFamily: F.bodyBold, fontSize: 15, color: C.ink },
  muted: { fontFamily: F.body, fontSize: 14, color: C.muted, lineHeight: 20 },
  small: { fontFamily: F.body, fontSize: 12.5, color: C.muted },
  price: { fontFamily: F.bodyBlack, fontSize: 16, color: C.rose, fontVariant: ['tabular-nums'] },
  eyebrow: { fontFamily: F.bodyBold, fontSize: 11, letterSpacing: 2.6, color: C.rose, textTransform: 'uppercase' },
});

const styles = StyleSheet.create({
  btn: { borderRadius: R.pill, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center' },
  btnInner: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  btnText: { fontFamily: F.bodyBold, letterSpacing: 0.2 },
  iconBtn: { alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: C.border },
  badgeDot: {
    position: 'absolute',
    top: -3,
    right: -3,
    minWidth: 19,
    height: 19,
    borderRadius: 10,
    backgroundColor: C.rose,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
    borderWidth: 2,
    borderColor: C.page,
  },
  badgeDotText: { color: C.white, fontSize: 10, fontFamily: F.bodyBlack },
  chip: {
    paddingHorizontal: 15,
    paddingVertical: 9,
    borderRadius: R.pill,
    borderWidth: 1.5,
    borderColor: C.border,
    backgroundColor: C.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipOn: { backgroundColor: C.brown, borderColor: C.brown },
  chipText: { color: C.brown, fontFamily: F.bodyBold, fontSize: 14 },
  chipSub: { color: C.muted, fontSize: 12, marginTop: 1, fontFamily: F.body },
  label: { color: C.brownDark, fontFamily: F.bodyBold, fontSize: 13.5, letterSpacing: 0.2 },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: C.border,
    backgroundColor: C.white,
    borderRadius: R.md,
    borderCurve: 'continuous',
  },
  input: { flex: 1, paddingHorizontal: 14, paddingVertical: 14, fontSize: 16, color: C.ink, fontFamily: F.body },
  selectText: { flex: 1, fontSize: 16, color: C.ink, fontFamily: F.body },
  fieldError: { color: C.red, fontSize: 13, fontFamily: F.bodyBold },
  hint: { color: C.muted, fontSize: 12.5, fontFamily: F.body },
  card: {
    backgroundColor: C.surface,
    borderRadius: R.lg,
    padding: 16,
    gap: 10,
    borderCurve: 'continuous',
    borderWidth: 1,
    borderColor: C.border,
    boxShadow: SHADOW.card,
  },
  sectionRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 12 },
  eyebrow: { fontFamily: F.bodyBold, fontSize: 11, letterSpacing: 2.6, color: C.rose, textTransform: 'uppercase' },
  section: { fontSize: 22, fontFamily: F.heading, color: C.brown },
  sectionAction: { color: C.rose, fontFamily: F.bodyBold, fontSize: 14, paddingBottom: 3 },
  pill: { alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 4, borderRadius: R.pill },
  pillText: { fontSize: 12, fontFamily: F.bodyBlack, letterSpacing: 0.2 },
  row: { flexDirection: 'row', justifyContent: 'space-between', gap: 12, alignItems: 'center' },
  rowLabel: { color: C.muted, fontSize: 15, flexShrink: 1, fontFamily: F.body },
  rowValue: { color: C.ink, fontSize: 15, fontFamily: F.bodyBold, textAlign: 'right', flexShrink: 1, fontVariant: ['tabular-nums'] },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 28, gap: 12 },
  muted: { color: C.muted, fontSize: 15, fontFamily: F.body, lineHeight: 21 },
  small: { color: C.muted, fontSize: 13, fontFamily: F.body },
  stateIcon: { width: 68, height: 68, borderRadius: 34, backgroundColor: C.roseSoft, alignItems: 'center', justifyContent: 'center' },
  stateTitle: { fontFamily: F.heading, fontSize: 20, color: C.brown, textAlign: 'center' },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.white,
    borderRadius: R.pill,
    borderWidth: 1.5,
    borderColor: C.border,
    padding: 3,
  },
  stepBtn: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center', backgroundColor: C.surface },
  stepVal: { minWidth: 34, textAlign: 'center', fontFamily: F.bodyBlack, fontSize: 16, color: C.ink, fontVariant: ['tabular-nums'] },
  notice: { flexDirection: 'row', gap: 10, padding: 12, borderRadius: R.md, alignItems: 'flex-start' },
  noticeText: { flex: 1, fontFamily: F.bodyBold, fontSize: 14, lineHeight: 20 },
  listRow: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingVertical: 13, paddingHorizontal: 14, borderRadius: R.md },
  listIcon: { width: 38, height: 38, borderRadius: 12, backgroundColor: C.roseSoft, alignItems: 'center', justifyContent: 'center' },
  listTitle: { fontFamily: F.bodyBold, fontSize: 15.5, color: C.ink },
  countPill: { backgroundColor: C.rose, borderRadius: R.pill, paddingHorizontal: 8, paddingVertical: 2 },
  countPillText: { color: C.white, fontFamily: F.bodyBlack, fontSize: 12 },
});
