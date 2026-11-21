import { NextResponse, type NextRequest } from "next/server";

// An ENFORCED Content-Security-Policy for /network/cert only (the rest of the site's policy is report-only,
// in next.config.ts). Scripts: this site only, plus a fresh nonce per request for Next.js's inline scripts
// and the theme script. Connections: this site and the public ledger on raw.githubusercontent.com. No third party.
// 'strict-dynamic' lets the nonced Next.js loader pull in its own chunks; browsers that honour it ignore 'self'.
export function cspFor(nonce: string, dev = false) {
  return [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'${dev ? " 'unsafe-eval'" : ""}`,
    "connect-src 'self' https://raw.githubusercontent.com",
    "img-src 'self' data:",
    "style-src 'self' 'unsafe-inline'",
    "font-src 'self'",
    "frame-ancestors 'none'",
    "base-uri 'none'",
    "form-action 'self'",
    "object-src 'none'",
  ].join("; ");
}

export function proxy(request: NextRequest) {
  const nonce = Buffer.from(crypto.randomUUID()).toString("base64");
  const csp = cspFor(nonce, process.env.NODE_ENV === "development");
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-nonce", nonce);
  requestHeaders.set("Content-Security-Policy", csp);
  const response = NextResponse.next({ request: { headers: requestHeaders } });
  response.headers.set("Content-Security-Policy", csp);
  response.headers.set("Referrer-Policy", "no-referrer");
  response.headers.set("Cache-Control", "no-store");
  return response;
}

export const config = {
  matcher: [{ source: "/network/cert", missing: [{ type: "header", key: "next-router-prefetch" }, { type: "header", key: "purpose", value: "prefetch" }] }],
};
