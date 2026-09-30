import { SiteFooter } from "@/components/SiteFooter";
import { TrackedLink } from "@/components/TrackedLink";
import { content as c } from "@/lib/content";
import { seriesTag } from "@/lib/publication";

// Each still section of the home page is its own component, so any one of them can become a film scene
// (see components/film) by swapping it for a scene component in app/page.tsx. Status: docs in README.md.
const a = c.audiences;
const both = ["companies", "solo"] as const;
const Ill = () => <span className="ill">Illustrative</span>;

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
          {c.proofOfWork.rows.map((r) => {
            const href = "href" in r ? (r.href as string | null) : undefined;
            const cells = (
              <>
                <div>{r.client}</div>
                <div>{r.built}</div>
                <div className={r.miss ? "ink3" : undefined}>{r.changed}</div>
                <div className="ink3">
                  <div>{r.date}</div>
                  {r.illustrative && <Ill />}
                </div>
                <div className="go">{href !== undefined ? c.proofOfWork.linkLabel : null}</div>
              </>
            );
            // A row links to its receipt only when there is one; until then it is a plain row.
            return href !== undefined ? (
              <TrackedLink key={r.client} href={href} className="pow-cols pow-row note">
                {cells}
              </TrackedLink>
            ) : (
              <div key={r.client} className="pow-cols pow-row">
                {cells}
              </div>
            );
          })}
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
      <SiteFooter left={c.footer.left} middle={c.footer.middle} />
    
  );
}
