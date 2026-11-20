# /network/cert#&lt;payload&gt;: check a certificate

Status: built to the agreed **shape** of the certificate contract (Site PM and Network PM, 2026-11-20). The exact field names, canonical bytes, Merkle rule and file layout come in `docs/certificates.md` in the aikiri-network repo, with golden test vectors. Everything this page guesses is marked `⟨contract⟩` in `lib/certCheck.ts`.

## The story

**Who looks a certificate up.** Mostly someone who was *handed* one: an employer reading a CV, a client deciding whether to hire, a programme checking a claim. Sometimes the holder, making sure their link works before they share it.

**Why.** A certificate is a PDF or an image, and anyone can make one. The visitor wants one answer, fast: *did Chiibitsu Labs really issue this, and does it still stand?* They should not have to learn what a ledger is to get it.

**How they arrive.** From the link or QR code on the certificate. No form, no account.

**What they leave with.** One of three plain answers, a record they can screenshot, and an honest line on what the certificate is and is not.

> As someone who was handed a Chiibitsu Labs certificate, I open its link and see at once whether Chiibitsu Labs issued it and has not revoked it, so I can trust it or set it aside, without anyone learning what I looked at or who it names.

## How it works

1. The link is `https://www.chiibitsu.com/network/cert#<payload>`. The payload is the issuer record, base64url-encoded: version, a random certificate number of at least 128 bits, holder, course, completion date, issuer, instructor, and an optional generic `host`. There is no venue field. **The record lives only in the fragment, which browsers never send to a server.**
2. The browser decodes the record and works out its fingerprint: SHA-256 over the canonical bytes.
3. It fetches `ledger/certs/<fingerprint>.json` from the public ledger (the `LEDGER_RAW` the check page already uses). That file holds only the Merkle path, the root and the block index.
4. It walks the path up to the root and checks that `blocks/<index>.json` holds that root. The Base and Bitcoin rows then come from `loadWitness`, the same reader /network/check uses.
5. If `ledger/certs/revoked/<fingerprint>.json` exists, the state is Revoked, with its date.

There is no server route, no store and no rate limit. The fragment stays in the address bar, so refresh and copy-link keep working for the holder.

## The states

| State | When | Headline | Shows |
|---|---|---|---|
| **Valid** | The proof checks out to a block, and there is no revocation | "This certificate is valid." Then: "Issued by Chiibitsu Labs. This record has not changed since it was sealed on &lt;date&gt;." | Issued to, course, completed on, instructor, "Hosted by" only when the link carries a host, issued by, certificate number, block, sealed, Base, Bitcoin, fingerprint |
| **Revoked** | As valid, and a revocation file exists | "This certificate was revoked." | Certificate number, course, revoked on. Not the holder's name (see open questions). |
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

- Valid, with "Example Host": `/network/cert#eyJ2ZXJzaW9uIjoxLCJudW1iZXIiOiJTQU1QTEUtVkFMSUQtMDAwMDAwMDAwMDAwIiwiaG9sZGVyIjoiU2FtcGxlIFBhcnRpY2lwYW50IiwiY291cnNlIjoiU2FtcGxlIENvdXJzZSIsImNvbXBsZXRlZE9uIjoiMjAyNi0wMS0wMSIsImlzc3VlciI6IkNoaWliaXRzdSBMYWJzIiwiaW5zdHJ1Y3RvciI6IlNhbXBsZSBJbnN0cnVjdG9yIiwiaG9zdCI6IkV4YW1wbGUgSG9zdCJ9`
- Revoked: `/network/cert#eyJ2ZXJzaW9uIjoxLCJudW1iZXIiOiJTQU1QTEUtUkVWT0tFRC0wMDAwMDAwMDAwIiwiaG9sZGVyIjoiU2FtcGxlIFBhcnRpY2lwYW50IiwiY291cnNlIjoiU2FtcGxlIENvdXJzZSIsImNvbXBsZXRlZE9uIjoiMjAyNi0wMS0wMSIsImlzc3VlciI6IkNoaWliaXRzdSBMYWJzIiwiaW5zdHJ1Y3RvciI6IlNhbXBsZSBJbnN0cnVjdG9yIn0`

Their proofs are built in `placeholderLedger` with the same Merkle rule the check uses, so a sample runs the whole check. Changing one character of a sample link gives "No certificate in this link."

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

## When the contract lands

Replace each `⟨contract⟩` guess, then run the golden vectors through `decodePayload`, `pathRoot` and `checkCertificate`:

1. The field names, and how `version` changes them.
2. The canonical bytes. Today they are taken to be exactly the decoded payload.
3. The Merkle parent rule. Today it is SHA-256 of left‖right, raw bytes, with no domain-separation prefix.
4. The proof and revocation JSON, and whether the root is the block's `merkle_root` or one of its `roots`.
5. Whether the issuer field must equal "Chiibitsu Labs" for the page to say "valid".
6. Which time zone dates are in.

## Open questions for Chii

- **Revoked: show the holder's name or not?** It is built without the name, to show as little as possible. The visitor already holds the link, but the page does not repeat the name. A taste and privacy call, so it is yours.
- **A "something looks wrong" contact line.** Not added.
- **Copy voice.** `canon/voice.md` in vibeOS could not be read in this session, so the copy follows /network/check and the Site PM's wording. It needs a pass against canon.
