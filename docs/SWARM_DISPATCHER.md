# HELIOS Swarm Dispatcher

## Purpose

HELIOS already has provider-level routing in `src/helios-router.js`. The Swarm Dispatcher adds the next execution plane: a provider, data-center or operator workload can be divided into independent work units and leased to explicitly consenting HELIOS nodes.

```text
DATA CENTER / PROVIDER / OPERATOR
              ↓
        HELIOS ROUTER
              ↓
       SWARM DISPATCHER
              ↓
   NODE REGISTRY + HEARTBEATS
              ↓
  CHUNK → LEASE → ACK → RENEW
        ↙       ↓        ↘
     NODE A   NODE B    NODE N
        ↘       ↓        ↙
      VERIFIED RESULTS
              ↓
         AGGREGATOR
              ↓
   AUTHORITATIVE RECEIPT
```

The game remains a consent/presentation surface. Slot events are not scheduler inputs and cannot change workload assignment, RNG, RTP, payout, bonus probability or personal jackpot weighting.

## Buzz lineage

The dispatcher deliberately reuses generalized patterns already demonstrated by JANUS Buzz and its ESP32 workers in `Hawkar-usls/janus-distributed-ai-swarm`.

| Buzz / JANUS swarm pattern | HELIOS generalized form |
|---|---|
| Buzz pool master / arbiter | Swarm Dispatcher coordinator |
| `J/B` JobPacket/range | typed generic assignment envelope |
| worker heartbeat/status/echo | node heartbeat + TTL registry |
| unique nonce ranges | non-overlapping generic work chunks |
| `S/2` ShareResponse | typed result envelope |
| bounded remote-share/RX queues | bounded job/chunk dispatch state |
| worker RSSI/entropy/ACK telemetry | capability/load/reliability/latency telemetry |
| exact job snapshot around rotation | immutable assignment snapshot |
| remote-share verification before relay | mandatory independent result verifier |
| reconnect/blackout recovery | lease expiry + retry/reassignment |
| stale-job clearing | fencing-token ownership check |
| direct Buzz recovery | node stale/revoke recovery path |

Mining-specific SHA/Stratum semantics are **not** required by HELIOS. The reusable invention is the coordinator/worker discipline: work is admitted, partitioned, leased, acknowledged, verified and only then credited upstream.

## Production-oriented invariants

`src/helios-swarm-dispatcher.js` provides:

- explicit node compute consent before eligibility;
- heartbeat TTL and stale-node exclusion;
- capability advertisements;
- resource-policy and thermal/battery admission;
- load/reliability/latency-aware node scoring;
- bounded node/job/chunk counts;
- non-overlapping range chunking or explicit partitions;
- per-chunk cryptographically random lease/fencing token;
- ACK deadline;
- renewable leases;
- stale lease/result rejection;
- retry/reassignment on node loss, ACK timeout or lease expiry;
- maximum-attempt fuse;
- mandatory result verifier;
- optional aggregation callback;
- authoritative swarm receipt only after every chunk verifies;
- immediate node revoke and job cancellation;
- explicit transport and signing/authentication hooks;
- no browser-side provider secrets;
- no arbitrary shell/script execution fields in a generic assignment;
- no game coupling.

## Fencing model

The dispatcher follows the same safety idea used by JANUS Habitat objective leases:

```text
LEASE_ID = FENCING TOKEN

live holder → may ACK / renew / submit
expired holder → cannot resurrect
reassignment → receives a NEW lease ID
old result + old lease ID → REJECT
```

This prevents a slow or disconnected node from returning an old result after the chunk has already been reassigned.

The current implementation is an in-memory execution-plane core. A real multi-host production deployment should place the same state transitions behind an authenticated durable coordinator/store and use provider-specific signed transport. The module exposes the hooks rather than pretending the public browser demo is already that infrastructure.

## Generic job contract

Example:

```js
{
  job_id: 'dc-render-2026-0001',
  workload_id: 'renderer-v7',
  type: 'GENERAL_COMPUTE_JOB',
  route_class: 'DATACENTER',
  artifact_digest: 'sha256:<64 hex>',
  consent_required: true,
  required_capabilities: ['GENERAL_CPU'],
  total_units: 100000,
  chunk_units: 1000,
  metadata: {
    purpose: 'batch-render'
  }
}
```

HELIOS turns the range into disjoint units such as:

```text
chunk 000000 → offset 0      length 1000
chunk 000001 → offset 1000   length 1000
chunk 000002 → offset 2000   length 1000
...
```

The same dispatcher can instead receive explicit partitions when a workload cannot be represented as a numeric range.

## Node contract

A node periodically advertises a heartbeat:

```js
{
  node_id: 'helios-device-42',
  node_kind: 'HELIOS_CLIENT',
  firmware_version: '1.0.0',
  capabilities: ['GENERAL_CPU'],
  resource_policy: {
    compute_consent: true,
    max_concurrent: 1,
    cpu_percent: 20,
    gpu_allowed: false,
    immediate_revoke: true
  },
  telemetry: {
    load: 0.22,
    temperature_c: 61,
    reliability: 0.98,
    latency_ms: 37,
    available_memory_mb: 6000,
    estimated_watts: 48
  }
}
```

A stale, revoked, overheated or non-consenting node is not eligible for new work.

## Assignment lifecycle

```text
QUEUED
  ↓ select eligible node
LEASED
  ↓ node ACK
ACKED
  ↓ optional renew while working
ACKED
  ↓ result arrives
VERIFYING
  ↓ verifier accepts
VERIFIED
```

Failure path:

```text
LEASED / ACKED
  ↓ timeout / disconnect / verifier reject
NEW FENCING TOKEN
  ↓
REASSIGN
```

After the attempt fuse is exhausted the chunk and its parent job fail closed.

## What counts as a completed job

A job is not complete because a browser says that it worked. Completion requires every chunk to reach `VERIFIED`. Only then can the aggregator run and the dispatcher emit a `janus.helios.swarm.receipt.v1` record.

That receipt is still not a payment receipt by itself. Provider settlement remains a separate authoritative adapter/verifier layer.

## Datacenter offload interpretation

This execution plane makes the intended HELIOS offload path concrete:

```text
elastic / partitionable data-center job
              ↓
HELIOS admission
              ↓
consenting compatible nodes
              ↓
verified work returned
```

It is intended for workloads that can be safely partitioned and independently verified. A sponsor/provider pilot is still required to measure real throughput, failure rate, device-hours, watt-hours and unit economics before claiming production offload or profitability.

## Buzz principle preserved

**The coordinator owns assignment truth; workers own only the exact fenced slice they were leased; a result has no authority until independently verified.**
