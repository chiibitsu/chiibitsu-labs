// /network/cert#<payload>: checks one certificate in the visitor's browser. Nothing from the link leaves the device
// except its fingerprint, which goes to the public ledger (raw.githubusercontent.com) to fetch the proof.
//
// THE CONTRACT IS NOT FINAL. The Network PM's docs/certificates.md in aikiri-network, with golden test vectors,
// will fix the field names, the canonical bytes, the Merkle rule and the file layout. Everything marked
// ⟨contract⟩ below is this page's working guess at that shape. Swap it for the contract's, then run its vectors.
//
// Privacy, whatever the contract says:
// - The record (and so the holder's name) lives only in the URL fragment, which browsers never send to a server.
// - Nothing from the fragment goes to analytics, /api/verify-alert or any log. This file imports neither.
// - One link checks one certificate. There is no list, search or enumeration.

import { LEDGER_RAW, NotInLedger, loadBlock, loadWitness, sha256Hex, type Block, type Witness } from "@/lib/ledgerCheck";

// ⟨contract⟩ The issuer record. There is no venue field; host is an optional generic label.
export type CertRecord = {
  version: number;
  number: string; // random, at least 128 bits
  holder: string;
  course: string;
  completedOn: string;
  issuer: string;
  instructor: string;
  host?: string;
};

// ⟨contract⟩ ledger/certs/<fingerprint>.json: the Merkle path from the certificate up to its block's root.
export type CertProof = {
  path: { side: "left" | "right"; hash: string }[]; // each sibling, and which side it sits on
  root: string;
  block: number;
};

// ⟨contract⟩ ledger/certs/revoked/<fingerprint>.json
export type CertRevocation = { revokedOn: string };

export type CertView =
  | { state: "valid"; record: CertRecord; fingerprint: string; block: number; sealedAt: string; witness: Witness; placeholder: boolean }
  | { state: "revoked"; record: CertRecord; revokedOn: string; placeholder: boolean }
  | { state: "not_found" }
  | { state: "error" }; // the ledger could not be read: not the same as "not found"

export interface CertLedger {
  proof(fingerprint: string): Promise<CertProof | null>;
  revocation(fingerprint: string): Promise<CertRevocation | null>;
  block(index: number): Promise<Block>;
  witness(index: number): Promise<Witness>;
  isPlaceholder(fingerprint: string): Promise<boolean>;
}

const HEX64 = /^[0-9a-f]{64}$/;
const MAX_FRAGMENT = 4096;

// ---- Decoding the link ----

export function base64urlToBytes(s: string): Uint8Array<ArrayBuffer> | null {
  if (!/^[A-Za-z0-9_-]+$/.test(s) || s.length % 4 === 1) return null;
  const b64 = s.replace(/-/g, "+").replace(/_/g, "/") + "===".slice((s.length + 3) % 4);
  try {
    const bin = atob(b64);
    const out = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
    return out;
  } catch {
    return null;
  }
}

