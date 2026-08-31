# HELIOS Claim → Implementation Audit — 2026-08-31

## Purpose

This audit answers a simple buyer-facing question:

> **When HELIOS says it can do something, where does that claim actually live?**

A file existing in the repository is not enough. Every material HELIOS claim is classified as one of four states:

| State | Meaning |
|---|---|
| **ENFORCED** | The active execution path applies the invariant before effect. |
| **IMPLEMENTED_CORE** | Executable first-party core exists and is tested, but a real provider/device/authority integration is still required. |
| **DEMO_PREVIEW** | The public UI demonstrates the interaction or policy but intentionally has no real external authority. |
| **EXTERNAL_GATE** | The truth can only be established with real sensors, providers, signatures, devices, legal/regulatory review, or a field pilot. |

Machine-readable record: [`.janus/HELIOS_CLAIM_IMPLEMENTATION_AUDIT_2026-08-31.json`](../.janus/HELIOS_CLAIM_IMPLEMENTATION_AUDIT_2026-08-31.json).

## Executive result

The 2026-08-31 pass found several cases where HELIOS implementation had evolved faster than canonical status/docs, plus two places where the product story was stronger than the current end-to-end wiring.

The audit therefore **did not upgrade every claim to PASS**. It tightened the code, removed misleading presentation, refreshed the canonical architecture, and explicitly left production-only claims behind external gates.

### Corrections made in this pass

1. The old decorative public `87% STABLE` health indicator was removed. A static page with no live sensor cannot claim a hardware-health percentage.
2. `index.html` is now the explicit authoritative feature loader. Receipt Viewer no longer loads unrelated features dynamically.
3. Buyer Lab resource policy no longer says `PAUSE ON INTERACTION` / `IDLE ONLY`. Hardware protection is expressed as host reserve/headroom/pressure shedding and remains **hardware-aware / human-blind**.
4. Host-first Quiet Canary QoS is now part of the Desktop Agent execution path after Hardware Guardian. It may only contract or block external compute.
5. Smart Compute Node is no longer structurally limited to I0/hash evidence. Generic AI inference, rendering, science, transcoding, storage/network, operator batch, and custom work use workload-appropriate accounting; I0/hash keeps its checked-work evidence path.
6. `PROJECT_STATUS.json`, canonical architecture and Desktop Fabric contract now match the current modules and versions.

## Claim matrix

### Game / compute constitutional separation — **ENFORCED**

Implemented in Router, Desktop Fabric and Desktop Agent. Game-event coupling and game-effect fields are rejected by the compute path.

```text
COMPUTE → RNG                  FORBIDDEN
COMPUTE → RTP                  FORBIDDEN
COMPUTE → BONUS ODDS           FORBIDDEN
COMPUTE → PERSONAL JACKPOT     FORBIDDEN
HARDWARE PRESSURE → GAME MATH  FORBIDDEN
```

### Explicit consent and local resource sovereignty — **ENFORCED**

The public interaction requires explicit opt-in and supports immediate revoke. The Desktop Agent independently rechecks local consent and rejects a controller budget that exceeds local policy.

### Hardware Guardian — **ENFORCED**

`src/helios-hardware-guardian.js` evaluates thermal, power, battery, memory/VRAM and host-load evidence. It may tighten or block the compute budget and cannot make the requested budget larger.

Missing thermal evidence is not painted green. Depending on local policy it enters limited `UNKNOWN` operation or blocks.

### Hardware-aware / human-blind policy — **ENFORCED**

The hardware path rejects content-surveillance fields such as screen, keyboard, mouse, microphone, camera, clipboard, browser history, process/game name and active-window content.

Host protection therefore does **not** need to infer what the person is doing.

### Host-first QoS — **ENFORCED**

The active Desktop Agent now applies:

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

Each stage can only preserve or reduce the external-compute budget. Under high local CPU/GPU/memory pressure, external work yields first.

### Provider default-deny + Authority Epoch — **IMPLEMENTED_CORE**

`ProviderAuthorityEpoch` implements registration ≠ admission, scoped non-transferable leases, dispatch budgets, revocation and stale-epoch rejection.

However, the current generic Router/Fabric dispatch path does **not yet require this authority object on every dispatch**. Therefore the correct claim is implemented core, not end-to-end production enforcement.

**Gate:** wire authority-epoch validation into every production Router/Fabric dispatch.

### Receipt Provenance Envelope — **IMPLEMENTED_CORE**

HELIOS can construct an envelope binding provider, lease/job identity, manifest/adapter/executor/verifier/Guardian digests and external verification/settlement state.

**Gate:** real provider signing, anti-replay and authoritative settlement.

### True Work Accounting — **IMPLEMENTED_CORE**

