# JANUS HELIOS — Threat Model

Status: public capability prototype / transaction-readiness security model.

This document describes the **active HELIOS 1.16 architecture**, intended security boundaries and known production gaps. It is not a penetration-test report, legal opinion, game certification or security certification.

## 1. Assets to protect

### User/device assets

- explicit compute consent and immediate revoke;
- CPU/GPU/resource limits;
- thermal, battery and watt policy;
- device availability/capability telemetry;
- local demo profile/history;
- the user's right to keep gameplay independent from compute participation.

### Workload/provider assets

- workload payloads and artifact identity;
- provider manifests, credentials and signing keys;
- result-verification logic;
- authoritative settlement/receipt data;
- private pricing/capacity policy;
- partner/customer confidential information.

### Game/presentation integrity assets

- RNG/outcome authority;
- configured game math and paytable;
- demo balance/accounting consistency;
- bonus state;
- strict game/compute separation;
- strict presentation/game-math separation;
- prohibition on vulnerability/loss-history driven choreography;
- presentation provenance and reduced-motion accessibility.

### Transaction/IP assets

- source provenance;
- exact release identity;
- production-sensitive implementation details;
- private partner contracts/terms;
- explicit Purchased vs Excluded Asset boundaries.

## 2. Active trust boundaries

```text
PUBLIC BROWSER / GAME UI
        │ untrusted presentation client
        ↓
FUTURE AUTHENTICATED GATEWAY / PROVIDER ADAPTER
        │
        ↓
HELIOS DESKTOP FABRIC
        │ admission / placement / fenced leases
        ↓
HELIOS DESKTOP AGENT(S)
        │ local consent + resource + exact-executor recheck
        ↓
WORKLOAD-SPECIFIC RESULT VERIFIER
        │
        ↓
AUTHORITATIVE PROVIDER RECEIPT / SETTLEMENT
```

Optional policy/presentation planes have **less authority** than the execution/game truth layers:

```text
ADAPTIVE POLICY PLANE
        │ may choose only predeclared safe policy arms
        ▼
DUAL-STREAM SAFETY GUARD
        │ may tighten / veto experimental pressure
        ▼
DESKTOP FABRIC / AGENT TRUTH GATES

GAME RESULT (read-only settled signal)
        ├──────────────→ DUAL-STREAM PRESENTATION DIRECTOR
        │                         ↓
        │                VISUAL / AUDIO / NARRATIVE ONLY
        │
        └──────────────→ STELLAR NAVIGATOR
                                  ↓
                         BACKGROUND CAMERA / SKY ONLY
```

The browser is not authoritative for settlement, provider identity, workload truth, production telemetry or secrets.

## 3. Threats and required controls

### T1 — Hidden or non-consensual compute

Threat: execution begins without clear permission or continues after revoke.

Current/design controls:

- compute off by default;
- explicit opt-in;
- visible resource cap;
- immediate revoke requirement;
- local Desktop Agent policy recheck;
- scheduler excludes spin/loss/vulnerability behavior.

Production gate: independently verify node/gateway revoke latency and kill/cancel behavior under active work.

### T2 — Game/compute coupling

Threat: compute changes RNG, RTP, stake, bonus probability, near-miss behavior or personal jackpot weighting.

Controls:

- `GAME RNG ⟂ COMPUTE` invariant;
- compute scheduler basis is consent/device/provider/workload state;
- route and game-mode controls are separate;
- invariant tests reject known coupling paths.

Production gate: independent game-math/code review on the exact certified deployment artifact.

### T3 — Arbitrary code execution on desktop agents

Threat: a generic distributed workload becomes a remote shell.

Active controls:

- `src/helios-desktop-agent.js` is not a generic process launcher;
- executor registration uses exact `provider_id + task_type + artifact SHA-256` binding;
- generic command/shell/script/eval/process-spawn assignment fields are forbidden;
- the agent locally rechecks lease expiry, consent, capacity and resource policy immediately before execution;
- controller budgets may tighten but may not widen local user policy.

Production gates:

- workload-specific sandbox/container/process isolation;
- signed artifact/image allowlist;
- egress policy;
- OS-level watchdog/kill path;
- hardening review for every admitted executor class.

