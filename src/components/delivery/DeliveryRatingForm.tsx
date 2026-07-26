"use client";

import { useState, useTransition } from "react";
import toast from "react-hot-toast";
import { FiStar } from "react-icons/fi";
import { submitDeliveryRatingAction } from "@/lib/actions/delivery";

export default function DeliveryRatingForm({
  orderId,
  initialRating,
  initialNotes,
}: {
  orderId: string;
  initialRating: number | null;
  initialNotes: string | null;
}) {
  const [rating, setRating] = useState(initialRating ?? 0);
  const [notes, setNotes] = useState(initialNotes ?? "");
  const [pending, startTransition] = useTransition();
  const [saved, setSaved] = useState(Boolean(initialRating));

  function handleSubmit() {
    if (rating < 1) {
      toast.error("Pick a star rating first.");
      return;
    }
    startTransition(async () => {
      await submitDeliveryRatingAction(orderId, rating, notes);
      setSaved(true);
      toast.success("Delivery rating saved");
    });
  }

  return (
    <div className="bg-cream rounded-2xl p-5 space-y-3">
      <p className="text-sm font-semibold text-brown">
        How did this delivery go? <span className="font-normal text-ink/50">(internal only)</span>
      </p>
      <div className="flex gap-1.5">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => {
              setRating(n);
              setSaved(false);
            }}
            aria-label={`${n} star${n > 1 ? "s" : ""}`}
            className="text-2xl"
          >
            <FiStar className={n <= rating ? "fill-rose text-rose" : "text-brown/25"} />
          </button>
        ))}
      </div>
      <textarea
        value={notes}
        onChange={(e) => {
          setNotes(e.target.value);
          setSaved(false);
        }}
        placeholder="Any notes — traffic, wrong address, customer unavailable, etc. (optional)"
        rows={2}
        className="w-full rounded-xl border border-brown/20 bg-cream-light px-3 py-2 text-sm text-ink placeholder:text-ink/40 focus:outline-none focus:ring-2 focus:ring-rose/60 resize-none"
      />
      <button
        onClick={handleSubmit}
        disabled={pending || saved}
        className="rounded-full bg-rose text-white text-sm font-semibold px-5 py-2 hover:bg-brown transition-colors disabled:opacity-50"
      >
        {saved ? "Saved ✓" : pending ? "Saving…" : "Save Rating"}
      </button>
    </div>
  );
}
