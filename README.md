<div align="center">

# JANUS HELIOS
### One Core. Any Destination.

![Status](https://img.shields.io/badge/status-active%20public%20prototype-2ea043)
![Class](https://img.shields.io/badge/class-gameplay%20%2B%20compute%20routing-8250df)
![Version](https://img.shields.io/badge/version-1.15.0-d29922)
![Desktop Fabric](https://img.shields.io/badge/desktop%20fabric-2.1.0-1f8fbc)
![Real Money](https://img.shields.io/badge/real--money-disabled-b62324)

</div>

## Product thesis

**JANUS HELIOS is not intended to be sold as another slot.**

It is a web-first B2B prototype for a new interaction class: a game surface can coexist with a separately controlled, explicit-opt-in compute layer that routes available resources toward approved external workloads and records the resulting value or impact.

```text
GAMEPLAY SURFACE
      || strict authority boundary
OPT-IN COMPUTE ROUTER
      ↓
MARKET / SCIENCE / TREASURY / DATA CENTER / OPERATOR / CUSTOM
      ↓
HELIOS DESKTOP FABRIC / PROVIDER ADAPTER
      ↓
VERIFIED WORK RESULT
      ↓
AUTHORITATIVE PROVIDER RECEIPT / SETTLEMENT
      ↓
MEASURABLE EXTERNAL RESULT
```

Public demo: https://hawkar-usls.github.io/Janus-HELIOS/

The public page is a capability/evaluation demo. It does not perform real-money gambling and does not claim authoritative production provider settlement.

## What is actually new here

HELIOS does **not** claim to have invented slots, distributed computing, mining, idle-compute marketplaces, leases, queues or worker pools.

The product proposition is the concrete combination:

- one reusable game-shaped interaction surface;
- explicit, revocable compute consent;
- replaceable multi-destination resource routing;
- a desktop/workstation execution plane;
- provider-independent workload/receipt history;
- strict `GAME RNG ⟂ COMPUTE` authority separation;
- buyer-configurable routing and presentation;
- a source-available evaluation / separately licensed commercial model.

The central HELIOS multi-gateway architecture is maintained as a HELIOS-native product architecture. Historical Buzz/ESP32 lineage is disclosed separately below rather than being used as the foundation of the current execution plane.

## Commercial thesis & sponsor validation

HELIOS is designed around **two independent value loops**:

```text
LOOP A — GAMEPLAY VALUE
player activity → game/operator economics

LOOP B — EXTERNAL COMPUTE VALUE
opted-in resource → approved workload → verified result → authoritative receipt → measurable value / impact
```

A conventional slot has one principal economic engine. HELIOS is designed so a second, separately accounted value source can exist alongside gameplay economics without allowing compute to change RNG, RTP, stake, bonus probability or personal jackpot weighting.

Illustrative sensitivity example only — **not a forecast or guaranteed return**:

```text
100,000 MAU
× 10% compute opt-in
× 1 device-hour/day
× 30 days
× $0.03 realized external value/device-hour
= $9,000 gross verified external value/month
```

An illustrative `70% user / 30% operator-platform` split would correspond to `$6,300 / $2,700`. Real economics can only be measured from live workload pricing, device mix, electricity, fees and authoritative receipts.

### Sponsor / provider gate

The public Pages build proves interaction architecture, not production profitability. A credible pilot requires:

```text
REAL SPONSOR / PROVIDER
        ↓
LIVE WORKLOAD
        ↓
CONSENTING TEST DEVICES
        ↓
REAL DEVICE-HOURS + WATT-HOURS
        ↓
AUTHORITATIVE RECEIPTS
        ↓
REAL VALUE / COST DATA
        ↓
MEASURED UNIT ECONOMICS
```

Until such a pilot exists, HELIOS economics are **modelled and testable, not production-validated**.

Full commercial model: [`docs/COMMERCIAL_THESIS.md`](docs/COMMERCIAL_THESIS.md).

Machine-readable commercial contract: [`.janus/HELIOS_COMMERCIAL_THESIS.json`](.janus/HELIOS_COMMERCIAL_THESIS.json).

## Current public demo surface

HELIOS currently demonstrates:

- responsive 5×3 cosmic slot surface;
- `HELIOS / DIVINE / GRIDJACK / CUSTOM` profiles;
- tumble cascades with `x1 → x4 → x16 → x64`;
- natural `SOLAR CORONA` wheel from 3+ suns;
- tiered purchased `SOLAR FREE SPINS` demo sessions;
- explicit per-purchase price review and consent;
- GRIDJACK `DEMO SPIN ENERGY`;
- mode + route + event + bonus-session generative WebAudio;
- six replaceable compute routes with explicit consent/revoke;
- rare `LUCKY HASH / IMPACT HIT / GOLDEN TASK` recognition;
- `MY HELIOS` miner/operator profile with history, notifications and simulated live offers;
- iPhone/Android mobile showcase support.

The repository additionally contains the HELIOS-native desktop fabric/agent coordination core described below. The public browser demo is **not** represented as already running a production desktop fleet.

## Solar feature family

HELIOS deliberately separates the natural Solar identity event from a purchased free-spins session.

### Natural Solar Corona

```text
3+ ☀ ON SETTLED NORMAL GRID
          ↓
SOLAR CORONA WHEEL
          ↓
x2 / x3 / x4 / x5 / x8 / x10 / x16 / x25
          ↓
SOLAR_BONUS_BANK
```

This is a natural demo identity event and is independent from compute routing.

### Purchased Solar Free Spins — tiered demo flow

```text
CHOOSE BONUS
    ↓
SELECT TIER
    ↓
REVIEW EXACT COST + RULES
    ↓
EXPLICIT CONSENT
    ↓
BONUS CORE RE-CALCULATES PRICE
    ↓
AUTHORIZED SOLAR FREE-SPINS SESSION
```

| Tier | Demo cost | Starting spins | 3+ ☀ retrigger | Max spins |
|---|---:|---:|---:|---:|
| Standard Corona | `50× BET` | 10 | +2 | 16 |
| Radiant Corona | `100× BET` | 12 | +2 | 20 |
| Solar Flare | `175× BET` | 15 | +3 | 24 |

Higher tiers buy more free-spin opportunities and a larger disclosed retrigger budget. They do not guarantee a win and do not use compute activity, player history, loss streaks or personalized outcome shaping.

The synthetic re-click bridge was removed. The current contract is event-driven:

```text
helios:bonus-buy-request
          ↓
review / consent
          ↓
helios:bonus-buy-authorized
          ↓
core validation
          ↓
bonus session
```

The public prototype still bridges bonus spins into the existing balance-source core and refunds each bonus stake in the presentation layer. Production should promote `BONUS` into a first-class game-core source before regulated deployment.

```text
compute state / route / contribution → bonus RNG      NONE
Lucky Contribution                  → bonus RNG      NONE
real-money feature buy              → disabled
```

## Cosmic procedural soundtrack v3.1

`helios-music.js` generates music locally with WebAudio rather than playing a prerecorded song.

```text
GAME MODE
+ COMPUTE ROUTE
+ SESSION SEED
+ LIVE EVENTS
+ BONUS SESSION STATE
        ↓
16-STEP GENERATIVE TRANSPORT
        ↓
BASS + PULSE + ARP + PAD + STARFIELD + DRONE + FILLS
```

Base tonal identities:

```text
HELIOS   → D Lydian Orbit
DIVINE   → A Lydian Aether
GRIDJACK → E Dorian Pulse
CUSTOM   → C# Void Minor
```

The soundtrack never reads bet size, loss streak, near-miss state, wagering history or inferred vulnerability and has no authority over RNG, RTP, payout or compute routing.

See [`docs/COSMIC_SYNTH_ENGINE.md`](docs/COSMIC_SYNTH_ENGINE.md).

## Cascade engine

```text
paid line
   ↓
remove winning symbols
   ↓
gravity collapse
   ↓
random refill
   ↓
re-evaluate
   ↓
next paid cascade raises multiplier
```

Multiplier ladder: `x1 → x4 → x16 → x64`.

Compute state, route and receipts are not inputs to cascade RNG.

## Demo Spin Energy

In GRIDJACK, configured active demo compute can accumulate separate demo-only Spin Energy while explicit consent remains active.

```text
30 s eligible demo compute → +1 Energy Spin
bank max 3
```

It has no cash value, cashout, automatic wagering conversion or bank autoplay. A production compute-to-real-money-free-spin loop is disabled pending separate legal, responsible-gaming and game-math review.

## MY HELIOS — miner/operator profile

`helios-profile.js` previews the user-facing compute account that a real deployment could expose.

```text
MY HELIOS
├── OVERVIEW
├── WORK HISTORY
├── LIVE OFFERS
└── NOTIFICATIONS
    ├── Lucky Hash / Impact Hit / Golden Task
    └── Spin Energy events
```

The public profile uses local demo storage. Offer cards are simulated and are **not current provider prices**. Real offers require a live provider API; real earnings/impact require authoritative receipts and settlement/research acceptance.

## Lucky Contribution

```text
MARKETPLACE / TREASURY → LUCKY HASH
SCIENCE / PUBLIC GOOD  → IMPACT HIT
DC / OPERATOR / CUSTOM → GOLDEN TASK
```

The public-demo rate is `0.5%` per simulated receipt. Production recognition must come from an authoritative significance rule and receipt, never browser probability. Lucky Contribution cannot modify RNG, RTP, bonus probability, bet size or personal jackpot weight.

## Mobile showcase readiness

`helios-mobile.js` provides safe-area handling, `100dvh`, 44 px touch targets, responsive reels/router controls and mobile-safe bonus surfaces without changing game or compute authority.

Real-device validation remains a separate acceptance gate until explicitly recorded.

# HELIOS-native desktop compute plane

## Compute architecture

```text
EXPLICIT CONSENT
      ↓
DEVICE RESOURCE POLICY
      ↓
HELIOS ROUTER
      ↓
ProviderManifest + Adapter
      ↓
HELIOS DESKTOP FABRIC 2.1
      ↓
CPU / GPU / HYBRID placement
      ↓
FENCED LEASE + EXECUTION BUDGET
      ↓
HELIOS DESKTOP AGENT 1.1
      ↓
EXACT provider + task + artifact SHA-256 executor
      ↓
Provider-specific verification
      ↓
Fabric receipt / authoritative provider settlement gate
```

The standalone route boundary lives in [`src/helios-router.js`](src/helios-router.js).

The desktop coordination core lives in [`src/helios-desktop-fabric.js`](src/helios-desktop-fabric.js).

The local fail-closed runtime lives in [`src/helios-desktop-agent.js`](src/helios-desktop-agent.js).

Detailed architecture: [`docs/DESKTOP_FABRIC.md`](docs/DESKTOP_FABRIC.md).

Machine-readable contract: [`.janus/HELIOS_DESKTOP_FABRIC.json`](.janus/HELIOS_DESKTOP_FABRIC.json).

## Desktop Fabric 2.1

The active scheduler is designed for desktop/workstation resources rather than ESP32 limits:

- `CPU / GPU / HYBRID` resource classes;
- logical-core, RAM and VRAM admission;
- capability matching;
- thermal, battery and watt-budget gates;
- per-agent concurrency;
- bounded queue/backpressure;
- priority aging;
- provider circuit breaker;
- bounded retries;
- fenced leases, ACK deadline and lease renewal;
- stale-result rejection;
- per-slice verified-agent provenance;
- provider result verification before a fabric receipt.

### No resource-class head-of-line blocking

A high-priority GPU job with no available GPU does not freeze runnable CPU work behind it. The scheduler selects the highest-priority **currently dispatchable** slice.

This behavior has a dedicated regression invariant.

## Desktop Agent 1.1

The active desktop runtime is deliberately **not a remote shell**.

Executors are registered in advance by exact tuple:

```text
provider_id + task_type + artifact SHA-256
```

Generic command/shell/script/eval/process-spawn fields are rejected by the workload/agent boundary.

The controller supplies an execution budget, but the local machine independently rechecks it. The controller may make limits stricter; it may not widen the local user's CPU/GPU/thermal/power/concurrency policy.

Before execution the agent rechecks:

- active consent / revoke state;
- lease expiry;
- cores;
- currently available RAM and VRAM;
- thermal state;
- power budget;
- battery/AC policy;
- required capabilities;
- exact approved executor binding.

This is defense in depth: a stale or compromised controller decision cannot override the current local resource policy.

## Historical Buzz / ESP32 boundary

Earlier Git history contains a HELIOS dispatcher that explicitly documented Buzz/JANUS swarm lineage. That history is not hidden or rewritten.

The current active snapshot removed the old Buzz-derived dispatcher, contract, documentation and invariant test and replaced them with the HELIOS-native desktop fabric/agent pair.

```text
ACTIVE HELIOS
src/helios-desktop-fabric.js
src/helios-desktop-agent.js

NOT ACTIVE
src/helios-swarm-dispatcher.js
.janus/HELIOS_SWARM_DISPATCHER.json
docs/SWARM_DISPATCHER.md
tests/swarm-dispatcher-invariants.test.mjs
```

The buyer DD preflight fails if those historical Buzz-derived paths are silently reintroduced as active implementation.

Historical MIT rights in the separate `janus-distributed-ai-swarm` repository are not falsely represented as retroactively revoked. At the same time, the current HELIOS execution plane has no active code dependency on that separate repository or Buzz ESP32 firmware.

See [`legal/BACKGROUND_IP_AND_PROVENANCE.md`](legal/BACKGROUND_IP_AND_PROVENANCE.md).

## Ecosystem

```text
JANUS HELIOS
   universal configurable parent
          │
          ├── DIVINE_REALM
          │     fixed SCIENCE / PUBLIC-GOOD child
          │
          └── SSlot
                fixed TREASURY / SHARED POOL child
```

HELIOS is the universal buyer-facing parent. SSlot and DIVINE_REALM remain specialized children and are excluded from a HELIOS-only transaction unless explicitly listed and priced.

## Hard boundaries

```text
compute -> RNG                       FORBIDDEN
compute -> RTP                       FORBIDDEN
compute -> win/bonus probability     FORBIDDEN
compute -> bet size                  FORBIDDEN
compute -> personal jackpot weight   FORBIDDEN
spin frequency -> compute rate       FORBIDDEN
browser -> provider private secret   FORBIDDEN
unverified receipt -> ledger value   FORBIDDEN
controller -> wider local PC limits  FORBIDDEN
generic remote shell in agent        FORBIDDEN
music -> RNG / RTP / payout          NONE
Lucky Contribution -> game odds      NONE
bonus session -> compute coupling     NONE
forced win / forced scatter          NONE
near-miss shaping                    NONE
simulated offers -> real-price claim FORBIDDEN
```

## Buyer due diligence / integrity

The repository contains a buyer-facing data room and reproducible checks rather than asking a buyer to trust prose.

Start here: [`docs/DATA_ROOM_INDEX.md`](docs/DATA_ROOM_INDEX.md).

`HELIOS Integrity` runs on repository pushes/PRs and checks, among other things:

- source syntax/public surface;
- configured invariant suite;
- high-confidence secret scan;
- declared dependency SBOM;
- buyer due-diligence preflight;
- strict closing manifest generation;
- buyer-integrity artifact upload.

A green CI run applies to the exact tested commit only. It is **not** a gambling certificate, security audit, legal opinion, production-readiness certificate or profitability proof.

The closing process still requires an exact final snapshot, external SBOM/licence review as agreed, transaction counsel, security/privacy review as required, provider/pilot evidence and a signed definitive agreement.

## Current implementation

- [`index.html`](index.html) — live responsive Pages surface;
- [`helios.js`](helios.js) — demo game core, cascades, routing and Spin Energy;
- [`helios-polish.js`](helios-polish.js) — presentation observer layer;
- [`helios-bonus.js`](helios-bonus.js) — natural Corona + tiered purchased Solar Free Spins;
- [`helios-bonus-confirm.js`](helios-bonus-confirm.js) — tier selection, price review and authorization;
- [`helios-slot-ux.js`](helios-slot-ux.js) — BET stepper, Game Guide and Win Focus;
- [`helios-music.js`](helios-music.js) — procedural soundtrack v3.1;
- [`helios-lucky.js`](helios-lucky.js) — rare contribution recognition;
- [`helios-profile.js`](helios-profile.js) — profile and simulated offer board;
- [`helios-mobile.js`](helios-mobile.js) — mobile presentation layer;
- [`src/helios-router.js`](src/helios-router.js) — route/workload authority boundary;
- [`src/helios-desktop-fabric.js`](src/helios-desktop-fabric.js) — desktop scheduler/coordination core v2.1;
- [`src/helios-desktop-agent.js`](src/helios-desktop-agent.js) — local desktop runtime v1.1;
- [`config/helios.public.json`](config/helios.public.json) — public buyer-facing configuration;
- [`.janus/HELIOS_DESKTOP_FABRIC.json`](.janus/HELIOS_DESKTOP_FABRIC.json) — active compute-plane contract;
- [`.janus/HELIOS_ARCHITECTURE.json`](.janus/HELIOS_ARCHITECTURE.json) — canonical architecture;
- [`PROJECT_STATUS.json`](PROJECT_STATUS.json) — maturity, evidence and open gates.

Project package version: `1.15.0`.

## Production gates remain explicit

HELIOS is not marked production-ready. Important open gates include:

- real provider adapter;
- authenticated production desktop-agent transport;
- durable multi-host coordinator state;
- authoritative provider receipt verification + anti-replay;
- real thermal/energy telemetry validation;
- live provider offer API;
- first-class BONUS core source;
- independent security/privacy/legal review;
- non-money pilot with measured device-hours, watt-hours, failure rates and unit economics;
- branch protection / equivalent closing change control;
- signed closing snapshot/transaction documents.

## Licensing

This repository is source-available for evaluation. Production, commercial, OEM, white-label, hosted, casino/platform or other commercial use requires a separate written agreement.

- [`LICENSE.md`](LICENSE.md)
- [`IP_NOTICE.md`](IP_NOTICE.md)
- [`THIRD_PARTY_NOTICES.md`](THIRD_PARTY_NOTICES.md)
- [`legal/BACKGROUND_IP_AND_PROVENANCE.md`](legal/BACKGROUND_IP_AND_PROVENANCE.md)

> **ONE CORE. ANY DESTINATION.**
