"use client";

import { useState, useTransition } from "react";
import { FiHeart } from "react-icons/fi";
import Link from "next/link";
import toast from "react-hot-toast";
import { toggleWishlistAction } from "@/lib/actions/account";

export default function WishlistButton({
  productId,
  initialWishlisted,
  isLoggedIn,
  productSlug,
}: {
  productId: string;
  initialWishlisted: boolean;
  isLoggedIn: boolean;
  productSlug: string;
}) {
  const [wishlisted, setWishlisted] = useState(initialWishlisted);
  const [, startTransition] = useTransition();

  if (!isLoggedIn) {
    return (
      <Link
        href={`/login?next=/menu/${productSlug}`}
        aria-label="Log in to add to wishlist"
        className="inline-flex items-center justify-center w-11 h-11 rounded-full border-2 border-cream-light/30 text-cream-light hover:border-rose hover:text-rose transition-colors shrink-0"
      >
        <FiHeart />
      </Link>
    );
  }

  return (
    <button
      onClick={() => {
        const next = !wishlisted;
        setWishlisted(next);
        toast.success(next ? "Added to wishlist" : "Removed from wishlist");
        startTransition(() => toggleWishlistAction(productId, wishlisted));
      }}
      aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
      className={`inline-flex items-center justify-center w-11 h-11 rounded-full border-2 transition-colors shrink-0 ${
        wishlisted
          ? "border-rose bg-rose text-white"
          : "border-cream-light/30 text-cream-light hover:border-rose hover:text-rose"
      }`}
    >
      <FiHeart fill={wishlisted ? "currentColor" : "none"} />
    </button>
  );
}
