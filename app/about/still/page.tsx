import type { Metadata } from "next";
import { SiteFooter } from "@/components/SiteFooter";
import Image from "next/image";
import { Compare } from "@/components/Compare";
import { FlipCard } from "@/components/FlipCard";
import { Mark } from "@/components/Mark";
import { Reveal } from "@/components/Reveal";
import { TrackedLink } from "@/components/TrackedLink";
import { Fork, Network, Venn, WaveAI, WaveBlockchain, WaveMobility, WaveStartup } from "@/components/art/about-art";
import { stillAbout as c } from "@/lib/still";

export const metadata: Metadata = {
  title: `${c.meta.title} (lab-notebook version)`,
  robots: { index: false },
  description: c.meta.description,
};

const Ill = () => <span className="ill">Illustrative</span>;
const waveArt = {
  startup: WaveStartup,
  mobility: WaveMobility,
  blockchain: WaveBlockchain,
  ai: WaveAI,
} as const;

// The still lab-notebook /about, kept alongside the scroll film at /about. Its copy lives in content/still/about.json.
export default function StillAbout() {
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
            <TrackedLink href={c.cta.href} className="btn" event="cta_click" eventProps={{ location: "about_nav" }}>
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

      <section className="ir-hero ab">
        <div className="eyebrow">{c.hero.eyebrow}</div>
        <h1>
          {c.hero.h1a} <em>{c.hero.h1b}</em>
        </h1>
        <svg className="underline-draw" viewBox="0 0 420 18" width="420" height="18" aria-hidden="true">
          <path style={{ stroke: "var(--accent)" }} className="draw" d="M4 12 C80 4 180 16 260 8 S380 6 416 10" fill="none" strokeWidth="3" strokeLinecap="round" />
        </svg>
        <p className="hero-sub" style={{ maxWidth: 820, fontSize: 26 }}>{c.hero.sub}</p>
      </section>

      <section className="section" style={{ gap: 40 }}>
        <p className="body" style={{ maxWidth: 860 }}>{c.waves.intro}</p>
        <Reveal className="waves">
          {c.waves.items.map((w) => {
            const Art = waveArt[w.art as keyof typeof waveArt];
            return (
              <div key={w.n} className="wave">
                {w.current && <div className="here">{c.waves.here}</div>}
                <Art className="wave-art" />
                <div className="wave-h">
                  <span className="n">{w.n}</span>
                  <span className="wt" style={w.current ? { color: "var(--accent)" } : undefined}>{w.title}</span>
                </div>
                <div className="body">{w.body}</div>
              </div>
            );
          })}
        </Reveal>
      </section>

      <section className="split">
        <div className="split-copy">
          <div className="eyebrow">{c.closes.eyebrow}</div>
          <div className="lead-h">
            {c.closes.h} <em>{c.closes.hEm}</em>
          </div>
          <div className="body">{c.closes.body}</div>
          <div className="mid-line">{c.closes.line}</div>
        </div>
        <div className="venn">
          <Venn className="venn-art" />
          <div className="venn-l" style={{ left: "11.5%", top: "14.3%" }}>{c.closes.labels.systems}</div>
          <div className="venn-l" style={{ left: "70.8%", top: "14.3%" }}>{c.closes.labels.behavior}</div>
          <div className="venn-l" style={{ left: "37.7%", top: "78.6%", color: "var(--accent)" }}>{c.closes.labels.tech}</div>
          <div className="venn-c">{c.closes.labels.center}</div>
        </div>
      </section>

      <section id="changes" className="section" style={{ gap: 24 }}>
        <div className="week-head">
          <h2>{c.changes.heading}</h2>
          <div className="caption"><span className="hov">{c.changes.hintHover}</span><span className="tap">{c.changes.hintTap}</span></div>
        </div>
        <div className="flips">
          {c.changes.cards.map((f) => (
            <FlipCard key={f.today} today={f.today} after={f.after} note={f.note} labels={c.changes} />
          ))}
        </div>
      </section>

      <section className="knows">
        <div className="eyebrow">{c.knows.eyebrow}</div>
        <div className="knows-h">
          {c.knows.h} <em>{c.knows.hEm}</em>
        </div>
        <Compare
          without={c.knows.without}
          with={c.knows.with}
          hint={c.knows.hint}
          loseAlt={c.knows.loseAlt}
          keepAlt={c.knows.keepAlt}
          lose={c.knows.lose}
          keep={c.knows.keep}
        />
        <div className="mid-line" style={{ color: "var(--ink-2)", maxWidth: 860 }}>{c.knows.line}</div>
      </section>

      <section className="long-bet">
        <Network className="long-bet-art" aria-hidden="true" role="presentation" />
        <div className="long-bet-copy">
          <div className="lb-h">
            {c.longBet.h} <em>{c.longBet.hEm}</em>
          </div>
          <div className="body" style={{ maxWidth: 820 }}>{c.longBet.body}</div>
          <TrackedLink href={c.longBet.link.href} className="more" event="papers_click" eventProps={{ location: "about" }}>
            <span style={{ color: "var(--accent)" }}>{c.longBet.link.label}</span>
          </TrackedLink>
        </div>
      </section>

      <section className="section" style={{ gap: 18 }}>
        <div className="week-head">
          <h2>{c.proof.heading}</h2>
          <div className="caption">{c.proof.note}</div>
        </div>
        <div className="figs">
          {c.proof.figures.map((f) => (
            <div key={f.value} className="fig">
              <div className={f.illustrative ? "figure" : "figure real"}>{f.value}</div>
              <div className="body">{f.label}</div>
              {f.illustrative && <Ill />}
            </div>
          ))}
        </div>
      </section>

      <section className="section" style={{ gap: 28 }}>
        <h2>{c.work.heading}</h2>
        <ol className="steps steps4" style={{ listStyle: "none", margin: 0, padding: 0 }}>
          {c.work.steps.map((s, i) => (
            <li key={s.title} className="step">
              <span className="step-dot" aria-hidden="true">{i + 1}</span>
              <div className="card-title" style={{ fontSize: 24 }}>{s.title}</div>
              <div className="body">{s.body}</div>
            </li>
          ))}
        </ol>
      </section>

      <section className="split choice">
        <div className="split-copy">
          <div className="eyebrow">{c.choice.eyebrow}</div>
          <div className="lead-h">
            {c.choice.h} <em>{c.choice.hEm}</em>
          </div>
          <div className="body">{c.choice.body}</div>
        </div>
        <Reveal className="fork">
          <Fork className="fork-art" role="img" aria-label={c.choice.alt} />
          <div className="fork-labels">
            <span className="fork-l t">{c.choice.labels.top}</span>
            <span className="fork-l m" style={{ color: "var(--accent)" }}>{c.choice.labels.mid}</span>
            <span className="fork-l b">{c.choice.labels.bottom}</span>
          </div>
        </Reveal>
      </section>

      <section className="founder">
        <div className="portrait">
          <Image src="/angeline.jpg" alt={c.founder.photoAlt} fill sizes="200px" style={{ objectFit: "cover", objectPosition: "50% 30%" }} />
        </div>
        <div className="founder-copy">
          <div className="eyebrow">{c.founder.eyebrow}</div>
          <div className="founder-name">{c.founder.name}</div>
          <div className="caption" style={{ fontSize: 16 }}>{c.founder.role}</div>
          <div className="mid-line" style={{ maxWidth: 720 }}>
            {c.founder.line} <em>{c.founder.lineEm}</em>
          </div>
          <div className="body" style={{ maxWidth: 680 }}>{c.founder.body}</div>
          <TrackedLink href={c.founder.link.href} className="more">
            <span style={{ color: "var(--accent)" }}>{c.founder.link.label}</span>
          </TrackedLink>
        </div>
      </section>

      <section id="engage" className="about-cta">
        <div className="cta-h">
          {c.engage.h} <em>{c.engage.hEm}</em>
        </div>
        <div className="body" style={{ maxWidth: 720 }}>{c.engage.body}</div>
        <TrackedLink href={c.cta.href} className="btn big" event="cta_click" eventProps={{ location: "about_cta" }}>
          {c.cta.label}
        </TrackedLink>
        <TrackedLink href={c.engage.solo.href} className="more" event="audience_switch" eventProps={{ to: "solo", from: "about" }}>
          {c.engage.solo.label}
        </TrackedLink>
      </section>

      <SiteFooter left={c.footer.left} middle={c.footer.middle} updated={c.meta.updated} />
    </div>
  );
}
