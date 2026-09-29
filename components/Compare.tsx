"use client";

import { useState } from "react";
import { SceneKeep, SceneLose } from "@/components/art/about-art";

type Scene = { left: string; right: string };
type Props = {
  without: string;
  with: string;
  hint: string;
  loseAlt: string;
  keepAlt: string;
  lose: Scene;
  keep: Scene;
};

// Without a system, what people know leaves with them. With one, it flows into the notebook.
export function Compare({ without, with: withLabel, hint, loseAlt, keepAlt, lose, keep }: Props) {
  const [kept, setKept] = useState(false);
  const scene = kept ? keep : lose;
  return (
    <div className="compare">
      <div className="compare-bar">
        <div className="seg" role="group" aria-label="Compare">
          <button type="button" aria-pressed={!kept} onClick={() => setKept(false)}>{without}</button>
          <button type="button" aria-pressed={kept} onClick={() => setKept(true)}>{withLabel}</button>
        </div>
        <span className="hand-note">{hint}</span>
      </div>
      <div className="scene-wrap">
        <div className="scene">
          {kept ? <SceneKeep aria-label={keepAlt} width="100%" height="100%" /> : <SceneLose aria-label={loseAlt} width="100%" height="100%" />}
        </div>
        <div className="scene-labels" aria-live="polite">
          <span className="scene-l a" style={{ color: kept ? "var(--accent)" : "var(--ink-3)" }}>{scene.left}</span>
          <span className="scene-l b" style={{ color: kept ? "var(--ink-3)" : "var(--accent)" }}>{scene.right}</span>
        </div>
      </div>
    </div>
  );
}
