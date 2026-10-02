import type { Metadata } from "next";
import Link from "next/link";
import { Mark } from "@/components/Mark";
import { about } from "@/lib/about";

export const metadata: Metadata = {
  title: "Privacy · Chiibitsu Labs",
  description: "What chiibitsu.com records about visits, which tools do it, and how to opt out.",
};

const UPDATED = "2 October 2026";

// Names every tool that records a visit (app/layout.tsx), in plain words. Update this page whenever one is added or removed.
export default function Privacy() {
  return (
    <div className="page">
      <Link href="/" className="brand" aria-label="Chiibitsu Labs, home">
        <Mark />
        <span className="wordmark">Chiibitsu Labs</span>
      </Link>
      <main className="audit privacy">
        <h1>Privacy</h1>
        <p className="body">When you visit chiibitsu.com, three tools record how the site is used. This page says which, what they see, and how to opt out.</p>

        <h2>What is recorded</h2>
        <ul className="body">
          <li>
            <strong>Vercel Web Analytics:</strong> the pages you open, the site you came from, your country, device and browser. It sets no cookies.
          </li>
          <li>
            <strong>Microsoft Clarity:</strong> clicks, scrolling, mouse movement and time on each page, including recordings of visits. It sets a cookie. The data is stored on Microsoft Azure and we can see it for 30 days. Microsoft may also use it to improve its own products.
          </li>
          <li>
            <strong>Apollo:</strong> the company a visit comes from, worked out from the network address. It does not tell us your name.
          </li>
        </ul>

        <h2>What we don’t do</h2>
        <p className="body">We don’t run ads, we don’t sell data, and there are no forms on this site that collect your details.</p>

        <h2>Why</h2>
        <p className="body">To see which parts of the site help people and which don’t, and to improve it.</p>

        <h2>Your choices</h2>
        <ul className="body">
          <li>Turn on Global Privacy Control in your browser. Clarity honours it.</li>
          <li>
            Opt out of Clarity at <a href="https://optout.aboutads.info/" target="_blank" rel="noreferrer">optout.aboutads.info</a> (select Microsoft).
          </li>
          <li>Block cookies in your browser settings.</li>
          <li>
            Ask what we hold about you, or ask us to delete it: <a href={`mailto:${about.legal.email}`}>{about.legal.email}</a>.
          </li>
        </ul>

        <p className="body">We follow the Philippine Data Privacy Act of 2012 (Republic Act No. 10173).</p>
        <p className="caption">
          Updated {UPDATED}. {about.legal.text}.
        </p>
        <Link href="/" className="caption">← Back to the home page</Link>
      </main>
    </div>
  );
}
