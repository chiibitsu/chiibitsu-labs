import { formatAlert, makeLimiter, parseAlert, sendTelegram } from "@/lib/verifyAlert";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const HOSTS = new Set(["www.chiibitsu.com", "chiibitsu.com", "localhost"]);
const allow = makeLimiter();

// Called by the Verify box after each check. With no TELEGRAM_BOT_TOKEN and TELEGRAM_CHAT_ID set it does nothing.
// The visitor always gets the same quick answer, so a slow or failing Telegram never shows on the page.
export async function POST(req: Request) {
  const origin = req.headers.get("origin");
  if (origin) {
    let host = "";
    try { host = new URL(origin).hostname; } catch { /* bad origin */ }
    if (!HOSTS.has(host)) return new Response(null, { status: 403 });
  }
  const ip = (req.headers.get("x-forwarded-for") ?? "unknown").split(",")[0].trim();
  if (!allow(ip, Date.now())) return new Response(null, { status: 429 });

  const raw = await req.text();
  if (raw.length > 2000) return new Response(null, { status: 413 });
  let body: unknown = null;
  try { body = JSON.parse(raw); } catch { /* not json */ }
  const alert = parseAlert(body);
  if (!alert) return new Response(null, { status: 400 });

  await sendTelegram(formatAlert(alert, new Date()), { token: process.env.TELEGRAM_BOT_TOKEN, chat: process.env.TELEGRAM_CHAT_ID });
  return new Response(null, { status: 204 });
}
