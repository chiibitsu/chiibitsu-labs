// /network/cert#<payload>: checks one certificate in the visitor's browser. Nothing from the link leaves the device
// except its fingerprint, which goes to the Aikiri Network ledger (raw.githubusercontent.com) to fetch the proof.
//
// The format follows the Network PM's answers (2026-11-20). The final word is docs/certificates.md in aikiri-network
// with its golden vectors (story 1). Two values are not known yet and are marked PENDING: the fingerprint's domain
// prefix and the cohort root's kind. Until they are set, no real certificate can match, so the page fails closed:
// every real link reads "No certificate in this link." Set them from the docs, then run the vectors.
//
// Privacy, whatever the format:
// - The record (and so the holder's name) lives only in the URL fragment, which browsers never send to a server.
// - Nothing from the fragment goes to analytics, /api/verify-alert or any log. This file imports neither.
// - One link checks one certificate. There is no list, search or enumeration.

import { LEDGER_RAW, NotInLedger, loadBlock, loadWitness, sha256Hex, type Block, type Witness } from "@/lib/ledgerCheck";

// PENDING docs/certificates.md: fingerprint = SHA-256(FINGERPRINT_PREFIX ‖ canonical bytes).
export const FINGERPRINT_PREFIX = "PENDING:docs/certificates.md:fingerprint-prefix";
// PENDING docs/certificates.md: the kind of a cohort block's roots[0].
export const COHORT_KIND = "PENDING:docs/certificates.md:cohort-kind";
export const ISSUER = "Chiibitsu Labs";

// The issuer record. No venue field; host is an optional generic label, shown only when the link carries it.
export type CertRecord = {
  v: number;
  number: string; // random, at least 128 bits
  holder: string;
  course: string;
  completed: string; // YYYY-MM-DD, shown as is
  issuer: string;
  instructor: string;
  host?: string;
};

// ledger/certs/<fingerprint>.json
export type CertProof = {
  v: number;
  leaf: string;
  path: { side: "L" | "R"; hash: string }[]; // each sibling, and the side it sits on
  root: string;
  block: number;
};

// ledger/certs/revoked/<fingerprint>.json. The revocation is sealed in its own block; its time is that block's.
export type CertRevocation = { v: number; fingerprint: string; block: number };

export type CertView =
  | { state: "valid"; record: CertRecord; fingerprint: string; block: number; sealedAt: string; witness: Witness; placeholder: boolean }
  | { state: "revoked"; record: CertRecord; revokedAt: string; placeholder: boolean }
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
const FIELDS = ["completed", "course", "holder", "host", "instructor", "issuer", "number", "v"];

// ---- Decoding the link ----

