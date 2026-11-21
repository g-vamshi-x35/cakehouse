import Ionicons from '@expo/vector-icons/Ionicons';
import { Pressable } from 'react-native';
import { C } from '@/lib/theme';

export function EyeToggle({ shown, onToggle }: { shown: boolean; onToggle: () => void }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={shown ? 'Hide password' : 'Show password'}
      onPress={onToggle}
      hitSlop={8}
      style={{ paddingHorizontal: 14, paddingVertical: 10 }}>
      <Ionicons name={shown ? 'eye-off-outline' : 'eye-outline'} size={20} color={C.muted} />
    </Pressable>
  );
}
