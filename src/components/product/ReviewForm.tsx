"use client";

import { useActionState, useState } from "react";
import { FaStar, FaRegStar } from "react-icons/fa";
import { submitReviewAction, type ReviewActionState } from "@/lib/actions/reviews";

const inputClasses =
  "w-full rounded-xl border border-brown/20 bg-cream-light px-4 py-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-rose/60";

export default function ReviewForm({
  productId,
  productSlug,
  isLoggedIn,
}: {
  productId: string;
  productSlug: string;
  isLoggedIn: boolean;
}) {
  const [state, formAction, pending] = useActionState<ReviewActionState, FormData>(
    submitReviewAction,
    null
  );
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);

  if (state?.success) {
    return (
      <p className="text-sm text-green-700 bg-green-50 rounded-lg px-4 py-3">
        Thanks for your review! It now appears below.
      </p>
    );
  }

  return (
    <form action={formAction} className="bg-cream rounded-2xl p-5 space-y-3">
      <input type="hidden" name="productId" value={productId} />
      <input type="hidden" name="productSlug" value={productSlug} />
      <input type="hidden" name="rating" value={rating} />

      <p className="text-sm font-semibold text-brown">Your Rating</p>
      <div className="flex gap-1 text-2xl text-rose">
        {Array.from({ length: 5 }, (_, i) => {
          const value = i + 1;
          const filled = value <= (hoverRating || rating);
          return (
            <button
              type="button"
              key={value}
              onMouseEnter={() => setHoverRating(value)}
              onMouseLeave={() => setHoverRating(0)}
              onClick={() => setRating(value)}
              aria-label={`${value} star${value > 1 ? "s" : ""}`}
            >
              {filled ? <FaStar /> : <FaRegStar />}
            </button>
          );
        })}
      </div>

      {!isLoggedIn && (
        <input name="guestName" placeholder="Your Name" required className={inputClasses.replace("resize-none", "")} />
      )}

      <textarea
        name="comment"
        rows={3}
        placeholder="Tell us what you thought (optional)"
        className={inputClasses}
      />

      {state?.error && (
        <p className="text-sm text-red-600 bg-red-50 rounded-lg px-4 py-2">{state.error}</p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="rounded-full bg-rose text-white text-sm font-semibold px-6 py-2.5 hover:bg-brown transition-colors disabled:opacity-60"
      >
        {pending ? "Submitting..." : "Submit Review"}
      </button>
    </form>
  );
}
