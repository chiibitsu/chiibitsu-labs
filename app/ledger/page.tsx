import type { Metadata } from "next";
import Link from "next/link";
import { AikiriText } from "@/components/AikiriText";
import { Mark } from "@/components/Mark";
import { SiteFooter } from "@/components/SiteFooter";
import ledgerJson from "@/content/ledger.json";

const c = ledgerJson;

export const metadata: Metadata = {
  alternates: { canonical: "/ledger" },
  title: c.meta.title,
  description: c.meta.description,
};

// /ledger: the public page for the Aikiri ledger contract. Facts are sourced from Basescan and the public repository; nothing here is illustrative.
export default function Ledger() {
  return (
    <div className="page">
      <Link href="/" className="brand" aria-label="Chiibitsu Labs, home">
        <Mark />
        <span className="wordmark">Chiibitsu Labs</span>
      </Link>
      <main className="audit privacy ledger">
        <div className="eyebrow"><AikiriText text={c.hero.eyebrow} where="ledger_eyebrow" /></div>
        <h1>{c.hero.h1}</h1>
        <p className="body"><AikiriText text={c.hero.sub} where="ledger_hero" /></p>

        <h2>{c.holds.heading}</h2>
        <div className="ang-cols3">
          {c.holds.items.map((it) => (
            <div key={it.title} className="ang-col">
              <div className="eyebrow">{it.label}</div>
              <div className="ang-col-t sm">{it.title}</div>
              <div className="body">{it.body}</div>
            </div>
          ))}
        </div>

        <h2>{c.onchain.heading}</h2>
        <dl className="ledger-facts">
          {c.onchain.rows.map((r) => (
            <div key={r.k} className="ledger-row">
              <dt className="caption">{r.k}</dt>
              <dd>{"href" in r && r.href ? <a href={r.href} target="_blank" rel="noopener noreferrer">{r.v}</a> : r.v}</dd>
            </div>
          ))}
        </dl>
        <p className="caption">{c.onchain.asOf}</p>

        <h2>{c.check.heading}</h2>
        <ol className="ledger-steps body">
          {c.check.steps.map((s) => (
            <li key={s}>{s}</li>
          ))}
        </ol>

        <h2>{c.links.heading}</h2>
        <ul className="body">
          {c.links.items.map((l) => (
            <li key={l.href}>
              <a href={l.href} target="_blank" rel="noopener noreferrer">{l.label}</a>
            </li>
          ))}
          <li>
            <Link href={c.links.check.href}>{c.links.check.label}</Link>
          </li>
          <li>
            {c.links.soon.label} <span className="soon-tag">{c.links.soon.tag}</span>
          </li>
        </ul>

        <Link href="/" className="caption">{c.back}</Link>
      </main>
      <SiteFooter left={c.footer.left} middle={c.footer.middle} />
    </div>
  );
}
