"use client";

import Image from "next/image";
import { FiShoppingBag } from "react-icons/fi";
import { FaWhatsapp } from "react-icons/fa";
import type { AnyMenuItem } from "@/data/menu";
import { displayPrice } from "@/data/menu";
import { orderOnWhatsAppLink } from "@/lib/whatsapp";
import { useCart } from "@/components/cart/CartContext";

export default function ProductCard({ item }: { item: AnyMenuItem }) {
  const { addItem } = useCart();
  const priceLabel = displayPrice(item);
  const image = "image" in item ? item.image : undefined;
  const note = "note" in item ? item.note : undefined;
  const placeholderEmoji =
    item.category === "pizza" ? "🍕" : item.category === "snacks" ? "🥟" : "🎂";

  return (
    <div className="group relative rounded-3xl overflow-hidden bg-cream shadow-sm hover:shadow-xl transition-shadow duration-300 flex flex-col">
      <div className="relative aspect-[4/3] overflow-hidden bg-cream">
        {image ? (
          <Image
            src={image}
            alt={item.name}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover transition-transform duration-500 group-hover:scale-110"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-cream to-rose/25">
            <span className="text-5xl">{placeholderEmoji}</span>
          </div>
        )}
        {note && (
          <span className="absolute top-3 left-3 bg-brown-dark/90 text-cream-light text-[11px] font-semibold px-2.5 py-1 rounded-full">
            {note}
          </span>
        )}
      </div>

      <div className="p-4 flex flex-col gap-2 flex-1">
        <h3 className="font-heading text-lg text-ink leading-snug">{item.name}</h3>
        <p className="text-rose font-bold">{priceLabel}</p>

        <div className="mt-auto pt-2 flex items-center gap-2">
          <button
            onClick={() =>
              addItem({ id: item.id, name: item.name, priceLabel, image })
            }
            className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-full bg-rose text-white text-sm font-semibold py-2.5 hover:bg-brown transition-colors"
          >
            <FiShoppingBag size={15} /> Add
          </button>
          <a
            href={orderOnWhatsAppLink(item.name, priceLabel)}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Order ${item.name} on WhatsApp`}
            className="inline-flex items-center justify-center rounded-full border-2 border-brown/20 text-brown w-10 h-10 hover:border-rose hover:text-rose transition-colors shrink-0"
          >
            <FaWhatsapp size={17} />
          </a>
        </div>
      </div>
    </div>
  );
}
