"use client";

import { useEffect, useRef } from "react";
import { clamp01, ease, subscribe, useReducedMotion } from "./scroll";

// "A day with the ghost team": one illustrated day behind the six home scenes, driven by the whole film's progress.
// She lives her day, the ghost team works, and she rules twice: at the start and at the end. Violet means a human ruling.
// Line drawing, one stroke weight, ink at low contrast. Only transform and opacity change, set straight on the
// elements from the film's single scroll loop (no re-render per frame). No faces, no likeness of her; the ghosts have two eyes, as on the ghost-team page.

const VB = { x: 0, y: 110, w: 1280, h: 240 };
const FLOOR = 316;
const GHOSTS = [780, 920, 1060, 1200];
// The ghost team, as on the ghost-team page: a round-topped ghost with two eyes and a scalloped hem.
// Operations drafts, Quality checks, Finance stamps receipts, the Chief AI Officer reports to her.
const NAMES = ["Operations", "Quality", "Finance", "CAIO"];
// [start, end] of the clock in each of the six stages, in minutes. The morning stage holds at 06:15, the house time
// (Chii's birthday, as 9:41 is Apple's): every clock we show reads 6:15 when it is not moving.
const CLOCK: [number, number][] = [
  [6 * 60 + 15, 6 * 60 + 15],
  [6 * 60 + 15, 6 * 60 + 30],
  [7 * 60 + 30, 8 * 60 + 15],
  [12 * 60, 16 * 60],
  [18 * 60 + 30, 19 * 60 + 30],
  [20 * 60 + 30, 20 * 60 + 45],
];
const CAPTION = { morning: "Good morning. Overnight: 14 done · 1 decision needs you.", glance: "On track.", card: "Shipped · verified · logged." };

const pad = (n: number) => String(n).padStart(2, "0");
const clock = (m: number) => `${pad(Math.floor(m / 60))}:${pad(Math.floor(m % 60))}`;
// A trapezoid: 0 before a, rises to 1 at b, holds to c, falls to 0 at d.
const bell = (q: number, a: number, b: number, c: number, d: number) => clamp01((q - a) / (b - a)) * clamp01((d - q) / (d - c));

// A ghost with a chat bubble above it. The bubble shows what it is doing: typing dots (working), an eye (reviewing),
// a cross (sent back), a check (done). Only one variant shows at a time.
function Ghost({ x, k }: { x: number; k: number }) {
  return (
    <g transform={`translate(${x} ${FLOOR})`}>
      <g data-k={`gb${k}`}>
        <path d="M-20 0 V-26 C-20 -50 20 -50 20 -26 V0 Q-13.3 9 -6.7 0 Q0 9 6.7 0 Q13.3 9 20 0 Z" style={{ fill: "var(--ground)" }} />
        <circle cx={-7} cy={-24} r={2.6} style={{ fill: "var(--ink)" }} />
        <circle cx={7} cy={-24} r={2.6} style={{ fill: "var(--ink)" }} />
        <g transform="translate(0 -70)">
          <path d="M-22 -12 H22 Q26 -12 26 -8 V8 Q26 12 22 12 H6 L0 20 L-6 12 H-22 Q-26 12 -26 8 V-8 Q-26 -12 -22 -12 Z" style={{ fill: "var(--ground)" }} />
          <g data-k={`bd${k}`}>
            {[-10, 0, 10].map((dx) => (
              <circle key={dx} cx={dx} cy={0} r={2.4} style={{ fill: "var(--ink)" }} />
            ))}
          </g>
          <path data-k={`bc${k}`} d="M-9 1 L-3 7 L9 -6" strokeWidth={2.4} />
          <path data-k={`bx${k}`} d="M-7 -6 L7 6 M7 -6 L-7 6" strokeWidth={2.4} />
          <g data-k={`be${k}`}>
            <path d="M-11 0 Q0 -9 11 0 Q0 9 -11 0 Z" />
            <circle cx={0} cy={0} r={3} style={{ fill: "var(--ink)" }} />
          </g>
        </g>
      </g>
      <text className="day-lbl" x={0} y={16} textAnchor="middle" fontSize={13.5} strokeWidth={0} style={{ fill: "var(--ink)", stroke: "none", fontFamily: "var(--mono)" }}>{NAMES[k]}</text>
    </g>
  );
}

