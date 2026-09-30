"use client";

import { useState, type ReactNode } from "react";
import { TrackedLink } from "@/components/TrackedLink";
import { Chain, type ChainNode } from "./Chain";
import { LitWords, Pen, type Part } from "./parts";
import { CompareToggle } from "./scenes2";
import { SceneFrame } from "./SceneFrame";
import { clamp01, ease, seg, useNarrow } from "./scroll";

type Link = { label: string; href: string };
type Cta = Link & { location: string };
const dim = (on: boolean) => `dim${on ? " on" : ""}`;

function Hint({ p }: { p: number }) {
  return (
    <div className="hint" style={{ opacity: 1 - clamp01(p * 6) }} aria-hidden="true">
      <span>scroll</span>
      <i />
    </div>
  );
}

function CtaRow({ p, at, cta, secondary }: { p: number; at: number; cta?: Cta; secondary?: Link }) {
  if (!cta) return null;
  return (
    <div className={`film-cta ${dim(p > at)}`}>
      <TrackedLink href={cta.href} className="btn big" event="cta_click" eventProps={{ location: cta.location }}>
        {cta.label}
      </TrackedLink>
      {secondary && (
        <a className="link" href={secondary.href}>{secondary.label}</a>
      )}
    </div>
  );
}

// Scene 1, the thesis: headline words light up, the pen draws, the sub fades in.
// The first frame is readable before any scroll: the headline starts more than half lit.
export function ThesisScene({
  id,
  initial = 0,
  level = 1,
  label,
  parts,
  sub,
  sub2,
  pen = true,
  top,
  cta,
  secondary,
  className,
  aud,
}: {
  id?: string;
  aud?: string;
  initial?: number;
  level?: 1 | 2;
  label?: string;
  parts: Part[];
  sub: string;
  sub2?: string;
  pen?: boolean;
  top?: ReactNode;
  cta?: Cta;
  secondary?: Link;
  className?: string;
}) {
  return (
    <SceneFrame id={id} initial={initial} className={className} aud={aud}>
      {(p) => {
        const words = <LitWords parts={parts} f={0.55 + p * 1.2} />;
        return (
          <>
            {top}
            {label && <div className="label">{label}</div>}
            {level === 1 ? <h1 className="film-h">{words}</h1> : <h2 className="film-h film-h2">{words}</h2>}
            {pen && <Pen f={seg(p, 0.45, 0.75)} />}
            <p className={`film-sub ${dim(p > 0.7)}`}>{sub}</p>
            {sub2 && <p className={`film-sub ${dim(p > 0.85)}`}>{sub2}</p>}
            <CtaRow p={p} at={0.75} cta={cta} secondary={secondary} />
            {initial === 0 && <Hint p={p} />}
          </>
        );
      }}
    </SceneFrame>
  );
}

// Scene 2, the waves (or any timeline): a molecular chain draws across the screen, the last node is violet.
export function ChainScene({
  id,
  label,
  parts,
  nodes,
  hand,
  caption,
  cta,
  secondary,
}: {
  id?: string;
  label?: string;
  parts?: Part[];
  caption?: string;
  nodes: ChainNode[];
  hand?: string;
  cta?: Cta;
  secondary?: Link;
}) {
  return (
    <SceneFrame id={id}>
      {(p) => (
        <>
          {label && <div className="label">{label}</div>}
          {parts && (
            <h2 className="film-h film-h2">
              <LitWords parts={parts} f={0.3 + p * 2.5} />
            </h2>
          )}
          {caption && <p className="film-line centered">{caption}</p>}
          <Chain nodes={nodes} f={p} hand={hand} />
          <CtaRow p={p} at={0.6} cta={cta} secondary={secondary} />
        </>
      )}
    </SceneFrame>
  );
}

