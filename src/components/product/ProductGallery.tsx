"use client";

import { useState } from "react";
import Image from "next/image";
import { FiZoomIn, FiX, FiChevronLeft, FiChevronRight } from "react-icons/fi";
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
  const [lightboxOpen, setLightboxOpen] = useState(false);

  if (images.length === 0) {
    return (
      <div className="rounded-3xl aspect-square overflow-hidden">
        <ImagePlaceholder emoji={placeholderEmoji} />
      </div>
    );
  }

  return (
    <div>
      <button
        type="button"
        onClick={() => setLightboxOpen(true)}
        className="group relative rounded-3xl overflow-hidden aspect-square shadow-lg bg-cream block w-full cursor-zoom-in"
        aria-label="Zoom image"
      >
        <Image
          key={images[active]}
          src={images[active]}
          alt={name}
          fill
          priority
          sizes="(max-width: 1024px) 100vw, 560px"
          className="object-cover animate-[fadeIn_0.4s_ease] transition-transform duration-500 group-hover:scale-105"
        />
        <span className="absolute bottom-3 right-3 flex items-center gap-1.5 rounded-full bg-ink/60 text-cream-light text-xs font-semibold px-3 py-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
          <FiZoomIn size={13} /> Zoom
        </span>
      </button>

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

      {lightboxOpen && (
        <div
          className="fixed inset-0 z-[100] bg-ink/90 backdrop-blur-sm flex items-center justify-center p-6 animate-[fadeIn_0.2s_ease-out]"
          onClick={() => setLightboxOpen(false)}
        >
          <button
            onClick={() => setLightboxOpen(false)}
            aria-label="Close zoom"
            className="absolute top-6 right-6 text-cream-light/80 hover:text-cream-light transition-colors"
          >
            <FiX size={28} />
          </button>

          {images.length > 1 && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setActive((i) => (i - 1 + images.length) % images.length);
                }}
                aria-label="Previous image"
                className="absolute left-4 md:left-8 text-cream-light/80 hover:text-cream-light transition-colors"
              >
                <FiChevronLeft size={32} />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setActive((i) => (i + 1) % images.length);
                }}
                aria-label="Next image"
                className="absolute right-4 md:right-8 text-cream-light/80 hover:text-cream-light transition-colors"
              >
                <FiChevronRight size={32} />
              </button>
            </>
          )}

          <div
            className="relative w-full max-w-2xl aspect-square"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              key={images[active]}
              src={images[active]}
              alt={name}
              fill
              sizes="(max-width: 768px) 100vw, 672px"
              className="object-contain animate-[fadeIn_0.2s_ease]"
            />
          </div>
        </div>
      )}
    </div>
  );
}
