# JANUS HELIOS — CI & Release Evidence

This document records reproducible integrity evidence for specific repository snapshots. It does **not** turn HELIOS into a production-certified product and does not replace transaction counsel, an independent security review, regulated-game certification, a provider pilot, or a closing-time SBOM/licence review.

## Latest recorded integrity snapshot

Repository: `Hawkar-usls/Janus-HELIOS`

Commit:

`19e451d8aae6896bdce417917c13dc844803e2fa`

GitHub Actions workflow: `HELIOS Integrity`

Run ID:

`33074728052`

Execution environment:

- GitHub-hosted Ubuntu runner;
- Node.js 24;
- read-only `contents` workflow permission;
- checkout credentials not persisted;
- third-party GitHub Actions pinned to immutable commit SHAs.

## Result

The run completed successfully for the exact commit above.

The following stages all completed with `success`:

1. syntax / public-surface checks;
2. configured invariant test suite;
3. high-confidence tracked-file secret scan;
4. buyer due-diligence preflight;
5. strict closing-manifest generation;
6. closing-manifest artifact upload.

## Closing manifest artifact

Artifact name:

`helios-closing-manifest-19e451d8aae6896bdce417917c13dc844803e2fa`

Artifact ID:

`9647331064`

Artifact archive digest reported by GitHub:

`sha256:3afd566a52deb051023159b64f29523e1101461b6b4604afc4b31cbc47fb51be`

Artifact retention for this CI run was configured to 30 days. A real transaction should regenerate and separately preserve a closing manifest for the exact final closing commit rather than rely indefinitely on this temporary CI artifact.

## What the strict closing manifest proves

`tools/build-closing-manifest.mjs --strict` refuses a dirty working tree and records:

- exact Git commit SHA;
- exact Git tree SHA;
- tracked-file list;
- byte size for each tracked file;
- SHA-256 of each tracked file;
- SHA-256 of the canonical manifest payload.

It proves snapshot identity/integrity. It does **not** by itself prove:

- ownership of every copyright interest;
- non-infringement worldwide;
- security certification;
- production readiness;
- regulatory approval;
- provider availability;
- profitability;
- datacenter offload;
- patent or trademark rights.

Those are separate diligence questions.

## Audit history

The integrity workflow was intentionally introduced as a hard gate instead of declaring the existing tests green without execution.

Early audit runs exposed stale source-text assertions in `tests/polish-invariants.test.mjs`. Those failures were treated as failures, inspected, and corrected without weakening the underlying product boundaries:

- the Mode Matrix continues to state that game modes do not select compute routes or alter compute rate;
- LAST PAID WIN persistence remains tested, while the assertion was made robust to irrelevant source whitespace.

The first complete all-stage pass was achieved before this evidence record was written. This history is retained because a buyer should be able to distinguish actual execution evidence from a retroactive claim that tests were always green.

## Closing rule

Every definitive sale/licence closing candidate must receive a **new** exact-snapshot run. A previous green commit does not automatically certify a later commit.

Recommended closing sequence:

```text
FREEZE CANDIDATE
→ CI INTEGRITY PASS
→ INDEPENDENT SBOM / LICENSE / SECURITY REVIEW AS AGREED
→ STRICT MANIFEST
→ SIGNED TAG OR EQUIVALENT ATTESTATION
→ BUYER VERIFIES HASHES
→ OBJECTIVE ACCEPTANCE
```

The current public maturity remains an active capability prototype. Production validation remains a separate gate.
