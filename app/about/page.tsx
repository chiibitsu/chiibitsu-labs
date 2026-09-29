import type { Metadata } from "next";
import { FilmBar } from "@/components/film/FilmBar";
import { FilmProgress } from "@/components/film/FilmProgress";
import { ForkScene } from "@/components/film/fork";
import { FounderScene } from "@/components/film/founder";
import { InviteScene } from "@/components/film/invite";
import { ChainScene, LongBetScene, SpheresScene, ThesisScene } from "@/components/film/scenes";
import { about as c } from "@/lib/about";
import { film } from "@/lib/film";

export const metadata: Metadata = {
  title: c.meta.title,
  description: c.meta.description,
};

// /about in scroll-film mode. Scenes, in order: the mission, the four waves, the spheres, "You choose",
// the long bet, Chii with the photo and the numbers, the invitation.
export default function About() {
  return (
    <>
      <FilmProgress />
      <FilmBar nav={c.nav} cta={c.cta} location="about_nav" shift={c.shift.label} />
      <main>
        <ThesisScene label={c.hero.eyebrow} parts={[{ t: c.hero.h1a }, { t: c.hero.h1b, em: true }]} sub={c.hero.sub} />

        <ChainScene label={c.waves.label} parts={[{ t: c.waves.h }]} nodes={c.waves.items} hand={c.waves.here} />

        <SpheresScene
          label={film.closes.eyebrow}
          parts={[{ t: film.closes.h }, { t: film.closes.hEm, em: true }]}
          labels={film.closes.labels}
          body={film.closes.body}
          line={film.closes.line}
        />

        <ForkScene
          eyebrow={c.choice.eyebrow}
          parts={[{ t: c.choice.h }, { t: c.choice.hEm, em: true }]}
          body={c.choice.body}
          alt={c.choice.alt}
          labels={c.choice.labels}
        />

        <LongBetScene parts={[{ t: c.longBet.h }, { t: c.longBet.hEm, em: true }]} body={c.longBet.body} link={c.longBet.link} />

        <FounderScene
          eyebrow={c.founder.eyebrow}
          name={c.founder.name}
          role={c.founder.role}
          line={c.founder.line}
          lineEm={c.founder.lineEm}
          body={c.founder.body}
          photoAlt={c.founder.photoAlt}
          link={c.founder.link}
          figures={film.proof.figures}
          note={film.proof.noteFirst}
        />

        <InviteScene
          id="engage"
          parts={[{ t: film.invite.h }, { t: film.invite.hEm, em: true }]}
          body={film.invite.body}
          cta={{ label: c.cta.label, href: c.cta.href, location: "about_cta" }}
          solo={film.invite.solo}
        />

        <div className="page still">
          <div className="legal">
            {c.legal.text} · <a href={`mailto:${c.legal.email}`}>{c.legal.email}</a>
          </div>
          <footer className="foot">
            <div>{c.footer.left}</div>
            <div>{c.footer.middle}</div>
            <div>Updated {c.meta.updated}</div>
          </footer>
        </div>
      </main>
    </>
  );
}
