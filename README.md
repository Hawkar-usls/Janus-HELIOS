<div align="center">

# JANUS HELIOS
### One Core. Any Destination.

![Status](https://img.shields.io/badge/status-active%20public%20prototype-2ea043)
![Class](https://img.shields.io/badge/class-amorphous%20compute%20routing%20slot-8250df)
![License](https://img.shields.io/badge/license-source--available%20evaluation-d29922)
![Real Money](https://img.shields.io/badge/real--money-disabled-b62324)

</div>

## What HELIOS is

**JANUS HELIOS is a configurable slot-shaped compute-routing asset.**

The game surface is only one face. Behind it is an independent, explicit-consent compute router whose destination can be replaced without rewriting the slot mathematics.

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

## Try the public demo

Open [`index.html`](index.html) through GitHub Pages once Pages is enabled for the repository.

The page is Telegram WebApp-compatible and demonstrates:

- a new HELIOS-themed manual slot interface;
- a visible central compute core;
- independent compute ON/OFF controls;
- explicit opt-in and CPU cap;
- route switching while compute is stopped;
- simulated receipts;
- six replaceable destination classes;
- strict visual separation between `SPIN` and `ROUTE POWER`.

No real-money gambling or real provider workload is performed by the public page.

## Reference routes

The first six HELIOS directions are deliberately heterogeneous:

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

HELIOS must not force an unknown future workload to pretend it is science, mining or a crypto market.

`GENERAL_COMPUTE_JOB` is the neutral container for admissible compute tasks such as rendering, analytics, simulation, astronomy pipelines, internal batch work, data-center jobs or a provider class that does not exist yet.

The adapter and verifier determine what a particular provider really supports.

## Product family

HELIOS is the configurable parent asset; the two existing projects stay specialized:

```text
JANUS HELIOS
   ├── DIVINE_REALM
   │     science / public-good default
   │
   └── SSlot
         shared mining-pool / jackpot default
```

- [`DIVINE_REALM`](https://github.com/Hawkar-usls/DIVINE_REALM) remains the research/public-good reference surface.
- [`SSlot`](https://github.com/Hawkar-usls/SSlot) remains the shared mining-pool / compute-treasury reference surface.

HELIOS is for a buyer who wants to redirect the station itself.

## The four replaceable production pieces

A new destination should require only:

```text
ProviderManifest
+ server/local-agent Adapter
+ authoritative Receipt Verifier
+ audited Sink Policy
```

—not a rewritten slot.

The standalone zero-dependency router foundation lives in [`src/helios-router.js`](src/helios-router.js).

## Hard boundaries

The compute layer is not allowed to acquire authority over the game layer:

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

- [`index.html`](index.html) — HELIOS GitHub Pages / Telegram-compatible public slot demo;
- [`src/helios-router.js`](src/helios-router.js) — provider-agnostic routing core;
- [`tests/helios-router.test.mjs`](tests/helios-router.test.mjs) — routing invariants;
- [`.janus/HELIOS_ARCHITECTURE.json`](.janus/HELIOS_ARCHITECTURE.json) — machine-readable architecture;
- [`providers/REFERENCE_ROUTES.json`](providers/REFERENCE_ROUTES.json) — reference route catalog;
- [`PARTNERSHIP_BRIEF.md`](PARTNERSHIP_BRIEF.md) — concise buyer model;
- [`PROJECT_STATUS.json`](PROJECT_STATUS.json) — current maturity and gates.

The test suite is present but should not be treated as executed/green until an actual runner or CI run records that result.

## Production reality

HELIOS is an architecture and public evaluation prototype, not a claim that arbitrary workloads can magically run on every device.

Each real provider still has to pass compatibility and admission gates for:

- CPU/GPU/runtime requirements;
- network and data volume;
- data sensitivity/privacy;
- result verification;
- abuse/security model;
- energy and thermal policy;
- settlement/accounting where applicable;
- jurisdiction/platform/regulatory constraints.

The important property is that these constraints belong to the **provider adapter**, not to the slot identity.

## Licensing

This repository is **source-available for evaluation, not open source**.

- [`LICENSE.md`](LICENSE.md)
- [`IP_NOTICE.md`](IP_NOTICE.md)

Production, commercial, OEM, white-label, platform, hosted or other commercial use requires a separate written agreement with the copyright holder.

## Motto

> **ONE CORE. ANY DESTINATION.**
>
> Fixed constructions are temporary; the routing fabric is designed to adapt.
