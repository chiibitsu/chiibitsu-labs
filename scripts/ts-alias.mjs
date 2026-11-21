// Lets Node run the site's TypeScript directly in a gate: resolves "@/x" to ./x.ts or ./x.tsx, as tsconfig does.
import { register } from "node:module";
import fs from "node:fs";

const root = new URL("../", import.meta.url);
export async function resolve(spec, ctx, next) {
  if (spec.startsWith("@/")) {
    for (const ext of [".ts", ".tsx", "", "/index.ts", "/index.tsx"]) {
      const url = new URL(spec.slice(2) + ext, root);
      if (fs.existsSync(url) && fs.statSync(url).isFile()) return next(url.href, ctx);
    }
  }
  return next(spec, ctx);
}
if (!globalThis.__tsAliasRegistered) {
  globalThis.__tsAliasRegistered = true;
  register(import.meta.url);
}
