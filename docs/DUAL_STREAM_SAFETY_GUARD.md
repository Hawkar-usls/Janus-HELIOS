# HELIOS Dual-Stream Safety Guard

HELIOS reuses the **structure**, not the emotional targeting semantics, of the JANUS `HOLY CRINGE × LOVE` dual-stream research artifact.

The safe engineering mapping is:

```text
C → change / optimization pressure
L → safety reserve

MORE CHANGE PRESSURE
        ⇒
MORE REQUIRED SAFETY EVIDENCE
```

with the hard invariant:

```text
SAFETY_RESERVE >= rho * CHANGE_PRESSURE
```

## Why this is useful

The Adaptive Policy Plane is deliberately allowed to learn only around an immutable truth core. That still leaves a second problem: even a technically allowed policy change can be too aggressive for current device conditions or insufficiently supported by verification/rollback evidence.

The Dual-Stream Safety Guard supplies a separate veto/limiting layer.

It measures **system evidence**, not player emotions.

Safety reserve is bottlenecked by the weakest of:

- thermal headroom;
- power headroom;
- memory headroom;
- verification confidence;
- rollback readiness.

A hard gate also requires:

- active compute consent;
- immediate revoke capability;
- verifier readiness;
- exact artifact binding;
- fresh telemetry.

If any hard gate is absent, the experimental/learnable change is rejected.

If all hard gates exist but reserve is too low, HELIOS constrains or rejects the change. It does **not** invent a larger safety score merely to make the inequality pass.

## Relationship to Zim-derived Adaptive Policy

```text
HELIOS ROUTER
    ↓
DESKTOP FABRIC
    ↓
ADAPTIVE POLICY PLANE
    ↓
DUAL-STREAM SAFETY GUARD
    ↓
DESKTOP AGENT TRUTH GATES
    ↓
EXECUTION
```

The Adaptive Policy Plane may propose a safe-listed arm. The Dual-Stream Guard may still say `NO` because current evidence/headroom is insufficient. The Desktop Agent then independently rechecks consent, lease, resource policy and exact executor binding.

This gives three independent layers:

1. **Learn only within a declared action space.**
2. **Require safety reserve proportional to change pressure.**
3. **Recheck immutable execution truth locally.**

## Projection operator

The module also provides the geometric operator:

```text
P_perp = I - ss^T/(s^Ts)
```

for cases where an optimization proposal can be represented as a vector and a declared unsafe direction `s` is known. The proposal can be projected orthogonally away from that unsafe direction before further verification.

This operator is only as meaningful as the declared vectorization and safety model. HELIOS does not claim that arbitrary semantic risks become objectively measurable merely because a projection formula exists.

## Gambling / player boundary

The original meta-registry artifact models abstract negative-state inputs. HELIOS does **not** import that as player profiling.

Forbidden inputs include:

- inferred fear, anger, despair or sadness;
- problem-gambling or vulnerability labels;
- loss streaks;
- near misses;
- wagering history used to tune compute/policy pressure.

The guard has no authority over RNG, RTP, payout, bet, bonus probability or jackpot weighting.

In HELIOS, `care / agency / exit / truth` are mapped to concrete engineering controls: resource headroom, explicit consent, immediate revoke, verifier readiness, exact artifact binding, rollback and receipts.

## Claim boundary

This is a control-policy mechanism, not proof of lower energy use, higher profitability, improved player wellbeing or production safety. Those claims require real pilot evidence.
