"use client";

import { useEffect, useState } from "react";

type Node = { label: string; x: number; y: number; r: number; z: number; lx: number; ly: number; tf: string; col: string };

const W = 580;
const H = 300;
const pct = (v: number, of: number) => `${((v / of) * 100).toFixed(3)}%`;

function build(labels: string[], spin: number): Node[] {
  const cx = 380, cy = 150, rx = 130, ry = 50, phi = (-26 * Math.PI) / 180;
  const cp = Math.cos(phi), sp = Math.sin(phi);
  const nodes = labels.map((label, i) => {
    const th = spin + (i * Math.PI) / 3;
    const ex = rx * Math.cos(th), ey = ry * Math.sin(th), z = Math.sin(th);
    const x = cx + ex * cp - ey * sp, y = cy + ex * sp + ey * cp;
    const r = 15 + 5 * z;
    let dx = x - cx, dy = y - cy;
    const m = Math.sqrt(dx * dx + dy * dy) || 1;
    dx /= m; dy /= m;
    const gap = r + 10;
    const tf = dx > 0.35 ? "translate(0, -50%)" : dx < -0.35 ? "translate(-100%, -50%)" : "translate(-50%, -50%)";
    const lx = x + dx * gap, ly = y + dy * (gap + (Math.abs(dx) <= 0.35 ? 6 : 0));
    return { label, x, y, r, z, lx, ly, tf, col: z >= 0 ? "var(--ink)" : "var(--ink-3)" };
  });
  return nodes.sort((a, b) => a.z - b.z);
}

type Props = {
  labels: string[];
  human: { companies: { name: string; note: string }; solo: { name: string; note: string } };
};

export function Molecule({ labels, human }: Props) {
  const [spin, setSpin] = useState(0);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    let id: number | undefined;
    const stop = () => {
      if (id !== undefined) window.clearInterval(id);
      id = undefined;
    };
    const start = () => {
      stop();
      if (mq.matches) return;
      id = window.setInterval(() => {
        if (!document.hidden) setSpin((s) => s + 0.012);
      }, 50);
    };
    start();
    mq.addEventListener("change", start);
    return () => {
      stop();
      mq.removeEventListener("change", start);
    };
  }, []);

  const nodes = build(labels, spin);
  const back = nodes.filter((n) => n.z < 0);
  const front = nodes.filter((n) => n.z >= 0);
  const at = (x: number, y: number) => ({ left: pct(x, W), top: pct(y, H) });

  return (
    <div>
      <div className="molecule">
        <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label="A 3D molecule slowly turning: the owner or founder joined by a double bond to a Chief AI Officer, with six AI specialists orbiting around">
          <defs>
            <radialGradient id="sphNode" cx="35%" cy="30%" r="70%">
              <stop offset="0%" style={{ stopColor: "var(--node-hi)" }} />
              <stop offset="100%" style={{ stopColor: "var(--node-lo)" }} />
            </radialGradient>
            <radialGradient id="sphInk" cx="35%" cy="30%" r="70%">
              <stop offset="0%" style={{ stopColor: "var(--ink-hi)" }} />
              <stop offset="100%" style={{ stopColor: "var(--ink)" }} />
            </radialGradient>
            <radialGradient id="sphAcc" cx="35%" cy="30%" r="70%">
              <stop offset="0%" style={{ stopColor: "var(--acc-hi)" }} />
              <stop offset="100%" style={{ stopColor: "var(--accent)" }} />
            </radialGradient>
          </defs>
          <ellipse style={{ stroke: "var(--rule)" }} cx="380" cy="150" rx="130" ry="50" transform="rotate(-26 380 150)" fill="none" strokeWidth="1" strokeDasharray="2 6" />
          {back.map((n) => (
            <g key={n.label}>
              <line style={{ stroke: "var(--ink-3)" }} x1="380" y1="150" x2={n.x.toFixed(1)} y2={n.y.toFixed(1)} strokeWidth="1.2" />
              <circle style={{ stroke: "var(--ink-3)" }} cx={n.x.toFixed(1)} cy={n.y.toFixed(1)} r={n.r.toFixed(1)} fill="url(#sphNode)" strokeWidth=".8" />
            </g>
          ))}
          <path style={{ stroke: "var(--accent)" }} d="M154 143 L340 143 M166 157 L352 157" strokeWidth="2.5" />
          <polygon style={{ fill: "var(--accent)" }} points="352,143 338,136 338,150" />
          <polygon style={{ fill: "var(--accent)" }} points="154,157 168,150 168,164" />
          <circle cx="380" cy="150" r="28" fill="url(#sphInk)" />
          {front.map((n) => (
            <g key={n.label}>
              <line style={{ stroke: "var(--ink)" }} x1="380" y1="150" x2={n.x.toFixed(1)} y2={n.y.toFixed(1)} strokeWidth="1.4" />
              <circle style={{ stroke: "var(--ink)" }} cx={n.x.toFixed(1)} cy={n.y.toFixed(1)} r={n.r.toFixed(1)} fill="url(#sphNode)" strokeWidth="1" />
            </g>
          ))}
          <circle cx="110" cy="150" r="42" fill="url(#sphAcc)" />
        </svg>

        {/* Labels are HTML overlays, never SVG text. */}
        <div className="mol-label" style={{ ...at(252, 135), transform: "translate(-50%, -100%)", color: "var(--ink-3)" }}>decides · cross-checks</div>
        <div className="mol-label" style={{ ...at(380, 290), transform: "translate(-50%, -100%)", color: "var(--ink-3)" }}>Chief AI Officer · runs the AI team</div>
        <div className="mol-label" style={{ ...at(380, 0), transform: "translateX(-50%)", letterSpacing: ".12em", textTransform: "uppercase", color: "var(--ink-3)" }}>AI team · six specialists</div>
        <div className="mol-ai" style={{ ...at(380, 150), color: "var(--ground)" }}>CAIO</div>
        {nodes.map((n) => (
          <div key={`l-${n.label}`} className="mol-label" style={{ ...at(n.lx, n.ly), transform: n.tf, color: n.col }}>
            {n.label}
          </div>
        ))}
        {nodes.map((n) => (
          <div key={`a-${n.label}`} className="mol-ai" style={{ ...at(n.x, n.y), color: "var(--ink)" }}>AI</div>
        ))}
        {(["companies", "solo"] as const).map((k) => (
          <div key={k} data-aud={k}>
            <div className="mol-ai" style={{ ...at(110, 150), fontSize: 14, color: "var(--on-accent)" }}>{human[k].name}</div>
            <div className="mol-label" style={{ ...at(110, 206), transform: "translateX(-50%)", color: "var(--ink)" }}>{human[k].note}</div>
          </div>
        ))}
      </div>

      {/* Phone width: the drawing is too small to carry labels, so this list does. */}
      <ul className="mol-legend">
        {(["companies", "solo"] as const).map((k) => (
          <li key={k} data-aud={k}>
            {human[k].name} · {human[k].note}
          </li>
        ))}
        <li>CAIO · Chief AI Officer, runs the AI team</li>
        <li>{labels.join(" · ")}</li>
      </ul>
    </div>
  );
}
