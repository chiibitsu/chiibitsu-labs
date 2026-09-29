"use client";

import { TrackedLink } from "@/components/TrackedLink";
import { LitWords, type Part } from "./parts";
import { SceneFrame } from "./SceneFrame";
import { ease, seg, useNarrow } from "./scroll";

// Deterministic scatter, so server and browser agree.
const rnd = (i: number, k: number) => {
  const x = Math.sin(i * 12.9898 + k * 78.233) * 43758.5453;
  return x - Math.floor(x);
};
const DOTS = 28;

// The last scene: dots gather into a ring around one button. The button pulses while the scene is in view.
export function InviteScene({
  id,
  parts,
  body,
  cta,
  solo,
}: {
  id?: string;
  parts: Part[];
  body: string;
  cta: { label: string; href: string; location: string };
  solo?: { label: string; href: string };
}) {
  const narrow = useNarrow();
  const g = narrow ? { w: 360, h: 180, rx: 165, ry: 62 } : { w: 560, h: 190, rx: 262, ry: 70 };
  return (
    <SceneFrame id={id}>
      {(p) => (
        <>
          <h2 className="film-h">
            <LitWords parts={parts} f={0.2 + p * 2} />
          </h2>
          <p className={`film-sub dim${p > 0.35 ? " on" : ""}`}>{body}</p>
          <div className="ring-stage" style={{ maxWidth: g.w }}>
            <svg viewBox={`0 0 ${g.w} ${g.h}`} aria-hidden="true">
              {Array.from({ length: DOTS }, (_, i) => {
                const a = (Math.PI * 2 * i) / DOTS - Math.PI / 2;
                const tx = g.w / 2 + g.rx * Math.cos(a);
                const ty = g.h / 2 + g.ry * Math.sin(a);
                const sx = rnd(i, 1) * g.w;
                const sy = rnd(i, 2) * g.h;
                const e = ease(seg(p, 0.2 + rnd(i, 3) * 0.2, 0.7 + rnd(i, 3) * 0.2));
                return <circle key={i} cx={sx + (tx - sx) * e} cy={sy + (ty - sy) * e} r={3.2 + e * 0.8} style={{ fill: "var(--accent)", opacity: 0.35 + 0.65 * e }} />;
              })}
            </svg>
            <div className={`ring-cta${p > 0.7 ? " pulse" : ""}`}>
              <TrackedLink href={cta.href} className="btn big" event="cta_click" eventProps={{ location: cta.location }}>
                {cta.label}
              </TrackedLink>
            </div>
          </div>
          {solo && (
            <div className={`dim${p > 0.75 ? " on" : ""}`}>
              <TrackedLink href={solo.href} className="link film-secondary" event="audience_switch" eventProps={{ to: "solo", from: "about" }}>
                {solo.label}
              </TrackedLink>
            </div>
          )}
        </>
      )}
    </SceneFrame>
  );
}
