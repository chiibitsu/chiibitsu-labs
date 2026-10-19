// Gate: the reveal protocol on /network/check. A hash alone reveals no party; the original file does; a wrong file and
// the public hash sent as the reveal digest both reveal nothing; the seal-time record is guarded and written once.
// Runs the TypeScript directly (Node strips the types). Test names only, never a real client.
import { createHash } from "node:crypto";
import {
  describeReveal, handleReveal, handleSeal, memoryStore, restStore, revealDigest, revealRequestFor, sameHex, REVEAL_PREFIX,
} from "../lib/issuer.ts";

const problems = [];
const enc = new TextEncoder();
const sha = (b) => createHash("sha256").update(b).digest("hex");

const original = enc.encode("%PDF-1.7 Blueprint Agreement, test copy\n");
const resaved = enc.encode("%PDF-1.7 Blueprint Agreement, test copy \n"); // one byte different: a re-saved or rescanned copy
const publicHash = sha(original);
const secretReveal = sha(Buffer.concat([Buffer.from(REVEAL_PREFIX), Buffer.from(original)]));
const SECRET = "test-seal-secret-not-real";
const record = { sha256: publicHash, kind: "Blueprint Agreement", parties: ["Chiibitsu Labs", "Test Client Co"], reveal: secretReveal };

const store = memoryStore();
const sealed = await handleSeal(`Bearer ${SECRET}`, record, SECRET, store);
if (sealed.status !== 201) problems.push(`seal: wanted 201, got ${sealed.status}`);

const hasParty = (body) => JSON.stringify(body ?? null).includes("Test Client Co") || JSON.stringify(body ?? null).includes("parties");

// The browser's second fingerprint is the documented one.
if ((await revealDigest(original)) !== secretReveal) problems.push("revealDigest is not SHA-256(prefix + bytes)");

// 1. Hash only: the page builds no reveal request, and the issuer gives nothing for a hash alone.
if ((await revealRequestFor(null, publicHash)) !== null) problems.push("hash only: the page would ask the issuer without a file");
for (const body of [{ sha256: publicHash }, { sha256: publicHash, reveal: "" }, null, "x"]) {
  const r = await handleReveal(body, store);
  if (r.status !== 400 || hasParty(r.body)) problems.push(`hash only: ${JSON.stringify(body)} got ${r.status} ${JSON.stringify(r.body)}`);
}

// 2. The original file reveals the parties and the kind.
{
  const req = await revealRequestFor(original, publicHash);
  if (!req || req.reveal !== secretReveal) problems.push("original: no reveal request built");
  const r = await handleReveal(req, store);
  if (r.status !== 200 || !r.body.match || r.body.kind !== "Blueprint Agreement" || r.body.parties.join("|") !== "Chiibitsu Labs|Test Client Co") problems.push(`original: got ${JSON.stringify(r.body)}`);
  if ("reveal" in (r.body ?? {})) problems.push("original: the answer echoes the stored digest");
  if (describeReveal(r.body) !== "It is the Blueprint Agreement between Chiibitsu Labs and Test Client Co.") problems.push(`sentence wrong: ${describeReveal(r.body)}`);
}

// 3. A wrong file: the page sends nothing, and its digest sent anyway reveals nothing.
{
  if ((await revealRequestFor(resaved, publicHash)) !== null) problems.push("wrong file: the page would ask the issuer");
  const r = await handleReveal({ sha256: publicHash, reveal: await revealDigest(resaved) }, store);
  if (r.status !== 200 || r.body.match !== false || hasParty(r.body)) problems.push(`wrong file: got ${JSON.stringify(r.body)}`);
}

// 4. The public hash sent as the reveal digest reveals nothing, and can never be stored as one.
{
  const r = await handleReveal({ sha256: publicHash, reveal: publicHash }, store);
  if (r.status !== 200 || r.body.match !== false || hasParty(r.body)) problems.push(`public hash as reveal: got ${JSON.stringify(r.body)}`);
  const s = await handleSeal(`Bearer ${SECRET}`, { ...record, sha256: "b".repeat(64), reveal: "b".repeat(64) }, SECRET, memoryStore());
  if (s.status !== 400) problems.push(`seal accepted reveal equal to the public hash: ${s.status}`);
}

