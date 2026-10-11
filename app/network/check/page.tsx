import type { Metadata } from "next";
import Link from "next/link";
import { AikiriText } from "@/components/AikiriText";
import { Mark } from "@/components/Mark";
import { NetworkTools } from "@/components/NetworkTools";
import { SiteFooter } from "@/components/SiteFooter";
import checkJson from "@/content/check.json";

const c = checkJson;

export const metadata: Metadata = {
  alternates: { canonical: "/network/check" },
  title: c.meta.title,
  description: c.meta.description,
};

// /network/check: the file and hash checker for the Aikiri ledger. The about page is /network; the technical page is /ledger.
export default function Check() {
  return (
    <div className="page">
      <Link href="/" className="brand" aria-label="Chiibitsu Labs, home">
        <Mark />
        <span className="wordmark">Chiibitsu Labs</span>
      </Link>
      <main className="audit privacy ledger">
        <div className="eyebrow"><AikiriText text={c.hero.eyebrow} where="check_eyebrow" /></div>
        <h1>{c.hero.h1}</h1>
        <p className="body">{c.hero.sub}</p>

        <h2>{c.check.heading}</h2>
        <NetworkTools />

        <h2>{c.how.heading}</h2>
        <ul className="body">
          {c.how.items.map((s) => (
            <li key={s}>{s}</li>
          ))}
        </ul>

        <p className="body">
          The contract and how to check it are on the <Link href="/ledger">ledger page</Link>.
        </p>
        <Link href={c.back.href} className="caption">{c.back.label}</Link>
      </main>
      <SiteFooter left={c.footer.left} middle={c.footer.middle} />
    </div>
  );
}
