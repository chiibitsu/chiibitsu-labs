// Gate: the certificate check against aikiri-network's golden vectors (lib/fixtures/cert_cohort.json, copied from
// PR #22 at 562cf19), plus reject cases built from those vectors' own records. Every value is fake.
// Runs the TypeScript directly (Node strips the types; scripts/ts-alias.mjs maps "@/").
import fs from "node:fs";
import {
  bytesToBase64url, canonicalJson, checkCertificate, decodePayload, fingerprintOf, isProof, leafHash, pathRoot,
} from "../lib/certCheck.ts";
import { NotInLedger } from "../lib/ledgerCheck.ts";

const V = JSON.parse(fs.readFileSync(new URL("../lib/fixtures/cert_cohort.json", import.meta.url), "utf8"));
const R = V.records;
const problems = [];
let checks = 0;
const expect = (name, got, want) => {
  checks++;
  if (JSON.stringify(got) !== JSON.stringify(want)) problems.push(`${name}: got ${JSON.stringify(got)}, want ${JSON.stringify(want)}`);
};
const hex = (b) => Buffer.from(b).toString("hex");
const enc = new TextEncoder();
const b64 = (s) => bytesToBase64url(enc.encode(s));

// 1. The Merkle tree: leaf hashes and every proof of the 1- to 5-leaf cohorts.
for (const [name, fp] of Object.entries(V.inputs)) expect(`leaf(${name})`, await leafHash(fp), V.leaf_hashes[fp]);
for (const c of V.cohorts) for (const p of c.proofs) expect(`cohort of ${c.size}: proof for ${p.leaf.slice(0, 8)}`, await pathRoot(p.leaf, p.path), c.root);

// 2. The records: canonical bytes, fingerprint, payload, and decoding back.
for (const e of R.examples) {
  const tag = e.fingerprint.slice(0, 8);
  expect(`${tag} canonical`, canonicalJson(e.record), e.canonical);
  expect(`${tag} canonical hex`, hex(enc.encode(canonicalJson(e.record))), e.canonical_utf8_hex);
  expect(`${tag} fingerprint`, await fingerprintOf(enc.encode(e.canonical)), e.fingerprint);
  expect(`${tag} payload`, b64(e.canonical), e.payload);
  expect(`${tag} decodes`, decodePayload(`#${e.payload}`)?.record, e.record);
}
for (const c of R.cohorts) for (const p of c.proofs) {
  expect(`record cohort ${c.block}: proof schema`, isProof(p), true);
  expect(`record cohort ${c.block}: proof for ${p.leaf.slice(0, 8)}`, await pathRoot(p.leaf, p.path), c.root);
}

// 3. The verdicts, against the vectors' own blocks and revocation.
const three = R.cohorts.find((c) => c.size === 3);
const vectorLedger = (over = {}) => ({
  proof: async (fp) => (fp in (over.proofs ?? {}) ? over.proofs[fp] : three.proofs.find((p) => p.leaf === fp) ?? null),
  revocation: async (fp) => (over.revoked ?? R.revoked_files)[fp] ?? null,
  block: async (i) => {
    const b = (over.blocks ?? R.blocks).find((x) => x.index === i);
    if (!b) throw new NotInLedger("404");
    return b;
  },
  witness: async () => ({ base: { tx: null, note: "" }, bitcoin: { state: "none", heights: [] } }),
  isPlaceholder: async () => false,
});
const payloadOf = (fp) => R.examples.find((e) => e.fingerprint === fp).payload;
for (const [fp, want] of Object.entries(R.expected_with_3_leaf_cohort)) {
  expect(`verdict ${fp.slice(0, 8)}`, (await checkCertificate(`#${payloadOf(fp)}`, vectorLedger())).state, want.toLowerCase().replace(" ", "_"));
}
const [ok, rev] = [R.examples[0], R.examples[1]];
const revoked = await checkCertificate(`#${rev.payload}`, vectorLedger());
expect("revoked time is the revocation block's", revoked.revokedAt, R.blocks.find((b) => b.index === 13).timestamp);
const valid = await checkCertificate(`#${ok.payload}`, vectorLedger());
expect("valid sealed time is the cohort block's", valid.sealedAt, R.blocks.find((b) => b.index === 12).timestamp);

