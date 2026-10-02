"use client";

import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";

const reduced = () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// Marks an element once it has scrolled into view. Server HTML and no-JS show the finished page;
// the hidden "before" state only exists after mount (class "armed"), and never with reduced motion.
function useSeen<T extends HTMLElement>(threshold = 0.2) {
  const ref = useRef<T>(null);
  const [seen, setSeen] = useState(false);
  const [armed, setArmed] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || reduced() || typeof IntersectionObserver === "undefined") return;
    setArmed(true);
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setSeen(true);
          io.disconnect();
        }
      },
      { threshold, rootMargin: "0px 0px -8% 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [threshold]);

  return { ref, seen, armed };
}

type Tag = "div" | "li" | "ol";

// Adds "armed" then "in-view" for CSS to animate. `rise` fades and lifts the element; `i` staggers siblings.
export function InView({
  as = "div",
  className,
  rise,
  i,
  threshold,
  children,
}: {
  as?: Tag;
  className?: string;
  rise?: boolean;
  i?: number;
  threshold?: number;
  children: ReactNode;
}) {
  const { ref, seen, armed } = useSeen<HTMLElement>(threshold);
  const El = as as "div";
  const cls = [rise ? "rise" : "", className ?? "", armed ? "armed" : "", seen ? "in-view" : ""].filter(Boolean).join(" ");
  const style = i !== undefined ? ({ "--i": i } as CSSProperties) : undefined;
  return (
    <El ref={ref as React.RefObject<HTMLDivElement>} className={cls} style={style}>
      {children}
    </El>
  );
}

// A figure such as "₹28M", "4,000+" or "76,000" that counts up from zero when it scrolls into view.
// The finished text is in the server HTML and is what screen readers read.
export function CountUp({ value, ms = 1400, className }: { value: string; ms?: number; className?: string }) {
  const m = /^(\D*)(\d[\d,]*(?:\.\d+)?)(.*)$/.exec(value);
  const { ref, seen, armed } = useSeen<HTMLSpanElement>(0.6);
  const [k, setK] = useState(0);

  useEffect(() => {
    if (!seen) return;
    let raf = 0;
    const t0 = performance.now();
    const step = (t: number) => {
      const p = Math.min(1, (t - t0) / ms);
      setK(p);
      if (p < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [seen, ms]);

  let shown = value;
  if (m && armed && k < 1) {
    const [, pre, num, post] = m;
    const target = parseFloat(num.replace(/,/g, ""));
    const dec = num.includes(".") ? num.split(".")[1].length : 0;
    const eased = 1 - Math.pow(1 - k, 3);
    const n = target * eased;
    const body = num.includes(",")
      ? n.toLocaleString("en-US", { minimumFractionDigits: dec, maximumFractionDigits: dec })
      : n.toFixed(dec);
    shown = `${pre}${body}${post}`;
  }

  return (
    <span ref={ref} className={className}>
      <span className="sr-only">{value}</span>
      <span aria-hidden="true">{shown}</span>
    </span>
  );
}
