import type { MetadataRoute } from "next";

// Public pages only. lastModified is the build date, which is when the content last changed. /investor, /audit and the still versions are noindex and stay out.
const BASE = "https://www.chiibitsu.com";

export default function sitemap(): MetadataRoute.Sitemap {
  return ["", "/about", "/angeline", "/ledger", "/network", "/network/check", "/privacy"].map((p) => ({ url: `${BASE}${p}`, lastModified: new Date(), changeFrequency: "weekly", priority: p === "" ? 1 : 0.6 }));
}
