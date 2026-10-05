"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

// Chii's six lovebirds. Now and then one (sometimes two) flies in, perches on a heading, does bird things and leaves.
// Rare, small, decorative: hidden from screen readers, never shown with reduced motion or over an open popup.
// Clicking a bird makes it chirp (the only time there is sound); the third click sends it off.
// `weight` sets how often each one visits; on a bird's birthday it comes far more often.
type Bird = {
  name: string;
  weight: number;
  born?: string; // MM-DD
  head: string;
  face: string;
  body: string;
  wing: string;
  tail: string;
  beak: string;
  eye?: string;
};

const BIRDS: Bird[] = [
  // At home.
  { name: "Indee", weight: 3, born: "04-10", head: "#8a9a3e", face: "#f2a27c", body: "#7f9c40", wing: "#33452a", tail: "#4f7395", beak: "#e2633c" },
  { name: "Myst", weight: 3, born: "01-08", head: "#eceff1", face: "#f6f6f6", body: "#cdd6de", wing: "#4e5c76", tail: "#7d8da6", beak: "#f2a27c" },
  // Flew off while being fostered.
  { name: "Melon", weight: 2, born: "01-02", head: "#e5532a", face: "#f06b2c", body: "#eaa42c", wing: "#5f8a2e", tail: "#4f8a3a", beak: "#c83a3a" },
  { name: "Twilight", weight: 2, born: "05-11", head: "#aab84c", face: "#f07a3a", body: "#8f9b6c", wing: "#5f6b5a", tail: "#6f8fc0", beak: "#e2552e" },
  // In Chii's heart.
  { name: "Happyeon", weight: 1.5, born: "03-07", head: "#f2c63c", face: "#f2561f", body: "#f6d73c", wing: "#f3dd5e", tail: "#f6f2e6", beak: "#e8613c", eye: "#c2303e" },
  { name: "Skye", weight: 1.5, head: "#fbfaf6", face: "#fbfaf6", body: "#f6f4ee", wing: "#ece8dc", tail: "#efebe0", beak: "#f4c2b0", eye: "#c2303e" },
];

// Who sits together: mates, and parents with their chicks.
const FAMILY: [string, string][] = [
  ["Indee", "Melon"],
  ["Indee", "Myst"],
  ["Indee", "Happyeon"],
  ["Melon", "Happyeon"],
  ["Indee", "Twilight"],
  ["Myst", "Twilight"],
  ["Melon", "Myst"],
  ["Skye", "Myst"],
];

const BIRTHDAY = 6;

const W = 34; // bird width in px; the drawing is 40x32
const H = (W * 32) / 40;
const FIRST = [20_000, 45_000]; // first chance after this long on the site
const NEXT = [120_000, 240_000]; // then at most one visit per this long
const CHANCE = 0.55;
const PAIR = 0.25;
const KEY = "lovebird-last";

const rand = (a: number, b: number) => a + Math.random() * (b - a);
const wait = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

