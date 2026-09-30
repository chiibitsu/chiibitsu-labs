// Gate: every placeholder in content/home.json is flagged illustrative (rendered as "Illustrative"),
// or is a real figure carrying the date it was measured and its source. No prices anywhere.
import fs from "node:fs";
import { fileURLToPath } from "node:url";

const load = (f) => JSON.parse(fs.readFileSync(new URL(`../content/${f}.json`, import.meta.url), "utf8"));
const data = load("home");
const investor = load("investor");
const about = load("about");
const filmContent = load("film");
const angeline = load("angeline");
const stillAbout = JSON.parse(fs.readFileSync(new URL("../content/still/about.json", import.meta.url), "utf8"));
const problems = [];

// SVG colours go through style, never fill="var(--x)" attributes: Safari does not resolve those reliably (CLbrand interactive).
{
  const walkDir = (dir) =>
    fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? walkDir(`${dir}/${e.name}`) : [`${dir}/${e.name}`]));
  for (const f of ["app", "components"].flatMap((d) => walkDir(fileURLToPath(new URL(`../${d}`, import.meta.url)))).filter((f) => /\.tsx?$/.test(f))) {
    if (/(fill|stroke|stopColor)="var\(--/.test(fs.readFileSync(f, "utf8"))) problems.push(`${f}: SVG colour set as an attribute; use style={{ fill: "var(--x)" }}`);
  }
}

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
    // Career figures on /about (revenue, not prices) are the one place a currency amount may appear.
    const careerFigure = /^(film|stillAbout)\.proof\.figures\[\d+\]\.value$|^angeline\.(outcomes\.figures\[\d+\]\.value|road\.items\[\d+\]\.body)$/.test(path);
    if (!careerFigure && /[₱$€£]\s?\d|\b(USD|PHP)\b|\bprice\b/i.test(node)) problems.push(`${path}: looks like a price`);
    if (/Book a call/i.test(node)) problems.push(`${path}: "Book a call" was replaced by "Request a workflow audit →"`);
  }
};
walk(data, "home");
walk(investor, "investor");
walk(about, "about");
walk(angeline, "angeline");
walk(filmContent, "film");
walk(stillAbout, "stillAbout");

// Metric figures must be illustrative or dated and sourced.
for (const [name, d] of [["home", data], ["investor", investor]]) {
  for (const m of d.week.metrics) {
    if (m.illustrative !== true && !(m.illustrative === false && m.measuredOn && m.source)) problems.push(`${name}.week.metrics.${m.key}: undischarged figure`);
  }
}
// /about speaks as one person: no "we", "our" or "us" (the one approved exception is the wave note),
// and the Aikiri Network is not named there.
{
  const text = JSON.stringify([about, filmContent, stillAbout]).replace(about.waves.here, "").replace(stillAbout.waves.here, "");
  const plural = text.match(/\b(we|our|ours|us)\b/gi);
  if (plural) problems.push(`about: first person plural found: ${[...new Set(plural)].join(", ")}`);
  if (/aikiri/i.test(text)) problems.push("about: the Aikiri Network is not named on /about");
  if (/\bshould(n['’]t)?\b/i.test(text)) problems.push('about: no "shoulds" in copy');
  for (const f of filmContent.proof.figures) {
    if (f.illustrative !== true && !(f.illustrative === false && f.measuredOn && f.source)) problems.push(`film.proof: undischarged figure ${f.value}`);
  }
}
// Privacy: no numbers from companies Chii worked for (TalentHero, The Lazy Lifter) unless already public (Chii, 2026-09-30).
{
  const all = JSON.stringify([data, investor, about, filmContent, stillAbout, angeline]);
  for (const banned of [/\+72/, /\b72%/, /18×/, /3,900/, /churn/i]) {
    if (banned.test(all)) problems.push(`privacy: ${banned} is a number from a company Chii worked for and must not be on the site`);
  }
}
if (!/securities/i.test(investor.room.disclaimer)) problems.push("investor: the securities disclaimer is missing");
if (investor.hero.cta.label !== "Request the data room →") problems.push("investor: CTA must be 'Request the data room →'");
if (data.cta.label !== "Request a workflow audit →") problems.push("cta.label must be 'Request a workflow audit →'");
// The publication is only "Publication" on the site. Its name stays on Substack (Chii, 2026-09-30).
{
  const all = JSON.stringify([data, investor, about, filmContent, stillAbout]);
  if (/field notes/i.test(all)) problems.push('content: "Field Notes" is not used on the site; the publication is only "Publication"');
  if (/overlord/i.test(all)) problems.push("content: the publication's name stays on Substack, not on the site");
}
if (!data.changes.items.some((i) => i.body === "Every piece of work will leave a receipt on the Aikiri Network.")) problems.push("Trust every result copy changed");

const aikiri = JSON.stringify([data, investor]).match(/Aikiri Network/g)?.length ?? 0;
console.log(`content ok: ${aikiri} mentions of the Aikiri Network (home: Trust every result, Papers, investors; the investor page is an investor section)`);
if (problems.length) {
  console.error(problems.join("\n"));
  process.exit(1);
}
