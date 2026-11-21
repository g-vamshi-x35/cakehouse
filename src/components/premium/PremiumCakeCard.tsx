"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
import { FaWhatsapp } from "react-icons/fa";
import type { PremiumCakeItem } from "@/lib/data/premium";
import { buildWhatsAppLink } from "@/lib/whatsapp";
import { business } from "@/data/business";
import { formatPremiumPrice } from "@/lib/premium-price";

export default function PremiumCakeCard({ cake, priority = false }: { cake: PremiumCakeItem; priority?: boolean }) {
  const [index, setIndex] = useState(0);
  const trackRef = useRef<HTMLDivElement>(null);
  const count = cake.images.length;
  const price = formatPremiumPrice(cake.price, cake.priceLabel);

  const goTo = (i: number) => {
    const next = (i + count) % count;
    const track = trackRef.current;
    if (track) track.scrollTo({ left: next * track.clientWidth, behavior: "smooth" });
    setIndex(next);
  };

  const whatsappHref = buildWhatsAppLink(
    `Hi ${business.name}! I'd like to order the ${cake.name} from your Premium Cakes collection${price ? ` (${price})` : ""}. Please share the details.`
  );

  return (
    <article className="group flex flex-col rounded-[1.75rem] bg-white/70 ring-1 ring-gold/25 shadow-[0_10px_40px_-18px_rgba(31,20,17,0.35)] overflow-hidden transition-shadow duration-500 hover:shadow-[0_22px_60px_-20px_rgba(31,20,17,0.45)]">
      <div className="relative aspect-[4/5] bg-cream overflow-hidden">
        <div
          ref={trackRef}
          className="flex h-full overflow-x-auto snap-x snap-mandatory [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          onScroll={(e) => {
            const el = e.currentTarget;
            const i = Math.round(el.scrollLeft / el.clientWidth);
            if (i !== index) setIndex(i);
          }}
        >
          {cake.images.map((src, i) => (
            <div key={src} className="relative h-full w-full shrink-0 snap-center">
              <Image
                src={src}
                alt={`${cake.name}${count > 1 ? ` — photo ${i + 1} of ${count}` : ""}`}
                fill
                priority={priority && i === 0}
                sizes="(min-width: 1280px) 25vw, (min-width: 768px) 33vw, 50vw"
                className="object-cover transition-transform duration-[1.2s] ease-out group-hover:scale-[1.04]"
              />
            </div>
          ))}
        </div>

        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-espresso/45 to-transparent" />

        {count > 1 && (
          <>
            <button
              type="button"
              aria-label={`Previous photo of ${cake.name}`}
              onClick={() => goTo(index - 1)}
              className="absolute left-2.5 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/85 text-brown flex items-center justify-center shadow opacity-0 group-hover:opacity-100 focus-visible:opacity-100 transition-opacity"
            >
              <FiChevronLeft />
            </button>
            <button
              type="button"
              aria-label={`Next photo of ${cake.name}`}
              onClick={() => goTo(index + 1)}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/85 text-brown flex items-center justify-center shadow opacity-0 group-hover:opacity-100 focus-visible:opacity-100 transition-opacity"
            >
              <FiChevronRight />
            </button>
            <div className="absolute bottom-3 inset-x-0 flex justify-center gap-1.5">
              {cake.images.map((src, i) => (
                <button
                  key={src}
                  type="button"
                  aria-label={`Show photo ${i + 1} of ${cake.name}`}
                  onClick={() => goTo(i)}
                  className={`h-1.5 rounded-full transition-all ${i === index ? "w-5 bg-white" : "w-1.5 bg-white/60"}`}
                />
              ))}
            </div>
          </>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-2.5 p-4 sm:p-5">
        <div className="flex items-start justify-between gap-3">
          <h3 className="font-heading text-lg sm:text-xl text-espresso leading-snug">{cake.name}</h3>
          {count > 1 && <span className="hidden sm:inline shrink-0 text-[11px] font-semibold tracking-wider text-gold uppercase mt-1.5">{count} photos</span>}
        </div>
        <p className={`font-semibold ${price ? "text-lg text-brown" : "text-ink/55 italic font-normal text-sm sm:text-base"}`}>
          {price ?? "Price on request"}
        </p>
        <a
          href={whatsappHref}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-auto inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full bg-espresso text-cream px-3 py-2.5 sm:px-5 sm:py-3 text-[13px] sm:text-sm font-semibold tracking-wide transition-colors duration-300 hover:bg-gold hover:text-espresso"
        >
          <FaWhatsapp size={16} /> {price ? "Order on WhatsApp" : "Ask for price"}
        </a>
      </div>
    </article>
  );
}
