import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import { ThemeClock } from "@/components/ThemeClock";
import { bootScript } from "@/lib/boot";
import { content } from "@/lib/content";
import "./globals.css";

// The share card (app/opengraph-image.png, 1200x630, source design/og-woah.html): a 6:15 lock screen with one notification from the ghost team.
export const metadata: Metadata = {
  metadataBase: new URL("https://www.chiibitsu.com"),
  title: content.meta.title,
  description: content.meta.description,
  // No fixed title or description here: each page's own <title> and description stand, so a shared /about or /angeline keeps its name.
  openGraph: {
    type: "website",
    siteName: content.meta.title,
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-theme="day" data-aud="companies" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: bootScript }} />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* eslint-disable-next-line @next/next/no-page-custom-font -- App Router root layout: this loads on every page. */}
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Spectral:ital,wght@0,300;0,400;1,300&family=IBM+Plex+Mono:wght@400;500&family=Caveat:wght@500&display=swap"
        />
      </head>
      <body>
        {children}
        <ThemeClock />
        <Analytics />
      </body>
    </html>
  );
}
