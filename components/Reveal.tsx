"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

// Starts its drawings when they scroll into view. Before that, and without JS, CSS shows the finished drawing.
export function Reveal({ className, children }: { className?: string; children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const [seen, setSeen] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") {
      setSeen(true);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setSeen(true);
          io.disconnect();
        }
      },
      { threshold: 0.25 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div ref={ref} className={`reveal${seen ? " in-view" : ""}${className ? ` ${className}` : ""}`}>
      {children}
    </div>
  );
}
