import RNDateTimePicker, { DateTimePickerAndroid } from '@react-native-community/datetimepicker';
import { useState } from 'react';
import { Modal, Platform, Pressable, StyleSheet, View } from 'react-native';
import { Button, SelectField } from '@/components/ui';
import { prettyDate } from '@/lib/validation';
import { C, R } from '@/lib/theme';

type Props = {
  label: string;
  value: Date | null;
  onChange: (d: Date) => void;
  placeholder?: string;
  minimumDate?: Date;
  maximumDate?: Date;
  error?: string;
};

/** Native date picker (Android dialog / iOS sheet) behind an input-style field. */
export function DateField({ label, value, onChange, placeholder = 'Select a date', minimumDate, maximumDate, error }: Props) {
  const [iosOpen, setIosOpen] = useState(false);
  const [draft, setDraft] = useState<Date>(value ?? maximumDate ?? new Date());

  const open = () => {
    const initial = value ?? (maximumDate && maximumDate < new Date() ? maximumDate : minimumDate ?? new Date());
    if (Platform.OS === 'android') {
      DateTimePickerAndroid.open({
        value: initial,
        mode: 'date',
        minimumDate,
        maximumDate,
        onChange: (e, d) => {
          if (e.type === 'set' && d) onChange(d);
        },
      });
    } else {
      setDraft(initial);
      setIosOpen(true);
    }
  };

  return (
    <>
      <SelectField label={label} value={value ? prettyDate(value) : ''} placeholder={placeholder} onPress={open} error={error} />
      {Platform.OS === 'ios' ? (
        <Modal transparent visible={iosOpen} animationType="slide" onRequestClose={() => setIosOpen(false)}>
          <Pressable style={styles.backdrop} onPress={() => setIosOpen(false)} />
          <View style={styles.sheet}>
            <RNDateTimePicker
              value={draft}
              mode="date"
              display="spinner"
              minimumDate={minimumDate}
              maximumDate={maximumDate}
              onChange={(_, d) => d && setDraft(d)}
              textColor={C.ink}
            />
            <Button
              title="Done"
              onPress={() => {
                onChange(draft);
                setIosOpen(false);
              }}
            />
          </View>
        </Modal>
      ) : null}
    </>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(43,26,21,0.4)' },
  sheet: { backgroundColor: C.page, padding: 16, paddingBottom: 36, borderTopLeftRadius: R.xl, borderTopRightRadius: R.xl, gap: 8 },
});
