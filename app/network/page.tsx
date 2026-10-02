import type { Metadata } from "next";
import Link from "next/link";
import { Mark } from "@/components/Mark";
import { NetworkTools } from "@/components/NetworkTools";
import { SiteFooter } from "@/components/SiteFooter";
import networkJson from "@/content/network.json";

const c = networkJson;

export const metadata: Metadata = {
  alternates: { canonical: "/network" },
  title: c.meta.title,
  description: c.meta.description,
};

// /network: the hasher and verifier for the Aikiri ledger. Record and "is this really us" are announced, not built.
export default function Network() {
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
        <NetworkTools />

        <h2>{c.how.heading}</h2>
        <ul className="body">
          {c.how.items.map((s) => (
            <li key={s}>{s}</li>
          ))}
        </ul>

        <h2>{c.soon.heading}</h2>
        <div className="ang-cols3 net-soon">
          {c.soon.items.map((it) => (
            <div key={it.title} className="ang-col">
              <div className="ang-col-t sm">{it.title}</div>
              <div className="body">{it.body}</div>
              <span className="soon-tag">{it.tag}</span>
            </div>
          ))}
        </div>

        <p className="body">
          How the ledger works, and its contract address, are on the <Link href="/ledger">ledger page</Link>.
        </p>
        <Link href="/" className="caption">{c.back}</Link>
      </main>
      <SiteFooter left={c.footer.left} middle={c.footer.middle} />
    </div>
  );
}