// Scene 3, the spheres: three soft bubbles drift together, and only the meeting point glows violet.
export function SpheresScene({
  id,
  label,
  parts,
  labels,
  body,
  line,
  hand,
  proof,
}: {
  id?: string;
  label?: string;
  parts: Part[];
  labels: { systems: string; behavior: string; tech: string };
  body: string;
  line: string;
  hand?: string;
  proof?: { label: string; href: string };
}) {
  const narrow = useNarrow();
  return (
    <SceneFrame id={id}>
      {(p) => {
        const s = 1 - ease(seg(p, 0, 0.75));
        // Geometry: [viewBox w, h, radius, spread dx, spread dy, A, B, C, glow r, label size]
        const g = narrow
          ? { w: 400, h: 330, r: 80, dx: 110, dy: 70, a: [155, 120], b: [245, 120], c: [200, 190], gr: 44, fs: 20, ly: 12, ct: 28 }
          : { w: 1040, h: 440, r: 130, dx: 300, dy: 120, a: [455, 170], b: [585, 170], c: [520, 282], gr: 70, fs: 28, ly: 20, ct: 40 };
        const tf = (c: number[], sx: number, sy: number) => `translate(${c[0] + sx * s * g.dx},${c[1] + sy * s * (sy > 0 ? g.dy : g.dy / 3)})`;
        return (
          <>
            {label && <div className="label">{label}</div>}
            <h2 className="film-h film-h2">
              <LitWords parts={parts} f={0.3 + p * 1.6} />
            </h2>
            <svg className="stage spheres" viewBox={`0 0 ${g.w} ${g.h}`} role="img" aria-label="Three spheres, systems, behavior and emerging tech, drifting together until the center glows violet">
              <defs>
                <radialGradient id="sph" cx="38%" cy="32%" r="75%">
                  <stop offset="0%" style={{ stopColor: "var(--node-hi)", stopOpacity: 0.95 }} />
                  <stop offset="65%" style={{ stopColor: "var(--node-lo)", stopOpacity: 0.6 }} />
                  <stop offset="100%" style={{ stopColor: "var(--ink)", stopOpacity: 0.3 }} />
                </radialGradient>
                <radialGradient id="core" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" style={{ stopColor: "var(--acc-hi)" }} />
                  <stop offset="45%" style={{ stopColor: "var(--accent)", stopOpacity: 0.85 }} />
                  <stop offset="100%" style={{ stopColor: "var(--accent)", stopOpacity: 0 }} />
                </radialGradient>
              </defs>
              <g transform={tf(g.a, -1, -1)}>
                <circle r={g.r} fill="url(#sph)" />
              </g>
              <g transform={tf(g.b, 1, -1)}>
                <circle r={g.r} fill="url(#sph)" />
              </g>
              <g transform={tf(g.c, 0, 1)}>
                <circle r={g.r} fill="url(#sph)" />
              </g>
              <circle cx={g.w / 2} cy={narrow ? 150 : 200} r={g.gr} fill="url(#core)" opacity={clamp01((p - 0.6) / 0.3)} />
              {[
                { c: g.a, sx: -1, sy: -1, y: -g.ly, t: labels.systems },
                { c: g.b, sx: 1, sy: -1, y: -g.ly, t: labels.behavior },
                { c: g.c, sx: 0, sy: 1, y: g.ct, t: labels.tech },
              ].map((l) => (
                <text key={l.t} transform={tf(l.c, l.sx, l.sy)} y={l.y} textAnchor="middle" style={{ fill: "var(--ink)", fontFamily: "var(--serif)", fontSize: g.fs }}>{l.t}</text>
              ))}
              {hand && (
                <g opacity={clamp01((p - 0.62) / 0.2)}>
                  <text x={4} y={narrow ? 22 : 34} style={{ fill: "var(--accent)", fontFamily: "var(--hand)", fontWeight: 500, fontSize: narrow ? 24 : 34 }}>{hand}</text>
                  <path d={narrow ? "M22 38 C10 170 80 205 164 154 M164 154 L152 160 M164 154 L162 141" : "M60 56 C90 210 260 262 462 206 M462 206 L446 210 M462 206 L450 196"} fill="none" strokeWidth={1.8} strokeLinecap="round" style={{ stroke: "var(--accent)" }} />
                </g>
              )}
            </svg>
            {proof && (
              <div className={dim(p > 0.8)}>
                <TrackedLink href={proof.href} className="more">{proof.label}</TrackedLink>
              </div>
            )}
            <div className={`film-sub two ${dim(p > 0.8)}`}>
              <p className="body">{body}</p>
              <p className="film-line">{line}</p>
            </div>
          </>
        );
      }}
    </SceneFrame>
  );
}

