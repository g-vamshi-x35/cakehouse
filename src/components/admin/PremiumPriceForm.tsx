"use client";

import { useActionState } from "react";
import { updatePremiumCakeAction, type ActionState } from "@/lib/actions/admin";

export default function PremiumPriceForm({
  id,
  price,
  priceLabel,
  isActive,
}: {
  id: string;
  price: number | null;
  priceLabel: string | null;
  isActive: boolean;
}) {
  const [state, action, pending] = useActionState<ActionState, FormData>(updatePremiumCakeAction.bind(null, id), null);

  return (
    <form action={action} className="flex flex-wrap items-end gap-3">
      <label className="flex flex-col gap-1 text-xs font-semibold text-ink/60">
        Price (₹)
        <input
          name="price"
          type="number"
          inputMode="decimal"
          min="1"
          step="1"
          defaultValue={price ?? ""}
          placeholder="On request"
          className="w-28 rounded-xl border border-brown/20 bg-cream-light px-3 py-2 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-rose/60"
        />
      </label>
      <label className="flex flex-col gap-1 text-xs font-semibold text-ink/60">
        Shown after price
        <input
          name="priceLabel"
          defaultValue={priceLabel ?? ""}
          placeholder="e.g. per kg"
          maxLength={30}
          className="w-32 rounded-xl border border-brown/20 bg-cream-light px-3 py-2 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-rose/60"
        />
      </label>
      <label className="flex items-center gap-2 text-sm text-ink/70 pb-2">
        <input name="isActive" type="checkbox" defaultChecked={isActive} className="w-4 h-4 accent-rose" /> Visible
      </label>
      <button
        type="submit"
        disabled={pending}
        className="rounded-full bg-rose text-white text-sm font-semibold px-5 py-2 hover:bg-brown transition-colors disabled:opacity-50"
      >
        {pending ? "Saving…" : "Save"}
      </button>
      {state?.success && !pending && <span className="text-xs font-semibold text-green-700 pb-2">Saved</span>}
      {state?.error && <span className="text-xs font-semibold text-red-600 pb-2 basis-full">{state.error}</span>}
    </form>
  );
}
