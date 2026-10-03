import { createHash } from "node:crypto";
import type { Metadata } from "next";
import Link from "next/link";
import { Mark } from "@/components/Mark";
import { SiteFooter } from "@/components/SiteFooter";
import { VerifyUs } from "@/components/VerifyUs";
import officialJson from "@/content/official.json";

const c = officialJson;

export const metadata: Metadata = {
  alternates: { canonical: "/verify" },
  title: c.meta.title,
  description: c.meta.description,
};

// JSON with keys sorted at every level and no spaces, so anyone can reproduce the fingerprint.
const canonical = (x: unknown): string =>
  Array.isArray(x)
    ? `[${x.map(canonical).join(",")}]`
    : x && typeof x === "object"
      ? `{${Object.keys(x).sort().map((k) => `${JSON.stringify(k)}:${canonical((x as Record<string, unknown>)[k])}`).join(",")}}`
      : JSON.stringify(x);

const L = c.list;
const hash = (list: Record<string, unknown>) => createHash("sha256").update(canonical(list)).digest("hex");

// /verify: is this email, link, handle, number or wallet really ours? The list is public; the check runs on the device.
export default function Verify() {
  const fingerprint = hash({ domains: L.domains, emails: L.emails, profiles: L.profiles, addresses: L.addresses, handles: L.handles, phones: L.phones });
  const rows: { k: string; v: string; owner: string }[] = [
    ...L.domains.map((d) => ({ k: "Website", v: `${d} and its subdomains`, owner: "Chiibitsu Labs" })),
    ...L.emails.map((e) => ({ k: "Email", v: e.value, owner: e.owner })),
    ...L.profiles.map((p) => ({ k: p.platform, v: `${p.host}${p.path}`, owner: p.owner })),
    ...L.addresses.map((a) => ({ k: "Wallet", v: a.value, owner: a.owner })),
  ];
  return (
    <div className="page">
      <Link href="/" className="brand" aria-label="Chiibitsu Labs, home">
        <Mark />
        <span className="wordmark">Chiibitsu Labs</span>
      </Link>
      <main className="audit privacy ledger">
        <div className="eyebrow">{c.hero.eyebrow}</div>
        <h1>{c.hero.h1}</h1>
        <p className="body">{c.hero.sub}</p>

        <h2>{c.check.heading}</h2>
        <VerifyUs />

        <h2>{c.list.heading}</h2>
        <dl className="ledger-facts">
          {rows.map((r) => (
            <div key={`${r.k}-${r.v}`} className="ledger-row">
              <dt className="caption">{r.k}</dt>
              <dd>{r.v}<span className="caption"> · {r.owner}</span></dd>
            </div>
          ))}
        </dl>
        <p className="caption">{c.list.pending}</p>
        <p className="caption">{c.list.note}</p>

        <h2>{c.means.heading}</h2>
        <ul className="body">
          {c.means.items.map((s) => (
            <li key={s}>{s}</li>
          ))}
        </ul>

        <h2>{c.fingerprint.heading}</h2>
        <p className="body">{c.fingerprint.body}</p>
        <p className="caption mono-wrap">{fingerprint}</p>
        <p className="caption">{c.fingerprint.method}</p>

        <Link href={c.back.href} className="caption">{c.back.label}</Link>
      </main>
      <SiteFooter left={c.footer.left} middle={c.footer.middle} />
    </div>
  );
}
