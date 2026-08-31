# HELIOS Desktop Fabric v2.1 + Desktop Agent v1.3

## Purpose

`src/helios-desktop-fabric.js` coordinates admitted work across explicitly consenting desktop/workstation/server-class agents.

`src/helios-desktop-agent.js` is the local enforcement runtime. It is deliberately **not a generic remote shell**.

```text
PROVIDER / DATA CENTER / OPERATOR
              ↓
        HELIOS ROUTER
              ↓
       DESKTOP FABRIC
              ↓
 PROVIDER ADAPTER + ADMISSION
              ↓
 CPU / GPU / HYBRID PLACEMENT
              ↓
 FENCED LEASE + CONTROLLER BUDGET
              ↓
     HELIOS DESKTOP AGENT 1.3
              ↓
     LOCAL USER POLICY
              ↓
     HARDWARE GUARDIAN
              ↓
       HOST-FIRST QoS
              ↓
 EXACT APPROVED EXECUTOR + SHA-256
              ↓
       PROVIDER VERIFY
              ↓
        FABRIC RECEIPT
```

The game remains a presentation/consent surface. Slot events never become compute-scheduler inputs.

## Placement and scheduling

The fabric supports `CPU`, `GPU` and `HYBRID` workloads with minimum core/RAM/VRAM/capability constraints. It includes:

- per-agent concurrency;
- bounded queue/backpressure;
- priority aging;
- dispatchable-work selection without resource-class head-of-line blocking;
- provider circuit breaker;
- bounded retries;
- fenced leases, ACK/lease deadlines and stale-result rejection;
- mandatory provider-specific verification before a slice becomes verified.

## Exact executor boundary

An executor must be registered in advance against:

```text
provider_id + task_type + artifact SHA-256
```

If the exact tuple is missing, the Desktop Agent refuses the assignment.

Generic `command`, `shell`, `script`, `eval`, process-spawn, secret and credential-bearing fields are rejected by the generic workload/agent boundary. The active agent does not import Node `child_process`.

## Local budget sovereignty

The coordinator sends an `execution_budget`, but that budget is not final authority.

Desktop Agent v1.3 computes the actual executor budget through a monotonic-contraction chain:

```text
CONTROLLER BUDGET
      ↓ must not exceed
LOCAL USER POLICY
      ↓ may only contract
HARDWARE GUARDIAN
      ↓ may only contract
HOST-FIRST QoS
      ↓
FINAL EXECUTOR BUDGET
```

A controller cannot widen CPU/GPU percentage, temperature ceiling, watt ceiling or concurrency beyond local policy.

## Hardware Guardian

Immediately before effect, the agent evaluates hardware-only evidence such as available temperature/power/load/memory/VRAM/AC/battery signals.

Guardian states:

```text
GREEN / WATCH / THROTTLE / COOLDOWN / BLOCK / UNKNOWN
```

Missing sensor evidence is not automatically healthy. Depending on local policy it enters limited `UNKNOWN` mode or blocks.

## Host-first QoS

Desktop Agent v1.3 now enforces the Trust Fabric Host-first Quiet Canary decision after Guardian.

The policy uses hardware/resource pressure such as CPU/GPU load and memory pressure. External compute yields when local pressure is high.

It does **not** require human-content observation:

```text
SCREEN / KEYBOARD / MOUSE / MIC / CAMERA / PROCESS NAME / GAME NAME / ACTIVE WINDOW
→ FORBIDDEN FOR THIS POLICY
```

This preserves the distinction:

```text
HARDWARE-AWARE ≠ HUMAN-SURVEILLANT
```

## Verification and provenance

A result is not credited merely because an agent says it completed. The provider-specific verifier must accept the result before the fabric marks a slice `VERIFIED`.

The fabric records per-slice verified agent/time provenance and emits a receipt after all slices verify.

That fabric receipt does **not** itself prove external provider payment/settlement. The Trust Fabric Receipt Provenance Envelope exists as an implemented core primitive, but real signatures, anti-replay and authoritative provider settlement remain external production gates.

## Provider Authority Epoch truth boundary

Trust Fabric implements registration ≠ admission, scoped provider leases, authority epochs, dispatch budgets and revocation.

However, generic Router/Fabric dispatch does not yet require the Authority Epoch object on every dispatch. Therefore the correct maturity claim is:

```text
PROVIDER AUTHORITY EPOCH = IMPLEMENTED CORE
END-TO-END ROUTER/FABRIC ENFORCEMENT = OPEN PRODUCTION GATE
```

## Production boundary

The Fabric/Agent pair is a tested execution core, not proof of a production distributed-compute service. Remaining gates include:

- real provider adapter(s) and signed manifests;
- authenticated production agent transport;
- durable multi-host coordination/state;
- end-to-end provider authority-epoch validation;
- real vendor telemetry/energy validation;
- signed provider receipts and anti-replay;
- workload sandbox/egress policy;
- independent security/privacy review;
- partner-operated non-money pilot with throughput, failures, device-hours, watt-hours, throttling and unit economics.

See [`CLAIM_TO_IMPLEMENTATION_AUDIT_2026-08-31.md`](CLAIM_TO_IMPLEMENTATION_AUDIT_2026-08-31.md) for current maturity labels.
