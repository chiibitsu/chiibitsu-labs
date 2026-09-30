"use client";

import { Molecule } from "@/components/Molecule";
import { Figures, type Figure } from "./numbers";
import { LitWords } from "./parts";
import { SceneFrame } from "./SceneFrame";
import { seg, useNarrow } from "./scroll";

const dim = (on: boolean) => `dim${on ? " on" : ""}`;
const both = ["companies", "solo"] as const;
type Aud = (typeof both)[number];
type Card = { name: string; built: string; now: string; date: string };

// "Who we've built with": the names first, then one case card per scroll step. On a phone one card shows at a time.
// Names appear only with the client's OK on record (content/proof.json, consent).
export function ProofScene({
  id,
  heading,
  marks,
  cards,
  note,
}: {
  id?: string;
  heading: string;
  marks: Record<Aud, string[]>;
  cards: Record<Aud, Card[]>;
  note: string;
}) {
  const narrow = useNarrow();
  return (
    <SceneFrame id={id}>
      {(p) => (
        <>
          <h2 className="film-h film-h2">
            <LitWords parts={[{ t: heading }]} f={0.3 + p * 2.5} />
          </h2>
          {both.map((k) => {
            const n = cards[k].length;
            const stage = Math.min(n - 1, Math.floor(seg(p, 0.1, 0.92) * n));
            return (
              <div key={k} data-aud={k} className="proof-aud">
                <div className={`proof-marks ${dim(p > 0.08)}`}>
                  {marks[k].map((m) => (
                    <span key={m} className="proof-mark">{m}</span>
                  ))}
                </div>
                <div className="proof-cards">
                  {cards[k].map((c, i) => {
                    const on = p > 0.16 + i * 0.22;
                    return (
                      <div key={c.name} className={`proof-card${on ? " on" : ""}${narrow && i !== stage ? " off" : ""}`}>
                        <div className="proof-name">{c.name}</div>
                        <div className="body">{c.built}</div>
                        <div className="body proof-now">{c.now}</div>
                        <div className="caption">{c.date}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
          <p className={`caption ${dim(p > 0.8)}`}>{note}</p>
        </>
      )}
    </SceneFrame>
  );
}

// "How it runs": you, the Chief AI Officer and the ghost team. The diagram turns; the line under it lights at the end.
export function RunScene({
  id,
  heads,
  proofs,
  labels,
  human,
}: {
  id?: string;
  heads: Record<Aud, string>;
  proofs: Record<Aud, string>;
  labels: string[];
  human: { companies: { name: string; note: string }; solo: { name: string; note: string } };
}) {
  return (
    <SceneFrame id={id}>
      {(p) => (
        <>
          {both.map((k) => (
            <h2 key={k} data-aud={k} className="film-h film-h2">
              <LitWords parts={[{ t: heads[k] }]} f={0.3 + p * 2.5} />
            </h2>
          ))}
          <div className="run-film">
            <Molecule labels={labels} human={human} />
          </div>
          {both.map((k) => (
            <p key={k} data-aud={k} className={`film-line centered ${dim(p > 0.55)}`}>{proofs[k]}</p>
          ))}
        </>
      )}
    </SceneFrame>
  );
}

// "The record": four counts, each with its rule stated and its date.
export function RecordScene({ id, heading, note, figures }: { id?: string; heading: string; note: string; figures: Figure[] }) {
  return (
    <SceneFrame id={id}>
      {(p) => (
        <>
          <h2 className="film-h film-h2">
            <LitWords parts={[{ t: heading }]} f={0.3 + p * 2.5} />
          </h2>
          <Figures figures={figures} p={p} four />
          <p className={`caption ${dim(p > 0.7)}`}>{note}</p>
        </>
      )}
    </SceneFrame>
  );
}
