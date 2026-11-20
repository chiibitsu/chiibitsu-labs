// /network/cert/<number>: the page's view of one certificate, and the adapter that fills it.
//
// THE DATA CONTRACT IS NOT SETTLED. The Site PM and the Network PM are agreeing it. Until it lands:
// - CertView is what the PAGE needs to render, not the issuer's record format. The real adapter will map the
//   agreed record onto it; if the contract needs a field the page lacks, CertView grows, the page does not guess.
// - The only source is placeholderSource below: two fixed sample numbers, every other number is "not found".
//   Its records carry placeholder: true and the page labels them, so a sample can never pass for a real certificate.
//
// Privacy rules the adapter must keep, whatever the contract says:
// - One number in, at most one certificate out. No list, search, range or "nearby" lookup.
// - A malformed number and an unknown number give the same answer, so the page leaks nothing about the format.
// - Personal data (the holder's name) only on a valid certificate, and never in metadata, analytics or logs.

import type { Witness } from "@/lib/ledgerCheck";

export type CertSeal = {
  block: number; // the Aikiri ledger block that holds the certificate's record
  sealedAt: string; // the block's timestamp, as the ledger writes it
  witness: Witness; // Base and Bitcoin, read the same way /network/check reads them (loadWitness)
};

export type CertView =
  | { state: "valid"; number: string; holder: string; course: string; issuedOn: string; seal: CertSeal; placeholder: boolean }
  | { state: "revoked"; number: string; course: string; revokedOn: string; placeholder: boolean }
  | { state: "not_found"; number: string | null }; // null: not a certificate number, so nothing from the URL is echoed

export interface CertSource {
  lookup(number: string): Promise<CertView>;
}

// Uppercase, trimmed. Letters, digits and hyphens, 1 to 64 characters; anything else is simply not found.
// The route param arrives decoded once by Next.js; it is not decoded again, so one number has one spelling.
export const normalizeCertNumber = (raw: string) => raw.trim().toUpperCase();
export const isCertNumber = (s: string) => /^[A-Z0-9][A-Z0-9-]{0,63}$/.test(s);

// ---- PLACEHOLDER DATA: not real certificates. Remove when the contract's adapter lands. ----
const PLACEHOLDER_WITNESS: Witness = {
  base: { tx: null, note: "Placeholder: no Base transaction. The real one comes from the ledger." },
  bitcoin: { state: "none", heights: [] },
};
const PLACEHOLDERS: Record<string, CertView> = {
  "PLACEHOLDER-VALID": {
    state: "valid",
    number: "PLACEHOLDER-VALID",
    holder: "Sample Learner",
    course: "Sample Course",
    issuedOn: "2026-01-01",
    seal: { block: -1, sealedAt: "2026-01-01T00:00:00+08:00", witness: PLACEHOLDER_WITNESS },
    placeholder: true,
  },
  "PLACEHOLDER-REVOKED": {
    state: "revoked",
    number: "PLACEHOLDER-REVOKED",
    course: "Sample Course",
    revokedOn: "2026-02-01",
    placeholder: true,
  },
};
export const PLACEHOLDER_NUMBERS = Object.keys(PLACEHOLDERS);

export const placeholderSource: CertSource = {
  async lookup(raw) {
    const number = normalizeCertNumber(raw);
    if (!isCertNumber(number)) return { state: "not_found", number: null };
    return PLACEHOLDERS[number] ?? { state: "not_found", number };
  },
};
// ---- END PLACEHOLDER DATA ----

// Until the contract lands, production answers "not found" for every number, so a sample can never show as
// "valid" on chiibitsu.com. Previews and local builds use the placeholders. Swap this for the contract's adapter.
const noneSource: CertSource = {
  async lookup(raw) {
    const number = normalizeCertNumber(raw);
    return { state: "not_found", number: isCertNumber(number) ? number : null };
  },
};
export const certSource: CertSource = process.env.VERCEL_ENV === "production" ? noneSource : placeholderSource;
