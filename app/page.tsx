import { AudienceSwitch } from "@/components/AudienceSwitch";
import { FilmBar } from "@/components/film/FilmBar";
import { FilmProgress } from "@/components/film/FilmProgress";
import { HookScene } from "@/components/film/hook";
import { InviteScene } from "@/components/film/invite";
import { NumbersScene } from "@/components/film/numbers";
import { DoorScene, SpheresScene } from "@/components/film/scenes";
import { TriptychScene } from "@/components/film/triptych";
import { HomeFooter, Investors, Letter, Papers, ProofOfWork, Publication, Run, Week, Work } from "@/components/home/sections";
import { content as c } from "@/lib/content";
import { film } from "@/lib/film";

const both = ["companies", "solo"] as const;

// Home in scroll-film mode. Scenes, in order: the owner hook, See everything / Decide less / Trust every result,
// the door, the spheres, the numbers, the invitation. The sections below the film are still plain sections,
// each its own component in components/home/sections.tsx, waiting to become scenes one at a time.
export default function Home() {
  const a = c.audiences;
  return (
    <>
      <FilmProgress />
      <FilmBar nav={c.nav} cta={c.cta} location="nav" shift={c.shift.label} />
      <main>
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

        <TriptychScene label={c.changes.heading} items={c.changes.items} line={c.changes.seasoning} />

        <DoorScene
          label={film.knows.eyebrow}
          parts={[{ t: film.knows.h }, { t: film.knows.hEm, em: true }]}
          lose={film.knows.lose}
          keep={film.knows.keep}
          line={film.knows.line}
        />

        <SpheresScene
          label={film.closes.eyebrow}
          parts={[{ t: film.closes.h }, { t: film.closes.hEm, em: true }]}
          labels={film.closes.labels}
          body={film.closes.body}
          line={film.closes.line}
        />

        <NumbersScene heading={film.proof.heading} note={film.proof.note} figures={film.proof.figures} />

        <InviteScene
          id="engage"
          parts={[{ t: film.invite.h }, { t: film.invite.hEm, em: true }]}
          body={film.invite.body}
          cta={{ label: c.cta.label, href: c.cta.href, location: "engage" }}
        />

        <div className="page still">
          <Letter />
          <Work />
          <Run />
          <Week />
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
