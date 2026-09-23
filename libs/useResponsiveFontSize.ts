"use client";

import { useLayoutEffect, useState } from "react";

type FontSizeBreakpoints = {
  base: number;
  sm?: number;
  md?: number;
  lg?: number;
};

// Mirrors Tailwind's default breakpoints so the JS-driven size lines up
// exactly with what `sm:` / `md:` / `lg:` classes would have applied.
const BREAKPOINTS = { sm: 640, md: 768, lg: 1024 } as const;

function resolveSize(
  { base, sm, md, lg }: FontSizeBreakpoints,
  width: number,
) {
  if (lg !== undefined && width >= BREAKPOINTS.lg) return lg;
  if (md !== undefined && width >= BREAKPOINTS.md) return md;
  if (sm !== undefined && width >= BREAKPOINTS.sm) return sm;
  return base;
}

export function useResponsiveFontSize(breakpoints: FontSizeBreakpoints) {
  const [fontSize, setFontSize] = useState(breakpoints.base);

  useLayoutEffect(() => {
    function update() {
      setFontSize(resolveSize(breakpoints, window.innerWidth));
    }
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [breakpoints.base, breakpoints.sm, breakpoints.md, breakpoints.lg]);

  return fontSize;
}