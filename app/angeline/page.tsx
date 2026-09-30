import type { Metadata } from "next";
import Image from "next/image";
import { Mark } from "@/components/Mark";
import { SiteFooter } from "@/components/SiteFooter";
import { TrackedLink } from "@/components/TrackedLink";
import { angeline as c } from "@/lib/angeline";

export const metadata: Metadata = {
  title: c.meta.title,
  description: c.meta.description,
};

const Ill = () => <span className="ill">Illustrative</span>;

// /angeline: the founder page. Still lab-notebook style. Every career figure is illustrative until dated and sourced.
export default function Angeline() {
  return (
    <div className="page">
      <header className="head">
        <div className="head-row">
          <TrackedLink href="/" className="brand">
            <Mark />
            <span className="wordmark">Chiibitsu Labs</span>
          </TrackedLink>
          <nav className="nav" aria-label="Main">
            {c.nav.map((n) => (
              <TrackedLink key={n.label} href={n.href}>{n.label}</TrackedLink>
            ))}
            <TrackedLink href={c.cta.href} className="btn" event="cta_click" eventProps={{ location: "angeline_nav" }}>
              {c.cta.label}
            </TrackedLink>
          </nav>
        </div>
        <div className="sub-strip">
          <span className="caption">{c.strip}</span>
          <div className="shift">
            <span className="dot">●</span> {c.shift.label} <span className="ill">· Illustrative</span>
          </div>
        </div>
      </header>

      <section className="ang-hero">
        <div className="ang-hero-copy">
          <div className="eyebrow">{c.hero.eyebrow}</div>
          <h1 className="ang-name">{c.hero.name}</h1>
          <div className="ang-legal-name">{c.hero.legalName}</div>
          <svg className="underline-draw" viewBox="0 0 420 18" width="200" height="18" aria-hidden="true">
            <path style={{ stroke: "var(--accent)" }} className="draw" d="M4 12 C80 4 180 16 260 8 S380 6 416 10" fill="none" strokeWidth="3" strokeLinecap="round" />
          </svg>
          <p className="hero-sub">{c.hero.line}</p>
          <div className="ang-facts">
            {c.hero.facts.map((f) => (
              <span key={f}>{f}</span>
            ))}
          </div>
        </div>
        <div className="ang-photo">
          <Image src="/angeline.jpg" alt={c.hero.photoAlt} fill priority sizes="(max-width: 900px) 260px, 320px" style={{ objectFit: "cover", objectPosition: "50% 30%" }} />
        </div>
      </section>

      <section className="section" style={{ gap: 28 }}>
        <h2>{c.now.heading}</h2>
        <div className="ang-cols3">
          {c.now.items.map((it) => (
            <div key={it.n} className="ang-col">
              <div className="eyebrow">{it.n}</div>
              <div className="ang-col-t">{it.title}</div>
              <div className="body">{it.body}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="section" style={{ gap: 18 }}>
        <div className="ang-sec-head">
          <h2>{c.outcomes.heading}</h2>
          <div className="caption">{c.outcomes.note}</div>
        </div>
        <div className="ang-figs">
          {c.outcomes.figures.map((f) => (
            <div key={f.value} className="ang-fig">
              <div className="figure ang-figure">{f.value}</div>
              <div className="body">{f.label}</div>
              {f.illustrative && <Ill />}
            </div>
          ))}
        </div>
      </section>

      <section className="section" style={{ gap: 22 }}>
        <div className="ang-sec-head">
          <h2>{c.road.heading}</h2>
          <div className="caption">
            {c.road.note} {c.road.illustrative && <>· <Ill /></>}
          </div>
        </div>
        <ol className="ang-road">
          {c.road.items.map((r) => (
            <li key={r.dates} className={`ang-road-row${"current" in r && r.current ? " current" : ""}`}>
              <svg className="ang-dot" viewBox="0 0 20 20" aria-hidden="true">
                {"current" in r && r.current ? (
                  <circle style={{ fill: "var(--accent)" }} className="glow" cx="10" cy="10" r="7" />
                ) : (
                  <circle style={{ fill: "var(--ground)", stroke: "var(--ink)" }} cx="10" cy="10" r="6" strokeWidth="1.4" />
                )}
              </svg>
              <div className="caption">{r.dates}</div>
              <div className="ang-road-role">
                <span className="ang-road-t">{r.title}</span>
                <span className="ang-road-org">{r.org}</span>
              </div>
              <div className="body">{r.body}</div>
            </li>
          ))}
        </ol>
      </section>

      <section className="section" style={{ gap: 22 }}>
        <div className="ang-cols3">
          {c.background.items.map((it) => (
            <div key={it.label} className="ang-col">
              <div className="eyebrow">{it.label}</div>
              <div className="ang-col-t sm">{it.title}</div>
              {"body" in it && it.body && <div className="body">{it.body}</div>}
            </div>
          ))}
        </div>
        <div className="caption">{c.background.reach}</div>
      </section>

      <section className="section" style={{ gap: 22 }}>
        <h2>{c.verify.heading}</h2>
        <div className="ang-verify">
          {c.verify.items.map((it) => (
            <TrackedLink key={it.title} href={it.href} className="note ang-note">
              <span className="nt">{it.title}</span>
              <span className="body">{it.body}</span>
              <span className="go">Open →</span>
            </TrackedLink>
          ))}
        </div>
      </section>

      <section id="engage" className="about-cta">
        <div className="cta-h">{c.engage.h}</div>
        <TrackedLink href={c.cta.href} className="btn big" event="cta_click" eventProps={{ location: "angeline_cta" }}>
          {c.cta.label}
        </TrackedLink>
        <div className="caption">
          {c.engage.press} · <a href={`mailto:${c.engage.email}`}>{c.engage.email}</a>
        </div>
      </section>

      <SiteFooter left={c.footer.left} middle={c.footer.middle} updated={c.meta.updated} />
    </div>
  );
}
