import Image from "next/image";
import { FiImage } from "react-icons/fi";
import { getProductBySlug as getStaticProduct } from "@/data/products";

export type ProductImage = { url: string; sort_order: number };

/** First photo for a dashboard row: the DB photo, else the built-in catalog photo. */
export function productThumbUrl(slug: string, images: ProductImage[] | null | undefined): string | null {
  const first = (images ?? []).slice().sort((a, b) => a.sort_order - b.sort_order)[0]?.url;
  return first ?? getStaticProduct(slug)?.images[0] ?? null;
}

/** Small product photo with the name and SKU beside it, for staff product tables. */
export default function ProductCell({
  name,
  sku,
  imageUrl,
}: {
  name: string;
  sku: string | null;
  imageUrl: string | null;
}) {
  return (
    <div className="flex items-center gap-3 min-w-[220px]">
      <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-cream-light shrink-0 flex items-center justify-center">
        {imageUrl ? (
          <Image src={imageUrl} alt={name} fill sizes="48px" className="object-cover" />
        ) : (
          <FiImage className="text-brown/30" size={18} aria-label="No photo" />
        )}
      </div>
      <div className="min-w-0">
        <p className="font-semibold text-ink truncate">{name}</p>
        <p className="text-xs font-mono text-ink/50">{sku ?? "No SKU"}</p>
      </div>
    </div>
  );
}
