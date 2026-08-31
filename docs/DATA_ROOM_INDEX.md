# JANUS HELIOS — Buyer Data Room Index

This is the recommended starting point for a serious licensing/acquisition diligence review.

## 1. Current truth / claim maturity

Start here before reading marketing or historical material:

- `README.md`
- `PROJECT_STATUS.json`
- `.janus/HELIOS_ARCHITECTURE.json`
- `docs/CLAIM_TO_IMPLEMENTATION_AUDIT_2026-08-31.md`
- `.janus/HELIOS_CLAIM_IMPLEMENTATION_AUDIT_2026-08-31.json`

HELIOS deliberately distinguishes:

```text
ENFORCED
IMPLEMENTED_CORE
DEMO_PREVIEW
EXTERNAL_GATE
```

A file existing in the repository is not treated as evidence of end-to-end production enforcement.

## 2. Active compute / device-sovereignty architecture

- `src/helios-router.js`
- `src/helios-desktop-fabric.js`
- `src/helios-desktop-agent.js`
- `src/helios-hardware-guardian.js`
- `src/helios-trust-fabric.js`
- `src/helios-smart-compute-node.js`
- `.janus/HELIOS_DESKTOP_FABRIC.json`
- `.janus/HELIOS_HARDWARE_GUARDIAN.json`
- `.janus/HELIOS_TRUST_FABRIC.json`
- `.janus/HELIOS_SMART_COMPUTE_NODE.json`
- `docs/DESKTOP_FABRIC.md`
- `docs/HARDWARE_GUARDIAN.md`

Important current distinction:

- Hardware Guardian and Host-first QoS are enforced in Desktop Agent.
- Provider Authority Epoch, Receipt Provenance, True Work Accounting and Device Health Passport exist as first-party core primitives.
- Provider Authority Epoch is **not yet mandatory on every Router/Fabric dispatch**.
- Real provider signing/settlement and persistent real sensor provenance remain production gates.

## 3. Edge / JANUS I0 research architecture

- `src/helios-edge-hash-lab.js`
- `src/helios-edge-constellation.js`
- `src/helios-evidence-independence.js`
- `.janus/HELIOS_EDGE_HASH_LAB.json`
- `.janus/HELIOS_EDGE_CONSTELLATION.json`
- `.janus/HELIOS_EVIDENCE_INDEPENDENCE_ENGINE.json`
- `docs/EDGE_HASH_LAB.md`
- `docs/EDGE_CONSTELLATION.md`

Commercial/IP boundary:

- NerdMinerV2 is an external MIT compatibility target; its source is not silently vendored as HELIOS.
- JANUS I0 remains separately scoped Background IP unless expressly included.
- Stock NerdMiner firmware does not automatically obtain I0 scheduler authority.

## 4. Bounded policy / presentation architecture

- `src/helios-adaptive-policy.js`
- `src/helios-dual-stream-guard.js`
- `helios-dual-stream-director.js`
- `helios-stellar-nav.js`
- `.janus/HELIOS_ADAPTIVE_POLICY.json`
- `.janus/HELIOS_DUAL_STREAM_SAFETY_GUARD.json`
- `.janus/HELIOS_DUAL_STREAM_DIRECTOR.json`
- `.janus/HELIOS_STELLAR_NAVIGATOR.json`
- `docs/ADAPTIVE_POLICY_PLANE.md`
- `docs/DUAL_STREAM_SAFETY_GUARD.md`
- `docs/DUAL_STREAM_DIRECTOR.md`
- `docs/STELLAR_NAVIGATOR.md`

`index.html` is the authoritative public feature loader. Receipt Viewer and mobile presentation layers do not dynamically load unrelated feature modules.

## 5. Commercial / master-licensee materials

- `PARTNERSHIP_BRIEF.md`
- `docs/MARKET_AND_LICENSE_POSITION_2026-08-31.md`
- `.janus/HELIOS_MARKET_AND_LICENSE_POSITION_2026-08-31.json`
- `docs/COMMERCIAL_THESIS.md`
- `docs/COMPETITIVE_MOAT.md`
- `docs/MASTER_LICENSEE_OUTREACH_TEMPLATE.md`
- `legal/COMMERCIAL_LICENSE_PRINCIPLES.md`
- `BUYER_HANDOFF_SPEC.json`

