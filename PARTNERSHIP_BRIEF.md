# JANUS HELIOS — Partnership Brief

## One sentence

**HELIOS is a configurable slot-shaped compute-routing asset: one game surface, one consent layer, and replaceable destinations for useful computation.**

## The product

HELIOS is deliberately not tied to one compute business model.

```text
PLAYER / DEVICE
      ↓
explicit consent + resource policy
      ↓
JANUS HELIOS ROUTER
      ↓
Provider Manifest + Adapter + Verifier
      ↓
approved workload
      ↓
authoritative receipt
      ↓
audited value / impact sink
```

The buyer decides what the destination is. The game does not.

Reference destinations included in the public demo:

- **Science / Public Good** — research Requestor → accepted work → Impact Ledger;
- **Shared Mining Pool / Jackpot** — accepted shares/revenue → Compute Treasury;
- **Compute Marketplace** — Golem or another approved market → verified settlement → player compute earnings / treasury;
- **Data Center / Cloud** — general batch, rendering, analytics, HPC or other admitted workload;
- **Operator Workload** — private buyer-owned task behind an approved gateway;
- **Custom** — a future provider/workload not known when HELIOS was built.

## Product family

HELIOS is the configurable parent asset.

```text
JANUS HELIOS
   ├─ DIVINE_REALM → science/public-good default
   └─ SSlot         → shared mining-pool/jackpot default
```

Those two projects remain specialized demonstrations of two predefined directions. HELIOS exists for buyers who need the direction itself to be replaceable.

## What the buyer changes

A commercial integration can replace:

- provider manifests;
- gateway endpoint mapping;
- approved workload classes;
- verification keys and verifier implementation;
- routing plan and capacity weights;
- impact/treasury/contract sink;
- player compute-value allocation policy where applicable;
- regional policy;
- branding, symbols, presentation and content theme.

The slot mathematics do not need to be rewritten merely because the compute destination changes.

## What the buyer cannot change through ordinary compute configuration

HELIOS reserves these boundaries:

```text
compute -> RNG                     FORBIDDEN
compute -> RTP                     FORBIDDEN
compute -> personal win chance     FORBIDDEN
compute -> bet size                FORBIDDEN
compute -> free spins              FORBIDDEN
compute -> personal jackpot weight FORBIDDEN
spin frequency -> compute rate     FORBIDDEN
browser -> provider private secret FORBIDDEN
unverified receipt -> ledger value FORBIDDEN
```

## Why this may matter to different buyers

### Casino / aggregator

One reusable compute integration can support multiple branded games and multiple destinations without coupling provider logic to certified game math.

### Small business

A branded HELIOS instance can route voluntary compute to an approved internal/general workload or third-party compute market without requiring the business to invent a new game client.

### Data center / cloud provider

HELIOS can act as a consented edge-compute acquisition and visualization surface for workloads that are technically suitable for distribution and independently verifiable.

### Distributed-compute / crypto project

A network such as Golem can potentially receive a new opt-in provider/onboarding surface; another project can implement its own manifest, adapter and receipt verifier.

### Research organization

HELIOS can expose a science-first route where a real workload owner retains scientific authority and only accepted, verified work enters the impact ledger.

## Demo vs production

The public GitHub Pages slot uses simulated game credits and simulated compute receipts. It does **not** claim that real Golem, mining, data-center or research workloads are currently executed by the browser page.

Production requires, at minimum:

1. real provider admission;
2. server/local-agent adapter;
3. authoritative receipt verification and anti-replay;
4. workload and data-security review;
5. energy/thermal policy;
6. settlement/accounting review where money or crypto is involved;
7. independent gambling/platform/privacy/legal review where regulated gaming is involved.

## Commercial boundary

Public access is for evaluation. Production, OEM, white-label, hosted, platform or other commercial use requires a separate written agreement. See [`LICENSE.md`](LICENSE.md) and [`IP_NOTICE.md`](IP_NOTICE.md).