# /network/cert#&lt;payload&gt;: check a certificate

Status: built to the certificate format in aikiri-network's `docs/certificates.md` (PR #22, at `5a65b0b`). That PR's `tests/vectors/cert_cohort.json` is copied into `lib/fixtures/` and every vector passes (`npm run check:cert-logic`). **The merge waits for aikiri-network #22 to merge**, so the format can't move under this page. If the two ever disagree, the doc wins.

## The story

**Who looks a certificate up.** Mostly someone who was *handed* one: an employer reading a CV, a client deciding whether to hire, a programme checking a claim. Sometimes the holder, making sure their link works before they share it.

**Why.** A certificate is a PDF or an image, and anyone can make one. The visitor wants one answer, fast: *did Chiibitsu Labs really issue this, and does it still stand?* They should not have to learn what a ledger is to get it.

**How they arrive.** From the link or QR code on the certificate. No form, no account.

**What they leave with.** One of three plain answers, a record they can screenshot, and an honest line on what the certificate is and is not.

> As someone who was handed a Chiibitsu Labs certificate, I open its link and see at once whether Chiibitsu Labs issued it and has not revoked it, so I can trust it or set it aside, without anyone learning what I looked at or who it names.

## How it works

1. The link is `https://www.chiibitsu.com/network/cert#<payload>`. The payload is the issuer record's canonical bytes in unpadded base64url, at most 4,096 characters. **The record lives only in the fragment, which browsers never send to a server.**
   - Fields: `v` (1), `number` (32 to 64 lowercase hex: 128 to 256 random bits, the salt), `holder`, `course`, `completed` (a real `YYYY-MM-DD` date), `issuer` (exactly "Chiibitsu Labs"), `instructor`, and `host` only when the certificate names one. No other field, so no venue field.
   - Text fields: 1 to 200 code points, already NFC, no control characters, no lone surrogates. The page refuses non-NFC text and never normalises it.
   - Canonical bytes are `JSON.stringify` of the key-sorted record, through `TextEncoder`: plain UTF-8, with non-ASCII not escaped. A payload counts only if re-encoding what it decodes to gives back exactly the same bytes and the same payload.
