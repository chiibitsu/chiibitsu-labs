import { bitcoinLine, explorer, type Witness } from "@/lib/ledgerCheck";

// The Base and Bitcoin rows of a ledger record, inside a <dl className="ledger-facts">.
// Shared by the /network/check result card and the /network/cert page, so both say the same thing the same way.
export function WitnessRows({ w }: { w: Witness }) {
  return (
    <>
      <div className="ledger-row">
        <dt className="caption">Base</dt>
        <dd>{w.base.note}{w.base.tx && <> <a href={explorer(w.base.tx)} target="_blank" rel="noopener noreferrer">See the transaction</a></>}</dd>
      </div>
      <div className="ledger-row"><dt className="caption">Bitcoin</dt><dd>{bitcoinLine(w)}</dd></div>
    </>
  );
}