### T4 — Forged result / free credit

Threat: an agent invents a result and receives value without valid work.

Controls:

- provider-specific result verifier is mandatory;
- unverified work has zero authoritative ledger value;
- verified agent identity is recorded per slice;
- aggregation/receipt creation follows verification.

Production gates: workload-specific challenge/duplicate sampling where appropriate and signed authoritative provider receipts.

### T5 — Replay or stale leased work

Threat: an old/disconnected agent returns a result after reassignment.

Controls:

- fenced lease token;
- ACK deadline and lease expiry;
- reassignment receives a new token;
- stale token/result rejected;
- Desktop Agent locally rejects expired assignments.

Production gates: durable lease/replay state across coordinator restarts, authenticated identity, monotonic sequence/nonces where applicable.

### T6 — Agent spoofing / Sybil behavior

Threat: attacker creates fake nodes or impersonates a trusted desktop.

Current core has registration, heartbeat/capability state and explicit authentication boundaries, but the public prototype has no production identity provider.

Production controls may include mTLS/device keys, signed enrollment, rate limits, reputation and/or hardware attestation depending on workload risk.

### T7 — Provider impersonation / manifest substitution

Threat: work/value is redirected to an attacker-controlled endpoint.

Design controls: provider identity and signed manifest are explicit admission gates; provider secrets are forbidden in browser code.

Production gap: real signed provider manifests and authoritative gateway are not connected yet.

### T8 — Receipt forgery / settlement replay

Threat: fabricated/replayed receipt creates duplicated value.

The public receipt surface is explicitly simulated. Production requires provider signatures, server-side verification, unique receipt IDs/nonces, replay state and settlement reconciliation.

### T9 — Workload/customer data exfiltration

Threat: confidential payload is exposed to consumer/edge devices.

Controls/design rule: only workloads suitable for partially trusted distributed execution may be admitted. Public clients never receive production secrets.

Production gates: data classification, minimum chunk disclosure, encryption in transit, sandbox/egress controls, contractual/privacy/export review. Some workloads must remain in a data center.

### T10 — Resource exhaustion / thermal abuse

Threat: a workload exceeds user/device safety policy.

Active controls:

- CPU/GPU/RAM/VRAM admission;
- concurrency limits;
- thermal/power/battery policy;
- local Desktop Agent recheck;
- immediate revoke;
- Quiet Canary sheds optional Side Quests first.

Production gate: real OS/device telemetry and enforcement across representative hardware.

### T11 — Supply-chain compromise

Threat: workflow action, dependency or source change injects malicious behavior.

Current controls:

- GitHub Actions references pinned to immutable commit SHAs;
- checkout credentials not persisted;
- workflow has read-only contents permission;
- package currently declares zero npm dependencies;
- source provenance/third-party register;
- exact commit/tree/per-file SHA-256 closing manifest;
- invariant and secret-scan CI.

Open host-level gates:

- `main` branch protection/ruleset is not currently enabled;
- required status checks are not currently enforced by GitHub settings;
- current commits are not represented as cryptographically signed.

Closing target: protect/freeze the closing branch, require HELIOS Integrity, and use a signed tag/release or equivalent attestation as agreed.

### T12 — Browser DOM/XSS injection

Threat: future live provider/config text reaches unsafe DOM APIs.

Current public config is repository-controlled rather than a live untrusted provider feed.

Production gates: treat provider/workload strings as untrusted; schema validation; text-only DOM APIs where possible; restrictive CSP; no browser secrets regardless of XSS defenses.

### T13 — Transaction snapshot substitution

Threat: buyer reviews one source state and receives another.

Controls: exact commit/tree, clean-tree strict manifest, per-file SHA-256, commit-scoped CI evidence, objective acceptance criteria.

Remaining gate: host-level protected closing branch/ruleset and signed tag/attestation where agreed.

### T14 — Adaptive-policy truth-core erosion

Threat: a learner/optimizer gradually gains authority over artifact identity, verification, signatures, game math or local safety limits.

Active controls:

- learnable actions come only from a predeclared safe arm set;
- unknown policy keys fail closed;
- artifact digest, task type, verifier, signature/secret and game keys are immutable/forbidden;
- Side Quest policy may only tighten the Desktop Agent execution budget;
- self-tested acceleration requires equivalence before promotion and can be demoted on cross-check failure.

