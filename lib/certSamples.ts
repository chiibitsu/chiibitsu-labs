// PLACEHOLDER DATA for previews and local builds, never production. The sample certificates are the golden vectors'
// own records (lib/fixtures/cert_cohort.json: fake names, the 3-leaf cohort and its revocation), so a sample runs
// exactly what the vectors test. Their block numbers move to 9999xx, so they can never be mistaken for, or shadow,
// a real block. CertCheck loads this file on demand, only when samples are on.

import vectors from "@/lib/fixtures/cert_cohort.json";
import { bytesToBase64url, type CertLedger } from "@/lib/certCheck";
import type { Block, Witness } from "@/lib/ledgerCheck";

const r = vectors.records;
const SHIFT = 999900; // vector block 12 → 999912, 13 → 999913
const cohort = r.cohorts.find((c) => c.size === 3)!;
const blocks = new Map<number, Block>(r.blocks.map((b) => [b.index + SHIFT, { ...b, index: b.index + SHIFT, hash: "0".repeat(64) }]));
const proofs = new Map(cohort.proofs.map((p) => [p.leaf, { ...p, block: p.block === null ? null : p.block + SHIFT }]));
const revoked = new Map(Object.entries(r.revoked_files).map(([fp, f]) => [fp, { ...f, block: f.block + SHIFT }]));
const WITNESS: Witness = {
  base: { tx: null, note: "Placeholder: no Base transaction. The real one comes from the ledger." },
  bitcoin: { state: "none", heights: [] },
};

// The links to try on a preview: payload = base64url of the canonical bytes, exactly as the vectors give it.
export const SAMPLE_LINKS = r.examples.map((e) => ({ fingerprint: e.fingerprint, path: `/network/cert#${e.payload}` }));
export const samplePayloadOk = r.examples.every((e) => bytesToBase64url(new TextEncoder().encode(e.canonical)) === e.payload);

export function sampleLedger(fallback: CertLedger): CertLedger {
  const isSample = async (fp: string) => proofs.has(fp);
  return {
    proof: async (fp) => proofs.get(fp) ?? fallback.proof(fp),
    revocation: async (fp) => (proofs.has(fp) ? revoked.get(fp) ?? null : fallback.revocation(fp)),
    block: async (i) => blocks.get(i) ?? fallback.block(i),
    witness: async (i) => (blocks.has(i) ? WITNESS : fallback.witness(i)),
    isPlaceholder: isSample,
  };
}
