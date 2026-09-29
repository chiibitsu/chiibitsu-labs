// Gate: every placeholder in content/home.json is flagged illustrative (rendered as "Illustrative"),
// or is a real figure carrying the date it was measured and its source. No prices anywhere.
import fs from "node:fs";

const data = JSON.parse(fs.readFileSync(new URL("../content/home.json", import.meta.url), "utf8"));
const problems = [];

const walk = (node, path) => {
  if (Array.isArray(node)) return node.forEach((n, i) => walk(n, `${path}[${i}]`));
  if (node && typeof node === "object") {
    if ("illustrative" in node && typeof node.illustrative !== "boolean") problems.push(`${path}: illustrative must be true or false`);
    if (node.illustrative === false && !(node.measuredOn && node.source)) problems.push(`${path}: a real figure needs measuredOn and source`);
    if ("href" in node && node.href === null && node.illustrative !== true) problems.push(`${path}: placeholder link (href null) must be illustrative`);
    for (const [k, v] of Object.entries(node)) walk(v, `${path}.${k}`);
    return;
  }
  if (typeof node === "string") {
    if (/[₱$€£]\s?\d|\b(USD|PHP)\b|\bprice\b/i.test(node)) problems.push(`${path}: looks like a price`);
    if (/Book a call/i.test(node)) problems.push(`${path}: "Book a call" was replaced by "Request a workflow audit →"`);
  }
};
walk(data, "home");

// Metric figures must be illustrative or dated and sourced.
for (const m of data.week.metrics) {
  if (m.illustrative !== true && !(m.illustrative === false && m.measuredOn && m.source)) problems.push(`week.metrics.${m.key}: undischarged figure`);
}
if (data.cta.label !== "Request a workflow audit →") problems.push("cta.label must be 'Request a workflow audit →'");
if (data.nav.some((n) => n.label === "Field Notes")) problems.push("nav label is 'Publication', not 'Field Notes'");
if (!data.changes.items.some((i) => i.body === "Every piece of work will leave a receipt on the Aikiri Network.")) problems.push("Trust every result copy changed");

const aikiri = JSON.stringify(data).match(/Aikiri Network/g)?.length ?? 0;
console.log(`content ok: ${aikiri} mentions of the Aikiri Network (allowed: Trust every result, Papers, investors)`);
if (problems.length) {
  console.error(problems.join("\n"));
  process.exit(1);
}
