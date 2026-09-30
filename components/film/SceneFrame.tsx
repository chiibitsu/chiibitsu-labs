"use client";

import { useRef, type ReactNode } from "react";
import { useSceneProgress } from "./scroll";

// A scene: a 300vh section with a sticky full-screen frame. Every animation inside is a function of p.
export function SceneFrame({
  id,
  initial = 1,
  className,
  aud,
  children,
}: {
  id?: string;
  aud?: string;
  initial?: number;
  className?: string;
  children: (p: number) => ReactNode;
}) {
  const ref = useRef<HTMLElement>(null);
  const p = useSceneProgress(ref, initial);
  return (
    <section ref={ref} id={id} data-aud={aud} className={`fscene${className ? ` ${className}` : ""}`}>
      <div className="pin">{children(p)}</div>
    </section>
  );
}
