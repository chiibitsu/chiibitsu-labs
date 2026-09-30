import type { Metadata } from "next";
import { SiteFooter } from "@/components/SiteFooter";
import { HeroCompanies, HeroSolo, DecideLess, Network, SeeEverything, TrustReceipt } from "@/components/art/art";
import { AudienceSwitch } from "@/components/AudienceSwitch";
import { Investors, Papers, Publication } from "@/components/home/sections";
import { Mark } from "@/components/Mark";
import { Molecule } from "@/components/Molecule";
import { TrackedLink } from "@/components/TrackedLink";
import { content as c } from "@/lib/content";
import { proof } from "@/lib/proof";

const both = ["companies", "solo"] as const;
const Ill = () => <span className="ill">Illustrative</span>;
const art = { see: SeeEverything, decide: DecideLess, trust: TrustReceipt } as const;

export const metadata: Metadata = {
  title: "Chiibitsu Labs · home, lab-notebook version",
  robots: { index: false },
};

// The still lab-notebook home page, kept alongside the scroll film at /. Same content file, same plumbing.
export default function StillHome() {
  const a = c.audiences;
  return (
    <div className="page">
      <header className="head">
        <div className="head-row">
          <a href="#top" className="brand" aria-label="Chiibitsu Labs, top of page">
            <Mark />
            <span className="wordmark">Chiibitsu Labs</span>
          </a>
          <nav className="nav" aria-label="Main">
            {c.nav.map((n) => (
              <a key={n.href} href={n.href}>{n.label}</a>
            ))}
            <TrackedLink href={c.cta.href} className="btn" event="cta_click" eventProps={{ location: "nav" }}>
              {c.cta.label}
            </TrackedLink>
          </nav>
        </div>
        <div className="sub-strip">
          <AudienceSwitch labels={{ companies: a.companies.switchLabel, solo: a.solo.switchLabel }} />
        </div>
      </header>

      <section id="top" className="hero">
        <div className="hero-copy">
          {both.map((k) => (
            <h1 key={k} data-aud={k}>
              {a[k].h1a} <em>{a[k].h1b}</em>
            </h1>
          ))}
          <svg className="underline-draw" viewBox="0 0 420 18" width="420" height="18" aria-hidden="true">
            <path style={{ stroke: "var(--accent)" }} className="draw" d="M4 12 C80 4 180 16 260 8 S380 6 416 10" fill="none" strokeWidth="3" strokeLinecap="round" />
          </svg>
          {both.map((k) => (
            <p key={k} className="hero-sub" data-aud={k}>{a[k].sub}</p>
          ))}
          <div className="hero-cta">
            <TrackedLink href={c.cta.href} className="btn big" event="cta_click" eventProps={{ location: "hero" }}>
              {c.cta.label}
            </TrackedLink>
            {both.map((k) => (
              <a key={k} data-aud={k} className="link" href={a[k].secondary.href}>{a[k].secondary.label}</a>
            ))}
          </div>
        </div>
        <HeroCompanies className="art" data-aud="companies" />
        <HeroSolo className="art" data-aud="solo" />
      </section>

      <section className="letter">
        <div className="eyebrow">A note<br />from the founder</div>
        <div className="letter-body">
          <p>{c.letter.open}</p>
          {both.map((k) => (
            <p key={k} data-aud={k}>{a[k].letter}</p>
          ))}
          <p>{c.letter.close}</p>
          <div>
            <div className="signature">{c.letter.signature}</div>
            <div className="byline">{c.letter.byline}</div>
          </div>
        </div>
      </section>

      <section className="section">
        <h2>{c.changes.heading}</h2>
        <div className="changes">
          {c.changes.items.map((it) => {
            const Art = art[it.art as keyof typeof art];
            return (
              <div key={it.title} className="change">
                <Art />
                <div className="card-title">{it.title}</div>
                <div className="body">{it.body}</div>
              </div>
            );
          })}
        </div>
        <div className="seasoning">
          <Network aria-hidden="true" role="presentation" />
          <p>{c.changes.seasoning}</p>
        </div>
      </section>

      <section id="work" className="section" style={{ gap: 24 }}>
        <h2 className="w400">{proof.scene.heading}</h2>
        {both.map((k) => (
          <div key={k} data-aud={k} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div className="cards3">
              {proof.cards[k].map((card) => (
                <div key={card.industry} className="work-card note">
                  <div className="card-title nt">{card.industry}</div>
                  <div className="body"><span className="proof-k">Need</span> {card.need}</div>
                  <div className="body"><span className="proof-k">Built</span> {card.solution}</div>
                  <div className="body" style={{ color: "var(--ink)" }}><span className="proof-k">Result</span> {card.result}</div>
                  <div className="caption">{card.date}</div>
                </div>
              ))}
            </div>
          </div>
        ))}
        <p className="caption">{proof.scene.note}</p>
      </section>

      <section id="run" className="run">
        <div className="run-copy">
          {both.map((k) => (
            <h2 key={k} className="w400" data-aud={k}>{a[k].run}</h2>
          ))}
          {both.map((k) => (
            <p key={k} className="caption" data-aud={k} style={{ fontSize: 16 }}>{a[k].proof}</p>
          ))}
          {c.run.illustrative && <Ill />}
        </div>
        <Molecule
          labels={c.run.moleculeLabels}
          human={{
            companies: { name: a.companies.humanName, note: a.companies.humanNote },
            solo: { name: a.solo.humanName, note: a.solo.humanNote },
          }}
        />
      </section>

      <section className="section" style={{ gap: 20 }}>
        <div className="week-head">
          <h2>{proof.record.heading}</h2>
          <div className="caption">{proof.record.note}</div>
        </div>
        <div className="metrics">
          {proof.record.figures.map((m) => (
            <div key={m.value} className="metric">
              <div className="figure real">{m.value}</div>
              <div className="more">{m.label}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="section" style={{ gap: 18 }}>
        <div className="pow-head">
          <h2>{c.proofOfWork.heading}</h2>
          <div className="ill" style={{ fontSize: 14 }}>{c.proofOfWork.note}</div>
        </div>
        <div className="pow">
          <div className="pow-cols pow-headrow">
            {c.proofOfWork.columns.map((h) => (
              <div key={h}>{h}</div>
            ))}
            <div />
          </div>
          {c.proofOfWork.rows.map((r) => (
            <div key={r.client} className="pow-cols pow-row">
              <div>{r.client}</div>
              <div>{r.built}</div>
              <div className={r.miss ? "ink3" : undefined}>{r.changed}</div>
              <div className="ink3">
                <div>{r.date}</div>
                {r.illustrative && <Ill />}
              </div>
              <div />
            </div>
          ))}
        </div>
      </section>

      <Publication />

      <Papers />

      <Investors />

      <SiteFooter left={c.footer.left} middle={c.footer.middle} />
    </div>
  );
}
