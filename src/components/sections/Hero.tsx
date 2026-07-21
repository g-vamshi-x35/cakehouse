"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import gsap from "gsap";
import Button from "@/components/ui/Button";
import { FiArrowDown } from "react-icons/fi";

const FALLBACK_IMAGE = "/images/hero/hero-purple-ombre-cake.jpg";

export default function Hero({ videoSrc }: { videoSrc?: string }) {
  const rootRef = useRef<HTMLDivElement>(null);
  const mediaRef = useRef<HTMLDivElement>(null);
  // getHeroVideoSrc() only confirms the file exists on disk — this covers
  // the case where it exists but fails at runtime (corrupt file, codec the
  // browser can't decode, etc.) by falling back to the static image.
  const [videoFailed, setVideoFailed] = useState(false);
  const showVideo = Boolean(videoSrc) && !videoFailed;

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
      tl.fromTo(mediaRef.current, { scale: 1.15 }, { scale: 1, duration: 1.6, ease: "power2.out" })
        .fromTo(
          ".hero-eyebrow",
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0, duration: 0.7 },
          "-=1.2"
        )
        .fromTo(
          ".hero-title",
          { opacity: 0, y: 40 },
          { opacity: 1, y: 0, duration: 0.9 },
          "-=0.4"
        )
        .fromTo(
          ".hero-sub",
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0, duration: 0.7 },
          "-=0.5"
        )
        .fromTo(
          ".hero-cta",
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0, duration: 0.6, stagger: 0.12 },
          "-=0.4"
        );
    }, rootRef);
    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={rootRef}
      className="relative min-h-[92vh] flex items-end md:items-center overflow-hidden"
    >
      <div ref={mediaRef} className="absolute inset-0">
        {showVideo ? (
          <video
            src={videoSrc}
            poster={FALLBACK_IMAGE}
            preload="auto"
            autoPlay
            muted
            loop
            playsInline
            onError={() => setVideoFailed(true)}
            className="absolute inset-0 w-full h-full object-cover object-[65%_30%]"
          />
        ) : (
          <Image
            src={FALLBACK_IMAGE}
            alt="Handcrafted purple ombre butterfly cake by Cake House"
            fill
            priority
            className="object-cover object-[65%_30%]"
          />
        )}
      </div>
      <div className="absolute inset-0 bg-gradient-to-t from-ink/85 via-ink/45 to-ink/20" />
      <div className="absolute inset-0 bg-gradient-to-r from-ink/60 via-transparent to-transparent" />

      <div className="relative container-px w-full pb-16 pt-40 md:py-32 mt-16 md:mt-20">
        <p className="hero-eyebrow text-cream text-sm md:text-base tracking-[0.3em] uppercase font-semibold mb-4">
          Sri Marlapolama Bakery
        </p>
        <h1 className="hero-title font-heading text-white text-4xl sm:text-5xl md:text-6xl leading-[1.05] max-w-2xl">
          Fresh Cakes,
          <br />
          Baked Daily With Love.
        </h1>
        <p className="hero-sub text-cream-light/90 text-sm md:text-base max-w-lg mt-4 leading-relaxed">
          100% vegetarian, 100% egg-free custom cakes, birthday cakes, wedding
          cakes &amp; snacks — handcrafted fresh in Kompally. Great taste, in
          every bite.
        </p>
        <div className="flex flex-wrap items-center gap-4 mt-9">
          <div className="hero-cta">
            <Button href="/menu" size="lg" className="!px-7 !py-3.5">
              Order Now
            </Button>
          </div>
          <div className="hero-cta">
            <Button
              href="/menu"
              variant="outline"
              size="lg"
              className="!text-white !border-white hover:!bg-white hover:!text-brown !px-7 !py-3.5"
            >
              View Menu
            </Button>
          </div>
        </div>
      </div>

      <div className="hidden md:flex absolute bottom-8 right-10 flex-col items-center gap-2 text-cream-light/80 text-xs tracking-widest uppercase">
        <span className="[writing-mode:vertical-rl]">Scroll Down</span>
        <FiArrowDown className="animate-bounce" />
      </div>
    </section>
  );
}
