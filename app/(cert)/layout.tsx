import type { Metadata } from "next";
import { headers } from "next/headers";
import { ThemeClock } from "@/components/ThemeClock";
import { bootScript } from "@/lib/boot";
import { caveat, plexMono, spectral } from "../fonts";
import "../globals.css";

// The root layout for /network/cert only. It loads NO third-party scripts: no Clarity (session replay would
// record the holder's name), no Apollo, no Vercel Analytics or Speed Insights. The site's own layout,
// app/(site)/layout.tsx, keeps them for every other page. The proxy (proxy.ts) enforces a strict
// Content-Security-Policy here and passes its nonce in x-nonce; the theme script carries it.
export const metadata: Metadata = {
  metadataBase: new URL("https://www.chiibitsu.com"),
  robots: { index: false, follow: false },
  referrer: "no-referrer",
};

export default async function CertRootLayout({ children }: { children: React.ReactNode }) {
  const nonce = (await headers()).get("x-nonce") ?? undefined;
  return (
    <html lang="en" data-theme="day" data-aud="companies" className={`${spectral.variable} ${plexMono.variable} ${caveat.variable}`} suppressHydrationWarning>
      <head>
        <script nonce={nonce} dangerouslySetInnerHTML={{ __html: bootScript }} />
      </head>
      <body>
        {children}
        <ThemeClock />
      </body>
    </html>
  );
}
