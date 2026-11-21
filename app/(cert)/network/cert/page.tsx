import type { Metadata } from "next";
import Link from "next/link";
import { CertCheck } from "@/components/CertCheck";
import { Mark } from "@/components/Mark";
import { SiteFooter } from "@/components/SiteFooter";
import certJson from "@/content/cert.json";

const c = certJson;

// The same title and description for every certificate: the record lives only in the URL fragment, which the
// server never sees, so nothing personal can reach a tab title, a link preview or a search index.
export const metadata: Metadata = {
  title: c.meta.title,
  description: c.meta.description,
};

// /network/cert#<payload>: one certificate, checked in the browser (components/CertCheck.tsx, lib/certCheck.ts).
// Rendered per request so the proxy's CSP nonce reaches Next.js's own inline scripts.
export default function Cert() {
  // Sample certificates work on previews and local builds, never on production.
  const samples = process.env.VERCEL_ENV !== "production";
  return (
    <div className="page">
      <Link href="/" className="brand" aria-label="Chiibitsu Labs, home">
        <Mark />
        <span className="wordmark">Chiibitsu Labs</span>
      </Link>
      <main className="audit privacy ledger">
        <div className="eyebrow">{c.eyebrow}</div>
        <CertCheck samples={samples} />

        <h2>{c.honest.heading}</h2>
        <ul className="body">
          {c.honest.items.map((s) => (
            <li key={s}>{s}</li>
          ))}
        </ul>

        <p className="body"><Link href={c.links.check.href}>{c.links.check.label}</Link></p>
        <Link href={c.links.back.href} className="caption">{c.links.back.label}</Link>
      </main>
      <SiteFooter left={c.footer.left} middle={c.footer.middle} stamp={false} />
    </div>
  );
}
