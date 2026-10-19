import { handleSeal, restStore } from "@/lib/issuer";
import { makeLimiter } from "@/lib/verifyAlert";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Called at seal time by the sealing step, never by a browser: stores {kind, parties, reveal} for one fingerprint. See lib/issuer.ts.
const allow = makeLimiter();

export async function PUT(req: Request) {
  const ip = (req.headers.get("x-forwarded-for") ?? "unknown").split(",")[0].trim();
  if (!allow(ip, Date.now())) return new Response(null, { status: 429 });
  if (Number(req.headers.get("content-length") ?? 0) > 4000) return new Response(null, { status: 413 });
  const raw = await req.text();
  if (raw.length > 4000) return new Response(null, { status: 413 });
  let body: unknown = null;
  try { body = JSON.parse(raw); } catch { /* not json */ }
  try {
    const r = await handleSeal(req.headers.get("authorization"), body, process.env.ISSUER_SEAL_SECRET, restStore(process.env.ISSUER_STORE_URL, process.env.ISSUER_STORE_TOKEN));
    return Response.json(r.body, { status: r.status, headers: { "cache-control": "no-store" } });
  } catch {
    return Response.json({ error: "The store could not be reached." }, { status: 502 });
  }
}
