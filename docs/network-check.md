# /network/check: private by default

The check page tells anyone *that* a file was sealed and *when*. It tells only someone holding the original file *what it is and who it is between*.

| What the visitor gives | What the page shows |
|---|---|
| A pasted hash, or a link carrying one | Issuer, sealed time, the ledger record (block, Base, Bitcoin). Never the parties. |
| The original file, dropped in | All of the above, plus "It is the {kind} between {party} and {party}." |
| A printed, rescanned or re-saved copy | Different bytes, so a different fingerprint: "Not found." Nothing is asked of the issuer. |

## Link format

```
https://www.chiibitsu.com/network/check?sha=<64 hex>
```

The page opens with that fingerprint filled in and checked. Uppercase and a `0x` prefix are accepted. Anything that is not a SHA-256 is ignored and the page opens empty. A link never reveals the parties, because a link carries no file.

## The reveal protocol

Two fingerprints of the same file:

- **Public fingerprint**: `SHA-256(bytes)`. It is in the ledger and in every link.
- **Reveal digest**: `SHA-256("chiibitsu-reveal\n" + bytes)`, a fixed 17-byte UTF-8 prefix followed by the file bytes. It is never published, shown or logged.

1. The browser hashes the dropped file and looks the public fingerprint up in the ledger. Nothing is sent.
2. Only when the file matched, it works out the reveal digest.
3. It sends `{sha256, reveal}` to the issuer.
4. The issuer answers with the kind and the parties only when `reveal` equals the digest it stored at seal time.

An issuer is whoever sealed the document and holds the party names. The network stores none. Today the only issuer is Chiibitsu Labs, served by this site.

### Reveal request (public)

```
POST /api/issuer/reveal
content-type: application/json

{"sha256": "<public fingerprint>", "reveal": "<reveal digest>"}
```

| Case | Status | Body |
|---|---|---|
| Digest matches | 200 | `{"match": true, "kind": "Blueprint Agreement", "parties": ["Chiibitsu Labs", "Client Co"]}` |
| Wrong digest, unknown fingerprint, or the public fingerprint sent as the digest | 200 | `{"match": false}`, the same body in all three cases |
| Either field missing or not 64 lowercase hex | 400 | `{"error": …}` |
| Store not configured | 503 | `{"error": …}` |

The endpoint allows 5 requests a minute from one address and 120 an hour overall, per server instance (`makeLimiter` in `lib/verifyAlert.ts`). The digests are compared in constant time.

### Seal-time write (private)

```
PUT /api/issuer/seal
authorization: Bearer <ISSUER_SEAL_SECRET>
content-type: application/json

{"sha256": "<public fingerprint>",
 "kind": "Blueprint Agreement",
 "parties": ["Chiibitsu Labs", "<client legal name>"],
 "reveal": "<reveal digest>"}
```

| Field | Rule |
|---|---|
| `sha256` | 64 lowercase hex. The same value sealed in the ledger. |
| `reveal` | 64 lowercase hex, and **must differ from `sha256`** (refused otherwise). |
| `kind` | 1 to 80 characters, no line breaks. Shown as "the {kind}". |
| `parties` | 2 to 10 names, each 1 to 120 characters, no line breaks, in display order. |

Answers: `201 {"stored": true}`. The same record again gets `200 {"stored": true, "already": true}`. A *different* record for a fingerprint already stored gets `409`, because records are written once. Other answers: `401` on a wrong or missing bearer, `400` on a bad field, `503` when the store is not configured.

Only the sealing side calls this. Never call it from a browser.

## Where the names live

They live in a Redis database reached over Upstash's REST API (`restStore` in `lib/issuer.ts`), server-side only, under the key `issuer:record:<sha256>`. The code sends each command as a JSON array POSTed to the REST URL (`["SET", key, value, "NX"]`, `["GET", key]`) and reads `{"result": …}`. That shape comes from memory of Upstash's documentation and is tested only against a fake. **Run one seal against the real database before relying on it.** Party names are stored only for documents Chiibitsu Labs sealed. They never go into the public ledger, the Telegram alert or analytics events. The result card and the hash field are marked `data-clarity-mask="true"` so Clarity's session recordings do not capture them. That attribute also comes from memory of Clarity's documentation: **open one recording of a reveal and confirm the sentence is masked.**

**Not private: the fingerprint in a link.** Clarity, Apollo and Vercel Analytics see page URLs, so a `?sha=` link's fingerprint reaches them along with the visitor. The fingerprint is public in the ledger anyway, and the Telegram alert already records every checked hash. The parties are never in a URL.

The trade-off, accepted: whoever holds the store's token can read every record. Mitigations: the token lives only in Vercel's environment, records can be deleted, and the public fingerprint alone unlocks nothing.

| Vercel environment variable | What |
|---|---|
| `ISSUER_STORE_URL` | The database's REST URL |
| `ISSUER_STORE_TOKEN` | Its REST token (read and write) |
| `ISSUER_SEAL_SECRET` | The bearer the sealing side sends to `/api/issuer/seal` |

With the first two unset, both endpoints answer 503. The check page then still shows the ledger record and says the issuer could not be asked.

## Tests

`npm run check:issuer` (part of `npm run gates`) checks the following:

- a hash alone reveals no party;
- the original file reveals the parties;
- a wrong file, and the public hash sent as the reveal digest, reveal nothing;
- the seal write is guarded by its bearer, which must carry the `Bearer` scheme, and is written once;
- a damaged stored record reveals nothing;
- the REST store's request shape is correct.
