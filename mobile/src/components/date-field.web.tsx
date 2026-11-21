import { createElement } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { ymd } from '@/lib/validation';
import { C, F, R } from '@/lib/theme';

type Props = {
  label: string;
  value: Date | null;
  onChange: (d: Date) => void;
  placeholder?: string;
  minimumDate?: Date;
  maximumDate?: Date;
  error?: string;
};

/** Web preview: the browser's own date input. */
export function DateField({ label, value, onChange, minimumDate, maximumDate, error }: Props) {
  return (
    <View style={{ gap: 6 }}>
      <Text style={styles.label}>{label}</Text>
      {createElement('input', {
        type: 'date',
        'aria-label': label,
        value: value ? ymd(value) : '',
        min: minimumDate ? ymd(minimumDate) : undefined,
        max: maximumDate ? ymd(maximumDate) : undefined,
        onChange: (e: { target: { value: string } }) => {
          const v = e.target.value;
          if (v) onChange(new Date(`${v}T00:00:00`));
        },
        style: {
          border: `1.5px solid ${error ? C.red : C.border}`,
          borderRadius: R.md,
          padding: '14px',
          fontSize: 16,
          fontFamily: F.body,
          color: C.ink,
          background: C.white,
        },
      })}
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  label: { color: C.brownDark, fontFamily: F.bodyBold, fontSize: 13.5 },
  error: { color: C.red, fontSize: 13, fontFamily: F.bodyBold },
});