// 4. Payloads that must be INVALID.
const state = async (frag, ledger = vectorLedger()) => (await checkCertificate(frag, ledger)).state;
const recordPayload = (r) => b64(JSON.stringify(Object.fromEntries(Object.keys(r).sort().map((k) => [k, r[k]]))));
const third = R.examples[2];
const invalid = {
  "empty link": "",
  "padding": `${ok.payload}=`,
  "outside the alphabet": ok.payload.replace(/.$/, "+"),
  "non-canonical base64 (spare bits)": ok.payload.slice(0, -1) + String.fromCharCode(ok.payload.at(-1).charCodeAt(0) + 1),
  "over 4,096 characters": "A".repeat(4100),
  "not JSON": b64("not json"),
  "pretty-printed": b64(JSON.stringify(ok.record, null, 1)),
  "keys unsorted": b64(JSON.stringify({ v: 1, ...ok.record })),
  "non-ASCII escaped as \\u": b64(third.canonical.replace("ë", "\\u00eb")),
  "v as 1.0": b64(ok.canonical.replace('"v":1', '"v":1.0')),
  "v as 2": recordPayload({ ...ok.record, v: 2 }),
  "non-NFC holder": recordPayload({ ...third.record, holder: third.record.holder.normalize("NFD") }),
  "another issuer": recordPayload({ ...ok.record, issuer: "Someone Else" }),
  "a venue field": recordPayload({ ...ok.record, venue: "Example Venue" }),
  "empty host": recordPayload({ ...ok.record, host: "" }),
  "number in capitals": recordPayload({ ...ok.record, number: ok.record.number.toUpperCase() }),
  "number too short": recordPayload({ ...ok.record, number: "00112233" }),
  "not a real date": recordPayload({ ...ok.record, completed: "2026-02-30" }),
  "control character": recordPayload({ ...ok.record, holder: "Test\u0007Holder" }),
  "lone surrogate": b64(ok.canonical.replace("Test Holder", "Test \\ud800Holder")),
  "201 code points": recordPayload({ ...ok.record, course: "x".repeat(201) }),
  "duplicate key": b64(ok.canonical.replace('"v":1}', '"v":1,"v":1}')),
};
for (const [name, frag] of Object.entries(invalid)) expect(`INVALID: ${name}`, await state(frag ? `#${frag}` : ""), "invalid");
expect("200 code points of emoji is fine", decodePayload(`#${recordPayload({ ...ok.record, course: "🎓".repeat(200) })}`) !== null, true);

// 5. The ledger side: pointers are not evidence.
const fpOk = ok.fingerprint;
const proofOk = three.proofs.find((p) => p.leaf === fpOk);
const otherFp = R.examples[2].fingerprint;
expect("no proof file: NOT FOUND", await state(`#${b64(canonicalJson({ ...ok.record, number: "ab".repeat(16) }))}`), "not_found");
expect("proof with block null: NOT FOUND", await state(`#${ok.payload}`, vectorLedger({ proofs: { [fpOk]: { ...proofOk, block: null } } })), "not_found");
expect("proof naming a missing block: NOT FOUND", await state(`#${ok.payload}`, vectorLedger({ proofs: { [fpOk]: { ...proofOk, block: 99 } } })), "not_found");
expect("proof naming a block that seals something else: NOT FOUND", await state(`#${ok.payload}`, vectorLedger({ proofs: { [fpOk]: { ...proofOk, block: 10 } } })), "not_found");
expect("block with an extra root: NOT FOUND", await state(`#${ok.payload}`, vectorLedger({
  blocks: R.blocks.map((b) => (b.index === 12 ? { ...b, roots: [...b.roots, { kind: "cert-cohort", sha256: "0".repeat(64) }] } : b)),
})), "not_found");
expect("proof under another certificate's name: INVALID", await state(`#${ok.payload}`, vectorLedger({ proofs: { [fpOk]: three.proofs.find((p) => p.leaf === otherFp) } })), "invalid");
expect("tampered path: INVALID", await state(`#${ok.payload}`, vectorLedger({
  proofs: { [fpOk]: { ...proofOk, path: proofOk.path.map((s, i) => (i ? s : { ...s, side: s.side === "left" ? "right" : "left" })) } },
})), "invalid");
expect("proof with an extra field: INVALID", await state(`#${ok.payload}`, vectorLedger({ proofs: { [fpOk]: { ...proofOk, note: "x" } } })), "invalid");
expect("revocation whose block is not there yet: still VALID", await state(`#${rev.payload}`, vectorLedger({ revoked: { [rev.fingerprint]: { ...R.revoked_files[rev.fingerprint], block: 14 } } })), "valid");
expect("revocation pointing at a cohort block: still VALID", await state(`#${rev.payload}`, vectorLedger({ revoked: { [rev.fingerprint]: { ...R.revoked_files[rev.fingerprint], block: 12 } } })), "valid");
expect("revocation file for another fingerprint: still VALID", await state(`#${rev.payload}`, vectorLedger({ revoked: { [rev.fingerprint]: { ...R.revoked_files[rev.fingerprint], fingerprint: fpOk } } })), "valid");
const broken = { ...vectorLedger(), proof: async () => { throw new Error("503"); } };
expect("ledger unreadable: ERROR", await state(`#${ok.payload}`, broken), "error");

if (problems.length) {
  console.error(`cert logic failed (${problems.length} of ${checks}):\n- ${problems.join("\n- ")}`);
  process.exit(1);
}
console.log(`cert logic ok: ${checks} checks. Every golden vector passes (aikiri-network #22 at 562cf19), and every reject case is INVALID or NOT FOUND as the doc says`);
