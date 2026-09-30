import type { CSSProperties } from "react";
import { Hex } from "./parts";

export type ChainNode = { title: string; body: string };

// The molecular chain: a timeline as hexagon nodes joined by a bond that draws across the screen.
// f is scene progress. The current (last) node is violet. On a phone the chain runs down, and only the active node shows its text.
export function Chain({ nodes, f, hand }: { nodes: ChainNode[]; f: number; hand?: string }) {
  const n = nodes.length;
  const bond = Math.min(1, f / 0.8);
  const litCount = nodes.reduce((c, _, i) => (f > i * 0.22 ? c + 1 : c), 0);
  return (
    <div className="chain" style={{ "--n": n } as CSSProperties}>
      <div className="chain-bond" style={{ "--f": bond } as CSSProperties} aria-hidden="true" />
      {nodes.map((nd, i) => {
        const cur = i === n - 1;
        return (
          <div key={nd.title} className={`chain-node${i < litCount ? " lit" : ""}${i === litCount - 1 ? " active" : ""}`}>
            <Hex n={i + 1} cur={cur} />
            <div className="chain-t" style={cur ? { color: "var(--accent)" } : undefined}>{nd.title}</div>
            <div className="chain-b">{nd.body}</div>
            {cur && hand && <div className={`hand-note chain-hand${f > 0.82 ? " on" : ""}`}>{hand}</div>}
          </div>
        );
      })}
    </div>
  );
}
