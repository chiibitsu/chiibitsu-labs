import type { SVGProps } from "react";

export function DataRoom(props: SVGProps<SVGSVGElement>) {
  return (
<svg viewBox="0 0 220 180" width="220" height="180" role="img" aria-label="A folder of documents behind a lock" {...props}>
<g fill="none" stroke="var(--ink)" strokeWidth="1.4" strokeLinejoin="round">
<path d="M30 50 L90 50 L102 64 L190 64 L190 160 L30 160 Z" fill="var(--card)"/>
<path d="M50 40 L150 40 L150 64" /><path d="M62 30 L162 30 L162 64"/>
<rect x="88" y="98" width="44" height="36" rx="4" fill="var(--ground)"/>
<path d="M98 98 L98 86 C98 74 122 74 122 86 L122 98"/>
</g>
<circle className="glow" cx="110" cy="116" r="5" fill="var(--accent)"/>
</svg>
  );
}
