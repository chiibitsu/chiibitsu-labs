"use client";

import Link from "next/link";
import { track } from "@vercel/analytics";
import type { ReactNode } from "react";

type Props = {
  href: string | null;
  className?: string;
  event?: string;
  eventProps?: Record<string, string | number | boolean>;
  children: ReactNode;
};

// A link that reports a custom Web Analytics event. href null is a placeholder: it renders, hovers and tracks, and goes nowhere.
export function TrackedLink({ href, className, event, eventProps, children }: Props) {
  // A placeholder click is tagged so it is never counted as a real conversion.
  const fire = () => {
    if (event) track(event, href === null ? { ...eventProps, placeholder: true } : eventProps);
  };
  if (href === null) {
    return (
      <a
        href="#"
        className={className}
        data-placeholder="true"
        onClick={(e) => {
          e.preventDefault();
          fire();
        }}
      >
        {children}
      </a>
    );
  }
  if (href.startsWith("/")) {
    return (
      <Link href={href} className={className} onClick={fire}>
        {children}
      </Link>
    );
  }
  return (
    <a href={href} className={className} onClick={fire}>
      {children}
    </a>
  );
}
