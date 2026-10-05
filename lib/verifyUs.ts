// Checks one pasted thing (an email, link, handle, phone number or wallet address) against Chiibitsu Labs' official
// channels, in the browser. A lookalike is judged only for domains and emails, where the list is complete; for phones,
// handles and wallets the list is not complete, so an unknown one is "cannot confirm", never "not ours".

export type Verdict = "official" | "domain" | "lookalike" | "unlisted" | "unconfirmed" | "unrecognized";
export type Kind = "email" | "link" | "address" | "phone" | "handle" | "text";
export type Check = { verdict: Verdict; kind: Kind; input: string; detail: string };

export type OfficialList = {
  domains: string[];
  emails: { value: string; owner: string }[];
  profiles: { platform: string; host: string; path: string; owner: string; hidden?: boolean }[];
  addresses: { value: string; owner: string }[];
  handles: { platform?: string; value: string; owner: string }[];
  phones: { value: string; owner: string }[];
  privatePhones?: { salt: string; iterations: number; items: { hash: string; owner: string }[] };
  partial?: string[];
};

// Hosts of social and messaging platforms. A page here that is not a listed profile cannot be confirmed.
const PLATFORMS = ["instagram.com", "facebook.com", "fb.com", "m.me", "messenger.com", "x.com", "twitter.com", "t.me", "telegram.me", "wa.me", "whatsapp.com", "youtube.com", "youtu.be", "tiktok.com", "threads.net", "viber.com", "discord.gg", "discord.com"];

const FOLD: Record<string, string> = {
  а: "a", е: "e", о: "o", р: "p", с: "c", х: "x", у: "y", і: "i", ј: "j", ѕ: "s", ԁ: "d", ӏ: "l", ɡ: "g",
  ο: "o", α: "a", ι: "i", ν: "v", ρ: "p", ı: "i", ɩ: "i", ⅼ: "l", ｉ: "i",
};

export function distance(a: string, b: string): number {
  const d: number[][] = Array.from({ length: a.length + 1 }, (_, i) => [i, ...Array(b.length).fill(0)]);
  for (let j = 0; j <= b.length; j++) d[0][j] = j;
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + cost);
      if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) d[i][j] = Math.min(d[i][j], d[i - 2][j - 2] + 1);
    }
  }
  return d[a.length][b.length];
}

// What a name looks like at a glance: accents and lookalike letters folded, l/1/! read as i, "rn" as m, repeated i's as one.
export function skeleton(s: string): string {
  const folded = s.normalize("NFKD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/./gu, (ch) => FOLD[ch] ?? ch);
  return folded
    .replace(/[^a-z0-9]/g, "")
    .replace(/[l1|]/g, "i")
    .replace(/0/g, "o")
    .replace(/5/g, "s")
    .replace(/3/g, "e")
    .replace(/rn/g, "m")
    .replace(/vv/g, "w")
    .replace(/i+/g, "i");
}

// RFC 3492, so a pasted xn-- address is read as the letters it stands for.
function punyDecode(input: string): string {
  const base = 36, tMin = 1, tMax = 26, skew = 38, damp = 700;
  const adapt = (delta: number, points: number, first: boolean) => {
    delta = first ? Math.floor(delta / damp) : delta >> 1;
    delta += Math.floor(delta / points);
    let k = 0;
    while (delta > (((base - tMin) * tMax) >> 1)) {
      delta = Math.floor(delta / (base - tMin));
      k += base;
    }
    return Math.floor(k + ((base - tMin + 1) * delta) / (delta + skew));
  };
  const out: number[] = [];
  let basic = input.lastIndexOf("-");
  if (basic < 0) basic = 0;
  for (let j = 0; j < basic; j++) out.push(input.charCodeAt(j));
  let n = 128, i = 0, bias = 72;
  for (let idx = basic > 0 ? basic + 1 : 0; idx < input.length; ) {
    const oldi = i;
    let w = 1;
    for (let k = base; ; k += base) {
      const c = input.charCodeAt(idx++);
      const digit = c - 48 < 10 ? c - 22 : c - 65 < 26 ? c - 65 : c - 97 < 26 ? c - 97 : base;
      if (digit >= base || Number.isNaN(digit)) throw new Error("bad punycode");
      i += digit * w;
      const t = k <= bias ? tMin : k >= bias + tMax ? tMax : k - bias;
      if (digit < t) break;
      w *= base - t;
    }
    const len = out.length + 1;
    bias = adapt(i - oldi, len, oldi === 0);
    n += Math.floor(i / len);
    i %= len;
    out.splice(i++, 0, n);
  }
  return String.fromCodePoint(...out);
}

function unicodeHost(host: string): string {
  return host
    .split(".")
    .map((label) => {
      if (!label.startsWith("xn--")) return label;
      try {
        return punyDecode(label.slice(4));
      } catch {
        return label;
      }
    })
    .join(".");
}

// Digits only, with a Philippine local number (09xx…) written in its international form (639xx…).
export function phoneKey(input: string): string {
  let d = input.replace(/[^\d]/g, "").replace(/^00/, "");
  if (/^09\d{9}$/.test(d)) d = `63${d.slice(1)}`;
  else if (/^9\d{9}$/.test(d)) d = `63${d}`;
  return d;
}

export const looksLikePhone = (input: string) => /^[+()\d\s.-]{7,}$/.test(input.trim()) && input.replace(/[^\d]/g, "").length >= 7;

// A number listed without being printed is stored as a slow fingerprint (PBKDF2-SHA-256), checked here on the device.
export async function privatePhoneOwner(input: string, list: OfficialList): Promise<string | null> {
  const p = list.privatePhones;
  if (!p || !p.items.length || !looksLikePhone(input)) return null;
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(phoneKey(input)), "PBKDF2", false, ["deriveBits"]);
  const bits = await crypto.subtle.deriveBits({ name: "PBKDF2", hash: "SHA-256", salt: new TextEncoder().encode(p.salt), iterations: p.iterations }, key, 256);
  const hex = Array.from(new Uint8Array(bits), (b) => b.toString(16).padStart(2, "0")).join("");
  return p.items.find((i) => i.hash === hex)?.owner ?? null;
}

