"use client";

import { LitWords } from "./parts";
import { SceneFrame } from "./SceneFrame";
import { clamp01, ease, seg } from "./scroll";

// "₱28M", "4,000+", "76,000": count up from zero as f goes from 0 to 1. At f = 1 the value is shown exactly as written.
export function countUp(value: string, f: number): string {
  if (f >= 1) return value;
  const m = value.match(/^([^\d]*)([\d,]*\.?\d+)(.*)$/);
  if (!m) return value;
  const [, pre, num, suf] = m;
  const target = parseFloat(num.replace(/,/g, ""));
  const cur = target * clamp01(f);
  const dec = num.includes(".") ? num.split(".")[1].length : 0;
  const shown = num.includes(",") ? Math.round(cur).toLocaleString("en-US") : cur.toFixed(dec);
  return `${pre}${shown}${suf}`;
}

export type Figure = { value: string; label: string; illustrative?: boolean };

// The figures row. Numbers are green (Chii override); a figure that is not real (dated and sourced) still carries the Illustrative label.
export function Figures({ figures, p, from = 0.1 }: { figures: Figure[]; p: number; from?: number }) {
  return (
    <div className="figs-film">
      {figures.map((f, i) => (
        <div key={f.value} className="fig-film">
          <div className={`figure${f.illustrative === false ? " real" : ""}`}>{countUp(f.value, ease(seg(p, from + i * 0.12, from + 0.5 + i * 0.12)))}</div>
          <div className="body">{f.label}</div>
          {f.illustrative !== false && <span className="ill">Illustrative</span>}
        </div>
      ))}
    </div>
  );
}

// Scene 5 (home): the numbers count up.
export function NumbersScene({ id, heading, note, figures }: { id?: string; heading: string; note: string; figures: Figure[] }) {
  return (
    <SceneFrame id={id}>
      {(p) => (
        <>
          <h2 className="film-h film-h2">
            <LitWords parts={[{ t: heading }]} f={0.3 + p * 2.5} />
          </h2>
          <Figures figures={figures} p={p} />
          <p className={`caption dim${p > 0.7 ? " on" : ""}`}>{note}</p>
        </>
      )}
    </SceneFrame>
  );
}
