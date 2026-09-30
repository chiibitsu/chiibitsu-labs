"use client";

import { useState } from "react";

type Props = {
  today: string;
  after: string;
  note: string;
  labels: { today: string; after: string; seeHover: string; seeTap: string };
  forceFlipped?: boolean;
};

// Flips on hover with a mouse, on tap or Enter/Space otherwise. Both faces stay in the page for screen readers.
export function FlipCard({ today, after, note, labels, forceFlipped }: Props) {
  const [touched, setFlipped] = useState(false);
  // In the film the scroll decides; a tap or key press inverts it. Elsewhere only taps and keys decide.
  const flipped = forceFlipped === undefined ? touched : forceFlipped !== touched;
  const toggle = () => setFlipped((t) => !t);
  return (
    <div
      className="flip"
      role="button"
      tabIndex={0}
      aria-pressed={flipped}
      data-flipped={flipped}
      onClick={() => {
        // With a mouse the card flips on hover, so a click only matters on touch screens.
        if (window.matchMedia("(hover: none)").matches) toggle();
      }}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          toggle();
        }
      }}
    >
      <div className="inner">
        <div className="face front">
          <div className="eyebrow">{labels.today}</div>
          <div className="flip-front">{today}</div>
          <div className="flip-see">
            <span className="hov">{labels.seeHover}</span>
            <span className="tap">{labels.seeTap}</span>
          </div>
        </div>
        <div className="face back">
          <div className="eyebrow" style={{ color: "var(--accent)" }}>{labels.after}</div>
          <div className="flip-back">{after}</div>
          <div className="flip-note">{note}</div>
        </div>
      </div>
    </div>
  );
}
