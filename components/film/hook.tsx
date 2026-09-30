"use client";

import type { ReactNode } from "react";
import { LitWords, type Part } from "./parts";
import { SceneFrame } from "./SceneFrame";
import { ease, seg } from "./scroll";

// Scene 1 (home), the owner hook: every line runs through "you". As you scroll, the lines let go of "you"
// and rewire into a network, and only the big calls still come to you.
const C = { x: 260, y: 150 };
const N = 8;
const nodes = Array.from({ length: N }, (_, i) => {
  const a = (Math.PI * 2 * i) / N - Math.PI / 2;
  return { x: C.x + 200 * Math.cos(a), y: C.y + 112 * Math.sin(a) };
});
const KEEP = new Set([0, 4]); // the two big calls that stay with the owner

export function HookScene({
  aud,
  parts,
  sub,
  top,
  secondary,
  youLabel,
}: {
  aud?: string;
  parts: Part[];
  sub: string;
  top?: ReactNode;
  secondary?: { label: string; href: string };
  youLabel: string;
}) {
  return (
    <SceneFrame aud={aud} initial={0}>
      {(p) => (
        <>
          {top}
          <h1 className="film-h film-h2 hook-h">
            <LitWords parts={parts} f={0.55 + p * 1.2} />
          </h1>
          <svg className="stage hook" viewBox="0 0 520 300" aria-hidden="true">
            {nodes.map((n, i) => {
              const keep = KEEP.has(i);
              const to = nodes[(i + 1) % N];
              const e = keep ? 0 : ease(seg(p, 0.12 + i * 0.05, 0.5 + i * 0.05));
              const x2 = C.x + (to.x - C.x) * e;
              const y2 = C.y + (to.y - C.y) * e;
              return (
                <line
                  key={i}
                  x1={n.x}
                  y1={n.y}
                  x2={keep ? C.x : x2}
                  y2={keep ? C.y : y2}
                  strokeWidth={1.4}
                  style={{ stroke: `color-mix(in srgb, var(--accent) ${Math.round(e * 100)}%, var(--ink-3))` }}
                />
              );
            })}
            {[1, 5].map((i) => {
              const a = nodes[i];
              const b = nodes[(i + 3) % N];
              const f = ease(seg(p, 0.7, 0.92));
              return <line key={`c${i}`} x1={a.x} y1={a.y} x2={a.x + (b.x - a.x) * f} y2={a.y + (b.y - a.y) * f} strokeWidth={1.4} style={{ stroke: "var(--accent)" }} />;
            })}
            {nodes.map((n, i) => (
              <circle key={i} cx={n.x} cy={n.y} r={9} strokeWidth={1.4} style={{ fill: "var(--card)", stroke: "var(--ink)" }} />
            ))}
            <circle cx={C.x} cy={C.y} r={24} style={{ fill: "var(--ink)" }} />
            <text x={C.x} y={C.y + 5} textAnchor="middle" style={{ fill: "var(--ground)", fontFamily: "var(--mono)", fontSize: 15, fontWeight: 500 }}>
              {youLabel}
            </text>
          </svg>
          <p className={`film-sub dim${p > 0.7 ? " on" : ""}`}>{sub}</p>
          {secondary && (
            <a className={`link film-secondary dim${p > 0.8 ? " on" : ""}`} href={secondary.href}>
              {secondary.label}
            </a>
          )}
        </>
      )}
    </SceneFrame>
  );
}
