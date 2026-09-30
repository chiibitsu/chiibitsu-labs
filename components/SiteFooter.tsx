import { about } from "@/lib/about";

// One footer for every page: the legal line always sits here, above the row.
export function SiteFooter({ left, middle, updated }: { left: string; middle: string; updated: string }) {
  return (
    <footer className="foot">
      <div className="foot-legal">
        {about.legal.text} · <a href={`mailto:${about.legal.email}`}>{about.legal.email}</a>
      </div>
      <div>{left}</div>
      <div>{middle}</div>
      <div>Updated {updated}</div>
    </footer>
  );
}