Indicative commercial figures in these materials are negotiation anchors, not valuations or binding offers.

## 6. IP / provenance / licences

- `LICENSE.md`
- `IP_NOTICE.md`
- `THIRD_PARTY_NOTICES.md`
- `CONTRIBUTING.md`
- `legal/BACKGROUND_IP_AND_PROVENANCE.md`
- `legal/PURCHASED_ASSETS_SCHEDULE.md`
- `legal/EXCLUDED_ASSETS_SCHEDULE.md`
- `legal/BRAND_AND_MARKS_SCHEDULE.md`
- `legal/TRANSACTION_GUARDRAILS.md`
- `.janus/HELIOS_DUE_DILIGENCE.json`

The public repository is source-available for evaluation, not open-source as a whole. Third-party/open-source components retain their own original rights.

## 7. Security / privacy / boundaries

- `SECURITY.md`
- `docs/THREAT_MODEL.md`
- `docs/PRIVACY_DATA_FLOW.md`
- `docs/GAME_MATH_AND_REGULATORY_BOUNDARY.md`
- `docs/PUBLIC_PRIVATE_PRODUCTION_BOUNDARY.md`

Current device-policy invariant:

```text
HARDWARE-AWARE
AND
HUMAN-BLIND
```

Screen, keyboard, mouse, microphone, camera, clipboard, browser history, process/game names and active-window content are not required hardware-care inputs.

## 8. Tests and CI

- `.github/workflows/helios-integrity.yml`
- `package.json`
- `tests/`
- `tests/claim-implementation-audit-invariants.test.mjs`
- `tests/desktop-agent-invariants.test.mjs`
- `tests/hardware-guardian-invariants.test.mjs`
- `tests/trust-fabric-invariants.test.mjs`
- `tests/smart-compute-node-invariants.test.mjs`
- `tests/edge-hash-lab-invariants.test.mjs`
- `tests/edge-constellation-invariants.test.mjs`
- `tests/evidence-independence-invariants.test.mjs`
- `tests/due-diligence-invariants.test.mjs`

`HELIOS Integrity` runs:

1. syntax/public-surface checks;
2. invariant suite;
3. high-confidence secret scan;
4. declared dependency SBOM generation;
5. strict buyer due-diligence preflight;
6. strict closing-manifest candidate generation;
7. buyer-integrity artifact upload.

A green run applies to the **exact tested SHA only**.

## 9. Closing / acceptance

- `docs/RELEASE_AND_HASHING.md`
- `docs/CI_AND_RELEASE_EVIDENCE.md`
- `docs/CHANGE_CONTROL_AND_CLOSING_FREEZE.md`
- `legal/ACCEPTANCE_AND_HANDOVER.md`
- `legal/CLOSING_CHECKLIST.md`
- `legal/SELLER_DISCLOSURE_SCHEDULE_TEMPLATE.md`
- `legal/TRANSITION_SUPPORT_SCOPE.md`

## 10. Known external closing gates

Repository content alone cannot establish:

- GitHub branch protection/rulesets;
- cryptographic commit/release signing;
- independent security/privacy/legal reports;
- real provider contracts and consent assignments;
- real sensor truth;
- authoritative provider settlement;
- field economics;
- production regulatory approval.

Those items should not be fabricated in advance. They are explicit transaction/pilot gates.

## Historical execution-plane boundary

Git history contains an earlier Buzz-derived dispatcher implementation. It is not the active HELIOS execution plane. Current execution uses the HELIOS-native Desktop Fabric / Desktop Agent pair, while historical provenance remains disclosed rather than rewritten.

## Machine-generated buyer evidence

Successful exact-commit Integrity runs generate buyer evidence such as:

- `artifacts/closing-manifest.json` — tracked-file and exact commit/tree identity record;
- `artifacts/declared-sbom.cdx.json` — declared `package.json` dependency inventory.

The declared SBOM is not an independent full software-composition analysis and must not be represented as one.
