"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

// Chii's six lovebirds. Now and then one (sometimes two) flies in, perches on a heading, looks around and leaves.
// Rare, small, decorative: hidden from screen readers, never shown with reduced motion or over an open popup.
// Clicking a bird startles it away. `weight` sets how often each one visits.
type Bird = { name: string | null; weight: number; head: string; face: string; body: string; wing: string; tail: string; beak: string };

const BIRDS: Bird[] = [
  { name: "Indigo", weight: 1, head: "#8a9a3e", face: "#f2a27c", body: "#7f9c40", wing: "#46602f", tail: "#4f7395", beak: "#e2633c" },
  { name: "Melon", weight: 1, head: "#e5532a", face: "#f06b2c", body: "#eaa42c", wing: "#5f8a2e", tail: "#4f8a3a", beak: "#c83a3a" },
  { name: "Myst", weight: 1, head: "#eceff1", face: "#f6f6f6", body: "#cdd6de", wing: "#4e5c76", tail: "#7d8da6", beak: "#f2a27c" },
  { name: "Twilight", weight: 1, head: "#aab84c", face: "#f07a3a", body: "#8f9b6c", wing: "#6b7480", tail: "#6b7480", beak: "#e2552e" },
  { name: null, weight: 1, head: "#f2c63c", face: "#f2561f", body: "#f6d73c", wing: "#f3dd5e", tail: "#f6f2e6", beak: "#e8613c" },
  { name: null, weight: 1, head: "#e9e4b2", face: "#f2c49c", body: "#ede8c2", wing: "#6a7fb2", tail: "#7d90bc", beak: "#f0a26c" },
];

const W = 34; // bird width in px; the drawing is 40x32
const H = (W * 32) / 40;
const FIRST = [20_000, 45_000]; // first chance after this long on the site
const NEXT = [120_000, 240_000]; // then at most one visit per this long
const CHANCE = 0.55;
const PAIR = 0.25;
const KEY = "lovebird-last";

const rand = (a: number, b: number) => a + Math.random() * (b - a);
const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

function pick(not?: Bird): Bird {
  const pool = BIRDS.filter((b) => b !== not);
  let r = Math.random() * pool.reduce((s, b) => s + b.weight, 0);
  for (const b of pool) if ((r -= b.weight) <= 0) return b;
  return pool[0];
}

function svg(b: Bird) {
  return `<svg viewBox="0 0 40 32" width="${W}" height="${H}" aria-hidden="true">
<path class="lb-tail" d="M9 20 L1 27 L4.5 28.5 L12 23Z" fill="${b.tail}"/>
<ellipse cx="18" cy="19" rx="11" ry="8.5" transform="rotate(-18 18 19)" fill="${b.body}"/>
<g class="lb-feet" stroke="#8d8790" stroke-width="1.4" stroke-linecap="round"><path d="M16 26 L15 30.5 M20 26 L20 30.5"/></g>
<g class="lb-head"><circle cx="28" cy="11" r="7.2" fill="${b.head}"/><ellipse cx="30.5" cy="13" rx="5" ry="4.6" fill="${b.face}"/>
<circle cx="29.6" cy="9.6" r="2.3" fill="#fff"/><circle cx="29.9" cy="9.6" r="1.15" fill="#1b2226"/>
<path d="M34 9.5 Q39.5 11 37 16.2 Q34.5 15.4 33.4 13Z" fill="${b.beak}"/></g>
<path class="lb-wing" d="M8.5 17 Q16 10.5 25 15.5 Q19 23.5 9.5 22Z" fill="${b.wing}"/>
</svg>`;
}

type Live = { el: HTMLDivElement; flip: HTMLDivElement; x: number; y: number; gone: boolean; leave: () => void };

