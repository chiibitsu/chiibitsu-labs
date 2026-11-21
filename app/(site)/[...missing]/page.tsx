import { notFound } from "next/navigation";

// With two root layouts (app/(site) and app/(cert)) there is no layout above an unknown URL. This catch-all sends
// every unknown URL to app/(site)/not-found.tsx, inside the site layout. Real routes always win over it.
export default function Missing() {
  notFound();
}