2. Fingerprint = SHA-256(`"aikiri-ledger/cert-record/v1\n"` ‖ canonical bytes).
3. The browser fetches `ledger/certs/<fingerprint>.json`: `{block, leaf, path:[{sha256, side:"left"|"right"}], root, v}`, a closed schema with at most 16 steps. `leaf` must be this fingerprint.
4. It folds the path in an RFC 9162 tree with text prefixes: leaf = SHA-256(`"aikiri-ledger/cert-leaf/v1\n"` ‖ fingerprint's 32 bytes), node = SHA-256(`"aikiri-ledger/cert-node/v1\n"` ‖ left ‖ right). The result must equal `root`.
5. The proof is a pointer, not evidence. `blocks/<block>.json` must exist, and its roots must be exactly `[{"kind":"cert-cohort","sha256":root}]`.
6. `ledger/certs/revoked/<fingerprint>.json` (`{block, fingerprint, v}`) counts only if its block exists and its roots are exactly `[{"kind":"revocation","sha256":fingerprint}]`. Until then the certificate stays valid.
7. Holder, course, instructor and host are shown inside `<bdi>`, and every hidden character (bidi overrides and isolates, C1 controls, line separators, zero-width and other default-ignorable characters, Hangul fillers, tags) is shown as a visible U+FFFD, so two different records never look the same. ZWJ, ZWNJ, variation selectors and the plain LRM, RLM and ALM marks are kept, since real text needs them. The bytes may carry them, and the doc requires a page to neutralise them. Only the display changes; the hashed bytes never do.
8. Sealed and revoked times are block timestamps, shown in Manila time. `completed` is shown exactly as written. Base and Bitcoin come from `loadWitness`, as on /network/check.

There is no server route, no store and no rate limit. The fragment stays in the address bar, so refresh and copy-link keep working for the holder.

## The states

| State | When | Headline | Shows |
|---|---|---|---|
| **Valid** | The proof holds, its block seals exactly that root as `cert-cohort`, and no revocation block names it | "This certificate is valid." Then: "Issued by Chiibitsu Labs, not a government body. This record has not changed since it was sealed on &lt;date&gt;." | Issued to, course, completed on, instructor, "Hosted by" only when the link carries a host, issued by, certificate number, block, sealed (Manila time), Base, Bitcoin, fingerprint |
| **Revoked** | As valid, and a `revocation` block names this fingerprint | "This certificate was revoked." | Certificate number, course, and when it was revoked (the revocation block's time). Not the holder's name: that stays hidden until Chii rules. |
| **Not found** | A complete record that no sealed cohort holds: no proof file, or a proof whose block is `null`, missing, another cohort's, the root under another kind, or something else | "No sealed certificate matches this link." | Nothing from the link |
| **Invalid** | Not a v1 record: malformed, not canonical, not NFC, another issuer, an unknown field. Or a proof that doesn't lead to its root (tampered path, swapped root), or sits under another certificate's name (the doc's verify table) | "This link is incomplete." | Nothing from the link |
| **Could not check** | The ledger could not be read | "Could not check just now." | That this says nothing either way |

Every state also shows **What this page shows**: only what Chiibitsu Labs issued; not a government certification, licence or accredited qualification; what "valid" does and does not mean; the details stay on your device; one certificate at a time. `npm run check:content` fails if the first two lines go missing, or if the cert copy ever says "certified", "legally", "proven" or "venue".

## Locked down

- **Its own root layout with no third-party scripts.** The site moved into the route group `app/(site)/` (its URLs are unchanged). `/network/cert` lives in `app/(cert)/`, whose layout loads no Clarity, Apollo, Vercel Analytics or Speed Insights. Moving between the two layouts is a full page load, which Next.js does on its own.
- **An enforced Content-Security-Policy, on this route only** (`proxy.ts`). Scripts: `'self'` plus a fresh nonce per request, with `'strict-dynamic'`. Connections: `'self'` and `https://raw.githubusercontent.com`. Styles keep `'unsafe-inline'`, as the site's policy does. The rest of the site stays report-only (`next.config.ts`).
  - *Measured, not assumed:* a production build loaded in Chromium with the policy enforced, using the two samples, a tampered link, junk and an empty fragment. **Zero `securitypolicyviolation` events.** The page hydrated and reached the right state every time. The only outside host requested was raw.githubusercontent.com. Next.js put the nonce on its own inline `self.__next_f` scripts, and the theme script carries it from `x-nonce`. Plain `script-src 'self'` would have blocked those scripts, so the nonce is needed.
  - The nonce means the page renders per request; it cannot be static.
- **Nothing from the fragment leaves the device** except its fingerprint, to the public ledger. The cert route does not import analytics, `trackEvent` or `/api/verify-alert`. Ledger fetches use `referrerPolicy: no-referrer`, and the page sends `Referrer-Policy: no-referrer`. The record is also marked `data-clarity-mask`, as a second line of defence should Clarity ever reach this page.
- **`npm run check:cert`** (part of `npm run gates`) starts the built app and fails if:
  - `/network/cert`'s HTML contains clarity.ms, apollo.io or a Vercel analytics or insights script;
  - its CSP is not enforced, has no nonce, or allows another origin for scripts or connections;
  - any inline script lacks the nonce;
  - anything the cert route imports, walked from its entry files, uses analytics, a tracker host or the verify alert.

  It also checks that /network/check still loads Clarity, so the test can tell the difference. Proven by planting a Clarity script in the cert layout: the gate failed three ways (source, HTML, foreign script), then passed once it was removed.
- `noindex, nofollow`, the same title and description for every certificate, and not in the sitemap.

## Samples (placeholder data, not real)

Previews and local builds only; production never downloads them. The samples are the golden vectors' own records: fake names, the 3-leaf cohort and its revocation, with their block numbers moved to 9999xx so they can't shadow a real block (`lib/certSamples.ts`, loaded on demand).

- Valid: `/network/cert#eyJjb21wbGV0ZWQiOiIyMDI2LTAxLTMxIiwiY291cnNlIjoiRXhhbXBsZSBDb3Vyc2UiLCJob2xkZXIiOiJUZXN0IEhvbGRlciIsImluc3RydWN0b3IiOiJUZXN0IEluc3RydWN0b3IiLCJpc3N1ZXIiOiJDaGlpYml0c3UgTGFicyIsIm51bWJlciI6IjAwMTEyMjMzNDQ1NTY2Nzc4ODk5YWFiYmNjZGRlZWZmIiwidiI6MX0`
- Revoked (its record carries "Example Host", which a revoked page does not show): `/network/cert#eyJjb21wbGV0ZWQiOiIyMDI2LTAxLTMxIiwiY291cnNlIjoiRXhhbXBsZSBDb3Vyc2UiLCJob2xkZXIiOiJUZXN0IEhvbGRlciBUd28iLCJob3N0IjoiRXhhbXBsZSBIb3N0IiwiaW5zdHJ1Y3RvciI6IlRlc3QgSW5zdHJ1Y3RvciIsImlzc3VlciI6IkNoaWliaXRzdSBMYWJzIiwibnVtYmVyIjoiZmZlZWRkY2NiYmFhOTk4ODc3NjY1NTQ0MzMyMjExMDAiLCJ2IjoxfQ`
- Valid, with non-ASCII, quotes, a backslash and an emoji: `/network/cert#eyJjb21wbGV0ZWQiOiIyMDI0LTAyLTI5IiwiY291cnNlIjoiRXhhbXBsZSBDb3Vyc2Ug4oCUIFBhcnQgMSDwn46TIiwiaG9sZGVyIjoiVMOrc3QgSMWNbGRlciBcIlRocmVlXCIgXFwgRXhhbXBsZSIsImluc3RydWN0b3IiOiJUZXN0IEluc3RydWN0b3IiLCJpc3N1ZXIiOiJDaGlpYml0c3UgTGFicyIsIm51bWJlciI6IjBmMGYwZjBmMGYwZjBmMGYwZjBmMGYwZjBmMGYwZjBmMGYwZjBmMGYwZjBmMGYwZjBmMGYwZjBmMGYwZjBmMGYiLCJ2IjoxfQ`

## Where things live

| What | Where |
|---|---|
| Page and its layout | `app/(cert)/network/cert/page.tsx`, `app/(cert)/layout.tsx` |
| The check, in the browser | `components/CertCheck.tsx` |
| Decoding, Merkle check, ledger adapter | `lib/certCheck.ts` |
| Preview samples, from the vectors | `lib/certSamples.ts` |
| The golden vectors (a copy, never edited here) | `lib/fixtures/cert_cohort.json`, `lib/fixtures/README.md` |
| Vector gate | `scripts/check-cert-logic.mjs` |
| Shared Base and Bitcoin rows | `components/WitnessRows.tsx`, `bitcoinLine` in `lib/ledgerCheck.ts` |
| Enforced CSP | `proxy.ts` |
| Copy | `content/cert.json` |
| Gate | `scripts/check-cert.mjs` |
| Unknown URLs, inside the site layout | `app/(site)/[...missing]/page.tsx`, `app/(site)/not-found.tsx` |

## When the format changes

Any change to the format is a protocol version change, made in aikiri-network first. Copy the new `tests/vectors/cert_cohort.json` into `lib/fixtures/` byte for byte, update the commit in `lib/fixtures/README.md`, and make `npm run check:cert-logic` pass again.

## Open questions for Chii

- **Revoked: show the holder's name or not?** It is built without the name, to show as little as possible. The visitor already holds the link, but the page does not repeat the name. A taste and privacy call, so it is yours.
- **A "something looks wrong" contact line.** Not added.
- **The Invalid, Not found and placeholder lines** are the CMO's, after a canon check.
- **Copy voice.** The CMO's `canon/voice.md` fixes are in: one name for the ledger ("the Aikiri Network ledger"), "not a government body" in the valid line, and a shorter error line.
