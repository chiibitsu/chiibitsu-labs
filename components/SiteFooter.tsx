import { FounderLink } from "@/components/FounderLink";
import { about } from "@/lib/about";
import { emails } from "@/lib/emails";
import { mailto } from "@/lib/mail";

// "Updated" is the day this build was made, in Manila time, so it is always current after a deploy.
const built = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "Asia/Manila" }).format(new Date());

// One footer for every page. The legal line sits below the footer row, centered.
export function SiteFooter({ left, middle }: { left: string; middle: string; updated?: string }) {
  return (
    <footer className="foot">
      <div>{left}</div>
      <div>{middle}</div>
      <div>Updated {built}</div>
      <div className="foot-legal">
        <FounderLink>{about.legal.text}</FounderLink> · <a href={mailto(emails.hello)}>{about.legal.email}</a> · <a href="/privacy">Privacy</a>
      </div>
    </footer>
  );
}
