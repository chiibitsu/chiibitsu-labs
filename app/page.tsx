import { AudienceSwitch } from "@/components/AudienceSwitch";
import { DayLayer } from "@/components/film/DayLayer";
import { FilmBar } from "@/components/film/FilmBar";
import { FilmProgress } from "@/components/film/FilmProgress";
import { HookScene } from "@/components/film/hook";
import { InviteScene } from "@/components/film/invite";
import { ProofScene, RecordScene, RunScene } from "@/components/film/proof";
import { LetterScene, PathScene } from "@/components/film/scenes2";
import { TriptychScene } from "@/components/film/triptych";
import { HomeFooter, Investors, Papers, ProofOfWork, Publication } from "@/components/home/sections";
import { content as c } from "@/lib/content";
import { film } from "@/lib/film";
import { proof } from "@/lib/proof";

const both = ["companies", "solo"] as const;

// Home in scroll-film mode, eight scenes: the owner hook, the founder's note, what changes, who we've built with,
// working with us (the path), how it runs (the diagram), the record (four counts), the invitation.
// Behind them runs "A day with the ghost team". What a visitor scans, compares or clicks through stays a still
// section after the film: proof of work, Publication, Papers, investors.
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

          <ProofScene id="proof" heading={proof.scene.heading} marks={proof.scene.marks} cards={proof.cards} note={proof.scene.note} />

          <PathScene
            id="working"
            parts={[{ t: c.engage.heading }]}
            steps={c.engage.steps}
            cta={{ label: c.cta.label, href: c.cta.href, location: "run" }}
          />

          <RunScene
            id="how-it-runs"
            heads={{ companies: a.companies.run, solo: a.solo.run }}
            proofs={{ companies: a.companies.proof, solo: a.solo.proof }}
            labels={c.run.moleculeLabels}
            human={{
              companies: { name: a.companies.humanName, note: a.companies.humanNote },
              solo: { name: a.solo.humanName, note: a.solo.humanNote },
            }}
          />

          <RecordScene heading={proof.record.heading} note={proof.record.note} figures={proof.record.figures} />

          <InviteScene
            id="engage"
            parts={[{ t: film.invite.h }, { t: film.invite.hEm, em: true }]}
            body={film.invite.body}
            cta={{ label: c.cta.label, href: c.cta.href, location: "engage" }}
          />

          <DayLayer />
        </div>

        <div className="page still">
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
