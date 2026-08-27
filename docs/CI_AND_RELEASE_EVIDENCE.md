# JANUS HELIOS — CI & Release Evidence

This document records reproducible integrity evidence for specific repository snapshots. It does **not** turn HELIOS into a production-certified product and does not replace transaction counsel, an independent security review, regulated-game certification, a provider pilot, or a closing-time independent SBOM/licence review.

## Latest recorded integrity snapshot

Repository: `Hawkar-usls/Janus-HELIOS`

Commit:

`ab859cd7207aacfc6b97541aad340c41b3cfe03c`

GitHub Actions workflow: `HELIOS Integrity`

Run ID:

`33080312910`

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
4. declared dependency SBOM generation;
5. buyer due-diligence preflight;
6. strict closing-manifest generation;
7. buyer-integrity artifact upload.

This exact snapshot includes the HELIOS-native desktop compute plane:

- `src/helios-desktop-fabric.js` — Fabric `2.1.0`;
- `src/helios-desktop-agent.js` — Agent `1.1.0`;
- scheduler fairness regression preventing an unavailable resource class from head-of-line blocking runnable work;
- per-slice verified-agent receipt provenance;
- local assignment lease-expiry and resource-capacity rechecks;
- fail-closed controller-budget checks preventing a coordinator from widening the user's local resource policy;
- buyer preflight guards that fail if the removed Buzz-derived active dispatcher paths are silently reintroduced.

## Buyer-integrity artifact

Artifact name:

`helios-buyer-integrity-ab859cd7207aacfc6b97541aad340c41b3cfe03c`

Artifact ID:

`9649711471`

Artifact archive digest reported by GitHub:

`sha256:a410bb7a8f4e0f37103f8e8316cebd122cddb10e1e6a5d078c33fa1b77af9d23`

The artifact is temporary CI evidence. A real transaction should regenerate and separately preserve buyer-integrity evidence for the exact final closing commit rather than rely indefinitely on CI retention.

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

## Declared dependency SBOM boundary

The CI-generated CycloneDX-formatted SBOM reflects dependencies declared by `package.json`. At the recorded snapshot, the package declares no npm runtime/development dependencies.

This is useful reproducible evidence but is **not** represented as an independent complete software-composition analysis. A closing review should still scan for vendored, undeclared, generated, browser-loaded, operating-system and other third-party components as applicable.

## Audit history

The integrity workflow was intentionally introduced as a hard gate instead of declaring tests green without execution.

Early audit runs exposed stale source-text assertions. Later desktop-fabric work exposed another useful class of buyer-level review findings: scheduler fairness and execution-plane provenance. Those findings were corrected with code plus regression tests rather than papered over in documentation.

Historical Buzz/ESP32 lineage remains disclosed in `legal/BACKGROUND_IP_AND_PROVENANCE.md`; the active desktop fabric/agent does not pretend Git history or historical MIT grants disappeared.

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
