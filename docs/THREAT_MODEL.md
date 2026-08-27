# JANUS HELIOS — Threat Model

Status: public capability prototype / transaction-readiness security model.

This document describes the intended security boundaries and known production gaps. It is **not** a penetration-test report or security certification.

## 1. Assets to protect

### User/device assets

- explicit compute consent state;
- CPU/GPU/resource limits;
- thermal/battery safety policy;
- local demo profile/history;
- device availability and capability telemetry;
- user ability to revoke compute immediately.

### Workload / provider assets

- workload payloads;
- provider identity and manifests;
- provider credentials and signing keys;
- verification logic;
- settlement/receipt data;
- private pricing and capacity policy;
- customer/partner confidential information.

### Game integrity assets

- game RNG/outcome authority;
- configured game math;
- demo balance/accounting consistency;
- bonus state;
- strict separation between game events and compute scheduling.

### Transaction / IP assets

- source provenance;
- exact release integrity;
- production-sensitive implementation details;
- private partner contracts and commercial terms.

## 2. Trust boundaries

```text
PUBLIC BROWSER / GAME UI
        │
        │ untrusted client boundary
        ↓
FUTURE AUTHENTICATED GATEWAY
        │
        ├── PROVIDER / WORKLOAD OWNER
        │
        └── SWARM COORDINATOR
                 │
                 ↓
          CONSENTING NODES
                 │
                 ↓
          RESULT VERIFIER
                 │
                 ↓
       AUTHORITATIVE RECEIPT
```

The public browser is **not** an authoritative settlement or provider-secret boundary.

## 3. Threats and required controls

### T1 — Hidden or non-consensual compute

Threat: workload execution occurs without clear user permission or continues after revocation.

Current/design controls:

- compute off by default;
- explicit opt-in;
- visible resource cap;
- immediate revoke requirement;
- scheduler basis excludes spin/loss behavior.

Production gate:

- independently verify that revoke stops work promptly at node/gateway level, not only in UI.

### T2 — Game/compute coupling

Threat: compute activity changes RNG, RTP, bonus probability, stake, near-miss behavior, or personal jackpot weighting.

Controls:

- `GAME RNG ⟂ COMPUTE` architectural invariant;
- compute routes and game modes are separate controls;
- test invariants reject known coupling paths;
- compute scheduler is based on consent/device/provider/workload state, not spin frequency.

Production gate:

- independent game-math/code review for the certified deployment artifact.

### T3 — Arbitrary code execution on nodes

Threat: a generic workload becomes a remote shell / command channel.

Controls in `src/helios-swarm-dispatcher.js`:

- generic shell/command/script/exec fields are forbidden;
- workloads are typed and capability-admitted;
- transport and verifier are explicit injected boundaries.

Production gate:

- workload-specific sandbox/isolation model;
- image/artifact allowlisting and signatures;
- OS/container/device isolation review;
- egress restrictions appropriate to workload.

### T4 — Forged result / free credit

Threat: a node invents a successful result and obtains value without performing valid work.

Controls:

- result verifier is mandatory;
- unverified result has zero authoritative value;
- aggregation only after all required chunks verify.

Production gate:

- workload-specific verification;
- duplicate/challenge sampling where appropriate;
- authoritative provider receipt/signature.

### T5 — Replay / stale worker result

Threat: disconnected worker returns an old result after reassignment.

Controls:

- per-assignment random lease/fencing token;
- ACK deadline;
- lease expiry;
- reassignment receives a new token;
- stale fencing token rejected.

Production gate:

- durable coordinator state;
- authenticated node identity;
- replay cache / monotonic sequence policy across process restarts.

### T6 — Node spoofing / Sybil behavior

Threat: attacker registers many fake nodes or impersonates a trusted device.

Current core:

- authentication hook exists;
- capability/heartbeat/resource admission exists.

Production gap:

- no real identity/attestation provider is connected in the public prototype.

Required production controls may include mTLS/device keys, signed enrollment, rate limits, reputation and/or hardware attestation depending on the workload risk.

