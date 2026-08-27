# HELIOS Desktop Fabric v2

## Purpose

`src/helios-desktop-fabric.js` is the active HELIOS execution-plane coordinator for distributing admitted work across explicitly consenting desktop, workstation or server-class agents.

`src/helios-desktop-agent.js` is the active local runtime contract for an individual desktop-class machine.

The pair is intentionally specified around HELIOS requirements rather than ESP32 constraints:

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
  DISPATCHABLE SLICE SELECTION
              ↓
 FENCED LEASE + EXECUTION BUDGET
              ↓
     HELIOS DESKTOP AGENT
              ↓
 EXACT APPROVED EXECUTOR + SHA-256
              ↓
       PROVIDER VERIFY
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

A HYBRID workload defaults to requiring both `GENERAL_CPU` and `GENERAL_GPU` capability. A workload may also declare minimum logical cores, RAM, VRAM and additional capability tags.

Agents advertise current capabilities and resource policy through authenticated-heartbeat hooks. An agent is rejected for new work when, for example, it has no compute consent, is revoked, exceeds its concurrency limit, is too hot, violates its power/battery policy, lacks required memory/VRAM or does not expose required capabilities.

## Scheduler fairness

The scheduler sorts queued work by effective priority with aging, but it does **not** blindly dispatch the first queue entry.

Instead it walks the ordered candidates and selects the highest-priority slice that is **currently dispatchable** to an eligible resource pool.

This matters when, for example:

```text
priority 100 → GPU job → no eligible GPU right now
priority  10 → CPU job → eligible CPU available
```

The CPU job may run. The unschedulable GPU job does not head-of-line block the whole scheduler tick.

The regression is covered by `tests/desktop-fabric-invariants.test.mjs`.

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

Generic `command`, `shell`, `script`, `eval`, process-spawn, credential and secret-bearing fields are rejected by the generic workload boundary. A real provider adapter maps an admitted typed workload to its own approved execution mechanism outside the browser.

## Desktop agent runtime

The desktop runtime is deliberately **not** a remote shell.

An executor must be registered in advance against the exact tuple:

```text
provider_id
+ task_type
+ artifact SHA-256
= approved executor
```

If that tuple is not registered, the machine refuses the assignment with `APPROVED_EXECUTOR_NOT_FOUND_FOR_EXACT_ARTIFACT`.

The runtime does not import Node `child_process` and the buyer preflight explicitly checks that no generic `exec`, `spawn` or `eval` process-execution primitive appears in the active desktop-agent source.

### Double enforcement of user limits

The coordinator includes an `execution_budget` in each assignment based on the selected agent's advertised policy. The local agent then checks it again.

The controller may make a budget **stricter**, but cannot widen local user limits. Examples that fail closed:

- controller CPU % above local limit;
- controller GPU % above local limit;
- controller temperature ceiling above local ceiling;
- controller concurrency above local maximum;
- unlimited/higher watt budget when the user imposed a watt cap.

Immediately before execution, the agent also rechecks:

- lease expiry;
- local CPU core capacity;
- currently available RAM;
- currently available VRAM;
- thermal state;
- watt state;
- battery/AC-power policy;
- active consent / revoke state;
- required capabilities;
- exact approved executor binding.

This is intentional defense in depth: a stale, compromised or simply outdated coordinator decision cannot override the current local resource policy.

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

The desktop agent independently rechecks `lease_expires_at_ms` before local execution, so an already-expired assignment is rejected before an executor starts.

## Verification and provenance

A returned result is not credited merely because an agent says it completed. The provider-specific verifier must return `true` before a slice reaches `VERIFIED`.

After successful verification, HELIOS records:

- `verified_agent_id` on the slice;
- `verified_at_ms` on the slice;
- a deduplicated `participating_agents` list in the final fabric receipt;
- `slice_provenance[]` linking every verified slice to the agent and verification time.

A HELIOS fabric receipt is emitted only after every slice verifies. That fabric receipt records execution completion but deliberately does **not** claim authoritative provider payment/settlement.

## Historical Buzz/ESP32 boundary

Earlier HELIOS repository history contained a `helios-swarm-dispatcher.js` implementation that explicitly documented Buzz/JANUS swarm lineage. That historical fact is not hidden or rewritten.

The active desktop fabric and desktop agent are HELIOS requirements-first implementations and have **no active code dependency on `janus-distributed-ai-swarm` or Buzz ESP32 firmware**. The central HELIOS multi-gateway resource-routing product architecture is documented separately from that historical worker implementation.

This is a stronger diligence posture than cosmetic renaming: the active product contract, coordinator, desktop runtime, tests and data-room references now point to the HELIOS-native desktop fabric rather than the removed Buzz-derived dispatcher.

## Production boundary

This is an increasingly complete coordination/agent core, not proof that production distributed compute has already been solved. Before a real commercial deployment, HELIOS still needs at minimum:

- real provider adapter(s);
- durable authenticated multi-host state;
- production agent transport/authentication;
- provider authentication/signatures;
- server-side receipt verification and anti-replay;
- real thermal/energy telemetry validation;
- independent security/privacy review;
- non-money pilot with measured throughput, failures, device-hours, watt-hours and unit economics.

No distributed-consensus, exactly-once execution or production-readiness claim is made by this public prototype.
