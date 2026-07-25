"use client";

import { useActionState } from "react";
import Link from "next/link";
import { requestPasswordResetAction, type ForgotPasswordState } from "@/lib/auth/actions";

const inputClasses =
  "w-full rounded-xl border border-brown/20 bg-cream-light px-4 py-3 text-sm text-ink placeholder:text-ink/40 focus:outline-none focus:ring-2 focus:ring-rose/60 transition-shadow";

export default function ForgotPasswordForm() {
  const [state, formAction, pending] = useActionState<ForgotPasswordState, FormData>(
    requestPasswordResetAction,
    null
  );

  if (state?.success) {
    return (
      <div className="bg-cream rounded-3xl p-8 max-w-md w-full text-center space-y-3">
        <h1 className="font-heading text-2xl text-brown">Check Your Email</h1>
        <p className="text-sm text-ink/70">
          If an account exists for that email address, we&apos;ve sent a link to reset your
          password. It may take a minute to arrive — check spam too.
        </p>
        <Link href="/login" className="inline-block text-sm text-rose font-semibold hover:text-brown">
          Back to Log In
        </Link>
      </div>
    );
  }

  return (
    <form action={formAction} className="bg-cream rounded-3xl p-8 space-y-4 max-w-md w-full">
      <h1 className="font-heading text-3xl text-brown mb-1">Reset Password</h1>
      <p className="text-ink/60 text-sm mb-4">
        Enter the email on your account and we&apos;ll send you a reset link.
      </p>

      <input name="email" type="email" required placeholder="Email Address" className={inputClasses} />

      {state?.error && (
        <p className="text-sm text-red-600 bg-red-50 rounded-lg px-4 py-2">{state.error}</p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-full bg-rose text-white font-semibold py-3.5 hover:bg-brown transition-colors disabled:opacity-60"
      >
        {pending ? "Sending…" : "Send Reset Link"}
      </button>

      <p className="text-center text-sm text-ink/60">
        <Link href="/login" className="text-rose font-semibold hover:text-brown">
          Back to Log In
        </Link>
      </p>
    </form>
  );
}
