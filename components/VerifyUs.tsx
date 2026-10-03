"use client";

import { useEffect, useRef, useState } from "react";
import { trackEvent } from "@/lib/analytics";
import { checkOfficial, type Check, type OfficialList } from "@/lib/verifyUs";
import official from "@/content/official.json";

const c = official.check;
const v = official.verdicts;
const m = official.modal;
const stamp = (d: Date) => `${d.toISOString().slice(0, 19).replace("T", " ")} UTC`;

// Paste an email, link, handle, number or wallet address; the answer opens as a card that is easy to screenshot.
// The text is checked on the device. Only the kind of answer goes to analytics, never what was pasted.
export function VerifyUs() {
  const dialog = useRef<HTMLDialogElement>(null);
  const field = useRef<HTMLInputElement>(null);
  const [text, setText] = useState("");
  const [result, setResult] = useState<{ check: Check; at: Date } | null>(null);

  useEffect(() => {
    if (result && dialog.current && !dialog.current.open) dialog.current.showModal();
  }, [result]);

  function run(raw: string) {
    const check = checkOfficial(raw, official.list as unknown as OfficialList);
    setResult({ check, at: new Date() });
    trackEvent("verify_us", { result: check.verdict, kind: check.kind });
  }

  function close(focus = false) {
    dialog.current?.close();
    if (focus) field.current?.focus();
  }

  const verdict = result ? v[result.check.verdict] : null;
  const warn = result?.check.verdict === "lookalike";

  return (
    <div className="net-tool">
      <form className="net-hash" onSubmit={(e) => { e.preventDefault(); run(text); }}>
        <label htmlFor="verify-in" className="caption">{c.label}</label>
        <div className="net-hash-row">
          <input
            ref={field}
            id="verify-in"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={c.placeholder}
            spellCheck={false}
            autoComplete="off"
            autoCapitalize="none"
          />
          <button type="submit" className="btn">{c.button}</button>
        </div>
        <div className="net-chips">
          <span className="caption">{c.examplesLabel}</span>
          {c.examples.map((ex) => (
            <button key={ex} type="button" className="net-example" onClick={() => { setText(ex); run(ex); }}>{ex}</button>
          ))}
        </div>
      </form>

      <dialog
        ref={dialog}
        className="net-modal"
        aria-labelledby="verify-modal-title"
        onClick={(e) => { if (e.target === dialog.current) close(); }}
        onClose={() => setResult(null)}
      >
        {result && verdict && (
          <div className="net-card">
            <h3 id="verify-modal-title" className={`net-verdict${warn ? " warn" : ""}`}>{verdict.title}</h3>
            {result.check.input && (
              <p className="net-you">
                <span className="caption">{m.youChecked}: </span>
                {result.check.input}
              </p>
            )}
            {result.check.detail && <p className="body">{result.check.detail}</p>}
            <p className="body">{verdict.action}</p>
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
