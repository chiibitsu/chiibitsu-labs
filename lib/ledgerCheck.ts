// Checks a hash against the public Aikiri ledger, in the visitor's browser. Nothing is uploaded: a file is hashed
// on the device, and only public ledger files are fetched. Reading a proof here is not verifying it.

export const LEDGER_RAW = "https://raw.githubusercontent.com/chiibitsu/aikiri-network/main/ledger";
export const MAX_FILE_BYTES = 250 * 1024 * 1024;
export const EXAMPLE_HASH = "73715608c05be3f134036de0f5a1606b348098e2bebf34c8102680be08650ea8"; // block 0, the genesis block

const pad = (n: number) => String(n).padStart(6, "0");

export type Block = {
  index: number;
  hash: string;
  timestamp: string;
  merkle_root?: string;
  roots?: { kind?: string; sha256?: string }[];
};

export type Match = { block: Block; how: "block" | "root" | "rootset"; kind?: string };

export type Witness = {
  base: { tx: string | null; note: string };
  bitcoin: { state: "attested" | "pending" | "none"; heights: number[] };
};

export const normalizeHash = (s: string) => s.trim().toLowerCase().replace(/^0x/, "");
export const isHash = (s: string) => /^[0-9a-f]{64}$/.test(s);

export async function sha256Hex(buf: ArrayBuffer): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", buf);
  return Array.from(new Uint8Array(digest), (b) => b.toString(16).padStart(2, "0")).join("");
}

async function getText(url: string): Promise<string> {
  const r = await fetch(url, { cache: "no-store" });
  if (!r.ok) throw new Error(`${r.status}`);
  return r.text();
}

export async function loadBlocks(): Promise<Block[]> {
  const head = (await getText(`${LEDGER_RAW}/HEAD`)).trim().split(/\s+/)[0];
  const last = parseInt(head, 10);
  if (!Number.isInteger(last) || last < 0 || last > 100000) throw new Error("the ledger index could not be read");
  const blocks = await Promise.all(
    Array.from({ length: last + 1 }, async (_, i) => JSON.parse(await getText(`${LEDGER_RAW}/blocks/${pad(i)}.json`)) as Block),
  );
  return blocks;
}

export function findMatch(blocks: Block[], hash: string): Match | null {
  for (const b of blocks) {
    if (b.hash === hash) return { block: b, how: "block" };
    const root = (b.roots ?? []).find((r) => r.sha256 === hash);
    if (root) return { block: b, how: "root", kind: root.kind };
    if (b.merkle_root === hash) return { block: b, how: "rootset" };
  }
  return null;
}

// The Bitcoin block heights a proof (.ots) names: each attestation is the tag, a length, then the height as a varint.
export function bitcoinHeights(bytes: Uint8Array): number[] {
  const tag = [0x05, 0x88, 0x96, 0x0d, 0x73, 0xd7, 0x19, 0x01];
  const heights: number[] = [];
  for (let i = 0; i + tag.length < bytes.length; i++) {
    if (!tag.every((t, k) => bytes[i + k] === t)) continue;
    let j = i + tag.length;
    const len = bytes[j++];
    let h = 0;
    let shift = 0;
    for (let k = 0; k < len && j + k < bytes.length; k++) {
      const byte = bytes[j + k];
      h += (byte & 0x7f) * 2 ** shift;
      shift += 7;
      if (!(byte & 0x80)) break;
    }
    heights.push(h);
    i = j + len - 1;
  }
  return heights;
}

export async function loadWitness(index: number): Promise<Witness> {
  let base: Witness["base"] = { tx: null, note: "No Base anchor file for this block." };
  try {
    if (index === 0) {
      const d = JSON.parse(await getText(`${LEDGER_RAW}/deploy.json`));
      base = { tx: d.tx ? `0x${d.tx}` : null, note: "The genesis hash is written into the contract when it was deployed." };
    } else {
      const p = JSON.parse(await getText(`${LEDGER_RAW}/proofs/${pad(index)}.base.json`));
      base = { tx: p.tx ? `0x${p.tx}` : null, note: "Anchored on Base." };
    }
  } catch {
    /* no file: the note says so */
  }
  let bitcoin: Witness["bitcoin"] = { state: "none", heights: [] };
  try {
    const r = await fetch(`${LEDGER_RAW}/proofs/${pad(index)}.hash.ots`, { cache: "no-store" });
    if (r.ok) {
      const heights = bitcoinHeights(new Uint8Array(await r.arrayBuffer()));
      bitcoin = heights.length ? { state: "attested", heights } : { state: "pending", heights: [] };
    }
  } catch {
    /* no proof file */
  }
  return { base, bitcoin };
}

export function when(timestamp: string): { local: string; utc: string } {
  const clean = timestamp.replace(/\.\d+/, "");
  const d = new Date(clean);
  const utc = Number.isNaN(d.getTime()) ? "" : `${d.toISOString().slice(0, 19).replace("T", " ")} UTC`;
  return { local: clean.replace("T", " "), utc };
}
