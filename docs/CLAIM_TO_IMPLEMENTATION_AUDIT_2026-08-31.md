# HELIOS Claim → Implementation Audit — 2026-08-31

## Purpose

This audit answers a buyer-facing question:

> **When HELIOS says it can do something, where does that claim actually live?**

A file existing in the repository is not enough. Every material claim is classified as one of four states:

| State | Meaning |
|---|---|
| **ENFORCED** | The active execution path applies the invariant before effect. |
| **IMPLEMENTED_CORE** | Executable first-party core exists and is tested, but a real provider/device/authority integration is still required. |
| **DEMO_PREVIEW** | The public UI demonstrates the interaction or policy but intentionally has no real external authority. |
| **EXTERNAL_GATE** | Truth requires real sensors, providers, signatures, devices, legal/regulatory review, or a field pilot. |

Machine-readable record: [`.janus/HELIOS_CLAIM_IMPLEMENTATION_AUDIT_2026-08-31.json`](../.janus/HELIOS_CLAIM_IMPLEMENTATION_AUDIT_2026-08-31.json).

## Executive result

The 2026-08-31 pass found implementation/doc drift and places where product language was stronger than end-to-end wiring. The audit tightened code, removed misleading presentation, refreshed canonical architecture and left external claims behind explicit gates.

The Standard Pilot Authority is likewise treated as an implemented-but-disabled licensing gate, not as a live payment service merely because the code exists.

### Corrections made in this pass

1. Removed the decorative public `87% STABLE` hardware-health indicator.
2. Made `index.html` the explicit authoritative feature loader.
3. Replaced interaction/idle observation language with hardware-pressure/headroom logic.
4. Wired Host-first QoS into Desktop Agent after Hardware Guardian.
5. Generalized Smart Compute Node beyond I0/hash to workload-appropriate generic work evidence.
6. Refreshed `PROJECT_STATUS.json` and canonical architecture.
7. Added Standard Pilot Authority fail-closed.
8. Rechecked the owner-side Binance deposit networks; Base was not available for the intended route, so the disabled payment policy was moved from USDC/Base to official Tether USDT on Ethereum Mainnet (ERC20) instead of pretending the old route remained valid.
9. Required a dedicated Ethereum RPC before Pilot Authority can be enabled.

## Claim matrix

### Game / compute constitutional separation — **ENFORCED**

```text
COMPUTE → RNG                  FORBIDDEN
COMPUTE → RTP                  FORBIDDEN
COMPUTE → BONUS ODDS           FORBIDDEN
COMPUTE → PERSONAL JACKPOT     FORBIDDEN
HARDWARE PRESSURE → GAME MATH  FORBIDDEN
```

### Explicit consent and local resource sovereignty — **ENFORCED**

The public interaction requires explicit opt-in and supports immediate revoke. Desktop Agent independently rechecks local consent and rejects controller budgets above local policy.

### Hardware Guardian — **ENFORCED**

Guardian evaluates thermal, power, battery, memory/VRAM and host-load evidence. It may tighten or block compute and cannot widen the requested budget. Missing thermal evidence is not painted green.

### Hardware-aware / human-blind policy — **ENFORCED**

Screen, keyboard, mouse, microphone, camera, clipboard, browser history, process/game name and active-window content are forbidden hardware-policy inputs.

### Host-first QoS — **ENFORCED**

```text
CONTROLLER BUDGET
      ↓
LOCAL USER POLICY
      ↓
HARDWARE GUARDIAN
      ↓
HOST-FIRST QoS
      ↓
FINAL EXECUTOR BUDGET
```

Each stage can only preserve or reduce external compute.

### Provider default-deny + Authority Epoch — **IMPLEMENTED_CORE**

Core exists, but the generic Router/Fabric path does not yet require an authority epoch on every production dispatch.

### Receipt Provenance Envelope — **IMPLEMENTED_CORE**

Core can bind provider, lease/job identity, manifests/adapters/executor/verifier/Guardian digests and verification/settlement state. Real signatures, anti-replay and authoritative settlement remain external gates.

### True Work Accounting — **IMPLEMENTED_CORE**

Assigned, admitted, executed, retried, stale/rejected, verified and failed work are distinct counters. Durable production accounting remains pending.

### Device Health Passport — **IMPLEMENTED_CORE**

The builder records sealed observation windows, provenance/freshness, Guardian state, compute time, verified work, measured Wh where available and receipt references. `INTEGRITY ≠ SENSOR TRUTH`; `UNKNOWN ≠ ZERO`.

### Smart Compute Node — **IMPLEMENTED_CORE**

```text
WORK EVIDENCE
+ DEVICE STATE
+ GUARDIAN DECISION
+ HOST-FIRST EXECUTION BUDGET
+ DEVICE HEALTH PASSPORT
+ PROVENANCE
+ REPLICATION LINEAGE
```

