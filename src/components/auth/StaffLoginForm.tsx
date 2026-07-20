"use client";

import { useActionState } from "react";
import { staffSignInAction, type AuthActionState } from "@/lib/auth/actions";

const inputClasses =
  "w-full rounded-xl border border-cream-light/25 bg-brown-dark/40 px-4 py-3 text-sm text-cream-light placeholder:text-cream-light/40 focus:outline-none focus:ring-2 focus:ring-rose/60 transition-shadow";

export default function StaffLoginForm() {
  const [state, formAction, pending] = useActionState<AuthActionState, FormData>(
    staffSignInAction,
    null
  );

  return (
    <form action={formAction} className="bg-brown/90 backdrop-blur rounded-3xl p-8 space-y-4 max-w-md w-full border border-cream-light/10">
      <h1 className="font-heading text-3xl text-cream mb-1">Staff Login</h1>
      <p className="text-cream-light/60 text-sm mb-4">Owner &amp; employee dashboard access.</p>

      <input name="email" type="email" required placeholder="Work Email" className={inputClasses} />
      <input name="password" type="password" required placeholder="Password" className={inputClasses} />

      {state?.error && (
        <p className="text-sm text-red-200 bg-red-900/40 rounded-lg px-4 py-2">{state.error}</p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-full bg-rose text-white font-semibold py-3.5 hover:bg-cream hover:text-brown transition-colors disabled:opacity-60"
      >
        {pending ? "Logging in..." : "Log In"}
      </button>
    </form>
  );
}
