import type { NextConfig } from "next";

const config: NextConfig = {
  reactStrictMode: true,
  // Security headers on every response. HSTS is already set by Vercel. No Content-Security-Policy yet:
  // Clarity, Apollo and Vercel Analytics would each need exact rules, and a wrong one silently stops analytics.
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
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
