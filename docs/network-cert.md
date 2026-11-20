# /network/cert/&lt;number&gt;: check a certificate

Status: page shell and three states built against **placeholder data**. The data contract is being agreed by the Site PM and the Network PM. Nothing here defines it.

## The story

**Who looks a certificate up.** Mostly someone who was *handed* one: an employer reading a CV, a client deciding whether to hire, a school or programme checking a claim. Sometimes the holder, making sure their link works before they share it.

**Why.** A certificate is a PDF or an image, and anyone can make one. The visitor wants one answer, fast: *did Chiibitsu Labs really issue this, and does it still stand?* They do not want to learn what a ledger is to get it.

**How they arrive.** From the link or QR code on the certificate, which carries its number: `chiibitsu.com/network/cert/<number>`. No form, no account.

**What they leave with.** One of three plain answers, a screenshot-able record, and an honest line on what the certificate is and is not.

> As someone who was handed a Chiibitsu Labs certificate, I open its link and see at once whether Chiibitsu Labs issued it and has not revoked it, so I can trust it or set it aside, without being told anything about anyone else.

## Mini-spec

### The three states

| State | Headline | Shows | Never shows |
|---|---|---|---|
| **Valid** | "This certificate is valid." | Number, issued to (holder's name), course, issued by Chiibitsu Labs, issued on, ledger block, sealed date and time, Base (with the transaction link), Bitcoin stamp | Anything about other certificates |
| **Revoked** | "This certificate was revoked." | Number, course, revoked on | The holder's name (see open questions) |
| **Not found** | "No certificate with this number." | The number that was checked, and what to try | Whether the number was malformed or simply unknown: both get the same answer |

Every state also shows **What this page shows**: only what Chiibitsu Labs issued; not a government certification, licence or accredited qualification; what "valid" does and does not mean; one certificate at a time, no list or search. `npm run check:content` fails if the first two lines go missing.

### Rules

- **One in, one out.** The page takes one number and shows at most one certificate. No list, search, ranges, or next/previous links.
- **Personal data only for the one looked up.** The holder's name appears only on a valid certificate's page. It is never in the page title, description or link preview (metadata is the same for every number), and the page is `noindex, nofollow`. The record is masked from Clarity session recordings (`data-clarity-mask`).
- **Same witness as /network/check.** The Base and Bitcoin rows are one shared component (`components/WitnessRows.tsx`), and the Bitcoin sentence is one function (`bitcoinLine` in `lib/ledgerCheck.ts`). A live adapter fills them with `loadWitness(block)`, exactly as the check page does.
- **Honest about samples.** Placeholder records carry `placeholder: true`. The page then shows an "Illustrative" label and says it is not a real certificate, and the block row reads "Placeholder".
- **No venue partner named.** Not in copy, metadata or code.

### Where things live

| What | Where |
|---|---|
| Page | `app/network/cert/[id]/page.tsx` (server-rendered) |
| Copy | `content/cert.json` |
| View model and adapter | `lib/certCheck.ts`: `CertView`, `CertSource`, `certSource` (today `placeholderSource`) |
| Shared witness rows | `components/WitnessRows.tsx` |

### Placeholder numbers (sample data, not real)

- `/network/cert/PLACEHOLDER-VALID`: the valid state
- `/network/cert/PLACEHOLDER-REVOKED`: the revoked state
- any other number: not found

## What the contract needs to answer

The page needs these from the agreed record. Where the contract says otherwise, the adapter maps it; the page does not guess.

1. **The number's format.** Today the page accepts 1 to 64 letters, digits and hyphens, case-insensitive. Numbers should not be sequential or guessable, or "one at a time" is a list in disguise.
2. **Where the record is read from**, and whether that lookup is rate-limited. The page itself does not stop someone trying many numbers.
3. **Valid:** holder's display name, course title, issue date, and the ledger block (and root) that seals it.
4. **Revoked:** the revocation date, and whether revocation is itself sealed on the ledger (then the page can show its witness too).
5. **Dates:** which time zone the issue and revocation dates are in.

## Open questions for Chii

- **Revoked: show the holder's name or not?** Built without it (least disclosure). A taste and privacy call, so it is yours.
- **A "something looks wrong" contact line.** Not added: no address was given to use.
- **Copy voice.** `canon/voice.md` in vibeOS could not be read in this session, so the copy follows the existing `/network/check` voice. Needs a pass against canon.
- **Not in the sitemap** on purpose: certificate pages are reached by their own link only.
