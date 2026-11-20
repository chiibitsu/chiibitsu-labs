// /network/cert#<payload>: checks one certificate in the visitor's browser. Nothing from the link leaves the device
// except its fingerprint, which goes to the Aikiri Network ledger (raw.githubusercontent.com) to fetch the proof.
//
// The format is aikiri-network's docs/certificates.md (PR #22, at 562cf19), and lib/fixtures/cert_cohort.json is its
// golden vectors. npm run check:cert-logic runs every vector through this file. If the two ever disagree, the doc wins.
//
// Privacy:
// - The record (and so the holder's name) lives only in the URL fragment, which browsers never send to a server.
// - Nothing from the fragment goes to analytics, /api/verify-alert or any log. This file imports neither.
// - One link checks one certificate. There is no list, search or enumeration.

import { LEDGER_RAW, NotInLedger, loadBlock, loadWitness, sha256Hex, type Block, type Witness } from "@/lib/ledgerCheck";

export const RECORD_DOMAIN = "aikiri-ledger/cert-record/v1\n";
export const LEAF_DOMAIN = "aikiri-ledger/cert-leaf/v1\n";
export const NODE_DOMAIN = "aikiri-ledger/cert-node/v1\n";
export const ISSUER = "Chiibitsu Labs";
const MAX_PAYLOAD = 4096;
const MAX_PATH = 16;

// The issuer record, format v1. No venue field; host only when the certificate names one.
export type CertRecord = {
  v: 1;
  number: string; // 32 to 64 lowercase hex: 128 to 256 random bits, the salt
  holder: string;
  course: string;
  completed: string; // YYYY-MM-DD, shown exactly as written
  issuer: typeof ISSUER;
  instructor: string;
  host?: string;
};

// ledger/certs/<fingerprint>.json. A pointer, not evidence: the block it names decides.
export type CertProof = {
  v: 1;
  leaf: string; // the fingerprint
  path: { sha256: string; side: "left" | "right" }[];
  root: string;
  block: number | null;
};

// ledger/certs/revoked/<fingerprint>.json. Counts only if the block it names is a revocation of this fingerprint.
export type CertRevocation = { v: 1; fingerprint: string; block: number };

export type CertView =
  | { state: "valid"; record: CertRecord; fingerprint: string; block: number; sealedAt: string; witness: Witness; placeholder: boolean }
  | { state: "revoked"; record: CertRecord; revokedAt: string; placeholder: boolean }
  | { state: "not_found" } // a well-formed record that no sealed cohort holds (yet)
  | { state: "invalid" } // not a v1 record, or a proof that does not hold
  | { state: "error" }; // the ledger could not be read: says nothing either way

export interface CertLedger {
  proof(fingerprint: string): Promise<unknown>; // null when there is no file
  revocation(fingerprint: string): Promise<unknown>; // null when there is no file
  block(index: number): Promise<Block>; // throws NotInLedger when the block is not there
  witness(index: number): Promise<Witness>;
  isPlaceholder(fingerprint: string): Promise<boolean>;
}

const HEX64 = /^[0-9a-f]{64}$/;
const isObject = (v: unknown): v is Record<string, unknown> => !!v && typeof v === "object" && !Array.isArray(v);
const sameKeys = (o: Record<string, unknown>, keys: string[]) => {
  const k = Object.keys(o).sort();
  return k.length === keys.length && [...keys].sort().every((x, i) => x === k[i]);
};

// ---- The link payload ----

export function base64urlToBytes(s: string): Uint8Array<ArrayBuffer> | null {
  if (!/^[A-Za-z0-9_-]*$/.test(s) || s.length % 4 === 1) return null; // no "=" padding, nothing outside the alphabet
  try {
    const bin = atob(s.replace(/-/g, "+").replace(/_/g, "/") + "===".slice((s.length + 3) % 4));
    return Uint8Array.from(bin, (ch) => ch.charCodeAt(0));
  } catch {
    return null;
  }
}

