# HELIOS Edge Constellation

`HELIOS Edge Constellation` extends the Edge Hash Lab from one low-power compatibility target into a heterogeneous replication plane spanning microcontrollers, HELIOS desktop CPU/GPU nodes, and future admitted ASIC gateways.

The central rule is intentionally stronger than ordinary fleet aggregation:

> **NODE POWER ≠ EVIDENCE WEIGHT**

A faster device may reach a checked-work target sooner, but it does not receive more cross-node evidentiary weight merely because it can process more hashes.

## Two-stage evidence model

Every node is first treated as its own paired experiment. JANUS I0 structured traversal and the randomized mirror each receive 50% of that node's checked-work exposure under the same local device, pool, job stream, wire semantics, and Guardian policy.

Only after that local comparison exists does HELIOS emit a node-local effect vector such as the difference in `accepted_per_mh`, `z28_per_mh`, `z30_per_mh`, `z32_per_mh`, and related normalized metrics.

Cross-node synthesis then operates on those local effect vectors rather than on pooled raw counts.

The current public contract uses:

`MEDIAN_NODE_LOCAL_DELTA + DIRECTIONAL_CONSISTENCY`

and treats each complete device comparison as one replication unit.

This deliberately prevents an ASIC-class node from overwhelming an ESP32-class node by volume alone.

## Supported planning classes

The current contract recognizes four planning classes:

- `NERDMINER_ESP32` — NerdMinerV2 or a compatible ESP32 target behind an explicit local bridge;
- `DESKTOP_CPU` — HELIOS Desktop Fabric CPU execution;
- `DESKTOP_GPU` — HELIOS Desktop Fabric GPU execution;
- `ASIC_GATEWAY` — a future external ASIC gateway admitted through an explicit compatibility and authority gate.

These are capability classes, not claims that hardware is currently connected.

## What the public page does

The GitHub Pages surface is a plan builder only. It does not request a serial device, connect to a pool, collect a wallet address, collect Wi-Fi credentials, invent hashrate, invent temperature, or invent watt telemetry.

The public page can show how a three-node campaign would be structured and can export its machine-readable campaign JSON.

## What production would require

Each physical node must independently satisfy identity, bridge/executor compatibility, conformance, Guardian, lease, provider/pool authority, and provenance gates. Real pool acceptance remains external evidence. The browser is never settlement authority.

A campaign is not execution-ready merely because all node classes are listed. Production admission must be explicit for every node.

## Statistical truth boundary

Directional consistency across devices is a replication signal, not causal proof. The current implementation intentionally refuses to infer:

- a SHA-256 break;
- nonce prediction;
- guaranteed block advantage;
- guaranteed mining profit;
- superiority merely from a rare tail;
- stronger evidence merely from faster hardware.

At least two complete independent node-local comparisons are required before HELIOS emits any cross-node replication signal. A heterogeneous or conflicting result remains `HETEROGENEOUS_OR_INCONCLUSIVE`.

## Commercial boundary

JANUS I0 remains separately scoped Background IP. HELIOS carries the bridge/evidence contract and can coordinate compatible experimentation, but it does not silently absorb the complete I0 scheduler into a HELIOS-only acquisition.

NerdMinerV2 remains an external MIT compatibility target. Future ASIC, pool, firmware, or hardware integrations do not imply partnership, assignment, exclusivity, or sponsorship unless separately agreed.

## Why this matters

The same evidence law can survive hardware replacement:

`ESP32 → DESKTOP CPU → DESKTOP GPU → ASIC`

while keeping the experimental discipline constant.

That lets HELIOS sell something broader than a miner integration: a device-agnostic system for controlled, provenance-aware, hardware-fair compute experimentation.
