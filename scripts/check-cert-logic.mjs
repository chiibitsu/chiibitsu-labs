// Gate: the certificate check against aikiri-network's golden vectors (lib/fixtures/cert_cohort.json, copied from
// PR #22 at f2cb0cd), plus reject cases built from those vectors' own records. Every value is fake.
// Runs the TypeScript directly (Node strips the types; scripts/ts-alias.mjs maps "@/").
import fs from "node:fs";
import {
  bytesToBase64url, canonicalJson, checkCertificate, decodePayload, displayText, fingerprintOf, isProof, leafHash, liveLedger, manilaTime,
  parseLedgerJson, pathRoot,
} from "../lib/certCheck.ts";
import { NotInLedger } from "../lib/ledgerCheck.ts";

const raw = fs.readFileSync(new URL("../lib/fixtures/cert_cohort.json", import.meta.url));
// The copy must stay byte for byte what aikiri-network #22 published (lib/fixtures/README.md).
const PINNED = "d8ad1a70c8ae370b54c6756929887706e4034498450403fc9eba1713b32e6b08";
const V = JSON.parse(raw.toString("utf8"));
const R = V.records;
const problems = [];
let checks = 0;
{
  const { createHash } = await import("node:crypto");
  const got = createHash("sha256").update(raw).digest("hex");
  if (got !== PINNED) problems.push(`lib/fixtures/cert_cohort.json is not the pinned copy: sha256 ${got}`);
}
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
const verdict = (s) => s.toLowerCase().replace(" ", "_");
// Every proof of each cohort, against the vectors' blocks.
for (const [size, verdicts] of Object.entries(R.expected_by_cohort)) {
  const c = R.cohorts.find((x) => x.size === Number(size));
  const proofs = Object.fromEntries(c.proofs.map((p) => [p.leaf, p]));
  for (const [fp, want] of Object.entries(verdicts)) {
    expect(`cohort of ${size}: verdict ${fp.slice(0, 8)}`, (await checkCertificate(`#${payloadOf(fp)}`, vectorLedger({ proofs }))).state, verdict(want));
  }
}
// reader_cases: one proof altered in each way a reader must catch.
// Each case names the file it is read from, ledger/certs/<file>: the record is the one whose fingerprint is that name.
for (const rc of R.reader_cases) {
  const fp = rc.file.replace(/\.json$/, "");
  expect(`reader case "${rc.case}"`, (await checkCertificate(`#${payloadOf(fp)}`, vectorLedger({ proofs: { [fp]: rc.proof } }))).state, verdict(rc.expected));
}
// revoked_file_cases: a revoked/ file counts only if it names the right revocation block.
for (const rf of R.revoked_file_cases) {
  const fp = rf.file.fingerprint;
  const got = (await checkCertificate(`#${payloadOf(fp)}`, vectorLedger({ revoked: { [fp]: rf.file } }))).state;
  expect(`revoked file "${rf.case}" ${rf.counts ? "counts" : "does not count"}`, got, rf.counts ? "revoked" : "valid");
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
  "a UTF-8 BOM before the record": bytesToBase64url(new Uint8Array([0xef, 0xbb, 0xbf, ...enc.encode(ok.canonical)])),
  "number of odd length": recordPayload({ ...ok.record, number: "a".repeat(33) }),
};
for (const [name, frag] of Object.entries(invalid)) expect(`INVALID: ${name}`, await state(frag ? `#${frag}` : ""), "invalid");
expect("a year before 100 is a real date", decodePayload(`#${recordPayload({ ...ok.record, completed: "0050-01-01" })}`) !== null, true);
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
expect("revocation file for another fingerprint: ERROR, never VALID", await state(`#${rev.payload}`, vectorLedger({ revoked: { [rev.fingerprint]: { ...R.revoked_files[rev.fingerprint], fingerprint: fpOk } } })), "error");
expect("revocation file with an extra field: ERROR, never VALID", await state(`#${rev.payload}`, vectorLedger({ revoked: { [rev.fingerprint]: { ...R.revoked_files[rev.fingerprint], reason: "x" } } })), "error");
expect("revocation file unreadable: ERROR, never VALID", await state(`#${rev.payload}`, { ...vectorLedger(), revocation: async () => { throw new SyntaxError("cut off"); } }), "error");
expect("proof file unreadable: ERROR, never INVALID", await state(`#${ok.payload}`, { ...vectorLedger(), proof: async () => { throw new SyntaxError("cut off"); } }), "error");
expect("a bidi override is allowed in the bytes", decodePayload(`#${recordPayload({ ...ok.record, holder: "Test \u202Eredloh" })}`) !== null, true);
expect("display marks a right-to-left override", displayText("Test \u202Eredloh"), "Test \uFFFDredloh");
expect("display marks an isolate", displayText("Ana\u2066 Cruz"), "Ana\uFFFD Cruz");
expect("display marks zero-width and blank-looking characters", displayText("Juan\u200BCruz Chiibitsu\u3164Labs \uFEFFx\u00ADy\u2060z"), "Juan\uFFFDCruz Chiibitsu\uFFFDLabs \uFFFDx\uFFFDy\uFFFDz");
expect("display marks tag characters", displayText("a\u{E0041}b"), "a\uFFFDb");
expect("display keeps RLM, ZWJ and variation selectors", displayText("دورة\u200F 2026 👩\u200D💻 ☺\uFE0F"), "دورة\u200F 2026 👩\u200D💻 ☺\uFE0F");
expect("display shows a line separator as U+FFFD", displayText("A\u2028B\u0085C"), "A\uFFFDB\uFFFDC");
expect("display leaves ordinary text alone", displayText("Tëst Hōlder \"Three\" \\ 🎓"), "Tëst Hōlder \"Three\" \\ 🎓");
expect("Manila time from a +08:00 block", manilaTime("2026-02-03T10:00:00+08:00"), "2026-02-03 10:00 Manila time");
expect("Manila time from UTC", manilaTime("2026-02-03T02:00:00Z"), "2026-02-03 10:00 Manila time");
expect("no offset: shown as written", manilaTime("2026-02-03T10:00:00"), "2026-02-03T10:00:00");
// 6. A broken ledger is never a verdict: blocks without a time or filed under another index, block 0, and files a
// strict reader refuses (aikiri-network's reader: no key twice, integers only).
const withBlock = (index, change) => vectorLedger({ blocks: R.blocks.map((b) => (b.index === index ? change(b) : b)) });
const noTime = ({ timestamp, ...b }) => b;
expect("sealing block without a time: ERROR, never VALID", await state(`#${ok.payload}`, withBlock(12, noTime)), "error");
expect("sealing block filed under another index: ERROR", await state(`#${ok.payload}`, {
  ...vectorLedger(), block: async (i) => ({ ...R.blocks.find((x) => x.index === i), ...(i === 12 ? { index: 77 } : {}) }),
}), "error");
expect("revocation block without a time: ERROR, never VALID", await state(`#${rev.payload}`, withBlock(13, noTime)), "error");
expect("revocation block with an empty time: ERROR, never VALID", await state(`#${rev.payload}`, withBlock(13, (b) => ({ ...b, timestamp: "" }))), "error");
expect("proof naming block 0: INVALID", await state(`#${ok.payload}`, vectorLedger({ proofs: { [fpOk]: { ...proofOk, block: 0 } } })), "invalid");
expect("revocation naming block 0: ERROR, never VALID", await state(`#${rev.payload}`, vectorLedger({ revoked: { [rev.fingerprint]: { ...R.revoked_files[rev.fingerprint], block: 0 } } })), "error");
const strictRefuses = (text) => { try { parseLedgerJson(text); return false; } catch { return true; } };
const proofText = JSON.stringify(proofOk);
expect("strict read: a canonical proof file reads as JSON.parse does", parseLedgerJson(proofText), JSON.parse(proofText));
expect("strict read: a trailing newline is fine", parseLedgerJson(`${proofText}\n`), JSON.parse(proofText));
expect("strict read: a key twice is refused", strictRefuses(proofText.replace('{"block":12', '{"block":null,"block":12')), true);
expect("strict read: block 10.0 is refused", strictRefuses(proofText.replace('"block":12', '"block":12.0')), true);
expect("strict read: v as 1e0 is refused", strictRefuses(proofText.replace('"v":1', '"v":1e0')), true);
expect("strict read: trailing text is refused", strictRefuses(`${proofText}x`), true);
expect("strict read: a string with an escaped quote and a key-like text inside", parseLedgerJson('{"a":"x\\"y","b":"\\"a\\":1"}'), { a: 'x"y', b: '"a":1' });
// The live ledger reader, against stand-in responses: a file that holds only null is broken, not missing.
const realFetch = globalThis.fetch;
const answer = (status, body) => { globalThis.fetch = async () => new Response(body, { status }); };
try {
  answer(200, "null");
  expect("live: a proof file holding null: ERROR, never NOT FOUND", await state(`#${ok.payload}`, liveLedger), "error");
  answer(200, proofText.replace('{"block":12', '{"block":null,"block":12'));
  expect("live: a proof file with a key twice: ERROR, never VALID", await state(`#${ok.payload}`, liveLedger), "error");
  answer(404, "Not Found");
  expect("live: no proof file (404): NOT FOUND", await state(`#${ok.payload}`, liveLedger), "not_found");
} finally {
  globalThis.fetch = realFetch;
}

const broken = { ...vectorLedger(), proof: async () => { throw new Error("503"); } };
expect("ledger unreadable: ERROR", await state(`#${ok.payload}`, broken), "error");

if (problems.length) {
  console.error(`cert logic failed (${problems.length} of ${checks}):\n- ${problems.join("\n- ")}`);
  process.exit(1);
}
console.log(`cert logic ok: ${checks} checks. Every golden vector passes (aikiri-network #22 at f2cb0cd), and every reject case is INVALID or NOT FOUND as the doc says`);