export function bytesToBase64url(bytes: Uint8Array): string {
  let bin = "";
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

// Canonical bytes: keys sorted, no whitespace, UTF-8, only " and \ escaped. Given the record rules (no control
// characters, no lone surrogates), that is exactly JSON.stringify of the key-sorted object, through TextEncoder.
export function canonicalJson(record: Record<string, unknown>): string {
  return JSON.stringify(Object.fromEntries(Object.keys(record).sort().map((k) => [k, record[k]])));
}
export const canonicalBytes = (record: CertRecord) => new TextEncoder().encode(canonicalJson(record));

// A text field: 1 to 200 code points, already NFC, no control characters, no lone surrogates.
const LONE_SURROGATE = /[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?<![\uD800-\uDBFF])[\uDC00-\uDFFF]/;
const CONTROL = /[\u0000-\u001f\u007f]/;
const textField = (v: unknown): v is string =>
  typeof v === "string" && [...v].length >= 1 && [...v].length <= 200 && !CONTROL.test(v) && !LONE_SURROGATE.test(v) && v === v.normalize("NFC");

const realDate = (s: string) => {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s);
  if (!m) return false;
  const d = new Date(Date.UTC(+m[1], +m[2] - 1, +m[3]));
  return d.getUTCFullYear() === +m[1] && d.getUTCMonth() === +m[2] - 1 && d.getUTCDate() === +m[3];
};

// A v1 record, by the format's rules, issuer included.
export function isRecord(r: unknown): r is CertRecord {
  if (!isObject(r)) return false;
  const required = ["v", "number", "holder", "course", "completed", "issuer", "instructor"];
  if (!sameKeys(r, "host" in r ? [...required, "host"] : required)) return false;
  if (r.v !== 1) return false;
  if (typeof r.number !== "string" || !/^[0-9a-f]{32,64}$/.test(r.number)) return false;
  if (!["holder", "course", "instructor", "issuer"].every((k) => textField(r[k]))) return false;
  if ("host" in r && !textField(r.host)) return false;
  if (typeof r.completed !== "string" || !realDate(r.completed)) return false;
  return r.issuer === ISSUER;
}

