import { handleReveal, restStore } from "@/lib/issuer";
import { makeLimiter } from "@/lib/verifyAlert";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const allow = makeLimiter();

// The issuer's answer for /network/check: who a sealed file is between, only to someone holding the original. See lib/issuer.ts.
export async function POST(req: Request) {
  const ip = (req.headers.get("x-forwarded-for") ?? "unknown").split(",")[0].trim();
  if (!allow(ip, Date.now())) return Response.json({ error: "Too many checks. Try again in a minute." }, { status: 429 });
  const raw = await req.text();
  if (raw.length > 500) return new Response(null, { status: 413 });
  let body: unknown = null;
  try { body = JSON.parse(raw); } catch { /* not json */ }
  try {
    const r = await handleReveal(body, restStore(process.env.ISSUER_STORE_URL, process.env.ISSUER_STORE_TOKEN));
    return Response.json(r.body, { status: r.status, headers: { "cache-control": "no-store" } });
  } catch {
    return Response.json({ error: "The issuer could not be reached." }, { status: 502 });
  }
}
