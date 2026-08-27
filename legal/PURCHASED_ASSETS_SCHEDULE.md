# JANUS HELIOS — Purchased Assets Schedule

> Transaction-preparation document. This is not a signed transfer instrument and does not replace jurisdiction-specific legal advice.

## Purpose

This schedule defines the default scope of a **JANUS HELIOS-only acquisition** so that a buyer does not receive broader JANUS assets by implication.

A definitive Asset Purchase Agreement / IP Assignment should incorporate this schedule by reference and may expand or narrow it only by explicit written amendment.

## Default Purchased Assets

Unless a signed definitive agreement states otherwise, a HELIOS-only acquisition package may include the seller's transferable rights in the following assets as they exist at the agreed closing snapshot:

1. The `Hawkar-usls/Janus-HELIOS` repository contents identified by the closing commit/tree hash.
2. HELIOS-specific source code, schemas, configuration, tests, documentation and buyer-handoff materials in that repository.
3. HELIOS-specific visual design and copy embodied in the repository, subject to disclosed third-party/background-IP rights.
4. HELIOS-specific architecture expressed in the repository, including:
   - universal compute routing contracts;
   - provider-manifest / adapter / verifier / audited-sink integration pattern;
   - HELIOS swarm-dispatcher implementation;
   - HELIOS game/compute separation rules;
   - HELIOS public demo interaction layer.
5. HELIOS-specific goodwill, branding or names **only if the definitive agreement expressly lists the marks/names being assigned**.
6. HELIOS-specific domain, Pages deployment, analytics property or other operational account **only if separately listed by exact identifier**.
7. HELIOS-specific issue/backlog/roadmap material **only if included in the closing data-room index**.

## No Implied Expansion

The words `related`, `derivative`, `successor`, `associated`, `platform`, `JANUS`, `ecosystem`, `technology`, or similar broad descriptors do **not** expand the Purchased Assets beyond items expressly listed in the definitive agreement and its schedules.

## Separate Pricing Required

The following require separate written pricing/scope if a buyer wants them:

- exclusive field-of-use rights;
- country/territory exclusivity;
- worldwide exclusivity;
- perpetual exclusivity;
- assignment of HELIOS/JANUS names or marks;
- assignment of specialized child products;
- seller non-compete beyond narrowly negotiated limits;
- assignment of future inventions;
- custom provider integration work;
- regulatory certification work;
- production operations or managed service;
- transition support beyond the agreed support schedule.

## Closing Snapshot

The definitive agreement should identify the acquisition snapshot using at least:

```text
repository: Hawkar-usls/Janus-HELIOS
branch: main (or explicit release branch)
commit_sha: <exact SHA>
tree_sha: <exact SHA>
release_tag: <signed tag if available>
manifest_sha256: <hash of closing manifest>
```

No later commit is automatically included unless the agreement says so.