Assigned, admitted, executed, retried, rejected/stale, verified and failed work are distinct counters. Device time and measured watt-hours are separate evidence categories.

**Gate:** durable production accounting and authoritative measured-energy sources.

### Device Health Passport — **IMPLEMENTED_CORE**

The first-party builder records sealed observation windows, sensor provenance/freshness, Guardian state, compute/verified-work time, measured Wh when available, blocks/throttles/cooldowns/revokes, and receipt references.

It preserves:

```text
INTEGRITY ≠ SENSOR TRUTH
UNKNOWN   ≠ ZERO
```

**Gate:** persistent real sensor windows and vendor/OS telemetry provenance.

### Smart Compute Node — **IMPLEMENTED_CORE**

The unified node record now combines:

```text
WORK EVIDENCE
+ DEVICE STATE
+ GUARDIAN DECISION
+ HOST-FIRST EXECUTION BUDGET
+ DEVICE HEALTH PASSPORT
+ PROVENANCE
+ REPLICATION LINEAGE
```

Version 1.1 supports generic work-evidence families (`AI_INFERENCE`, `RENDER`, `SCIENCE`, `TRANSCODE`, `STORAGE_NETWORK`, `OPERATOR_BATCH`, etc.) using workload-appropriate units, while Edge Hash / JANUS I0 retains checked-work normalization.

**Gate:** real provider/verifier semantics for each production workload family.

### NerdMinerV2 × JANUS I0 Edge Hash Lab — **IMPLEMENTED_CORE**

NerdMinerV2 remains an external MIT compatibility target; no firmware source is silently absorbed into HELIOS. Stock firmware does not acquire JANUS I0 authority. I0 testing requires a compatible bridge/firmware and keeps a controlled `I0 ↔ randomized mirror` experiment normalized by checked work.

**Gate:** physical bridge/firmware and real Stratum experiment.

### Edge Constellation — **IMPLEMENTED_CORE**

Cross-node research uses local paired experiments and does not equate hardware power with evidence weight.

```text
NODE POWER ≠ EVIDENCE WEIGHT
```

**Gate:** real heterogeneous ESP32/CPU/GPU/ASIC fleet.

### Evidence Independence Engine — **IMPLEMENTED_CORE**

Replication lineage uses physical-device, execution-lineage, authority, site/network, observation-epoch and job-stream roots. `UNKNOWN` is not treated as independent. Cross-node strong sets use pairwise strong-independence graph structure.

**Gate:** real attested lineage roots.

### Verifier Assurance Monotonicity — **IMPLEMENTED_CORE**

A successor verifier cannot silently forget a prior mandatory rejection without an explicit replayable semantics-change record.

**Gate:** make this checker mandatory in production verifier release/deployment.

### Public Buyer Lab / Trust surfaces — **DEMO_PREVIEW**

The public page exposes policy previews, Trust Fabric, Smart Compute Node, Edge Hash/Constellation and Evidence Independence surfaces. Those cards are explanatory/reference UI only.

The public page intentionally has:

```text
LIVE MINING                NO
LIVE GENERIC PROVIDER JOB  NO
LIVE TEMPERATURE           NO
LIVE WATTS                 NO
FAKE HEALTH %              NO
AUTHORITATIVE SETTLEMENT   NO
```

### Market uniqueness — **EXTERNAL_GATE / MARKET-REVIEWED CLAIM**

HELIOS does not claim to have invented game+compute, volunteer computing, GPU marketplaces, hardware monitoring or public-benefit computing.

The maintained market statement remains:

> As of the 2026-08-31 public market review, predecessors were identified for individual components, but no public commercial product was identified exposing the same complete maintained HELIOS architecture as one licensable B2B control plane.

That is a market-review statement, **not** a patentability or freedom-to-operate opinion.

### Production readiness — **EXTERNAL_GATE**

HELIOS remains a reference/evaluation prototype. Production truth requires, at minimum, real provider adapters and manifests, authenticated agent transport, real vendor telemetry, signed/anti-replay receipts, workload sandbox/egress policy, independent security/privacy/legal/game-math review and a partner-operated non-money pilot.

## Commercial consequence

This audit strengthens the intended licensing proposition because it separates three things a serious partner should not confuse:

```text
WHAT HELIOS ALREADY ENFORCES
WHAT HELIOS ALREADY IMPLEMENTS AS CORE
WHAT ONLY A REAL PARTNER PILOT CAN PROVE
```

The preferred commercial relationship remains low-friction access with strong Core-IP protection and success-aligned economics. A partner should be able to evaluate the architecture without being sold fictional production evidence.

## Audit law

> **No buyer-facing HELIOS claim may be promoted from `IMPLEMENTED_CORE` or `EXTERNAL_GATE` to `ENFORCED` without execution-path evidence and a green exact-commit integrity run.**
