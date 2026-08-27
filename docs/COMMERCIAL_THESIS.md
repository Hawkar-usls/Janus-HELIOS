# JANUS HELIOS — Commercial Thesis & Sponsor Validation Gate

## Executive proposition

**JANUS HELIOS is not positioned as another slot theme.**

It is a configurable B2B interaction layer in which a polished game surface can coexist with a separately controlled, explicit-opt-in compute layer. A consenting user may contribute a bounded amount of otherwise idle device capacity to an approved workload, while HELIOS keeps game mathematics and compute economics strictly separated.

```text
PLAYER
  ├── GAMEPLAY → RNG / RTP / BONUS MATH
  │                 ⟂
  └── OPT-IN COMPUTE → APPROVED WORKLOAD → AUTHORITATIVE RECEIPT → EXTERNAL VALUE
```

The commercial thesis is therefore based on **two independent value loops**:

```text
LOOP A — GAMEPLAY VALUE
player activity → game/operator economics

LOOP B — EXTERNAL COMPUTE VALUE
idle resource → verified workload → measurable value / impact
```

The second loop does not need to alter odds, RTP, stake, bonus probability or personal jackpot weighting to be useful.

---

## What is innovative about HELIOS

HELIOS does not claim to have invented idle-compute marketplaces, cloud rendering, scientific distributed computing, mining pools or tokenized compute networks. Those categories already exist.

The product innovation is the **combination and presentation layer**:

1. a universal game-facing entry point instead of a traditional miner/provider dashboard;
2. explicit user consent and resource caps;
3. replaceable destinations such as marketplace, science, treasury/pool, data center, operator-owned workloads and custom providers;
4. provider-independent accounting through receipts and a user-facing work history;
5. gameplay and compute kept as separate authority domains;
6. a reusable white-label B2B surface rather than one fixed provider integration;
7. reward/retention surfaces that can be funded by verified external work rather than only by operator marketing spend.

Canonical product statement:

> **One Core. Any Destination.**
>
> A configurable gameplay layer can sit beside an opt-in resource-routing layer and turn verified external work into transparent user/operator value without allowing compute activity to change game odds.

---

## Why the economics can be different from a conventional slot

A conventional slot has one principal commercial engine: gameplay economics.

HELIOS is designed to permit an additional, separately accounted source of value:

```text
CONVENTIONAL SLOT
GAMEPLAY → OPERATOR ECONOMICS

HELIOS
GAMEPLAY → OPERATOR ECONOMICS
     +
OPT-IN COMPUTE → VERIFIED EXTERNAL VALUE
```

That external value can theoretically be divided among:

- the user supplying the resource;
- the operator or platform;
- a shared treasury/pool;
- a scientific/public-good sink;
- a buyer-owned workload that reduces outside cloud expenditure.

This creates several possible B2B models:

- white-label licensing;
- integration/setup fees;
- recurring platform fees;
- a disclosed take-rate on verified compute value;
- custom provider adapters;
- operator-owned workload routing;
- user incentive funding from external compute demand rather than only from operator acquisition/retention budgets.

---

## Illustrative unit economics

The figures below are **sensitivity examples only**. They are not revenue forecasts, guaranteed returns or provider quotes.

Assume:

```text
MAU                         = 100,000
compute opt-in              = 10%
contributing devices        = 10,000
average active compute      = 1 device-hour/day
month                       = 30 days
realized external value     = $0.03/device-hour
```

Then:

```text
10,000 devices
× 1 h/day
× 30 days
= 300,000 device-hours/month

300,000 h
× $0.03/h
= $9,000 gross verified external value/month
```

Example allocation:

```text
70% user side        = $6,300
30% operator/platform = $2,700
```

The important commercial point is not the particular percentage split. The important point is that **verified external work creates a second value source that a conventional game does not have**.

A stronger deployment with higher opt-in, better-paying workloads or operator-owned avoided-cloud-cost workloads can produce materially different economics. A weaker workload mix can produce less. HELIOS should therefore calculate economics from real receipts, not from a fixed marketing promise.

---

## Electricity-aware profitability gate

A production HELIOS should evaluate whether an economic workload is worthwhile to the participating user.