// Decodes a link's payload. Refused (null) unless it is a v1 record AND re-encoding it gives back exactly the same
// bytes and the same payload: one valid payload per record.
export function decodePayload(fragment: string): { bytes: Uint8Array<ArrayBuffer>; record: CertRecord } | null {
  const payload = fragment.replace(/^#/, "");
  if (!payload || payload.length > MAX_PAYLOAD) return null;
  const bytes = base64urlToBytes(payload);
  if (!bytes || bytesToBase64url(bytes) !== payload) return null;
  let text: string;
  let parsed: unknown;
  try {
    text = new TextDecoder("utf-8", { fatal: true }).decode(bytes);
    parsed = JSON.parse(text);
  } catch {
    return null;
  }
  if (!isRecord(parsed) || canonicalJson(parsed) !== text) return null;
  return { bytes, record: parsed };
}

// ---- Fingerprint and Merkle tree (RFC 9162 shape, text domain prefixes) ----

const enc = new TextEncoder();
const hexToBytes = (h: string) => Uint8Array.from(h.match(/../g) ?? [], (b) => parseInt(b, 16));
const concat = (...parts: Uint8Array[]) => {
  const out = new Uint8Array(parts.reduce((n, p) => n + p.length, 0));
  let i = 0;
  for (const p of parts) { out.set(p, i); i += p.length; }
  return out;
};

export const fingerprintOf = (canonical: Uint8Array) => sha256Hex(concat(enc.encode(RECORD_DOMAIN), canonical).buffer);
export const leafHash = (fingerprint: string) => sha256Hex(concat(enc.encode(LEAF_DOMAIN), hexToBytes(fingerprint)).buffer);
export const nodeHash = (left: string, right: string) => sha256Hex(concat(enc.encode(NODE_DOMAIN), hexToBytes(left), hexToBytes(right)).buffer);

// From the leaf up: "left" means the sibling sits on the left, so the next hash is node(sibling, current).
export async function pathRoot(fingerprint: string, path: CertProof["path"]): Promise<string> {
  let h = await leafHash(fingerprint);
  for (const step of path) h = step.side === "left" ? await nodeHash(step.sha256, h) : await nodeHash(h, step.sha256);
  return h;
}

// Closed schema: exactly these five fields.
export function isProof(p: unknown): p is CertProof {
  if (!isObject(p) || !sameKeys(p, ["v", "leaf", "path", "root", "block"])) return false;
  if (p.v !== 1 || typeof p.leaf !== "string" || !HEX64.test(p.leaf) || typeof p.root !== "string" || !HEX64.test(p.root)) return false;
  if (!(p.block === null || (Number.isSafeInteger(p.block) && (p.block as number) >= 0))) return false;
  return Array.isArray(p.path) && p.path.length <= MAX_PATH &&
    p.path.every((s) => isObject(s) && sameKeys(s, ["sha256", "side"]) && typeof s.sha256 === "string" && HEX64.test(s.sha256) && (s.side === "left" || s.side === "right"));
}

const isRevocation = (r: unknown, fingerprint: string): r is CertRevocation =>
  isObject(r) && sameKeys(r, ["v", "fingerprint", "block"]) && r.v === 1 && r.fingerprint === fingerprint && Number.isSafeInteger(r.block) && (r.block as number) >= 0;

// A block's roots must be exactly this one root.
const rootsAre = (b: Block, kind: string, sha256: string) =>
  Array.isArray(b.roots) && b.roots.length === 1 && isObject(b.roots[0]) && sameKeys(b.roots[0], ["kind", "sha256"]) &&
  b.roots[0].kind === kind && b.roots[0].sha256 === sha256;

// ---- The check ----

export async function checkCertificate(fragment: string, ledger: CertLedger): Promise<CertView> {
  const decoded = decodePayload(fragment);
  if (!decoded) return { state: "invalid" };
  try {
    const fingerprint = await fingerprintOf(decoded.bytes);
    const proof = await ledger.proof(fingerprint);
    if (proof === null) return { state: "not_found" };
    // A proof that is not a proof, sits under another certificate's name, or does not lead to its root.
    if (!isProof(proof) || proof.leaf !== fingerprint) return { state: "invalid" };
    if ((await pathRoot(fingerprint, proof.path)) !== proof.root) return { state: "invalid" };
    // A proof is only a pointer. No block, or a block that seals anything else: not found.
    if (proof.block === null) return { state: "not_found" };
    const block = await ledger.block(proof.block);
    if (!rootsAre(block, "cert-cohort", proof.root)) return { state: "not_found" };

    const placeholder = await ledger.isPlaceholder(fingerprint);
    const revokedAt = await revokedTime(ledger, fingerprint);
    if (revokedAt) return { state: "revoked", record: decoded.record, revokedAt, placeholder };
    const witness = await ledger.witness(proof.block);
    return { state: "valid", record: decoded.record, fingerprint, block: proof.block, sealedAt: block.timestamp, witness, placeholder };
  } catch (e) {
    return e instanceof NotInLedger ? { state: "not_found" } : { state: "error" };
  }
}

// A revocation counts only once its block is on the ledger and revokes exactly this fingerprint. Until then the
// certificate is still valid: the revocation is only requested.
async function revokedTime(ledger: CertLedger, fingerprint: string): Promise<string | null> {
  const r = await ledger.revocation(fingerprint);
  if (!isRevocation(r, fingerprint)) return null;
  try {
    const b = await ledger.block(r.block);
    return rootsAre(b, "revocation", fingerprint) ? b.timestamp : null;
  } catch (e) {
    if (e instanceof NotInLedger) return null;
    throw e;
  }
}

// Block times are shown in Manila time. The blocks carry a +08:00 offset.
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
  try {
    return await r.json();
  } catch {
    return {}; // unreadable JSON is a file that is not a proof
  }
}

export const liveLedger: CertLedger = {
  proof: (fp) => getJsonOrNull(`${LEDGER_RAW}/certs/${fp}.json`),
  revocation: (fp) => getJsonOrNull(`${LEDGER_RAW}/certs/revoked/${fp}.json`),
  block: loadBlock,
  witness: loadWitness,
  isPlaceholder: async () => false,
};
