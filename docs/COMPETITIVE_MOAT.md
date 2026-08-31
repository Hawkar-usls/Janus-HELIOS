# JANUS HELIOS — Competitive Moat Map

## Market-reviewed position

Prior art is a boundary map, not a defeat condition.

HELIOS should not claim novelty for components that existed before it. The defensible commercial position is the **maintained composition** and the way those components constrain one another.

Safe claim after the 2026-08-31 public market review:

> **We found predecessors for individual components, but did not identify a public commercial product exposing the same complete maintained HELIOS architecture as one licensable B2B control plane.**

This is a product-positioning statement, not a patentability or freedom-to-operate opinion.

## What HELIOS does not claim to have invented

- volunteer/distributed computing;
- games/gamification combined with external useful compute;
- idle gamer/consumer GPU supply;
- mining pools or hashpower markets;
- payments/rewards for contributed compute;
- science/public-benefit use of volunteer compute;
- CPU/GPU/battery resource preferences;
- temperature, power and utilization monitoring;
- thermal throttling and power limits;
- provider-side verification;
- game aggregation or configurable gaming content.

Relevant predecessors/adjacent markets include HEWMEN, BOINC, Charity Engine, SaladCloud, Theta EdgeCloud, NiceHash and existing iGaming aggregation/turnkey platforms.

See `docs/MARKET_AND_LICENSE_POSITION_2026-08-31.md`.

## The implemented HELIOS moat stack

This is no longer a roadmap list. The current repository already contains the following maintained layers:

```text
GAME-SHAPED / WHITE-LABEL ENTRY
        ↓
EXPLICIT REVOCABLE CONSENT
        ↓
USER CPU / GPU ENVELOPE
        ↓
PROVIDER-AGNOSTIC ROUTER
        ↓
PROVIDER DEFAULT-DENY + AUTHORITY EPOCH
        ↓
HARDWARE GUARDIAN
        ↓
HOST-FIRST QUIET-CANARY QoS
        ↓
SMART COMPUTE NODE
  ┌─────┴──────────────────────────────┐
  │ work/hash evidence                │
  │ hardware state                    │
  │ execution budget                  │
  │ provenance                        │
  │ device-health passport            │
  │ replication lineage               │
  └────────────────────────────────────┘
        ↓
VERIFIED RECEIPT / TRUE WORK ACCOUNTING
        ↓
EDGE CONSTELLATION / INDEPENDENCE-AWARE EVIDENCE
        ↓
MEASURABLE EXTERNAL VALUE / IMPACT

GAME RNG / RTP / PERSONAL ODDS  ⟂  ALL COMPUTE STATE
```

The strongest differentiation is that HELIOS attempts to protect **four different principals at once**:

1. the user/device owner from uncontrolled resource use;
2. the compute provider from unverifiable/misidentified execution;
3. the operator/licensee from ambiguous accounting and provider lock-in;
4. the game-math/regulatory domain from compute influence.

## Moat axis 1 — Device sovereignty

Implemented direction:

```text
USER LIMIT
  ↓
VENDOR / OS HARDWARE LIMITS
  ↓
HARDWARE GUARDIAN
  ↓
HOST-FIRST QoS
  ↓
LOCAL BUDGET CAN ONLY CONTRACT
  ↓
SMART COMPUTE NODE
  ↓
DEVICE HEALTH PASSPORT
```

The contributor device is treated as a protected asset rather than anonymous disposable capacity.

Still externally unproven:
- production NVML/AMD SMI fleet adapters across diverse hardware;
- measured lifetime/wear benefit;
- large-sample failure-rate reduction.

HELIOS must not claim proven life extension until those measurements exist.

## Moat axis 2 — Hardware-aware, human-blind privacy

Allowed safety observations include hardware telemetry such as:

```text
TEMPERATURE       YES
POWER / ENERGY    YES
UTILIZATION       YES
RAM / VRAM        YES
BATTERY / AC      YES
SENSOR FRESHNESS  YES

SCREEN            NO
KEYBOARD          NO
MOUSE             NO
MICROPHONE        NO
CAMERA            NO
CLIPBOARD         NO
BROWSER HISTORY   NO
PROCESS CONTENT   NO
```

The design goal is to know enough about the machine to protect it without needing to know what the human is doing.

## Moat axis 3 — Provider neutrality

Most compute clients exist to feed one network. HELIOS keeps the provider replaceable:

```text
HELIOS CONTROL PLANE
       ↓
MANIFEST / ADAPTER / VERIFIER
       ↓
MARKET | SCIENCE | TREASURY | DATA CENTER | OPERATOR | CUSTOM
```

Provider registration is not execution authority. Admission is default-deny and epoch-fenced.

This matters commercially because the licensee can replace demand-side compute partners without rebuilding the complete user interaction model.

## Moat axis 4 — Truth-carrying compute

HELIOS distinguishes:

```text
ASSIGNED WORK       != EXECUTED WORK
EXECUTED WORK       != VERIFIED WORK
RESULT EXISTS       != AUTHORITY PROVEN
RUNTIME             != MEASURED DEVICE TIME
NOMINAL WATTS       != MEASURED Wh
INTEGRITY            != SENSOR TRUTH
UNKNOWN              != ZERO
```

