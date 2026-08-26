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
- GRIDJACK `DEMO SPIN ENERGY` bank;
- event-generated cosmic WebAudio soundtrack;
- independent `SPIN` and `ROUTE POWER` controls;
- explicit compute consent, CPU cap and immediate revoke;
- six replaceable compute route classes;
- route arming feedback and simulated receipts.

No real-money gambling or real provider workload is performed by the public page.

## Cascade engine

HELIOS now uses an actual post-win tumble loop:

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

## Solar Corona

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

The Solar Corona is demo-only and has no compute or route effect.

## Cosmic procedural soundtrack

HELIOS does not need a prerecorded background track. `helios-music.js` generates the soundtrack locally with WebAudio after the user explicitly enables `COSMIC AUDIO`.

```text
GAME MODE ───────┐
SPIN START ──────┤
PAID CASCADE ────┤
SOLAR CORONA ────┤
SPIN ENERGY ─────┤ → COSMIC EVENT REACTOR → SYNTH TRANSPORT → LIVE AUDIO
ROUTE CHANGE ────┤
COMPUTE STATE ───┘
```

Default tonal identities:

```text
HELIOS   → D Lydian Orbit      · 66 BPM
DIVINE   → A Lydian Aether     · 60 BPM
GRIDJACK → E Dorian Pulse      · 78 BPM
CUSTOM   → C# Void Minor       · 70 BPM
```

The architecture is inspired by the separation-of-responsibilities pattern in [`BitMaker-hub/NerdMiner_v2`](https://github.com/BitMaker-hub/NerdMiner_v2): independent monitor/network/mining tasks inform the idea of keeping HELIOS audio transport, event reaction, slot logic and compute routing separate. **No NerdMiner source code is copied.**

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
```

Compute is OFF by default, requires explicit opt-in and supports immediate revocation. Audio is OFF by default and requires a user gesture.

## Current implementation

- [`index.html`](index.html) — live public HELIOS surface;
- [`helios.js`](helios.js) — game core, cascades, multiplier ladder, route arming and Spin Energy;
- [`helios-polish.js`](helios-polish.js) — observer/presentation layer;
- [`helios-bonus.js`](helios-bonus.js) — Solar Corona feature;
- [`helios-music.js`](helios-music.js) — event-driven cosmic procedural WebAudio engine;
- [`config/helios.public.json`](config/helios.public.json) — public buyer-facing configuration;
- [`docs/COSMIC_SYNTH_ENGINE.md`](docs/COSMIC_SYNTH_ENGINE.md) — audio architecture and NerdMiner inspiration boundary;
- [`src/helios-router.js`](src/helios-router.js) — provider-agnostic routing core;
- [`tests/cascade-energy-invariants.test.mjs`](tests/cascade-energy-invariants.test.mjs) — cascade/Spin Energy invariants;
- [`tests/cosmic-music-invariants.test.mjs`](tests/cosmic-music-invariants.test.mjs) — procedural-audio invariants;
- [`.janus/HELIOS_ARCHITECTURE.json`](.janus/HELIOS_ARCHITECTURE.json) — canonical architecture;
- [`PROJECT_STATUS.json`](PROJECT_STATUS.json) — maturity and open gates.

`helios.js` v1.6.0 has passed a local Node syntax check for the exact committed core blob. The newly added `helios-music.js` and the complete repository test suite are **not** claimed green until a real runner/CI execution records that result.

## Licensing

This repository is **source-available for evaluation, not open source**. Production, commercial, OEM, white-label, hosted, casino/platform or other commercial use requires a separate written agreement.

- [`LICENSE.md`](LICENSE.md)
- [`IP_NOTICE.md`](IP_NOTICE.md)

## Motto

> **ONE CORE. ANY DESTINATION.**
