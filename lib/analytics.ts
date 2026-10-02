"use client";

import { track as vercelTrack } from "@vercel/analytics";

type Props = Record<string, string | number | boolean>;

declare global {
  interface Window {
    clarity?: (...args: unknown[]) => void;
  }
}

// One call sends an event to both tools. Vercel keeps it only on a paid plan; Microsoft Clarity keeps it on any plan.
// In Clarity the event name carries its main property, e.g. "cta_click:engage", so it reads on its own in the dashboard.
export function trackEvent(name: string, props?: Props) {
  vercelTrack(name, props);
  if (typeof window === "undefined" || !window.clarity) return;
  const tag = props ? Object.values(props).find((v) => typeof v === "string") : undefined;
  window.clarity("event", tag ? `${name}:${tag}` : name);
}
