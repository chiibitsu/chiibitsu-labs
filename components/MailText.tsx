import { Fragment } from "react";
import { mailto, type Mail } from "@/lib/mail";

// Text from content that mentions our address: each mention becomes a link that opens a ready draft.
export function MailText({ text, mail }: { text: string; mail: Mail }) {
  const parts = text.split(mail.email);
  return (
    <>
      {parts.map((p, i) => (
        <Fragment key={i}>
          {p}
          {i < parts.length - 1 && <a href={mailto(mail)}>{mail.email}</a>}
        </Fragment>
      ))}
    </>
  );
}
