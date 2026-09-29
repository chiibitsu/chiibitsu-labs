# chiibitsu-labs

The chiibitsu.com site: home, /about, /investor and /audit. Next.js on Vercel. Brand: CLbrand v2 (the lab notebook) and CLbrand interactive v1 (the scroll film).

## Two modes

| Surface | Mode |
|---|---|
| Home `/`, About `/about` | **Scroll film**: pinned scenes (about 260vh each) where scroll progress drives every animation |
| Investor `/investor`, papers, articles, legal | **Lab notebook**: still pages |
| `/still`, `/about/still` | The earlier still lab-notebook versions of home and About, kept whole and `noindex` (the original build is commit `e7d64bb`) |

**Home scenes, in order:** the owner hook (lines rewire from "you" into a network) → See everything / Decide less / Trust every result → the door → the spheres → the numbers count up → the invitation. Below the film, the sections that have not become scenes yet stay as plain components in `components/home/sections.tsx`: the founder letter, Work, How it runs, This week, Proof of work, Publication, Papers, For investors.

**About scenes, in order:** the mission → the four waves (a molecular chain, "we are here" on AI) → the spheres → "You choose" (the fork) → the long bet → Chii with the photo and the numbers → the invitation. Content that is not in a scene right now (the premise paragraph, the flip cards, How I work) is kept in `content/about.json` (`parked`) and in the still version.

## Scene rules

- A scene is a section about 260vh tall with a sticky 100dvh frame. Its progress `p` (0 to 1) comes from `components/film/scroll.ts`; every animation is a pure function of `p`, apart from gentle ambient motion (the scroll hint, the button pulse).
- One passive scroll listener for the whole page, throttled with `requestAnimationFrame`. No scroll-jacking.
- **First frame readable at rest:** the opening headline starts more than half lit; scenes below the fold render complete until scripts run.
- **Reduced motion, and no scripts:** nothing is pinned and every scene is a normal, complete section in its final state.
- SVG colours go through `style`, never `fill="var(--x)"` attributes (`npm run check:content` enforces it).
- The audit button is pinned in the top bar (`components/film/FilmBar.tsx`); on a phone the links fold into a menu.

## Run

```
npm install
npm run dev        # http://localhost:3000
npm run gates      # lint, typecheck, content check, build
BASE=http://localhost:3000 npm run check:layout   # against a running build
```

`check:layout` covers every page at 390, 768 and 1280 wide in both themes and both audiences, and scrolls each film scene at 390×667, 390×844 and 1280×800 to check it fits its frame.

## Content

- `content/home.json`, `content/about.json`, `content/investor.json`: page copy. `content/film.json`: copy shared by the two film pages (the door, the spheres, the numbers, the invitation). `content/still/about.json`: the still About.
- Every placeholder carries `"illustrative": true` and renders an "Illustrative" label. A real figure sets `"illustrative": false` and must carry `measuredOn` and `source`. `npm run check:content` enforces this and fails on prices, "Book a call", "we / our / us" and any Aikiri mention on About, and on "Field Notes" or the publication's name anywhere on the site (the publication is only "Publication").
- **Theme:** day by default. Night runs 18:00 to 06:00 on the reader's own clock (`lib/boot.ts`). No location is read. `?theme=day|night` overrides it for review.
- **Audience:** "For companies" or "For solo founders", also `?for=companies|solo`.
- **Analytics:** Vercel Web Analytics. Custom events: `cta_click` (with `location`), `audience_switch`, `metric_click`, `papers_click`. Clicks on placeholder links carry `placeholder: true`.
- `/audit` is a placeholder route for "Request a workflow audit →". It does not say whether the audit is free, paid or by application.

Placeholder tracking: `ops/site-placeholders.md` in chiibitsu/vibeOS.
