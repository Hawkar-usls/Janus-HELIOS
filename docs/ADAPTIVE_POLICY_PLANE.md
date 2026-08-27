# HELIOS Adaptive Policy Plane

## Purpose

The Adaptive Policy Plane adds a bounded local decision layer around the existing HELIOS Desktop Fabric and Desktop Agent.

It does **not** replace provider verification, artifact identity, consent, thermal/power limits, leases, signatures or game/compute separation. It decides only among already-approved resource-policy choices.

The core invariant is:

```text
IMMUTABLE EXECUTION TRUTH
        +
LEARNABLE BOUNDED POLICY AROUND IT
```

The implementation lives in `src/helios-adaptive-policy.js`.

## 1. PRIMARY_MISSION + BOUNDED_SIDE_QUESTS

A desktop agent may declare its own specialization through primary provider IDs, task types or capability tags.

```text
PRIMARY MISSION
  keeps priority
  keeps specialization
  does not surrender the machine to unrelated requests

SIDE QUEST
  only if allowed
  only inside time budget
  only inside CPU/GPU budget
  only inside concurrency budget
  first thing throttled under pressure
```

Primary priority never overrides the base Desktop Agent truth/safety gates. A primary workload can still be rejected for revoked consent, expired lease, insufficient RAM/VRAM, thermal/power policy, missing exact executor, artifact mismatch or another authoritative safety condition.

## 2. SELF_TESTED_ACCELERATION_ONLY

A fast implementation does not become authoritative because it looks faster.

`SelfTestedAccelerationGate` maintains two paths:

```text
STABLE TRUTH PATH
        ↓
CANDIDATE FAST PATH
        ↓
BYTE-EQUIVALENCE SELF TEST
        ↓
BENCHMARK
        ↓
PROMOTE / KEEP VERIFIED / REJECT
```

After promotion, periodic cross-checks continue. If a cross-check differs, or the candidate throws, the gate demotes the candidate and returns to the stable path.

This is intentionally generic. It can wrap CPU/GPU kernels, parsers, codecs, numerical kernels or other local executors, but it does not let an optimization rewrite the workload identity or verifier.

## 3. Quiet Canary

Optional work is shed before primary work.

The pressure classifier uses bounded local telemetry:

- CPU load;
- GPU load;
- temperature;
- watt budget;
- battery / AC state.

States:

```text
NORMAL       → side quests may use their normal bounded allowance
CONSTRAINED  → side quests are throttled
CRITICAL     → side quests are declined
```

The primary mission remains priority-protected but still cannot bypass the Desktop Agent's safety gates.

## 4. Local learning inside a safe action space

`SafeActionBandit` implements a small multiplicative-weights policy selector.

It may select only from a predeclared arm set. Example safe arms may vary:

- batch size;
- side-quest budget percentage;
- concurrency hint;
- polling interval;
- retry backoff;
- prefetch depth;
- bounded provider-preference bias.

The learning layer is explicitly forbidden from changing execution truth such as:

- artifact SHA-256;
- task type;
- route class;
- verifier or verification rule;
- signature/authentication rule;
- secrets;
- RNG, RTP, bet, payout or bonus probability.

Exploration is bounded. Multiplicative weights reward useful arms, while decay gradually removes stale lucky history.

## 5. Learning memory across restart

`ThrottledPolicyMemory` uses an injected persistence adapter.

The core does not assume a specific database. A deployment may bind it to a durable store, but writes are throttled so the learner does not hammer flash/disk or remote storage.

A forced checkpoint is supported for important events. Persisted memory is accepted only when its safe arm set exactly matches the current runtime arm set.

This prevents an old or tampered memory snapshot from silently expanding the action space.

## 6. Autonomy without information isolation

A node may refuse a side quest or choose a different safe policy arm without disappearing from HELIOS observability.

`AdaptivePolicyReporter` emits compact events for:

- workload admit;
- workload decline;
- pressure reason;
- selected safe arm;
- learning outcome;
- memory restore/checkpoint state.

The principle is:

```text
LOCAL AUTONOMY != COLLECTIVE INFORMATION BLACKOUT
```

The node owns its bounded local policy. HELIOS still knows what decision it made and why.

## Policy-bound desktop agent

`HeliosPolicyBoundDesktopAgent` wraps the existing `HeliosDesktopAgentRuntime`.

The adaptive layer can only **tighten** a side quest's controller execution budget before it reaches the base agent. It cannot widen local user limits.

```text
FABRIC ASSIGNMENT
      ↓
ADAPTIVE POLICY DECISION
      ↓
optional stricter SIDE-QUEST budget
      ↓
BASE DESKTOP AGENT TRUTH / SAFETY GATES
      ↓
EXACT APPROVED EXECUTOR
```

The base agent remains authoritative for consent, lease expiry, exact provider/task/artifact executor binding, CPU/RAM/VRAM capacity, temperature, power, battery policy and arbitrary-command rejection.

## Zim conceptual lineage and IP boundary

The generalized design is inspired by the resource and learning discipline visible in the separate JANUS Zim Geek firmware: primary mission first, lazy bounded side work, quiet-canary throttling, self-tested acceleration, bounded stride learning, persisted learner state and continuing swarm reporting.

HELIOS does **not** import Zim firmware or depend on `janus-distributed-ai-swarm` at runtime. The active module is a HELIOS requirements-first JavaScript implementation and the conceptual relationship is disclosed in `.janus/HELIOS_ADAPTIVE_POLICY.json`.

This distinction matters for diligence: architectural inspiration is recorded, but the active HELIOS execution tree does not make Zim/ESP32 source a dependency.

## Production boundary

The code establishes enforceable policy invariants, not proof that its learning improves economics in production.

A real deployment still needs measured pilot data for:

- throughput impact;
- primary-task preservation;
- side-quest yield;
- energy use;
- thermal behavior;
- policy regret / arm quality;
- persistence reliability;
- provider acceptance and authoritative settlement.

No claim of production profitability or globally optimal scheduling is made by this module.
