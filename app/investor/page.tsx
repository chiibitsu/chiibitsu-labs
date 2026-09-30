import type { Metadata } from "next";
import { FounderLink } from "@/components/FounderLink";
import { SiteFooter } from "@/components/SiteFooter";
import { DataRoom } from "@/components/art/ir-art";
import { Mark } from "@/components/Mark";
import { Molecule } from "@/components/Molecule";
import { TrackedLink } from "@/components/TrackedLink";
import { content as home } from "@/lib/content";
import { investor as c } from "@/lib/investor";

export const metadata: Metadata = {
  title: c.meta.title,
  description: c.meta.description,
  alternates: { canonical: "https://investor.chiibitsu.com" },
  // Flip to indexable when investor.chiibitsu.com is attached to this project.
  robots: { index: false },
};

const Ill = () => <span className="ill">Illustrative</span>;

export default function Investor() {
  const founder = { name: "Founder", note: "decides" };
  return (
    <div className="page">
      <header className="head">
        <div className="head-row">
          <a href="#top" className="brand" aria-label="Chiibitsu Labs investor relations, top of page">
            <Mark />
            <span className="wordmark">Chiibitsu Labs</span>
            <span className="ir-tag">{c.tag}</span>
          </a>
          <nav className="nav" aria-label="Main">
            {c.nav.map((n) => (
              <a key={n.href} href={n.href}>{n.label}</a>
            ))}
            <TrackedLink href={c.navCta.href} className="btn" event="cta_click" eventProps={{ location: "ir_nav" }}>
              {c.navCta.label}
            </TrackedLink>
          </nav>
        </div>
        <div className="sub-strip">
          <span className="caption">
            {c.strip.text} {c.strip.illustrative && <Ill />}
          </span>
        </div>
      </header>

      <section id="top" className="ir-hero">
        <div className="eyebrow">{c.hero.eyebrow}</div>
        <h1 id="bet">
          {c.hero.h1a} <em>{c.hero.h1b}</em>
        </h1>
        <svg className="underline-draw" viewBox="0 0 420 18" width="420" height="18" aria-hidden="true">
          <path style={{ stroke: "var(--accent)" }} className="draw" d="M4 12 C80 4 180 16 260 8 S380 6 416 10" fill="none" strokeWidth="3" strokeLinecap="round" />
        </svg>
        <p className="hero-sub">{c.hero.sub}</p>
        <div className="hero-cta">
          <TrackedLink href={c.hero.cta.href} className="btn big" event="cta_click" eventProps={{ location: "ir_hero" }}>
            {c.hero.cta.label}
          </TrackedLink>
          <a className="link" href={c.hero.secondary.href}>{c.hero.secondary.label}</a>
        </div>
      </section>

      <section className="pillars">
        {c.pillars.map((p) => (
          <div key={p.eyebrow} className="pillar">
            <div className="eyebrow" style={{ lineHeight: 1.4 }}>{p.eyebrow}</div>
            <div className="card-title">{p.title}</div>
            <div className="body">{p.body}</div>
          </div>
        ))}
      </section>

      <section id="week" className="section" style={{ gap: 18 }}>
        <div className="week-head">
          <h2>{c.week.heading}</h2>
          <div className="ill" style={{ fontSize: 14 }}>{c.week.note}</div>
        </div>
        <div className="metrics m5">
          {c.week.metrics.map((m) => {
            const real = !m.illustrative;
            return (
              <div key={m.key} className="metric">
                <div className="figure-row">
                  <div className={real ? "figure real" : "figure"}>{m.value}</div>
                  <div className={`delta ${m.falling ? "falling" : "rising"}${real ? " real" : ""}`}>
                    <span>{m.delta}</span>
                    <span>{m.pct}</span>
                  </div>
                </div>
                <TrackedLink href={m.href} className="more" event="metric_click" eventProps={{ metric: m.key }}>
                  {m.label} →
                </TrackedLink>
                {m.illustrative && <Ill />}
              </div>
            );
          })}
        </div>
        <div className="caption">{c.week.foot}</div>
      </section>

      <section id="projects" className="section" style={{ gap: 22 }}>
        <div className="week-head">
          <h2>{c.projects.heading}</h2>
          <div className="ill" style={{ fontSize: 14 }}>{c.projects.note}</div>
        </div>
        <div className="proj-cols">
          {c.projects.columns.map((col) => (
            <div key={col.label} className={`proj-col ${col.tone}`}>
              <div className="eyebrow" style={{ marginBottom: 6, lineHeight: 1.4 }}>{col.label}</div>
              {col.items.map((it) => (
                <TrackedLink key={it.title} href={it.href} className="proj-card note">
                  <span className="nt">{it.title}</span>
                  <span className="body">{it.body}</span>
                  <span className="status">
                    {it.status}
                    {it.illustrative && <> · <span className="ill">Illustrative</span></>}
                  </span>
                </TrackedLink>
              ))}
            </div>
          ))}
        </div>
      </section>

      <section className="section" style={{ gap: 24 }}>
        <h2>{c.next.heading}</h2>
        <div className="timeline">
          <svg viewBox="0 0 1104 20" preserveAspectRatio="none" aria-hidden="true">
            <line style={{ stroke: "var(--ink-3)" }} className="flow" x1="10" y1="10" x2="1094" y2="10" strokeWidth="1.2" />
          </svg>
          <div className="timeline-grid">
            {c.next.items.map((it) => (
              <div key={it.title} className="tl-item">
                <svg className="tl-dot" viewBox="0 0 20 20" aria-hidden="true">
                  {it.active ? (
                    <circle style={{ fill: "var(--accent)" }} className="glow" cx="10" cy="10" r="7" />
                  ) : (
                    <circle style={{ fill: "var(--ground)", stroke: "var(--ink)" }} cx="10" cy="10" r="7" strokeWidth="1.4" />
                  )}
                </svg>
                <div className="caption">
                  {it.date} {it.illustrative && <>· <span className="ill">Illustrative</span></>}
                </div>
                <div className="tl-title">{it.title}</div>
                <div className="body">{it.body}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="decisions" className="section" style={{ gap: 16 }}>
        <div className="week-head">
          <h2>{c.decisions.heading}</h2>
          <TrackedLink href={null} className="more">{c.decisions.allLabel}</TrackedLink>
        </div>
        <div>
          <div className="dec-cols dec-head">
            {c.decisions.columns.map((h) => (
              <div key={h}>{h}</div>
            ))}
            <div />
          </div>
          {c.decisions.rows.map((r) => (
            <TrackedLink key={r.decision + r.date} href={r.href} className="dec-cols dec-row note">
              <div className="ink3" style={{ color: "var(--ink-3)" }}>
                <div>{r.date}</div>
                {r.illustrative && <Ill />}
              </div>
              <div className="nt">{r.decision}</div>
              <div style={{ color: "var(--ink-2)", lineHeight: 1.6 }}>{r.why}</div>
              <div className="go">{c.decisions.readLabel}</div>
            </TrackedLink>
          ))}
        </div>
        <div className="caption">{c.decisions.foot}</div>
      </section>

      <section className="team">
        <div className="team-copy">
          <h2>{c.team.heading}</h2>
          <div className="body">{c.team.line}</div>
          <TrackedLink href={c.team.founder.href} className="team-item note">
            <span className="nt card-title" style={{ fontSize: 24 }}>{c.team.founder.name}</span>
            <span className="body">{c.team.founder.role}</span>
            <span className="go">{c.team.founder.link}</span>
          </TrackedLink>
          <div className="team-item">
            <span className="card-title" style={{ fontSize: 22 }}>{c.team.ghost.title}</span>
            <span className="body"><FounderLink>{c.team.ghost.body}</FounderLink></span>
            {c.team.illustrative && <Ill />}
          </div>
        </div>
        <Molecule labels={home.run.moleculeLabels} human={{ companies: founder, solo: founder }} />
      </section>

      <section id="papers" className="section" style={{ gap: 14 }}>
        <h2>{c.papers.heading}</h2>
        {c.papers.items.map((p) => (
          <TrackedLink key={p.title} href={p.href} className="paper-row note" event="papers_click" eventProps={{ paper: p.title }}>
            <span className="nt">{p.title}</span>
            <span style={{ fontFamily: "var(--mono)", fontSize: 14 }}>
              <Ill /> <span className="go">{c.papers.readLabel}</span>
            </span>
          </TrackedLink>
        ))}
        <div className="caption">
          <FounderLink>{c.papers.foot}</FounderLink>{" "}
          <a href={c.papers.footLink.href}>{c.papers.footLink.label}</a>
        </div>
      </section>

      <section id="room" className="room">
        <DataRoom role="img" aria-label="A folder of documents behind a lock" />
        <div className="room-copy">
          <h2>{c.room.heading}</h2>
          <div className="body">{c.room.body}</div>
          <TrackedLink href={c.room.cta.href} className="btn big" event="cta_click" eventProps={{ location: "ir_room" }}>
            {c.room.cta.label}
          </TrackedLink>
          <div className="caption">{c.room.disclaimer}</div>
        </div>
      </section>

      <SiteFooter left={c.footer.left} middle={c.footer.middle} />
    </div>
  );
}
