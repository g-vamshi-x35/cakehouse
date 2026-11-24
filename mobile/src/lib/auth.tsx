import type { Session } from '@supabase/supabase-js';
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { readJSON, writeJSON } from './storage';
import { supabase } from './supabase';
import { normalizePhone } from './validation';

export type Role = 'customer' | 'owner' | 'employee' | 'delivery';
export type Profile = {
  id: string;
  role: Role;
  full_name: string | null;
  phone: string | null;
  birthday: string | null;
  avatar_url: string | null;
};

/**
 * The website signs customers in with email + password (Supabase Auth).
 * The app registers with a phone number instead, so a phone-only account is
 * stored under a private login id derived from the number. It is never shown
 * to the customer and nothing is emailed to it (signups are auto-confirmed on
 * this project). Customers who registered on the website log in with their
 * email as before — both kinds of account share the same profile, orders and
 * addresses tables.
 */
const PHONE_LOGIN_DOMAIN = 'phone.cakehousekmp.in';
export function phoneLoginEmail(phone: string) {
  return `${normalizePhone(phone)}@${PHONE_LOGIN_DOMAIN}`;
}
export function isPhoneLoginEmail(email: string | null | undefined) {
  return !!email && email.endsWith(`@${PHONE_LOGIN_DOMAIN}`);
}

const ONBOARDED_KEY = 'onboarded:v1';

type SignUpInput = { fullName: string; phone: string; birthday: string; password: string };
type Result = { error?: string };

type AuthState = {
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
  isStaff: boolean;
  onboarded: boolean;
  markOnboarded: () => void;
  signUp: (input: SignUpInput) => Promise<Result & { needsConfirmation?: boolean }>;
  signIn: (identifier: string, password: string) => Promise<Result>;
  refreshProfile: () => Promise<void>;
  updateProfile: (patch: Partial<Pick<Profile, 'full_name' | 'phone' | 'birthday'>>) => Promise<Result>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthState | null>(null);

function friendlyAuthError(message: string) {
  const m = message.toLowerCase();
  if (m.includes('already registered') || m.includes('already been registered') || m.includes('user already exists'))
    return 'This phone number is already registered. Please log in instead.';
  if (m.includes('invalid login credentials')) return 'Incorrect phone number / email or password.';
  if (m.includes('email not confirmed')) return 'Please confirm your email address first, then log in.';
  if (m.includes('rate limit') || m.includes('too many')) return 'Too many attempts — please wait a minute and try again.';
  if (m.includes('network') || m.includes('fetch')) return 'No internet connection. Please check your network and try again.';
  if (m.includes('password')) return message;
  return 'Something went wrong. Please try again.';
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [onboarded, setOnboarded] = useState(() => readJSON(ONBOARDED_KEY, false));

  const loadProfile = useCallback(async (s: Session | null) => {
    if (!s) {
      setProfile(null);
      return;
    }
    const { data } = await supabase
      .from('profiles')
      .select('id, role, full_name, phone, birthday, avatar_url')
      .eq('id', s.user.id)
      .maybeSingle();
    setProfile((data as Profile | null) ?? null);
  }, []);

  useEffect(() => {
    supabase.auth
      .getSession()
      .then(async ({ data }) => {
        setSession(data.session);
        await loadProfile(data.session);
      })
      .finally(() => setLoading(false));
    const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
      // Defer the query: Supabase warns against awaiting inside this callback.
      setTimeout(() => loadProfile(s), 0);
    });
    return () => sub.subscription.unsubscribe();
  }, [loadProfile]);

  const markOnboarded = useCallback(() => {
    setOnboarded(true);
    writeJSON(ONBOARDED_KEY, true);
  }, []);

  const value = useMemo<AuthState>(
    () => ({
      session,
      profile,
      loading,
      onboarded,
      markOnboarded,
      isStaff: profile?.role === 'owner' || profile?.role === 'employee' || profile?.role === 'delivery',
      refreshProfile: () => loadProfile(session),
      async signUp({ fullName, phone, birthday, password }) {
        try {
          const digits = normalizePhone(phone);
          const { data, error } = await supabase.auth.signUp({
            email: phoneLoginEmail(digits),
            password,
            options: { data: { full_name: fullName.trim(), phone: digits } },
          });
          if (error) return { error: friendlyAuthError(error.message) };
          // Supabase returns a user with no identities when the id is taken.
          if (data.user && data.user.identities?.length === 0) {
            return { error: 'This phone number is already registered. Please log in instead.' };
          }
          if (!data.session) return { needsConfirmation: true };
          // The signup trigger creates the profile; the birthday is set
          // afterwards exactly like the website's signup action does.
          await supabase.from('profiles').update({ birthday }).eq('id', data.user!.id);
          await loadProfile(data.session);
          return {};
        } catch (e) {
          return { error: friendlyAuthError(String((e as Error)?.message ?? e)) };
        }
      },
      async signIn(identifier, password) {
        try {
          const id = identifier.trim();
          const email = id.includes('@') ? id.toLowerCase() : phoneLoginEmail(id);
          const { error } = await supabase.auth.signInWithPassword({ email, password });
          if (error) return { error: friendlyAuthError(error.message) };
          return {};
        } catch (e) {
          return { error: friendlyAuthError(String((e as Error)?.message ?? e)) };
        }
      },
      async updateProfile(patch) {
        if (!session) return { error: 'Please log in again.' };
        const { error } = await supabase.from('profiles').update(patch).eq('id', session.user.id);
        if (error) return { error: 'Could not save your details. Please try again.' };
        await loadProfile(session);
        return {};
      },
      async signOut() {
        await supabase.auth.signOut();
      },
    }),
    [session, profile, loading, onboarded, markOnboarded, loadProfile]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}

/** Details collected across the registration screens (kept in memory only). */
export const registrationDraft: { fullName: string; phone: string; birthday: string } = {
  fullName: '',
  phone: '',
  birthday: '',
};
