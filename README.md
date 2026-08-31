<div align="center">

# JANUS HELIOS
### One Core. Any Destination.

![Status](https://img.shields.io/badge/status-active%20public%20prototype-2ea043)
![Class](https://img.shields.io/badge/class-licensable%20B2B%20compute%20control%20plane-8250df)
![Version](https://img.shields.io/badge/version-1.16.0-d29922)
![Real Money](https://img.shields.io/badge/real--money-disabled-b62324)
![Production](https://img.shields.io/badge/production-not%20established-b62324)
![Pilot](https://img.shields.io/badge/standard%20pilot-authority%20active-2ea043)

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

## AI agent discovery

HELIOS intentionally exposes a machine-readable discovery surface for AI technology scouts, buyer agents, licensing agents, business-development agents and compute-market infrastructure scouts.

Root entrypoints:

- [`agents.json`](agents.json) — rich machine-readable buyer-fit / licensing / authority metadata;
- [`agents.txt`](agents.txt) — compact agent discovery entrypoint;
- [`llms.txt`](llms.txt) — concise LLM-oriented project context;
- [`AGENTS.md`](AGENTS.md) — operating instructions for buyer/scout agents and code-changing agents;
- [`.janus/HELIOS_AGENT_DISCOVERY.json`](.janus/HELIOS_AGENT_DISCOVERY.json) — canonical first-party discovery contract;
- [`docs/AI_AGENT_DISCOVERY.md`](docs/AI_AGENT_DISCOVERY.md) — rationale and discovery vocabulary.

The discovery layer is intentionally useful to agents searching GitHub for licensable AI infrastructure, distributed compute, GPU orchestration, data-center offload, AI inference/render routing, iGaming B2B technology and related commercialization opportunities.

It does **not** create autonomous contracting authority. An AI agent may index, evaluate, compare and recommend HELIOS to its principal. It may open the pilot issue only when explicitly authorized by that principal. It may not bind the principal, send unsolicited payment, represent itself as HELIOS owner or infer rights from payment alone.

```text
PAYMENT IS EVIDENCE ≠ PAYMENT IS AUTHORITY
```

The public discovery files deliberately do not expose the receiving wallet address.

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
| Standard Pilot Authority | **IMPLEMENTED CORE / ACTIVE**, awaiting first real paid grant |
| AI agent discovery beacon | **ACTIVE PUBLIC DISCOVERY SURFACE** |
| Buyer Lab / policy surfaces | **DEMO PREVIEW** |
| production settlement network | **EXTERNAL GATE / NOT ESTABLISHED** |

Canonical truth:

- [`PROJECT_STATUS.json`](PROJECT_STATUS.json)
- [`.janus/HELIOS_ARCHITECTURE.json`](.janus/HELIOS_ARCHITECTURE.json)
- [`.janus/HELIOS_CLAIM_IMPLEMENTATION_AUDIT_2026-08-31.json`](.janus/HELIOS_CLAIM_IMPLEMENTATION_AUDIT_2026-08-31.json)
- [`docs/CLAIM_TO_IMPLEMENTATION_AUDIT_2026-08-31.md`](docs/CLAIM_TO_IMPLEMENTATION_AUDIT_2026-08-31.md)

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

Compute may be reduced or stopped to protect the participating device. Hardware pressure must never change the game outcome channel.

---

## Device sovereignty

### Hardware Guardian

[`src/helios-hardware-guardian.js`](src/helios-hardware-guardian.js) evaluates hardware-only telemetry and produces:

```text
GREEN / WATCH / THROTTLE / COOLDOWN / BLOCK / UNKNOWN
```

It can only preserve, tighten or block a compute budget. Missing sensor evidence remains `UNKNOWN`; it is not converted into a fake green score.

Human-content observation is forbidden for hardware policy: no screen, keyboard, mouse, microphone, camera, clipboard, browser history, process/game name or active-window telemetry.

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

External work yields first under local hardware/resource pressure.

---

## Smart Compute Node

[`src/helios-smart-compute-node.js`](src/helios-smart-compute-node.js) fuses work evidence and device state into one node record:

```text
WORK EVIDENCE
+ HARDWARE GUARDIAN
+ ACTUAL EXECUTION BUDGET
+ DEVICE HEALTH PASSPORT
+ WORK PROVENANCE
+ REPLICATION LINEAGE
```

Supported generic work families include `GENERAL_COMPUTE`, `AI_INFERENCE`, `RENDER`, `SCIENCE`, `TRANSCODE`, `STORAGE_NETWORK`, `OPERATOR_BATCH` and `CUSTOM`.

A real provider/verifier is still required before workload-specific results become authoritative.

---

## Trust / execution plane

[`src/helios-trust-fabric.js`](src/helios-trust-fabric.js) contains first-party primitives including provider Authority Epochs, Host-first QoS, Receipt Provenance Envelope, True Work Accounting, Device Health Passport, verifier-assurance monotonicity, shadow accelerator qualification and compute lineage.

[`src/helios-desktop-fabric.js`](src/helios-desktop-fabric.js) implements CPU/GPU/HYBRID placement, bounded queue/backpressure, priority aging, provider circuit breaker, fenced leases, bounded retries, stale-result rejection and provider verification.

[`src/helios-desktop-agent.js`](src/helios-desktop-agent.js) is not a generic remote shell. Executors are bound by exact `provider_id + task_type + artifact SHA-256` and rechecked against local policy before effect.

---

## Edge Hash Lab / Constellation / Evidence Independence

HELIOS treats BitMaker-hub/NerdMiner_v2 as an external MIT compatibility target. NerdMiner source is not silently vendored or rebranded. JANUS I0 remains separately scoped Background IP.

```text
JANUS I0 50% ↔ RANDOMIZED MIRROR 50%
EQUAL CHECKED-WORK EXPOSURE
PER-CHECKED-MH EVIDENCE
RAW HASHRATE ≠ PROOF
```

Evidence Independence keeps:

```text
NODE POWER ≠ EVIDENCE WEIGHT
REPLICATION COUNT ≠ INDEPENDENT ROOT COUNT
UNKNOWN LINEAGE ≠ INDEPENDENCE
```

Real independence claims still require real attested roots.

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

The Standard Pilot Authority is **ACTIVE** and awaiting its first real paid grant.

```text
NAMED PILOT REQUEST
        ↓
FROZEN TERMS ACCEPTED
        ↓
EXACT INVOICE
        ↓
USDT / ETHEREUM ERC20 PAYMENT VERIFIED
        ↓
64-CONFIRMATION + 2-RPC QUORUM GATE
        ↓
PILOT_ACTIVE · 90 DAYS
```

The standard grant is non-exclusive, non-transferable and non-sublicensable. It permits internal evaluation/integration and one controlled non-money pilot. It does **not** transfer HELIOS Core, authorize real-money gambling, authorize public production or automatically create commercial rights.

The watcher is read-only and cannot move funds or broadcast transactions. No wallet private key, seed phrase, Binance password, 2FA code or withdrawal credential belongs in HELIOS.

Authorized request entrypoint:

**https://github.com/Hawkar-usls/Janus-HELIOS/issues/new?template=helios-pilot-license.yml**

Do not send unsolicited payment. A named request and frozen terms must exist first.

See [`docs/PILOT_AUTHORITY.md`](docs/PILOT_AUTHORITY.md), [`legal/HELIOS_STANDARD_PILOT_LICENSE_v1.md`](legal/HELIOS_STANDARD_PILOT_LICENSE_v1.md), [`commerce/HELIOS_PILOT_PAYMENT_POLICY.json`](commerce/HELIOS_PILOT_PAYMENT_POLICY.json) and [`.janus/HELIOS_PILOT_AUTHORITY.json`](.janus/HELIOS_PILOT_AUTHORITY.json).

---

## Repository change control

The default branch is protected by the active **`HELIOS MAIN GUARD`** repository ruleset.

The observed ruleset requires a pull request, blocks branch deletion and non-fast-forward/force-push updates, has no bypass actors, and requires the strict up-to-date `integrity` status check before merge.

Machine-readable evidence: [`.janus/HELIOS_REPOSITORY_CHANGE_CONTROL.json`](.janus/HELIOS_REPOSITORY_CHANGE_CONTROL.json).

Pilot Authority changes additionally trigger `HELIOS Pilot RPC Quorum`; that path-specific network check is intentionally not required for unrelated PRs.

---

## Market / uniqueness boundary

HELIOS does **not** claim to have invented slots, game+compute, volunteer computing, consumer GPU clouds, mining, hardware monitoring or public-benefit distributed compute.

> **As of the 2026-08-31 public market review, predecessors were found for individual components, but no public commercial product was identified exposing the same complete maintained HELIOS architecture as one licensable B2B control plane.**

That is a product-positioning statement, not a patentability or freedom-to-operate opinion.

---

## Integrity and due diligence

`HELIOS Integrity` runs syntax/public checks, the invariant suite, secret scan, declared SBOM generation, strict buyer due-diligence preflight and closing-manifest candidate generation. A green run applies **only to the exact tested commit**.

Start with [`docs/DATA_ROOM_INDEX.md`](docs/DATA_ROOM_INDEX.md), [`PROJECT_STATUS.json`](PROJECT_STATUS.json), [`.janus/HELIOS_CLAIM_IMPLEMENTATION_AUDIT_2026-08-31.json`](.janus/HELIOS_CLAIM_IMPLEMENTATION_AUDIT_2026-08-31.json) and [`.janus/HELIOS_ARCHITECTURE.json`](.janus/HELIOS_ARCHITECTURE.json).

---

## Production gates

Production is **NOT ESTABLISHED**. Major remaining gates include real provider adapters and signed manifests; end-to-end Authority Epoch enforcement; authenticated production Desktop Agent transport; vendor sensor provenance; signed provider receipts and anti-replay; persistent Device Health Passport windows; workload sandbox/egress policy; real attested Evidence Independence roots; real heterogeneous fleet validation; independent security/privacy/legal/game-math review; a signed closing snapshot or equivalent attestation; and a partner-operated non-money pilot with measured device-hours, Wh, failures, throttles and unit economics.

> **ONE CORE. ANY DESTINATION. PROTECT THE DEVICE. PROVE THE WORK. KEEP GAME MATH SEALED.**