export function base64urlToBytes(s: string): Uint8Array<ArrayBuffer> | null {
  // Unpadded base64url only: no "=", no "+" or "/".
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

// Canonical form: sorted keys, no whitespace, UTF-8, NFC strings, integers only (no floats).
// Escaping is JSON.stringify's; the golden vectors confirm or correct it.
export function canonicalJson(value: unknown): string {
  if (typeof value === "string") return JSON.stringify(value);
  if (typeof value === "number") {
    if (!Number.isSafeInteger(value)) throw new Error("not an integer");
    return String(value);
  }
  if (value && typeof value === "object" && !Array.isArray(value)) {
    const o = value as Record<string, unknown>;
    return `{${Object.keys(o).sort().map((k) => `${JSON.stringify(k)}:${canonicalJson(o[k])}`).join(",")}}`;
  }
  throw new Error("unsupported value");
}
export const canonicalBytes = (r: CertRecord) => new TextEncoder().encode(canonicalJson(r));

const text = (v: unknown, max = 200): v is string =>
  typeof v === "string" && v.trim().length > 0 && v.length <= max && v === v.normalize("NFC") && !/[\u0000-\u001f\u007f]/.test(v);

// Decodes a payload, and rejects it unless its bytes are already canonical: a re-encoded or edited link is not
// the record that was sealed, even if it says the same thing.
export function decodePayload(fragment: string): { bytes: Uint8Array<ArrayBuffer>; record: CertRecord } | null {
  const raw = fragment.replace(/^#/, "");
  if (!raw || raw.length > MAX_FRAGMENT) return null;
  const bytes = base64urlToBytes(raw);
  if (!bytes) return null;
  let r: Record<string, unknown>;
  let str: string;
  try {
    str = new TextDecoder("utf-8", { fatal: true }).decode(bytes);
    r = JSON.parse(str);
  } catch {
    return null;
  }
  if (!r || typeof r !== "object" || Array.isArray(r)) return null;
  if (Object.keys(r).some((k) => !FIELDS.includes(k))) return null;
  if (!Number.isSafeInteger(r.v)) return null;
  if (typeof r.number !== "string" || !/^[A-Za-z0-9_-]{22,128}$/.test(r.number)) return null; // 22 base64url characters = 132 bits
  for (const k of ["holder", "course", "issuer", "instructor"]) if (!text(r[k])) return null;
  if (typeof r.completed !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(r.completed)) return null;
  if ("host" in r && !text(r.host)) return null;
  try {
    if (canonicalJson(r) !== str) return null;
  } catch {
    return null;
  }
  return { bytes, record: r as unknown as CertRecord };
}

// ---- Fingerprint and Merkle path (RFC 6962 style) ----

const hexToBytes = (h: string) => Uint8Array.from(h.match(/../g) ?? [], (b) => parseInt(b, 16));
const concat = (...parts: Uint8Array[]) => {
  const out = new Uint8Array(parts.reduce((n, p) => n + p.length, 0));
  let i = 0;
  for (const p of parts) { out.set(p, i); i += p.length; }
  return out;
};

export const fingerprintOf = (bytes: Uint8Array) => sha256Hex(concat(new TextEncoder().encode(FINGERPRINT_PREFIX), bytes).buffer);
// PENDING docs/certificates.md: what goes after 0x00. Taken here to be the fingerprint's 32 raw bytes.
export const leafHash = (fingerprint: string) => sha256Hex(concat(Uint8Array.of(0), hexToBytes(fingerprint)).buffer);
export const nodeHash = (left: string, right: string) => sha256Hex(concat(Uint8Array.of(1), hexToBytes(left), hexToBytes(right)).buffer);

export async function pathRoot(leaf: string, path: CertProof["path"]): Promise<string> {
  let h = leaf;
  for (const step of path) h = step.side === "L" ? await nodeHash(step.hash, h) : await nodeHash(h, step.hash);
  return h;
}

const validProof = (p: unknown): p is CertProof => {
  const q = p as CertProof;
  return !!q && Number.isSafeInteger(q.v) && Number.isInteger(q.block) && q.block >= 0 && HEX64.test(q.leaf) && HEX64.test(q.root) &&
    Array.isArray(q.path) && q.path.length <= 64 && q.path.every((s) => (s?.side === "L" || s?.side === "R") && HEX64.test(s.hash));
};
const validRevocation = (r: unknown, fingerprint: string): r is CertRevocation => {
  const q = r as CertRevocation;
  return !!q && Number.isSafeInteger(q.v) && q.fingerprint === fingerprint && Number.isInteger(q.block) && q.block >= 0;
};

// The cohort block's first root must be this root, of the cohort kind.
const cohortHolds = (b: Block, root: string) => b.roots?.[0]?.sha256 === root && b.roots[0].kind === COHORT_KIND;

// ---- The check ----

export async function checkCertificate(fragment: string, ledger: CertLedger): Promise<CertView> {
  const decoded = decodePayload(fragment);
  if (!decoded || decoded.record.issuer !== ISSUER) return { state: "not_found" };
  try {
    const fingerprint = await fingerprintOf(decoded.bytes);
    const [proof, revocation] = await Promise.all([ledger.proof(fingerprint), ledger.revocation(fingerprint)]);
    if (!validProof(proof)) return { state: "not_found" };
    const leaf = await leafHash(fingerprint);
    if (proof.leaf !== leaf) return { state: "not_found" };
    const [block, root] = await Promise.all([ledger.block(proof.block), pathRoot(leaf, proof.path)]);
    if (root !== proof.root || !cohortHolds(block, root)) return { state: "not_found" };
    const placeholder = await ledger.isPlaceholder(fingerprint);
    if (revocation) {
      // A revocation file that does not name this certificate is a broken ledger, not a verdict.
      if (!validRevocation(revocation, fingerprint)) return { state: "error" };
      const revokedIn = await ledger.block(revocation.block);
      return { state: "revoked", record: decoded.record, revokedAt: revokedIn.timestamp, placeholder };
    }
    const witness = await ledger.witness(block.index);
    return { state: "valid", record: decoded.record, fingerprint, block: block.index, sealedAt: block.timestamp, witness, placeholder };
  } catch (e) {
    // A proof naming a block that does not exist is a proof that does not reach the ledger: not found.
    return e instanceof NotInLedger ? { state: "not_found" } : { state: "error" };
  }
}

// Sealed and revoked times come from block timestamps, shown in Manila time.
export function manilaTime(timestamp: string): string {
  const d = new Date(timestamp.replace(/\.\d+/, ""));
  if (Number.isNaN(d.getTime())) return timestamp;
  const p = Object.fromEntries(
    new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Manila", year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", hourCycle: "h23" })
      .formatToParts(d).map((x) => [x.type, x.value]),
  );
  return `${p.year}-${p.month}-${p.day} ${p.hour}:${p.minute} Manila time`;
}
export const manilaDate = (timestamp: string) => manilaTime(timestamp).slice(0, 10);

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
// One sample cohort of two certificates with obviously fake names, built with the same hashing the check uses,
// so a sample runs the whole check. Remove when the golden vectors land.

