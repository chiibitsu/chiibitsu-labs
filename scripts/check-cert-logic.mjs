// Gate: the certificate check's logic, run on the sample cohort. When the golden vectors from aikiri-network's
// docs/certificates.md land, add them here: each vector's payload, fingerprint, leaf, path, root and expected state.
// Obviously fake names only. Runs the TypeScript directly (Node strips the types; scripts/ts-alias.mjs maps "@/").
import {
  SAMPLE_RECORDS, bytesToBase64url, canonicalBytes, checkCertificate, decodePayload, placeholderLedger, samplePayload,
} from "../lib/certCheck.ts";

const problems = [];
const expect = (name, got, want) => { if (got !== want) problems.push(`${name}: got ${got}, want ${want}`); };

// Nothing outside the samples: any other fingerprint is simply not in this ledger.
const none = {
  proof: async () => null, revocation: async () => null,
  block: async () => { throw new Error("no block"); }, witness: async () => { throw new Error("no witness"); },
  isPlaceholder: async () => false,
};
const ledger = placeholderLedger(none);
const state = async (frag) => (await checkCertificate(frag, ledger)).state;
const enc = (s) => bytesToBase64url(new TextEncoder().encode(s));

const valid = await checkCertificate(`#${samplePayload(SAMPLE_RECORDS.valid)}`, ledger);
expect("sample valid", valid.state, "valid");
expect("sample valid is labelled placeholder", valid.state === "valid" && valid.placeholder, true);
expect("sample valid shows its host", valid.state === "valid" && valid.record.host, "Example Host");
const revoked = await checkCertificate(`#${samplePayload(SAMPLE_RECORDS.revoked)}`, ledger);
expect("sample revoked", revoked.state, "revoked");
expect("revoked time is the revocation block's", revoked.state === "revoked" && revoked.revokedAt, "2026-02-01T09:30:00+08:00");

// Not canonical: same record, different bytes.
const json = new TextDecoder().decode(canonicalBytes(SAMPLE_RECORDS.valid));
expect("pretty-printed", await state(`#${enc(JSON.stringify(JSON.parse(json), null, 1))}`), "not_found");
expect("unsorted keys", await state(`#${enc(JSON.stringify({ v: 1, ...JSON.parse(json) }))}`), "not_found");
expect("padded base64", await state(`#${samplePayload(SAMPLE_RECORDS.valid)}=`), "not_found");
expect("NFD name", await state(`#${enc(json.replace("Sample Participant", "Sample Participé"))}`), "not_found");
expect("float version", await state(`#${enc(json.replace('"v":1', '"v":1.5'))}`), "not_found");
expect("unknown field (venue)", await state(`#${enc(json.replace('"v":1', '"v":1,"venue":"x"').replace(/^\{/, "{"))}`), "not_found");
expect("decodes only canonical", decodePayload(`#${enc(JSON.stringify(JSON.parse(json), null, 1))}`), null);

// Tampering and the issuer rule.
expect("one character changed", await state(`#${enc(json.replace("Sample Course", "Sample Coursf"))}`), "not_found");
expect("another issuer", await state(`#${samplePayload({ ...SAMPLE_RECORDS.valid, issuer: "Someone Else" })}`), "not_found");
expect("empty", await state(""), "not_found");
expect("junk", await state("#%%%"), "not_found");

if (problems.length) {
  console.error(`cert logic failed:\n- ${problems.join("\n- ")}`);
  process.exit(1);
}
console.log("cert logic ok: samples give valid and revoked, non-canonical, tampered and foreign-issuer links give not found");
