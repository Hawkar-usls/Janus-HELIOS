<div align="center">

# JANUS HELIOS
### One Core. Any Destination.

![Status](https://img.shields.io/badge/status-active%20public%20prototype-2ea043)
![Class](https://img.shields.io/badge/class-gameplay%20%2B%20compute%20routing-8250df)
![Version](https://img.shields.io/badge/version-1.14.0-d29922)
![Mobile](https://img.shields.io/badge/mobile-iPhone%20%2F%20Android-1f8fbc)
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

## Commercial thesis & sponsor validation

HELIOS is designed around **two independent value loops**:

```text
LOOP A — GAMEPLAY VALUE
player activity → game/operator economics

LOOP B — EXTERNAL COMPUTE VALUE
opted-in idle resource → approved workload → authoritative receipt → measurable value / impact
```

The product does **not** claim to have invented slots, mining, idle-compute marketplaces or distributed computing. Its innovation is the combination: a reusable game-shaped entry point, explicit resource consent, replaceable compute destinations, provider-independent receipts/history, and strict separation between compute economics and game mathematics.

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

The public Pages build proves the **interaction architecture**, not production profitability. HELIOS cannot honestly validate real commercial returns without a sponsor, operator, compute provider, research partner or enterprise workload buyer willing to provide a real workload and authoritative settlement/receipt path.

A credible pilot is:

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

Until such a pilot exists, HELIOS economics are described as **modelled and testable, not production-validated**.

### Compute-funded engagement rewards

The current public demo already contains a capped non-cash reward primitive: `Spin Energy`.

```text
eligible active demo compute
        ↓
30 seconds
        ↓
+1 DEMO ENERGY SPIN
        ↓
manual use only
bank cap = 3
```

This demonstrates how verified external work can fund **separate reward inventory** rather than every incentive being paid only from an operator marketing budget. A future compliant deployment could extend the same accounting idea to capped daily-style non-cash rewards, loyalty points, compute credits, cosmetics, fee rebates or other non-wagering benefits.

HELIOS must **not** target people with gambling problems or inferred vulnerability. No loss-streak targeting, near-miss targeting, forced autoplay or automatic compute-value-to-wager conversion is part of the product boundary; responsible-gaming limits remain authoritative.

Full commercial model, illustrative unit economics, electricity-aware break-even logic and sponsor gate: [`docs/COMMERCIAL_THESIS.md`](docs/COMMERCIAL_THESIS.md).

Machine-readable JANUS contract: [`.janus/HELIOS_COMMERCIAL_THESIS.json`](.janus/HELIOS_COMMERCIAL_THESIS.json).

## Current demo surface

HELIOS currently demonstrates:

- responsive 5×3 cosmic slot surface;
- `HELIOS / DIVINE / GRIDJACK / CUSTOM` profiles;
- tumble cascades with `x1 → x4 → x16 → x64`;
- natural `SOLAR CORONA` wheel from 3+ suns;
- **tiered purchased `SOLAR FREE SPINS` bonus sessions**;
- explicit per-purchase price review and consent;
- GRIDJACK `DEMO SPIN ENERGY`;
- mode + route + event + bonus-session generative WebAudio;
- six replaceable compute routes with explicit consent/revoke;
- rare `LUCKY HASH / IMPACT HIT / GOLDEN TASK` recognition;
- `MY HELIOS` miner/operator profile with history, notifications and simulated live offers;
- iPhone/Android mobile showcase support.

No real-money gambling and no real production provider workload are performed by the public page.

## Solar feature family

HELIOS deliberately separates the natural Solar identity event from a purchased free-spins session.

### Natural Solar Corona

A normal HELIOS spin can land three or more `☀` symbols. That launches the eight-ray Solar Corona wheel:

```text
3+ ☀ ON SETTLED NORMAL GRID
          ↓
SOLAR CORONA WHEEL
          ↓
x2 / x3 / x4 / x5 / x8 / x10 / x16 / x25
          ↓
SOLAR_BONUS_BANK
```

This is a natural identity event and is independent from compute routing.

### Purchased Solar Free Spins — tiered demo flow

The purchase path is now explicit and event-driven:

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

The public demo exposes three tiers:

| Tier | Demo cost | Starting spins | 3+ ☀ retrigger | Max spins |
|---|---:|---:|---:|---:|
| Standard Corona | `50× BET` | 10 | +2 | 16 |
| Radiant Corona | `100× BET` | 12 | +2 | 20 |
| Solar Flare | `175× BET` | 15 | +3 | 24 |

Higher tiers buy **more free-spin opportunities and a larger disclosed natural-sun retrigger budget**. They do not guarantee a win and do not use compute activity, player history, loss streaks or personalized outcome shaping.

The previous synthetic re-click bridge between the confirmation modal and bonus core was removed. `helios-bonus-confirm.js` now emits an authorization event, and `helios-bonus.js` independently validates the selected tier, current BET, exact price and available demo balance before anything is deducted.

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

Every purchased session still uses the normal HELIOS game RNG and cascade engine. The session HUD shows `SPINS LEFT`, `BONUS WIN` and the current event, and the free spins run automatically.

The public prototype currently bridges bonus spins into the existing core spin path and refunds each bonus stake in the presentation layer so the sequence behaves as free spins. A production implementation should promote `BONUS` into a first-class game-core spin source before regulated deployment.

```text
compute state / route / contribution → bonus RNG      NONE
Lucky Hash                          → bonus RNG      NONE
real-money feature buy              → disabled
```

A production real-money Feature Buy would require separate jurisdiction, platform, responsible-gaming and game-math review.

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

During Solar Free Spins the composition stays in a sustained higher-energy bonus state. Each bonus spin can mutate the motif/fills; retriggers and high cascade multipliers intensify the arrangement. The soundtrack still never reads bet size, loss streak, near-miss state, wagering history or inferred vulnerability.

The architecture is inspired by the independent-task separation principle observed in `BitMaker-hub/NerdMiner_v2`; **no NerdMiner source code is copied**.

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

In GRIDJACK, any configured active compute route can accumulate separate demo-only Spin Energy while explicit consent remains active.

```text
30 s eligible demo compute → +1 Energy Spin
bank max 3
```

It has no cash value, cashout, automatic wagering conversion or bank autoplay. A production compute-to-real-money-free-spin loop is disabled by default pending separate legal and responsible-gaming review.

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

The public profile uses local demo storage. Offer cards refresh every 15 seconds but are **not current NiceHash, Golem, cloud or pool prices**. Real offers require a live provider API; real earnings/impact require authoritative receipts and settlement/research acceptance.

## Lucky Contribution

```text
MARKETPLACE / TREASURY → LUCKY HASH
SCIENCE / PUBLIC GOOD  → IMPACT HIT
DC / OPERATOR / CUSTOM → GOLDEN TASK
```

The automatic public-demo rate is intentionally very low: `0.5%` per simulated receipt. Production recognition must come from an authoritative significance rule and receipt, never browser probability. Lucky Contribution cannot modify RNG, RTP, bonus probability, bet size or personal jackpot weight.

## Mobile showcase readiness

`helios-mobile.js` exists for the first-contact case where a partner opens the Pages link directly from an email on an iPhone or Android phone. It provides safe-area handling, `100dvh`, 44 px touch targets, narrow/landscape breakpoints, responsive 5×3 reels, mobile router controls, full-width `MY HELIOS`, and mobile-safe Solar/Free-Spins surfaces without changing game or compute logic.

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

HELIOS is the universal buyer-facing parent. SSlot and DIVINE_REALM remain specialized children and act as feature laboratories; safe, generalizable mechanisms can be promoted into HELIOS without copying their legacy outcome-shaping logic.

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
music -> RNG / RTP / payout          NONE
Lucky Contribution -> game odds      NONE
bonus session -> compute coupling     NONE
forced win / forced scatter          NONE
near-miss shaping                    NONE
simulated offers -> real-price claim FORBIDDEN
```

## Current implementation

- [`index.html`](index.html) — live responsive Pages surface;
- [`helios.js`](helios.js) — game core, cascades, routing and Spin Energy;
- [`helios-polish.js`](helios-polish.js) — presentation observer layer;
- [`helios-bonus.js`](helios-bonus.js) — natural Corona wheel + tiered purchased Solar Free Spins;
- [`helios-bonus-confirm.js`](helios-bonus-confirm.js) — tier selection, exact-price review and explicit per-purchase authorization;
- [`helios-slot-ux.js`](helios-slot-ux.js) — BET stepper, Game Guide, tiered bonus guide and Win Focus;
- [`helios-music.js`](helios-music.js) — procedural music v3.1 with bonus-session state;
- [`helios-lucky.js`](helios-lucky.js) — rare contribution recognition;
- [`helios-profile.js`](helios-profile.js) — miner/operator profile and simulated offer board;
- [`helios-mobile.js`](helios-mobile.js) — iPhone/Android showcase layer;
- [`config/helios.public.json`](config/helios.public.json) — buyer-facing public configuration;
- [`.janus/HELIOS_ARCHITECTURE.json`](.janus/HELIOS_ARCHITECTURE.json) — canonical architecture;
- [`PROJECT_STATUS.json`](PROJECT_STATUS.json) — maturity and open gates.

Project package version: `1.14.0`.

Invariant tests cover the event-driven purchase contract, explicit consent, tier definitions, free-spins loop, sun retrigger, total-spin caps and bonus-session music events. The complete current suite is still **not claimed green** until a real runner executes it.

## Partner direction

The pitch is not “another slot.” It is a configurable B2B gameplay + opt-in compute interaction layer capable of presenting verified external work, history and value/impact alongside a polished game experience.

NiceHash remains a planned outreach target only after the miner-facing demo and provider-adapter/receipt story are manually validated.

## Licensing

This repository is source-available for evaluation. Production, commercial, OEM, white-label, hosted, casino/platform or other commercial use requires a separate written agreement.

- [`LICENSE.md`](LICENSE.md)
- [`IP_NOTICE.md`](IP_NOTICE.md)

> **ONE CORE. ANY DESTINATION.**