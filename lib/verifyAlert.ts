// A private Telegram alert for each check on /verify, so impersonation attempts show up the moment they happen.
// Pure helpers live here (and are tested by scripts/check-verify.mjs); app/api/verify-alert/route.ts is the thin handler.

export type Alert = { input: string; kind: string; verdict: string };

const KINDS = ["email", "link", "address", "phone", "handle", "text"];
const VERDICTS: Record<string, string> = { lookalike: "🔴", domain: "🟡", unlisted: "🟡", unconfirmed: "🟡", unrecognized: "⚪", official: "🟢" };
const MAX_INPUT = 300;

// Control characters and line breaks are dropped so a pasted input cannot fake extra lines in the alert.
export function parseAlert(body: unknown): Alert | null {
  if (!body || typeof body !== "object") return null;
  const { input, kind, verdict } = body as Record<string, unknown>;
  if (typeof input !== "string" || typeof kind !== "string" || typeof verdict !== "string") return null;
  if (!KINDS.includes(kind) || !(verdict in VERDICTS)) return null;
  const clean = input.replace(/[\u0000-\u001f\u007f\u2028\u2029]+/g, " ").trim().slice(0, MAX_INPUT);
  return clean ? { input: clean, kind, verdict } : null;
}

const manila = (now: Date) =>
  new Intl.DateTimeFormat("en-GB", { timeZone: "Asia/Manila", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit", hour12: false }).format(now);

export function formatAlert(a: Alert, now: Date): string {
  return `${VERDICTS[a.verdict]} Verify check: ${a.verdict} (${a.kind})\n${a.input}\n${manila(now)} Manila`;
}

// The file checker on /network/check: only the fingerprint is ever sent, never the file or its name.
export type LedgerAlert = { hash: string; via: "file" | "hash"; result: "found" | "not_found" | "error"; block?: number };

export function parseLedgerAlert(body: unknown): LedgerAlert | null {
  if (!body || typeof body !== "object") return null;
  const { hash, via, result, block } = body as Record<string, unknown>;
  if (typeof hash !== "string" || !/^[0-9a-f]{64}$/.test(hash)) return null;
  if (via !== "file" && via !== "hash") return null;
  if (result !== "found" && result !== "not_found" && result !== "error") return null;
  if (block !== undefined && !(Number.isInteger(block) && (block as number) >= 0 && (block as number) < 1_000_000)) return null;
  return { hash, via, result, ...(result === "found" && typeof block === "number" ? { block } : {}) };
}

export function formatLedgerAlert(a: LedgerAlert, now: Date): string {
  const head =
    a.result === "found" ? `🟢 File check: found in block ${a.block ?? "?"}` : a.result === "not_found" ? "🟡 File check: not found" : "⚠️ File check: the ledger could not be read";
  return `${head} (${a.via === "file" ? "a file" : "a pasted hash"})\n${a.hash}\n${manila(now)} Manila`;
}

// Best-effort limits, kept per server instance: 5 a minute from one address, 120 an hour overall by default.
// The Telegram bot itself is the last line of defense; Telegram throttles a flooding bot.
export function makeLimiter(perHour = 120) {
  const perIp = new Map<string, number[]>();
  let all: number[] = [];
  return (ip: string, now: number): boolean => {
    const capped = Number.isFinite(perHour);
    if (capped) all = all.filter((t) => now - t < 3_600_000);
    const mine = (perIp.get(ip) ?? []).filter((t) => now - t < 60_000);
    if ((capped && all.length >= perHour) || mine.length >= 5) return false;
    if (capped) all.push(now);
    mine.push(now);
    perIp.set(ip, mine);
    if (perIp.size > 5000) perIp.clear();
    return true;
  };
}

export async function sendTelegram(
  text: string,
  env: { token?: string; chat?: string },
  doFetch: typeof fetch = fetch,
): Promise<"off" | "sent" | "failed"> {
  if (!env.token || !env.chat) return "off";
  try {
    const res = await doFetch(`https://api.telegram.org/bot${env.token}/sendMessage`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ chat_id: env.chat, text, disable_web_page_preview: true }),
      signal: AbortSignal.timeout(5000),
    });
    return res.ok ? "sent" : "failed";
  } catch {
    return "failed";
  }
}
