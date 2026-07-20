"use client";

import { useActionState } from "react";
import { updateProfileAction, type ActionState } from "@/lib/actions/account";

const inputClasses =
  "w-full rounded-xl border border-brown/20 bg-cream-light px-4 py-3 text-sm text-ink placeholder:text-ink/40 focus:outline-none focus:ring-2 focus:ring-rose/60 transition-shadow";

export default function ProfileForm({
  email,
  fullName,
  phone,
  birthday,
}: {
  email: string;
  fullName: string;
  phone: string;
  birthday: string;
}) {
  const [state, formAction, pending] = useActionState<ActionState, FormData>(
    updateProfileAction,
    null
  );

  return (
    <form action={formAction} className="bg-cream rounded-3xl p-6 space-y-4 max-w-lg">
      <div>
        <label className="text-xs text-ink/50 mb-1 block px-1">Email</label>
        <input value={email} disabled className={`${inputClasses} opacity-60`} />
      </div>
      <div>
        <label className="text-xs text-ink/50 mb-1 block px-1">Full Name</label>
        <input name="fullName" defaultValue={fullName} className={inputClasses} />
      </div>
      <div>
        <label className="text-xs text-ink/50 mb-1 block px-1">Phone Number</label>
        <input name="phone" defaultValue={phone} type="tel" className={inputClasses} />
      </div>
      <div>
        <label className="text-xs text-ink/50 mb-1 block px-1">
          Birthday (we&apos;ll send you a treat every year!)
        </label>
        <input name="birthday" defaultValue={birthday} type="date" className={inputClasses} />
      </div>

      {state?.error && (
        <p className="text-sm text-red-600 bg-red-50 rounded-lg px-4 py-2">{state.error}</p>
      )}
      {state?.success && (
        <p className="text-sm text-green-700 bg-green-50 rounded-lg px-4 py-2">Profile updated!</p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="rounded-full bg-rose text-white font-semibold px-6 py-3 hover:bg-brown transition-colors disabled:opacity-60"
      >
        {pending ? "Saving..." : "Save Changes"}
      </button>
    </form>
  );
}
