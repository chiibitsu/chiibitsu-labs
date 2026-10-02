import type { Metadata } from "next";
import Link from "next/link";
import { Mark } from "@/components/Mark";
import { about } from "@/lib/about";
import { emails } from "@/lib/emails";
import { mailto } from "@/lib/mail";

export const metadata: Metadata = {
  alternates: { canonical: "/privacy" },
  title: "Privacy Policy · Chiibitsu Labs",
  description: "How Chiibitsu Labs collects, uses and protects information when you visit chiibitsu.com, and your rights.",
};

const EFFECTIVE = "2 October 2026";
const MS_PRIVACY = "https://privacy.microsoft.com/en-us/privacystatement";

// One policy for every visitor: EU and UK (GDPR), California (CCPA/CPRA) and the Philippines (Data Privacy Act).
// Providers are named by category; Microsoft is named because the Clarity terms require it.
// Update this page whenever a tool that records visits is added to or removed from app/layout.tsx.
export default function Privacy() {
  const email = about.legal.email;
  const mail = <a href={mailto(emails.privacy)}>{email}</a>;
  return (
    <div className="page">
      <Link href="/" className="brand" aria-label="Chiibitsu Labs, home">
        <Mark />
        <span className="wordmark">Chiibitsu Labs</span>
      </Link>
      <main className="audit privacy">
        <h1>Privacy Policy</h1>
        <p className="caption">Effective {EFFECTIVE}</p>

        <h2>Who we are</h2>
        <p className="body">
          {about.legal.text}, based in Manila. We are the controller of the information described here. Contact: {mail}.
        </p>

        <h2>What we collect</h2>
        <ul className="body">
          <li>
            <strong>Usage information</strong> when you visit: the pages you view, the site that referred you, your device, browser and approximate location
            (country or city, from your IP address), and how you use the pages, such as clicks, scrolling and time spent, including session recordings.
          </li>
          <li>
            <strong>Organization information</strong> inferred from your IP address, such as the name of the company whose network you use. We do not
            use this to identify you personally.
          </li>
          <li>
            <strong>What you send us</strong>, such as your name, email address and message when you write to us.
          </li>
        </ul>
        <p className="body">There are no forms on this site and we do not ask for sensitive information.</p>
        <p className="body">
          The file checker on the Network page works out a file&apos;s fingerprint on your own device, and the file is never uploaded. To look the fingerprint up, your
          browser reads public ledger files from GitHub, which sees your IP address as it would on any visit to its site.
        </p>

        <h2>How we use it</h2>
        <ul className="body">
          <li>To understand how the site is used and improve it.</li>
          <li>To understand which organizations are interested in our services.</li>
          <li>To reply to you and provide the services you ask for.</li>
          <li>To keep the site secure and meet our legal obligations.</li>
        </ul>

        <h2>Legal bases</h2>
        <p className="body">
          Where the law requires a legal basis (for example in the EU and UK), we rely on our legitimate interests in running and improving our site and
          business, on your consent where the law requires consent for cookies, and on the steps needed to respond to your request or perform a contract.
        </p>

        <h2>Cookies</h2>
        <p className="body">
          We use analytics cookies and similar technologies to understand how the site is used. You can block or delete cookies in your browser settings.
          Where the law requires consent, these cookies are used only with it. We honor Global Privacy Control signals where our providers support them.
        </p>

        <h2>Who we share it with</h2>
        <p className="body">
          We use service providers for website hosting, analytics and business information. They process information on our behalf and under contract.
        </p>
        <p className="body">
          We partner with Microsoft Clarity to capture how you use and interact with our website through behavioral metrics, heatmaps and session
          replay. Website usage data is captured using first and third-party cookies and other tracking technologies. Microsoft may use this data for its
          own purposes, including improving its products. For more information about how Microsoft collects and uses your data, see the{" "}
          <a href={MS_PRIVACY} target="_blank" rel="noreferrer">
            Microsoft Privacy Statement
          </a>
          .
        </p>
        <p className="body">
          We do not sell your personal information, we do not share it for targeted advertising, and we do not run ads. We may disclose information if the
          law requires it.
        </p>

        <h2>International transfers</h2>
        <p className="body">
          Our providers may process information outside your country, including in the United States. Where required, transfers are protected by
          safeguards such as standard contractual clauses.
        </p>

        <h2>How long we keep it</h2>
        <p className="body">
          We keep usage information only as long as it is useful for the purposes above, within the retention periods set by our providers. We keep
          correspondence for as long as we work together and as the law requires.
        </p>

        <h2>Your rights</h2>
        <p className="body">
          Depending on where you live, you may have the right to access, correct, delete or receive a copy of your information, to object to or restrict
          how we use it, and to withdraw consent at any time. California residents may also ask what we collect and request deletion; we do not sell or
          share personal information as those terms are defined there. To exercise any right, email {mail}. We will not treat you differently for doing
          so. You may also complain to your data protection authority, such as the National Privacy Commission in the Philippines.
        </p>
        <p className="body">
          To opt out of Microsoft&apos;s data collection, use Global Privacy Control or the{" "}
          <a href="https://optout.aboutads.info/" target="_blank" rel="noreferrer">
            industry opt-out page
          </a>{" "}
          (select Microsoft).
        </p>

        <h2>Children</h2>
        <p className="body">This site is not directed at children under 16, and we do not knowingly collect their information.</p>

        <h2>Security</h2>
        <p className="body">We use reasonable technical and organizational measures to protect information. No method of transmission over the internet is fully secure.</p>

        <h2>Changes</h2>
        <p className="body">We will post any changes on this page with a new effective date.</p>

        <h2>Contact</h2>
        <p className="body">Questions or requests: {mail}.</p>

        <Link href="/" className="caption">← Back to the home page</Link>
      </main>
    </div>
  );
}
