"use client";

import { Fragment } from "react";
import { trackEvent } from "@/lib/analytics";
import { AIKIRI_LEDGER_URL } from "@/lib/links";

// Renders text with every "Aikiri Network" linked to the ledger contract on Base.
export function AikiriText({ text, where }: { text: string; where: string }) {
  return (
    <>
      {text.split(/(Aikiri Network)/).map((part, i) =>
        part === "Aikiri Network" ? (
          <a
            key={i}
            className="aikiri-link"
            href={AIKIRI_LEDGER_URL}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => trackEvent("cta_click", { location: `aikiri_ledger_${where}` })}
          >
            {part}
          </a>
        ) : (
          <Fragment key={i}>{part}</Fragment>
        ),
      )}
    </>
  );
}
