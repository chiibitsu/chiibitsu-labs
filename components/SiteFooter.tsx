import { emails } from "@/lib/emails";
import { mailto } from "@/lib/mail";

// "Updated" is the day this build was made, in Manila time, so it is always current after a deploy.
const built = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "Asia/Manila" }).format(new Date());

// One footer for every page. Links sit below the footer row; the registration details live on /team.
export function SiteFooter({ left, middle }: { left: string; middle: string; updated?: string }) {
  return (
    <footer className="foot">
      <div>{left}</div>
      <div>{middle}</div>
      <div>Updated {built}</div>
      <div className="foot-legal">
        <a href="/team">Team</a> · <a href="/careers">Careers</a> · <a href="/team#registration">Registration</a> · <a href="/verify">Verify</a> · <a href="/privacy">Privacy</a> · <a href={mailto(emails.hello)}>labs@chiibitsu.com</a>
      </div>
    </footer>
  );
}
