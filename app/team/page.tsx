import type { Metadata } from "next";
import Link from "next/link";
import { Mark } from "@/components/Mark";
import { SiteFooter } from "@/components/SiteFooter";
import { about } from "@/lib/about";
import teamJson from "@/content/team.json";

const c = teamJson;

export const metadata: Metadata = {
  alternates: { canonical: "/team" },
  title: c.meta.title,
  description: c.meta.description,
};

// /team: the people, the partners, where we work and how to check that we are registered.
// A partner is named only with a consent line on record (scripts/check-content.mjs fails the build without one).
export default function Team() {
  return (
    <div className="page">
      <Link href="/" className="brand" aria-label="Chiibitsu Labs, home">
        <Mark />
        <span className="wordmark">Chiibitsu Labs</span>
      </Link>
      <main className="tm">
        <div className="eyebrow">{c.hero.eyebrow}</div>
        <h1>{c.hero.h1}</h1>
        <p className="body">{c.hero.sub}</p>

        <h2>{c.people.heading}</h2>
        <div className="tm-people">
          {c.people.items.map((p) => {
            const tags: string[] = p.tags;
            return (
              <article key={p.name} className="tm-card">
                <h3 className="tm-name">{p.name}</h3>
                <div className="tm-role">{p.role}</div>
                {tags.length > 0 && (
                  <ul className="tm-tags" aria-label="Disciplines">
                    {tags.map((t) => (
                      <li key={t} className="soon-tag">{t}</li>
                    ))}
                  </ul>
                )}
                <p className="body">{p.body}</p>
                {p.external ? (
                  <a className="tm-go" href={p.href} target="_blank" rel="noopener noreferrer">{p.link}</a>
                ) : (
                  <Link className="tm-go" href={p.href}>{p.link}</Link>
                )}
              </article>
            );
          })}
        </div>
        <article className="tm-card tm-ghost">
          <h3 className="tm-name">{c.people.ghost.title}</h3>
          <p className="body">{c.people.ghost.body}</p>
        </article>

        <h2>{c.partners.heading}</h2>
        <div className="tm-people">
          {c.partners.items.map((p) => (
            <article key={p.name} className="tm-card">
              <h3 className="tm-name">{p.name}</h3>
              <p className="body">{p.body}</p>
            </article>
          ))}
          <article className="tm-card tm-more">
            <p className="body">{c.partners.more.body}</p>
            <Link className="tm-go" href={c.partners.more.href}>{c.partners.more.link}</Link>
          </article>
        </div>

        <h2>{c.where.heading}</h2>
        <dl className="ledger-facts">
          {c.where.rows.map((r) => (
            <div key={r.k} className="ledger-row">
              <dt className="caption">{r.k}</dt>
              <dd>{r.v}</dd>
            </div>
          ))}
        </dl>

        <h2>{c.registration.heading}</h2>
        <p className="body">{about.legal.text}.</p>
        <dl className="ledger-facts">
          {c.registration.rows.map((r) => (
            <div key={r.k} className="ledger-row">
              <dt className="caption">{r.k}</dt>
              <dd>{r.v}</dd>
            </div>
          ))}
        </dl>
        <p className="caption">{c.registration.note}</p>

        <div className="tm-pair">
          <section>
            <h2>{c.verify.heading}</h2>
            <p className="body">{c.verify.body}</p>
            <Link className="tm-go" href={c.verify.href}>{c.verify.link}</Link>
          </section>
          <section>
            <h2>{c.join.heading}</h2>
            <p className="body">{c.join.body}</p>
            <Link className="tm-go" href={c.join.href}>{c.join.link}</Link>
          </section>
        </div>

        <Link href="/" className="caption">{c.back}</Link>
      </main>
      <SiteFooter left={c.footer.left} middle={c.footer.middle} />
    </div>
  );
}
