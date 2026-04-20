"use client";

import { useEffect, useRef } from "react";

interface XPFloaterProps {
  /** Amount of XP to display. If 0 nothing renders. */
  xp: number;
  /** Toggled true when a correct answer is revealed. */
  active: boolean;
}

/**
 * anime.js v4-powered +XP floating text.
 * Floats upward with easeOutExpo and fades out.
 */
export function XPFloater({ xp, active }: XPFloaterProps) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!active || !ref.current || xp === 0) return;
    const el = ref.current;
    el.style.opacity = "1";
    el.style.transform = "translateY(0) scale(1)";

    import("animejs").then((mod) => {
      const { animate } = mod;
      animate(el, {
        translateY: [0, -64],
        scale: [1, 1.3, 0.9, 0],
        opacity: [1, 1, 0],
        duration: 1100,
        ease: "outExpo",
      });
    });
  }, [active, xp]);

  if (!active || xp === 0) return null;

  return (
    <span
      ref={ref}
      className="pointer-events-none absolute right-3 top-3 z-10 text-sm font-bold text-cinnamon-500 select-none"
      aria-hidden="true"
    >
      +{xp} XP
    </span>
  );
}
