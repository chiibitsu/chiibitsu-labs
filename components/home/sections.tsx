import { SiteFooter } from "@/components/SiteFooter";
import { TrackedLink } from "@/components/TrackedLink";
import { content as c } from "@/lib/content";
import { seriesTag } from "@/lib/publication";
import { AikiriText } from "@/components/AikiriText";

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

// Publication and Papers share one layout: three cards, each "Coming soon", no dates.
export function Publication() {
  const p = c.publication;
  return (
      <section id="publication" className="section" style={{ gap: 24 }}>
        <div className="week-head">
          <div className="head-tag">
            <h2>{p.heading}</h2>
            <span className="soon-tag">{p.soon}</span>
          </div>
          {"href" in p && typeof p.href === "string" && (
            <TrackedLink href={p.href} className="more" event="cta_click" eventProps={{ location: "publication" }}>{p.followLabel}</TrackedLink>
          )}
        </div>
        <div className="posts">
          {p.posts.map((x) => (
            <div key={x.title} className="post">
              <span className="meta">{p.soon}</span>
              <span className="nt">{x.title}</span>
            </div>
          ))}
        </div>
      </section>
  );
}

export function Papers() {
  const p = c.papers;
  return (
      <section id="papers" className="section" style={{ gap: 24 }}>
        <div className="week-head">
          <div className="head-tag">
            <h2>{p.heading}</h2>
            <span className="soon-tag">{p.soon}</span>
          </div>
        </div>
        <div className="posts">
          {p.items.map((x) => (
            <div key={x.title} className="post">
              <span className="meta">{p.soon}</span>
              <span className="nt">{x.title}</span>
            </div>
          ))}
        </div>
      </section>
  );
}

export function Investors() {
  const d = c.investors.dataRoom;
  const mail = `mailto:${d.email}?subject=${encodeURIComponent(d.subject)}&body=${encodeURIComponent(d.body)}`;
  return (
      <section id="investors" className="investors">
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <h2>{c.investors.heading}</h2>
          <div className="line"><AikiriText text={c.investors.line} where="home_investors" /></div>
          <div className="body">{c.investors.sub}</div>
        </div>
        <div className="links">
          <TrackedLink href={mail} event="cta_click" eventProps={{ location: "investors_data_room" }}>
            {d.label}
          </TrackedLink>
          <TrackedLink href="/ledger" event="cta_click" eventProps={{ location: "investors_ledger" }}>
            Verify the ledger →
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
