// The project URL and publishable (anon) key are public by design: they're
// shipped to every visitor's browser, and Row Level Security is what
// protects the data. Defaulting to them means the site works even when
// .env.local is missing or misnamed (a common Windows pitfall:
// ".env.local.txt"). Set the env vars to point at a different project,
// e.g. a local `npx supabase start` stack.
const DEFAULT_SUPABASE_URL = "https://inmdzbagvradxvqtrjxx.supabase.co";
const DEFAULT_SUPABASE_PUBLISHABLE_KEY = "sb_publishable_FhOHtT7pDyL9cwglof2YTg_ytRpNAsu";

export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || DEFAULT_SUPABASE_URL;
export const SUPABASE_PUBLISHABLE_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || DEFAULT_SUPABASE_PUBLISHABLE_KEY;

export function isSupabaseConfigured(): boolean {
  return Boolean(SUPABASE_URL && SUPABASE_PUBLISHABLE_KEY);
}
