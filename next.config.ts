import type { NextConfig } from "next";

const config: NextConfig = {
  reactStrictMode: true,
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
