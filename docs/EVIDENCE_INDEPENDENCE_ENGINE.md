# HELIOS Evidence Independence Engine

HELIOS Edge Constellation deliberately distinguishes **how many reports exist** from **how many independent replication roots exist**.

> `REPLICATION COUNT != INDEPENDENT ROOT COUNT`

A fleet of three ASICs behind the same gateway, running the same firmware lineage, through the same pool and observation epoch may produce three valid node-local reports. HELIOS preserves all three reports, but it does not automatically count them as three independent replications.

## Why this exists

Raw node count, raw hashrate and raw checked work are easy to inflate through correlated infrastructure. That can make a duplicated deployment look like independent confirmation. The Evidence Independence Engine is a gate between node-local evidence and cross-node synthesis.

Each node must first finish its own balanced JANUS I0 versus randomized-mirror comparison. Only then does the independence layer examine cross-node lineage.

## Required roots

For a pair of completed node-local replications to be classified as `STRONGLY_INDEPENDENT`, all six roots must be known and distinct:

1. `physical_device_root` — pseudonymous physical device / hardware root.
2. `execution_lineage_root` — firmware or executor implementation lineage.
3. `authority_root` — provider, pool, gateway or settlement authority lineage.
4. `site_network_root` — site/network-egress lineage sufficient to expose same-rack or same-egress correlation without observing the human user.
5. `observation_epoch_root` — sealed observation/calibration time epoch.
6. `job_stream_root` — cross-node job/experiment-seed lineage.

Hardware class is descriptive only. Two independent RTX cards may be independent replications; an ESP32 and an ASIC are not automatically independent merely because the hardware differs.

Unknown lineage is never interpreted as independence.

## Independence graph

Each complete node-local effect vector becomes a graph vertex. Two vertices receive an edge only when the pair is `STRONGLY_INDEPENDENT`.

HELIOS then selects the largest set of vertices that are pairwise connected — a maximum clique in the strong-independence graph. That set is the replication set permitted to influence cross-node synthesis.

For campaigns up to 24 complete nodes the implementation performs an exact deterministic maximum-clique search. Above that bound it uses a deterministic greedy pairwise-independent set and marks the result `exact_maximum_clique=false`; it never pretends the fallback is an exact optimum.

This means:

```text
8 node reports
  -> 6 complete local I0/random comparisons
  -> 5 known physical roots
  -> 4 lineage-diverse candidates
  -> 3 pairwise strongly independent replications
```

The engine reports every stage. It does not collapse them into a fake confidence percentage.

## Constellation verdict gate

`compareEdgeConstellationEvidence()` now synthesizes median local deltas and directional consistency only across the selected strongly-independent set.

Two complete nodes are no longer sufficient by themselves. HELIOS requires at least two **strongly independent complete nodes** before it can emit an independent replication signal.

Possible high-level outcomes include:

- `INSUFFICIENT_COMPLETE_NODE_REPLICATION`
- `INSUFFICIENT_STRONG_INDEPENDENCE`
- `INDEPENDENT_BUT_HETEROGENEOUS_OR_INCONCLUSIVE`
- `DIRECTIONALLY_CONSISTENT_INDEPENDENT_REPLICATION_SIGNAL_NOT_CAUSAL_PROOF`

No outcome is a probability of truth, proof of a SHA-256 shortcut, guaranteed mining advantage or profit claim.

## Human-blind lineage

The independence layer follows the same privacy direction as Hardware Guardian. It may use hardware, executor, provider, site/network and sealed experiment lineage, but it does not need screen, keyboard, mouse, microphone, camera, clipboard, browser history, process names, game names or window titles.

The goal is to understand **dependency between machines and execution paths**, not to observe the person using the machine.

## Relationship to JANUS I0

JANUS I0 remains separately scoped Background IP. HELIOS exposes a bridge/evidence contract and an independence gate around cross-node replication. The full I0 scheduler is not automatically transferred with HELIOS.

The combined research law is:

```text
within each node:
  JANUS I0 50% <-> RANDOMIZED MIRROR 50%

across nodes:
  complete local effect vectors
    -> lineage graph
    -> maximum pairwise strongly-independent set
    -> median delta + directional consistency
    -> replication signal only
```

`NODE POWER != EVIDENCE WEIGHT` and `REPLICATION COUNT != INDEPENDENT ROOT COUNT` are independent invariants and are both required.