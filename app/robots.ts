import type { MetadataRoute } from "next";

// Everyone may read the public site, AI crawlers included (Chii, 2026-10-02: "yes so we can be read by ai").
// The AI crawlers are named so the choice is explicit, not an accident of the wildcard.
const AI_CRAWLERS = ["OAI-SearchBot", "GPTBot", "ChatGPT-User", "ClaudeBot", "Claude-SearchBot", "PerplexityBot", "Google-Extended", "Applebot-Extended"];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", allow: "/" }, ...AI_CRAWLERS.map((userAgent) => ({ userAgent, allow: "/" }))],
    sitemap: "https://www.chiibitsu.com/sitemap.xml",
  };
}
