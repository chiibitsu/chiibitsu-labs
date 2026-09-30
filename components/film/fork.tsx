"use client";

import { LitWords, type Part } from "./parts";
import { SceneFrame } from "./SceneFrame";
import { seg } from "./scroll";

// Scene 4 (about), "You choose": one path splits into three, each with its own cost, and the middle one is yours.
export function ForkScene({
  id,
  eyebrow,
  parts,
  body,
  alt,
  labels,
}: {
  id?: string;
  eyebrow: string;
  parts: Part[];
  body: string;
  alt: string;
  labels: { top: string; mid: string; bottom: string };
}) {
  return (
    <SceneFrame id={id}>
      {(p) => {
        const d = (a: number, b: number) => ({ pathLength: 1, strokeDasharray: 1, strokeDashoffset: 1 - seg(p, a, b) });
        const on = p > 0.5;
        return (
          <>
            <div className="label">{eyebrow}</div>
            <h2 className="film-h film-h2">
              <LitWords parts={parts} f={0.25 + p * 1.8} />
            </h2>
            <div className="fork-stage">
              <svg viewBox="0 0 520 220" role="img" aria-label={alt}>
                <path d="M20 110 L200 110" fill="none" strokeWidth={1.6} style={{ stroke: "var(--ink)" }} {...d(0.02, 0.22)} />
                <path d="M200 110 C260 110 280 40 360 40 L500 40" fill="none" strokeWidth={1.4} style={{ stroke: "var(--ink)" }} {...d(0.22, 0.5)} />
                <path d="M200 110 L500 110" fill="none" strokeWidth={2.2} style={{ stroke: "var(--accent)" }} {...d(0.4, 0.75)} />
                <path d="M200 110 C260 110 280 180 360 180 L500 180" fill="none" strokeWidth={1.4} style={{ stroke: "var(--ink)" }} {...d(0.5, 0.8)} />
                <circle cx={200} cy={110} r={8} strokeWidth={1.4} style={{ fill: "var(--ground)", stroke: "var(--ink)" }} />
                <circle cx={500} cy={110} r={7} opacity={seg(p, 0.7, 0.85)} style={{ fill: "var(--accent)" }} />
              </svg>
              <div className={`fork-labels dim${on ? " on" : ""}`}>
                <span className="fork-l t">{labels.top}</span>
                <span className="fork-l m" style={{ color: "var(--accent)" }}>{labels.mid}</span>
                <span className="fork-l b">{labels.bottom}</span>
              </div>
            </div>
            <p className={`film-sub dim${p > 0.85 ? " on" : ""}`}>{body}</p>
          </>
        );
      }}
    </SceneFrame>
  );
}
