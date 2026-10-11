"use client";

import Link from "next/link";
import { Fragment } from "react";
import { trackEvent } from "@/lib/analytics";
import { NETWORK_PATH } from "@/lib/links";

// Renders text with every "Aikiri Network" linked to the network's about page.
export function AikiriText({ text, where }: { text: string; where: string }) {
  return (
    <>
      {text.split(/(Aikiri Network)/).map((part, i) =>
        part === "Aikiri Network" ? (
          <Link key={i} className="aikiri-link" href={NETWORK_PATH} onClick={() => trackEvent("cta_click", { location: `aikiri_network_${where}` })}>
            {part}
          </Link>
        ) : (
          <Fragment key={i}>{part}</Fragment>
        ),
      )}
    </>
  );
}