// Scene 4, the door: what people know walks out the door, then reverses into the company notebook.
export function DoorScene({
  id,
  label,
  parts,
  lose,
  keep,
  line,
  compare,
}: {
  id?: string;
  label?: string;
  parts: Part[];
  lose: { left: string; right: string };
  keep: { left: string; right: string };
  line: string;
  compare?: { without: string; with: string; hint: string };
}) {
  // Once the toggle shows, a click decides which story is on screen; until then the scroll does.
  const [mode, setMode] = useState<"lose" | "keep" | null>(null);
  return (
    <SceneFrame id={id}>
      {(scroll) => {
        const p = mode === "keep" ? 0.98 : mode === "lose" ? 0.46 : scroll;
        const kept = p >= 0.5;
        const dot = (i: number, q: number, from: number, dir: 1 | -1) => {
          const t = clamp01(q * 1.5 - i * 0.18);
          const o = t < 0.1 ? t / 0.1 : t > 0.85 ? (1 - t) / 0.15 : 1;
          return { x: from + dir * 300 * t, o: t <= 0 ? 0 : o, y: i % 2 ? 112 : 128 };
        };
        const qLose = seg(p, 0.04, 0.46);
        const qKeep = seg(p, 0.56, 0.98);
        const dots = [0, 1, 2, 3].map((i) => (kept ? dot(i, qKeep, 520, -1) : dot(i, qLose, 560, 1)));
        const lab = kept ? keep : lose;
        return (
          <>
            {label && <div className="label">{label}</div>}
            <h2 className="film-h film-h2">
              <LitWords parts={parts} f={0.3 + p * 2.4} />
            </h2>
            <div className="scene-wrap door">
              <svg viewBox="0 0 1104 240" className="door-svg" role="img" aria-label={kept ? "Knowledge dots flowing from a person into the company notebook" : "Knowledge dots leaving through an open door with a person"}>
                <g strokeWidth={1.6} style={{ stroke: "var(--ink)" }}>
                  <rect x={110} y={60} width={160} height={130} style={{ fill: "var(--card)" }} />
                  <path d="M190 60 L190 190" />
                </g>
                <path d="M126 86 L178 86 M126 104 L178 104 M126 122 L170 122 M204 86 L256 86 M204 104 L256 104 M204 122 L246 122" strokeWidth={1} style={{ stroke: "var(--ink-3)" }} />
                <path d="M204 140 L250 140 M126 140 L172 140 M204 158 L240 158" strokeWidth={2.4} strokeLinecap="round" opacity={kept ? clamp01((p - 0.6) / 0.2) : 0} style={{ stroke: "var(--accent)" }} />
                <g strokeWidth={1.6} style={{ stroke: "var(--ink)" }}>
                  <circle cx={540} cy={70} r={16} style={{ fill: "var(--ground)" }} />
                  <path d="M540 86 L540 150 M540 104 L516 128 M540 104 L564 124 M540 150 L522 196 M540 150 L560 196" fill="none" strokeLinecap="round" />
                  <rect x={860} y={40} width={110} height={170} fill="none" />
                  <path d="M860 40 L910 56 L910 222 L860 210" style={{ fill: "var(--card)" }} />
                  <circle cx={900} cy={140} r={3} style={{ fill: "var(--ink)" }} />
                </g>
                <path d="M800 210 L1040 210" strokeWidth={1.2} style={{ stroke: "var(--rule)" }} />
                {dots.map((d, i) => (
                  <circle key={i} cx={d.x} cy={d.y} r={6} opacity={d.o} style={{ fill: "var(--accent)" }} />
                ))}
              </svg>
              <div className="scene-labels door-labels" aria-live="polite">
                <span className="scene-l a" style={{ color: kept ? "var(--accent)" : "var(--ink-3)" }}>{lab.left}</span>
                <span className="scene-l b" style={{ color: kept ? "var(--ink-3)" : "var(--accent)" }}>{lab.right}</span>
              </div>
            </div>
            <p className={`film-line centered ${dim(p > 0.85)}`}>{line}</p>
            {compare && <CompareToggle show={scroll > 0.88 || mode !== null} without={compare.without} withLabel={compare.with} hint={compare.hint} mode={mode ?? (kept ? "keep" : "lose")} onPick={setMode} />}
          </>
        );
      }}
    </SceneFrame>
  );
}

// Scene 5, the long bet: a network assembles node by node, and the meeting point glows.
const NET = {
  nodes: [
    [40, 200],
    [120, 70],
    [175, 210],
    [340, 45],
    [250, 135],
  ],
  edges: [
    [0, 1],
    [1, 4],
    [4, 3],
    [1, 2],
    [2, 4],
  ],
};

export function LongBetScene({
  id,
  label,
  parts,
  body,
  link,
}: {
  id?: string;
  label?: string;
  parts: Part[];
  body: string;
  link: Link;
}) {
  return (
    <SceneFrame id={id}>
      {(p) => {
        const nodeF = (i: number) => ease(seg(p, 0.08 + i * 0.13, 0.2 + i * 0.13));
        return (
          <>
            <svg className="stage net" viewBox="0 0 400 260" aria-hidden="true">
              {NET.edges.map(([a, b], i) => {
                const f = Math.min(nodeF(a), nodeF(b)) * seg(p, 0.2 + i * 0.1, 0.42 + i * 0.1);
                const [x1, y1] = NET.nodes[a];
                const [x2, y2] = NET.nodes[b];
                return (
                  <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} pathLength={1} strokeDasharray={1} strokeDashoffset={1 - f} strokeWidth={1.4} style={{ stroke: "var(--accent)" }} />
                );
              })}
              {NET.nodes.map(([x, y], i) => {
                const last = i === 4;
                const f = nodeF(i);
                return last ? (
                  <circle key={i} cx={x} cy={y} r={11 * f} opacity={0.55 + 0.45 * seg(p, 0.7, 0.9)} style={{ fill: "var(--accent)" }} />
                ) : (
                  <circle key={i} cx={x} cy={y} r={8 * f} strokeWidth={1.4} style={{ fill: "var(--ground)", stroke: "var(--ink)" }} />
                );
              })}
            </svg>
            {label && <div className="label">{label}</div>}
            <h2 className="film-h film-h2">
              <LitWords parts={parts} f={0.2 + p * 1.6} />
            </h2>
            <p className={`film-sub ${dim(p > 0.6)}`}>{body}</p>
            <div className={dim(p > 0.85)}>
              <TrackedLink href={link.href} className="more film-link" event="papers_click" eventProps={{ location: "about" }}>
                {link.label}
              </TrackedLink>
            </div>
          </>
        );
      }}
    </SceneFrame>
  );
}
