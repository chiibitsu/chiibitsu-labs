// Gate: the "is this really us" matcher gives the right verdict for known real, look-alike and unrelated inputs.
// Runs the TypeScript directly (Node strips the types), against the real list in content/official.json.
import fs from "node:fs";
import { domainToASCII } from "node:url";
import { checkOfficial, privatePhoneOwner, phoneKey } from "../lib/verifyUs.ts";

const list = JSON.parse(fs.readFileSync(new URL("../content/official.json", import.meta.url), "utf8")).list;
const cyrillicI = "chііbitsu.com"; // two Cyrillic і
const cases = [
  ["labs@chiibitsu.com", "official"],
  ["Labs@Chiibitsu.com", "official"],
  ["mailto:labs@chiibitsu.com", "official"],
  ["chii@chiibitsu.com", "official"],
  ["support@chiibitsu.com", "domain"],
  ["x@mail.chiibitsu.com", "domain"],
  ["labs@chiibitsu.co", "lookalike"],
  ["labs@chibitsu.com", "lookalike"],
  ["labs@chiibitsu-labs.com", "lookalike"],
  ["labs@chiibitsu.com.evil.com", "lookalike"],
  ["labs@chllbitsu.com", "lookalike"],
  ["labs@gmail.com", "unlisted"],
  ["https://www.chiibitsu.com/network", "official"],
  ["chiibitsu.com", "official"],
  ["https://uno.chiibitsu.com/updates", "official"],
  ["https://chiibitsu.com@evil.example/login", "lookalike"],
  ["https://chiibitsu.com.evil.example", "lookalike"],
  ["https://chiibitsu-labs.com", "lookalike"],
  [`https://${cyrillicI}`, "lookalike"],
  [`https://${domainToASCII(cyrillicI)}`, "lookalike"],
  ["https://www.linkedin.com/in/angelinev", "official"],
  ["https://linkedin.com/in/angelinev/", "official"],
  ["https://www.linkedin.com/in/angeline-viray", "unlisted"],
  ["https://substack.com/@chiibitsulabs", "official"],
  ["https://substack.com/@chiiaikiri", "official"],
  ["https://substack.com/@someoneelse", "unlisted"],
  ["https://t.me/chiibitsu", "official"],
  ["https://t.me/chiibitsu_labs", "official"],
  ["https://t.me/Chii0xKween", "official"],
  ["https://t.me/chiibitsu_support", "unlisted"],
  ["https://instagram.com/chiibitsu", "official"],
  ["https://www.instagram.com/chii.aikiri/", "official"],
  ["https://instagram.com/chiibitsu.official", "unconfirmed"],
  ["https://www.facebook.com/chiibitsu.labs", "official"],
  ["https://m.me/chii.legend", "official"],
  ["https://www.facebook.com/chiibitsu.labs.ph", "unlisted"],
  ["https://x.com/chiibitsu", "unconfirmed"],
  ["https://example.com", "unlisted"],
  ["@chiibitsu", "official"],
  ["@CHII0XKWEEN", "official"],
  ["@chiiweb3", "official"],
  ["chii.legend", "official"],
  ["chiibitsu.labs", "official"],
  ["@chiibitsu2", "unconfirmed"],
  ["+63 924 113 1973", "official"],
  ["0924 113 1973", "official"],
  ["+639241131973", "official"],
  ["+63 912 345 6789", "unconfirmed"],
  ["0x15eFF43a5CFA703215fAa943D42168aF5a7A6a9e", "official"],
  ["0x15eff43a5cfa703215faa943d42168af5a7a6a9e", "official"],
  ["0x0000000000000000000000000000000000000001", "unconfirmed"],
  ["hello there", "unrecognized"],
  ["", "unrecognized"],
];
const problems = [];
for (const [input, want] of cases) {
  const got = checkOfficial(input, list).verdict;
  if (got !== want) problems.push(`${JSON.stringify(input)}: wanted ${want}, got ${got}`);
}
// Every item the page lists as official must itself check as official.
for (const e of list.emails) if (checkOfficial(e.value, list).verdict !== "official") problems.push(`listed email ${e.value} does not check as official`);
for (const a of list.addresses) if (checkOfficial(a.value, list).verdict !== "official") problems.push(`listed address ${a.value} does not check as official`);
for (const p of list.phones) if (checkOfficial(p.value, list).verdict !== "official") problems.push(`listed phone ${p.value} does not check as official`);
for (const h of list.handles) if (checkOfficial(`@${h.value}`, list).verdict !== "official") problems.push(`listed handle ${h.value} does not check as official`);
for (const p of list.profiles) if (checkOfficial(`https://www.${p.host}${p.path}`, list).verdict !== "official") problems.push(`listed profile ${p.platform} ${p.path} does not check as official`);
for (const d of list.domains) if (checkOfficial(`https://${d}`, list).verdict !== "official") problems.push(`listed domain ${d} does not check as official`);

// A number listed only as a slow fingerprint is recognised, in any common format, and others are not. Test number, not a real one.
const { createHash, pbkdf2Sync } = await import("node:crypto");
void createHash;
const pp = list.privatePhones;
const testList = { ...list, privatePhones: { ...pp, items: [{ hash: pbkdf2Sync(phoneKey("+63 900 000 0001"), pp.salt, pp.iterations, 32, "sha256").toString("hex"), owner: "Test owner" }] } };
for (const form of ["+63 900 000 0001", "0900 000 0001", "+639000000001"]) {
  if ((await privatePhoneOwner(form, testList)) !== "Test owner") problems.push(`private number ${form} not recognised`);
}
if ((await privatePhoneOwner("+63 900 000 0002", testList)) !== null) problems.push("a different number matched a private one");
// The real file must not contain a phone number in the clear beyond the listed ones.
const raw = fs.readFileSync(new URL("../content/official.json", import.meta.url), "utf8");
const listed = new Set(list.phones.map((p) => phoneKey(p.value)));
for (const m of raw.match(/\+?\d[\d\s-]{9,}\d/g) ?? []) if (!listed.has(phoneKey(m))) problems.push(`a number appears in official.json in the clear: ${m.slice(0, 4)}…`);

if (problems.length) {
  console.error(`verify check failed:\n  ${problems.join("\n  ")}`);
  process.exit(1);
}
console.log(`verify ok: ${cases.length} cases, every listed channel, and private-number fingerprints give the right verdict`);
