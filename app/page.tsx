import { AudienceSwitch } from "@/components/AudienceSwitch";
import { DayLayer } from "@/components/film/DayLayer";
import { FilmBar } from "@/components/film/FilmBar";
import { FilmProgress } from "@/components/film/FilmProgress";
import { HookScene } from "@/components/film/hook";
import { InviteScene } from "@/components/film/invite";
import { LetterScene, PathScene, WeekScene } from "@/components/film/scenes2";
import { TriptychScene } from "@/components/film/triptych";
import { HomeFooter, Investors, Papers, ProofOfWork, Publication, Run, Work } from "@/components/home/sections";
import { content as c } from "@/lib/content";
import { film } from "@/lib/film";

const both = ["companies", "solo"] as const;

// Home in scroll-film mode, six scenes: H1 the owner hook, H2 the founder's note, H3 what changes,
// H4 how it runs, H5 this week, H6 the invitation. Behind them runs "A day with the ghost team".
// Story goes in the film. What a visitor scans, compares or clicks through stays a still section after it,
// in the design board's order: who we've built with, how it runs (the diagram), proof of work, Publication, Papers, investors.
export default function Home() {
  const a = c.audiences;
  return (
    <>
      <FilmProgress />
      <FilmBar nav={c.nav} cta={c.cta} location="nav" shift={c.shift.label} />
      <main>
        <div className="film" data-film>
          {both.map((k) => (
            <HookScene
              key={k}
              aud={k}
              parts={[{ t: a[k].h1a }, { t: a[k].h1b, em: true }]}
              sub={a[k].sub}
              top={<AudienceSwitch labels={{ companies: a.companies.switchLabel, solo: a.solo.switchLabel }} />}
              secondary={a[k].secondary}
              youLabel="you"
            />
          ))}

          <LetterScene
            label={c.letter.label}
            open={c.letter.open}
            letters={{ companies: a.companies.letter, solo: a.solo.letter }}
            close={c.letter.close}
            signature={c.letter.signature}
            byline={c.letter.byline}
          />

          <TriptychScene label={c.changes.heading} items={c.changes.items} line={c.changes.seasoning} />

          <PathScene
            id="run"
            parts={[{ t: c.engage.heading }]}
            steps={c.engage.steps}
            cta={{ label: c.cta.label, href: c.cta.href, location: "run" }}
          />

          <WeekScene heading={c.week.heading} note={c.week.note} shift={c.shift.label} metrics={c.week.metrics} />

          <InviteScene
            id="engage"
            parts={[{ t: film.invite.h }, { t: film.invite.hEm, em: true }]}
            body={film.invite.body}
            cta={{ label: c.cta.label, href: c.cta.href, location: "engage" }}
          />

          <DayLayer />
        </div>

        <div className="page still">
          <Work />
          <Run />
          <ProofOfWork />
          <Publication />
          <Papers />
          <Investors />
          <HomeFooter />
        </div>
      </main>
    </>
  );
}
