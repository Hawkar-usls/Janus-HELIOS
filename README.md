<div align="center">

# JANUS HELIOS
### One Core. Any Destination.

![Status](https://img.shields.io/badge/status-active%20public%20prototype-2ea043)
![Class](https://img.shields.io/badge/class-licensable%20game%20%2B%20compute%20control%20plane-8250df)
![Version](https://img.shields.io/badge/version-1.16.0-d29922)
![Real Money](https://img.shields.io/badge/real--money-disabled-b62324)
![Production](https://img.shields.io/badge/production-not%20established-b62324)

</div>

## Product thesis

**JANUS HELIOS is not intended to be sold as another slot.**

HELIOS is a source-available B2B reference architecture for a licensable interaction/control layer in which a game-shaped or white-label user surface coexists with a separately controlled, explicit-opt-in compute plane.

```text
GAMEPLAY / PRESENTATION
        || strict authority boundary
EXPLICIT RESOURCE CONSENT
        ↓
USER CPU / GPU ENVELOPE
        ↓
HELIOS ROUTER
        ↓
HARDWARE GUARDIAN + HOST-FIRST QoS
        ↓
DESKTOP FABRIC / DESKTOP AGENT / APPROVED EDGE BRIDGE
        ↓
SMART COMPUTE NODE
        ↓
VERIFIED WORK + PROVENANCE
        ↓
AUTHORITATIVE PROVIDER RECEIPT / SETTLEMENT GATE
        ↓
MEASURABLE EXTERNAL VALUE / IMPACT
```

Public evaluation demo: **https://hawkar-usls.github.io/Janus-HELIOS/**

The public page performs no real-money gambling, no production provider work, no live mining and no live hardware-health sensing. Demo receipts and game values are simulated and labeled accordingly.

---

## Claim → implementation truth

HELIOS uses four maturity classes:

| Claim | Current state |
|---|---|
| `GAME RNG ⟂ COMPUTE` | **ENFORCED** |
| explicit consent / revoke / local caps | **ENFORCED** |
| Hardware Guardian | **ENFORCED in Desktop Agent** |
| hardware-aware / human-blind policy | **ENFORCED** |
| Host-first QoS | **ENFORCED in Desktop Agent** |
| Provider Authority Epoch / default-deny core | **IMPLEMENTED CORE**, not yet required by every Router/Fabric dispatch |
| Receipt Provenance Envelope | **IMPLEMENTED CORE**, external signatures/settlement pending |
| True Work Accounting | **IMPLEMENTED CORE**, durable production ledger pending |
| Device Health Passport | **IMPLEMENTED CORE**, real persistent sensor provenance pending |
| Smart Compute Node | **IMPLEMENTED CORE** |
| NerdMinerV2 × JANUS I0 bridge | **IMPLEMENTED CORE**, physical bridge/firmware gate pending |
| Edge Constellation | **IMPLEMENTED CORE**, real fleet pending |
| Evidence Independence Engine | **IMPLEMENTED CORE**, real attested lineage roots pending |
| Standard Pilot Authority | **IMPLEMENTED CORE / ARMED-DISABLED**, receiving address + dedicated Ethereum RPC pending |
| Buyer Lab / policy surfaces | **DEMO PREVIEW** |
| production settlement network | **EXTERNAL GATE / NOT ESTABLISHED** |

Canonical audit:

- [`docs/CLAIM_TO_IMPLEMENTATION_AUDIT_2026-08-31.md`](docs/CLAIM_TO_IMPLEMENTATION_AUDIT_2026-08-31.md)
- [`.janus/HELIOS_CLAIM_IMPLEMENTATION_AUDIT_2026-08-31.json`](.janus/HELIOS_CLAIM_IMPLEMENTATION_AUDIT_2026-08-31.json)
- [`PROJECT_STATUS.json`](PROJECT_STATUS.json)
- [`.janus/HELIOS_ARCHITECTURE.json`](.janus/HELIOS_ARCHITECTURE.json)

A file existing in the repository is **not** treated as proof of end-to-end enforcement.

---

## Hard constitutional boundary

```text
compute → RNG                     FORBIDDEN
compute → RTP                     FORBIDDEN
compute → personal win chance     FORBIDDEN
compute → bonus probability       FORBIDDEN
compute → personal jackpot weight FORBIDDEN
hardware pressure → game outcome  FORBIDDEN
controller → wider local PC limits FORBIDDEN
browser → provider private secret FORBIDDEN
unverified receipt → authoritative value FORBIDDEN
```

Compute may be reduced or stopped to protect the participating device. Hardware pressure must never change the gambling/game outcome channel.

---

## Device sovereignty

### Hardware Guardian v1.0

[`src/helios-hardware-guardian.js`](src/helios-hardware-guardian.js) evaluates hardware-only telemetry and produces:

```text
GREEN / WATCH / THROTTLE / COOLDOWN / BLOCK / UNKNOWN
```

It can only preserve, tighten or block a compute budget.

Accepted evidence includes appropriate temperature, power, utilization, memory/VRAM, AC/battery and vendor-limit data where available.

Human-content observation is forbidden:

```text
SCREEN          NO
KEYBOARD        NO
MOUSE           NO
MICROPHONE      NO
CAMERA          NO
CLIPBOARD       NO
BROWSER HISTORY NO
PROCESS/GAME NAME NO
ACTIVE WINDOW   NO
```

Missing sensor evidence remains `UNKNOWN`; it is not converted into a fake green score.

### Host-first QoS

Desktop Agent v1.3 applies Host-first Quiet Canary QoS **after** Hardware Guardian:

```text
CONTROLLER REQUEST
      ↓ cannot exceed
LOCAL USER POLICY
      ↓ can only contract
HARDWARE GUARDIAN
      ↓ can only contract
HOST-FIRST QoS
      ↓
FINAL EXECUTION BUDGET
```

Under high local CPU/GPU/memory pressure, external work yields first. The decision uses hardware/resource pressure, not observation of what the human is doing.

---

## Smart Compute Node v1.1

[`src/helios-smart-compute-node.js`](src/helios-smart-compute-node.js) fuses work evidence and device state into one node record:

```text
WORK EVIDENCE
+ HARDWARE GUARDIAN
+ ACTUAL EXECUTION BUDGET
+ DEVICE HEALTH PASSPORT
+ WORK PROVENANCE
+ REPLICATION LINEAGE
```

Generic work evidence supports general compute, AI inference, rendering, science, transcoding, storage/network work, operator batch work and custom workloads. Generic workloads use workload-appropriate units and keep assigned/completed/verified work distinct. Edge Hash / JANUS I0 retains checked-work normalization.

A real provider/verifier is still required before any workload-specific result becomes authoritative.

---

## Trust Fabric v1.0

[`src/helios-trust-fabric.js`](src/helios-trust-fabric.js) implements first-party trust primitives including Provider registration ≠ admission, Authority Epochs and scoped non-transferable provider leases, Host-first QoS, Receipt Provenance Envelope, True Work Accounting, Device Health Passport, Verifier Assurance Monotonicity, shadow accelerator qualification and compute lineage.

Provider Authority Epoch remains **IMPLEMENTED CORE**, not end-to-end production enforcement, until every production Router/Fabric dispatch requires it.

---

## Desktop compute plane

### Desktop Fabric v2.1

[`src/helios-desktop-fabric.js`](src/helios-desktop-fabric.js) includes CPU/GPU/HYBRID placement, resource admission, bounded queue/backpressure, priority aging, concurrency limits, provider circuit breaker, bounded retries, fenced leases, stale-result rejection and provider verification.

### Desktop Agent v1.3

[`src/helios-desktop-agent.js`](src/helios-desktop-agent.js) is deliberately not a generic remote shell. Executors are pre-registered by exact:

```text
provider_id + task_type + artifact SHA-256
```

The local runtime rechecks consent, revoke state, lease expiry, CPU/RAM/VRAM capacity, thermal/power/battery policy, Hardware Guardian, Host-first QoS, capabilities and exact executor identity before effect.

---

## Edge Hash Lab — NerdMinerV2 × JANUS I0

HELIOS treats **BitMaker-hub/NerdMiner_v2** as an external MIT compatibility target. NerdMiner source is not silently vendored or rebranded as HELIOS code. JANUS I0 remains separately scoped Background IP.

```text
JANUS I0 50%  ↔  RANDOMIZED MIRROR 50%
SAME/FROZEN WIRE CONDITIONS
EQUAL CHECKED-WORK EXPOSURE
PER-CHECKED-MH EVIDENCE
RAW HASHRATE ≠ PROOF
```

Stock NerdMiner firmware does not automatically become I0-capable. Physical I0 execution requires a compatible bridge/firmware and conformance gate.

---

## Edge Constellation + Evidence Independence

HELIOS supports the research architecture:

```text
ESP32 → CPU → GPU → ASIC → HETEROGENEOUS FLEET
```

while keeping:

```text
NODE POWER ≠ EVIDENCE WEIGHT
REPLICATION COUNT ≠ INDEPENDENT ROOT COUNT
UNKNOWN LINEAGE ≠ INDEPENDENCE
```

The Evidence Independence Engine evaluates physical-device, execution-lineage, authority, site/network, observation-epoch and job-stream roots. Real independence claims still require real attested roots.

---

## Public demo surface

The public site is a presentation/reference surface and includes the responsive cosmic slot, HELIOS/DIVINE/GRIDJACK/CUSTOM profiles, cascades, Solar Corona/free-spin demo, explicit compute consent/revoke, CPU/GPU policy console, route presentation, receipt viewer, Buyer Lab, Guardian/Trust/Edge/Smart Node previews, procedural audio, Stellar Navigator and mobile presentation.

`index.html` is the explicit authoritative feature loader. The system-status card intentionally says **`DEMO / NO LIVE SENSORS`**. No static percentage is presented as device health.

---

## Commercial thesis

HELIOS is intended for licensing to a qualified partner able to build, integrate, operate, distribute and support a production pilot.

```text
HELIOS OWNER
IP + LICENSE + ARCHITECTURE HANDOVER
        ↓
QUALIFIED LICENSEE
BUILD + INTEGRATE + OPERATE + SELL + SUPPORT
        ↓
IGAMING / DISTRIBUTION
        ↕
COMPUTE / DATACENTER / RESEARCH PARTNERS
```

Indicative discussion structure — **not a valuation or binding offer**:

```text
USD 10k–25k pilot / integration right
then, if successfully commercialized,
2%–5% of contractually defined HELIOS-attributable compute revenue
or an agreed per verified/monetized device-hour fee
```

Qualified scientific/public-benefit workloads may receive reduced or zero **HELIOS platform royalty** by written agreement. Low-friction adoption does not transfer HELIOS Core.

See [`PARTNERSHIP_BRIEF.md`](PARTNERSHIP_BRIEF.md), [`docs/MARKET_AND_LICENSE_POSITION_2026-08-31.md`](docs/MARKET_AND_LICENSE_POSITION_2026-08-31.md), [`legal/COMMERCIAL_LICENSE_PRINCIPLES.md`](legal/COMMERCIAL_LICENSE_PRINCIPLES.md) and [`LICENSE.md`](LICENSE.md).

---

## HELIOS Standard Pilot Authority

HELIOS contains a fail-closed standard-pilot licensing path:

```text
NAMED PILOT REQUEST
        ↓
FROZEN TERMS ACCEPTED
        ↓
EXACT INVOICE
        ↓
ON-CHAIN PAYMENT VERIFIED
        ↓
PILOT_ACTIVE · 90 DAYS
```

Core law:

```text
PAYMENT IS EVIDENCE ≠ PAYMENT IS AUTHORITY
```

The automated standard grant is non-exclusive, non-transferable and non-sublicensable. It permits internal evaluation/integration and one controlled non-money pilot, but does **not** transfer HELIOS Core, authorize real-money gambling, authorize public production or automatically create commercial rights.

After a current Binance network recheck showed that Base was not available for the intended deposit path, the frozen standard route was moved to **USDT on Ethereum Mainnet (ERC20)**:

```text
Chain ID: 1
Asset: USDT / USD₮
Contract: 0xdAC17F958D2ee523a2206206994597C13D831ec7
Standard anchor: 10,000 USDT
```

Each invoice receives a deterministic sub-dollar **discount** to create a unique on-chain payment fingerprint without charging a surcharge.

The subsystem is currently **ARMED BUT DISABLED**. The receiving address is still unset and a dedicated Ethereum RPC must be configured through `HELIOS_PILOT_RPC_URL` before activation. No invoice or grant can issue while either gate is missing.

No wallet private key, seed phrase, Binance password, 2FA code or withdrawal API key belongs in HELIOS. The watcher is read-only and cannot move funds.

See [`docs/PILOT_AUTHORITY.md`](docs/PILOT_AUTHORITY.md), [`legal/HELIOS_STANDARD_PILOT_LICENSE_v1.md`](legal/HELIOS_STANDARD_PILOT_LICENSE_v1.md), [`commerce/HELIOS_PILOT_PAYMENT_POLICY.json`](commerce/HELIOS_PILOT_PAYMENT_POLICY.json) and [`.janus/HELIOS_PILOT_AUTHORITY.json`](.janus/HELIOS_PILOT_AUTHORITY.json).

---

## Market / uniqueness boundary

HELIOS does **not** claim to have invented slots, game+compute, volunteer computing, consumer GPU clouds, mining, hardware monitoring or public-benefit distributed compute.

> **As of the 2026-08-31 public market review, predecessors were found for individual components, but no public commercial product was identified exposing the same complete maintained HELIOS architecture as one licensable B2B control plane.**

That is a product-positioning statement, not a patentability or freedom-to-operate opinion.

---

## Integrity and due diligence

`HELIOS Integrity` runs syntax/public checks, the invariant suite, secret scan, declared SBOM generation, strict buyer due-diligence preflight and closing-manifest candidate generation. A green run applies **only to the exact tested commit**.

Start with [`docs/DATA_ROOM_INDEX.md`](docs/DATA_ROOM_INDEX.md), [`docs/CLAIM_TO_IMPLEMENTATION_AUDIT_2026-08-31.md`](docs/CLAIM_TO_IMPLEMENTATION_AUDIT_2026-08-31.md), [`PROJECT_STATUS.json`](PROJECT_STATUS.json) and [`.janus/HELIOS_ARCHITECTURE.json`](.janus/HELIOS_ARCHITECTURE.json).

---

## Production gates

Production is **NOT ESTABLISHED**. Major remaining gates include:

1. real provider adapter + signed manifest;
2. end-to-end Provider Authority Epoch enforcement in Router/Fabric;
3. authenticated production Desktop Agent transport;
4. real vendor thermal/power/energy telemetry with sensor provenance;
5. signed provider receipts + anti-replay + authoritative settlement;
6. persistent Device Health Passport windows;
7. workload sandbox / egress policy;
8. real attested Evidence Independence roots;
9. real heterogeneous fleet validation;
10. independent security/privacy/legal/game-math review;
11. partner-operated non-money pilot with device-hours, Wh, failures, throttles and measured unit economics;
12. branch protection/ruleset and signed closing snapshot or equivalent change control;
13. Pilot Authority USDT/Ethereum receiving-address activation plus dedicated Ethereum RPC and exact-head Integrity success.

> **ONE CORE. ANY DESTINATION. PROTECT THE DEVICE. PROVE THE WORK. KEEP GAME MATH SEALED.**
