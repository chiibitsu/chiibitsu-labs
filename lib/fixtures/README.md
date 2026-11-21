# Fixtures

`cert_cohort.json` is a byte-for-byte copy of `tests/vectors/cert_cohort.json` from chiibitsu/aikiri-network, PR #22 at commit `f2cb0cd4068f680d9aa5b82aaaf61adb8a7b8cca` (sha256 `d8ad1a70c8ae370b54c6756929887706e4034498450403fc9eba1713b32e6b08`). That file and `docs/certificates.md` are the certificate format's source of truth. Every value in it is fake except the issuer.

- Never edit it here. Changing any byte of it is a protocol version change, made in aikiri-network first and then copied here again.
- `npm run check:cert-logic` runs every vector through `lib/certCheck.ts`.
- Preview builds (never production) use its records as the sample certificates, loaded on demand, with their block numbers moved out of the real ledger's range.
