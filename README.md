# chiibitsu-labs

The chiibitsu.com site: home, /about, /investor and /audit. Next.js on Vercel. Brand: CLbrand v2 (the lab notebook) and CLbrand interactive v1 (the scroll film).

## Two modes

| Surface | Mode |
|---|---|
| Home `/`, About `/about` | **Scroll film**: pinned scenes (about 260vh each) where scroll progress drives every animation |
| Investor `/investor`, papers, articles, legal | **Lab notebook**: still pages |
| `/still`, `/about/still` | The earlier still lab-notebook versions of home and About, kept whole and `noindex` (the original build is commit `e7d64bb`) |

**Home scenes, in order (eight):** the owner hook → the founder's note (signed in the hand) → what changes (See everything / Decide less / Trust every result, then the growing network) → who we've built with (names shown only with the client's OK on record in `content/proof.json`; one case card per scroll step; companies and solo founders see different cards) → working with us (Look → Build → Hand over, a path that fills as you scroll) → how it runs (you, the Chief AI Officer and the ghost team) → the record (four counts, each real on Chii's word and dated) → the invitation (dots gather into a ring, pulsing button). Behind them runs **"A day with the ghost team"** (`components/film/DayLayer.tsx`): one illustrated day driven by the whole film's progress, invisible until the first scroll, with a clock, ghosts that show typing, review, sent-back and done, two violet approvals (the only violet in the layer, a human ruling), and the shipped card flying into the ring. It sets only transform and opacity, straight on the elements from the film's single scroll loop. Reduced motion shows its final frame in the flow; on a phone it is a strip along the bottom.

Below the film, what a visitor scans or clicks stays still: Proof of work (misses are greyed rows, never cards), Publication, Papers, For investors, footer. Each Publication card can show a series tag before its date: a post's `tag` (the Substack section or category) wins, otherwise a title that starts with a name in `publication.tagPrefixes` (for example "FOMO Report") takes it; untagged posts show none (`lib/publication.ts`).

**About scenes, in order (ten):** A1 mission and the two whys → A2 the four waves (a molecular chain, "we are here" on AI) → A3 How I work 01 (the spheres, "where real change happens", "Proof of work here →" to `/angeline`) → A4 How I work 02 (the fork) → A5 How I work 03 (the path) → A6 what changes (the four cards flip one by one as you scroll) → A7 the moat (the door; no compare toggle in the film, since it froze the scene when scrolling back up) → A8 the long bet → A9 who is behind it (photo, three numbers, "See her track record →") → A10 the invitation. There is no background layer on `/about`. Every link inside a scene is clickable while the scene is pinned.

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
- Consent: a client is named only with their OK on record (`content/proof.json` `consent`; Chii's verbal word, 2026-09-30, countersign on the Aikiri Network later). The content gate fails on a named card without a consent line.
- Privacy: no numbers from companies Chii worked for unless already public (the content gate fails on the removed TalentHero and Lazy Lifter figures). Numbers from her own ventures are fine.
- Every placeholder carries `"illustrative": true` and renders an "Illustrative" label. A real figure sets `"illustrative": false` and must carry `measuredOn` and `source`. `npm run check:content` enforces this and fails on prices, "Book a call", "we / our / us" and any Aikiri mention on About, and on "Field Notes" or the publication's name anywhere on the site (the publication is only "Publication").
- **Theme:** day by default. Night runs 18:00 to 06:00 on the reader's own clock (`lib/boot.ts`). No location is read. `?theme=day|night` overrides it for review.
- **Audience:** "For companies" or "For solo founders", also `?for=companies|solo`.
- **Analytics:** Vercel Web Analytics. Custom events: `cta_click` (with `location`), `audience_switch`, `metric_click`, `papers_click`. Clicks on placeholder links carry `placeholder: true`.
- `/audit` is a placeholder route for "Request a workflow audit →". It does not say whether the audit is free, paid or by application.

Placeholder tracking: `ops/site-placeholders.md` in chiibitsu/vibeOS.
