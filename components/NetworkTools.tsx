"use client";

import { useRef, useState } from "react";
import { trackEvent } from "@/lib/analytics";
import {
  EXAMPLE_HASH, MAX_FILE_BYTES, findMatch, isHash, loadBlocks, loadWitness, normalizeHash, sha256Hex, when,
  type Block, type Match, type Witness,
} from "@/lib/ledgerCheck";
import network from "@/content/network.json";

const c = network.check;
const explorer = (tx: string) => `https://basescan.org/tx/${tx}`;

type Result =
  | { kind: "found"; hash: string; match: Match; witness: Witness }
  | { kind: "none"; hash: string; blocks: number }
  | { kind: "error"; message: string };

const how = { block: "This is a block's own hash.", root: "This is a hash sealed inside a block.", rootset: "This is the combined hash of a block's entries." } as const;

// Hash a file on the device, or take a pasted hash, then look it up in the public ledger. No hash or file name is sent to analytics.
export function NetworkTools() {
  const blocks = useRef<Block[] | null>(null);
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState("");
  const [text, setText] = useState("");
  const [note, setNote] = useState("");
  const [over, setOver] = useState(false);
  const [result, setResult] = useState<Result | null>(null);

  async function look(hash: string, via: "file" | "hash") {
    setBusy("Looking in the ledger…");
    try {
      blocks.current ??= await loadBlocks();
      const match = findMatch(blocks.current, hash);
      if (match) {
        const witness = await loadWitness(match.block.index);
        setResult({ kind: "found", hash, match, witness });
      } else {
        setResult({ kind: "none", hash, blocks: blocks.current.length });
      }
      trackEvent("ledger_check", { result: match ? "found" : "not_found", via });
    } catch (e) {
      setResult({ kind: "error", message: `The ledger could not be read just now (${e instanceof Error ? e.message : "error"}). Try again in a minute.` });
      trackEvent("ledger_check", { result: "error", via });
    } finally {
      setBusy("");
    }
  }

  async function onFile(file: File | undefined) {
    setNote("");
    setResult(null);
    if (!file) return;
    if (file.size > MAX_FILE_BYTES) return setNote(c.big);
    setBusy("Working out the fingerprint on your device…");
    try {
      const hash = await sha256Hex(await file.arrayBuffer());
      setText(hash);
      await look(hash, "file");
    } catch {
      setBusy("");
      setNote("That file could not be read.");
    }
  }

  async function onCheck(raw: string) {
    setNote("");
    const hash = normalizeHash(raw);
    if (!isHash(hash)) {
      setResult(null);
      return setNote(c.bad);
    }
    await look(hash, "hash");
  }

  return (
    <div className="net-tool">
      <label
        className={`net-drop${over ? " over" : ""}`}
        onDragOver={(e) => { e.preventDefault(); setOver(true); }}
        onDragLeave={() => setOver(false)}
        onDrop={(e) => { e.preventDefault(); setOver(false); void onFile(e.dataTransfer.files[0]); }}
      >
        <input ref={input} type="file" className="sr-only" onChange={(e) => { void onFile(e.target.files?.[0]); e.target.value = ""; }} />
        <span className="net-drop-t">{c.drop}</span>
        <span className="caption">{c.dropNote}</span>
      </label>

      <form className="net-hash" onSubmit={(e) => { e.preventDefault(); void onCheck(text); }}>
        <label htmlFor="net-hash-in" className="caption">{c.or}</label>
        <div className="net-hash-row">
          <input id="net-hash-in" value={text} onChange={(e) => setText(e.target.value)} placeholder={c.hashPlaceholder} spellCheck={false} autoComplete="off" aria-label={c.hashLabel} />
          <button type="submit" className="btn" disabled={!!busy}>{c.button}</button>
        </div>
        <button type="button" className="net-example" onClick={() => { setText(EXAMPLE_HASH); void onCheck(EXAMPLE_HASH); }}>{c.example}</button>
      </form>

      <div aria-live="polite" className="net-out">
        {busy && <p className="caption">{busy}</p>}
        {note && <p className="body">{note}</p>}
        {result?.kind === "error" && <p className="body">{result.message}</p>}
        {result?.kind === "none" && (
          <div className="net-result">
            <p className="net-verdict">Not found.</p>
            <p className="body">No block holds this hash. {result.blocks} blocks checked.</p>
            <p className="caption mono-wrap">{result.hash}</p>
          </div>
        )}
        {result?.kind === "found" && <Found r={result} />}
      </div>
    </div>
  );
}

function Found({ r }: { r: Extract<Result, { kind: "found" }> }) {
  const b = r.match.block;
  const t = when(b.timestamp);
  const w = r.witness;
  const bitcoin =
    w.bitcoin.state === "attested"
      ? `The proof file names Bitcoin block${new Set(w.bitcoin.heights).size > 1 ? "s" : ""} ${[...new Set(w.bitcoin.heights)].sort((a, b) => a - b).join(", ")}. This page reads the file; it does not check it against Bitcoin.`
      : w.bitcoin.state === "pending"
        ? "Stamped, awaiting Bitcoin confirmation."
        : "No Bitcoin stamp yet.";
  return (
    <div className="net-result">
      <p className="net-verdict">Found in block {b.index}.</p>
      <p className="body">{how[r.match.how]}{r.match.kind ? ` Kind: ${r.match.kind}.` : ""}</p>
      <dl className="ledger-facts">
        <div className="ledger-row"><dt className="caption">Block</dt><dd>{b.index}</dd></div>
        <div className="ledger-row"><dt className="caption">Sealed</dt><dd>{t.local}{t.utc ? ` · ${t.utc}` : ""}</dd></div>
        <div className="ledger-row">
          <dt className="caption">Base</dt>
          <dd>{w.base.note}{w.base.tx && <> <a href={explorer(w.base.tx)} target="_blank" rel="noopener noreferrer">See the transaction</a></>}</dd>
        </div>
        <div className="ledger-row"><dt className="caption">Bitcoin</dt><dd>{bitcoin}</dd></div>
        <div className="ledger-row"><dt className="caption">Hash</dt><dd>{r.hash}</dd></div>
      </dl>
    </div>
  );
}
