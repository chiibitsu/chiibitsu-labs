import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import { ThemeClock } from "@/components/ThemeClock";
import { bootScript } from "@/lib/boot";
import { content } from "@/lib/content";
import "./globals.css";

export const metadata: Metadata = {
  title: content.meta.title,
  description: content.meta.description,
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
