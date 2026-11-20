import type { Metadata } from "next";
import Link from "next/link";
import { Mark } from "@/components/Mark";
import { SiteFooter } from "@/components/SiteFooter";
import networkJson from "@/content/network.json";

const c = networkJson;

export const metadata: Metadata = {
  alternates: { canonical: "/network" },
  title: c.meta.title,
  description: c.meta.description,
};

// /network: about the Aikiri Network. The technical page is /ledger; the tools are at /network/check.
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

        <h2>{c.why.heading}</h2>
        <p className="body">{c.why.intro}</p>
        <div className="ang-cols3">
          {c.why.items.map((it) => (
            <div key={it.title} className="ang-col">
              <div className="eyebrow">{it.label}</div>
              <div className="ang-col-t sm">{it.title}</div>
              <div className="body">{it.body}</div>
            </div>
          ))}
        </div>
        <p className="caption">{c.why.status}</p>

        <h2>{c.how.heading}</h2>
        <div className="ang-cols3">
          {c.how.items.map((it) => (
            <div key={it.title} className="ang-col">
              <div className="eyebrow">{it.label}</div>
              <div className="ang-col-t sm">{it.title}</div>
              <div className="body">{it.body}</div>
            </div>
          ))}
        </div>

        <h2>{c.today.heading}</h2>
        <ul className="net-today">
          {c.today.items.map((it) => (
            <li key={it.title}>
              <span className="ang-col-t sm">{it.title}</span>
              <span className="body">{it.body}</span>
              {"href" in it && it.href ? (
                <Link href={it.href} className="net-link">{it.linkLabel}</Link>
              ) : (
                <span className="soon-tag">{"tag" in it ? it.tag : ""}</span>
              )}
            </li>
          ))}
        </ul>

        <Link href="/" className="caption">{c.back}</Link>
      </main>
      <SiteFooter left={c.footer.left} middle={c.footer.middle} />
    </div>
  );
}
