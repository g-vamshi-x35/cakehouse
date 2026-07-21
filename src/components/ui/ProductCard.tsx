"use client";

import Image from "next/image";
import Link from "next/link";
import { FiShoppingBag } from "react-icons/fi";
import { FaWhatsapp } from "react-icons/fa";
import type { Product } from "@/data/products";
import { displayProductPrice } from "@/data/products";
import { orderOnWhatsAppLink } from "@/lib/whatsapp";
import { useCart } from "@/components/cart/CartContext";
import StarRating from "@/components/ui/StarRating";
import ImagePlaceholder from "@/components/ui/ImagePlaceholder";

export default function ProductCard({ product }: { product: Product }) {
  const { addItem } = useCart();
  const priceLabel = displayProductPrice(product);
  const image = product.images[0];
  const placeholderEmoji =
    product.category === "pizza" ? "🍕" : product.category === "snacks" ? "🥟" : "🎂";
  const firstPricedWeight = product.weightOptions?.find((w) => w.price != null);
  const unitPrice = firstPricedWeight?.price ?? product.price;
  const href = `/menu/${product.slug}`;

  return (
    <div className="group relative rounded-3xl overflow-hidden bg-cream shadow-sm hover:shadow-xl transition-shadow duration-300 flex flex-col">
      <Link href={href} className="relative aspect-[4/3] overflow-hidden bg-cream block">
        {image ? (
          <Image
            src={image}
            alt={product.name}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover transition-transform duration-500 group-hover:scale-110"
          />
        ) : (
          <ImagePlaceholder emoji={placeholderEmoji} />
        )}
        {product.available === false && (
          <span className="absolute top-3 right-3 bg-ink/80 text-cream-light text-[11px] font-semibold px-2.5 py-1 rounded-full">
            Unavailable
          </span>
        )}
        {product.note && (
          <span className="absolute top-3 left-3 bg-brown-dark/90 text-cream-light text-[11px] font-semibold px-2.5 py-1 rounded-full">
            {product.note}
          </span>
        )}
      </Link>

      <div className="p-4 flex flex-col gap-2 flex-1">
        <Link href={href}>
          <h3 className="font-heading text-lg text-ink leading-snug hover:text-rose transition-colors">
            {product.name}
          </h3>
        </Link>
        {product.reviewCount ? (
          <div className="flex items-center gap-1.5 text-xs text-ink/50">
            <StarRating rating={product.avgRating ?? 0} size={11} />
            <span>({product.reviewCount})</span>
          </div>
        ) : null}
        <p className="text-rose font-bold">{priceLabel}</p>

        <div className="mt-auto pt-2 flex items-center gap-2">
          <button
            onClick={() =>
              addItem({
                productId: product.id,
                name: product.name,
                image,
                unitPrice,
                weightLabel: firstPricedWeight?.label,
                flavour: product.flavours?.[0],
              })
            }
            className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-full bg-rose text-white text-sm font-semibold py-2.5 hover:bg-brown transition-colors"
          >
            <FiShoppingBag size={15} /> Add
          </button>
          <a
            href={orderOnWhatsAppLink({ name: product.name, priceLabel })}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Order ${product.name} on WhatsApp`}
            className="inline-flex items-center justify-center rounded-full border-2 border-brown/20 text-brown w-10 h-10 hover:border-rose hover:text-rose transition-colors shrink-0"
          >
            <FaWhatsapp size={17} />
          </a>
        </div>
      </div>
    </div>
  );
}
