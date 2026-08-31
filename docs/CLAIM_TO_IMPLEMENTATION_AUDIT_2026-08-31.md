# HELIOS Claim → Implementation Audit — 2026-08-31

## Purpose

This audit answers a buyer-facing question:

> **When HELIOS says it can do something, where does that claim actually live?**

A file existing in the repository is not enough. Material claims are classified as:

| State | Meaning |
|---|---|
| **ENFORCED** | The active execution path applies the invariant before effect. |
| **IMPLEMENTED_CORE** | Executable first-party core exists and is tested, but external production authority/integration remains incomplete. |
| **DEMO_PREVIEW** | Public UI demonstrates the interaction or policy without real external authority. |
| **EXTERNAL_GATE** | Truth requires real providers, sensors, signatures, devices, legal/regulatory review or field evidence. |

Machine-readable record: [`.janus/HELIOS_CLAIM_IMPLEMENTATION_AUDIT_2026-08-31.json`](../.janus/HELIOS_CLAIM_IMPLEMENTATION_AUDIT_2026-08-31.json).

## Executive result

The audit removed implementation/doc drift, tightened active execution paths and kept external claims behind explicit gates. The Standard Pilot Authority is likewise not promoted merely because payment code exists: its route, RPC evidence and exact activating commit are separately gated.

Important corrections include removal of the decorative `87% STABLE` hardware score, explicit feature loading, hardware-pressure rather than human-interaction observation, Host-first QoS in the Desktop Agent, generic Smart Compute Node evidence, and a fail-closed automated standard-pilot licensing path.

## Core claim matrix

### Game / compute constitutional separation — **ENFORCED**

```text
COMPUTE → RNG                  FORBIDDEN
COMPUTE → RTP                  FORBIDDEN
COMPUTE → BONUS ODDS           FORBIDDEN
COMPUTE → PERSONAL JACKPOT     FORBIDDEN
HARDWARE PRESSURE → GAME MATH  FORBIDDEN
```

### Explicit consent and local resource sovereignty — **ENFORCED**

Compute is opt-in and revocable. Desktop Agent independently enforces local caps.

### Hardware Guardian — **ENFORCED**

Guardian may tighten/block execution and cannot widen the requested budget. Missing thermal evidence is not painted green.

### Hardware-aware / human-blind — **ENFORCED**

Screen, keyboard, mouse, microphone, camera, clipboard, browser history, process/game name and active-window content are forbidden hardware-policy inputs.

### Host-first QoS — **ENFORCED**

```text
CONTROLLER BUDGET
      ↓
LOCAL USER POLICY
      ↓
HARDWARE GUARDIAN
      ↓
HOST-FIRST QoS
      ↓
FINAL EXECUTOR BUDGET
```

Every stage can only preserve or reduce external compute.

### Provider Authority Epoch — **IMPLEMENTED_CORE**

Default-deny/scoped authority core exists, but every generic Router/Fabric production dispatch is not yet end-to-end bound to it.

### Receipt Provenance / True Work Accounting / Device Health Passport — **IMPLEMENTED_CORE**

First-party structures and invariants exist. Real signatures, durable settlement, real sensor provenance and persistent field evidence remain external gates.

### Smart Compute Node — **IMPLEMENTED_CORE**

One record combines work evidence, device state, Guardian decision, Host-first budget, Device Health Passport, provenance and replication lineage. Generic work includes AI inference, render, science, transcode, storage/network, operator batch and custom work.

### NerdMinerV2 × JANUS I0 / Edge Constellation / Evidence Independence — **IMPLEMENTED_CORE**

Research/compatibility logic exists with strict boundaries. Real firmware/bridges, heterogeneous fleet and attested lineage roots remain external gates.

### Standard Pilot Authority — **IMPLEMENTED_CORE / ARMED-DISABLED PENDING FINAL ACTIVATION**

The standard licensing path is:

```text
NAMED REQUEST
+ FROZEN TERMS ACCEPTANCE
+ AUTHORITY / SCOPE CERTIFICATIONS
+ UNIQUE EXACT INVOICE
+ EXACT USDT / ETHEREUM PAYMENT
+ TWO-SOURCE RPC QUORUM
+ 64 CONFIRMATIONS
+ TRANSACTION NON-REUSE
→ PILOT_ACTIVE
```

Core law:

```text
PAYMENT IS EVIDENCE ≠ PAYMENT IS AUTHORITY
```

The frozen route is now established from current owner-supplied Binance UI evidence:

```text
network    Ethereum Mainnet (ERC20)
chain_id   1
asset      USDT / USD₮
contract   0xdAC17F958D2ee523a2206206994597C13D831ec7
receiver   0x7149081aea54fbef57effeb52a5a966b81cc03a0
memo/tag   not required by the frozen route
anchor     10,000.000000 USDT
```

The expanded Binance screen showed trading credit after `6` confirmations and withdrawal unlock after `64`; HELIOS chooses `64` as the automatic-grant threshold.

A single RPC cannot grant a license. The current low-volume observation quorum is PublicNode + dRPC. A 1RPC candidate was explicitly rejected after live GitHub Actions showed that the required `eth_getLogs` method was unavailable. PublicNode + dRPC then passed the live pre-activation smoke on commit `fdde711f5b2831a533629528ac81821dafebd61c`, run `33358927756`.

The watcher has no wallet private key, seed, Binance password, withdrawal key, signing authority or transaction-broadcast authority.

The standard grant remains a 90-day controlled **non-money** pilot: non-exclusive, non-transferable, non-sublicensable, no source resale, no HELIOS Core transfer, no real-money gambling, no public production and no automatic commercial rights.

Current policy remains deliberately `enabled: false` until the **final activating commit itself** passes both HELIOS Integrity and HELIOS Pilot RPC Quorum. This prevents a previously green commit from certifying a later activation change.

The automation is not a KYC/sanctions-screening/tax/gambling-regulatory engine and applicable law overrides it.

### Public Buyer Lab — **DEMO_PREVIEW**

No live mining, live provider jobs, live device temperature/watts, invented health percentage or authoritative settlement is claimed by the static public page.

### Market uniqueness — **EXTERNAL_GATE / MARKET-REVIEWED CLAIM**

HELIOS does not claim invention of each component. The maintained claim is only that the 2026-08-31 public review did not identify a public commercial product exposing the same complete maintained HELIOS combination as one licensable B2B control plane. This is not a patent/FTO opinion.

### Production readiness — **EXTERNAL_GATE**

HELIOS remains a reference/evaluation prototype. Production compute truth still requires real providers/manifests, authenticated transport, real telemetry, signed/anti-replay receipts, sandbox/egress policy, independent review and a partner-operated pilot.

## Commercial consequence

HELIOS now distinguishes:

```text
WHAT IS ENFORCED NOW
WHAT EXISTS AS IMPLEMENTED CORE
WHAT THE PUBLIC DEMO ONLY PREVIEWS
WHAT A REAL PARTNER PILOT MUST PROVE
WHAT A STANDARD PILOT PAYMENT MAY LICENSE
```

A standard paid pilot is deliberately **not** equivalent to a production/commercial licence.

## Audit law

> **No buyer-facing HELIOS claim may be promoted from `IMPLEMENTED_CORE` or `EXTERNAL_GATE` to `ENFORCED` without execution-path evidence and a green exact-commit integrity run.**

For automated licensing:

> **No prior successful payment/RPC test certifies a later activating commit. The exact commit that enables Pilot Authority must itself pass HELIOS Integrity and HELIOS Pilot RPC Quorum.**
