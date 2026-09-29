"use client";

import { useEffect, useRef } from "react";
import { subscribe } from "./scroll";

// The thin violet progress bar across the top of the page. Set directly on the element, so it never re-renders.
export function FilmProgress() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const update = () => {
      const el = ref.current;
      if (!el) return;
      const d = document.documentElement;
      el.style.width = `${(100 * window.scrollY) / Math.max(1, d.scrollHeight - window.innerHeight)}%`;
    };
    const raf = requestAnimationFrame(update);
    const off = subscribe(update);
    return () => {
      cancelAnimationFrame(raf);
      off();
    };
  }, []);
  return <div ref={ref} className="prog" aria-hidden="true" />;
}
