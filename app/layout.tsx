import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { ThemeClock } from "@/components/ThemeClock";
import { bootScript } from "@/lib/boot";
import { content } from "@/lib/content";
import { caveat, plexMono, spectral } from "./fonts";
import "./globals.css";

// Microsoft Clarity: recordings, scroll maps, time on page and events. Apollo: which company a visit comes from.
// Both are named on /privacy. Each runs once per page load from the head.
const CLARITY_ID = "yr62qfnz0b";
const clarityScript = `(function(c,l,a,r,i,t,y){c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);})(window,document,"clarity","script","${CLARITY_ID}");`;
const apolloScript = `function initApollo(){var n=Math.random().toString(36).substring(7),o=document.createElement("script");o.src="https://assets.apollo.io/micro/website-tracker/tracker.iife.js?nocache="+n,o.async=!0,o.defer=!0,o.onload=function(){window.trackingFunctions.onLoad({appId:"69eaa9571f03c5000da5a540"})},document.head.appendChild(o)}initApollo();`;

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
    <html lang="en" data-theme="day" data-aud="companies" className={`${spectral.variable} ${plexMono.variable} ${caveat.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: bootScript }} />
        <script dangerouslySetInnerHTML={{ __html: clarityScript }} />
        <script dangerouslySetInnerHTML={{ __html: apolloScript }} />
      </head>
      <body>
        {children}
        <ThemeClock />
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
