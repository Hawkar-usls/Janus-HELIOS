# JANUS HELIOS — Competitive Moat Map

## Why this document exists

Prior art is not a defeat condition. It is a boundary map.

HELIOS should never claim novelty for a component that already existed. Instead it should identify the maintained combination that produces a materially different product and then make that combination increasingly difficult to reproduce.

## What HELIOS does **not** claim to have invented

The following ideas predate HELIOS and are useful predecessors rather than novelty claims:

- volunteer/distributed computing;
- combining games or gamification with useful external computation;
- using idle gaming PCs or GPUs as compute supply;
- mining pools and hashpower marketplaces;
- paying users for contributed compute;
- CPU/GPU resource limits and battery preferences;
- GPU temperature, utilization and power monitoring;
- thermal throttling and power limits;
- provider-side job verification;
- configurable gaming content.

Trying to sell any one item above as “the invention” would make HELIOS weaker, not stronger.

## The HELIOS combination

The current product thesis is the simultaneous composition of:

```text
POLISHED GAME-SHAPED ENTRY SURFACE
          +
EXPLICIT / REVOCABLE RESOURCE CONSENT
          +
USER-DEFINED CPU / GPU ENVELOPE
          +
PROVIDER-AGNOSTIC MULTI-DESTINATION ROUTER
          +
MANIFEST / ADAPTER / VERIFIER ABSTRACTION
          +
LOCAL DESKTOP FABRIC + EXACT EXECUTOR IDENTITY
          +
HARDWARE GUARDIAN
          +
HARDWARE-AWARE / HUMAN-BLIND TELEMETRY
          +
VERIFIED RECEIPT / SETTLEMENT BOUNDARY
          +
STRICT GAME RNG ⟂ COMPUTE
          +
WHITE-LABEL BUYER CONFIGURATION
```

The moat claim should therefore be phrased conservatively:

> We have not identified an existing commercial product that exposes the same complete maintained architecture as one reusable B2B interaction layer.

This is deliberately different from claiming that no one has ever combined games and computation.

## Five axes to push toward the absolute

### 1. Device sovereignty

HELIOS should become the compute platform that treats the contributor's machine as a protected asset rather than anonymous disposable capacity.

Target state:

```text
USER LIMIT
  ↓
VENDOR / OS HARDWARE LIMITS
  ↓
HARDWARE GUARDIAN
  ↓
LOCAL BUDGET CAN ONLY CONTRACT
  ↓
DEVICE HEALTH RECEIPT
```

Roadmap:

- NVIDIA NVML adapter;
- AMD SMI adapter;
- CPU/platform temperature and power adapters;
- AC/battery policy;
- thermal trend + hysteresis;
- measured watt-hours;
- Device Health Passport;
- optional per-device conservative profiles;
- no automatic overclocking requirement.

### 2. Human-blind privacy

A resource router does not need to observe the human to protect the machine.

HELIOS should make this a hard differentiator:

```text
TEMPERATURE       YES
POWER             YES
UTILIZATION       YES
RAM / VRAM        YES
BATTERY / AC      YES

SCREEN            NO
KEYBOARD          NO
MOUSE             NO
MICROPHONE        NO
CAMERA            NO
CLIPBOARD         NO
BROWSER HISTORY   NO
PROCESS CONTENT   NO
```

Content-blind host-pressure protection is preferable to surveillance-based “are you gaming?” heuristics.

### 3. Provider neutrality

Most compute clients exist to feed one network.

HELIOS should remain valuable even when every backend changes:

```text
HELIOS USER SURFACE
       ↓
STANDARD ROUTER CONTRACT
       ↓
┌─────────┬─────────┬──────────┬────────────┬──────────┐
MARKET    SCIENCE   TREASURY   DATA CENTER  OPERATOR  CUSTOM
└─────────┴─────────┴──────────┴────────────┴──────────┘
```

The replaceable unit is the provider manifest / adapter / verifier rather than the user experience.

### 4. Truth-carrying compute

HELIOS should prefer proof over marketing claims.

Target chain:

```text
EXACT APPROVED ARTIFACT
      ↓
FENCED LEASE
      ↓
LOCAL GUARDIAN DECISION
      ↓
WORK RESULT
      ↓
PROVIDER VERIFICATION
      ↓
AUTHORITATIVE RECEIPT
      ↓
DEVICE HEALTH SUMMARY
      ↓
MEASURED VALUE / IMPACT
```

