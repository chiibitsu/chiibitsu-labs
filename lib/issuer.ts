// The reveal protocol for /network/check. A public fingerprint says only that a file was sealed and when. Who it is
// between is answered by the file's issuer, and only to someone holding the original file:
//   1. the browser hashes the file: SHA-256(bytes), compared with the public fingerprint, nothing sent;
//   2. on a match only, it works out the reveal digest: SHA-256("chiibitsu-reveal\n" + bytes), never published;
//   3. it sends {sha256, reveal} to the issuer, which answers {kind, parties} only when reveal equals the stored one.
// Chiibitsu Labs is its own issuer: /api/issuer/seal stores the record at seal time, /api/issuer/reveal answers.
// No Node imports here: the page and the routes share this file, and scripts/check-issuer.mjs tests it.

export const REVEAL_PREFIX = "chiibitsu-reveal\n";
export const ISSUER_REVEAL_PATH = "/api/issuer/reveal";

export type IssuerRecord = { kind: string; parties: string[]; reveal: string };
export type RevealRequest = { sha256: string; reveal: string };
export type RevealAnswer = { match: true; kind: string; parties: string[] } | { match: false };
export type Reply = { status: number; body: unknown };

export interface RecordStore {
  get(sha256: string): Promise<IssuerRecord | null>;
  // Writes only when nothing is stored under sha256; returns false when something already is.
  putNew(sha256: string, record: IssuerRecord): Promise<boolean>;
}

const HEX64 = /^[0-9a-f]{64}$/;
const CONTROL = /[\u0000-\u001f\u007f\u2028\u2029]/;
const isHex64 = (s: unknown): s is string => typeof s === "string" && HEX64.test(s);
const cleanText = (s: unknown, max: number): string | null =>
  typeof s === "string" && !CONTROL.test(s) && s.trim().length > 0 && s.trim().length <= max ? s.trim() : null;

const hex = (buf: ArrayBuffer) => Array.from(new Uint8Array(buf), (b) => b.toString(16).padStart(2, "0")).join("");

export async function sha256Bytes(bytes: Uint8Array<ArrayBuffer>): Promise<string> {
  return hex(await crypto.subtle.digest("SHA-256", bytes));
}

// The second fingerprint. Never shown, never logged, never written to the ledger.
export async function revealDigest(bytes: Uint8Array<ArrayBuffer>): Promise<string> {
  const prefix = new TextEncoder().encode(REVEAL_PREFIX);
  const all = new Uint8Array(prefix.length + bytes.length);
  all.set(prefix);
  all.set(bytes, prefix.length);
  return sha256Bytes(all);
}

// What the page sends, or null when it must send nothing: no file (a pasted hash or a link), or a file that is not the one sealed.
export async function revealRequestFor(file: Uint8Array<ArrayBuffer> | null, publicHash: string): Promise<RevealRequest | null> {
  if (!file || !isHex64(publicHash)) return null;
  if ((await sha256Bytes(file)) !== publicHash) return null;
  return { sha256: publicHash, reveal: await revealDigest(file) };
}

