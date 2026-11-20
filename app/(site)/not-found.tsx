import Link from "next/link";
import { Mark } from "@/components/Mark";
import { SiteFooter } from "@/components/SiteFooter";

export default function NotFound() {
  return (
    <div className="page">
      <Link href="/" className="brand" aria-label="Chiibitsu Labs, home">
        <Mark />
        <span className="wordmark">Chiibitsu Labs</span>
      </Link>
      <main className="audit privacy">
        <h1>This page is not here.</h1>
        <p className="body">The link may be mistyped, or the page has moved.</p>
        <Link href="/" className="caption">← Home</Link>
      </main>
      <SiteFooter left="Chiibitsu Labs" middle="More human, by design" />
    </div>
  );
}
