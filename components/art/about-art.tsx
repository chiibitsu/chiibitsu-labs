import type { SVGProps } from "react";

type P = SVGProps<SVGSVGElement>;

export function WaveStartup(props: P) {
  return (
<svg viewBox="0 0 200 150" width="200" height="150" role="img" aria-label="Wave 01: Startup Weekend" style={{ alignSelf: "center" }} {...props}><rect style={{ fill: "var(--ground)", stroke: "var(--ink)" }} x="40" y="40" width="120" height="76" strokeWidth="1.4"/><path style={{ stroke: "var(--accent)" }} className="draw w1" d="M56 96 L84 70 L104 84 L140 56" fill="none" strokeWidth="2.4" strokeLinecap="round"/><path style={{ stroke: "var(--ink)" }} d="M100 116 L100 132 M76 132 L124 132" strokeWidth="1.4"/></svg>
  );
}

export function WaveMobility(props: P) {
  return (
<svg viewBox="0 0 200 150" width="200" height="150" role="img" aria-label="Wave 02: Mobility" style={{ alignSelf: "center" }} {...props}><path style={{ stroke: "var(--ink)" }} className="draw w2" d="M34 100 L50 72 L140 72 L162 100 Z" fill="none" strokeWidth="1.6" strokeLinejoin="round"/><path style={{ stroke: "var(--ink)" }} d="M28 100 L170 100" strokeWidth="1.4"/><circle style={{ fill: "var(--ground)", stroke: "var(--ink)" }} cx="64" cy="104" r="11" strokeWidth="1.4"/><circle style={{ fill: "var(--ground)", stroke: "var(--ink)" }} cx="134" cy="104" r="11" strokeWidth="1.4"/><circle style={{ fill: "var(--accent)" }} className="flicker" cx="160" cy="88" r="4"/></svg>
  );
}

export function WaveBlockchain(props: P) {
  return (
<svg viewBox="0 0 200 150" width="200" height="150" role="img" aria-label="Wave 03: Blockchain" style={{ alignSelf: "center" }} {...props}><g style={{ stroke: "var(--ink)" }} fill="none" strokeWidth="1.3"><path className="flow" d="M50 60 L100 40 L150 60 L150 100 L100 120 L50 100 Z"/><path className="flow" d="M100 40 L100 120 M50 60 L150 100 M150 60 L50 100"/></g><g style={{ fill: "var(--ground)", stroke: "var(--ink)" }} strokeWidth="1.4"><circle cx="50" cy="60" r="7"/><circle cx="150" cy="60" r="7"/><circle cx="150" cy="100" r="7"/><circle cx="50" cy="100" r="7"/><circle cx="100" cy="120" r="7"/></g><circle style={{ fill: "var(--accent)" }} className="glow" cx="100" cy="40" r="8"/></svg>
  );
}

export function WaveAI(props: P) {
  return (
<svg viewBox="0 0 200 150" width="200" height="150" role="img" aria-label="Wave 04: AI" style={{ alignSelf: "center" }} {...props}><path style={{ stroke: "var(--ink)" }} className="draw w4" d="M40 110 C70 40 130 40 160 110" fill="none" strokeWidth="1.4"/><g style={{ fill: "var(--ground)", stroke: "var(--ink)" }} strokeWidth="1.4"><circle cx="60" cy="80" r="8"/><circle cx="140" cy="80" r="8"/><circle cx="100" cy="112" r="8"/></g><circle style={{ fill: "var(--accent)" }} className="glow" cx="100" cy="58" r="11"/><path style={{ stroke: "var(--accent)" }} className="flow" d="M100 58 L60 80 M100 58 L140 80 M100 58 L100 112" strokeWidth="1.3" fill="none"/></svg>
  );
}

export function Venn(props: P) {
  return (
<svg viewBox="0 0 520 420" width="520" height="420" role="img" aria-label="Three overlapping circles: systems, behavior and emerging tech, with Chiibitsu Labs where all three meet" {...props}>
<circle style={{ stroke: "var(--ink)" }} cx="200" cy="150" r="120" fill="none" strokeWidth="1.4"/>
<circle style={{ stroke: "var(--ink)" }} cx="320" cy="150" r="120" fill="none" strokeWidth="1.4"/>
<circle style={{ stroke: "var(--accent)" }} className="glow" cx="260" cy="254" r="120" fill="none" strokeWidth="1.8"/>
<circle style={{ fill: "var(--hover-bg)" }} cx="260" cy="186" r="46"/>
<circle style={{ fill: "var(--accent)" }} className="glow" cx="260" cy="186" r="6"/>
</svg>
  );
}

export function Fork(props: P) {
  return (
<svg viewBox="0 0 520 220" width="520" height="220" role="img" aria-label="A path splitting into three, each with its own cost" {...props}>
<path style={{ stroke: "var(--ink)" }} d="M20 110 L200 110" strokeWidth="1.6" fill="none"/>
<path style={{ stroke: "var(--ink)" }} className="draw w1" d="M200 110 C260 110 280 40 360 40 L500 40" strokeWidth="1.4" fill="none"/>
<path style={{ stroke: "var(--accent)" }} className="draw w2" d="M200 110 L500 110" strokeWidth="2.2" fill="none"/>
<path style={{ stroke: "var(--ink)" }} className="draw w3" d="M200 110 C260 110 280 180 360 180 L500 180" strokeWidth="1.4" fill="none"/>
<circle style={{ fill: "var(--ground)", stroke: "var(--ink)" }} cx="200" cy="110" r="8" strokeWidth="1.4"/><circle style={{ fill: "var(--accent)" }} className="glow" cx="500" cy="110" r="7"/>
</svg>
  );
}

