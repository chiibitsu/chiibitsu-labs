"use client";

import { useEffect, useRef, useState } from "react";
import { trackEvent } from "@/lib/analytics";
import {
  EXAMPLE_HASH, MAX_FILE_BYTES, findMatch, isHash, loadBlocks, loadWitness, normalizeHash, sha256Hex, when,
  type Block, type Match, type Witness,
} from "@/lib/ledgerCheck";
import check from "@/content/check.json";

const c = check.check;
const m = check.modal;
const explorer = (tx: string) => `https://basescan.org/tx/${tx}`;

type Result =
  | { kind: "found"; hash: string; match: Match; witness: Witness; at: Date }
  | { kind: "none"; hash: string; blocks: number; at: Date }
  | { kind: "error"; message: string; at: Date };

const how = { block: "This is a block's own hash.", root: "This is a hash sealed inside a block.", rootset: "This is the combined hash of a block's entries." } as const;
const stamp = (d: Date) => `${d.toISOString().slice(0, 19).replace("T", " ")} UTC`;

// Hash a file on the device, or take a pasted hash, then look it up in the public ledger. The answer opens as a card
// that is easy to screenshot. No hash or file name is sent to analytics.
export function NetworkTools() {
  const blocks = useRef<Block[] | null>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const field = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState("");
  const [text, setText] = useState("");
  const [note, setNote] = useState("");
  const [over, setOver] = useState(false);
  const [result, setResult] = useState<Result | null>(null);

  useEffect(() => {
    if (result && dialog.current && !dialog.current.open) dialog.current.showModal();
  }, [result]);

  function close(focus = false) {
    dialog.current?.close();
    if (focus) field.current?.focus();
  }

  async function look(hash: string, via: "file" | "hash") {
    setBusy("Looking in the ledger…");
    const at = new Date();
    try {
      blocks.current ??= await loadBlocks();
      const match = findMatch(blocks.current, hash);
      if (match) {
        const witness = await loadWitness(match.block.index);
        setResult({ kind: "found", hash, match, witness, at });
      } else {
        setResult({ kind: "none", hash, blocks: blocks.current.length, at });
      }
      trackEvent("ledger_check", { result: match ? "found" : "not_found", via });
    } catch (e) {
      setResult({ kind: "error", message: `The ledger could not be read just now (${e instanceof Error ? e.message : "error"}). Try again in a minute.`, at });
      trackEvent("ledger_check", { result: "error", via });
    } finally {
      setBusy("");
    }
  }

  async function onFile(file: File | undefined) {
    setNote("");
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
    if (!isHash(hash)) return setNote(c.bad);
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
        <input type="file" className="sr-only" onChange={(e) => { void onFile(e.target.files?.[0]); e.target.value = ""; }} />
        <span className="net-drop-t">{c.drop}</span>
        <span className="caption">{c.dropNote}</span>
      </label>

      <form className="net-hash" onSubmit={(e) => { e.preventDefault(); void onCheck(text); }}>
        <label htmlFor="net-hash-in" className="caption">{c.or}</label>
        <div className="net-hash-row">
          <input ref={field} id="net-hash-in" value={text} onChange={(e) => setText(e.target.value)} placeholder={c.hashPlaceholder} spellCheck={false} autoComplete="off" aria-label={c.hashLabel} />
          <button type="submit" className="btn" disabled={!!busy}>{c.button}</button>
        </div>
        <button type="button" className="net-example" onClick={() => { setText(EXAMPLE_HASH); void onCheck(EXAMPLE_HASH); }}>{c.example}</button>
      </form>

      <div aria-live="polite" className="net-out">
        {busy && <p className="caption">{busy}</p>}
        {note && <p className="body">{note}</p>}
      </div>

      <dialog
        ref={dialog}
        className="net-modal"
        aria-labelledby="net-modal-title"
        onClick={(e) => { if (e.target === dialog.current) close(); }}
        onClose={() => setResult(null)}
      >
        {result && (
          <div className="net-card">
            {result.kind === "error" && (
              <>
                <h3 id="net-modal-title" className="net-verdict">Could not check.</h3>
                <p className="body">{result.message}</p>
              </>
            )}
            {result.kind === "none" && (
              <>
                <h3 id="net-modal-title" className="net-verdict">{m.none}</h3>
                <p className="body">{m.noneBody} {result.blocks} {m.blocks}.</p>
                <p className="caption mono-wrap">{result.hash}</p>
              </>
            )}
            {result.kind === "found" && <Found r={result} />}
            <p className="caption net-proof">{m.checked} {stamp(result.at)} · {m.site}</p>
            <div className="net-actions">
              <button type="button" className="btn" onClick={() => close(true)}>{m.again}</button>
              <button type="button" className="net-example" onClick={() => close()}>{m.close}</button>
            </div>
          </div>
        )}
      </dialog>
    </div>
  );
}

function Found({ r }: { r: Extract<Result, { kind: "found" }> }) {
  const b = r.match.block;
  const t = when(b.timestamp);
  const w = r.witness;
  const heights = [...new Set(w.bitcoin.heights)].sort((a, b) => a - b);
  const bitcoin =
    w.bitcoin.state === "attested"
      ? `The proof file names Bitcoin block${heights.length > 1 ? "s" : ""} ${heights.join(", ")}. This page reads the file; it does not check it against Bitcoin.`
      : w.bitcoin.state === "pending"
        ? "Stamped, awaiting Bitcoin confirmation."
        : "No Bitcoin stamp yet.";
  return (
    <>
      <h3 id="net-modal-title" className="net-verdict">{m.found} {b.index}.</h3>
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
    </>
  );
}
