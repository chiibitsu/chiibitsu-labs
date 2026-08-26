> **Status note, 2026-08-26 — under discussion, do not action this file yet.**
> Chii's direction: this must be a **Chiibitsu Labs company** homepage, not an AI @ Work
> landing page. `index.html` has been rebuilt against that and is ahead of this document —
> the sections below still describe the earlier AI @ Work-shaped draft in places. Four
> questions are open (hero line, whether "conscious choice" leads, whether Work/Self are
> public labels, and the metric row's middle figure) and the page is not settled until they
> are. Rewrite this file once they are answered.

# chiibitsu.com homepage — revamp against vibeOS canon

**Status:** draft for Chii's red pen. Not published.
**Date:** 2026-08-25
**Source of truth:** `chiibitsu/vibeOS` — `canon/brand.md`, `canon/company.md`,
`canon/pricing.md`, and the CLbrand skill (brand system v1.0).

Scope is the **homepage only**. `canon/brand.md` §10 records that `/about` already
implements canon correctly and the homepage is the outlier, so nothing else was touched.

---

## 1. Why the page is laid out this way

The brand system v1.0 specifies the homepage order outright, and this file follows it:

> Fold (claim left, engagement-record card right) → dated metric row → how it works,
> three steps with the third weighted violet → the proof section, an actual record sheet
> where a stock photo would go → Field Notes, three dated entries → closing band → footer.

One section was **added** to that order: **What we do** (the offer map), between the steps
and the proof sheet. It is the structural fix `canon/brand.md` §10 asks for — the live page's
six flat cards replaced by the real architecture — and it has no home in the brand system's
seven-part order. Flagged here rather than smuggled in.

The **doubling** grammar is applied throughout: section rules are two lines (1.5px ink +
1px hairline 3px below), the separator is a doubled tick, and every figure appears twice —
once as the claim, once as the source that checks it. The notation is never explained in
the copy.

---

## 2. Drift closed, against `canon/brand.md` §10

| §10 finding | What the live page does | What this draft does |
|---|---|---|
| Six flat service cards vs. canon's architecture | Six equal cards | Futureproof (Work → AI @ Work, Lighthouse; Self) + Field Notes + R&D Lab |
| **AICOS** as a top-level card | Present, "In Development" | **Removed.** Retired name (`canon/decisions.md`, 2026-08-17) |
| **Chibie** as a top-level card | Present, "In Development" | **Removed** from the homepage. It is the Futureproof-for-Life instance on the Lighthouse engine, behind a runtime gate — "In Development" overstates a placeholder |
| **Lighthouse marked "Live"** | "Live" badge | Badge dropped. Canon prices or bounds no Lighthouse offer, so no availability claim is defensible. Reads "by conversation" |
| **"4K+ participants"** vs `/about`'s "2,000+ per cohort" | "4K+" published | **Withheld.** Renders as an em dash with `records in conflict`. See §3 |
| Founder section on the older 4-pillar framing | Four pillars | Pillar block removed; founder appears in the footer attribution line only |
| Futureproof Score | not on the live page | Stays off. Retired 2026-08-20 — it hands back a verdict, which the governing principle forbids |
| Crypto mentorship | not on the live page | Stays off. Closed to new clients permanently; no waitlist |
| "30-Day Futureproof" | not on the live page | The offer appears under its current name, **The 10 Week Challenge** |

Also changed: the William Gibson hero quote is gone. The brand system's settled cold copy
is an A/B with **A live** — *"Your team is already using AI. Nobody has decided how."* —
under the offer line *"We rebuild one workflow with your team, and leave when they can run
it on their own."* Concrete when they do not know you.

---

## 3. Needs your sign-off before this can be published

**Every one of these is a figure. The brand checklist is: a date and a source, or it is out.**

1. **`+72%` MoM revenue recovery** — HRTech turnaround. Needs a measurement date and a
   source you are willing to have quoted. Currently marked `pending verification` on the page.
2. **`₱28M` peak quarterly revenue** — Beep a Ride. Same.
3. **`0→1` new market opened** — Suzuverse PH. Same.
4. **Cohort size — withheld.** Three records disagree: the live homepage says `4K+
   participants`, `/about` says `2,000+ paid participants per cohort`, and
   `canon/brand.md` § Proof architecture says `cohorts of 900–1,800`. The page prints an em
   dash until you settle it. **This is the one that most needs you** — it is currently
   published as `4K+` on a live site and canon does not support that number.
5. **Field Notes — three entries with no dates.** The section is built and the three
   headlines are real subjects from canon's Field Notes taxonomy, but nothing is written or
   published yet, so the dates print as em dashes. Either three entries ship, or the
   section comes out before launch. It must not go live with invented dates.
6. **The engagement-record card in the fold is a specimen**, labelled as one. It shows the
   *shape* of an AI @ Work engagement, not a client. Replace it with a redacted real record
   as soon as a client releases one — that is the image a competitor cannot buy.

**Prices used are the ones `canon/pricing.md` marks live and quotable:** the ₱50,000 front-door
AI Workflow Audit (credited in full against an engagement booked within 60 days), the ₱110,000
Layer 1 floor, and USD 200 per private session. No stale number appears — not ₱6,000, not
₱20,000 per block, not ₱2,500 per additional participant.

**Metric row is 1 · 2 · 0** — one workflow per engagement, two weeks kickoff to handover,
zero retainers sold. Each is true by rule, so none of the three needs verifying. It never
opens with a count of engagements or clients, per the brand system.

---

## 4. One open tension, for you to call

`canon/brand.md` leaves it unresolved whether **"conscious choice" belongs in the homepage
hero or in the deeper narrative**. This draft keeps it out of the hero — `canon/company.md`'s
guardrail is that the mission never appears naked in a selling context — and places the
governing principle one section down, as the judgement line under *"Futureproof is the
house"*: *"We reveal consequences, not prescriptions — you keep the decision, and you keep
the outcome."* If you want it higher, that is a one-line move.

---

## 5. Verified, not assumed

Rendered in Chromium at 390 / 768 / 1440px, light and dark:

- Nothing scrolls the page sideways at 390px; no element overflows the viewport at any width.
- Both themes are defined at token level and `body` paints an explicit background
  (`#FAF8F4` light, `#141018` dark).
- The mark is inlined from Chii's master **verbatim** — both paths, both `fill-rule="evenodd"`,
  never redrawn. Rendered large to confirm it draws the double-struck ℂ and not a blob, and
  at the 18px floor to confirm the counter stays open. It sits at 27px in the lockup.
- The record layer collapses **above** the block it annotates on narrow screens, never hidden.
- **Green does not appear.** It is permitted in exactly one place — a delta column with a
  dated, sourced figure — and no figure on this page is dated and sourced yet. Violet marks
  decisions only: the CTAs, the third step, and the turn in the headline.
- Six type sizes, no size off the scale.

---

## 6. Where this needs to go

This draft lives in `chiibitsu/chiibitsu-labs` because the live site is in
**`Chiibitsu-Labs/website`** — a different owner tier (the `Chiibitsu-Labs` org, not the
`chiibitsu` account), which this session cannot attach. `chiibitsu.com` is also blocked by
the session's egress proxy, so the "before" was read from the vault's mirror at
`chiibitsu/aikiri-garden:03_human/builder-os/Chiibitsu-labs/website/index.html`.

That mirror is **stale** — `canon/brand.md` §10 says so explicitly: it shows Futureproof as
"Coming Soon" with a waitlist where the live site says "Live". Every §10 finding in the
table above was confirmed against it, so the diff is trustworthy on those points, but
**re-check the live page for anything that has changed since the mirror was taken.**

To land it: copy `website/index.html` and `website/assets/` into `Chiibitsu-Labs/website`,
or start a session with that repo as the initial source.
