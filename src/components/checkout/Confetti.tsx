"use client";

import { useEffect, useState } from "react";

const COLORS = ["#c37960", "#894e3f", "#f0d7a7", "#5e352a", "#ffffff"];

type Piece = {
  id: number;
  left: number;
  delay: number;
  duration: number;
  width: number;
  height: number;
  color: string;
};

export default function Confetti({ count = 40 }: { count?: number }) {
  // Math.random() must not run during SSR — a server-rendered value can
  // never match the client's, causing a hydration mismatch. Generating the
  // pieces after mount (same pattern as CartContext's localStorage hydration)
  // means confetti simply appears one frame after paint, which is invisible.
  const [pieces, setPieces] = useState<Piece[] | null>(null);

  useEffect(() => {
    setPieces(
      Array.from({ length: count }, (_, i) => ({
        id: i,
        left: Math.random() * 100,
        delay: Math.random() * 0.6,
        duration: 2.2 + Math.random() * 1.4,
        width: 5 + Math.random() * 6,
        height: 8 + Math.random() * 8,
        color: COLORS[i % COLORS.length],
      }))
    );
  }, [count]);

  if (!pieces) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-[90] overflow-hidden" aria-hidden="true">
      {pieces.map((p) => (
        <span
          key={p.id}
          className="absolute top-[-10px] rounded-sm animate-[confettiFall_2.6s_ease-in_forwards]"
          style={{
            left: `${p.left}%`,
            width: p.width,
            height: p.height,
            backgroundColor: p.color,
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`,
          }}
        />
      ))}
    </div>
  );
}
