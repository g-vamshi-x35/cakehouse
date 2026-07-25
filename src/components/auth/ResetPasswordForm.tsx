"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

const inputClasses =
  "w-full rounded-xl border border-brown/20 bg-cream-light px-4 py-3 text-sm text-ink placeholder:text-ink/40 focus:outline-none focus:ring-2 focus:ring-rose/60 transition-shadow";

export default function ResetPasswordForm() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    // The reset-link redirect establishes a temporary recovery session via
    // the URL — Supabase's client picks it up automatically on load and
    // fires this event once it's ready to accept a new password.
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") setReady(true);
    });

    supabase.auth.getSession().then(({ data }) => {
      if (data.session) setReady(true);
    });

    return () => subscription.unsubscribe();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords don't match.");
      return;
    }

    setSubmitting(true);
    const supabase = createClient();
    const { error: updateError } = await supabase.auth.updateUser({ password });
    setSubmitting(false);

    if (updateError) {
      setError(updateError.message);
      return;
    }
    setDone(true);
    setTimeout(() => router.push("/login"), 2000);
  }

  if (done) {
    return (
      <div className="bg-cream rounded-3xl p-8 max-w-md w-full text-center space-y-2">
        <h1 className="font-heading text-2xl text-brown">Password Updated!</h1>
        <p className="text-sm text-ink/70">Redirecting you to log in…</p>
      </div>
    );
  }

  if (!ready) {
    return (
      <div className="bg-cream rounded-3xl p-8 max-w-md w-full text-center space-y-3">
        <h1 className="font-heading text-2xl text-brown">Reset Link Required</h1>
        <p className="text-sm text-ink/70">
          Open this page from the reset link in your email — or your link may have expired.
        </p>
        <Link href="/forgot-password" className="inline-block text-sm text-rose font-semibold hover:text-brown">
          Request a new link
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-cream rounded-3xl p-8 space-y-4 max-w-md w-full">
      <h1 className="font-heading text-3xl text-brown mb-1">Set New Password</h1>
      <p className="text-ink/60 text-sm mb-4">Choose a new password for your account.</p>

      <input
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        type="password"
        required
        placeholder="New Password"
        className={inputClasses}
      />
      <input
        value={confirm}
        onChange={(e) => setConfirm(e.target.value)}
        type="password"
        required
        placeholder="Confirm New Password"
        className={inputClasses}
      />

      {error && <p className="text-sm text-red-600 bg-red-50 rounded-lg px-4 py-2">{error}</p>}

      <button
        type="submit"
        disabled={submitting}
        className="w-full rounded-full bg-rose text-white font-semibold py-3.5 hover:bg-brown transition-colors disabled:opacity-60"
      >
        {submitting ? "Saving…" : "Save New Password"}
      </button>
    </form>
  );
}
