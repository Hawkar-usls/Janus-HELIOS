<div align="center">

# JANUS HELIOS
### One Core. Any Destination.

![Status](https://img.shields.io/badge/status-active%20public%20prototype-2ea043)
![Class](https://img.shields.io/badge/class-gameplay%20%2B%20compute%20routing-8250df)
![Version](https://img.shields.io/badge/version-1.10.0-d29922)
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
AUTHORITATIVE RECEIPT
      ↓
MEASURABLE EXTERNAL RESULT
```

Public demo: https://hawkar-usls.github.io/Janus-HELIOS/

## Current demo surface

HELIOS currently demonstrates:

- 5×3 cosmic slot surface;
- `HELIOS / DIVINE / GRIDJACK / CUSTOM` game profiles;
- tumble cascades with `x1 → x4 → x16 → x64`;
- `SOLAR CORONA BONUS`;
- demo-only `BUY SOLAR CORONA` capability;
- GRIDJACK `DEMO SPIN ENERGY`;
- route arming and explicit compute consent;
- six replaceable compute route classes;
- simulated compute receipts;
- mode + route + event + session-seeded procedural music;
- rare `LUCKY HASH / IMPACT HIT / GOLDEN TASK` contribution recognition;
- `MY HELIOS` miner/operator profile with history, statistics, notifications and a simulated real-time offer board.

No real-money gambling and no real production provider workload are performed by the public page.

## MY HELIOS — miner/operator profile

`helios-profile.js` turns the demo into more than a slot presentation. It previews the user-facing compute account that a real deployment could expose.

```text
MY HELIOS
├── OVERVIEW
│   ├── compute units
│   ├── demo personal value
│   ├── external value / impact
│   └── Lucky Contributions
├── WORK HISTORY
│   ├── when the device worked
│   ├── route / workload
│   ├── receipt id
│   └── demo accounting
├── LIVE OFFERS
│   └── simulated marketplace / pool / research / operator opportunities
└── NOTIFICATIONS
    ├── Lucky Hash / Impact Hit / Golden Task
    └── Spin Energy events
```

The public profile uses browser-local demo storage. Its offer cards refresh every 15 seconds to demonstrate marketplace behavior, but they are **not current NiceHash, Golem, cloud or pool prices**.

Production requirements:

```text
real offer board      → live provider API
real earnings history → authoritative receipts + settlement
real impact history   → authoritative research acceptance
```

## Lucky Contribution

Rare valuable compute contributions belong to the user's compute identity, not to normal reel presentation.

```text
MARKETPLACE / TREASURY → LUCKY HASH
SCIENCE / PUBLIC GOOD  → IMPACT HIT
DC / OPERATOR / CUSTOM → GOLDEN TASK
```

The automatic public-demo rate is intentionally very low: `0.5%` per simulated receipt. The profile contains a separate showcase trigger so a buyer can inspect the feature without making the normal event common.

Production semantics are different: **browser probability is not the authority**.

```text
provider / research result
        ↓
authoritative receipt
        ↓
significance verifier
        ↓
Lucky Contribution recognition
```

Lucky Contribution has no authority over RNG, RTP, bonus probability, bet size or personal jackpot weight.

## Cosmic procedural soundtrack v3

`helios-music.js` generates music locally with WebAudio rather than playing a prerecorded song.

```text
GAME MODE
+ COMPUTE ROUTE
+ SESSION SEED
+ LIVE EVENTS
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

Route selection changes arrangement character, while cascades, Solar Corona, Bonus Buy, Spin Energy, Lucky Contribution and compute state reshape tempo, density, register and fills over the already-running composition.

The music engine never reads loss streak, near-miss state, wagering history, player vulnerability or bet size.

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

Multiplier ladder:

```text
x1 → x4 → x16 → x64
```

Compute state, route and receipts are not inputs to cascade RNG.

## Demo Spin Energy

In GRIDJACK, any configured active compute route can accumulate separate demo-only Spin Energy while explicit consent remains active.

```text
30 s eligible demo compute → +1 Energy Spin
bank max 3
```

It has no cash value, no cashout, no automatic wagering conversion and no bank autoplay. A production compute-to-real-money-free-spin loop is disabled by default pending separate legal and responsible-gaming review.

## Compute architecture

```text
EXPLICIT CONSENT
      ↓
DEVICE RESOURCE POLICY
      ↓
HELIOS ROUTER
      ↓
ProviderManifest
      ↓
Adapter
      ↓
Approved workload
      ↓
Authoritative Receipt Verifier
      ↓
Audited Value / Impact Sink
```

Reference destinations include science/public-good work, shared treasury/pool work, compute marketplaces, data-center workloads, buyer-owned operator workloads and custom providers.

The standalone router foundation lives in [`src/helios-router.js`](src/helios-router.js).

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

HELIOS is the universal buyer-facing parent. SSlot and DIVINE_REALM remain specialized children and provide feature ideas that may be generalized into the parent without erasing their identities.

## Hard boundaries

```text
compute -> RNG                     FORBIDDEN
compute -> RTP                     FORBIDDEN
compute -> win probability         FORBIDDEN
compute -> bet size                FORBIDDEN
compute -> personal jackpot weight FORBIDDEN
spin frequency -> compute rate     FORBIDDEN
browser -> provider private secret FORBIDDEN
unverified receipt -> ledger value FORBIDDEN
music -> RNG / RTP / payout        NONE
Lucky Contribution -> game odds    NONE
simulated offers -> real-price claim FORBIDDEN
```

Compute is OFF by default, requires explicit opt-in and supports immediate revocation.

## Current implementation

- [`index.html`](index.html) — live Pages surface;
- [`helios.js`](helios.js) — game core, cascades, routing and Spin Energy;
- [`helios-polish.js`](helios-polish.js) — presentation observer layer;
- [`helios-bonus.js`](helios-bonus.js) — Solar Corona + demo Bonus Buy;
- [`helios-music.js`](helios-music.js) — procedural music v3;
- [`helios-lucky.js`](helios-lucky.js) — rare contribution recognition;
- [`helios-profile.js`](helios-profile.js) — miner/operator profile and simulated offer board;
- [`config/helios.public.json`](config/helios.public.json) — buyer-facing public configuration;
- [`.janus/HELIOS_ARCHITECTURE.json`](.janus/HELIOS_ARCHITECTURE.json) — canonical architecture;
- [`PROJECT_STATUS.json`](PROJECT_STATUS.json) — maturity and open gates.

Project package version: `1.10.0`.

The repository contains invariant tests for routing, public surface, polish, Solar Corona, cascades/Spin Energy, cosmic music, Lucky Contribution and the profile dashboard. The full current suite is **not claimed green** until a real runner/CI execution records it.

## Partner direction

A future provider/pool pitch should present HELIOS as an interaction layer for explicit-opt-in compute plus transparent history/receipts — not as a promise of guaranteed profitability.

NiceHash is a planned outreach target **after** the miner profile, rare Lucky flow and offer-board demo are manually validated and the provider-adapter/receipt proposal is ready. Current NiceHash contacts/APIs should be researched again at send time rather than frozen now.

## Licensing

This repository is source-available for evaluation. Production, commercial, OEM, white-label, hosted, casino/platform or other commercial use requires a separate written agreement.

- [`LICENSE.md`](LICENSE.md)
- [`IP_NOTICE.md`](IP_NOTICE.md)

> **ONE CORE. ANY DESTINATION.**
