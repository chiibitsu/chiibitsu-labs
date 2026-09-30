import { content as c } from "@/lib/content";

// A post's series tag. The Substack feed's section or category comes first (post.tag);
// without one, a title that starts with a known series name takes that name. Untagged posts show no tag.
export function seriesTag(post: { title: string; tag?: string }): string | null {
  if (post.tag) return post.tag;
  return c.publication.tagPrefixes.find((t) => post.title.toLowerCase().startsWith(t.toLowerCase())) ?? null;
}
