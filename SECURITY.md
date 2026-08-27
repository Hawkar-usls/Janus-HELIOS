# JANUS HELIOS — Security Policy

JANUS HELIOS is currently a public capability/evaluation prototype. This policy keeps security findings, buyer diligence and future production hardening separate from ordinary feature discussion.

## Supported public surface

The current repository and GitHub Pages build are evaluation surfaces. They do not contain production provider credentials, authoritative settlement infrastructure, real-money certification or a validated production datacenter fleet.

Security review should distinguish:

- public browser/game/presentation behavior;
- repository source/build integrity;
- HELIOS Desktop Fabric coordination logic;
- HELIOS Desktop Agent local execution boundary;
- Adaptive Policy / Dual-Stream Safety policy planes;
- provider adapter / result / receipt verification design;
- future authenticated production gateway/transport;
- regulated game deployment, if any.

## Reporting a vulnerability

Do not publish exploitable details, credentials, private partner information or a working exploit in a public issue.

Use GitHub private vulnerability reporting / Security Advisories if available, or a private channel established with the project owner during evaluation/diligence.

A useful report includes the exact commit SHA, affected component, reproduction steps, impact, whether it affects only the public demo or a proposed production path, and suggested mitigation if known.

No bug bounty/payment is promised unless separately agreed in writing.

## Security invariants

The following are architectural requirements:

- browser/provider secrets are forbidden;
- unverified results/receipts have zero authoritative ledger value;
- compute is off by default;
- compute requires explicit revocable consent;
- game RNG/RTP/payout authority is independent from compute routing;
- Desktop Agent workloads must use approved typed/exact artifact bindings rather than a generic remote shell;
- stale/expired fenced leases cannot regain authority;
- the controller may tighten but may not widen the local user's resource policy;
- Adaptive Policy may learn only inside predeclared safe actions and may not mutate artifact identity, verifier/signature truth or game math;
- Dual-Stream Safety may veto/tighten change pressure but may not fabricate missing safety evidence or widen user policy;
- Dual-Stream Director is presentation-only and may not consume player loss/vulnerability/wager inputs or change RNG/RTP/bet/bonus/compute routing;
- production provider identity, signatures, anti-replay and receipt verification must be authoritative outside the untrusted browser;
- public demo state must not be presented as production settlement truth.

## Active execution boundary

The active compute-plane implementation is:

```text
src/helios-desktop-fabric.js
        ↓ fenced assignment
src/helios-desktop-agent.js
        ↓ workload-specific result
provider/result verifier
        ↓
authoritative receipt gate
```

The removed historical `helios-swarm-dispatcher.js` is not an active production/security control and must not be treated as one.

## Production gates

Before production, complete independent review appropriate to the deployment, including as applicable:

- threat model;
- dependency/SBOM and licence scan;
- secret scan;
- authentication/authorization and device enrollment;
- transport encryption/key management;
- workload artifact/signature policy;
- sandboxing/isolation/egress controls;
- durable lease/replay state;
- receipt signature and anti-replay;
- privacy/data-flow assessment;
- resource/thermal abuse testing and trusted telemetry;
- Adaptive Policy safe-arm review;
- failure injection for safety/rollback evidence;
- frontend/game-math review of presentation-only Director boundaries;
- incident response/logging;
- regulated gaming/payments/financial/crypto review where relevant.

## Repository / supply-chain posture

The repository's integrity workflow uses pinned GitHub Action commit SHAs, read-only contents permission and checkout with persisted credentials disabled. The workflow performs syntax checks, invariants, a high-confidence secret scan, declared dependency SBOM generation, **strict** buyer due-diligence preflight and strict closing-manifest generation.

This is not the same as host-level change control. At the 2026-08-27 audit, `main` was not protected, no repository ruleset was present, and required checks were not enforced by GitHub settings. A real closing should enable branch protection/ruleset or equivalent freeze/change control and use a signed release/tag or equivalent cryptographic attestation if agreed.

## Acquisition / buyer diligence

A buyer must not treat this file or a green CI run as security certification. Representations must refer to an exact closing commit and to tests/reviews actually performed on that snapshot.

Known open production/closing gates remain disclosed in `PROJECT_STATUS.json`, `.janus/HELIOS_DUE_DILIGENCE.json` and `docs/DATA_ROOM_INDEX.md`.

## Secrets and personal accounts

Never request or transfer the seller's personal GitHub/email password, MFA secrets, recovery codes, wallet seed phrases or unrelated account credentials as product handover.

Production systems should be recreated under buyer-controlled accounts and buyer-generated secrets. Seller-side secrets should be revoked when no longer needed.
