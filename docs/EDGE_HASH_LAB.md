# HELIOS Edge Hash Lab

## Purpose

The Edge Hash Lab adds a low-power physical hash node path to HELIOS without turning the public slot into a hidden miner.

The first compatibility target is `BitMaker-hub/NerdMiner_v2`, an MIT-licensed ESP32 Stratum miner. HELIOS does not vendor NerdMiner source or silently modify its stock firmware. In stock mode, NerdMiner remains an external node with its existing upstream behavior.

The second layer is the seller's separate `JANUS I0` research line from `Hawkar-usls/janus-io`. I0 is not represented as a SHA-256 break or nonce predictor. Its purpose is controlled study of structured nonce/job/lane traversal against a randomized mirror under equal checked-work exposure.

## Product Shape

```text
USER CONSENT
    ↓
HELIOS ROUTER / TRUST FABRIC
    ↓
LOCAL EDGE BRIDGE
    ↓
NERDMINER V2-COMPATIBLE ESP32
    ↓
STRATUM POOL
```

Optional research path:

```text
                 ┌─ JANUS I0 STRUCTURED TRAVERSAL · 50%
FROZEN JOB/WIRE ─┤
                 └─ RANDOMIZED MIRROR          · 50%
                           ↓
                    PER-CHECKED-MH EVIDENCE
```

## Why NerdMinerV2

NerdMinerV2 is useful as an edge target because it already demonstrates a tiny, visible, dedicated Stratum device rather than requiring a large desktop GPU. It supports multiple ESP32-class boards and updates its work when a new Stratum job arrives.

HELIOS treats that as an external compatibility target, not as HELIOS-owned code.

## Why JANUS I0

The useful I0 contribution is not a profit promise. It is research discipline:

- structured traversal instead of treating flat random walking as the only scheduler;
- a strict randomized mirror under the same device, pool/job stream and wire;
- equal checked-work exposure for stronger comparison;
- metrics normalized by checked MH rather than raw event counts;
- frozen wire behavior so scheduler experiments cannot quietly change protocol semantics;
- rare-tail observations treated as signals to reproduce, not proof by anecdote.

The full I0 scheduler remains separately scoped Background IP. HELIOS contains the bridge and evidence contract, not the private scheduler implementation.

## Stock Compatibility Mode

`STOCK_EXTERNAL` means:

- no NerdMiner source is copied into HELIOS;
- no stock firmware behavior is altered by HELIOS;
- HELIOS does not claim to control nonce scheduling inside stock NerdMiner firmware;
- pool, Wi-Fi and wallet configuration remain local to the node or approved bridge;
- the public GitHub Pages demo does not connect to a pool and does not mine.

## I0 Bridge Mode

`JANUS_I0_BRIDGE` is a separate production/research gate. It requires a compatible bridge or firmware integration that can accept controlled traversal assignments without breaking Stratum conformance.

Before any claim, the integration must prove:

1. the same selected pool/job stream is used by both arms;
2. the same frozen wire behavior is preserved;
3. the same hardware/Guardian envelope applies;
4. the checked-work budget is equalized;
5. stale/reconnect/cooldown behavior is recorded;
6. accepted-share evidence is attributable to the correct arm;
7. results are reported per checked MH.

## Evidence Boundary

Useful fields include:

```text
checked_MH
accepted
z28_per_MH
z30_per_MH
z32_per_MH
z33_per_MH
z34_per_MH
max_z
reject_rate
stale_drops
reconnect_count
cooldown
desktop_load_state
```

The correct interpretation is:

```text
OBSERVED DIFFERENCE UNDER CONTROLLED EXPOSURE
```

not:

```text
SHA-256 BREAK
NONCE PREDICTION
GUARANTEED BLOCK ADVANTAGE
GUARANTEED MINING PROFIT
```

## Trust Fabric Binding

A production Edge Hash result can be bound to the existing HELIOS chain:

```text
CONSENT
→ PROVIDER AUTHORITY EPOCH
→ LEASE
→ HARDWARE GUARDIAN / DEVICE POLICY
→ EDGE EXECUTOR + FIRMWARE DIGEST
→ POOL RESULT
→ VERIFIER
→ PROVENANCE RECEIPT
→ DEVICE HEALTH PASSPORT
```

Assigned work is not verified work. A local hash attempt is not an accepted pool share. An accepted pool share is not automatically settlement authority. Those states remain separate.

## Privacy Boundary

The public slot does not ask for:

- Wi-Fi passwords;
- pool passwords;
- wallet private keys;
- seed phrases;
- API credentials.

The public demo also does not need the user's wallet address. Real node configuration belongs on the device or in an approved local bridge.

## IP / Licensing Boundary

### NerdMinerV2

Compatibility target: `BitMaker-hub/NerdMiner_v2`

License: MIT

Copyright notice: `Copyright (c) 2023 Bitmaker`

No NerdMiner source is currently vendored into HELIOS. If future work copies or adapts substantial NerdMiner source, the applicable MIT notice and permission terms must accompany that material.

### JANUS I0

Source project: `Hawkar-usls/janus-io`

Relationship: first-party, separately scoped Background IP.

A HELIOS-only transaction does not automatically assign the full JANUS I0 scheduler, private evidence corpus, runner snapshots or research know-how. Full I0 use requires an express written licence or assignment.

## Commercial Meaning

This turns the mining route into more than "send hashes somewhere".

HELIOS can present a buyer with:

```text
LOW-POWER EDGE HARDWARE
+ EXPLICIT CONSENT
+ DEVICE SOVEREIGNTY
+ STRATUM COMPATIBILITY
+ CONTROLLED SCHEDULER RESEARCH
+ NORMALIZED EVIDENCE
+ PROVENANCE RECEIPTS
```

The point is not that an ESP32 will outperform specialized mining hardware. The point is that HELIOS gains a tangible edge-device route and a disciplined research interface that can later scale to stronger CPU/GPU/ASIC-compatible executors without changing the trust model.
