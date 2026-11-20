import type { Metadata } from "next";
import Link from "next/link";
import { EmailOptions } from "@/components/EmailOptions";
import { Mark } from "@/components/Mark";
import { emails } from "@/lib/emails";
import { content } from "@/lib/content";

export const metadata: Metadata = {
  title: `${content.audit.heading} · ${content.meta.title}`,
  robots: { index: false },
};

// Placeholder route. Whether the audit is free, paid or by application is not decided, so this page says none of those.
export default function Audit() {
  const a = content.audit;
  return (
    <div className="page">
      <Link href="/" className="brand" aria-label="Chiibitsu Labs, home">
        <Mark />
        <span className="wordmark">Chiibitsu Labs</span>
      </Link>
      <main className="audit">
        <h1>{a.heading}</h1>
        <p className="body">{a.body}</p>
        <p className="body">{a.contact}</p>
        <EmailOptions mail={emails.audit} />
        <Link href="/" className="caption">{a.back}</Link>
      </main>
    </div>
  );
}
