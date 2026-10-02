"use client";

import { useState } from "react";
import { gmail, mailto, outlook, type Mail } from "@/lib/mail";

// One email address, four ways to use it: the default email app, Gmail, Outlook, or copy the address into anything else.
// Each link opens a draft with the subject and a starter body filled in.
export function EmailOptions({ mail }: { mail: Mail }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(mail.email);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };
  return (
    <div className="mail">
      <a className="mail-addr" href={mailto(mail)}>
        {mail.email}
      </a>
      <div className="mail-opts">
        <span className="caption">Write from</span>
        <a href={mailto(mail)}>Email app</a>
        <a href={gmail(mail)} target="_blank" rel="noreferrer">
          Gmail
        </a>
        <a href={outlook(mail)} target="_blank" rel="noreferrer">
          Outlook
        </a>
        <button type="button" className="mail-copy" onClick={copy}>
          {copied ? "Copied ✓" : "Copy address"}
        </button>
      </div>
    </div>
  );
}
