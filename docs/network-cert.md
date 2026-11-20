# /network/cert#&lt;payload&gt;: check a certificate

Status: built to the Network PM's answers (2026-11-20). The final word is `docs/certificates.md` in aikiri-network, with its golden vectors (story 1). Two values are still **PENDING** in `lib/certCheck.ts`: the fingerprint's domain prefix and the cohort root's kind. Until they are set, no real certificate can match, so the page fails closed: every real link reads "No certificate in this link." **The merge waits for the vectors to pass.**

## The story

**Who looks a certificate up.** Mostly someone who was *handed* one: an employer reading a CV, a client deciding whether to hire, a programme checking a claim. Sometimes the holder, making sure their link works before they share it.

**Why.** A certificate is a PDF or an image, and anyone can make one. The visitor wants one answer, fast: *did Chiibitsu Labs really issue this, and does it still stand?* They should not have to learn what a ledger is to get it.

**How they arrive.** From the link or QR code on the certificate. No form, no account.

**What they leave with.** One of three plain answers, a record they can screenshot, and an honest line on what the certificate is and is not.

> As someone who was handed a Chiibitsu Labs certificate, I open its link and see at once whether Chiibitsu Labs issued it and has not revoked it, so I can trust it or set it aside, without anyone learning what I looked at or who it names.

## How it works

1. The link is `https://www.chiibitsu.com/network/cert#<payload>`. The payload is the issuer record in canonical JSON, base64url without padding. Canonical means: sorted keys, no whitespace, UTF-8, NFC strings, integers only. A payload whose bytes are not already canonical is rejected. Fields: `v`, `number` (random, at least 128 bits), `holder`, `course`, `completed` (`YYYY-MM-DD`), `issuer`, `instructor`, optional `host`. There is no venue field, and any field not on this list is rejected. **The record lives only in the fragment, which browsers never send to a server.**
2. Fingerprint = SHA-256(domain prefix ‖ canonical bytes). The prefix is PENDING.
3. The browser fetches `ledger/certs/<fingerprint>.json`, which is `{v, leaf, path:[{side:"L"|"R", hash}], root, block}`. The leaf must be SHA-256(0x00 ‖ fingerprint); exactly what follows 0x00 is PENDING the docs. Each step up the path is SHA-256(0x01 ‖ left ‖ right), RFC 6962 style. The result must equal `root`, which must equal `blocks/<block>.json` `roots[0].sha256`, whose `kind` must be the cohort kind (PENDING).
4. `issuer` must be exactly "Chiibitsu Labs", or the page says not found.
5. If `ledger/certs/revoked/<fingerprint>.json` (`{v, fingerprint, block}`) exists and names this fingerprint, the state is Revoked. The revocation date is the timestamp of the block it names.
6. Sealed and revoked times are block timestamps, shown in Manila time. `completed` is shown exactly as written in the record.

There is no server route, no store and no rate limit. The fragment stays in the address bar, so refresh and copy-link keep working for the holder.

## The states

| State | When | Headline | Shows |
|---|---|---|---|
| **Valid** | The proof checks out to a block, and there is no revocation | "This certificate is valid." Then: "Issued by Chiibitsu Labs, not a government body. This record has not changed since it was sealed on &lt;date&gt;." | Issued to, course, completed on, instructor, "Hosted by" only when the link carries a host, issued by, certificate number, block, sealed, Base, Bitcoin, fingerprint |
| **Revoked** | As valid, and a revocation file names this fingerprint | "This certificate was revoked." | Certificate number, course, and when it was revoked (the revocation block's time). Not the holder's name: that stays hidden until Chii rules. |
| **Not found** | Bad payload, no proof file, a proof that does not reach the block, or a block that does not exist | "No certificate in this link." | Nothing from the link: no text from the URL is ever echoed |
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

Previews and local builds only. On production every link checks against the real ledger.

- Valid, with "Example Host": `/network/cert#eyJjb21wbGV0ZWQiOiIyMDI2LTAxLTAxIiwiY291cnNlIjoiU2FtcGxlIENvdXJzZSIsImhvbGRlciI6IlNhbXBsZSBQYXJ0aWNpcGFudCIsImhvc3QiOiJFeGFtcGxlIEhvc3QiLCJpbnN0cnVjdG9yIjoiU2FtcGxlIEluc3RydWN0b3IiLCJpc3N1ZXIiOiJDaGlpYml0c3UgTGFicyIsIm51bWJlciI6IlNBTVBMRS1WQUxJRC0wMDAwMDAwMDAwMDAiLCJ2IjoxfQ`
- Revoked: `/network/cert#eyJjb21wbGV0ZWQiOiIyMDI2LTAxLTAxIiwiY291cnNlIjoiU2FtcGxlIENvdXJzZSIsImhvbGRlciI6IlNhbXBsZSBQYXJ0aWNpcGFudCIsImluc3RydWN0b3IiOiJTYW1wbGUgSW5zdHJ1Y3RvciIsImlzc3VlciI6IkNoaWliaXRzdSBMYWJzIiwibnVtYmVyIjoiU0FNUExFLVJFVk9LRUQtMDAwMDAwMDAwMCIsInYiOjF9`

They form one sample cohort of two certificates, built in `placeholderLedger` with the same hashing the check uses, so a sample runs the whole check. `npm run check:cert-logic` (in gates) runs them, plus links that are not canonical, tampered, or from another issuer. Add the golden vectors there. Changing one character of a sample link gives "No certificate in this link."

## Where things live

| What | Where |
|---|---|
| Page and its layout | `app/(cert)/network/cert/page.tsx`, `app/(cert)/layout.tsx` |
| The check, in the browser | `components/CertCheck.tsx` |
| Decoding, Merkle check, ledger adapter, samples | `lib/certCheck.ts` |
| Shared Base and Bitcoin rows | `components/WitnessRows.tsx`, `bitcoinLine` in `lib/ledgerCheck.ts` |
| Enforced CSP | `proxy.ts` |
| Copy | `content/cert.json` |
| Gate | `scripts/check-cert.mjs` |
| Unknown URLs, inside the site layout | `app/(site)/[...missing]/page.tsx`, `app/(site)/not-found.tsx` |

## When the vectors land

1. Set `FINGERPRINT_PREFIX` and `COHORT_KIND` in `lib/certCheck.ts` from `docs/certificates.md`, and confirm what follows 0x00 in a leaf.
2. Confirm the canonical JSON's string escaping matches `JSON.stringify`. Where it does not, `canonicalJson` changes.
3. Add every vector to `scripts/check-cert-logic.mjs`: payload, fingerprint, leaf, path, root and the expected state.
4. Replace the sample cohort with one built from the vectors, or keep it if it still matches.

## Open questions for Chii

- **Revoked: show the holder's name or not?** It is built without the name, to show as little as possible. The visitor already holds the link, but the page does not repeat the name. A taste and privacy call, so it is yours.
- **A "something looks wrong" contact line.** Not added.
- **Copy voice.** The CMO's `canon/voice.md` fixes are in: one name for the ledger ("the Aikiri Network ledger"), "not a government body" in the valid line, and a shorter error line.
