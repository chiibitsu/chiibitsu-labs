import type { Metadata } from "next";
import Link from "next/link";
import { Mark } from "@/components/Mark";
import { SiteFooter } from "@/components/SiteFooter";
import { emails } from "@/lib/emails";
import { mailto } from "@/lib/mail";
import careersJson from "@/content/careers.json";

const c = careersJson;

export const metadata: Metadata = {
  alternates: { canonical: "/careers" },
  title: c.meta.title,
  description: c.meta.description,
};

// One open role. Add one to `roles.items` in content/careers.json to list it; with none, the page says so.
// `href` is optional: without it the arrow opens an email to labs@chiibitsu.com about that role.
type Role = { title: string; where: string; type: string; href?: string };
const roles: Role[] = c.roles.items;

export default function Careers() {
  return (
    <div className="page">
      <Link href="/" className="brand" aria-label="Chiibitsu Labs, home">
        <Mark />
        <span className="wordmark">Chiibitsu Labs</span>
      </Link>
      <main className="cr">
        <header className="cr-hero">
          <div className="cr-eyebrow">{c.hero.eyebrow}</div>
          <h1 className="cr-h1">
            {c.hero.h1a}
            <em>{c.hero.h1b}</em>
          </h1>
          <p className="body">{c.hero.sub}</p>
          <a className="btn big cr-pill" href={mailto(emails.careers)}>{c.hero.cta} ↗</a>
        </header>

        <section className="cr-roles" aria-labelledby="cr-roles-h">
          <div className="cr-eyebrow" id="cr-roles-h">{c.roles.heading}</div>
          {roles.length > 0 ? (
            <ol className="cr-list">
              {roles.map((r, i) => (
                <li key={r.title}>
                  <a className="cr-row" href={r.href ?? mailto({ ...emails.careers, subject: `Careers: ${r.title}` })}>
                    <span className="cr-n">{String(i + 1).padStart(2, "0")}</span>
                    <span className="cr-t">{r.title}</span>
                    <span className="cr-w">{r.where}</span>
                    <span className="cr-k">{r.type}</span>
                    <span className="cr-go" aria-hidden="true">↗</span>
                  </a>
                </li>
              ))}
            </ol>
          ) : (
            <div className="cr-list">
              <div className="cr-row cr-none">
                <span className="cr-n">—</span>
                <span className="cr-t">{c.roles.empty.title}</span>
                <span className="cr-w">{c.roles.empty.body}</span>
                <span className="cr-k">{c.roles.empty.tag}</span>
              </div>
            </div>
          )}
          <p className="cr-outro">{c.outro}</p>
        </section>

        <Link href="/team" className="caption">Meet the team →</Link>
      </main>
      <SiteFooter left={c.footer.left} middle={c.footer.middle} />
    </div>
  );
}