// Where the visible text of a heading starts and ends, in page coordinates.
function perches() {
  const vh = window.innerHeight;
  const out: { x0: number; x1: number; y: number }[] = [];
  for (const h of document.querySelectorAll<HTMLElement>("main h1, main h2, main h3")) {
    if (h.closest("[aria-hidden='true'], dialog") || !h.offsetParent) continue;
    const range = document.createRange();
    range.selectNodeContents(h);
    // The first line only, and its cap height rather than its line box, so the feet land on the letters.
    const rects = [...range.getClientRects()].filter((q) => q.width > 0 && q.height > 0);
    if (!rects.length) continue;
    const t0 = Math.min(...rects.map((q) => q.top));
    const line = rects.filter((q) => q.top - t0 < 4);
    const left = Math.min(...line.map((q) => q.left));
    const r = { top: t0, left, right: Math.max(...line.map((q) => q.right)), height: Math.max(...line.map((q) => q.height)), width: 0 };
    r.width = r.right - left;
    const cs = getComputedStyle(h);
    const fs = parseFloat(cs.fontSize);
    const lh = parseFloat(cs.lineHeight) || fs * 1.2;
    const top = r.top + Math.max(0, (Math.min(lh, r.height) - fs) / 2) + fs * 0.24;
    if (r.width < 80 || top < 90 || top > vh - 80) continue;
    out.push({ x0: r.left + window.scrollX, x1: r.right + window.scrollX, y: top + window.scrollY });
  }
  return out;
}

function fly(b: Live, to: { x: number; y: number }, ms: number) {
  const from = { x: b.x, y: b.y };
  b.flip.classList.toggle("lb-left", to.x < from.x);
  b.el.classList.add("lb-flying");
  const mid = { x: (from.x + to.x) / 2, y: Math.min(from.y, to.y) - rand(20, 50) };
  const a = b.el.animate(
    [from, mid, to].map((p) => ({ transform: `translate(${p.x}px, ${p.y}px)` })),
    { duration: ms, easing: "cubic-bezier(.35,.1,.25,1)", fill: "forwards" },
  );
  b.x = to.x;
  b.y = to.y;
  return a.finished.then(() => b.el.classList.remove("lb-flying")).catch(() => {});
}

function act(b: Live, kind: "tilt" | "hop" | "preen" | "turn") {
  if (b.gone) return;
  const head = b.el.querySelector<SVGGElement>(".lb-head")!;
  if (kind === "turn") b.flip.classList.toggle("lb-left");
  if (kind === "tilt") head.animate([{ transform: "rotate(0)" }, { transform: `rotate(${rand(-18, 18)}deg)` }, { transform: "rotate(0)" }], { duration: 1400, easing: "ease-in-out" });
  if (kind === "preen") head.animate([{ transform: "rotate(0)" }, { transform: "rotate(38deg) translate(-2px,3px)" }, { transform: "rotate(30deg) translate(-2px,3px)" }, { transform: "rotate(0)" }], { duration: 1600, easing: "ease-in-out" });
  if (kind === "hop") {
    const dx = rand(-14, 14);
    b.el.animate([{ transform: `translate(${b.x}px, ${b.y}px)` }, { transform: `translate(${b.x + dx / 2}px, ${b.y - 9}px)` }, { transform: `translate(${b.x + dx}px, ${b.y}px)` }], { duration: 380, easing: "ease-out", fill: "forwards" });
    b.x += dx;
  }
}

function spawn(bird: Bird, start: { x: number; y: number }, startle: () => void): Live {
  const el = document.createElement("div");
  el.className = "lovebird";
  el.setAttribute("aria-hidden", "true");
  if (bird.name) el.title = bird.name;
  const flip = document.createElement("div");
  flip.className = "lb-flip";
  flip.innerHTML = svg(bird);
  el.appendChild(flip);
  document.body.appendChild(el);
  el.style.transform = `translate(${start.x}px, ${start.y}px)`;
  const live: Live = { el, flip, x: start.x, y: start.y, gone: false, leave: () => {} };
  live.leave = () => {
    if (live.gone) return;
    live.gone = true;
    const right = Math.random() < 0.5;
    const to = { x: right ? window.scrollX + window.innerWidth + 60 : window.scrollX - 80, y: live.y - rand(140, 260) };
    fly(live, to, 1300).then(() => el.remove());
  };
  el.addEventListener("click", startle);
  return live;
}

