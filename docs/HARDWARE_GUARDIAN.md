# HELIOS Hardware Guardian

## Thesis

HELIOS should not ask a user to donate or sell compute by treating the device as disposable capacity.

The Hardware Guardian makes **device care a first-class execution contract**:

```text
USER CONSENT + USER RESOURCE CAP
            ↓
HARDWARE-ONLY TELEMETRY
            ↓
THERMAL / POWER / BATTERY / MEMORY HEADROOM
            ↓
LOCAL GUARDIAN DECISION
            ↓
GREEN / WATCH / THROTTLE / COOLDOWN / BLOCK / UNKNOWN
            ↓
TIGHTENED EXECUTION BUDGET
            ↓
APPROVED EXECUTOR
```

The coordinator may request less resource. It may never override the local Guardian to request more.

## Lineage from Janus-Demiurge

`Janus-Demiurge/system_monitor.py` explored hardware telemetry, prediction and a thermal regulator that contracted load when temperature or instability rose. HELIOS preserves the useful idea — adapt compute pressure to device health — but deliberately **does not transplant the broad human-observation surface** from that experimental monitor.

The HELIOS rule is:

```text
HARDWARE-AWARE
AND
HUMAN-BLIND
```

The Guardian accepts hardware telemetry such as:

- CPU/GPU utilization;
- CPU/GPU/hotspot/VRAM temperature;
- vendor slowdown/shutdown thresholds when available;
- current watts / configured power limit;
- RAM/VRAM headroom;
- battery percentage and AC state;
- fan percentage and telemetry reliability where supplied.

The Guardian rejects telemetry fields for:

- screen/screenshot/window content;
- keyboard/keystrokes/typed text;
- mouse activity;
- microphone/audio/voice;
- camera/webcam;
- clipboard/browser history;
- game names, process names or top-process content.

This is a privacy boundary, not merely a UI promise.

## Borrowed strengths, not copied implementations

TOPA Spider identified useful predecessor patterns:

### BOINC

BOINC established the principle that the participant should control resource use: whether to run on battery, whether to run while the computer is in use, CPU limits and other local preferences.

HELIOS adopts the sovereignty principle, while keeping execution provider-agnostic.

### Salad

Salad exposes CPU/GPU enable/disable choices, warns about resource contention, and publishes a GPU-temperature safety recommendation. HELIOS adopts explicit hardware selection and contention-aware admission, but moves the protection decision into an auditable local Guardian rather than relying only on guidance.

### NiceHash QuickMiner / OCTune

NiceHash shows that power, temperature, clocks, fan behavior and efficiency matter as much as raw throughput. HELIOS borrows the emphasis on efficiency/headroom, but the Guardian does **not** automatically overclock hardware and does not require mining-specific tuning.

### NVIDIA NVML / AMD SMI

Modern vendor APIs expose the primitives the Guardian should consume in production: current temperature, hotspot/memory temperatures where supported, power usage, power limits, energy, utilization and vendor thermal limits.

HELIOS does not invent these sensors. It gives them a product-level policy role.

## Decision model

The local Guardian computes an effective thermal ceiling from the user's configured maximum and vendor limits where available. It then protects a margin below that ceiling.

Typical behavior:

```text
large headroom                 → GREEN      → 100% of requested local budget
approaching pressure           → WATCH      → reduced budget
low thermal/power headroom     → THROTTLE   → stronger reduction
thermal limit reached          → BLOCK      → no new execution
recent thermal block           → COOLDOWN   → remain stopped until recovery
required sensor unavailable    → UNKNOWN    → limited mode or BLOCK by policy
```

`UNKNOWN` is not treated as proof of safety.

The default compatibility policy is `LIMIT` when thermal telemetry is missing. A production buyer can choose `BLOCK` for fail-closed deployments.

## Budget sovereignty

A Fabric assignment contains an execution budget. The Desktop Agent first verifies that the controller budget does not exceed the user's local policy. The Hardware Guardian can then tighten it further.

Example:

```text
controller asks GPU 40%
local user cap is GPU 50%
Guardian detects low thermal headroom
Guardian scale = 0.50
executor receives GPU 20%
```

The reverse is impossible: the Guardian cannot raise 40% to 50% and the controller cannot raise the user's 50% cap.

## Receipt semantics

Desktop Agent results include a bounded Guardian summary:

- state;
- allowed load scale;
- health score;
- reasons;
- sensor scope (`HARDWARE_ONLY`);
- human observation (`FORBIDDEN`).

The public GitHub Pages widget is explicitly a **policy preview**. It has no live desktop telemetry and must never display invented temperatures or watts.

## Commercial moat

The proposed moat is not “we monitor GPU temperature.” Every serious compute platform can do that.

The stronger HELIOS combination is:

```text
GAME-SHAPED ACQUISITION
+ EXPLICIT REVOCABLE CONSENT
+ MULTI-PROVIDER ROUTING
+ VERIFIED RECEIPTS
+ LOCAL HARDWARE SOVEREIGNTY
+ HARDWARE-AWARE / HUMAN-BLIND TELEMETRY
+ GAME RNG ⟂ COMPUTE
```

A compute network can provide workloads. A gaming supplier can provide audience. HELIOS is intended to make the user's device neither invisible infrastructure nor disposable mining hardware.

## Production gates

A production pilot should add OS/vendor telemetry adapters and validate them on real machines:

- NVIDIA: NVML;
- AMD: AMD SMI;
- CPU/platform sensors: OS/vendor-specific adapters;
- battery/AC: OS power APIs;
- optional energy accounting: vendor counters / external measurement.

Thresholds must be based on user policy and hardware/vendor limits rather than a universal claim that one temperature is safe for every device.
