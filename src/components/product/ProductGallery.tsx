"use client";

import { useState } from "react";
import Image from "next/image";
import ImagePlaceholder from "@/components/ui/ImagePlaceholder";

export default function ProductGallery({
  images,
  name,
  placeholderEmoji,
}: {
  images: string[];
  name: string;
  placeholderEmoji: string;
}) {
  const [active, setActive] = useState(0);

  if (images.length === 0) {
    return (
      <div className="rounded-3xl aspect-square overflow-hidden">
        <ImagePlaceholder emoji={placeholderEmoji} />
      </div>
    );
  }

  return (
    <div>
      <div className="relative rounded-3xl overflow-hidden aspect-square shadow-lg bg-cream">
        <Image
          key={images[active]}
          src={images[active]}
          alt={name}
          fill
          priority
          sizes="(max-width: 1024px) 100vw, 560px"
          className="object-cover animate-[fadeIn_0.4s_ease]"
        />
      </div>
      {images.length > 1 && (
        <div className="flex gap-3 mt-4">
          {images.map((img, i) => (
            <button
              key={img + i}
              onClick={() => setActive(i)}
              className={`relative w-20 h-20 rounded-2xl overflow-hidden shrink-0 transition-all ${
                active === i ? "ring-3 ring-rose ring-offset-2 ring-offset-cream-light" : "opacity-70 hover:opacity-100"
              }`}
              aria-label={`View image ${i + 1}`}
            >
              <Image src={img} alt="" fill sizes="80px" className="object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
