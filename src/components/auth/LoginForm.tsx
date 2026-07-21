"use client";

import { useActionState } from "react";
import Link from "next/link";
import { signInAction, type AuthActionState } from "@/lib/auth/actions";

const inputClasses =
  "w-full rounded-xl border border-brown/20 bg-cream-light px-4 py-3 text-sm text-ink placeholder:text-ink/40 focus:outline-none focus:ring-2 focus:ring-rose/60 transition-shadow";

export default function LoginForm({ next }: { next?: string }) {
  const [state, formAction, pending] = useActionState<AuthActionState, FormData>(
    signInAction,
    null
  );

  return (
    <form action={formAction} className="bg-cream rounded-3xl p-8 space-y-4 max-w-md w-full">
      <input type="hidden" name="next" value={next ?? "/account"} />
      <h1 className="font-heading text-3xl text-brown mb-1">Welcome Back</h1>
      <p className="text-ink/60 text-sm mb-4">Log in to track orders, save addresses and more.</p>

      <input name="email" type="email" required placeholder="Email Address" className={inputClasses} />
      <input name="password" type="password" required placeholder="Password" className={inputClasses} />

      {state?.error && (
        <p className="text-sm text-red-600 bg-red-50 rounded-lg px-4 py-2">{state.error}</p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-full bg-rose text-white font-semibold py-3.5 hover:bg-brown transition-colors disabled:opacity-60"
      >
        {pending ? "Logging in..." : "Log In"}
      </button>

      <p className="text-center text-sm text-ink/60">
        New here?{" "}
        <Link href="/signup" className="text-rose font-semibold hover:text-brown">
          Create an account
        </Link>
      </p>
      <p className="text-center text-xs text-ink/40">
        Bakery owner or employee?{" "}
        <Link href="/staff/login" prefetch={false} className="font-semibold text-brown hover:text-rose">
          Staff login here
        </Link>
      </p>
    </form>
  );
}
