"use client";

import { useActionState } from "react";
import Link from "next/link";
import { signUpAction, type AuthActionState } from "@/lib/auth/actions";

const inputClasses =
  "w-full rounded-xl border border-brown/20 bg-cream-light px-4 py-3 text-sm text-ink placeholder:text-ink/40 focus:outline-none focus:ring-2 focus:ring-rose/60 transition-shadow";

export default function SignupForm({ next }: { next?: string }) {
  const [state, formAction, pending] = useActionState<AuthActionState, FormData>(
    signUpAction,
    null
  );

  return (
    <form action={formAction} className="bg-cream rounded-3xl p-8 space-y-4 max-w-md w-full">
      <input type="hidden" name="next" value={next ?? "/account"} />
      <h1 className="font-heading text-3xl text-brown mb-1">Join Cake House</h1>
      <p className="text-ink/60 text-sm mb-4">
        Save your addresses, track orders, and get a birthday surprise every year.
      </p>

      <input name="fullName" type="text" required placeholder="Full Name" className={inputClasses} />
      <input name="email" type="email" required placeholder="Email Address" className={inputClasses} />
      <input name="phone" type="tel" required placeholder="Phone Number" className={inputClasses} />
      <div>
        <label className="text-xs text-ink/50 mb-1 block px-1">
          Your birthday (so we can send you a treat every year!)
        </label>
        <input name="birthday" type="date" className={inputClasses} />
      </div>
      <input
        name="password"
        type="password"
        required
        minLength={6}
        placeholder="Password (min. 6 characters)"
        className={inputClasses}
      />

      {state?.error && (
        <p className="text-sm text-red-600 bg-red-50 rounded-lg px-4 py-2">{state.error}</p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-full bg-rose text-white font-semibold py-3.5 hover:bg-brown transition-colors disabled:opacity-60"
      >
        {pending ? "Creating account..." : "Create Account"}
      </button>

      <p className="text-center text-sm text-ink/60">
        Already have an account?{" "}
        <Link href="/login" className="text-rose font-semibold hover:text-brown">
          Log in
        </Link>
      </p>
    </form>
  );
}
