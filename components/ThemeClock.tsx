"use client";

import { useEffect } from "react";
import { NIGHT_END, NIGHT_START } from "@/lib/boot";

// Keeps the theme right if the tab stays open past dusk or dawn. Skipped when ?theme= is set.
export function ThemeClock() {
  useEffect(() => {
    if (new URLSearchParams(window.location.search).get("theme")) return;
    const tick = () => {
      const h = new Date().getHours();
      const night = h >= NIGHT_START || h < NIGHT_END;
      document.documentElement.setAttribute("data-theme", night ? "night" : "day");
    };
    const id = window.setInterval(tick, 60_000);
    return () => window.clearInterval(id);
  }, []);
  return null;
}
