# chiibitsu-labs

The chiibitsu.com home page. Next.js, deployed on Vercel. Brand: CLbrand v2.0, "the lab notebook".

Approved design: board "H · Home, by day" and "H · Home, by night" on the
[Chiibitsu Labs site directions](https://claude.ai/artifact/N6T3TtCKDjJWc5zLWPBDWV) canvas.

## Run

```
npm install
npm run dev        # http://localhost:3000
npm run gates      # lint, typecheck, content check, build
BASE=http://localhost:3000 npm run check:layout   # against a running build
```

## How it works

- **Content** lives in `content/home.json`. Every placeholder carries `"illustrative": true` and renders an "Illustrative" label. A real figure sets `"illustrative": false` and must carry `measuredOn` and `source`. `npm run check:content` enforces this, and also fails on prices and on "Book a call".
- **Theme:** day by default. Night runs 18:00 to 06:00 on the reader's own clock (`lib/boot.ts`). No location is read. `?theme=day|night` overrides it for review.
- **Audience:** "For companies" or "For solo founders", also `?for=companies|solo`. Both variants are in the page and CSS shows one, so nothing flashes.
- **Analytics:** Vercel Web Analytics. Custom events: `cta_click` (with `location`), `audience_switch`, `metric_click`, `papers_click`. Clicks on placeholder links carry `placeholder: true`.
- **Motion:** every animation has a `prefers-reduced-motion` guard.
- **/audit** is a placeholder route for "Request a workflow audit →". It does not say whether the audit is free, paid or by application.

Placeholder tracking: `ops/site-placeholders.md` in chiibitsu/vibeOS.
