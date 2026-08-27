# JANUS HELIOS — CI & Release Evidence

This document records reproducible integrity evidence for **immutable historical repository snapshots**. It does not turn HELIOS into a production-certified product and does not replace transaction counsel, independent security review, regulated-game certification, provider pilot or closing-time independent SBOM/licence review.

## Recorded baseline integrity snapshot

Repository: `Hawkar-usls/Janus-HELIOS`

Commit:

`36c28dd139218e765d5e62ba0c090d29f7fe4b84`

GitHub Actions workflow: `HELIOS Integrity`

Run ID: `33085222325` (run #73)

Result: **success**.

Execution environment:

- GitHub-hosted Ubuntu runner;
- Node.js 24;
- read-only `contents` workflow permission;
- checkout credentials not persisted;
- third-party GitHub Actions pinned to immutable commit SHAs.

The following stages completed with `success` for that exact snapshot:

1. syntax/public-surface checks;
2. configured invariant test suite;
3. high-confidence tracked-file secret scan;
4. declared dependency SBOM generation;
5. buyer due-diligence preflight;
6. strict closing-manifest generation;
7. buyer-integrity artifact upload.

## Recorded buyer-integrity artifact

Artifact name:

`helios-buyer-integrity-36c28dd139218e765d5e62ba0c090d29f7fe4b84`

Artifact ID: `9651829670`

GitHub-reported archive digest:

`sha256:e9316b3079b8d6c351bc1d2b48eb5eb4c4264fe0dc814f4c466d44e3874682b6`

The artifact is temporary CI evidence. A transaction must regenerate and separately preserve evidence for the exact final closing commit rather than rely indefinitely on Actions retention.

## Why this document does not claim to certify current `main`

A repository commit cannot contain the future workflow-run ID/digest produced only after that same commit exists without creating another commit. Therefore this file intentionally records known immutable evidence snapshots instead of pretending a prose pointer inside `main` can recursively certify itself.

For a current candidate, the authoritative process is:

```text
candidate commit SHA
        ↓
GitHub HELIOS Integrity run for that exact SHA
        ↓
job/step conclusions
        ↓
buyer-integrity artifact + digest
        ↓
externally retained closing record
```

Every later code/documentation snapshot must be re-run. A previous green commit never certifies a later commit.

## Current workflow hardening target

The active workflow is intended to run:

- syntax/public checks;
- complete configured invariant suite;
- high-confidence secret scan;
- declared dependency SBOM;
- **strict** buyer due-diligence preflight;
- strict clean-tree closing manifest;
- buyer-integrity artifact upload.

Repository content does not itself enforce GitHub branch protection. Host-level branch protection/ruleset and signed closing attestation remain separate closing gates.

## What the strict closing manifest proves

`tools/build-closing-manifest.mjs --strict` refuses a dirty working tree and records:

- exact Git commit SHA;
- exact Git tree SHA;
- tracked-file list;
- byte size of each tracked file;
- SHA-256 of each tracked file;
- SHA-256 of the canonical manifest payload.

It proves snapshot identity/integrity. It does not prove copyright title, worldwide non-infringement, security certification, production readiness, regulatory approval, provider availability, profitability, datacenter savings or patent/trademark rights.

## Declared dependency SBOM boundary

The CI-generated CycloneDX-formatted SBOM reflects dependencies declared in `package.json`. HELIOS currently declares no npm runtime/development dependencies.

This is useful reproducible evidence but is not represented as an independent complete software-composition analysis. Closing review must still check vendored, undeclared, generated, browser-loaded, operating-system and other external components as applicable.

## Closing rule

Every definitive sale/licence closing candidate gets a **new exact-snapshot run**.

```text
FREEZE CANDIDATE
→ HOST-LEVEL CHANGE CONTROL / BRANCH FREEZE
→ CI INTEGRITY PASS ON EXACT SHA
→ INDEPENDENT SBOM / LICENCE / SECURITY REVIEW AS AGREED
→ STRICT MANIFEST + ARTIFACT DIGEST PRESERVED EXTERNALLY
→ SIGNED TAG / RELEASE OR EQUIVALENT ATTESTATION
→ BUYER VERIFIES HASHES
→ OBJECTIVE ACCEPTANCE
```

HELIOS remains an active capability prototype. Production validation is a separate gate.
