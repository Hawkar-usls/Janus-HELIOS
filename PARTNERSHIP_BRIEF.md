# JANUS HELIOS — Partnership Brief

## One sentence

**HELIOS is a web-first configurable slot-shaped compute-routing asset: one consent layer, one universal router, and replaceable destinations for useful computation.**

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
- **Compute Marketplace** — Golem or another approved market → verified settlement → player compute value / treasury;
- **Data Center / Cloud** — general batch, rendering, analytics, HPC or other admitted workload;
- **Operator Workload** — private buyer-owned task behind an approved gateway;
- **Custom** — a future provider/workload not known when HELIOS was built.

## Three-repository ecosystem

HELIOS is the only universal route-switchable parent asset.

```text
JANUS HELIOS
   universal configurable parent
          │
          ├── DIVINE_REALM
          │     fixed SCIENCE / PUBLIC-GOOD child
          │
          └── SSlot
                fixed SHARED MINING-POOL / JACKPOT child
```

`DIVINE_REALM` and `SSlot` inherit the HELIOS consent/fairness/routing contract but intentionally **do not** expose universal route switching in their public product identity.

Canonical family contract: [`.janus/HELIOS_ECOSYSTEM.json`](.janus/HELIOS_ECOSYSTEM.json).

## What the buyer changes in HELIOS

A commercial HELIOS integration can replace:

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

If the buyer wants the fixed science product, use/customize `DIVINE_REALM` inside the Science role. If the buyer wants the fixed pooled Treasury/jackpot product, use/customize `SSlot` inside the Treasury role.

## What the buyer cannot change through ordinary compute configuration

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

## Web-first delivery

HELIOS does not require Telegram. The public asset is ordinary web software and can be hosted on GitHub Pages, an operator site, a white-label frontend or another approved delivery surface.

The specialized children may retain Telegram/WebApp delivery where useful; that is a presentation choice, not a HELIOS dependency.

## Slot dynamics

The HELIOS public slot uses neutral staggered reel stops to create real motion and impact. Stop timing depends on reel index only — not on win/loss state, near-miss state, selected compute route or wagering history.

`SPIN` and `ROUTE POWER` remain independent controls.

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
The specialized `DIVINE_REALM` child provides the science/public-good reference lane where a real workload owner retains scientific authority and only accepted work enters the Impact Ledger.

## Demo vs production

The public GitHub Pages slot uses simulated game credits and simulated compute receipts. It does **not** claim that real Golem, mining, data-center or research workloads are currently executed by the browser page.

Production requires real provider admission, a server/local-agent adapter, authoritative receipt verification/anti-replay, workload/data-security review, energy/thermal policy, settlement/accounting review where applicable, and independent legal/platform/privacy/regulatory review.

## Commercial boundary

Public access is for evaluation. Production, OEM, white-label, hosted, platform or other commercial use requires a separate written agreement. See [`LICENSE.md`](LICENSE.md) and [`IP_NOTICE.md`](IP_NOTICE.md).