import type { CSSProperties } from "react";
import { clamp01 } from "./scroll";

export type Part = { t: string; em?: boolean };

// Words light up one by one as f goes from 0 to 1 (dim at 22% opacity, lit at 100%).
export function LitWords({ parts, f }: { parts: Part[]; f: number }) {
  const words = parts.flatMap((part) => part.t.split(/\s+/).filter(Boolean).map((w) => ({ w, em: !!part.em })));
  const lit = Math.round(clamp01(f) * words.length);
  return (
    <>
      {words.map((x, i) => (
        <span key={i}>
          <span className={`w${i < lit ? " on" : ""}${x.em ? " em" : ""}`}>{x.w}</span>{" "}
        </span>
      ))}
    </>
  );
}

// The violet pen underline drawing itself.
export function Pen({ f }: { f: number }) {
  return (
    <svg className="pen" viewBox="0 0 420 18" aria-hidden="true">
      <path
        d="M4 12 C80 4 180 16 260 8 S380 6 416 10"
        fill="none"
        strokeWidth={3}
        strokeLinecap="round"
        pathLength={1}
        strokeDasharray={1}
        strokeDashoffset={1 - clamp01(f)}
        style={{ stroke: "var(--accent)" }}
      />
    </svg>
  );
}

// A benzene-style hexagon node. The current one is violet.
export function Hex({ n, cur, size }: { n: number; cur?: boolean; size?: number }) {
  const pts = Array.from({ length: 6 }, (_, k) => {
    const a = (Math.PI / 3) * k + Math.PI / 6;
    return `${(46 + 44 * Math.cos(a)).toFixed(1)},${(46 + 44 * Math.sin(a)).toFixed(1)}`;
  }).join(" ");
  const st = (v: Record<string, string>): CSSProperties => v;
  return (
    <svg className="hex" viewBox="0 0 92 92" width={size} height={size} aria-hidden="true">
      <polygon points={pts} strokeWidth={cur ? 2.4 : 1.4} style={st({ fill: "var(--card)", stroke: cur ? "var(--accent)" : "var(--ink)" })} />
      <circle cx={46} cy={46} r={cur ? 16 : 9} style={st({ fill: cur ? "var(--accent)" : "var(--ink-3)" })} />
      <text x={46} y={51} textAnchor="middle" style={st({ fill: cur ? "var(--on-accent)" : "var(--card)", fontFamily: "var(--mono)", fontSize: "12px" })}>
        {String(n).padStart(2, "0")}
      </text>
    </svg>
  );
}
