"use client";

import { useEffect, useRef } from "react";

// Palette: cinnamon + celebration accent colors
const COLORS = [
  "#c45c2e", "#e4b49a", "#fdf7f4",
  "#4a7c59", "#d4edda",
  "#2e6da4", "#d0e8f7",
  "#d4a017", "#fff3cd",
  "#f9ede6",
];

interface ConfettiBurstProps {
  /** Triggers the burst when truthy */
  active: boolean;
  count?: number;
}

/**
 * anime.js v4-powered confetti burst.
 * Particles fly from the viewport center with randomised trajectories.
 * Uses dynamic import — anime.js is NOT in the initial bundle.
 */
export function ConfettiBurst({ active, count = 50 }: ConfettiBurstProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const animRef = useRef<any>(null);

  useEffect(() => {
    if (!active || !containerRef.current) return;

    const container = containerRef.current;
    container.innerHTML = "";

    const particles = Array.from({ length: count }).map(() => {
      const el = document.createElement("div");
      const size = Math.random() * 10 + 5;
      const isCircle = Math.random() > 0.4;
      el.style.cssText = [
        "position:absolute",
        "left:50%",
        "top:50%",
        `width:${size}px`,
        `height:${size}px`,
        `background:${COLORS[Math.floor(Math.random() * COLORS.length)]}`,
        `border-radius:${isCircle ? "50%" : "3px"}`,
        "transform:translate(-50%,-50%)",
        "will-change:transform,opacity",
      ].join(";");
      container.appendChild(el);
      return el;
    });

    import("animejs").then((mod) => {
      const { animate, stagger, random } = mod;
      animRef.current = animate(particles, {
        translateX: () => random(-280, 280),
        translateY: () => random(-320, 40),
        rotate: () => random(-540, 540),
        scale: [{ to: 0 }, { to: () => random(8, 13) / 10 }, { to: 0 }],
        opacity: [1, 1, 0],
        duration: () => random(900, 1500),
        delay: stagger(18, { from: "random" }),
        ease: "outExpo",
      });
    });

    return () => {
      if (animRef.current?.pause) animRef.current.pause();
    };
  }, [active, count]);

  if (!active) return null;

  return (
    <div
      ref={containerRef}
      className="pointer-events-none fixed inset-0 z-50 overflow-hidden"
      aria-hidden="true"
    />
  );
}
