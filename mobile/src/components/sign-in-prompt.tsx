import { router } from 'expo-router';
import { EmptyState } from '@/components/ui';

export function SignInPrompt({ what }: { what: string }) {
  return (
    <EmptyState
      icon="lock-closed-outline"
      title="Please log in"
      body={`Log in to see ${what}.`}
      action="Log in"
      onAction={() => router.push('/login')}
    />
  );
}
