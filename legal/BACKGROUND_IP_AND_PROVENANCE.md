# JANUS HELIOS — Background IP & Provenance Record

> Transaction-preparation record for due diligence. It is evidence organization, not a legal conclusion about ownership in every jurisdiction.

## Current repository ownership context

The public repository `Hawkar-usls/Janus-HELIOS` is controlled by the `Hawkar-usls` GitHub account. Recent inspected commits are authored/committed under that identity. A definitive transaction should still obtain a seller representation/attestation covering the complete contribution history and any non-GitHub contributions.

## AI-assisted development disclosure

HELIOS has been developed with AI-assisted coding/review workflows under seller direction. This repository therefore does **not** make the overbroad representation that every character was typed manually by one human.

For transaction purposes:

- architectural choices, feature requirements, acceptance decisions and repository publication are controlled by the seller;
- AI assistance should be disclosed rather than hidden during diligence;
- the definitive agreement should make only jurisdiction-appropriate representations about copyright authorship/ownership;
- a buyer should not infer that AI assistance is itself a warranty of non-infringement or a defect in title.

## HELIOS-native product architecture

The seller's project record treats the central HELIOS concept as a HELIOS-native architecture: a configurable multi-destination compute-routing layer presented alongside, but authority-separated from, game/slot UX.

The active product thesis includes:

- a universal multi-route HELIOS router;
- replaceable provider/data-center/operator/custom destinations;
- explicit resource consent and resource policy;
- provider-independent execution receipts/history;
- a strict `GAME RNG ⟂ COMPUTE` authority boundary;
- a reusable B2B presentation/integration layer.

This central multi-gateway resource-routing architecture is **not attributed in the current project record to Buzz or to the ESP32 swarm implementation** merely because an earlier HELIOS execution-plane module reused/generalized some coordinator/worker lessons from that repository.

## Historical Buzz / JANUS distributed swarm lineage

An earlier HELIOS repository revision contained `src/helios-swarm-dispatcher.js` and `.janus/HELIOS_SWARM_DISPATCHER.json`. Those files explicitly documented generalized lineage from:

`Hawkar-usls/janus-distributed-ai-swarm`

That historical record is not rewritten or concealed.

### Historical licence boundary of the separate swarm repository

Swarm revisions through commit:

`b644af87de104b405427a8c0ae3c35c8d192507c`

were published under MIT for repository-authored code with the copyright notice:

`Copyright (c) 2026 Hawkar-usls / JANUS project`

Those historical MIT rights are not represented as retroactively revoked. A recipient of covered historical material may continue exercising the applicable MIT rights for that material.

Beginning with relicensing commit:

`a1df4ee660f523bf014d739726458ecd1c909587`

new maintained swarm revisions moved to the **JANUS Distributed AI Swarm Source-Available Evaluation License**. Later additions and modifications first published under that licence are not automatically offered under MIT merely because an ancestor was MIT-licensed.

The separate swarm repository records this in `LICENSE_HISTORY.md`, `IP_NOTICE.md`, `THIRD_PARTY_NOTICES.md`, and `.janus/SWARM_IP_BOUNDARY.json`.

## Active HELIOS Desktop Fabric v2 boundary

The active execution plane is now:

- `src/helios-desktop-fabric.js` — desktop/workstation scheduler and coordination core;
- `src/helios-desktop-agent.js` — local fail-closed desktop runtime;
- `.janus/HELIOS_DESKTOP_FABRIC.json` — machine-readable active contract;
- `docs/DESKTOP_FABRIC.md` — architecture and production boundary;
- `tests/desktop-fabric-invariants.test.mjs` — scheduler/resource/provenance invariants;
- `tests/desktop-agent-invariants.test.mjs` — local lease/resource/executor invariants.

It is maintained as a **HELIOS requirements-first desktop/workstation implementation** and has no active code dependency on `janus-distributed-ai-swarm` or Buzz ESP32 firmware.

Its target model is materially different from the historical microcontroller worker target. The active fabric explicitly models:

- multi-core CPU resource pools;
- discrete GPU and hybrid CPU/GPU placement;
- RAM and VRAM admission;
- desktop concurrency;
- thermal, watt-budget and battery/AC-power policy;
- provider adapter circuit breaking;
- bounded queue backpressure;
- priority aging;
- dispatchable-work selection that prevents an unavailable GPU class from head-of-line blocking runnable CPU work;
- provider-specific result verification;
- fenced leases and stale-result rejection;
- per-slice verified agent provenance;
- exact provider/task/artifact-SHA executor binding on the local desktop agent;
- a controller execution budget that may be stricter than, but may not widen, the local user's resource policy;
- local rechecking of lease expiry, cores, RAM, VRAM, thermals, power, battery state and consent immediately before execution.

The active desktop agent is not implemented as a generic remote shell. Its buyer gate rejects generic process-execution primitives in the active runtime and rejects command/script/credential-bearing assignment fields.

The active snapshot therefore does not require assignment of the `janus-distributed-ai-swarm` repository for a HELIOS-only transaction.

### What this does and does not claim

This separation is **not** represented as a magical erasure of Git history or of historical MIT grants. A buyer can inspect the historical repository record.

It also does not claim exclusive ownership of broad distributed-systems ideas such as heartbeats, queues, leases, retries, worker pools, scheduling or fencing tokens. The transaction value lies in the concrete HELIOS implementation, product architecture, maintained versions, documentation, tests, integration work, brand assets and any separately protected rights.

If a future closing snapshot re-introduces source copied/adapted from an historical MIT-covered swarm revision, the applicable MIT notice must remain with that covered material. If source from later source-available swarm revisions is incorporated, the definitive agreement must expressly address the required background-IP licence or assignment.

## Specialized child repositories

`DIVINE_REALM` and `SSlot` are referenced by HELIOS as specialized ecosystem children. Reference, interoperability or lineage does not make those repositories part of a HELIOS-only transaction. They are excluded unless specifically listed and priced in the Purchased Assets Schedule.

## Third-party dependency posture

At the current audited repository snapshot:

- `package.json` declares no npm runtime or development dependencies;
- the public page uses system font stacks rather than bundled proprietary font files;
- provider integrations in the public demo are configuration/contracts, not bundled proprietary provider SDKs;
- third-party/open-source material, if introduced later, must be recorded in `THIRD_PARTY_NOTICES.md` before a closing snapshot.

This is not a substitute for an automated SBOM/license scan at closing.

## Contributor / chain-of-title closing gate

Before signing a definitive IP Assignment, complete a contribution provenance review covering:

1. full Git commit author/committer history;
2. merged pull requests and external patches, if any;
3. copied/adapted third-party snippets;
4. commissioned work, contractor work or employee work, if any;
5. visual/audio assets not generated or authored within the project;
6. AI-assisted code-generation disclosures relevant to buyer policy;
7. background repositories materially incorporated into the closing snapshot;
8. the exact historical/current licence boundary for any incorporated swarm material;
9. confirmation that the closing snapshot's active desktop fabric/agent does not silently re-introduce removed Buzz/ESP32 source.

For each non-seller contributor with copyrightable material not already covered by a compatible inbound licence, obtain an assignment or sufficient licence before closing.

## Seller attestation to prepare for closing

A closing data room should include a signed seller statement substantially covering:

- seller identity and authority to enter the transaction;
- disclosed contribution sources;
- disclosed open-source/background IP;
- known encumbrances, if any;
- known third-party claims, if any;
- no undisclosed transfer or exclusive licence of the same Purchased Assets.

The exact representation and liability standard belong in the definitive agreement and should be reviewed by transaction counsel.
