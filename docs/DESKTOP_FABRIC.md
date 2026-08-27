# HELIOS Desktop Fabric v2

## Purpose

`src/helios-desktop-fabric.js` is the active HELIOS execution-plane core for distributing admitted work across explicitly consenting desktop, workstation or server-class agents.

It is intentionally specified around HELIOS requirements rather than ESP32 constraints:

```text
PROVIDER / DATA CENTER / OPERATOR
              ↓
        HELIOS ROUTER
              ↓
       DESKTOP FABRIC
              ↓
   PROVIDER ADAPTER + ADMISSION
              ↓
 CPU / GPU / HYBRID RESOURCE POOLS
              ↓
 SLICE → FENCED LEASE → ACK → VERIFY
              ↓
        FABRIC RECEIPT
```

The game remains a presentation and consent surface. Slot events never become scheduler inputs.

## Hardware target

The active fabric is designed for machines with substantially more resources than an ESP32-class worker:

- multi-core desktop CPUs;
- discrete GPUs;
- CPU-only, GPU-only or hybrid workloads;
- memory and VRAM requirements;
- per-agent concurrency;
- thermal limits;
- battery/AC-power policy;
- optional watt-budget gating;
- reliability and latency telemetry.

An ESP32 is not required by the active fabric.

## Placement model

A workload declares a resource class:

- `CPU`
- `GPU`
- `HYBRID`

It may also declare minimum logical cores, RAM, VRAM and capability tags. Agents advertise their current capabilities and resource policy through authenticated heartbeats. An agent is rejected for new work when, for example, it has no compute consent, is revoked, exceeds its concurrency limit, is too hot, violates its power/battery policy, lacks required memory/VRAM or does not expose required capabilities.

## Workload contract

Example:

```js
{
  workload_id: 'render-2026-0001',
  provider_id: 'operator-render',
  type: 'GENERAL_COMPUTE_JOB',
  route_class: 'DATACENTER',
  artifact_digest: 'sha256:<64 hex>',
  consent_required: true,
  priority: 25,
  requirements: {
    resource_class: 'GPU',
    min_logical_cores: 8,
    min_memory_mb: 16384,
    min_vram_mb: 12000,
    required_capabilities: ['GENERAL_GPU', 'CUDA']
  },
  total_units: 1000,
  shard_units: 25,
  metadata: {
    purpose: 'approved-batch-render'
  }
}
```

Generic `command`, `shell`, `script`, `eval`, credential and secret-bearing fields are rejected by the generic workload boundary. A real provider adapter must map an admitted typed workload to its own safe execution mechanism outside the browser.

## Provider adapter model

A provider adapter is registered by `provider_id` and supplies at minimum:

- `dispatch(agentId, assignment)`;
- `verify({ workload, slice, agent_id, output, at })`.

Optional cancellation can be supplied as `cancel(...)`.

The public HELIOS project does not place provider secrets in the browser. Real authentication, signed manifests, durable state and authoritative provider settlement remain production gates.

## Queue and backpressure

The fabric has bounded workload/slice capacity. If the queue would exceed the configured bound, submission fails with:

`FABRIC_BACKPRESSURE_QUEUE_FULL`

Priority is combined with time-based aging so old lower-priority work can gain scheduling weight rather than waiting forever behind a permanent stream of newer jobs.

## Provider circuit breaker

Repeated provider dispatch failures increment provider health state. After the configured failure threshold, dispatch to that provider is paused for a cooldown period. This prevents one unhealthy adapter from consuming the whole scheduler loop.

## Fenced lease model

Each dispatched slice receives a cryptographically random `lease_id` that acts as a fencing token.

```text
current lease holder → may ACK / renew / submit
expired holder       → no authority
reassignment         → new lease_id
old result           → STALE_FENCING_TOKEN
```

ACK and lease expiry are separate deadlines. A lost agent can therefore be reaped and its slice retried without accepting a late stale result from the previous holder.

## Verification

A returned result is not credited merely because an agent says it completed. The provider-specific verifier must return `true` before a slice reaches `VERIFIED`.

A HELIOS fabric receipt is emitted only after every slice verifies. That fabric receipt records execution completion but deliberately does **not** claim authoritative provider payment/settlement.

## Historical Buzz/ESP32 boundary

Earlier HELIOS repository history contained a `helios-swarm-dispatcher.js` implementation that explicitly documented Buzz/JANUS swarm lineage. That historical fact is not hidden or rewritten.

The active v2 desktop fabric is a HELIOS requirements-first implementation and has **no active code dependency on `janus-distributed-ai-swarm` or Buzz ESP32 firmware**. The central HELIOS multi-gateway resource-routing product architecture is documented separately from that historical worker implementation.

This is a stronger diligence posture than cosmetic renaming: the active product contract, source file, tests and data-room references now point to the desktop fabric rather than the removed Buzz-derived dispatcher.

## Production boundary

This module is a coordination core, not proof that production distributed compute has already been solved. Before a real commercial deployment, HELIOS still needs at minimum:

- real provider adapter(s);
- durable authenticated multi-host state;
- provider authentication/signatures;
- server-side receipt verification and anti-replay;
- real thermal/energy telemetry validation;
- independent security/privacy review;
- non-money pilot with measured throughput, failures, device-hours, watt-hours and unit economics.

No distributed-consensus or exactly-once execution claim is made by this public prototype.
