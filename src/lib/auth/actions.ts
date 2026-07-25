"use server";

import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";

export type AuthActionState = { error?: string } | null;
export type ForgotPasswordState = { error?: string; success?: boolean } | null;

function readNext(formData: FormData): string {
  const next = formData.get("next");
  return typeof next === "string" && next.startsWith("/") ? next : "/account";
}

export async function signUpAction(
  _prevState: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  const email = String(formData.get("email") || "").trim();
  const password = String(formData.get("password") || "");
  const fullName = String(formData.get("fullName") || "").trim();
  const phone = String(formData.get("phone") || "").trim();
  const birthday = String(formData.get("birthday") || "").trim();

  if (!email || !password || password.length < 6) {
    return { error: "Please enter a valid email and a password of at least 6 characters." };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { full_name: fullName, phone } },
  });

  if (error) return { error: error.message };

  if (data.user && birthday) {
    await supabase.from("profiles").update({ birthday }).eq("id", data.user.id);
  }

  redirect(readNext(formData));
}

export async function signInAction(
  _prevState: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  const email = String(formData.get("email") || "").trim();
  const password = String(formData.get("password") || "");

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { error: error.message };

  redirect(readNext(formData));
}

export async function staffSignInAction(
  _prevState: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  const email = String(formData.get("email") || "").trim();
  const password = String(formData.get("password") || "");

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { error: error.message };

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", data.user.id)
    .single();

  if (profile?.role === "owner") redirect("/dashboard/owner");
  if (profile?.role === "employee") redirect("/dashboard/employee");

  await supabase.auth.signOut();
  return { error: "This account doesn't have staff access." };
}

export async function requestPasswordResetAction(
  _prevState: ForgotPasswordState,
  formData: FormData
): Promise<ForgotPasswordState> {
  const email = String(formData.get("email") || "").trim();
  if (!email) return { error: "Please enter your email address." };

  const origin = (await headers()).get("origin") ?? "";
  const supabase = await createClient();
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${origin}/reset-password`,
  });

  // Always report success regardless of whether the email exists — this is
  // the standard anti-enumeration pattern so a bad actor can't use this form
  // to discover which addresses have accounts. The one exception worth
  // surfacing is rate-limiting, since that's actionable for a real user.
  if (error?.status === 429) return { error: "Too many attempts — please wait a bit and try again." };
  return { success: true };
}

export async function signOutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}
