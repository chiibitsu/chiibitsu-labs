// Gate: /network/cert stays tracker-free and locked down. Runs after `next build`: it starts the built app on a
// spare port, fetches the page, and checks the HTML and headers. It also checks the source: nothing on the cert
// route imports analytics or calls /api/verify-alert. Site PM brief, agreed with the Network PM, 2026-11-20.
import { spawn } from "node:child_process";
import fs from "node:fs";
import net from "node:net";
import path from "node:path";

const problems = [];
const TRACKERS = [/clarity\.ms/i, /apollo\.io/i, /_vercel\/insights/i, /_vercel\/speed-insights/i, /va\.vercel-scripts\.com/i, /vercel-scripts/i];

// 1. Source: every file the cert route pulls in, following imports from its two entry files, never touches
// analytics or the verify alert.
const root = new URL("../", import.meta.url);
const read = (f) => fs.readFileSync(new URL(f, root), "utf8");
const resolve = (from, spec) => {
  const base = spec.startsWith("@/") ? spec.slice(2) : spec.startsWith(".") ? path.posix.join(path.posix.dirname(from), spec) : null;
  if (!base) return null;
  return [base, `${base}.ts`, `${base}.tsx`, `${base}/index.ts`].find((f) => /\.(tsx?|json|css)$/.test(f) && fs.existsSync(new URL(f, root))) ?? null;
};
const seen = new Set();
const queue = ["app/(cert)/layout.tsx", "app/(cert)/network/cert/page.tsx", "proxy.ts"];
while (queue.length) {
  const f = queue.pop();
  if (seen.has(f)) continue;
  seen.add(f);
  if (!/\.tsx?$/.test(f)) continue;
  const src = read(f).replace(/\/\*[\s\S]*?\*\//g, "").replace(/^\s*\/\/.*$/gm, "");
  if (/@vercel\/(analytics|speed-insights)|trackEvent|verify-alert|clarity\.ms|apollo\.io/i.test(src)) problems.push(`${f}: analytics, a tracker or the verify alert, on the cert route`);
  for (const [, spec] of src.matchAll(/(?:from|import)\s*\(?\s*["']([^"']+)["']/g)) {
    if (/^@vercel\/(analytics|speed-insights)/.test(spec)) problems.push(`${f}: imports ${spec}`);
    const next = resolve(f, spec);
    if (next) queue.push(next);
  }
}
if (!seen.has("lib/ledgerCheck.ts")) problems.push("check-cert: the import walk did not reach lib/ledgerCheck.ts, so it is not following imports");

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
  const extra = script.filter((s) => s !== "'self'" && s !== "'strict-dynamic'" && !/^'nonce-[^']+'$/.test(s));
  if (extra.length) problems.push(`/network/cert: script-src allows more than this site and its nonce: ${extra.join(" ")}`);
  const connect = directive("connect-src").filter((s) => s !== "'self'" && s !== "https://raw.githubusercontent.com");
  if (connect.length) problems.push(`/network/cert: connect-src allows ${connect.join(" ")}`);
  // Every inline script carries the nonce, so the enforced policy blocks nothing Next.js needs.
  // Any case, any quoting: <SCRIPT SRC=x>, src='x' and src=x all count.
  const SRC_ATTR = /\ssrc\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/i;
  const NONCE_ATTR = /\snonce\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/i;
  const attr = (tag, re) => tag.match(re)?.slice(1).find((v) => v !== undefined);
  for (const tag of html.match(/<script\b[^>]*>/gi) ?? []) {
    const src = attr(tag, SRC_ATTR);
    if (src === undefined && nonce && attr(tag, NONCE_ATTR) !== nonce) problems.push(`/network/cert: an inline script without the nonce: ${tag.slice(0, 80)}`);
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