// Same length, every character compared, so the time taken does not say how much of a digest was right.
export function sameHex(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

export function parseRevealRequest(body: unknown): RevealRequest | null {
  if (!body || typeof body !== "object") return null;
  const { sha256, reveal } = body as Record<string, unknown>;
  return isHex64(sha256) && isHex64(reveal) ? { sha256, reveal } : null;
}

// The seal-time record. reveal must differ from sha256: the public fingerprint must never unlock anything.
export function parseSealRecord(body: unknown): ({ sha256: string } & IssuerRecord) | null {
  if (!body || typeof body !== "object") return null;
  const { sha256, kind, parties, reveal } = body as Record<string, unknown>;
  if (!isHex64(sha256) || !isHex64(reveal) || sha256 === reveal) return null;
  const k = cleanText(kind, 80);
  if (!k || !Array.isArray(parties) || parties.length < 2 || parties.length > 10) return null;
  const ps = parties.map((p) => cleanText(p, 120));
  if (ps.some((p) => p === null)) return null;
  return { sha256, kind: k, parties: ps as string[], reveal };
}

const NO: RevealAnswer = { match: false };

// POST /api/issuer/reveal. A wrong digest, an unknown fingerprint and the public fingerprint sent as the digest all get the same answer.
export async function handleReveal(body: unknown, store: RecordStore | null): Promise<Reply> {
  const req = parseRevealRequest(body);
  if (!req) return { status: 400, body: { error: "Send {sha256, reveal}, each 64 lowercase hex characters." } };
  if (!store) return { status: 503, body: { error: "The issuer is not set up." } };
  const rec = await store.get(req.sha256);
  if (!rec || req.reveal === req.sha256 || !sameHex(req.reveal, rec.reveal)) return { status: 200, body: NO };
  const answer: RevealAnswer = { match: true, kind: rec.kind, parties: rec.parties };
  return { status: 200, body: answer };
}

// Both sides hashed first, so the comparison is always 64 characters and says nothing about the secret's length.
async function sameSecret(given: string, secret: string): Promise<boolean> {
  const h = (s: string) => sha256Bytes(new TextEncoder().encode(s));
  return sameHex(await h(given), await h(secret));
}

// PUT /api/issuer/seal, bearer ISSUER_SEAL_SECRET. Write-once: the same record again is fine, a different one is refused.
export async function handleSeal(auth: string | null, body: unknown, secret: string | undefined, store: RecordStore | null): Promise<Reply> {
  const given = /^Bearer (.+)$/i.exec(auth ?? "")?.[1];
  if (!secret || !given || !(await sameSecret(given, secret))) return { status: 401, body: { error: "no" } };
  if (!store) return { status: 503, body: { error: "The issuer is not set up." } };
  const r = parseSealRecord(body);
  if (!r) return { status: 400, body: { error: "Send {sha256, kind, parties, reveal}: two hex digests that differ, a kind, and 2 to 10 parties." } };
  const record: IssuerRecord = { kind: r.kind, parties: r.parties, reveal: r.reveal };
  if (await store.putNew(r.sha256, record)) return { status: 201, body: { stored: true } };
  const had = await store.get(r.sha256);
  const same = !!had && had.kind === record.kind && had.reveal === record.reveal && JSON.stringify(had.parties) === JSON.stringify(record.parties);
  return same ? { status: 200, body: { stored: true, already: true } } : { status: 409, body: { error: "A different record is already stored for this fingerprint." } };
}

export function memoryStore(): RecordStore {
  const m = new Map<string, IssuerRecord>();
  return {
    async get(sha256) { return m.get(sha256) ?? null; },
    async putNew(sha256, record) { if (m.has(sha256)) return false; m.set(sha256, record); return true; },
  };
}

// Upstash Redis over its REST API, which takes a command as a JSON array. Server-side only: the token never reaches a browser.
export function restStore(url: string | undefined, token: string | undefined, doFetch: typeof fetch = fetch): RecordStore | null {
  if (!url || !token) return null;
  const run = async (cmd: string[]): Promise<unknown> => {
    const r = await doFetch(url, { method: "POST", headers: { authorization: `Bearer ${token}`, "content-type": "application/json" }, body: JSON.stringify(cmd), cache: "no-store" });
    if (!r.ok) throw new Error(`store ${r.status}`);
    return ((await r.json()) as { result?: unknown }).result ?? null;
  };
  const key = (sha256: string) => `issuer:record:${sha256}`;
  return {
    async get(sha256) {
      const v = await run(["GET", key(sha256)]);
      if (typeof v !== "string") return null;
      let r: unknown = null;
      try { r = JSON.parse(v); } catch { return null; }
      // A damaged record reveals nothing rather than failing the request.
      const ok = parseSealRecord({ sha256, ...(r as object) });
      return ok ? { kind: ok.kind, parties: ok.parties, reveal: ok.reveal } : null;
    },
    async putNew(sha256, record) {
      return (await run(["SET", key(sha256), JSON.stringify(record), "NX"])) === "OK";
    },
  };
}

// The sentence the page shows on a match: "It is the Blueprint Agreement between Chiibitsu Labs and Client Co."
export function describeReveal(a: { kind: string; parties: string[] }): string {
  const ps = a.parties;
  const list = ps.length > 1 ? `${ps.slice(0, -1).join(", ")} and ${ps[ps.length - 1]}` : ps.join("");
  return `It is the ${a.kind} between ${list}.`;
}