No verified receipt means no authoritative external-value claim.

No live hardware sensor means no invented temperature or watt reading.

### 5. Game/compute constitutional separation

This should remain more than a disclaimer.

```text
COMPUTE STATE ─X→ RNG
COMPUTE STATE ─X→ RTP
COMPUTE STATE ─X→ BONUS ODDS
COMPUTE STATE ─X→ PERSONAL JACKPOT WEIGHT
HARDWARE PRESSURE ─X→ GAME OUTCOME
```

Hardware pressure may reduce or stop compute. It must never influence the gambling/game outcome channel.

## What to borrow from predecessors

### HEWMEN / volunteer-computing games

Borrow:

- meaningful external missions;
- clear explanation that play can coexist with useful work;
- scientific/public-good destinations.

Do not copy:

- one fixed conception of the workload ecosystem.

HELIOS direction:

- one interface, many independently replaceable destinations.

### BOINC

Borrow:

- participant sovereignty;
- local resource preferences;
- battery-aware and resource-aware scheduling philosophy;
- long-running-workload discipline.

HELIOS direction:

- elevate preferences into enforceable local authority that a controller cannot widen.

### Salad / gamer compute networks

Borrow:

- proof that gaming hardware can form real distributed infrastructure;
- explicit CPU/GPU selection;
- workload compatibility/admission awareness;
- real supply/demand economics.

HELIOS direction:

- remain network-neutral and make the same user surface capable of feeding multiple provider families.

### NiceHash / mining tooling

Borrow:

- efficiency consciousness;
- watts, temperature and stability as first-class variables;
- clear user control over hardware profiles.

Do not copy:

- mining-specific optimization assumptions;
- automatic overclocking as a requirement.

HELIOS direction:

- optimize for verified useful value per safe device cost, not maximum raw hash/throughput.

### NVIDIA NVML / AMD SMI

Borrow:

- authoritative hardware telemetry primitives;
- vendor thermal limits;
- power and energy counters;
- hotspot/VRAM/ECC/violation signals where available.

HELIOS direction:

- transform low-level telemetry into a provider-independent local safety contract.

## Next moat: Device Health Passport

The Hardware Guardian answers:

> Should this task run **now**, and at what locally safe scale?

The next layer should answer:

> How has HELIOS treated this device **over time**?

Proposed privacy-preserving passport fields:

```text
DEVICE-LOCAL PSEUDONYMOUS ID
GUARDIAN VERSION
COMPUTE HOURS
VERIFIED TASK HOURS
ENERGY / WATT-HOURS WHEN MEASURABLE
MAX OBSERVED THERMAL PRESSURE BAND
TIME IN GREEN / WATCH / THROTTLE / COOLDOWN
NUMBER OF HARD BLOCKS
NUMBER OF USER REVOKES
FAILED / VERIFIED WORK COUNTS
NO SCREEN / KEYBOARD / AUDIO / CONTENT HISTORY
```

This could become useful to:

- the device owner;
- compute providers evaluating reliable contributors;
- data-center or enterprise buyers evaluating fleet quality;
- auditors checking consent and device-care policy;
- HELIOS itself when choosing workloads without widening local limits.

It must not become a surveillance fingerprint or a mechanism for changing game outcomes.

## Commercial positioning after this pass

Do not pitch:

> “We invented a slot that mines/computes.”

Pitch:

> “HELIOS is a reusable consumer control plane between entertainment audiences and multiple compute markets. It provides explicit consent, replaceable provider routing, verified receipts and a local hardware-sovereignty layer that can tighten or stop work without observing the human and without giving compute any authority over game mathematics.”

That proposition can be evaluated separately by gaming distributors and compute/data-center networks.

## Validation gates

The highest-value remaining evidence is not another visual feature.

```text
1. REAL VENDOR TELEMETRY ADAPTERS
2. REAL COMPUTE PROVIDER
3. 20–100+ CONSENTING TEST DEVICES
4. REAL WORK RECEIPTS
5. DEVICE HEALTH PASSPORT
6. MEASURED VALUE / WATT-HOUR / FAILURE / THROTTLE DATA
7. USER OPT-IN AND RETENTION DATA
```

Crossing those gates changes HELIOS from an unusually complete pre-revenue architecture into an externally validated infrastructure product.
