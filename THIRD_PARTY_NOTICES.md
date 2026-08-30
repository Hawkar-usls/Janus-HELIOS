# JANUS HELIOS — Third-Party & Background-IP Notices

This file is the transaction-facing register for third-party, open-source, and separately scoped background material that may need to accompany a commercial handover.

## Current audited items

### JANUS distributed swarm lineage

Repository: `Hawkar-usls/janus-distributed-ai-swarm`

Relationship: same GitHub owner / JANUS background engineering, but a separate repository and separate transaction asset unless expressly included.

Historical project licence boundary:

- repository-authored swarm material through commit `b644af87de104b405427a8c0ae3c35c8d192507c` was published under MIT;
- those historical MIT rights are not retroactively withdrawn;
- the first source-available relicensing commit is `a1df4ee660f523bf014d739726458ecd1c909587`;
- later maintained swarm revisions use the JANUS Distributed AI Swarm Source-Available Evaluation License unless a file states otherwise.

Historical copyright notice:

`Copyright (c) 2026 Hawkar-usls / JANUS project`

Historical HELIOS revisions documented architectural lineage from that repository. The active HELIOS Desktop Fabric/Agent no longer has a runtime dependency on Buzz/ESP32 swarm code.

If substantial source copied/adapted from a historical MIT-covered swarm snapshot is present in a HELIOS closing candidate, the applicable MIT notice and permission terms must remain with that covered material.

If later source-available swarm material is incorporated, the transaction must expressly state the background-IP licence or assignment that permits the buyer to use that material. A HELIOS-only sale does not silently transfer the whole swarm repository.

Architectural similarity alone is not treated as proof that source code was copied; closing review must inspect the exact source snapshot rather than infer licensing from concepts alone.

### `wisnc/stellar-map` design reference

Repository reviewed: `wisnc/stellar-map`.

Reason for review: visual/product research for a more convincing astronomy-inspired moving background in HELIOS.

The repository README describes an offline planetarium rendering naked-eye stars, constellation lines, some planets and the Moon. During the 2026-08-27 HELIOS review, no repository `LICENSE` file was found at the root.

HELIOS therefore treats this repository as a **design-study reference only**:

- no `stellar-map` source file is copied into HELIOS;
- no generated star catalogue is copied;
- no constellation, Messier or label data is copied;
- no screenshots, BMP/PNG assets or splash images are copied;
- HELIOS does not import or depend on the repository at runtime.

The independently written `helios-stellar-nav.js` uses general astronomical/rendering concepts such as spherical star coordinates, perspective camera projection, apparent-brightness styling and camera easing. Its small bright-star anchor list consists of manually curated rounded astronomical facts; its faint background is deterministic synthetic geometry.

This notice does **not** claim that broad concepts such as sky projection, magnitude-based brightness or camera easing are proprietary to either project.

### NerdMinerV2 external compatibility target

Repository reviewed: `BitMaker-hub/NerdMiner_v2`.

License: MIT.

Copyright notice: `Copyright (c) 2023 Bitmaker`.

Relationship: external compatibility target for the optional HELIOS Edge Hash Lab. NerdMinerV2 implements ESP32 Stratum mining and remains third-party software under its own licence. HELIOS currently does **not** vendor, copy, fork, or silently modify NerdMinerV2 source code or firmware. The public HELIOS layer contains an independently written compatibility/bridge contract and presentation surface only.

The active boundary is:

- stock NerdMinerV2 remains an external device/firmware target;
- HELIOS does not claim ownership of NerdMinerV2, its firmware, name, or upstream project;
- the public HELIOS page does not connect to a mining pool through NerdMinerV2 and does not collect its Wi-Fi credentials, pool password, wallet private material or seed data;
- optional JANUS I0 structured-traversal scheduling is not represented as a stock NerdMinerV2 capability and requires a separately reviewed compatible bridge or firmware path;
- no sponsorship, endorsement, partnership, commercial relationship or pool relationship with Bitmaker/NerdMinerV2 is implied.

If a future HELIOS revision copies, modifies, distributes, embeds or ships a substantial portion of NerdMinerV2 source or firmware, the applicable MIT copyright notice and permission notice must be preserved with that material and the exact closing SBOM/provenance package must be updated.

The separate first-party repository `Hawkar-usls/janus-io` / `JANUS I0` is not third-party material. It is separately scoped Background IP and is addressed in the HELIOS transaction schedules rather than being silently bundled with this compatibility target.

## Package dependencies

At the current repository snapshot, `package.json` contains no declared npm dependencies.

This does **not** replace a closing-time dependency/SBOM scan. If dependencies, external SDKs, fonts, images, sounds or other third-party assets are added, update this register before release or acquisition closing.

## Provider names and integrations

References to compute providers, markets, networks, routes or example destinations are descriptive/integration-oriented unless a separate written agreement says otherwise. Such references do not imply sponsorship, partnership, trademark ownership, exclusivity, or transferable provider contracts.

A contact, email discussion, referral, demo review, or technical conversation is not a transferable commercial agreement unless an actual agreement permits assignment.

## Closing rule

Before any commercial handover:

1. run an automated dependency/SBOM and licence scan on the exact closing commit;
2. compare results with this file;
3. inspect exact swarm/HELIOS source overlap rather than relying only on architectural descriptions;
4. preserve all required historical MIT and third-party notices;
5. disclose any source-available, proprietary, copyleft or field-of-use restrictions;
6. document any separately licensed Background IP needed by the Purchased Assets;
7. confirm that externally reviewed design references did not silently become copied source/data/assets;
8. block closing if an incompatible or unknown material licence remains unresolved.

## No false title warranty

This register is evidence organization, not a blanket representation that every possible third-party obligation has already been discovered. Definitive title and non-infringement representations must be based on the exact closing snapshot and appropriate legal review.
