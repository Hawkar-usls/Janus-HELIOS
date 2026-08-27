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
- `.janus/HELIOS_STELLAR_NAVIGATOR.json`
- `docs/DESKTOP_FABRIC.md`
- `docs/ADAPTIVE_POLICY_PLANE.md`
- `docs/DUAL_STREAM_SAFETY_GUARD.md`
- `docs/DUAL_STREAM_DIRECTOR.md`
- `docs/STELLAR_NAVIGATOR.md`
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
- `.janus/HELIOS_BUYER_CRITIC_AUDIT_2026-08-27.json`

The Buyer Critic Audit records repository-level criticisms that were actually found/fixed and separately lists risks that still require host settings, a real provider/pilot, independent review or transaction documents. It must not be interpreted as a self-issued production certification.

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
- `helios-stellar-nav.js`
- `tests/desktop-fabric-invariants.test.mjs`
- `tests/desktop-agent-invariants.test.mjs`
- `tests/adaptive-policy-invariants.test.mjs`
- `tests/dual-stream-safety-invariants.test.mjs`
- `tests/dual-stream-director-invariants.test.mjs`
- `tests/stellar-navigator-invariants.test.mjs`
- `tests/due-diligence-invariants.test.mjs`
- `package.json`
- `tests/`

`HELIOS Integrity` is expected to run the buyer preflight in **strict** mode. A warning in strict preflight is a failed integrity candidate, not a papered-over PASS.

## G. Historical and conceptual provenance material

The Git history contains an earlier Buzz-derived execution-plane implementation. The active closing snapshot does not treat that historical module as the HELIOS execution plane. Its lineage/licence boundary is disclosed in `legal/BACKGROUND_IP_AND_PROVENANCE.md` rather than hidden.

The current active compute implementation is the HELIOS-native desktop pair:

```text
src/helios-desktop-fabric.js
src/helios-desktop-agent.js
```

The buyer preflight fails if the removed Buzz-derived dispatcher, contract, documentation or invariant test is silently reintroduced as an active path.

The Adaptive Policy Plane is HELIOS-native source. Its generalized design is conceptually inspired by resource/learning discipline visible in separate JANUS Zim firmware, but it does not import or runtime-depend on Zim or `janus-distributed-ai-swarm`. That relationship is disclosed in `.janus/HELIOS_ADAPTIVE_POLICY.json` and `legal/BACKGROUND_IP_AND_PROVENANCE.md`.

The Dual-Stream Safety Guard is a HELIOS-native engineering adaptation of a mathematical/control pattern recorded in the seller-controlled `janus-meta-registry`. HELIOS does not import the registry artifact as executable code and does not use its emotional-state variables for player profiling. The active mapping is `change/optimization pressure ↔ safety reserve`, with player-vulnerability inputs forbidden.

The presentation-only Dual-Stream Director maps the same conceptual pattern into `DIVERGENCE ↔ RESOLUTION` choreography. It is not an emotional classifier and cannot change RNG, RTP, stake, paytable, bonus probability, compute routing or provider selection. Director v1.1 owns only a dedicated wrapper transform; feature loading is explicit in `index.html`, not hidden in the mobile layer.

The Stellar Navigator is an independent HELIOS presentation implementation. `wisnc/stellar-map` was reviewed only as a design reference. Because no root `LICENSE` file was found during the 2026-08-27 review, no source code, star catalogue, constellation/Messier data, screenshots or assets from that repository are incorporated. The HELIOS sky uses manually curated rounded bright-star facts plus a deterministic synthetic deep field and is explicitly not marketed as a scientific planetarium.

## H. Machine-generated buyer evidence

The integrity workflow produces for each exact successful commit:

- `artifacts/closing-manifest.json` — exact commit/tree/tracked-file SHA-256 identity record;
- `artifacts/declared-sbom.cdx.json` — CycloneDX-formatted inventory of dependencies declared in `package.json`.

The declared SBOM is intentionally labelled **DECLARED_PACKAGE_JSON_DEPENDENCIES_ONLY**. It is not an independent software-composition scan and does not replace closing-time inspection for vendored, undeclared, generated, browser-loaded, operating-system or other external components.

## Current evidence semantics

`docs/CI_AND_RELEASE_EVIDENCE.md` records immutable known-good evidence snapshots. It intentionally does not claim that a prose file inside `main` can recursively certify the future CI run created by its own commit.

For a candidate to count, inspect the GitHub Actions run and buyer-integrity artifact for that **exact SHA**. Every later closing candidate must be re-run, independently reviewed/scanned as agreed and re-manifested.

## I. Known host-level controls not enforceable by repository content

At the 2026-08-27 buyer audit:

- `main` was not branch-protected;
- repository rulesets were absent;
- required status checks were not enforced by GitHub settings;
- current commits were not represented as cryptographically signed.

These are explicit closing gates, not hidden repository PASSes. The target is branch protection/ruleset or equivalent freeze requiring HELIOS Integrity plus signed release/tag or equivalent attestation where agreed.

## Missing closing artifacts — expected only during a real transaction

The following should **not** be fabricated in advance:

- signed NDA/LOI/APA/IP Assignment;
- seller identity/authority documents;
- completed and signed Seller Disclosure Schedule;
- independent/automated SBOM and licence scan for final snapshot;
- independent security/privacy report if required;
- exact-closing-commit integrity/test evidence;
- closing manifest/artifact digest preserved outside temporary CI retention;
- signed release/tag or equivalent cryptographic attestation if agreed;
- trademark/patent clearance reports if applicable;
- escrow confirmation;
- buyer acceptance certificate;
- actual provider-contract assignment/consents if such contracts are included.

The absence of those pre-transaction artifacts is not hidden; they are explicit closing gates.