Conceptual rule:

```text
USER NET VALUE
=
provider payment
- electricity cost
- platform/provider fees
- configured safety margin
```

An economic route should only be presented as profitable when:

```text
USER_NET_VALUE > 0
```

For example, if a device adds 200 W of power draw and electricity costs $0.15/kWh:

```text
0.2 kW × $0.15/kWh = $0.03 electricity cost per hour
```

With a 70% user allocation, gross external value would need to exceed approximately:

```text
$0.03 / 0.70 ≈ $0.043/h
```

before that illustrative user clears electricity cost.

This is why production economics require real device telemetry, real provider pricing and authoritative receipts.

---

## Sponsor / partner validation gate

The public GitHub Pages build demonstrates the **interaction architecture**, not a proven production business.

HELIOS cannot honestly validate its real commercial profitability without a sponsor, operator, compute provider, research partner or other production-capable counterparty willing to supply at least one real workload and settlement/receipt path.

A credible pilot requires:

```text
REAL PROVIDER / SPONSOR
        ↓
LIVE WORKLOAD
        ↓
20–100+ CONSENTING TEST DEVICES
        ↓
REAL DEVICE-HOURS + WATT-HOURS
        ↓
AUTHORITATIVE RECEIPTS
        ↓
REAL VALUE / COST DATA
        ↓
MEASURED UNIT ECONOMICS
```

Until that pilot exists, HELIOS should describe its economics as **illustrative, modelled and unvalidated in production**.

The desired sponsor does not need to be a casino operator. It can be a compute marketplace, GPU/network provider, storage network, scientific project, data-center buyer or enterprise with a suitable batch workload.

---

## Compute-funded engagement and reward layer

HELIOS already demonstrates a non-cash reward primitive called **Spin Energy**.

Current public-demo behavior:

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

This demonstrates an important product idea: verified external work can fund **separate engagement/reward inventory** instead of all user incentives being paid directly from an operator marketing budget.

A future operator could implement compliant, capped daily-style reward programs around the same accounting principle, provided they remain jurisdiction-appropriate and independently reviewed.

Examples of safer reward surfaces include:

- capped non-cash daily Spin Energy;
- loyalty points separated from wagering balance;
- compute credits;
- cosmetic/profile progression;
- marketplace fee rebates;
- non-wagering digital rewards;
- public-good contribution badges or impact credits.

### Responsible-gaming boundary

These mechanisms must **not** be designed to exploit people with gambling problems or other vulnerable users.

Production rules should include:

```text
NO vulnerability targeting
NO loss-streak targeting
NO near-miss targeting
NO compute → better RNG/RTP/bonus odds
NO automatic compute-value → wager conversion
NO forced autoplay
NO guilt/charity pressure
RESPONSIBLE-GAMING LIMITS REMAIN AUTHORITATIVE
```

HELIOS can increase product usefulness and retention through transparent earned value, but it should not optimize reward timing against inferred addiction or vulnerability.

---

## Why this matters to a buyer

A buyer does not have to purchase a single fixed slot.

The stronger commercial interpretation is a **platform primitive**:

```text
HELIOS CORE
    ↓
WHITE-LABEL GAME SURFACE
    +
PROVIDER ROUTER
    +
RECEIPT / ACCOUNTING LAYER
    +
USER PROFILE / WORK HISTORY
    +
REWARD INVENTORY
```

Possible destinations can evolve without rebuilding the entire experience:

```text
compute marketplace
scientific computing
GPU rendering
AI inference
video transcoding
storage/network work
pool/treasury jobs
operator-owned batch jobs
custom approved workloads
```

That is the central commercial advantage of the architecture: **the interaction surface can remain stable while the destination and economic use of the resource changes.**

---

## Current truth boundary

The repository currently demonstrates the product logic and public capability surface.

Real-world claims require:

- a real provider adapter;
- signed/authoritative provider receipts;
- energy/thermal telemetry;
- real workload and settlement data;
- independent security/privacy/legal review;
- a non-money pilot before any regulated production deployment.

Therefore:

> **HELIOS has a testable commercial thesis and working demo mechanics, but production profitability can only be established with a real sponsor/provider pilot.**