Generic work families include AI inference, render, science, transcode, storage/network, operator batch and custom work. Real provider/verifier semantics remain workload-specific external gates.

### NerdMinerV2 × JANUS I0 Edge Hash Lab — **IMPLEMENTED_CORE**

NerdMinerV2 remains an external MIT compatibility target; stock firmware has no JANUS I0 authority. Physical I0 requires a compatible bridge/firmware and controlled experiment.

### Edge Constellation — **IMPLEMENTED_CORE**

`NODE POWER ≠ EVIDENCE WEIGHT`. Real heterogeneous fleet remains pending.

### Evidence Independence Engine — **IMPLEMENTED_CORE**

Replication lineage uses physical-device, execution-lineage, authority, site/network, observation-epoch and job-stream roots. `UNKNOWN` is not independent. Real attested roots remain pending.

### Verifier Assurance Monotonicity — **IMPLEMENTED_CORE**

A successor verifier cannot silently forget a prior mandatory rejection without an explicit semantics-change record. Production release-gate wiring remains pending.

### Standard Pilot Authority — **IMPLEMENTED_CORE / ARMED-DISABLED**

HELIOS has a first-party standard-pilot licensing gate:

```text
NAMED REQUEST
+ FROZEN TERMS ACCEPTANCE
+ AUTHORITY / SCOPE CERTIFICATIONS
+ EXACT INVOICE
+ EXACT ON-CHAIN PAYMENT
+ CONFIRMATION / REUSE GATES
→ PILOT_ACTIVE
```

Core law:

```text
PAYMENT IS EVIDENCE ≠ PAYMENT IS AUTHORITY
```

The standard automated grant is a 90-day controlled non-money pilot. It is non-exclusive, non-transferable and non-sublicensable and does not transfer HELIOS Core or automatically create production/commercial rights.

The currently frozen payment route is:

```text
Ethereum Mainnet (ERC20)
chain_id = 1
asset = USDT / USD₮
contract = 0xdAC17F958D2ee523a2206206994597C13D831ec7
standard anchor = 10,000 USDT
```

The payment watcher is read-only and cannot move funds. Token symbol alone is not accepted; chain ID, token contract, receiving address, exact raw amount, successful receipt and confirmation threshold must match.

Current status is intentionally **disabled** because the owner receiving address is not yet configured and a dedicated Ethereum RPC has not yet been configured for the workflow.

**Gate:** recheck the current Binance `USDT → ETH / Ethereum (ERC20)` address, confirm no memo/tag is required, configure the exact public receiving address, configure `HELIOS_PILOT_RPC_URL`, enable policy, and obtain a green HELIOS Integrity run for that exact activating commit. Until then, no invoice or grant may issue.

The automated path is not KYC, sanctions-screening, tax or gambling-regulatory authority and never authorizes real-money deployment.

### Public Buyer Lab / Trust surfaces — **DEMO_PREVIEW**

The public page exposes explanatory policy/trust surfaces only and intentionally has no live mining, live generic provider jobs, live temperature/watts, fake health %, or authoritative settlement.

### Market uniqueness — **EXTERNAL_GATE / MARKET-REVIEWED CLAIM**

HELIOS does not claim to have invented game+compute, volunteer computing, GPU marketplaces, hardware monitoring or public-benefit computing.

> As of the 2026-08-31 public market review, predecessors were identified for individual components, but no public commercial product was identified exposing the same complete maintained HELIOS architecture as one licensable B2B control plane.

That is a market-review statement, **not** a patentability or freedom-to-operate opinion.

### Production readiness — **EXTERNAL_GATE**

HELIOS remains a reference/evaluation prototype. Production truth requires real provider adapters/manifests, authenticated agent transport, real vendor telemetry, signed/anti-replay receipts, workload sandbox/egress policy, independent security/privacy/legal/game-math review and a partner-operated non-money pilot.

## Commercial consequence

```text
WHAT HELIOS ALREADY ENFORCES
WHAT HELIOS ALREADY IMPLEMENTS AS CORE
WHAT ONLY A REAL PARTNER PILOT CAN PROVE
WHAT A PARTNER CAN ACQUIRE AS A NARROW STANDARD PILOT RIGHT
```

The last line is deliberately not equivalent to a production/commercial licence.

## Audit law

> **No buyer-facing HELIOS claim may be promoted from `IMPLEMENTED_CORE` or `EXTERNAL_GATE` to `ENFORCED` without execution-path evidence and a green exact-commit integrity run.**

For payment/licensing automation:

> **No HELIOS Pilot Authority may be promoted from `ARMED-DISABLED` to active until the receiving route and RPC are rechecked/configured and the exact activating commit passes HELIOS Integrity.**
