import type { Metadata } from "next";
import Link from "next/link";
import { AikiriText } from "@/components/AikiriText";
import { Mark } from "@/components/Mark";
import { SiteFooter } from "@/components/SiteFooter";
import { WitnessRows } from "@/components/WitnessRows";
import { certSource, type CertView } from "@/lib/certCheck";
import { when } from "@/lib/ledgerCheck";
import certJson from "@/content/cert.json";

const c = certJson;

// The same title for every number: a holder's name never reaches a tab, a link preview or a search index.
export const metadata: Metadata = {
  title: c.meta.title,
  description: c.meta.description,
  robots: { index: false, follow: false },
};

// /network/cert/<number>: one certificate, looked up by its number. Valid, revoked or not found; nothing else.
// The data comes through lib/certCheck.ts (placeholder until the contract lands). No list, no search, no next/previous.
export default async function Cert({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const v = await certSource.lookup(id);
  return (
    <div className="page">
      <Link href="/" className="brand" aria-label="Chiibitsu Labs, home">
        <Mark />
        <span className="wordmark">Chiibitsu Labs</span>
      </Link>
      <main className="audit privacy ledger">
        <div className="eyebrow"><AikiriText text={c.eyebrow} where="cert_eyebrow" /></div>
        {v.state !== "not_found" && v.placeholder && <p className="body"><span className="ill">Illustrative</span> {c.placeholder}</p>}
        <div data-clarity-mask="true">
          <State v={v} />
        </div>

        <h2>{c.honest.heading}</h2>
        <ul className="body">
          {c.honest.items.map((s) => (
            <li key={s}>{s}</li>
          ))}
        </ul>

        <p className="body"><Link href={c.links.check.href}>{c.links.check.label}</Link></p>
        <Link href={c.links.back.href} className="caption">{c.links.back.label}</Link>
      </main>
      <SiteFooter left={c.footer.left} middle={c.footer.middle} />
    </div>
  );
}

function State({ v }: { v: CertView }) {
  if (v.state === "not_found") {
    const r = c.notFound.rows;
    return (
      <>
        <h1>{c.notFound.h1}</h1>
        <p className="body">{c.notFound.body}</p>
        <dl className="ledger-facts">
          <div className="ledger-row"><dt className="caption">{r.number}</dt><dd>{v.number}</dd></div>
        </dl>
      </>
    );
  }
  if (v.state === "revoked") {
    const r = c.revoked.rows;
    return (
      <>
        <h1>{c.revoked.h1}</h1>
        <p className="body">{c.revoked.body}</p>
        <dl className="ledger-facts">
          <div className="ledger-row"><dt className="caption">{r.number}</dt><dd>{v.number}</dd></div>
          <div className="ledger-row"><dt className="caption">{r.course}</dt><dd>{v.course}</dd></div>
          <div className="ledger-row"><dt className="caption">{r.revokedOn}</dt><dd>{v.revokedOn}</dd></div>
        </dl>
      </>
    );
  }
  const r = c.valid.rows;
  const t = when(v.seal.sealedAt);
  return (
    <>
      <h1>{c.valid.h1}</h1>
      <p className="body">{c.valid.body}</p>
      <dl className="ledger-facts">
        <div className="ledger-row"><dt className="caption">{r.number}</dt><dd>{v.number}</dd></div>
        <div className="ledger-row"><dt className="caption">{r.holder}</dt><dd>{v.holder}</dd></div>
        <div className="ledger-row"><dt className="caption">{r.course}</dt><dd>{v.course}</dd></div>
        <div className="ledger-row"><dt className="caption">{r.issuer}</dt><dd>{c.valid.issuer}</dd></div>
        <div className="ledger-row"><dt className="caption">{r.issuedOn}</dt><dd>{v.issuedOn}</dd></div>
        <div className="ledger-row"><dt className="caption">{r.block}</dt><dd>{v.placeholder ? "Placeholder" : v.seal.block}</dd></div>
        <div className="ledger-row"><dt className="caption">{r.sealed}</dt><dd>{t.local}{t.utc ? ` · ${t.utc}` : ""}</dd></div>
        <WitnessRows w={v.seal.witness} />
      </dl>
    </>
  );
}