### T7 — Provider impersonation / manifest substitution

Threat: client routes work or value to an attacker-controlled endpoint.

Current design:

- signed provider manifest is an explicit production gate;
- browser secrets forbidden.

Production gap:

- signed provider manifest and authoritative gateway are not yet connected.

### T8 — Receipt forgery / settlement replay

Threat: fabricated or repeated receipt creates duplicated value.

Current design:

- browser receipt is explicitly simulated;
- production receipt verification and anti-replay are open gates.

Required production controls:

- provider signatures;
- server-side verification;
- unique receipt IDs/nonces;
- replay store;
- settlement reconciliation.

### T9 — Workload/customer data exfiltration

Threat: confidential payload is exposed to consumer nodes or public clients.

Controls/design rule:

- public client must not receive production secrets;
- only workloads suitable for distributed untrusted/partially trusted execution should be admitted;
- private payloads belong behind production policy.

Production gate:

- data classification;
- minimum necessary chunk disclosure;
- encryption in transit;
- sandbox/egress controls;
- privacy/legal review;
- do not route unsuitable confidential workloads to consumer devices.

### T10 — Resource exhaustion / thermal abuse

Threat: workload harms device availability or runs outside user policy.

Current dispatcher primitives:

- CPU/resource policy;
- concurrency limit;
- temperature guard;
- battery guard;
- load-aware scheduling;
- node revoke.

Production gate:

- real OS/device telemetry and enforcement;
- watchdog/kill path;
- validation across representative hardware.

### T11 — Supply-chain compromise

Threat: workflow action, dependency, library, or source modification injects malicious code.

Current controls:

- GitHub Actions dependencies pinned to immutable commit SHAs;
- package currently declares no npm dependencies;
- source-available provenance/third-party register;
- exact commit/tree/file hash closing manifest;
- secret scan and invariant CI.

Remaining controls:

- branch protection/ruleset;
- independent SBOM/licence scan;
- signed closing tag/release or equivalent attestation;
- dependency pinning/version review as dependencies are introduced.

### T12 — XSS / DOM injection in public UI

Threat: untrusted provider/config text reaches `innerHTML` or equivalent unsafe DOM surface.

Current public config is repository-controlled, not a live untrusted provider feed.

Production gate:

- treat all live provider/workload strings as untrusted;
- use text-only DOM APIs where possible;
- schema validation/sanitization;
- restrictive CSP;
- no secrets in the browser even if XSS defenses exist.

### T13 — Transaction snapshot substitution

Threat: buyer reviews one source state and receives another.

Controls:

- exact commit SHA;
- exact tree SHA;
- strict clean-tree manifest;
- per-file SHA-256;
- CI evidence tied to one commit;
- objective acceptance criteria.

Remaining gate:

- protected closing branch/ruleset and signed tag/attestation where agreed.

## 4. Explicitly untrusted claims

The following are not authoritative merely because the browser displays them:

- provider acceptance;
- provider payment;
- scientific impact;
- real compute earnings;
- production receipt validity;
- regulator approval;
- datacenter savings.

Authoritative claims require the relevant external evidence.

## 5. Production security gates

Before production, close at minimum:

```text
AUTHENTICATED GATEWAY
SIGNED PROVIDER MANIFEST
NODE IDENTITY / ENROLLMENT
ENCRYPTED TRANSPORT
WORKLOAD SANDBOX
DURABLE LEASE / REPLAY STATE
AUTHORITATIVE RESULT VERIFIER
SIGNED RECEIPTS
ANTI-REPLAY
SECRET MANAGEMENT
RESOURCE / THERMAL ENFORCEMENT
PRIVACY DATA-FLOW REVIEW
INDEPENDENT SECURITY REVIEW
INCIDENT RESPONSE / LOGGING
```

Regulated gambling, financial, crypto, medical or other regulated deployments add their own independent requirements.

## 6. Review rule

This threat model must be revisited whenever a real provider adapter, production gateway, new workload class, new dependency, persistent identity system or authoritative settlement path is introduced.