export function Network(props: P) {
  return (
<svg viewBox="0 0 200 130" width="200" height="130" aria-hidden="true" {...props}><g style={{ stroke: "var(--accent)" }} fill="none" strokeWidth="1.3"><path className="flow" d="M30 90 L80 40"/><path className="flow" d="M80 40 L140 70"/><path className="flow" d="M140 70 L180 26"/><path className="flow" d="M80 40 L100 100"/><path className="flow" d="M100 100 L140 70"/></g><g style={{ fill: "var(--ground)", stroke: "var(--ink)" }} strokeWidth="1.4"><circle cx="30" cy="90" r="8"/><circle cx="80" cy="40" r="8"/><circle cx="100" cy="100" r="8"/><circle cx="180" cy="26" r="8"/></g><circle style={{ fill: "var(--accent)" }} className="glow" cx="140" cy="70" r="9"/></svg>
  );
}

export function SceneLose(props: P) {
  return (
<svg viewBox="0 0 1104 240" width="1104" height="240" role="img" aria-label="Knowledge dots leaving through an open door with a person" {...props}><g style={{ stroke: "var(--ink)" }} strokeWidth="1.6"><rect style={{ fill: "var(--card)" }} x="110" y="60" width="160" height="130"/><path d="M190 60 L190 190"/><path style={{ stroke: "var(--ink-3)" }} d="M126 86 L178 86 M126 104 L178 104 M126 122 L170 122 M204 86 L256 86 M204 104 L256 104 M204 122 L246 122" strokeWidth="1"/></g><g style={{ stroke: "var(--ink)", fill: "var(--ground)" }} strokeWidth="1.6"><circle cx="540" cy="70" r="16"/><path d="M540 86 L540 150 M540 104 L516 128 M540 104 L564 124 M540 150 L522 196 M540 150 L560 196" fill="none" strokeLinecap="round"/></g><g style={{ stroke: "var(--ink)" }} strokeWidth="1.6" fill="none"><rect x="860" y="40" width="110" height="170"/><path style={{ fill: "var(--card)" }} d="M860 40 L910 56 L910 222 L860 210"/><circle style={{ fill: "var(--ink)" }} cx="900" cy="140" r="3"/></g><path style={{ stroke: "var(--rule)" }} d="M800 210 L1040 210" strokeWidth="1.2"/><circle style={{ fill: "var(--accent)" }} className="leak k1" cx="560" cy="128" r="6"/><circle style={{ fill: "var(--accent)" }} className="leak k2" cx="560" cy="112" r="6"/><circle style={{ fill: "var(--accent)" }} className="leak k3" cx="560" cy="128" r="6"/><circle style={{ fill: "var(--accent)" }} className="leak k4" cx="560" cy="112" r="6"/></svg>
  );
}

export function SceneKeep(props: P) {
  return (
<svg viewBox="0 0 1104 240" width="1104" height="240" role="img" aria-label="Knowledge dots flowing from a person into the company notebook" {...props}><g style={{ stroke: "var(--ink)" }} strokeWidth="1.6"><rect style={{ fill: "var(--card)" }} x="110" y="60" width="160" height="130"/><path d="M190 60 L190 190"/><path style={{ stroke: "var(--ink-3)" }} d="M126 86 L178 86 M126 104 L178 104 M126 122 L170 122 M204 86 L256 86 M204 104 L256 104 M204 122 L246 122" strokeWidth="1"/></g><path style={{ stroke: "var(--accent)" }} className="glow" d="M204 140 L250 140 M126 140 L172 140 M204 158 L240 158" strokeWidth="2.4" strokeLinecap="round"/><g style={{ stroke: "var(--ink)", fill: "var(--ground)" }} strokeWidth="1.6"><circle cx="540" cy="70" r="16"/><path d="M540 86 L540 150 M540 104 L516 128 M540 104 L564 124 M540 150 L522 196 M540 150 L560 196" fill="none" strokeLinecap="round"/></g><g style={{ stroke: "var(--ink)" }} strokeWidth="1.6" fill="none"><rect x="860" y="40" width="110" height="170"/><path style={{ fill: "var(--card)" }} d="M860 40 L910 56 L910 222 L860 210"/><circle style={{ fill: "var(--ink)" }} cx="900" cy="140" r="3"/></g><path style={{ stroke: "var(--rule)" }} d="M800 210 L1040 210" strokeWidth="1.2"/><circle style={{ fill: "var(--accent)" }} className="keep k1" cx="520" cy="128" r="6"/><circle style={{ fill: "var(--accent)" }} className="keep k2" cx="520" cy="112" r="6"/><circle style={{ fill: "var(--accent)" }} className="keep k3" cx="520" cy="128" r="6"/><circle style={{ fill: "var(--accent)" }} className="keep k4" cx="520" cy="112" r="6"/></svg>
  );
}

