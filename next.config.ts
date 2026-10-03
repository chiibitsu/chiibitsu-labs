import type { NextConfig } from "next";

// Every outside origin the site loads from: Microsoft Clarity, Apollo, and Vercel Analytics and Speed Insights
// (which use this site's own /_vercel paths). Next.js inlines small scripts and styles, hence 'unsafe-inline'.
const CSP = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' https://www.clarity.ms https://*.clarity.ms https://assets.apollo.io",
  "connect-src 'self' https://*.clarity.ms https://c.bing.com https://*.apollo.io https://raw.githubusercontent.com",
  "img-src 'self' data: https://*.clarity.ms https://c.bing.com",
  "style-src 'self' 'unsafe-inline'",
  "font-src 'self'",
  "frame-ancestors 'self'",
  "base-uri 'self'",
  "form-action 'self'",
  "object-src 'none'",
].join("; ");

const config: NextConfig = {
  reactStrictMode: true,
  // Security headers on every response. HSTS is already set by Vercel.
  // The Content Security Policy runs in report-only mode first: browsers log what it would block and block nothing.
  // Once a week of real visits shows no violations, rename the header to Content-Security-Policy to enforce it.
  // A short address to share with clients: chiibitsu.com/verify.
  async redirects() {
    return [{ source: "/verify", destination: "/network/check", permanent: false }];
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "Content-Security-Policy-Report-Only", value: CSP },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=(), usb=()" },
        ],
      },
    ];
  },
  // investor.chiibitsu.com serves the investor page at its root. Inert until that domain is attached to this project.
  async rewrites() {
    return {
      beforeFiles: [{ source: "/", has: [{ type: "host", value: "investor.chiibitsu.com" }], destination: "/investor" }],
      afterFiles: [],
      fallback: [],
    };
  },
};

export default config;