function today() {
  const d = new Date();
  return `${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
const weightOf = (b: Bird) => b.weight * (b.born === today() ? BIRTHDAY : 1);
const byName = (n: string) => BIRDS.find((b) => b.name === n)!;

function weighted<T>(items: T[], w: (t: T) => number): T {
  let r = Math.random() * items.reduce((s, t) => s + w(t), 0);
  for (const t of items) if ((r -= w(t)) <= 0) return t;
  return items[0];
}

const pickOne = () => weighted(BIRDS, weightOf);
const pickPair = () => {
  const [a, b] = weighted(FAMILY, ([a, b]) => weightOf(byName(a)) * weightOf(byName(b)));
  return Math.random() < 0.5 ? [byName(a), byName(b)] : [byName(b), byName(a)];
};

function svg(b: Bird) {
  return `<svg viewBox="0 0 40 32" width="${W}" height="${H}" aria-hidden="true">
<path class="lb-tail" d="M9 20 L1 27 L4.5 28.5 L12 23Z" fill="${b.tail}"/>
<ellipse cx="18" cy="19" rx="11" ry="8.5" transform="rotate(-18 18 19)" fill="${b.body}"/>
<g class="lb-feet" stroke="#8d8790" stroke-width="1.4" stroke-linecap="round"><path d="M16 26 L15 30.5 M20 26 L20 30.5"/></g>
<g class="lb-head"><circle cx="28" cy="11" r="7.2" fill="${b.head}"/><ellipse cx="30.5" cy="13" rx="5" ry="4.6" fill="${b.face}"/>
<circle cx="29.6" cy="9.6" r="2.3" fill="#fff"/><circle cx="29.9" cy="9.6" r="1.15" fill="${b.eye ?? "#1b2226"}"/>
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

// A little thing at the bird's position that drifts and fades: a note when it chirps, a dropping when it poops.
function puff(b: Live, html: string, cls: string, at: { x: number; y: number }, to: { x: number; y: number }, ms: number) {
  const left = b.flip.classList.contains("lb-left");
  const el = document.createElement("div");
  el.className = cls;
  el.setAttribute("aria-hidden", "true");
  el.innerHTML = html;
  document.body.appendChild(el);
  const x = b.x + (left ? W - at.x : at.x);
  const y = b.y + at.y;
  const dx = left ? -to.x : to.x;
  el.animate(
    [
      { transform: `translate(${x}px, ${y}px)`, opacity: 1 },
      { transform: `translate(${x + dx}px, ${y + to.y}px)`, opacity: 0 },
    ],
    { duration: ms, easing: "ease-in", fill: "forwards" },
  ).finished.then(() => el.remove(), () => el.remove());
}

// Soft synthesized chirps, only ever in answer to a click (a user gesture).
let audio: AudioContext | null = null;
function chirp(kind: "chirp" | "chatter") {
  try {
    audio ??= new AudioContext();
    const ac = audio;
    const t = ac.currentTime + 0.01;
    const out = ac.createGain();
    out.gain.value = 0.05;
    out.connect(ac.destination);
    if (kind === "chirp") {
      for (let i = 0, n = 2 + Math.floor(Math.random() * 3); i < n; i++) {
        const o = ac.createOscillator();
        const g = ac.createGain();
        const t0 = t + i * rand(0.09, 0.14);
        const f = rand(3000, 3800);
        o.frequency.setValueAtTime(f, t0);
        o.frequency.exponentialRampToValueAtTime(f * rand(1.3, 1.6), t0 + 0.05);
        g.gain.setValueAtTime(0, t0);
        g.gain.linearRampToValueAtTime(1, t0 + 0.01);
        g.gain.exponentialRampToValueAtTime(0.001, t0 + 0.08);
        o.connect(g).connect(out);
        o.start(t0);
        o.stop(t0 + 0.1);
      }
    } else {
      // The happy chatter: a fast, warbling trill.
      const o = ac.createOscillator();
      const lfo = ac.createOscillator();
      const depth = ac.createGain();
      const g = ac.createGain();
      o.frequency.value = rand(2200, 2700);
      lfo.frequency.value = rand(22, 30);
      depth.gain.value = 500;
      lfo.connect(depth).connect(o.frequency);
      g.gain.setValueAtTime(0, t);
      g.gain.linearRampToValueAtTime(0.7, t + 0.05);
      g.gain.setValueAtTime(0.7, t + 0.4);
      g.gain.exponentialRampToValueAtTime(0.001, t + 0.6);
      o.connect(g).connect(out);
      o.start(t);
      lfo.start(t);
      o.stop(t + 0.65);
      lfo.stop(t + 0.65);
    }
  } catch {}
}

const NOTE = '<span>♪</span>';
const DROP = '<svg viewBox="0 0 6 6" width="5" height="5"><ellipse cx="3" cy="3.4" rx="2.6" ry="2.3" fill="#f4f2ec" stroke="#c9c4b8" stroke-width=".5"/><circle cx="3" cy="3.6" r="1.1" fill="#5f7a3a"/></svg>';

const KINDS = ["tilt", "hop", "preen", "turn", "stretch", "fluff", "poop", "sing"] as const;
type Kind = (typeof KINDS)[number];

function act(b: Live, kind: Kind) {
  if (b.gone) return;
  const head = b.el.querySelector<SVGGElement>(".lb-head")!;
  const wing = b.el.querySelector<SVGPathElement>(".lb-wing")!;
  const body = b.el.querySelector<SVGSVGElement>("svg")!;
  if (kind === "turn") b.flip.classList.toggle("lb-left");
  if (kind === "tilt") head.animate([{ transform: "rotate(0)" }, { transform: `rotate(${rand(-18, 18)}deg)` }, { transform: "rotate(0)" }], { duration: 1400, easing: "ease-in-out" });
  if (kind === "preen") head.animate([{ transform: "rotate(0)" }, { transform: "rotate(38deg) translate(-2px,3px)" }, { transform: "rotate(30deg) translate(-2px,3px)" }, { transform: "rotate(0)" }], { duration: 1600, easing: "ease-in-out" });
  if (kind === "hop") {
    const dx = rand(-14, 14);
    b.el.animate([{ transform: `translate(${b.x}px, ${b.y}px)` }, { transform: `translate(${b.x + dx / 2}px, ${b.y - 9}px)` }, { transform: `translate(${b.x + dx}px, ${b.y}px)` }], { duration: 380, easing: "ease-out", fill: "forwards" });
    b.x += dx;
  }
  // The big stretch: wing up and back, held, then folded away.
  if (kind === "stretch")
    wing.animate(
      [{ transform: "rotate(0)" }, { transform: "rotate(58deg) scale(1.15)", offset: 0.3 }, { transform: "rotate(62deg) scale(1.18)", offset: 0.7 }, { transform: "rotate(0)" }],
      { duration: 1700, easing: "ease-in-out" },
    );
  // Puff up, shake it out, smooth down.
  if (kind === "fluff")
    body.animate(
      [{ transform: "scale(1)" }, { transform: "scale(1.14,1.1)", offset: 0.3 }, { transform: "scale(1.14,1.1) rotate(-4deg)", offset: 0.45 }, { transform: "scale(1.14,1.1) rotate(4deg)", offset: 0.6 }, { transform: "scale(1.12,1.08) rotate(-2deg)", offset: 0.72 }, { transform: "scale(1)" }],
      { duration: 1300, easing: "ease-in-out" },
    );
  // Tail lifts, a tiny dropping falls and fades before it lands anywhere.
  if (kind === "poop") {
    body.animate([{ transform: "rotate(0)" }, { transform: "rotate(-9deg)", offset: 0.4 }, { transform: "rotate(0)" }], { duration: 700, easing: "ease-in-out" });
    setTimeout(() => !b.gone && puff(b, DROP, "lb-puff", { x: 3, y: H * 0.78 }, { x: -3, y: 18 }, 900), 280);
  }
  // A silent song: a little note floats up from the beak.
  if (kind === "sing") {
    head.animate([{ transform: "rotate(0)" }, { transform: "rotate(-10deg)" }, { transform: "rotate(0)" }], { duration: 600, easing: "ease-in-out" });
    puff(b, NOTE, "lb-puff lb-note", { x: W - 2, y: -6 }, { x: 8, y: -22 }, 1500);
  }
}

function spawn(bird: Bird, start: { x: number; y: number }, startle: () => void): Live {
  const el = document.createElement("div");
  el.className = "lovebird lb-flying";
  el.setAttribute("aria-hidden", "true");
  el.title = bird.born === today() ? `${bird.name} 🎂` : bird.name;
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
  let clicks = 0;
  el.addEventListener("click", () => {
    if (live.gone || el.classList.contains("lb-flying")) return;
    if (++clicks >= 3) return startle();
    chirp(Math.random() < 0.6 ? "chirp" : "chatter");
    act(live, "sing");
  });
  return live;
}

const FLYBY = 0.15;
const FLIT = 0.15;

// Somewhere on screen to land, other than where the birds already are.
function landing(pair: boolean, notY?: number) {
  const spots = perches().filter((p) => p.x1 - p.x0 > W * (pair ? 2.5 : 1.2) && (notY === undefined || Math.abs(p.y - notY) > 20));
  if (!spots.length) return null;
  const s = spots[Math.floor(Math.random() * spots.length)];
  return { x: rand(s.x0, Math.max(s.x0, s.x1 - W * (pair ? 2 : 1))), y: s.y - H + 4 };
}

function faceEachOther(birds: Live[]) {
  if (birds.length < 2) return;
  birds[0].flip.classList.toggle("lb-left", birds[0].x > birds[1].x);
  birds[1].flip.classList.toggle("lb-left", birds[1].x > birds[0].x);
}

async function visit(flock: Set<Live>, only?: Kind) {
  let pair = Math.random() < PAIR;
  const spot = Math.random() < FLYBY ? null : landing(pair) ?? (pair ? ((pair = false), landing(false)) : null);
  const vw = window.innerWidth;
  // With nowhere to land (or now and then anyway), they just fly across the screen.
  const target = spot ?? { x: window.scrollX + vw / 2, y: window.scrollY + rand(0.15, 0.55) * window.innerHeight };
  const fromRight = spot ? target.x > window.scrollX + vw / 2 : Math.random() < 0.5;
  const edge = (dy: number) => ({ x: fromRight ? window.scrollX + vw + 40 : window.scrollX - 60, y: target.y - dy });

  const birds: Live[] = [];
  const startle = () => birds.forEach((b) => b.leave());
  const [first, second] = pair ? pickPair() : [pickOne()];
  const done = () => wait(1400).then(() => birds.forEach((b) => flock.delete(b)));

  if (!spot) {
    const across = (b: Live, dy: number, delay: number) =>
      wait(delay).then(() => fly(b, { x: fromRight ? window.scrollX - 80 : window.scrollX + vw + 60, y: target.y + dy }, rand(2600, 3400)));
    const a = spawn(first, edge(rand(-40, 60)), startle);
    flock.add(a);
    birds.push(a);
    const trips = [across(a, rand(-60, 40), 0)];
    if (second) {
      const b = spawn(second, edge(rand(-40, 60) + 18), startle);
      flock.add(b);
      birds.push(b);
      trips.push(across(b, rand(-60, 40), 260));
    }
    await Promise.all(trips);
    birds.forEach((b) => b.el.remove());
    return done();
  }

  const a = spawn(first, edge(rand(120, 220)), startle);
  flock.add(a);
  birds.push(a);
  const arrivals = [fly(a, spot, 1900)];
  if (second) {
    const b = spawn(second, edge(rand(160, 260)), startle);
    flock.add(b);
    birds.push(b);
    arrivals.push(wait(500).then(() => fly(b, { x: spot.x + W * 0.95, y: spot.y }, 1900)));
  }
  await Promise.all(arrivals);

  // Fly together to another heading: to follow the reader when they scroll this one away, or just because.
  let busy = false;
  const move = async () => {
    if (busy || birds.every((b) => b.gone)) return;
    busy = true;
    const to = landing(birds.length > 1, birds[0].y + H - 4);
    if (!to) return startle();
    await Promise.all(birds.map((b, i) => wait(i * 250).then(() => (b.gone ? undefined : fly(b, { x: to.x + i * W * 0.95, y: to.y }, rand(1100, 1500))))));
    faceEachOther(birds);
    busy = false;
    check();
  };
  // Still scrolling while they flew? Look again, up to three times, then give up and leave.
  let tries = 0;
  const check = () => {
    if (busy || birds.every((b) => b.gone)) return;
    const r = birds[0].el.getBoundingClientRect();
    if (r.bottom >= 40 && r.top <= window.innerHeight - 40) return void (tries = 0);
    if (++tries > 3) return startle();
    move();
  };
  let raf = 0;
  const onScroll = () => {
    if (raf) return;
    raf = requestAnimationFrame(() => {
      raf = 0;
      check();
    });
  };
  window.addEventListener("scroll", onScroll, { passive: true });

  if (second) {
    // Face each other and lean in.
    faceEachOther(birds);
    await wait(600);
    for (const b of birds) b.el.querySelector<SVGGElement>(".lb-head")!.animate([{ transform: "rotate(0)" }, { transform: "rotate(16deg) translate(1px,1px)" }, { transform: "rotate(0)" }], { duration: 1800, easing: "ease-in-out" });
    await wait(2000);
  }

  const kinds: Kind[] = ["tilt", "tilt", "hop", "preen", "preen", "turn", "stretch", "fluff", "sing", "sing", "poop"];
  const end = performance.now() + rand(9000, 15000);
  while (performance.now() < end && birds.some((b) => !b.gone)) {
    await wait(rand(1200, 2400));
    if (busy) continue;
    if (!only && Math.random() < FLIT) {
      await move();
      continue;
    }
    for (const b of birds) if (birds.length < 2 || Math.random() < 0.6) act(b, only ?? kinds[Math.floor(Math.random() * kinds.length)]);
  }
  window.removeEventListener("scroll", onScroll);
  cancelAnimationFrame(raf);
  for (const b of birds) {
    b.leave();
    await wait(rand(150, 500));
  }
  return done();
}

export function Lovebirds() {
  const path = usePathname();

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches || !("animate" in HTMLElement.prototype)) return;
    // ?lovebirds on any page brings one right away, for a preview; ?lovebirds=stretch (or poop, fluff, sing…) shows only that.
    const q = new URLSearchParams(location.search);
    const preview = q.has("lovebirds");
    const only = KINDS.find((k) => k === q.get("lovebirds"));
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
      if (preview || Math.random() < CHANCE) await visit(flock, only);
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
