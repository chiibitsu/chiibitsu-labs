"use client";

import { LitWords } from "./parts";
import { SceneFrame } from "./SceneFrame";
import { seg } from "./scroll";

const st = (fill: string, stroke?: string) => ({ fill, ...(stroke ? { stroke } : {}) });
const draw = (f: number) => ({ pathLength: 1, strokeDasharray: 1, strokeDashoffset: 1 - f });

// See everything: a building whose lights come on one by one.
function SeeArt({ f }: { f: number }) {
  const wins = [0, 1, 2].flatMap((r) => [0, 1, 2].map((c) => ({ x: 72.5 + c * 22.5, y: 32 + r * 24, k: r * 3 + c })));
  return (
    <svg className="tri-art" viewBox="0 0 200 130" role="img" aria-label="A building with lights coming on">
      <rect x={60} y={20} width={80} height={100} strokeWidth={1.4} style={st("var(--ground)", "var(--ink)")} />
      <path d="M50 20 L150 20" strokeWidth={1.4} style={{ stroke: "var(--ink)" }} />
      {wins.map((w) => (
        <rect key={w.k} x={w.x} y={w.y} width={10} height={10} strokeWidth={1} style={st(f > (w.k + 1) / 10 ? "var(--accent)" : "var(--ground)", "var(--ink)")} />
      ))}
      <rect x={88} y={98} width={24} height={22} strokeWidth={1.4} style={st("var(--ground)", "var(--ink)")} />
    </svg>
  );
}

// Decide less: an open notebook that fills in, and a small molecule that glows.
function DecideArt({ f }: { f: number }) {
  return (
    <svg className="tri-art" viewBox="0 0 200 130" role="img" aria-label="An open notebook with a small glowing molecule">
      <g fill="none" strokeWidth={1.4} strokeLinejoin="round" style={{ stroke: "var(--ink)" }}>
        <path d="M20 24 C60 16 90 20 100 30 C110 20 140 16 180 24 L180 108 C140 100 110 104 100 112 C90 104 60 100 20 108 Z M100 30 L100 112" {...draw(seg(f, 0, 0.6))} />
        <path d="M36 44 L84 44 M36 58 L76 58 M36 72 L84 72 M36 86 L70 86" {...draw(seg(f, 0.3, 0.8))} />
        <path d="M140 50 L160 62 L160 84 L140 96 L120 84 L120 62 Z" {...draw(seg(f, 0.5, 0.9))} />
      </g>
      <circle cx={140} cy={73} r={7} opacity={seg(f, 0.7, 1)} style={{ fill: "var(--accent)" }} />
    </svg>
  );
}

// Trust every result: a receipt, and a check that draws itself.
function TrustArt({ f }: { f: number }) {
  return (
    <svg className="tri-art" viewBox="0 0 200 130" role="img" aria-label="A receipt with a check mark drawing itself">
      <path d="M64 10 L136 10 L136 112 L128 104 L120 112 L112 104 L104 112 L96 104 L88 112 L80 104 L72 112 L64 104 Z" strokeWidth={1.4} strokeLinejoin="round" fill="none" style={{ stroke: "var(--ink)" }} {...draw(seg(f, 0, 0.5))} />
      <path d="M76 30 L124 30 M76 44 L116 44 M76 58 L110 58" strokeWidth={1} fill="none" style={{ stroke: "var(--ink-3)" }} {...draw(seg(f, 0.25, 0.65))} />
      <path d="M82 80 L94 92 L120 68" fill="none" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" style={{ stroke: "var(--accent)" }} {...draw(seg(f, 0.55, 1))} />
    </svg>
  );
}

const arts = { see: SeeArt, decide: DecideArt, trust: TrustArt } as const;
type Item = { art: string; title: string; body: string };

// Scene 2 (home): See everything, Decide less, Trust every result. Each idea draws in turn; at the end all three are lit.
export function TriptychScene({ id, label, items, line }: { id?: string; label: string; items: Item[]; line: string }) {
  return (
    <SceneFrame id={id}>
      {(p) => {
        const fs = items.map((_, i) => seg(p, 0.04 + i * 0.28, 0.34 + i * 0.28));
        const lit = fs.filter((f) => f > 0).length;
        return (
          <>
            <h2 className="film-h film-h2">
              <LitWords parts={[{ t: label }]} f={0.3 + p * 2.5} />
            </h2>
            <div className="tri">
              {items.map((it, i) => {
                const Art = arts[it.art as keyof typeof arts];
                return (
                  <div key={it.title} className={`tri-item${fs[i] > 0 ? " lit" : ""}${i === lit - 1 ? " active" : ""}`}>
                    <Art f={fs[i]} />
                    <div className="chain-t">{it.title}</div>
                    <div className="chain-b">{it.body}</div>
                  </div>
                );
              })}
            </div>
            <p className={`film-line centered dim${p > 0.88 ? " on" : ""}`}>{line}</p>
          </>
        );
      }}
    </SceneFrame>
  );
}
