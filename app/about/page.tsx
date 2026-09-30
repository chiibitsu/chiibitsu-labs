import type { Metadata } from "next";
import { SiteFooter } from "@/components/SiteFooter";
import { FilmBar } from "@/components/film/FilmBar";
import { FilmProgress } from "@/components/film/FilmProgress";
import { ForkScene } from "@/components/film/fork";
import { FounderScene } from "@/components/film/founder";
import { InviteScene } from "@/components/film/invite";
import { ChainScene, DoorScene, LongBetScene, SpheresScene, ThesisScene } from "@/components/film/scenes";
import { FlipScene, PathScene } from "@/components/film/scenes2";
import { about as c } from "@/lib/about";
import { film } from "@/lib/film";

export const metadata: Metadata = {
  title: c.meta.title,
  description: c.meta.description,
};

// /about in scroll-film mode, ten scenes: A1 mission, A2 the waves, A3 How I work 01 (the spheres), A4 How I work 02 (the fork),
// A5 How I work 03 (the path), A6 what changes (the cards flip as you scroll), A7 the moat (the door, with the compare toggle at the end),
// A8 the long bet, A9 who is behind it, A10 the invitation. No background layer on this page.
export default function About() {
  return (
    <>
      <FilmProgress />
      <FilmBar nav={c.nav} cta={c.cta} location="about_nav" shift={c.shift.label} />
      <main>
        <ThesisScene
          label={c.hero.eyebrow}
          parts={[{ t: c.hero.h1a }, { t: c.hero.h1b, em: true }]}
          sub={c.hero.sub}
          sub2={`${c.premise.sub} ${c.premise.h}`}
        />

        <ChainScene parts={[{ t: c.waves.h }]} caption={c.waves.caption} nodes={c.waves.items} hand={c.waves.here} />

        <SpheresScene
          label={c.venn.eyebrow}
          parts={[{ t: film.closes.h }, { t: film.closes.hEm, em: true }]}
          labels={film.closes.labels}
          body={film.closes.body}
          line={film.closes.line}
          hand={c.venn.hand}
          proof={c.venn.proof}
        />

        <ForkScene
          eyebrow={c.choice.eyebrow}
          parts={[{ t: c.choice.h }, { t: c.choice.hEm, em: true }]}
          body={c.choice.body}
          alt={c.choice.alt}
          labels={c.choice.labels}
        />

        <PathScene label={c.work.eyebrow} parts={[{ t: c.work.heading }]} steps={c.work.steps} />

        <FlipScene heading={c.changes.heading} cards={c.changes.cards} labels={c.changes} />

        <DoorScene
          label={film.knows.eyebrow}
          parts={[{ t: film.knows.h }, { t: film.knows.hEm, em: true }]}
          lose={film.knows.lose}
          keep={film.knows.keep}
          line={film.knows.line}
          compare={c.knows}
        />

        <LongBetScene label={c.longBet.eyebrow} parts={[{ t: c.longBet.h }, { t: c.longBet.hEm, em: true }]} body={c.longBet.body} link={c.longBet.link} />

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
          <SiteFooter left={c.footer.left} middle={c.footer.middle} />
        </div>
      </main>
    </>
  );
}