// An unknown fingerprint answers exactly like a wrong digest.
{
  const r = await handleReveal({ sha256: "c".repeat(64), reveal: secretReveal }, store);
  if (JSON.stringify(r.body) !== JSON.stringify({ match: false })) problems.push(`unknown fingerprint: got ${JSON.stringify(r.body)}`);
}

// The seal-time write: bearer required, fields validated, written once.
{
  if ((await handleSeal(null, record, SECRET, memoryStore())).status !== 401) problems.push("seal without a bearer was not refused");
  if ((await handleSeal("Bearer wrong", record, SECRET, memoryStore())).status !== 401) problems.push("seal with a wrong bearer was not refused");
  if ((await handleSeal(`Bearer ${SECRET}`, record, undefined, memoryStore())).status !== 401) problems.push("seal with no secret configured was not refused");
  if ((await handleSeal(`Bearer ${SECRET}`, record, SECRET, null)).status !== 503) problems.push("seal with no store did not say so");
  for (const bad of [{ ...record, parties: ["Only One"] }, { ...record, kind: "" }, { ...record, kind: "x\ny" }, { ...record, parties: ["A", "B\u2028C"] }, { ...record, reveal: "XYZ" }]) {
    if ((await handleSeal(`Bearer ${SECRET}`, bad, SECRET, memoryStore())).status !== 400) problems.push(`seal accepted ${JSON.stringify(bad).slice(0, 80)}`);
  }
  const again = await handleSeal(`Bearer ${SECRET}`, record, SECRET, store);
  if (again.status !== 200 || !again.body.already) problems.push(`same record twice: got ${again.status}`);
  const changed = await handleSeal(`Bearer ${SECRET}`, { ...record, parties: ["Chiibitsu Labs", "Someone Else"] }, SECRET, store);
  if (changed.status !== 409) problems.push(`a different record over a sealed one: got ${changed.status}`);
  if ((await handleReveal({ sha256: publicHash, reveal: secretReveal }, null)).status !== 503) problems.push("reveal with no store did not say so");
}

if (!sameHex("ab", "ab") || sameHex("ab", "ac") || sameHex("ab", "abc")) problems.push("sameHex wrong");

// The REST store speaks the Upstash command shape and keeps the token server-side.
{
  const calls = [];
  const db = new Map();
  const fake = async (url, init) => {
    const cmd = JSON.parse(init.body);
    calls.push({ url, auth: init.headers.authorization, cmd });
    let result = null;
    if (cmd[0] === "GET") result = db.get(cmd[1]) ?? null;
    if (cmd[0] === "SET") result = db.has(cmd[1]) && cmd[3] === "NX" ? null : (db.set(cmd[1], cmd[2]), "OK");
    return { ok: true, json: async () => ({ result }) };
  };
  if (restStore(undefined, "t") !== null || restStore("https://x", undefined) !== null) problems.push("rest store should be off without both settings");
  const rs = restStore("https://store.example", "token-not-real", fake);
  const w1 = await rs.putNew(publicHash, { kind: "K", parties: ["A", "B"], reveal: secretReveal });
  const w2 = await rs.putNew(publicHash, { kind: "K2", parties: ["A", "B"], reveal: secretReveal });
  const got = await rs.get(publicHash);
  if (!w1 || w2 || got?.kind !== "K") problems.push("rest store: write-once or read wrong");
  if (calls[0].url !== "https://store.example" || calls[0].auth !== "Bearer token-not-real" || calls[0].cmd[0] !== "SET" || calls[0].cmd[3] !== "NX") problems.push(`rest store request shape wrong: ${JSON.stringify(calls[0])}`);
  if ((await rs.get("d".repeat(64))) !== null) problems.push("rest store: unknown key not null");
}

if (problems.length) {
  console.error(`issuer check failed:\n  ${problems.join("\n  ")}`);
  process.exit(1);
}
console.log("issuer ok: hash only reveals nothing, the original reveals the parties, a wrong file and the public hash reveal nothing, seal is guarded and write-once");
