# Contributing to JANUS HELIOS

JANUS HELIOS is source-available for evaluation and is being prepared for possible commercial licensing, pilots, and acquisition discussions. Contribution provenance therefore matters as much as code quality.

## Important: submission is not automatic acceptance

Opening an issue, pull request, patch, discussion, or sending code does **not** mean the project has accepted that material into the product.

The maintainer may close or decline unsolicited contributions, especially where ownership, licensing, provenance, privacy, security, or transaction-readiness is unclear.

## Required provenance for accepted code contributions

Before copyrightable code or assets are merged, the contributor must be able to state that:

1. they have the legal right to submit the contribution;
2. the contribution is not copied from a source whose licence is incompatible with this repository;
3. all third-party/open-source portions are identified with source, version if known, and licence;
4. no employer/client/contractor agreement prevents the submission;
5. no secrets, personal data, confidential partner information, credentials, or private datasets are included;
6. AI-assisted material is disclosed when relevant to project or buyer policy rather than represented as independently authored if that would be inaccurate.

## Inbound rights

A contribution will not be treated as transaction-clean merely because GitHub technically allowed it to be submitted.

Before merge, the project owner may require a separate written contributor agreement, assignment, or licence sufficient to:

- use and modify the contribution;
- distribute it as part of HELIOS;
- sublicense or commercially license HELIOS;
- transfer HELIOS or the relevant Purchased Assets in an acquisition;
- preserve any third-party notices required by the contribution.

If the required inbound rights are not clear, the contribution should remain unmerged.

## No automatic relicensing of third-party work

Do not paste code, media, documentation, schemas, fonts, audio, icons, SDK samples, or other copyrighted material into HELIOS and assume the repository-level licence replaces its original licence.

Third-party material retains its original obligations and must be entered into `THIRD_PARTY_NOTICES.md` where relevant.

## Engineering boundaries

Contributions must preserve the core HELIOS invariants:

- compute OFF by default;
- explicit revocable opt-in;
- no hidden cryptojacking;
- no compute influence on RNG, RTP, win probability, stake, bonus probability, or player-specific jackpot weighting;
- no arbitrary generic shell-command workload channel in the swarm dispatcher;
- unverified provider results have no authoritative settlement value;
- public demo claims remain distinguishable from production-validated claims.

## Security contributions

Do not post a live exploit or sensitive vulnerability in a public pull request. Follow `SECURITY.md`.

## Transaction freeze

During an acquisition/closing freeze, no contribution should be merged into the closing branch/snapshot after the agreed freeze commit unless both parties explicitly update the closing manifest and acceptance baseline.

## Maintainer note

This policy is intended to keep the project contribution history auditable. A definitive commercial transaction should still perform a complete contribution/chain-of-title review; this file is not a substitute for that review.
