import 'expo-sqlite/localStorage/install';
import { createClient } from '@supabase/supabase-js';
import { AppState, Platform } from 'react-native';

// Same project as the website. The URL and publishable key are public by
// design (Row Level Security protects the data), so they're built in as
// defaults; set EXPO_PUBLIC_SUPABASE_URL / _PUBLISHABLE_KEY in .env.local to
// point the app at another project (e.g. a local `npx supabase start`).
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://inmdzbagvradxvqtrjxx.supabase.co';
const supabaseKey =
  process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY || 'sb_publishable_FhOHtT7pDyL9cwglof2YTg_ytRpNAsu';

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    storage: localStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

// Only refresh the session while the app is in the foreground.
if (Platform.OS !== 'web') {
  AppState.addEventListener('change', (state) => {
    if (state === 'active') supabase.auth.startAutoRefresh();
    else supabase.auth.stopAutoRefresh();
  });
}