Receipt provenance, exact executor identity, verifier rules and Device Health Passport references make evidence lineage first-class.

## Moat axis 5 — Smart Compute Node fusion

The mining/I0 lineage became a general-purpose architecture:

> A node should report not only what work it performed, but also the state and locally enforced budget of the device while that work was performed.

That fusion now applies beyond hashing to CPU, GPU, AI, rendering, scientific and data-center-adjacent workloads.

The claim is architectural, not a claim that all workload types are already production-integrated.

## Moat axis 6 — Hardware-fair replication

Edge Constellation freezes the law:

```text
NODE POWER != EVIDENCE WEIGHT
```

A high-throughput ASIC or GPU does not receive more cross-node evidentiary votes merely because it checked more work. Each node first produces a normalized local comparison before cross-node synthesis.

## Moat axis 7 — Evidence Independence Engine

HELIOS further distinguishes:

```text
REPORT COUNT != INDEPENDENT ROOT COUNT
```

Independence lineage considers:
- physical device root;
- execution/firmware lineage;
- authority/provider root;
- site/network root;
- observation epoch;
- job-stream/experiment-seed lineage.

Unknown lineage never becomes assumed independence. Correlated reports are retained but cannot masquerade as separate strong replications.

This is an unusual bridge between distributed-compute engineering and evidence methodology.

## Moat axis 8 — Game/compute constitutional separation

This remains a hard boundary rather than marketing copy:

```text
COMPUTE STATE ─X→ RNG
COMPUTE STATE ─X→ RTP
COMPUTE STATE ─X→ BONUS ODDS
COMPUTE STATE ─X→ PERSONAL JACKPOT WEIGHT
HARDWARE PRESSURE ─X→ GAME OUTCOME
```

Hardware pressure may throttle or stop external compute. It cannot improve or worsen the player's game outcome.

## What to borrow from predecessors

### HEWMEN
Borrow meaningful external missions and the proof that entertainment and distributed work can coexist. Do not claim game-plus-compute as HELIOS novelty.

### BOINC
Borrow participant sovereignty, conservative resource preferences and long-running scientific-compute discipline. HELIOS elevates this toward a local authority boundary that a controller cannot widen.

### Charity Engine
Borrow the philosophy that commercial compute can coexist with public-benefit workloads. HELIOS adopts this commercially as an optional **Science / Public Benefit Discount** rather than claiming the concept as unique.

### SaladCloud / Theta EdgeCloud
Borrow the market lesson that distributed GPU capacity has real buyers and explicit per-resource pricing. HELIOS remains provider-neutral rather than becoming another single compute network.

### NiceHash / mining tooling
Borrow efficiency awareness and the habit of treating watts, thermal state, stability and verified hash/work as first-class variables. HELIOS generalizes that discipline beyond mining.

### NVIDIA NVML / AMD SMI
Borrow authoritative hardware telemetry primitives and vendor safety limits. HELIOS converts them into a provider-independent local safety contract.

### iGaming aggregators / turnkey platforms
Borrow distribution and integration machinery, not game-math authority. HELIOS is designed so a qualified licensee can commercialize the technology without the HELIOS owner becoming an operator.

## Commercial moat — license, do not casually transfer the core

The preferred commercial model is:

```text
HELIOS OWNER / LICENSOR
        ↓ field-limited license
MASTER LICENSEE
        ↓
operators + compute/infrastructure partners
```

Low-friction pilot economics should not imply weak IP boundaries.

Core principles:
- HELIOS Core stays Background IP unless expressly assigned;
- source is not resold as a standalone product;
- licensee can build real production adapters and proprietary integrations;
- core/general improvements use a negotiated shared-use or license-back rule;
- exclusivity requires performance and cannot be parked indefinitely;
- JANUS I0 remains separately scoped unless expressly licensed.

See `legal/COMMERCIAL_LICENSE_PRINCIPLES.md`.

## The real next moat: external truth

The highest-value remaining work is now external validation, not another internal conceptual layer:

```text
1. QUALIFIED MASTER LICENSEE / FUNDED PILOT
2. REAL COMPUTE PROVIDER + SUITABLE WORKLOAD
3. REAL VENDOR TELEMETRY ADAPTERS
4. 20–100+ CONSENTING TEST DEVICES
5. AUTHORITATIVE WORK RECEIPTS
6. DEVICE HEALTH PASSPORTS FROM REAL OBSERVATIONS
7. MEASURED Wh / FAILURE / RETRY / THROTTLE / REVOKE DATA
8. INDEPENDENCE ROOT ATTESTATIONS
9. USER OPT-IN / RETENTION DATA
10. MEASURED UNIT ECONOMICS
```

Crossing these gates would move HELIOS from an unusually integrated pre-production architecture toward externally validated infrastructure technology.

## Current pitch

Do not pitch:

> “We invented a slot that mines.”

Do pitch:

> **“HELIOS is a licensable provider-agnostic control plane between entertainment audiences and multiple compute markets. It combines explicit consent, local hardware sovereignty, Smart Compute Nodes, verified receipts and independence-aware evidence while keeping compute economics constitutionally separate from game mathematics.”**