Production gates: review the admitted arm vocabulary for each deployment and keep policy-memory integrity/versioning authoritative.

### T15 — Forged/stale safety evidence

Threat: optimization is admitted because telemetry or verifier/rollback readiness is stale, fabricated or over-aggregated.

Active Dual-Stream Safety Guard rules:

- safety reserve is bottleneck-based, not hidden by a favorable average;
- required gates include active consent, immediate revoke, verifier readiness, exact artifact binding and fresh telemetry;
- insufficient safety limits/rejects change pressure; missing evidence is not synthetically increased.

Production gates: authoritative telemetry provenance/freshness, trusted rollback readiness, verifier-confidence definition, failure-injection tests.

### T16 — Presentation Director authority or retention leak

Threat: a visual/music system becomes a hidden gambling/retention controller or overrides core reel animations.

Active controls:

- Director consumes read-only settled presentation events;
- it uses paid-win boolean only, not wager-relative magnitude;
- bet size, balance pressure, losses, near misses, wagering history, inferred vulnerability and problem-gambling labels are forbidden inputs;
- RNG/RTP/paytable/bet/bonus/compute authority is `NONE`;
- Director owns only its dedicated wrapper transform stage, not reel/cell game transforms;
- reduced-motion preference is respected, including runtime changes;
- accent audio requires the existing music opt-in.

Production gate: independent frontend/game-math review ensuring no certified deployment rewires those event boundaries.

### T17 — Stellar Navigator authority, provenance or accessibility leak

Threat: a cosmetic sky/navigation layer becomes a hidden game/retention signal, performs undeclared network/catalogue loading, introduces unlicensed external data/assets, or ignores reduced-motion requirements.

Active controls:

- `helios-stellar-nav.js` is presentation-only Canvas 2D;
- RNG/RTP/payout/bet/bonus probability and compute/provider selection effects are `NONE`;
- bet, balance, loss streak, near miss, wager history and inferred vulnerability are not inputs;
- no `fetch`, XHR or WebSocket path exists in the active module;
- no runtime third-party dependency is required;
- the faint field is deterministic synthetic Fibonacci-sphere geometry rather than a downloaded catalogue;
- bright anchors are manually curated rounded astronomical facts and are not marketed as a scientific catalogue;
- `prefers-reduced-motion` disables travel/warp motion;
- `wisnc/stellar-map` is recorded as design-study-only because no root licence was found during review; no source/catalogue/constellation/Messier/image asset from that project is incorporated.

Production/closing gates:

- preserve the third-party/provenance notice if the visual implementation evolves;
- require explicit compatible licence review before importing any future external catalogue, texture, image or source fragment;
- include the navigator in frontend performance/accessibility review across representative phones/desktops;
- keep presentation events read-only and independent from certified game math.

## 4. Explicitly untrusted browser claims

Browser display alone is not authoritative evidence of provider acceptance/payment, scientific impact, compute earnings, receipt validity, regulator approval or datacenter savings.

## 5. Minimum production security gates

```text
AUTHENTICATED GATEWAY
SIGNED PROVIDER MANIFEST
NODE IDENTITY / ENROLLMENT
ENCRYPTED TRANSPORT
WORKLOAD SANDBOX / EGRESS POLICY
DURABLE LEASE + REPLAY STATE
AUTHORITATIVE RESULT VERIFIER
SIGNED RECEIPTS + ANTI-REPLAY
SECRET MANAGEMENT
RESOURCE / THERMAL ENFORCEMENT
TRUSTED TELEMETRY FOR SAFETY POLICY
PRIVACY DATA-FLOW REVIEW
INDEPENDENT SECURITY REVIEW
INCIDENT RESPONSE / LOGGING
```

Regulated gambling, financial, crypto, medical or other regulated deployments add independent requirements.

## 6. Review rule

Revisit this threat model whenever a real provider adapter, production gateway, workload/executor class, identity system, authoritative settlement path, learnable policy arm, safety metric, presentation event source, external visual catalogue or presentation runtime dependency is introduced.
