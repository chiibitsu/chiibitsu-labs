# Fixtures

`cert_cohort.json` is a byte-for-byte copy of `tests/vectors/cert_cohort.json` from chiibitsu/aikiri-network, PR #22 at commit `562cf19d4ee6efb4820aeeae767dee5f41b6778b`. That file and `docs/certificates.md` are the certificate format's source of truth. Every value in it is fake except the issuer.

- Never edit it here. Changing any byte of it is a protocol version change, made in aikiri-network first and then copied here again.
- `npm run check:cert-logic` runs every vector through `lib/certCheck.ts`.
- Preview builds (never production) use its records as the sample certificates, loaded on demand, with their block numbers moved out of the real ledger's range.
