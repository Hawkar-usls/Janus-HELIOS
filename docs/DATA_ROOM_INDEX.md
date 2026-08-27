# JANUS HELIOS — Buyer Data Room Index

This index is the recommended starting point for a serious acquisition/licensing diligence review.

## A. Product / architecture

- `README.md`
- `PROJECT_STATUS.json`
- `.janus/HELIOS_ARCHITECTURE.json`
- `.janus/HELIOS_ECOSYSTEM.json`
- `.janus/HELIOS_DESKTOP_FABRIC.json`
- `.janus/HELIOS_ADAPTIVE_POLICY.json`
- `.janus/HELIOS_DUAL_STREAM_SAFETY_GUARD.json`
- `.janus/HELIOS_DUAL_STREAM_DIRECTOR.json`
- `docs/DESKTOP_FABRIC.md`
- `docs/ADAPTIVE_POLICY_PLANE.md`
- `docs/DUAL_STREAM_SAFETY_GUARD.md`
- `docs/DUAL_STREAM_DIRECTOR.md`
- `docs/COMMERCIAL_THESIS.md`
- `docs/GAME_MATH_AND_REGULATORY_BOUNDARY.md`
- `docs/PUBLIC_PRIVATE_PRODUCTION_BOUNDARY.md`

## B. Commercial / buyer integration

- `PARTNERSHIP_BRIEF.md`
- `BUYER_HANDOFF_SPEC.json`
- `docs/ACQUISITION_READINESS.md`

## C. IP / provenance / licences

- `LICENSE.md`
- `IP_NOTICE.md`
- `THIRD_PARTY_NOTICES.md`
- `CONTRIBUTING.md`
- `legal/BACKGROUND_IP_AND_PROVENANCE.md`
- `.janus/HELIOS_DUE_DILIGENCE.json`

## D. Transaction scope

- `legal/PURCHASED_ASSETS_SCHEDULE.md`
- `legal/EXCLUDED_ASSETS_SCHEDULE.md`
- `legal/BRAND_AND_MARKS_SCHEDULE.md`
- `legal/TRANSACTION_GUARDRAILS.md`

## E. Closing / acceptance

- `docs/RELEASE_AND_HASHING.md`
- `docs/CI_AND_RELEASE_EVIDENCE.md`
- `docs/CHANGE_CONTROL_AND_CLOSING_FREEZE.md`
- `legal/ACCEPTANCE_AND_HANDOVER.md`
- `legal/CLOSING_CHECKLIST.md`
- `legal/SELLER_DISCLOSURE_SCHEDULE_TEMPLATE.md`
- `legal/TRANSITION_SUPPORT_SCOPE.md`

## F. Security / privacy / source / tests

- `SECURITY.md`
- `docs/THREAT_MODEL.md`
- `docs/PRIVACY_DATA_FLOW.md`
- `.github/CODEOWNERS`
- `.github/workflows/helios-integrity.yml`
- `tools/build-closing-manifest.mjs`
- `tools/build-declared-sbom.mjs`
- `tools/due-diligence-preflight.mjs`
- `tools/secret-scan.mjs`
- `src/helios-router.js`
- `src/helios-desktop-fabric.js`
- `src/helios-desktop-agent.js`
- `src/helios-adaptive-policy.js`
- `src/helios-dual-stream-guard.js`
- `helios-dual-stream-director.js`
- `tests/desktop-fabric-invariants.test.mjs`
- `tests/desktop-agent-invariants.test.mjs`
- `tests/adaptive-policy-invariants.test.mjs`
- `tests/dual-stream-safety-invariants.test.mjs`
- `tests/dual-stream-director-invariants.test.mjs`
- `package.json`
- `tests/`

## G. Historical and conceptual provenance material

The Git history contains an earlier Buzz-derived execution-plane implementation. The active closing snapshot does not treat that historical module as the HELIOS execution plane. Its lineage and licence boundary are disclosed in `legal/BACKGROUND_IP_AND_PROVENANCE.md` rather than hidden.

The current active compute implementation is the HELIOS-native desktop pair:

```text
src/helios-desktop-fabric.js
src/helios-desktop-agent.js
```

The buyer preflight fails if the removed Buzz-derived dispatcher, contract, documentation or invariant test is silently reintroduced as an active path.

The optional adaptive policy plane is also HELIOS-native source. Its generalized policy design is conceptually inspired by resource/learning discipline seen in the separate JANUS Zim Geek firmware, but it does not import or runtime-depend on Zim or `janus-distributed-ai-swarm`. That relationship is disclosed in `.janus/HELIOS_ADAPTIVE_POLICY.json` and `legal/BACKGROUND_IP_AND_PROVENANCE.md`.

The Dual-Stream Safety Guard is likewise a HELIOS-native engineering adaptation of a mathematical/control pattern recorded in the seller-controlled `janus-meta-registry`. HELIOS does not import the registry artifact as executable code and does not use its emotional-state variables for player profiling. The active mapping is `change/optimization pressure ↔ safety reserve`, with explicit player-vulnerability inputs forbidden. See `.janus/HELIOS_DUAL_STREAM_SAFETY_GUARD.json` and `docs/DUAL_STREAM_SAFETY_GUARD.md`.

The presentation-only Dual-Stream Director maps the same conceptual dual-stream pattern into `DIVERGENCE ↔ RESOLUTION` choreography. It is not an emotional classifier and cannot change RNG, RTP, stake, paytable, bonus probability, compute routing or provider selection. See `.janus/HELIOS_DUAL_STREAM_DIRECTOR.json` and `docs/DUAL_STREAM_DIRECTOR.md`.

## H. Machine-generated buyer evidence

The integrity workflow produces, for each exact successful commit:

- `artifacts/closing-manifest.json` — exact commit/tree/tracked-file SHA-256 identity record;
- `artifacts/declared-sbom.cdx.json` — CycloneDX-formatted inventory of dependencies declared in `package.json`.

The declared SBOM is intentionally labelled **DECLARED_PACKAGE_JSON_DEPENDENCIES_ONLY**. It is not represented as an independent scanner and does not replace a closing-time automated SBOM/licence scan capable of finding vendored, undeclared, generated, browser-loaded, operating-system or other external components.

## Current reproducible evidence

`docs/CI_AND_RELEASE_EVIDENCE.md` records exact GitHub Actions integrity evidence for a specific immutable commit. That evidence applies only to the commit named there. Every later closing candidate must be re-run, re-scanned as agreed, and re-manifested.

## Missing closing artifacts — expected only during a real transaction

The following should **not** be fabricated in advance. They are produced for the exact transaction/closing snapshot:

- signed NDA/LOI/APA/IP Assignment;
- seller identity/authority documents;
- completed and signed Seller Disclosure Schedule;
- independent/automated SBOM and licence scan report for the final snapshot;
- independent security/privacy report if required by the transaction;
- full integrity/test execution evidence on the exact final closing commit;
- closing commit/tree/file hash manifest preserved outside temporary CI retention;
- signed release/tag or equivalent cryptographic attestation if agreed;
- trademark/patent clearance reports if applicable;
- escrow confirmation;
- buyer acceptance certificate;
- actual assigned-provider contract consents if any contracts are included.

The absence of those pre-transaction artifacts is not hidden; they are explicit closing gates.
