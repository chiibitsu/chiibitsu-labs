import { Molecule } from "@/components/Molecule";
import { SiteFooter } from "@/components/SiteFooter";
import { TrackedLink } from "@/components/TrackedLink";
import { content as c } from "@/lib/content";
import { seriesTag } from "@/lib/publication";

// Each still section of the home page is its own component, so any one of them can become a film scene
// (see components/film) by swapping it for a scene component in app/page.tsx. Status: docs in README.md.
const a = c.audiences;
const both = ["companies", "solo"] as const;
const Ill = () => <span className="ill">Illustrative</span>;

export function Letter() {
  return (
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
  );
}

export function Work() {
  return (
      <section id="work" className="section" style={{ gap: 24 }}>
        <h2 className="w400">{c.work.heading}</h2>
        <div className="logos">
          {c.work.logos.map((l, i) => (
            <div key={i} className="logo">
              <span>{l.label}</span>
              {l.illustrative && <Ill />}
            </div>
          ))}
        </div>
        <div className="cards3">
          {c.work.cards.map((card) => (
            <TrackedLink key={card.client} href={card.href} className="work-card note">
              <div className="card-title nt">{card.client}</div>
              <div className="body">{card.built}</div>
              <div className="body" style={{ color: "var(--ink)" }}>{card.changed}</div>
              <div className="caption">
                {card.illustrative && <>Illustrative · </>}
                {card.date} →
              </div>
            </TrackedLink>
          ))}
        </div>
      </section>
  );
}

export function Run() {
  return (
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
  );
}

export function Week() {
  return (
      <section className="section" style={{ gap: 20 }}>
        <div className="week-head">
          <h2>{c.week.heading}</h2>
          <div className="ill" style={{ fontSize: 14 }}>{c.week.note}</div>
        </div>
        <div className="metrics">
          {c.week.metrics.map((m) => {
            const real = !m.illustrative;
            return (
              <div key={m.key} className="metric">
                <div className={real ? "figure real" : "figure"}>{m.value}</div>
                <TrackedLink href={m.href} className="more" event="metric_click" eventProps={{ metric: m.key }}>
                  {m.label} →
                </TrackedLink>
                {m.illustrative && <Ill />}
              </div>
            );
          })}
        </div>
      </section>
  );
}

export function ProofOfWork() {
  return (
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
            <TrackedLink key={r.client} href={r.href} className="pow-cols pow-row note">
              <div>{r.client}</div>
              <div>{r.built}</div>
              <div className={r.miss ? "ink3" : undefined}>{r.changed}</div>
              <div className="ink3">
                <div>{r.date}</div>
                {r.illustrative && <Ill />}
              </div>
              <div className="go">{c.proofOfWork.linkLabel}</div>
            </TrackedLink>
          ))}
        </div>
      </section>
  );
}

export function Publication() {
  return (
      <section id="publication" className="section" style={{ gap: 24 }}>
        <div className="week-head">
          <h2>{c.publication.heading}</h2>
          <TrackedLink href={null} className="more">{c.publication.allLabel}</TrackedLink>
        </div>
        <div className="posts">
          {c.publication.posts.map((p) => (
            <TrackedLink key={p.title} href={p.href} className="post note">
              <span className="meta">
                {seriesTag(p) && <><span className="tag">{seriesTag(p)}</span> · </>}
                {p.date}
                {p.illustrative && <> · <span className="ill">Illustrative</span></>}
              </span>
              <span className="nt">{p.title}</span>
              <span className="summary">{p.summary}</span>
              <span className="go">{c.publication.readLabel}</span>
            </TrackedLink>
          ))}
        </div>
      </section>
  );
}

export function Working() {
  return (
      <section id="working" className="section" style={{ gap: 32 }}>
        <h2>{c.engage.heading}</h2>
        <ol className="steps" style={{ listStyle: "none", margin: 0, padding: 0 }}>
          {c.engage.steps.map((s, i) => (
            <li key={s.title} className="step">
              <span className="step-dot" aria-hidden="true">{i + 1}</span>
              <div className="card-title">{s.title}</div>
              <div className="body">{s.body}</div>
            </li>
          ))}
        </ol>
        <TrackedLink href={c.cta.href} className="btn big engage-cta" event="cta_click" eventProps={{ location: "working" }}>
          {c.cta.label}
        </TrackedLink>
      </section>
  );
}

export function Papers() {
  return (
      <section id="papers">
        <TrackedLink href={c.papers.href} className="papers-row note" event="papers_click">
          <span className="nt">{c.papers.title}</span>
          <span className="caption">
            {c.papers.meta}
            {c.papers.illustrative && <> · <span className="ill">Illustrative</span></>}
          </span>
          <span className="go">{c.papers.linkLabel}</span>
        </TrackedLink>
      </section>
  );
}

export function Investors() {
  return (
      <section id="investors" className="investors">
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <h2>{c.investors.heading}</h2>
          <div className="line">{c.investors.line}</div>
          <div className="body">{c.investors.sub}</div>
        </div>
        <div className="links">
          <TrackedLink href={c.investors.decisionLog.href}>{c.investors.decisionLog.label}</TrackedLink>
          <TrackedLink href={c.investors.dataRoom.href} event="cta_click" eventProps={{ location: "investors_data_room" }}>
            {c.investors.dataRoom.label}
          </TrackedLink>
        </div>
      </section>
  );
}

export function HomeFooter() {
  return (
      <SiteFooter left={c.footer.left} middle={c.footer.middle} updated={c.meta.updated} />
    
  );
}
