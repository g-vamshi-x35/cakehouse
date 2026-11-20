import type { ReactNode } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  type TextInputProps,
  type ViewStyle,
} from 'react-native';
import { C, R } from '@/lib/theme';
import type { OrderStatus } from '@/lib/orders';
import { ORDER_STATUS_LABEL } from '@/lib/orders';

export function Button({
  title,
  onPress,
  variant = 'primary',
  disabled,
  loading,
  style,
}: {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'outline' | 'whatsapp' | 'danger';
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
}) {
  const bg =
    variant === 'primary' ? C.rose : variant === 'whatsapp' ? '#25d366' : variant === 'danger' ? C.red : 'transparent';
  const fg = variant === 'outline' ? C.brown : C.white;
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      disabled={disabled || loading}
      style={({ pressed }) => [
        styles.btn,
        { backgroundColor: bg, borderColor: variant === 'outline' ? C.brown : bg },
        (disabled || loading) && { opacity: 0.45 },
        pressed && { opacity: 0.8 },
        style,
      ]}>
      {loading ? <ActivityIndicator color={fg} /> : <Text style={[styles.btnText, { color: fg }]}>{title}</Text>}
    </Pressable>
  );
}

export function Chip({ label, selected, onPress, sub }: { label: string; selected?: boolean; onPress: () => void; sub?: string }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={onPress}
      style={[styles.chip, selected && styles.chipOn]}>
      <Text style={[styles.chipText, selected && { color: C.white }]}>{label}</Text>
      {sub ? <Text style={[styles.chipSub, selected && { color: C.creamLight }]}>{sub}</Text> : null}
    </Pressable>
  );
}

export function Field({ label, ...props }: TextInputProps & { label: string }) {
  return (
    <View style={{ gap: 6 }}>
      <Text style={styles.label}>{label}</Text>
      <TextInput placeholderTextColor="rgba(43,26,21,0.35)" accessibilityLabel={label} {...props} style={[styles.input, props.multiline && { minHeight: 76, textAlignVertical: 'top' }, props.style]} />
    </View>
  );
}

export function Card({ children, style }: { children: ReactNode; style?: ViewStyle }) {
  return <View style={[styles.card, style]}>{children}</View>;
}

export function SectionTitle({ children }: { children: ReactNode }) {
  return <Text style={styles.section}>{children}</Text>;
}

export function StatusBadge({ status }: { status: OrderStatus }) {
  const done = status === 'delivered';
  const bad = status === 'cancelled';
  return (
    <View style={[styles.badge, { backgroundColor: done ? C.greenBg : bad ? C.redBg : C.amberBg }]}>
      <Text style={[styles.badgeText, { color: done ? C.green : bad ? C.red : C.amber }]}>{ORDER_STATUS_LABEL[status]}</Text>
    </View>
  );
}

export function Row({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <View style={styles.row}>
      <Text style={[styles.rowLabel, strong && { color: C.ink, fontWeight: '700' }]}>{label}</Text>
      <Text style={[styles.rowValue, strong && { fontWeight: '800', color: C.brown }]} selectable>
        {value}
      </Text>
    </View>
  );
}

export function Centered({ children }: { children: ReactNode }) {
  return <View style={styles.centered}>{children}</View>;
}

const styles = StyleSheet.create({
  btn: { minHeight: 50, borderRadius: R.pill, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 20 },
  btnText: { fontSize: 16, fontWeight: '700' },
  chip: { paddingHorizontal: 14, paddingVertical: 9, borderRadius: R.pill, borderWidth: 1.5, borderColor: C.border, backgroundColor: C.creamLight, alignItems: 'center' },
  chipOn: { backgroundColor: C.brown, borderColor: C.brown },
  chipText: { color: C.brown, fontWeight: '700', fontSize: 14 },
  chipSub: { color: C.muted, fontSize: 12, marginTop: 1 },
  label: { color: C.brown, fontWeight: '700', fontSize: 14 },
  input: { borderWidth: 1.5, borderColor: C.border, backgroundColor: C.white, borderRadius: R.md, paddingHorizontal: 14, paddingVertical: 12, fontSize: 16, color: C.ink },
  card: { backgroundColor: C.creamLight, borderRadius: R.lg, padding: 16, gap: 10, borderCurve: 'continuous' },
  section: { fontSize: 17, fontWeight: '800', color: C.brown, marginTop: 6 },
  badge: { alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 4, borderRadius: R.pill },
  badgeText: { fontSize: 12, fontWeight: '800' },
  row: { flexDirection: 'row', justifyContent: 'space-between', gap: 12 },
  rowLabel: { color: C.muted, fontSize: 15, flexShrink: 1 },
  rowValue: { color: C.ink, fontSize: 15, fontWeight: '600', textAlign: 'right', flexShrink: 1, fontVariant: ['tabular-nums'] },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24, gap: 12 },
});
