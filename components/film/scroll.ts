"use client";

import { useEffect, useState, useSyncExternalStore, type RefObject } from "react";

// One passive scroll listener for every scene, throttled with requestAnimationFrame. No scroll-jacking.
const listeners = new Set<() => void>();
let ticking = false;
let observer: MutationObserver | undefined;

function onScroll() {
  if (ticking) return;
  ticking = true;
  requestAnimationFrame(() => {
    ticking = false;
    listeners.forEach((l) => l());
  });
}

export function subscribe(cb: () => void) {
  if (listeners.size === 0) {
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    // Switching audience shows a different scene without any scroll; measure again so it starts from its own progress.
    observer = new MutationObserver(onScroll);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-aud"] });
  }
  listeners.add(cb);
  return () => {
    listeners.delete(cb);
    if (listeners.size === 0) {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      observer?.disconnect();
    }
  };
}

function useMedia(query: string): boolean {
  return useSyncExternalStore(
    (cb) => {
      const m = window.matchMedia(query);
      m.addEventListener("change", cb);
      return () => m.removeEventListener("change", cb);
    },
    () => window.matchMedia(query).matches,
    () => false,
  );
}

export const useReducedMotion = () => useMedia("(prefers-reduced-motion: reduce)");
export const useNarrow = () => useMedia("(max-width: 640px)");

export const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
export const ease = (t: number) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);
// The part of progress p between a and b, as 0 to 1.
export const seg = (p: number, a: number, b: number) => clamp01((p - a) / (b - a));

// Scene progress: 0 as the scene's top reaches the top of the screen, 1 as its bottom reaches the bottom.
// `initial` is what renders before scripts run: 1 (complete) for scenes below the fold, so nothing waits at opacity 0.
// Reduced motion always returns 1, the final state.
export function useSceneProgress(ref: RefObject<HTMLElement | null>, initial: number): number {
  const reduced = useReducedMotion();
  const [p, setP] = useState(initial);

  useEffect(() => {
    const compute = () => {
      const el = ref.current;
      if (!el) return;
      const span = el.offsetHeight - window.innerHeight;
      const v = span > 0 ? clamp01(-el.getBoundingClientRect().top / span) : 1;
      setP(Math.round(v * 1000) / 1000);
    };
    const raf = requestAnimationFrame(compute);
    const off = subscribe(compute);
    return () => {
      cancelAnimationFrame(raf);
      off();
    };
  }, [ref]);

  return reduced ? 1 : p;
}