async function visit(flock: Set<Live>) {
  const spots = perches();
  if (!spots.length) return;
  const s = spots[Math.floor(Math.random() * spots.length)];
  const pair = Math.random() < PAIR && s.x1 - s.x0 > W * 3;
  const x = rand(s.x0, Math.max(s.x0, s.x1 - W * (pair ? 2 : 1)));
  const y = s.y - H + 4;
  const fromRight = x > window.scrollX + window.innerWidth / 2;
  const edge = (dy: number) => ({ x: fromRight ? window.scrollX + window.innerWidth + 40 : window.scrollX - 60, y: y - dy });

  const birds: Live[] = [];
  const startle = () => birds.forEach((b) => b.leave());
  const first = pick();
  const a = spawn(first, edge(rand(120, 220)), startle);
  flock.add(a);
  birds.push(a);
  const arrivals = [fly(a, { x, y }, 1900)];
  if (pair) {
    const b = spawn(pick(first), edge(rand(160, 260)), startle);
    flock.add(b);
    birds.push(b);
    arrivals.push(wait(500).then(() => fly(b, { x: x + W * 0.95, y }, 1900)));
  }
  await Promise.all(arrivals);

  if (pair) {
    // Face each other and lean in.
    a.flip.classList.remove("lb-left");
    birds[1].flip.classList.add("lb-left");
    await wait(600);
    for (const b of birds) b.el.querySelector<SVGGElement>(".lb-head")!.animate([{ transform: "rotate(0)" }, { transform: "rotate(16deg) translate(1px,1px)" }, { transform: "rotate(0)" }], { duration: 1800, easing: "ease-in-out" });
    await wait(2000);
  }

  const kinds = ["tilt", "hop", "preen", "turn", "tilt"] as const;
  const end = performance.now() + rand(7000, 11000);
  while (performance.now() < end && birds.some((b) => !b.gone)) {
    await wait(rand(1200, 2400));
    for (const b of birds) if (!pair || Math.random() < 0.6) act(b, kinds[Math.floor(Math.random() * kinds.length)]);
  }
  for (const b of birds) {
    b.leave();
    await wait(rand(150, 500));
  }
  await wait(1400);
  for (const b of birds) flock.delete(b);
}

export function Lovebirds() {
  const path = usePathname();

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches || !("animate" in HTMLElement.prototype)) return;
    // ?lovebirds on any page brings one right away, for a preview.
    const preview = new URLSearchParams(location.search).has("lovebirds");
    const flock = new Set<Live>();
    let timer = 0;
    let stopped = false;

    const last = () => {
      try {
        return Number(sessionStorage.getItem(KEY)) || 0;
      } catch {
        return 0;
      }
    };
    const schedule = (ms: number) => (timer = window.setTimeout(tick, ms));
    const tick = async () => {
      if (stopped) return;
      const ready = !document.hidden && !document.querySelector("dialog[open]") && (preview || Date.now() - last() > NEXT[0]) && flock.size === 0;
      if (!ready) return schedule(rand(30_000, 60_000));
      try {
        sessionStorage.setItem(KEY, String(Date.now()));
      } catch {}
      if (preview || Math.random() < CHANCE) await visit(flock);
      if (!stopped) schedule(preview ? rand(4000, 8000) : rand(NEXT[0], NEXT[1]));
    };
    schedule(preview ? 1500 : rand(FIRST[0], FIRST[1]));

    // A bird left on the page when the route changes, or when a popup opens, flies off.
    const shoo = () => flock.forEach((b) => b.leave());
    const onToggle = (e: Event) => (e.target as HTMLElement).matches?.("dialog[open]") && shoo();
    document.addEventListener("toggle", onToggle, true);
    return () => {
      stopped = true;
      clearTimeout(timer);
      document.removeEventListener("toggle", onToggle, true);
      shoo();
    };
  }, [path]);

  return null;
}
