// Gate: /network/cert stays tracker-free and locked down. Runs after `next build`: it starts the built app on a
// spare port, fetches the page, and checks the HTML and headers. It also checks the source: nothing on the cert
// route imports analytics or calls /api/verify-alert. Site PM brief, agreed with the Network PM, 2026-11-20.
import { spawn } from "node:child_process";
import fs from "node:fs";
import net from "node:net";

const problems = [];
const TRACKERS = [/clarity\.ms/i, /apollo\.io/i, /_vercel\/insights/i, /_vercel\/speed-insights/i, /va\.vercel-scripts\.com/i, /vercel-scripts/i];

// 1. Source: the files that make up the cert route never touch analytics or the verify alert.
const certFiles = ["app/(cert)/layout.tsx", "app/(cert)/network/cert/page.tsx", "components/CertCheck.tsx", "lib/certCheck.ts", "components/WitnessRows.tsx"];
for (const f of certFiles) {
  const s = fs.readFileSync(new URL(`../${f}`, import.meta.url), "utf8").replace(/\/\/.*$/gm, "");
  if (/@vercel\/(analytics|speed-insights)|lib\/analytics|trackEvent|verify-alert|AikiriText|TrackedLink/.test(s)) problems.push(`${f}: imports analytics or calls the verify alert`);
}

// 2. The built page, served for real.
const port = await new Promise((res) => { const s = net.createServer().listen(0, () => { const p = s.address().port; s.close(() => res(p)); }); });
const server = spawn(process.execPath, ["node_modules/next/dist/bin/next", "start", "-p", String(port)], { stdio: ["ignore", "pipe", "pipe"], env: { ...process.env, VERCEL_ENV: "production" } });
let log = "";
server.stdout.on("data", (d) => (log += d));
server.stderr.on("data", (d) => (log += d));
const base = `http://localhost:${port}`;
try {
  let up = false;
  for (let i = 0; i < 60 && !up; i++) {
    try { await fetch(`${base}/network/cert`); up = true; } catch { await new Promise((r) => setTimeout(r, 500)); }
  }
  if (!up) throw new Error(`the built app did not start:\n${log}`);

  const r = await fetch(`${base}/network/cert`);
  const html = await r.text();
  if (r.status !== 200) problems.push(`/network/cert answered ${r.status}`);
  for (const t of TRACKERS) if (t.test(html)) problems.push(`/network/cert HTML contains a tracker: ${t}`);
  const csp = r.headers.get("content-security-policy") ?? "";
  if (!csp) problems.push("/network/cert: no enforced Content-Security-Policy header");
  const nonce = csp.match(/'nonce-([^']+)'/)?.[1];
  if (!nonce) problems.push("/network/cert: the CSP has no nonce");
  const directive = (name) => (csp.split(";").map((d) => d.trim()).find((d) => d.startsWith(`${name} `)) ?? "").split(/\s+/).slice(1);
  const script = directive("script-src");
  if (script.some((s) => /^https?:|unsafe-inline|\*/.test(s))) problems.push(`/network/cert: script-src allows more than this site: ${script.join(" ")}`);
  const connect = directive("connect-src").filter((s) => s !== "'self'" && s !== "https://raw.githubusercontent.com");
  if (connect.length) problems.push(`/network/cert: connect-src allows ${connect.join(" ")}`);
  // Every inline script carries the nonce, so the enforced policy blocks nothing Next.js needs.
  for (const tag of html.match(/<script\b[^>]*>/g) ?? []) {
    if (!/\bsrc=/.test(tag) && nonce && !tag.includes(`nonce="${nonce}"`)) problems.push(`/network/cert: an inline script without the nonce: ${tag.slice(0, 80)}`);
    const src = tag.match(/\bsrc="([^"]+)"/)?.[1];
    if (src && /^(https?:)?\/\//.test(src)) problems.push(`/network/cert: a script from another origin: ${src}`);
  }
  if (/Sample Participant/.test(html)) problems.push("/network/cert: a holder name is in the server HTML");

  // The test can tell: the rest of the site still loads its trackers.
  const other = await (await fetch(`${base}/network/check`)).text();
  if (!/clarity\.ms/.test(other)) problems.push("check-cert cannot see trackers on /network/check, so its tracker test proves nothing");
} catch (e) {
  problems.push(String(e instanceof Error ? e.message : e));
} finally {
  server.kill();
}

if (problems.length) {
  console.error(`cert check failed:\n- ${problems.join("\n- ")}`);
  process.exit(1);
}
console.log("cert ok: /network/cert loads no trackers, enforces its CSP with a nonce on every inline script, and its source sends nothing to analytics");
