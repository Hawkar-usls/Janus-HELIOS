# JANUS HELIOS — Buyer Data Room Index

This index is the recommended starting point for a serious acquisition/licensing diligence review.

## A. Product / architecture

- `README.md`
- `PROJECT_STATUS.json`
- `.janus/HELIOS_ARCHITECTURE.json`
- `.janus/HELIOS_ECOSYSTEM.json`
- `.janus/HELIOS_SWARM_DISPATCHER.json`
- `docs/SWARM_DISPATCHER.md`
- `docs/COMMERCIAL_THESIS.md`

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
- `legal/ACCEPTANCE_AND_HANDOVER.md`
- `legal/CLOSING_CHECKLIST.md`
- `legal/SELLER_DISCLOSURE_SCHEDULE_TEMPLATE.md`
- `legal/TRANSITION_SUPPORT_SCOPE.md`

## F. Security / source / tests

- `SECURITY.md`
- `.github/workflows/helios-integrity.yml`
- `tools/build-closing-manifest.mjs`
- `tools/due-diligence-preflight.mjs`
- `tools/secret-scan.mjs`
- `src/helios-router.js`
- `src/helios-swarm-dispatcher.js`
- `package.json`
- `tests/`

## Current reproducible evidence

`docs/CI_AND_RELEASE_EVIDENCE.md` records an exact GitHub Actions integrity run and closing-manifest artifact for a specific immutable commit. That evidence applies only to the commit named there. Every later closing candidate must be re-run and re-manifested.

## Missing closing artifacts — expected only during a real transaction

The following should **not** be fabricated in advance. They are produced for the exact transaction/closing snapshot:

- signed NDA/LOI/APA/IP Assignment;
- seller identity/authority documents;
- completed and signed Seller Disclosure Schedule;
- independent/automated SBOM and licence scan report for the final snapshot;
- independent security report if required by the transaction;
- full integrity/test execution evidence on the exact final closing commit;
- closing commit/tree/file hash manifest preserved outside temporary CI retention;
- signed release/tag or equivalent cryptographic attestation if agreed;
- trademark/patent clearance reports if applicable;
- escrow confirmation;
- buyer acceptance certificate;
- actual assigned-provider contract consents if any contracts are included.

The absence of those pre-transaction artifacts is not hidden; they are explicit closing gates.