const isOwn = (host: string, domains: string[]) => domains.some((d) => host === d || host.endsWith(`.${d}`));

// True when the host imitates one of our domains: our name inside another address, or a label that reads like ours.
function imitates(host: string, domains: string[]): boolean {
  const labels = unicodeHost(host).split(".");
  return domains.some((d) => {
    const mine = skeleton(d.split(".")[0]);
    return labels.some((label) => {
      const sk = skeleton(label);
      if (!sk) return false;
      return sk.includes(mine) || distance(sk, mine) <= 2;
    });
  });
}

type Parsed = { host: string; path: string; disguised: boolean };

function parseLink(raw: string): Parsed | null {
  const s = raw.trim().replace(/^[a-z][a-z0-9+.-]*:\/\//i, "");
  const cut = s.search(/[/?#]/);
  let authority = cut < 0 ? s : s.slice(0, cut);
  const rest = cut < 0 ? "" : s.slice(cut);
  let disguised = false;
  if (authority.includes("@")) {
    disguised = true;
    authority = authority.slice(authority.lastIndexOf("@") + 1);
  }
  const host = authority.replace(/:\d+$/, "").toLowerCase().replace(/\.$/, "");
  if (!host || !host.includes(".") || /\s/.test(host)) return null;
  const path = rest.replace(/[?#].*$/, "").replace(/\/+$/, "").toLowerCase();
  return { host, path, disguised };
}

const strip = (host: string) => host.replace(/^www\./, "");

export function checkOfficial(rawInput: string, list: OfficialList): Check {
  const input = rawInput.trim();
  const make = (verdict: Verdict, kind: Kind, detail: string): Check => ({ verdict, kind, input, detail });
  if (!input || input.length > 300) return make("unrecognized", "text", "");

  // A wallet address.
  if (/^0x[0-9a-f]{40}$/i.test(input)) {
    const hit = list.addresses.find((a) => a.value.toLowerCase() === input.toLowerCase());
    return hit
      ? make("official", "address", hit.owner)
      : make("unconfirmed", "address", "A wallet address that is not one of the two listed.");
  }

  // An email address.
  const mail = /^(?:mailto:)?([^\s@/:]+)@([^\s@/]+\.[^\s@/]+)$/i.exec(input);
  if (mail) {
    const full = `${mail[1]}@${mail[2]}`.toLowerCase();
    const hit = list.emails.find((e) => e.value.toLowerCase() === full);
    if (hit) return make("official", "email", hit.owner);
    const host = mail[2].toLowerCase();
    if (isOwn(host, list.domains)) return make("domain", "email", `Domain ${host}.`);
    if (imitates(host, list.domains)) return make("lookalike", "email", `The domain ${unicodeHost(host)} reads like ours but is a different address.`);
    return make("unlisted", "email", `Domain ${host}.`);
  }

  // A phone number.
  if (looksLikePhone(input)) {
    const norm = phoneKey(input);
    const hit = list.phones.find((p) => phoneKey(p.value) === norm);
    return hit ? make("official", "phone", hit.owner) : make("unconfirmed", "phone", "This number is not one we list.");
  }

  // A handle such as @name.
  const bareHandle = list.handles.some((x) => x.value.replace(/^@/, "").toLowerCase() === input.toLowerCase());
  if (/^@[\w.-]{2,}$/.test(input) || bareHandle) {
    const h = input.replace(/^@/, "").toLowerCase();
    const hit = list.handles.find((x) => x.value.replace(/^@/, "").toLowerCase() === h);
    return hit ? make("official", "handle", `${hit.platform ? `${hit.platform}, ` : ""}${hit.owner}`) : make("unconfirmed", "handle", "This handle is not one we list.");
  }

  // A link or bare address.
  const link = parseLink(input);
  if (link) {
    const { host, disguised } = link;
    const bare = strip(host);
    if (disguised) {
      const before = input.replace(/^[a-z][a-z0-9+.-]*:\/\//i, "").split("@")[0];
      const detail = `The address before the @ is a disguise. The real site is ${host}.`;
      return make(imitates(before, list.domains) || imitates(host, list.domains) ? "lookalike" : "unlisted", "link", detail);
    }
    if (isOwn(host, list.domains) || isOwn(bare, list.domains)) return make("official", "link", `On ${list.domains[0]}.`);
    const onHost = list.profiles.filter((p) => strip(p.host) === bare);
    if (onHost.length) {
      const hit = onHost.find((p) => link.path === p.path.toLowerCase());
      if (hit) return make("official", "link", `${hit.platform}, ${hit.owner}.`);
      return (list.partial ?? []).includes(bare)
        ? make("unconfirmed", "link", `We list only some of our ${onHost[0].platform} pages.`)
        : make("unlisted", "link", `A different ${onHost[0].platform} page from the ones we list.`);
    }
    if (imitates(host, list.domains)) return make("lookalike", "link", `The site ${unicodeHost(host)} reads like ours but is a different address.`);
    if (PLATFORMS.some((p) => bare === p || bare.endsWith(`.${p}`))) return make("unconfirmed", "link", "We list no page on that platform yet.");
    return make("unlisted", "link", `The site is ${host}.`);
  }

  return make("unrecognized", "text", "");
}
