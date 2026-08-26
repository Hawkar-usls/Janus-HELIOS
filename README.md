<div align="center">

# JANUS HELIOS
### One Core. Any Destination.

![Status](https://img.shields.io/badge/status-active%20public%20prototype-2ea043)
![Class](https://img.shields.io/badge/class-universal%20compute%20routing%20slot-8250df)
![License](https://img.shields.io/badge/license-source--available%20evaluation-d29922)
![Real Money](https://img.shields.io/badge/real--money-disabled-b62324)

</div>

## What HELIOS is

**JANUS HELIOS is the universal configurable parent asset of a three-repository slot/compute ecosystem.**

It is web-first and does not require Telegram. The game surface is one face; behind it is an independent explicit-consent compute router whose destination can be replaced without rewriting slot mathematics.

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

The page demonstrates:

- a HELIOS-specific 5×3 slot interface;
- a visible central compute core;
- independent `SPIN` and `ROUTE POWER` controls;
- explicit opt-in, CPU cap and immediate revoke;
- six replaceable route classes;
- simulated receipts;
- neutral staggered reel physics with real visual momentum and reel-by-reel landings;
- fixed spin-stop timing that does **not** depend on outcome, near-miss state, compute route or wagering history.

No real-money gambling or real provider workload is performed by the public page.

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

- [`DIVINE_REALM`](https://github.com/Hawkar-usls/DIVINE_REALM) keeps the research/public-good product identity.
- [`SSlot`](https://github.com/Hawkar-usls/SSlot) keeps the shared mining-pool / Compute Treasury / jackpot identity.
- HELIOS alone is the buyer-facing universal redirectable station.

Canonical machine-readable family contract: [`.janus/HELIOS_ECOSYSTEM.json`](.janus/HELIOS_ECOSYSTEM.json).

## Reference routes

| Route | Example use | Task class | Default sink |
|---|---|---|---|
| Science | research / public-good Requestor | `SCIENCE_WORK_UNIT` | `IMPACT_LEDGER` |
| Shared Jackpot Pool | mining / verified pool revenue | `POW_SHARE` / economic compute | `COMPUTE_TREASURY` |
| Compute Marketplace | Golem or another market | `ECONOMIC_COMPUTE_JOB` | player compute value + treasury |
| Data Center | batch / render / analytics / HPC | `GENERAL_COMPUTE_JOB` | audited contract sink |
| Operator | buyer-owned approved workload | `GENERAL_COMPUTE_JOB` | audited contract sink |
| Custom | future provider unknown today | `GENERAL_COMPUTE_JOB` | audited contract sink |

See [`providers/REFERENCE_ROUTES.json`](providers/REFERENCE_ROUTES.json).

## Why `GENERAL_COMPUTE_JOB` exists

HELIOS must not force an unknown future workload to pretend it is science, mining or a crypto market. `GENERAL_COMPUTE_JOB` is the neutral container for admissible rendering, analytics, simulation, astronomy pipelines, internal batch work, data-center jobs or future provider classes.

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
compute -> free spins              FORBIDDEN
compute -> personal jackpot weight FORBIDDEN
spin frequency -> compute rate     FORBIDDEN
browser -> provider private secret FORBIDDEN
unverified receipt -> ledger value FORBIDDEN
```

Compute is OFF by default, requires explicit opt-in and must support immediate revocation.

## Current implementation

- [`index.html`](index.html) — web-first live public slot demo;
- [`helios.js`](helios.js) — public controller with neutral cascading reel animation;
- [`config/helios.public.json`](config/helios.public.json) — buyer-facing public configuration;
- [`src/helios-router.js`](src/helios-router.js) — provider-agnostic routing core;
- [`tests/helios-router.test.mjs`](tests/helios-router.test.mjs) — routing invariants;
- [`.janus/HELIOS_ARCHITECTURE.json`](.janus/HELIOS_ARCHITECTURE.json) — architecture;
- [`.janus/HELIOS_ECOSYSTEM.json`](.janus/HELIOS_ECOSYSTEM.json) — ecosystem contract;
- [`BUYER_HANDOFF_SPEC.json`](BUYER_HANDOFF_SPEC.json) — buyer configuration boundary;
- [`PROJECT_STATUS.json`](PROJECT_STATUS.json) — maturity and open gates.

The router test suite exists but is not claimed green until a real runner/CI result records that state.

## Production reality

HELIOS is an architecture and public evaluation prototype. Each real provider still needs compatibility/admission review for CPU/GPU/runtime, network/data volume, privacy, verification, abuse/security, energy/thermal policy, settlement/accounting and jurisdiction/platform constraints.

These constraints belong to the **provider adapter**, not to the HELIOS identity.

## Licensing

This repository is **source-available for evaluation, not open source**. Production, commercial, OEM, white-label, platform, hosted or other commercial use requires a separate written agreement.

- [`LICENSE.md`](LICENSE.md)
- [`IP_NOTICE.md`](IP_NOTICE.md)

## Motto

> **ONE CORE. ANY DESTINATION.**