"use client";

import { useState } from "react";
import { Mark } from "@/components/Mark";
import { TrackedLink } from "@/components/TrackedLink";

type NavItem = { label: string; href: string | null };

// The fixed top bar on film pages: wordmark, nav and the audit button. On a phone the links fold into a menu.
export function FilmBar({
  nav,
  cta,
  location,
}: {
  nav: NavItem[];
  cta: { label: string; href: string };
  location: string;
}) {
  const [open, setOpen] = useState(false);
  const links = nav.map((n) => (
    <TrackedLink key={n.label} href={n.href} className="film-link-item">
      <span onClick={() => setOpen(false)}>{n.label}</span>
    </TrackedLink>
  ));
  return (
    <header className="film-bar">
      <TrackedLink href="/" className="brand">
        <Mark />
        <span className="wordmark">Chiibitsu Labs</span>
      </TrackedLink>
      <nav className="film-nav" aria-label="Main">
        {links}
        <TrackedLink href={cta.href} className="btn" event="cta_click" eventProps={{ location }}>
          {cta.label}
        </TrackedLink>
      </nav>
      <button type="button" className="menu-btn" aria-expanded={open} aria-controls="film-menu" onClick={() => setOpen((o) => !o)}>
        {open ? "Close" : "Menu"}
      </button>
      {open && (
        <nav id="film-menu" className="film-menu" aria-label="Main">
          {links}
          <TrackedLink href={cta.href} className="btn" event="cta_click" eventProps={{ location }}>
            {cta.label}
          </TrackedLink>
        </nav>
      )}
    </header>
  );
}
