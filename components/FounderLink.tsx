import type { ReactNode } from "react";
import { TrackedLink } from "@/components/TrackedLink";

const MENTION = /(Angeline S\. Viray|\bChii\b|\bthe founder\b|\bFounder\b)/g;

// Any mention of Chii or the founder links to /angeline. Use it on plain text, never inside another link.
export function FounderLink({ children }: { children: string }): ReactNode {
  const parts = children.split(MENTION);
  return parts.map((part, i) =>
    i % 2 === 1 ? (
      <TrackedLink key={i} href="/angeline" className="founder-link">
        {part}
      </TrackedLink>
    ) : (
      part
    ),
  );
}
