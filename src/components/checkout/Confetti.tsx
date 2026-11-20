"use client";

import { useMemo } from "react";

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

// Deterministic pseudo-random in [0, 1) seeded by index. Math.random() can't
// be used during render: the server-rendered value would never match the
// client's and cause a hydration mismatch. A seeded hash gives the same
// "random-looking" layout on both sides, with no effect or extra render.
function rand(seed: number): number {
  const x = Math.sin(seed * 12.9898 + 78.233) * 43758.5453;
  return x - Math.floor(x);
}

export default function Confetti({ count = 40 }: { count?: number }) {
  const pieces = useMemo<Piece[]>(
    () =>
      Array.from({ length: count }, (_, i) => ({
        id: i,
        left: rand(i * 5 + 1) * 100,
        delay: rand(i * 5 + 2) * 0.6,
        duration: 2.2 + rand(i * 5 + 3) * 1.4,
        width: 5 + rand(i * 5 + 4) * 6,
        height: 8 + rand(i * 5 + 5) * 8,
        color: COLORS[i % COLORS.length],
      })),
    [count]
  );

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