export const SAMPLE_RECORDS: Record<"valid" | "revoked", CertRecord> = {
  valid: {
    v: 1,
    number: "SAMPLE-VALID-000000000000",
    holder: "Sample Participant",
    course: "Sample Course",
    completed: "2026-01-01",
    issuer: ISSUER,
    instructor: "Sample Instructor",
    host: "Example Host",
  },
  revoked: {
    v: 1,
    number: "SAMPLE-REVOKED-0000000000",
    holder: "Sample Participant",
    course: "Sample Course",
    completed: "2026-01-01",
    issuer: ISSUER,
    instructor: "Sample Instructor",
  },
};

export const samplePayload = (r: CertRecord) => bytesToBase64url(canonicalBytes(r));

const SAMPLE_COHORT_BLOCK = 999998; // not real blocks
const SAMPLE_REVOKE_BLOCK = 999999;
const SAMPLE_WITNESS: Witness = {
  base: { tx: null, note: "Placeholder: no Base transaction. The real one comes from the ledger." },
  bitcoin: { state: "none", heights: [] },
};

async function sampleCohort() {
  const fpV = await fingerprintOf(canonicalBytes(SAMPLE_RECORDS.valid));
  const fpR = await fingerprintOf(canonicalBytes(SAMPLE_RECORDS.revoked));
  const leafV = await leafHash(fpV);
  const leafR = await leafHash(fpR);
  return { fpV, fpR, leafV, leafR, root: await nodeHash(leafV, leafR) };
}

export function placeholderLedger(fallback: CertLedger): CertLedger {
  const cohort = sampleCohort();
  const isSample = async (fp: string) => { const c = await cohort; return fp === c.fpV || fp === c.fpR; };
  return {
    async proof(fp) {
      if (!(await isSample(fp))) return fallback.proof(fp);
      const c = await cohort;
      const mine = fp === c.fpV;
      return {
        v: 1,
        leaf: mine ? c.leafV : c.leafR,
        path: [mine ? { side: "R", hash: c.leafR } : { side: "L", hash: c.leafV }],
        root: c.root,
        block: SAMPLE_COHORT_BLOCK,
      };
    },
    async revocation(fp) {
      if (!(await isSample(fp))) return fallback.revocation(fp);
      return fp === (await cohort).fpR ? { v: 1, fingerprint: fp, block: SAMPLE_REVOKE_BLOCK } : null;
    },
    async block(index) {
      if (index === SAMPLE_COHORT_BLOCK) {
        return { index, hash: "0".repeat(64), timestamp: "2026-01-01T00:00:00+08:00", roots: [{ kind: COHORT_KIND, sha256: (await cohort).root }] };
      }
      if (index === SAMPLE_REVOKE_BLOCK) return { index, hash: "0".repeat(64), timestamp: "2026-02-01T09:30:00+08:00", roots: [] };
      return fallback.block(index);
    },
    witness: (index) => (index === SAMPLE_COHORT_BLOCK ? Promise.resolve(SAMPLE_WITNESS) : fallback.witness(index)),
    isPlaceholder: isSample,
  };
}
// ---- END PLACEHOLDER DATA ----
