<div align="center">

# JANUS HELIOS
### One Core. Any Destination.

![Status](https://img.shields.io/badge/status-active%20public%20prototype-2ea043)
![Class](https://img.shields.io/badge/class-universal%20compute%20routing%20slot-8250df)
![License](https://img.shields.io/badge/license-source--available%20evaluation-d29922)
![Real Money](https://img.shields.io/badge/real--money-disabled-b62324)

</div>

## What HELIOS is

**JANUS HELIOS is the universal configurable parent asset of the JANUS slot/compute ecosystem.**

It is web-first and Telegram-independent. The slot is one surface; behind it is a separate explicit-consent compute router whose destination can be replaced without rewriting the game core.

```text
PLAYER / DEVICE
      ↓
explicit opt-in + resource policy
      ↓
JANUS HELIOS ROUTER
      ↓
Provider Manifest + Adapter + Verifier
      ↓
approved workload
      ↓
authoritative receipt
      ↓
audited impact / value sink
```

The buyer decides where the compute stream goes.

## Product thesis

HELIOS is not intended to be sold as “another slot.” The intended B2B proposition is a configurable gameplay + compute-routing technology class: a game surface can coexist with an opt-in compute layer that produces a measurable external result when authoritative provider/research receipts exist.

```text
GAMEPLAY SURFACE
      || independent authority boundary
OPT-IN COMPUTE ROUTER
      ↓
MARKET / SCIENCE / TREASURY / DATA CENTER / OPERATOR / CUSTOM
      ↓
VERIFIABLE EXTERNAL RESULT
```

## Live public demo

**GitHub Pages:** https://hawkar-usls.github.io/Janus-HELIOS/

The current public surface includes:

- HELIOS-specific 5×3 slot interface;
- native CSS cosmic / solar-station background;
- `HELIOS / DIVINE / GRIDJACK / CUSTOM` game profiles;
- persistent `LAST PAID WIN`, `TOTAL WINS`, `TOTAL SPINS`;
- custom dark BET picker;
- bounded `AUTO ×10`;
- real tumble/cascade flow after paid wins;
- cascade multiplier ladder `x1 → x4 → x16 → x64`;
- `SOLAR CORONA BONUS` in HELIOS mode;
- public-demo `BUY SOLAR CORONA` capability;
- GRIDJACK `DEMO SPIN ENERGY` bank;
- `LUCKY HASH / IMPACT HIT / GOLDEN TASK` contribution-recognition demo;
- mode + route + event + session-seeded cosmic generative WebAudio soundtrack;
- independent `SPIN` and `ROUTE POWER` controls;
- explicit compute consent, CPU cap and immediate revoke;
- six replaceable compute route classes;
- route arming feedback and simulated receipts.

No real-money gambling or real provider workload is performed by the public page.

## Cascade engine

HELIOS uses an actual post-win tumble loop:

```text
paid line
   ↓
highlight paid cells
   ↓
remove paid symbols
   ↓
survivors fall
   ↓
new random symbols enter from above
   ↓
re-evaluate
   ↓
if another win → next multiplier
```

Multiplier ladder:

```text
1st paid cascade → x1
2nd paid cascade → x4
3rd paid cascade → x16
4th+ paid cascade → x64
```

The full cascade chain is included in the spin's demo payout and therefore in `LAST PAID WIN`.

The cascade engine does **not** read compute route, compute units, provider receipt or compute contribution when generating game outcomes.

## Demo Spin Energy

GRIDJACK can accumulate separate demo-only spin entitlements while **any configured HELIOS compute route** is actively streaming with explicit consent:

```text
GRIDJACK
   +
MARKET / SCIENCE / JACKPOT / DATA CENTER / OPERATOR / CUSTOM
   +
explicit consent + ROUTE POWER
            ↓
      active compute timer
            ↓
       every 30 seconds
            ↓
      +1 DEMO SPIN ENERGY
            ↓
          bank max 3
```

This is deliberately a public-demo mechanic:

```text
Spin Energy -> cashout                       FORBIDDEN
Spin Energy -> automatic wagering balance   FORBIDDEN
Spin Energy bank -> autoplay                 FORBIDDEN
compute -> production real-money free spin  FORBIDDEN BY DEFAULT
```

## Solar Corona + demo Bonus Buy

HELIOS mode has its own identity feature:

```text
3+ ☀ on settled HELIOS grid
        ↓
SOLAR CORONA BONUS
        ↓
8-ray multiplier wheel
        ↓
SOLAR_BONUS_BANK
```

The same feature can also be entered from the public `BUY SOLAR CORONA` capability demo. The demo uses presentation-only units and a configurable `50× BET` display cost. It does **not** enable a production real-money feature-buy product.

```text
PUBLIC DEMO BONUS BUY → allowed capability demo
REAL-MONEY FEATURE BUY → disabled pending separate regulatory / platform / responsible-gaming / game-math review
```

## Lucky Contribution

HELIOS now has a route-aware contribution-recognition layer in [`helios-lucky.js`](helios-lucky.js).

Public demo semantics:

```text
MARKETPLACE / TREASURY → LUCKY HASH
SCIENCE / PUBLIC GOOD  → IMPACT HIT
DC / OPERATOR / CUSTOM → GOLDEN TASK
```

The public page simulates these events from simulated receipts for presentation only. A production reward may only originate from an authoritative provider/research verifier receipt.

```text
Lucky Contribution -> RNG                     NONE
Lucky Contribution -> RTP                     NONE
Lucky Contribution -> bonus probability       NONE
Lucky Contribution -> personal jackpot weight NONE
```

The recognition event may trigger visuals and a musical climax without changing game mathematics.

## Cosmic procedural soundtrack v3

HELIOS does not need a prerecorded background track. `helios-music.js` generates a continuous soundtrack locally with WebAudio after the user explicitly enables `COSMIC AUDIO`.

```text
GAME MODE ───────┐
COMPUTE ROUTE ───┤
SESSION SEED ────┤
GAME/UI EVENTS ──┤
                 ▼
       LIVE MODE + ROUTE + EVENT REACTOR
                 ↓
             16-STEP MUSIC
```

Mode tonal identities:

```text
HELIOS   → D Lydian Orbit      · 66 BPM base
DIVINE   → A Lydian Aether     · 60 BPM base
GRIDJACK → E Dorian Pulse      · 78 BPM base
CUSTOM   → C# Void Minor       · 70 BPM base
```

Route identities then reshape that mode:

```text
MARKET   → brighter exchange arp / +4 BPM
SCIENCE  → airy starfield / -2 BPM
TREASURY → heavy bass/pulse / +8 BPM
DC       → machine clock / +2 BPM
OPERATOR → dense engine link / +5 BPM
CUSTOM   → buyer-configurable void profile
```

Events reshape the already-running composition:

```text
CASCADE x1  → temporary +3 BPM
CASCADE x4  → temporary +7 BPM
CASCADE x16 → temporary +12 BPM
CASCADE x64 → temporary +18 BPM
SOLAR CORONA → multi-bar +18 BPM climax
LUCKY CONTRIBUTION → multi-bar +12 BPM celebration
DEMO BONUS BUY → +10 BPM transition layer
COMPUTE ACTIVE → route-specific low engine drone
```

Each browser session receives a random session seed, so optional rhythm placements, arp mutations and starfield notes vary without reading bet size or player vulnerability.

The architecture is inspired by the separation-of-responsibilities pattern in [`BitMaker-hub/NerdMiner_v2`](https://github.com/BitMaker-hub/NerdMiner_v2). **No NerdMiner source code is copied.**

The soundtrack is presentation-only. It must not adapt to bet size, loss streaks, near-miss state, wagering history or inferred player vulnerability, and it has no authority over RNG, RTP, payout or compute routing.

See [`docs/COSMIC_SYNTH_ENGINE.md`](docs/COSMIC_SYNTH_ENGINE.md).

## Ecosystem

```text
JANUS HELIOS
   universal route-switchable parent
          │
          ├── DIVINE_REALM
          │     fixed SCIENCE / PUBLIC-GOOD child
          │
          └── SSlot
                fixed SHARED MINING-POOL / JACKPOT child
```

- [`DIVINE_REALM`](https://github.com/Hawkar-usls/DIVINE_REALM) remains the research/public-good specialization.
- [`SSlot`](https://github.com/Hawkar-usls/SSlot) remains the shared mining-pool / Compute Treasury / jackpot specialization.
- HELIOS is the configurable buyer-facing parent asset.

Canonical family contract: [`.janus/HELIOS_ECOSYSTEM.json`](.janus/HELIOS_ECOSYSTEM.json).

## Reference compute routes

| Route | Example use | Task class | Default sink |
|---|---|---|---|
| Science | research / public-good Requestor | `SCIENCE_WORK_UNIT` | `IMPACT_LEDGER` |
| Shared Jackpot Pool | mining / verified pool revenue | `POW_SHARE` / economic compute | `COMPUTE_TREASURY` |
| Compute Marketplace | Golem or another approved market | `ECONOMIC_COMPUTE_JOB` | player compute value + treasury |
| Data Center | batch / render / analytics / HPC | `GENERAL_COMPUTE_JOB` | audited contract sink |
| Operator | buyer-owned approved workload | `GENERAL_COMPUTE_JOB` | audited contract sink |
| Custom | future provider unknown today | `GENERAL_COMPUTE_JOB` | audited contract sink |

## Replaceable production pieces

```text
ProviderManifest
+ server/local-agent Adapter
+ authoritative Receipt Verifier
+ audited Sink Policy
```

—not a rewritten slot.

The standalone router foundation lives in [`src/helios-router.js`](src/helios-router.js).

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
music -> player-vulnerability loop FORBIDDEN
Lucky Contribution -> game odds    NONE
```

Compute is OFF by default, requires explicit opt-in and supports immediate revocation. Audio is OFF by default and requires a user gesture.

## Current implementation

- [`index.html`](index.html) — live public HELIOS surface;
- [`helios.js`](helios.js) — game core, cascades, multiplier ladder, route arming and Spin Energy;
- [`helios-polish.js`](helios-polish.js) — observer/presentation layer;
- [`helios-bonus.js`](helios-bonus.js) — Solar Corona + demo Bonus Buy capability;
- [`helios-music.js`](helios-music.js) — mode + route + event generative WebAudio v3;
- [`helios-lucky.js`](helios-lucky.js) — Lucky Contribution recognition layer;
- [`config/helios.public.json`](config/helios.public.json) — public buyer-facing configuration;
- [`docs/COSMIC_SYNTH_ENGINE.md`](docs/COSMIC_SYNTH_ENGINE.md) — audio architecture;
- [`src/helios-router.js`](src/helios-router.js) — provider-agnostic routing core;
- [`tests/cascade-energy-invariants.test.mjs`](tests/cascade-energy-invariants.test.mjs) — cascade/Spin Energy invariants;
- [`tests/cosmic-music-invariants.test.mjs`](tests/cosmic-music-invariants.test.mjs) — procedural-audio invariants;
- [`tests/lucky-contribution-invariants.test.mjs`](tests/lucky-contribution-invariants.test.mjs) — contribution-recognition invariants;
- [`.janus/HELIOS_ARCHITECTURE.json`](.janus/HELIOS_ARCHITECTURE.json) — canonical architecture;
- [`PROJECT_STATUS.json`](PROJECT_STATUS.json) — maturity and open gates.

Project package version is `1.9.0`. The earlier HELIOS core blob passed its local Node syntax check. The newly changed music v3 / Lucky Contribution / Bonus Buy layers and the complete repository test suite are **not** claimed green until a real runner/CI execution records that result and the live Pages behavior is manually rechecked.

## Licensing

This repository is **source-available for evaluation, not open source**. Production, commercial, OEM, white-label, hosted, casino/platform or other commercial use requires a separate written agreement.

- [`LICENSE.md`](LICENSE.md)
- [`IP_NOTICE.md`](IP_NOTICE.md)

## Motto

> **ONE CORE. ANY DESTINATION.**