export function DayLayer() {
  const root = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const film = el.parentElement as HTMLElement;
    const k: Record<string, HTMLElement | SVGElement> = {};
    el.querySelectorAll<HTMLElement | SVGElement>("[data-k]").forEach((n) => {
      k[n.dataset.k as string] = n;
    });
    const svg = el.querySelector("svg.day-art") as SVGElement;
    const set = (key: string, opacity?: number, transform?: string) => {
      const n = k[key];
      if (!n) return;
      if (opacity !== undefined) n.style.opacity = opacity.toFixed(3);
      if (transform !== undefined) n.style.transform = transform;
    };
    let lastClock = "";
    let lastCap = "";

    const render = (P: number, fade: number, still: boolean) => {
      const stageO = (i: number) => (still ? (i === 5 ? 1 : 0) : (i === 0 ? 1 : clamp01((P - i / 6 + 0.015) / 0.015)) * (i === 5 ? 1 : clamp01(((i + 1) / 6 + 0.015 - P) / 0.015)));
      const o = [0, 1, 2, 3, 4, 5].map(stageO);
      const q = (i: number) => (still ? (i === 5 ? 1 : 0) : clamp01((P - i / 6) * 6));
      const t = performance.now() / 1000;
      const live = !still;
      el.style.opacity = fade.toFixed(3);

      // Her world
      set("night", Math.max(o[0], o[1], o[5]));
      set("table", o[2]);
      const q3 = q(3);
      set("bag", o[3] * bell(q3, 0, 0.04, 0.22, 0.27));
      set("lunch", o[3] * bell(q3, 0.23, 0.28, 0.46, 0.51));
      set("guitar", o[3] * bell(q3, 0.47, 0.52, 0.68, 0.73));
      set("phone4", o[3] * bell(q3, 0.69, 0.74, 1.2, 1.3));
      set("stove", o[4]);
      for (let i = 0; i < 3; i++) {
        set(`steam${i}`, live ? 0.5 + 0.5 * Math.sin(t * 1.1 + i * 2) : 0.6, `translateY(${live ? (-6 * ((t * 0.5 + i * 0.33) % 1)).toFixed(1) : 0}px)`);
      }

      // The ghost strip
      const stripO = Math.max(o[2], o[3], o[4], o[5]);
      set("strip", stripO);
      set("ghosts", stripO);
      GHOSTS.forEach((_, i) => set(`gb${i}`, 1, `translateY(${live ? (2.5 * Math.sin(t * 1.6 + i * 1.7)).toFixed(2) : 0}px)`));
      // Task cards drift along the strip while the ghosts work
      for (let i = 0; i < 4; i++) {
        const x = 1200 - ((P * 9 + i * 0.25) % 1) * 560;
        set(`tc${i}`, Math.max(o[2], o[3]), `translate(${x.toFixed(1)}px, ${FLOOR - 22}px)`);
      }
      // What each ghost is doing, by stage: dots (working), eye (reviewing), cross (sent back), check (done)
      const q4 = q(4);
      const q5b = q(5);
      const draftO = o[3] * bell(q3, 0.05, 0.12, 0.95, 1);
      set("draft", draftO);
      for (let i = 0; i < 3; i++) set(`dl${i}`, clamp01((q3 - 0.12 - i * 0.14) / 0.1));
      const state = (g: number): "dots" | "eye" | "x" | "check" | "none" => {
        if (still || o[5] > 0.5) return "check";
        if (o[4] > 0.5) return g === 2 ? (q4 > 0.7 ? "check" : "dots") : "check";
        if (o[3] > 0.5) {
          if (g === 0) return q3 < 0.8 ? "dots" : "check";
          if (g === 1) return q3 < 0.3 ? "none" : q3 < 0.5 ? "eye" : q3 < 0.6 ? "x" : q3 < 0.72 ? "eye" : "check";
          if (g === 2) return "dots";
          return "none";
        }
        if (o[2] > 0.5) return g < 3 ? "dots" : "none";
        return "none";
      };
      GHOSTS.forEach((_, g) => {
        const st = state(g);
        const beat = live ? 0.55 + 0.45 * Math.sin(t * 4 + g) : 1;
        set(`bd${g}`, st === "dots" ? beat : 0);
        set(`bc${g}`, st === "check" ? 1 : 0);
        set(`bx${g}`, st === "x" ? 1 : 0);
        set(`be${g}`, st === "eye" ? 1 : 0);
      });
      void q5b;
      // Stage 5: receipts stamped by Finance
      set("parked", o[4]);
      {
        const dy = live ? 14 * Math.abs(Math.sin(q4 * Math.PI * 5)) : 0;
        set("stamp2", o[4], `translate(${GHOSTS[2] + 30}px, ${FLOOR - 82 + dy}px)`);
        for (let i = 0; i < 3; i++) set(`rc${i}`, clamp01((q4 - 0.15 - i * 0.22) / 0.1));
      }

      // Her two rulings: the hand touches the strip only here
      const q1 = q(1);
      const q5 = q(5);
      const h1 = o[1] * bell(q1, 0.12, 0.32, 0.72, 0.92);
      const h5 = o[5] * bell(q5, 0.22, 0.38, 0.6, 0.72);
      const hand = still ? 0 : Math.max(h1, h5);
      const reach = still ? 0 : Math.max(h1 > 0 ? h1 : 0, h5 > 0 ? h5 : 0);
      set("hand", hand, `translate(${(576 - 260 * (1 - reach)).toFixed(1)}px, ${FLOOR - 42}px)`);
      // In the final frame (reduced motion) the shipped card rests on the strip, approved.
      set("card2", still ? 1 : o[1] * clamp01((q1 - 0.02) / 0.15));
      const c1 = still ? 1 : clamp01((q1 - 0.55) / 0.14);
      set("ck2", c1 * (still ? 1 : o[1]), `scale(${(0.6 + 0.4 * c1).toFixed(2)})`);

      // Stage 6: the shipped card arrives, is approved, and flies into the ring of dots
      const fly = k.fly as HTMLElement;
      const r = svg.getBoundingClientRect();
      const s = r.width / VB.w;
      const px = (x: number, y: number): [number, number] => [r.left + (x - VB.x) * s, r.top + (y - VB.y) * s];
      const fs = Math.max(0.6, s);
      let fx: number, fy: number, fo: number, fk = fs, fc = 0;
      const [sx, sy] = px(672, FLOOR - 40);
      if (still) {
        fx = sx; fy = sy; fo = 1; fc = 1;
      } else if (q5 < 0.3) {
        const a = ease(clamp01(q5 / 0.3));
        [fx, fy] = px(1160 + (672 - 1160) * a, FLOOR - 40);
        fo = clamp01(q5 / 0.06) * o[5];
      } else if (q5 < 0.62) {
        fx = sx; fy = sy; fo = o[5]; fc = clamp01((q5 - 0.45) / 0.1);
      } else {
        const ring = document.querySelector(".ring-stage");
        const rr = ring?.getBoundingClientRect();
        const tx = rr ? rr.left + rr.width / 2 : window.innerWidth / 2;
        const ty = rr ? rr.top + rr.height / 2 : window.innerHeight / 2;
        const a = ease(clamp01((q5 - 0.62) / 0.35));
        fx = sx + (tx - sx) * a; fy = sy + (ty - sy) * a - 40 * Math.sin(a * Math.PI);
        fk = fs * (1 - 0.45 * a); fc = 1;
        fo = a > 0.9 ? clamp01((1 - a) / 0.1) : 1;
      }
      fly.style.opacity = fo.toFixed(3);
      fly.style.transform = `translate(${(fx - 32).toFixed(1)}px, ${(fy - 20).toFixed(1)}px) scale(${fk.toFixed(3)})`;
      set("fck", fc);

      // Clock and phone messages
      let stage = 0;
      for (let i = 0; i < 6; i++) if (o[i] > 0.5) stage = i;
      const m = CLOCK[stage][0] + (CLOCK[stage][1] - CLOCK[stage][0]) * q(stage);
      const c = clock(m);
      if (c !== lastClock) {
        (k.clock as HTMLElement).textContent = c;
        lastClock = c;
      }
      const cap =
        stage === 0 || (stage === 1 && q1 < 0.55)
          ? CAPTION.morning
          : stage === 3 && q3 > 0.72
            ? CAPTION.glance
            : stage === 5 && q5 > 0.12
              ? CAPTION.card
              : "";
      if (cap !== lastCap) {
        (k.cap as HTMLElement).textContent = cap;
        lastCap = cap;
      }
    };

    if (reduced) {
      render(1, 1, true);
      return;
    }
    let raf = 0;
    const frame = () => {
      const r = film.getBoundingClientRect();
      const span = r.height - window.innerHeight;
      const P = span > 0 ? clamp01(-r.top / span) : 0;
      // Visible from the first frame; fades out as the still sections take over below the film.
      const fade = clamp01((r.bottom - window.innerHeight * 0.15) / (window.innerHeight * 0.85));
      // Invisible until the reader starts scrolling: it fades in over the first stretch of scroll, not on load.
      const started = clamp01((window.scrollY - 24) / 220);
      render(P, fade * started, false);
    };
    const tick = () => {
      // Gentle ambient motion (bobbing ghosts, steam) between scrolls, only while the layer is on screen.
      const r = film.getBoundingClientRect();
      if (r.bottom > 0 && r.top < window.innerHeight) frame();
      raf = requestAnimationFrame(tick);
    };
    frame();
    const off = subscribe(frame);
    raf = requestAnimationFrame(tick);
    return () => {
      off();
      cancelAnimationFrame(raf);
    };
  }, [reduced]);

  return (
    <div ref={root} className="day" aria-hidden="true">
      <div className="day-inner">
        <div className="day-hud">
          <span className="day-clock" data-k="clock">06:15</span>
          <span className="day-cap" data-k="cap">{CAPTION.morning}</span>
        </div>
        <svg className="day-art" viewBox={`${VB.x} ${VB.y} ${VB.w} ${VB.h}`} preserveAspectRatio="xMidYMax meet" fill="none" strokeLinecap="round" strokeLinejoin="round">
          <g className="day-ink" strokeWidth={1.4} style={{ stroke: "var(--ink)" }}>
            {/* Floors */}
            <path d="M60 316 L560 316" opacity={0.5} />
            <path data-k="strip" d="M620 316 L1240 316" />

            {/* The nightstand: morning and evening */}
            <g data-k="night">
              <path d="M150 236 L300 236 L300 316 L150 316 Z M150 258 L300 258" />
              <circle cx={225} cy={247} r={2.5} />
              <rect x={196} y={166} width={44} height={70} rx={7} />
              <rect x={202} y={174} width={32} height={50} rx={3} />
              <path d="M262 212 L262 236 L284 236 L284 212 Z M284 218 C294 218 294 230 284 230" />
              <path d="M110 316 L110 200 M110 200 C110 176 142 176 142 200" />
            </g>

            {/* Breakfast */}
            <g data-k="table">
              <path d="M110 250 L500 250 M140 250 L140 316 M470 250 L470 316" />
              <path d="M170 226 L170 250 L194 250 L194 226 Z M194 232 C204 232 204 244 194 244" />
              <path d="M250 238 C250 256 322 256 322 238 Z" />
              <ellipse cx={380} cy={249} rx={34} ry={5} />
              <path d="M426 226 L426 250 L450 250 L450 226 Z M450 232 C460 232 460 244 450 244" />
            </g>

            {/* Life: school bag, lunch, guitar, a glance at the phone */}
            <g data-k="bag">
              <rect x={140} y={244} width={72} height={72} rx={9} />
              <path d="M140 270 L212 270 M176 244 C176 226 196 226 196 244 M152 248 C152 236 142 240 142 262" />
            </g>
            <g data-k="lunch">
              <ellipse cx={250} cy={300} rx={44} ry={8} />
              <path d="M214 300 C214 280 286 280 286 300 M320 316 L320 262 M312 262 L312 282 M328 262 L328 282 M320 282 L320 262" />
            </g>
            <g data-k="guitar">
              <circle cx={420} cy={290} r={26} />
              <circle cx={420} cy={250} r={19} />
              <circle cx={420} cy={276} r={6} />
              <path d="M416 231 L416 150 L424 150 L424 231 M420 154 L420 276" />
            </g>
            <g data-k="phone4">
              <rect x={500} y={262} width={30} height={54} rx={5} />
              <rect x={505} y={269} width={20} height={36} rx={2} />
            </g>

            {/* Cooking */}
            <g data-k="stove">
              <path d="M110 268 L360 268 L360 316 L110 316 Z M130 268 L130 262 M200 268 L200 262 M270 268 L270 262" />
              <path d="M150 262 L150 232 L250 232 L250 262 Z M250 240 L330 246" />
              <path d="M300 268 L340 224" />
              {[0, 1, 2].map((i) => (
                <path key={i} data-k={`steam${i}`} d={`M${170 + i * 30} 224 C${162 + i * 30} 212 ${178 + i * 30} 204 ${170 + i * 30} 192`} />
              ))}
              <ellipse cx={430} cy={306} rx={40} ry={7} />
              <ellipse cx={430} cy={296} rx={40} ry={7} />
              <ellipse cx={430} cy={286} rx={40} ry={7} />
            </g>

            {/* Ghosts: the team, standing on the strip */}
            <g data-k="ghosts">
              {GHOSTS.map((x, i) => (
                <Ghost key={x} x={x} k={i} />
              ))}
            </g>
            {[0, 1, 2, 3].map((i) => (
              <rect key={i} data-k={`tc${i}`} x={0} y={0} width={32} height={22} rx={3} strokeDasharray="4 3" />
            ))}
            <g data-k="draft">
              <rect x={GHOSTS[0] + 30} y={FLOOR - 58} width={34} height={44} rx={3} strokeDasharray="4 3" />
              {[0, 1, 2].map((i) => (
                <path key={i} data-k={`dl${i}`} d={`M${GHOSTS[0] + 37} ${FLOOR - 46 + i * 11} L${GHOSTS[0] + 57} ${FLOOR - 46 + i * 11}`} />
              ))}
            </g>
            <g data-k="parked">
              {GHOSTS.slice(0, 3).map((x, i) => (
                <g key={x}>
                  <rect x={x - 16} y={FLOOR - 24} width={32} height={22} rx={3} />
                  <path data-k={`rc${i}`} d={`M${x - 8} ${FLOOR - 16} L${x + 8} ${FLOOR - 16} M${x - 8} ${FLOOR - 9} L${x + 4} ${FLOOR - 9}`} />
                </g>
              ))}
            </g>
            <g data-k="stamp2">
              <rect x={0} y={0} width={18} height={12} rx={2} />
              <path d="M9 12 L9 22" />
            </g>

            {/* Her hand: it reaches the strip only at the two approvals */}
            <g data-k="hand">
              <path d="M0 0 L26 0 L26 24 L0 24 Z" />
              <rect x={26} y={5} width={34} height={9} rx={4.5} />
              <path d="M8 0 C8 -12 22 -14 26 -4 M26 18 L38 18 M26 22 L34 22" />
            </g>
            <g data-k="card2">
              <rect x={640} y={262} width={64} height={40} rx={4} />
              <path d="M650 274 L694 274 M650 284 L680 284" />
            </g>
          </g>
          {/* Violet appears only on her two approvals */}
          <path data-k="ck2" d="M654 292 L664 300 L692 268" strokeWidth={3} style={{ stroke: "var(--accent)", transformBox: "fill-box", transformOrigin: "center" }} />
        </svg>
      </div>
      <div className="day-fly" data-k="fly">
        <svg viewBox="0 0 64 40" width={64} height={40}>
          <rect x={1} y={1} width={62} height={38} rx={4} strokeWidth={1.4} style={{ fill: "var(--ground)", stroke: "var(--ink)" }} />
          <path d="M10 12 L54 12 M10 20 L38 20" strokeWidth={1.4} style={{ stroke: "var(--ink-3)" }} />
          <path data-k="fck" d="M14 30 L22 37 L50 24" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" fill="none" style={{ stroke: "var(--accent)" }} />
        </svg>
      </div>
    </div>
  );
}
