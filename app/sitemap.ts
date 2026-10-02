import type { MetadataRoute } from "next";

// Public pages only. /investor, /audit and the still versions are noindex and stay out.
const BASE = "https://www.chiibitsu.com";

export default function sitemap(): MetadataRoute.Sitemap {
  return ["", "/about", "/angeline", "/privacy"].map((p) => ({ url: `${BASE}${p}`, changeFrequency: "weekly", priority: p === "" ? 1 : 0.6 }));
}
