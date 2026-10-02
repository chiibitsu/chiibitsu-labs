"use client";

import { useEffect } from "react";
import { trackEvent } from "@/lib/analytics";

// Reports each film scene once per visit, the first time it crosses the middle of the screen, as "scene:<id>" (or "scene:scene-3" when it has no id).
// Read in order, these show how far into the film people get and where they stop.
export function SceneBeacon() {
  useEffect(() => {
    const scenes = Array.from(document.querySelectorAll<HTMLElement>("section.fscene"));
    // A scene without an id is named by its place in the film: "scene-3".
    const names = new Map(scenes.map((s, i) => [s, s.id || `scene-${i + 1}`] as const));
    const seen = new Set<string>();
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (!e.isIntersecting) continue;
          const id = names.get(e.target as HTMLElement) ?? "scene";
          if (seen.has(id)) continue;
          seen.add(id);
          trackEvent("scene", { id });
        }
      },
      { rootMargin: "-50% 0px -50% 0px" },
    );
    scenes.forEach((s) => io.observe(s));
    return () => io.disconnect();
  }, []);
  return null;
}
