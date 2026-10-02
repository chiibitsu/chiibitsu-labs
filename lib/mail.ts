// Every email link on the site opens with a subject and a starter body, so the visitor only fills in the blanks.
export type Mail = { email: string; subject: string; body: string };

const q = (s: string) => encodeURIComponent(s);

// The visitor's default email app (Apple Mail, Outlook, Gmail app, whatever they set).
export const mailto = ({ email, subject, body }: Mail) => `mailto:${email}?subject=${q(subject)}&body=${q(body)}`;
// Gmail and Outlook in the browser, for people with no email app set up.
export const gmail = ({ email, subject, body }: Mail) => `https://mail.google.com/mail/?view=cm&fs=1&to=${email}&su=${q(subject)}&body=${q(body)}`;
export const outlook = ({ email, subject, body }: Mail) =>
  `https://outlook.office.com/mail/deeplink/compose?to=${email}&subject=${q(subject)}&body=${q(body)}`;
