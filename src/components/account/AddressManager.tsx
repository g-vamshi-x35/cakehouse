"use client";

import { useActionState, useTransition } from "react";
import { FiTrash2, FiStar, FiMapPin } from "react-icons/fi";
import {
  addAddressAction,
  deleteAddressAction,
  setDefaultAddressAction,
  type ActionState,
} from "@/lib/actions/account";

const inputClasses =
  "w-full rounded-xl border border-brown/20 bg-cream-light px-4 py-3 text-sm text-ink placeholder:text-ink/40 focus:outline-none focus:ring-2 focus:ring-rose/60 transition-shadow";

type Address = {
  id: string;
  label: string | null;
  full_address: string;
  city: string | null;
  pincode: string | null;
  is_default: boolean;
};

export default function AddressManager({ addresses }: { addresses: Address[] }) {
  const [state, formAction, pending] = useActionState<ActionState, FormData>(
    addAddressAction,
    null
  );
  const [, startTransition] = useTransition();

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        {addresses.length === 0 ? (
          <p className="text-sm text-ink/50 bg-cream rounded-2xl p-5">No saved addresses yet.</p>
        ) : (
          addresses.map((addr) => (
            <div key={addr.id} className="flex items-start justify-between gap-4 bg-cream rounded-2xl p-5">
              <div className="flex gap-3">
                <FiMapPin className="text-rose mt-0.5 shrink-0" />
                <div>
                  <p className="font-semibold text-brown flex items-center gap-2">
                    {addr.label || "Address"}
                    {addr.is_default && (
                      <span className="text-[10px] uppercase font-bold text-green-700 bg-green-100 px-2 py-0.5 rounded-full">
                        Default
                      </span>
                    )}
                  </p>
                  <p className="text-sm text-ink/70">{addr.full_address}</p>
                  <p className="text-xs text-ink/50">
                    {[addr.city, addr.pincode].filter(Boolean).join(", ")}
                  </p>
                </div>
              </div>
              <div className="flex gap-2 shrink-0">
                {!addr.is_default && (
                  <button
                    onClick={() => startTransition(() => setDefaultAddressAction(addr.id))}
                    className="text-brown/50 hover:text-rose transition-colors"
                    aria-label="Set as default"
                  >
                    <FiStar />
                  </button>
                )}
                <button
                  onClick={() => startTransition(() => deleteAddressAction(addr.id))}
                  className="text-brown/50 hover:text-red-600 transition-colors"
                  aria-label="Delete address"
                >
                  <FiTrash2 />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      <form action={formAction} className="bg-cream rounded-3xl p-6 space-y-3">
        <h3 className="font-heading text-lg text-brown">Add New Address</h3>
        <input name="label" placeholder="Label (e.g. Home, Office)" className={inputClasses} />
        <textarea
          name="fullAddress"
          placeholder="Full Address"
          rows={2}
          required
          className={`${inputClasses} resize-none`}
        />
        <div className="grid grid-cols-2 gap-3">
          <input name="city" placeholder="City" className={inputClasses} />
          <input name="pincode" placeholder="Pincode" className={inputClasses} />
        </div>
        {state?.error && <p className="text-sm text-red-600 bg-red-50 rounded-lg px-4 py-2">{state.error}</p>}
        <button
          type="submit"
          disabled={pending}
          className="rounded-full bg-rose text-white font-semibold px-6 py-2.5 text-sm hover:bg-brown transition-colors disabled:opacity-60"
        >
          {pending ? "Saving..." : "Add Address"}
        </button>
      </form>
    </div>
  );
}