export function bytesToBase64url(bytes: Uint8Array): string {
  let bin = "";
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

const text = (v: unknown, max = 200): v is string =>
  typeof v === "string" && v.trim().length > 0 && v.length <= max && !/[\u0000-\u001f\u007f]/.test(v);

// ⟨contract⟩ The canonical bytes are taken to be exactly the decoded payload (UTF-8 JSON). The fingerprint is
// their SHA-256, so a link that was edited by even one character no longer matches anything in the ledger.
export function decodePayload(fragment: string): { bytes: Uint8Array<ArrayBuffer>; record: CertRecord } | null {
  const raw = fragment.replace(/^#/, "");
  if (!raw || raw.length > MAX_FRAGMENT) return null;
  const bytes = base64urlToBytes(raw);
  if (!bytes) return null;
  let r: Record<string, unknown>;
  try {
    r = JSON.parse(new TextDecoder("utf-8", { fatal: true }).decode(bytes));
  } catch {
    return null;
  }
  if (!r || typeof r !== "object" || Array.isArray(r)) return null;
  if (typeof r.version !== "number" || !Number.isInteger(r.version)) return null;
  if (typeof r.number !== "string" || !/^[A-Za-z0-9_-]{22,128}$/.test(r.number)) return null; // 22 base64url characters = 132 bits
  for (const k of ["holder", "course", "completedOn", "issuer", "instructor"]) if (!text(r[k])) return null;
  if (r.host !== undefined && r.host !== "" && !text(r.host)) return null;
  const record: CertRecord = {
    version: r.version,
    number: r.number,
    holder: r.holder as string,
    course: r.course as string,
    completedOn: r.completedOn as string,
    issuer: r.issuer as string,
    instructor: r.instructor as string,
    ...(typeof r.host === "string" && r.host.trim() ? { host: r.host } : {}),
  };
  return { bytes, record };
}

// ---- The Merkle path ----

const hexToBytes = (h: string) => Uint8Array.from(h.match(/../g) ?? [], (b) => parseInt(b, 16));

// ⟨contract⟩ A parent is SHA-256 over the two child hashes' raw bytes, left then right.
export async function merkleParent(left: string, right: string): Promise<string> {
  const buf = new Uint8Array(64);
  buf.set(hexToBytes(left), 0);
  buf.set(hexToBytes(right), 32);
  return sha256Hex(buf.buffer);
}

export async function pathRoot(leaf: string, path: CertProof["path"]): Promise<string> {
  let h = leaf;
  for (const step of path) h = step.side === "left" ? await merkleParent(step.hash, h) : await merkleParent(h, step.hash);
  return h;
}

const validProof = (p: unknown): p is CertProof => {
  const q = p as CertProof;
  return !!q && Number.isInteger(q.block) && q.block >= 0 && HEX64.test(q.root) && Array.isArray(q.path) && q.path.length <= 64 &&
    q.path.every((s) => (s?.side === "left" || s?.side === "right") && HEX64.test(s.hash));
};

// The block must hold the proof's root: as its combined hash, or as one of its sealed roots.
const blockHolds = (b: Block, root: string) => b.merkle_root === root || (b.roots ?? []).some((r) => r.sha256 === root);

// ---- The check ----

export async function checkCertificate(fragment: string, ledger: CertLedger): Promise<CertView> {
  const decoded = decodePayload(fragment);
  if (!decoded) return { state: "not_found" };
  try {
    const fingerprint = await sha256Hex(decoded.bytes.buffer);
    const [proof, revocation] = await Promise.all([ledger.proof(fingerprint), ledger.revocation(fingerprint)]);
    if (!validProof(proof)) return { state: "not_found" };
    const [block, root] = await Promise.all([ledger.block(proof.block), pathRoot(fingerprint, proof.path)]);
    if (root !== proof.root || !blockHolds(block, root)) return { state: "not_found" };
    const placeholder = await ledger.isPlaceholder(fingerprint);
    if (revocation) {
      if (!text(revocation.revokedOn, 40)) return { state: "error" };
      return { state: "revoked", record: decoded.record, revokedOn: revocation.revokedOn, placeholder };
    }
    const witness = await ledger.witness(block.index);
    return { state: "valid", record: decoded.record, fingerprint, block: block.index, sealedAt: block.timestamp, witness, placeholder };
  } catch (e) {
    // A proof naming a block that does not exist is a proof that does not reach the ledger: not found.
    return e instanceof NotInLedger ? { state: "not_found" } : { state: "error" };
  }
}

// ---- The live ledger ----

async function getJsonOrNull(url: string): Promise<unknown> {
  const r = await fetch(url, { cache: "no-store", referrerPolicy: "no-referrer" });
  if (r.status === 404) return null;
  if (!r.ok) throw new Error(`${r.status}`);
  return r.json();
}

export const liveLedger: CertLedger = {
  proof: async (fp) => (await getJsonOrNull(`${LEDGER_RAW}/certs/${fp}.json`)) as CertProof | null,
  revocation: async (fp) => (await getJsonOrNull(`${LEDGER_RAW}/certs/revoked/${fp}.json`)) as CertRevocation | null,
  block: loadBlock,
  witness: loadWitness,
  isPlaceholder: async () => false,
};

// ---- PLACEHOLDER DATA: not real certificates. Previews and local builds only; never on production. ----
// Two sample records with obviously fake names. Their proofs are built here with the same Merkle rule the
// check uses, so a sample runs the whole check, not a shortcut. Remove when the contract's vectors land.

export const SAMPLE_RECORDS: Record<"valid" | "revoked", CertRecord> = {
  valid: {
    version: 1,
    number: "SAMPLE-VALID-000000000000",
    holder: "Sample Participant",
    course: "Sample Course",
    completedOn: "2026-01-01",
    issuer: "Chiibitsu Labs",
    instructor: "Sample Instructor",
    host: "Example Host",
  },
  revoked: {
    version: 1,
    number: "SAMPLE-REVOKED-0000000000",
    holder: "Sample Participant",
    course: "Sample Course",
    completedOn: "2026-01-01",
    issuer: "Chiibitsu Labs",
    instructor: "Sample Instructor",
  },
};

export const samplePayload = (r: CertRecord) => bytesToBase64url(new TextEncoder().encode(JSON.stringify(r)));

const SAMPLE_BLOCK = 999999; // not a real block
const SAMPLE_SIBLING = "5a".repeat(32);
const SAMPLE_WITNESS: Witness = {
  base: { tx: null, note: "Placeholder: no Base transaction. The real one comes from the ledger." },
  bitcoin: { state: "none", heights: [] },
};

async function sampleFingerprints() {
  const fp = async (r: CertRecord) => sha256Hex(new TextEncoder().encode(JSON.stringify(r)).buffer);
  return { valid: await fp(SAMPLE_RECORDS.valid), revoked: await fp(SAMPLE_RECORDS.revoked) };
}

export function placeholderLedger(fallback: CertLedger): CertLedger {
  const fps = sampleFingerprints();
  const isSample = async (fp: string) => Object.values(await fps).includes(fp);
  return {
    async proof(fp) {
      if (!(await isSample(fp))) return fallback.proof(fp);
      const path: CertProof["path"] = [{ side: "right", hash: SAMPLE_SIBLING }];
      return { path, root: await pathRoot(fp, path), block: SAMPLE_BLOCK };
    },
    async revocation(fp) {
      if (!(await isSample(fp))) return fallback.revocation(fp);
      return fp === (await fps).revoked ? { revokedOn: "2026-02-01" } : null;
    },
    async block(index) {
      if (index !== SAMPLE_BLOCK) return fallback.block(index);
      const f = await fps;
      const roots = await Promise.all([f.valid, f.revoked].map(async (fp) => ({ kind: "sample", sha256: await merkleParent(fp, SAMPLE_SIBLING) })));
      return { index: SAMPLE_BLOCK, hash: "0".repeat(64), timestamp: "2026-01-01T00:00:00+08:00", roots };
    },
    witness: (index) => (index === SAMPLE_BLOCK ? Promise.resolve(SAMPLE_WITNESS) : fallback.witness(index)),
    isPlaceholder: isSample,
  };
}
// ---- END PLACEHOLDER DATA ----
