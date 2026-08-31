<div align="center">

# JANUS HELIOS
### One Core. Any Destination.

![Status](https://img.shields.io/badge/status-active%20public%20prototype-2ea043)
![Class](https://img.shields.io/badge/class-licensable%20game%20%2B%20compute%20control%20plane-8250df)
![Version](https://img.shields.io/badge/version-1.16.0-d29922)
![Real Money](https://img.shields.io/badge/real--money-disabled-b62324)

</div>

## Product thesis

**JANUS HELIOS is not intended to be sold as another slot.**

HELIOS is a source-available B2B reference architecture for a licensable interaction class: a game-shaped or white-label user surface can coexist with a separately controlled, explicit-opt-in compute layer that protects participating hardware, routes bounded device capacity toward approved external workloads, and records verified value/impact without allowing compute to alter game mathematics.

```text
GAMEPLAY / PRESENTATION
        │
        │ strict authority boundary
        └──────────────X──────────────> compute cannot alter RNG / RTP / odds

EXPLICIT OPT-IN COMPUTE
        ↓
USER CPU / GPU ENVELOPE
        ↓
HARDWARE GUARDIAN + HOST-FIRST QoS
        ↓
SMART COMPUTE NODE
        ↓
PROVIDER-AGNOSTIC ROUTER
        ↓
MARKET / SCIENCE / TREASURY / DATA CENTER / OPERATOR / CUSTOM
        ↓
VERIFIED RESULT + PROVENANCE
        ↓
AUTHORITATIVE RECEIPT / SETTLEMENT
        ↓
MEASURABLE EXTERNAL VALUE / IMPACT
```

Public demo: https://hawkar-usls.github.io/Janus-HELIOS/

The public page is an evaluation/reference prototype. It does not perform real-money gambling, does not run a production provider fleet and does not claim authoritative live settlement.

## What is actually differentiated

HELIOS does **not** claim to have invented slots, distributed computing, game-plus-compute, mining, idle GPU markets, hardware monitoring, science volunteer computing, leases or worker pools.

The maintained product proposition is the simultaneous composition of:

- game-shaped / white-label acquisition surface;
- explicit revocable compute consent;
- user-defined CPU/GPU resource limits;
- replaceable multi-destination routing;
- provider manifest / adapter / verifier abstraction;
- provider default-deny + authority epochs;
- Hardware Guardian;
- host-first Quiet Canary resource shedding;
- hardware-aware / human-blind telemetry;
- Smart Compute Node combining work evidence and device state;
- Device Health Passport;
- provider-independent receipt provenance and true-work accounting;
- Edge Hash Lab with a separately scoped JANUS I0 bridge;
- hardware-fair Edge Constellation;
- Evidence Independence Engine;
- strict `GAME RNG ⟂ COMPUTE` separation;
- buyer-configurable B2B/white-label surface;
- source-available evaluation with separately negotiated production rights.

### Market-reviewed uniqueness boundary

As of the public market review dated **2026-08-31**, HELIOS found predecessors for individual ingredients — including HEWMEN, BOINC, Charity Engine, SaladCloud and Theta EdgeCloud — but did **not identify a public commercial product exposing the same complete maintained HELIOS architecture as one licensable B2B control plane**.

That is deliberately narrower than saying “nobody has ever combined games and compute.”

This repository does not claim that this review establishes patentability or freedom to operate.

See [`docs/MARKET_AND_LICENSE_POSITION_2026-08-31.md`](docs/MARKET_AND_LICENSE_POSITION_2026-08-31.md) and [`docs/COMPETITIVE_MOAT.md`](docs/COMPETITIVE_MOAT.md).

## Current core stack

### Hardware Guardian

`src/helios-hardware-guardian.js`

Local hardware policy can tighten or stop compute based on thermal/power/battery/memory/VRAM/load evidence. It intentionally forbids screen, keyboard, mouse, microphone, camera, clipboard, browser-history and process-content observation.

```text
HARDWARE-AWARE ∧ HUMAN-BLIND
```

### Trust Fabric

`src/helios-trust-fabric.js`

Maintains provider default-deny, authority epochs, fenced capability leases, Host-first QoS, receipt provenance, Device Health Passport, true-work accounting, verifier-assurance monotonicity and accelerator shadow qualification.

### Smart Compute Node

`src/helios-smart-compute-node.js`

One node record joins:

```text
WORK / HASH EVIDENCE
+ DEVICE STATE
+ GUARDIAN DECISION
+ ACTUAL EXECUTION BUDGET
+ DEVICE HEALTH PASSPORT
+ PROVENANCE
+ REPLICATION LINEAGE
```

Core law:

```text
WORK MONITORING + DEVICE MONITORING = ONE NODE RECORD
```

### Edge Hash Lab — NerdMinerV2 × JANUS I0 bridge

`src/helios-edge-hash-lab.js`

NerdMinerV2 remains an external MIT compatibility target; its source is not vendored. JANUS I0 remains separately scoped Background IP unless expressly licensed.

The research contract compares structured I0 traversal to a randomized mirror under equal checked-work exposure and does not claim a SHA-256 shortcut or guaranteed mining advantage.

### Edge Constellation

`src/helios-edge-constellation.js`

Heterogeneous ESP32/CPU/GPU/ASIC-class nodes can participate in controlled replication without raw hardware power automatically becoming evidence weight.

```text
NODE POWER != EVIDENCE WEIGHT
```

### Evidence Independence Engine

`src/helios-evidence-independence.js`

Cross-node evidence distinguishes report count from independent-root count using physical-device, execution-lineage, authority, site/network, observation-epoch and job-stream roots.

```text
REPLICATION COUNT != INDEPENDENT ROOT COUNT
UNKNOWN != INDEPENDENT
```

## Commercial model — license the technology, do not require the owner to operate it

Preferred role separation:

```text
HELIOS OWNER / LICENSOR
        ↓
QUALIFIED MASTER LICENSEE
fund + build + integrate + operate + sell + support
        ↓
operators / aggregators ↔ compute / datacenter / research partners
```

The HELIOS owner is not seeking to become the casino operator, compute provider, KYC/AML vendor, 24/7 SRE organization or end-user support desk.

### Indicative opening framework

The following figures are **negotiating anchors only — not a valuation, binding offer or market quote**:

```text
Pilot license / integration right:
USD 10,000–25,000 indicative discussion range

If commercially deployed:
2%–5% of contractually defined HELIOS-attributable compute revenue

Alternative:
agreed amount per verified / monetized device-hour
```

Meaningful exclusivity should require commercialization milestones and/or minimum consideration rather than allowing the technology to be shelved.

### Science / Public Benefit Discount

Qualified academic/nonprofit science, medical/public-health, humanitarian/public-interest or independently reviewed open-science workloads may be considered for a **reduced or zero HELIOS platform royalty by written agreement**.

This only concerns the HELIOS licensor's own royalty and does not waive third-party electricity, infrastructure, provider, security, tax or compliance costs.

See:
- [`PARTNERSHIP_BRIEF.md`](PARTNERSHIP_BRIEF.md)
- [`docs/COMMERCIAL_THESIS.md`](docs/COMMERCIAL_THESIS.md)
- [`legal/COMMERCIAL_LICENSE_PRINCIPLES.md`](legal/COMMERCIAL_LICENSE_PRINCIPLES.md)
- [`docs/MASTER_LICENSEE_OUTREACH_TEMPLATE.md`](docs/MASTER_LICENSEE_OUTREACH_TEMPLATE.md)

## IP boundary

Low-friction pilot economics do not transfer HELIOS ownership.

Current intended principles, subject to a signed definitive agreement and counsel:

- HELIOS Core remains licensor Background IP;
- commercial/production/OEM/white-label rights require a separate written agreement;
- licensees can build real proprietary integrations inside the licensed field;
- HELIOS source is not licensed for standalone resale by default;
- general/core improvements should use an expressly negotiated shared-use or license-back boundary;
- field, territory, duration, sublicensing and exclusivity are explicit;
- JANUS I0 remains separately scoped unless expressly included;
- abstract ideas, algorithms and business methods are not falsely claimed as monopolized merely by publication here.

See [`LICENSE.md`](LICENSE.md), [`IP_NOTICE.md`](IP_NOTICE.md), [`THIRD_PARTY_NOTICES.md`](THIRD_PARTY_NOTICES.md) and [`legal/BACKGROUND_IP_AND_PROVENANCE.md`](legal/BACKGROUND_IP_AND_PROVENANCE.md).

## Game / compute constitutional boundary

```text
compute -> RNG / RTP / personal win odds       FORBIDDEN
compute -> bet / personal jackpot weight       FORBIDDEN
hardware pressure -> game outcome               FORBIDDEN
controller -> wider local device limits         FORBIDDEN
browser -> provider private secret              FORBIDDEN
unverified result -> authoritative value        FORBIDDEN
unknown sensor -> invented health claim         FORBIDDEN
```

The browser demo uses simulated credits/compute receipts. Production real-money deployment requires independent legal, regulatory, security, privacy, game-math and workload review.

## Current public/game surface

The public build includes the responsive cosmic 5×3 slot presentation, HELIOS/DIVINE/GRIDJACK/CUSTOM profiles, cascading multipliers, Solar Corona features, explicit purchased-bonus review/consent in demo mode, procedural WebAudio, Stellar Navigator, Resource Console, Buyer Cockpit, receipt viewer, Trust Fabric, Hardware Guardian preview, Edge Hash Lab, Edge Constellation, Evidence Independence and Smart Compute Node buyer-facing surfaces.

These presentation layers do not acquire game-math or production-compute authority merely by being visible in the browser.

## Production validation gate

The most valuable next proof is external:

```text
QUALIFIED LICENSEE / FUNDED PILOT
        ↓
REAL COMPUTE PARTNER + WORKLOAD
        ↓
20–100+ CONSENTING DEVICES
        ↓
REAL VENDOR TELEMETRY + SMART-NODE RECORDS
        ↓
AUTHORITATIVE RECEIPTS
        ↓
DEVICE-HOURS + Wh + FAILURE / RETRY / THROTTLE / REVOKE DATA
        ↓
INDEPENDENCE ROOT ATTESTATIONS
        ↓
USER OPT-IN / RETENTION
        ↓
MEASURED UNIT ECONOMICS
```

Until those gates are crossed, HELIOS is a testable reference architecture and commercial thesis — not proven profitability, regulatory approval or proven hardware-lifetime extension.

## Integrity

`HELIOS Integrity` runs configured syntax/public checks, invariant tests, secret scanning, declared-dependency SBOM generation, strict buyer due-diligence preflight and closing-manifest generation for each tested snapshot.

A green CI run applies only to the exact tested commit. It is not a gambling certificate, security audit, legal opinion, profitability proof or production-readiness certificate.

## Repository map

- `src/helios-router.js` — provider/workload routing authority;
- `src/helios-desktop-fabric.js` — desktop/workstation scheduling;
- `src/helios-desktop-agent.js` — local execution gate;
- `src/helios-hardware-guardian.js` — device-protection policy;
- `src/helios-trust-fabric.js` — authority/provenance/passport/accounting;
- `src/helios-smart-compute-node.js` — work + device fusion record;
- `src/helios-edge-hash-lab.js` — NerdMiner/I0 compatibility/evidence contract;
- `src/helios-edge-constellation.js` — heterogeneous replication plane;
- `src/helios-evidence-independence.js` — independence-aware synthesis;
- `.janus/` — machine-readable contracts/audit state;
- `docs/` — architecture/commercial documentation;
- `legal/` — diligence/licensing boundary documents.

Project package version: **`1.16.0`**.

> **ONE CORE. ANY DESTINATION.**
