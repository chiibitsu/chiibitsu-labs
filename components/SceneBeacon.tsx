"use client";

import { useEffect } from "react";
import { trackEvent } from "@/lib/analytics";

// Reports each film scene once per visit, the first time half of it is on screen, as "scene:<id>".
// Read in order, these show how far into the film people get and where they stop.
export function SceneBeacon() {
  useEffect(() => {
    const scenes = Array.from(document.querySelectorAll<HTMLElement>("section.fscene"));
    const seen = new Set<string>();
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (!e.isIntersecting) continue;
          const id = e.target.id || "hook";
          if (seen.has(id)) continue;
          seen.add(id);
          trackEvent("scene", { id });
        }
      },
      { threshold: 0.5 },
    );
    scenes.forEach((s) => io.observe(s));
    return () => io.disconnect();
  }, []);
  return null;
}
