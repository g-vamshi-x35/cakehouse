"use client";

import Image from "next/image";
import Link from "next/link";
import { useTransition } from "react";
import { FiHeart } from "react-icons/fi";
import { toggleWishlistAction } from "@/lib/actions/account";

type WishlistProduct = {
  id: string;
  slug: string;
  name: string;
  image: string | null;
  price: number | null;
};

export default function WishlistGrid({ products }: { products: WishlistProduct[] }) {
  const [, startTransition] = useTransition();

  if (products.length === 0) {
    return (
      <div className="bg-cream rounded-3xl p-10 text-center">
        <FiHeart className="mx-auto text-4xl text-brown/30 mb-3" />
        <p className="text-ink/60 mb-5">Your wishlist is empty.</p>
        <Link href="/menu" className="text-rose font-semibold hover:text-brown">
          Browse the menu →
        </Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
      {products.map((product) => (
        <div key={product.id} className="bg-cream rounded-2xl overflow-hidden">
          <Link href={`/menu/${product.slug}`} className="relative block aspect-[4/3] bg-cream-light">
            {product.image ? (
              <Image src={product.image} alt={product.name} fill className="object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-4xl">🎂</div>
            )}
          </Link>
          <div className="p-4 flex items-center justify-between">
            <div>
              <Link href={`/menu/${product.slug}`} className="font-semibold text-ink hover:text-rose transition-colors">
                {product.name}
              </Link>
              {product.price != null && <p className="text-rose font-bold text-sm">₹{product.price}</p>}
            </div>
            <button
              onClick={() => startTransition(() => toggleWishlistAction(product.id, true))}
              aria-label="Remove from wishlist"
              className="text-rose hover:text-brown transition-colors"
            >
              <FiHeart fill="currentColor" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
