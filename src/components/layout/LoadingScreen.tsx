"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import gsap from "gsap";

export default function LoadingScreen() {
  const [visible, setVisible] = useState(true);
  const rootRef = useRef<HTMLDivElement>(null);
  const logoRef = useRef<HTMLDivElement>(null);
  const barRef = useRef<HTMLDivElement>(null);

  // Reads a browser-only external system (matchMedia) and the GSAP timeline's
  // completion callback both need to drive this component's visibility —
  // a legitimate effect use, not a derived-state anti-pattern.
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    if (
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      setVisible(false);
      return;
    }

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        onComplete: () => setVisible(false),
      });

      tl.fromTo(
        logoRef.current,
        { opacity: 0, scale: 0.8 },
        { opacity: 1, scale: 1, duration: 0.6, ease: "back.out(1.7)" }
      )
        .fromTo(
          barRef.current,
          { scaleX: 0 },
          { scaleX: 1, duration: 0.9, ease: "power2.inOut", transformOrigin: "left" },
          "-=0.1"
        )
        .to(rootRef.current, { opacity: 0, duration: 0.5, ease: "power2.out" }, "+=0.2");
    }, rootRef);

    // Safety net: this overlay sits at z-[200] above the entire site, so if
    // the GSAP timeline's onComplete never fires for any reason — a
    // throttled requestAnimationFrame in a backgrounded tab, a slow device,
    // anything interrupting the ticker — it must not stay up and silently
    // block every click on the page forever.
    const failSafe = setTimeout(() => setVisible(false), 3000);

    return () => {
      ctx.revert();
      clearTimeout(failSafe);
    };
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

  if (!visible) return null;

  return (
    <div
      ref={rootRef}
      className="fixed inset-0 z-[200] bg-brown flex flex-col items-center justify-center gap-6"
      aria-hidden="true"
    >
      <div ref={logoRef} className="flex flex-col items-center gap-3">
        <Image
          src="/images/brand/logo-circle.jpg"
          alt="Cake House"
          width={80}
          height={80}
          className="rounded-full object-cover"
          priority
        />
        <span className="font-heading text-2xl text-cream">Cake House</span>
      </div>
      <div className="w-40 h-0.5 bg-cream-light/20 rounded-full overflow-hidden">
        <div ref={barRef} className="h-full bg-rose rounded-full" />
      </div>
    </div>
  );
}
