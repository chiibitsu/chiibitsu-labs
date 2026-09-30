"use client";

import { FlipCard } from "@/components/FlipCard";
import { FounderLink } from "@/components/FounderLink";
import { TrackedLink } from "@/components/TrackedLink";
import { countUp } from "./numbers";
import { LitWords, Pen, type Part } from "./parts";
import { SceneFrame } from "./SceneFrame";
import { ease, seg, useNarrow } from "./scroll";

const dim = (on: boolean) => `dim${on ? " on" : ""}`;
type Link = { label: string; href: string };

// H2: the founder's note. The lines light up one by one; the signature is set in the hand and underlined.
export function LetterScene({
  id,
  label,
  open,
  letters,
  close,
  signature,
  byline,
}: {
  id?: string;
  label: string;
  open: string;
  letters: { companies: string; solo: string };
  close: string;
  signature: string;
  byline: string;
}) {
  return (
    <SceneFrame id={id}>
      {(p) => (
        <>
          <div className="label">{label}</div>
          <div className="letter-film">
            <p className={`letter-line ${dim(p > 0.06)}`}>{open}</p>
            {(["companies", "solo"] as const).map((k) => (
              <p key={k} data-aud={k} className={`letter-line ${dim(p > 0.22)}`}>{letters[k]}</p>
            ))}
            <p className={`letter-line ${dim(p > 0.42)}`}>{close}</p>
            <div className={`letter-sign-wrap ${dim(p > 0.62)}`}>
              <div className="hand-note letter-sign">
                <FounderLink>{signature}</FounderLink>
              </div>
              <Pen f={seg(p, 0.62, 0.8)} />
              <div className="caption">
                <FounderLink>{byline}</FounderLink>
              </div>
            </div>
          </div>
        </>
      )}
    </SceneFrame>
  );
}

// H4 and A5: a path that fills as you scroll. Each step lights as the line reaches it; the last one is violet.
export function PathScene({
  id,
  label,
  parts,
  steps,
  cta,
}: {
  id?: string;
  label?: string;
  parts: Part[];
  steps: { title: string; body: string }[];
  cta?: Link & { location: string };
}) {
  return (
    <SceneFrame id={id}>
      {(p) => {
        const n = steps.length;
        const f = seg(p, 0.1, 0.82);
        return (
          <>
            {label && <div className="label">{label}</div>}
            <h2 className="film-h film-h2">
              <LitWords parts={parts} f={0.3 + p * 2.4} />
            </h2>
            <div className="path" style={{ "--f": f, "--n": n } as React.CSSProperties}>
              <div className="path-line" aria-hidden="true">
                <i />
              </div>
              {steps.map((s, i) => {
                const on = f >= (i / (n - 1)) * 0.98 && p > 0.08;
                const last = i === n - 1;
                return (
                  <div key={s.title} className={`path-step${on ? " on" : ""}${last ? " last" : ""}`}>
                    <span className="path-dot">{i + 1}</span>
                    <div className="path-t">{s.title}</div>
                    <div className="path-b">{s.body}</div>
                  </div>
                );
              })}
            </div>
            {cta && (
              <div className={`film-cta ${dim(p > 0.85)}`}>
                <TrackedLink href={cta.href} className="btn big" event="cta_click" eventProps={{ location: cta.location }}>
                  {cta.label}
                </TrackedLink>
              </div>
            )}
          </>
        );
      }}
    </SceneFrame>
  );
}

type Metric = { value: string; label: string; key: string; illustrative?: boolean };

// H5: this week. The numbers count up, the shift dot pulses, the note says the figures are illustrative.
export function WeekScene({
  id,
  heading,
  note,
  shift,
  metrics,
}: {
  id?: string;
  heading: string;
  note: string;
  shift: string;
  metrics: Metric[];
}) {
  return (
    <SceneFrame id={id}>
      {(p) => (
        <>
          <h2 className="film-h film-h2">
            <LitWords parts={[{ t: heading }]} f={0.3 + p * 2.5} />
          </h2>
          <div className="week-shift">
            <span className="dot pulse-dot" aria-hidden="true">●</span> {shift}
          </div>
          <div className="figs-film four">
            {metrics.map((m, i) => (
              <div key={m.key} className="fig-film">
                <div className={`figure${m.illustrative === false ? " real" : ""}`}>{countUp(m.value, ease(seg(p, 0.1 + i * 0.1, 0.55 + i * 0.1)))}</div>
                <TrackedLink href={null} className="more" event="metric_click" eventProps={{ metric: m.key }}>
                  {m.label} →
                </TrackedLink>
                {m.illustrative !== false && <span className="ill">Illustrative</span>}
              </div>
            ))}
          </div>
          <p className={`caption ${dim(p > 0.7)}`}>{note}</p>
        </>
      )}
    </SceneFrame>
  );
}

type Card = { today: string; after: string; note: string };

// A6: what changes. The cards flip one by one as you scroll; no hover needed. On a phone one card shows at a time.
export function FlipScene({
  id,
  heading,
  cards,
  labels,
}: {
  id?: string;
  heading: string;
  cards: Card[];
  labels: { today: string; after: string; seeHover: string; seeTap: string };
}) {
  const narrow = useNarrow();
  return (
    <SceneFrame id={id}>
      {(p) => {
        const n = cards.length;
        const stage = Math.min(n - 1, Math.floor(seg(p, 0.05, 0.95) * n));
        const flippedAt = (i: number) => (narrow ? i < stage || (i === stage && seg(p, 0.05, 0.95) * n - stage > 0.45) : p > 0.12 + i * 0.2);
        return (
          <>
            <h2 className="film-h film-h2">
              <LitWords parts={[{ t: heading }]} f={0.3 + p * 2.5} />
            </h2>
            <div className="flips flips-film">
              {cards.map((c, i) => (
                <div key={c.today} className={`flip-slot${narrow && i !== stage ? " off" : ""}`}>
                  <FlipCard today={c.today} after={c.after} note={c.note} labels={labels} forceFlipped={flippedAt(i)} />
                </div>
              ))}
            </div>
          </>
        );
      }}
    </SceneFrame>
  );
}

// The compare toggle for the door scene: appears at the end of the scene and stays clickable.
export function CompareToggle({
  show,
  without,
  withLabel,
  hint,
  mode,
  onPick,
}: {
  show: boolean;
  without: string;
  withLabel: string;
  hint: string;
  mode: "lose" | "keep" | null;
  onPick: (m: "lose" | "keep") => void;
}) {
  return (
    <div className={`compare-bar compare-film ${dim(show)}`}>
      <div className="seg" role="group" aria-label="Compare">
        <button type="button" aria-pressed={mode === "lose"} onClick={() => onPick("lose")}>{without}</button>
        <button type="button" aria-pressed={mode === "keep"} onClick={() => onPick("keep")}>{withLabel}</button>
      </div>
      <span className="hand-note">{hint}</span>
    </div>
  );
}
