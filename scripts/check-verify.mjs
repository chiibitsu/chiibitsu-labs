// Gate: the "is this really us" matcher gives the right verdict for known real, look-alike and unrelated inputs.
// Runs the TypeScript directly (Node strips the types), against the real list in content/official.json.
import fs from "node:fs";
import { domainToASCII } from "node:url";
import { checkOfficial } from "../lib/verifyUs.ts";

const list = JSON.parse(fs.readFileSync(new URL("../content/official.json", import.meta.url), "utf8")).list;
const cyrillicI = "chііbitsu.com"; // two Cyrillic і
const cases = [
  ["labs@chiibitsu.com", "official"],
  ["Labs@Chiibitsu.com", "official"],
  ["mailto:labs@chiibitsu.com", "official"],
  ["chii@chiibitsu.com", "domain"],
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
  ["https://substack.com/@someoneelse", "unlisted"],
  ["https://instagram.com/chiibitsu", "unconfirmed"],
  ["https://example.com", "unlisted"],
  ["+63 912 345 6789", "unconfirmed"],
  ["@chiibitsu", "unconfirmed"],
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
for (const p of list.profiles) if (checkOfficial(`https://www.${p.host}${p.path}`, list).verdict !== "official") problems.push(`listed profile ${p.platform} does not check as official`);
for (const d of list.domains) if (checkOfficial(`https://${d}`, list).verdict !== "official") problems.push(`listed domain ${d} does not check as official`);
if (problems.length) {
  console.error(`verify check failed:\n  ${problems.join("\n  ")}`);
  process.exit(1);
}
console.log(`verify ok: ${cases.length} cases and every listed channel give the right verdict`);
