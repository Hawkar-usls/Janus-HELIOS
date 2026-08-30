# HELIOS Trust Fabric

HELIOS Trust Fabric is the fail-closed layer between user resource consent / Hardware Guardian and external provider execution.

It exists to make one maintained rule explicit:

```text
USER MACHINE SOVEREIGNTY > EXTERNAL PROVIDER THROUGHPUT
```

## P0A composition

The Trust Fabric combines four first-wave mechanisms:

1. **Provider Authority Epoch** — provider registration is not execution authority. Admission is default-deny, leases are scoped/non-transferable/budgeted, and epoch rotation makes prior leases stale.
2. **Host-first Quiet Canary QoS** — external work yields before local host reserves. The layer can only tighten the user's requested CPU/GPU envelope; it cannot widen it.
3. **Receipt Provenance Envelope** — a PASS string is not authority. Authoritative receipts require explicit provider, manifest, adapter, executor, verifier, Guardian policy, lease/job and settlement identities.
4. **Device Health Passport** — hardware care becomes an auditable observation history without storing screen, keyboard, mouse, microphone, browser or process/game content.

## P1 invariants included now

The same core also carries the minimum P1 laws needed to keep P0A honest:

- **True Work Accounting:** assigned work, admitted work, executed work, retries, stale/rejected results, verified results, device time and measured watt-hours are separate counters.
- **Verifier Assurance Monotonicity:** a successor verifier may not silently forget an inherited mandatory rejection. Intentional semantics changes require a new verifier identity plus replayable migration evidence.
- **Shadow Accelerator Qualification:** optimized executors remain SHADOW until reference comparisons and negative controls pass.
- **Compute Lineage Graph:** CONSENT -> PROVIDER -> LEASE -> GUARDIAN -> EXECUTOR -> RESULT -> VERIFIER -> RECEIPT -> PASSPORT, with structural edges carrying zero authority delta.

## Human-blind boundary

Trust Fabric accepts hardware / host-pressure state but rejects human-content telemetry. These classes are forbidden:

```text
screen / screenshot
keyboard / keystrokes
mouse
microphone / audio
camera / webcam
clipboard
browser/url history
window title / active window
process names / game names
```

The design may use coarse host state such as `idle_state`, CPU/GPU load, memory/VRAM pressure, thermal state and power state. It does not need to know what the human is doing.

## Device Health Passport truth boundary

A passport separates observation from interpretation:

```text
sensor source + freshness
        -> sealed observation window
        -> Guardian state
        -> measured work / energy when available
        -> receipt references
        -> summary
```

Missing measurements remain `null`/unknown. A valid passport structure or digest never proves that an upstream sensor was truthful or calibrated.

## Public slot boundary

The GitHub Pages slot exposes a compact Trust Fabric card in Buyer Lab so a buyer can see the architecture without turning the main game surface into an operations console.

The public static page does **not**:

- admit a real provider;
- issue a real provider lease;
- execute production GPU work;
- invent temperatures or watt-hours;
- promote DEMO/MOCK receipts to authoritative settlement.

Those remain production adapter / Desktop Agent / provider-verifier gates.

## Donor lineage

This layer deliberately reuses proven JANUS patterns with lineage preserved rather than pretending they originated inside HELIOS:

- `Janus-Demiurge` — adaptive thermal contraction;
- `janus-io-public` — Proof-of-Observation;
- `AIFC` — receipt provenance and assurance monotonicity;
- `Janus_Genesis` / `-Terminal-for-Janus` — default-deny capability authority and epochs;
- `janus-distributed-ai-swarm` — lease fencing, Quiet Canary and shadow acceleration;
- `Janus-Fundamentum` — independent replay / real work accounting discipline;
- `Hrain` — typed structural provenance graph.

Canonical machine-readable contract: `.janus/HELIOS_TRUST_FABRIC.json`.
