"use client";

import { useEffect, useState } from "react";
import { WitnessRows } from "@/components/WitnessRows";
import { checkCertificate, liveLedger, manilaDate, manilaTime, type CertLedger, type CertView } from "@/lib/certCheck";
import certJson from "@/content/cert.json";

const c = certJson;

// Reads the certificate from the URL fragment and checks it against the public ledger, all in the browser.
// No analytics event and no alert is sent from here: nothing from the fragment may leave the device
// except its fingerprint, to the public ledger. The fragment stays in the address bar so refresh and
// copy-link keep working for the holder.
export function CertCheck({ samples }: { samples: boolean }) {
  const [view, setView] = useState<CertView | "checking">("checking");

  useEffect(() => {
    // Samples (previews only) load on demand, so production never downloads the fixture.
    const ledger: Promise<CertLedger> = samples ? import("@/lib/certSamples").then((m) => m.sampleLedger(liveLedger)) : Promise.resolve(liveLedger);
    // Each run gets a ticket; only the latest one may set the view, so a slow earlier check never
    // overwrites a newer link's result. Unmount retires every ticket.
    let latest = 0;
    const run = () => {
      const ticket = ++latest;
      setView("checking");
      void ledger
        .then((l) => checkCertificate(window.location.hash, l))
        .catch((): CertView => ({ state: "error" }))
        .then((v) => { if (ticket === latest) setView(v); });
    };
    run();
    window.addEventListener("hashchange", run);
    return () => { latest = -1; window.removeEventListener("hashchange", run); };
  }, [samples]);

  return (
    <div aria-live="polite" data-clarity-mask="true">
      <State v={view} />
    </div>
  );
}

function State({ v }: { v: CertView | "checking" }) {
  if (v === "checking") return <><h1>{c.checkingH1}</h1><p className="body">{c.checking}</p></>;
  if (v.state === "error") return <><h1>{c.error.h1}</h1><p className="body">{c.error.body}</p></>;
  if (v.state === "not_found") return <><h1>{c.notFound.h1}</h1><p className="body">{c.notFound.body}</p></>;
  if (v.state === "invalid") return <><h1>{c.invalid.h1}</h1><p className="body">{c.invalid.body}</p></>;
  const ill = v.placeholder && <p className="body"><span className="ill">Illustrative</span> {c.placeholder}</p>;
  if (v.state === "revoked") {
    const r = c.revoked.rows;
    return (
      <>
        {ill}
        <h1>{c.revoked.h1}</h1>
        <p className="body">{c.revoked.body.replace("{date}", manilaDate(v.revokedAt))}</p>
        <dl className="ledger-facts">
          <div className="ledger-row"><dt className="caption">{r.number}</dt><dd>{v.record.number}</dd></div>
          <div className="ledger-row"><dt className="caption">{r.course}</dt><dd>{v.record.course}</dd></div>
          <div className="ledger-row"><dt className="caption">{r.revoked}</dt><dd>{manilaTime(v.revokedAt)}</dd></div>
        </dl>
      </>
    );
  }
  const r = c.valid.rows;
  const rec = v.record;
  return (
    <>
      {ill}
      <h1>{c.valid.h1}</h1>
      <p className="body">{c.valid.body.replace("{date}", manilaDate(v.sealedAt))}</p>
      <dl className="ledger-facts">
        <div className="ledger-row"><dt className="caption">{r.holder}</dt><dd>{rec.holder}</dd></div>
        <div className="ledger-row"><dt className="caption">{r.course}</dt><dd>{rec.course}</dd></div>
        <div className="ledger-row"><dt className="caption">{r.completed}</dt><dd>{rec.completed}</dd></div>
        <div className="ledger-row"><dt className="caption">{r.instructor}</dt><dd>{rec.instructor}</dd></div>
        {rec.host && <div className="ledger-row"><dt className="caption">{r.host}</dt><dd>{rec.host}</dd></div>}
        <div className="ledger-row"><dt className="caption">{r.issuer}</dt><dd>{rec.issuer}</dd></div>
        <div className="ledger-row"><dt className="caption">{r.number}</dt><dd>{rec.number}</dd></div>
        <div className="ledger-row"><dt className="caption">{r.block}</dt><dd>{v.placeholder ? "Placeholder" : v.block}</dd></div>
        <div className="ledger-row"><dt className="caption">{r.sealed}</dt><dd>{manilaTime(v.sealedAt)}</dd></div>
        <WitnessRows w={v.witness} />
        <div className="ledger-row"><dt className="caption">{r.fingerprint}</dt><dd>{v.fingerprint}</dd></div>
      </dl>
    </>
  );
}
