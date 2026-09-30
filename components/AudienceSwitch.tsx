"use client";

import { useSyncExternalStore } from "react";
import { track } from "@vercel/analytics";

type Aud = "companies" | "solo";

const read = (): Aud => (document.documentElement.getAttribute("data-aud") === "solo" ? "solo" : "companies");

// The audience lives on <html data-aud>, so CSS can swap the copy with no flash. This watches it.
function subscribe(cb: () => void) {
  const mo = new MutationObserver(cb);
  mo.observe(document.documentElement, { attributes: true, attributeFilter: ["data-aud"] });
  return () => mo.disconnect();
}

export function setAudience(to: Aud) {
  if (read() === to) return;
  document.documentElement.setAttribute("data-aud", to);
  const url = new URL(window.location.href);
  url.searchParams.set("for", to);
  window.history.replaceState(null, "", url);
  track("audience_switch", { to });
}

export function AudienceSwitch({ labels }: { labels: Record<Aud, string> }) {
  const aud = useSyncExternalStore(subscribe, read, () => "companies" as Aud);
  const pick = setAudience;

  return (
    <div className="switch" role="group" aria-label="Who is this for">
      <button type="button" className="sw-co" aria-pressed={aud === "companies"} onClick={() => pick("companies")}>
        {labels.companies}
      </button>
      <button type="button" className="sw-solo" aria-pressed={aud === "solo"} onClick={() => pick("solo")}>
        {labels.solo}
      </button>
    </div>
  );
}
