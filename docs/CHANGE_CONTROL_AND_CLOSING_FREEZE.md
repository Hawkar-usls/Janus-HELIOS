# JANUS HELIOS — Change Control & Closing Freeze

This policy is intended to make a transaction candidate reproducible and to prevent a buyer or seller from confusing a previously reviewed commit with a later modified state.

## Normal development

During active development, `main` may continue to change. A green CI result applies only to the exact commit on which it ran.

All material changes should preserve:

- `HELIOS Integrity` CI;
- code/provenance review requirements in `CONTRIBUTING.md`;
- `CODEOWNERS` review ownership;
- third-party notice updates where dependencies/assets are introduced;
- transaction boundaries in `BUYER_HANDOFF_SPEC.json` and `.janus/HELIOS_DUE_DILIGENCE.json`.

## Recommended GitHub ruleset

Before a real acquisition/licensing closing freeze, repository settings should require at minimum:

1. pull request before merge to the closing branch or protected `main`;
2. successful `HELIOS Integrity` status check;
3. required Code Owner review for transaction-sensitive files;
4. no force-push;
5. no branch deletion;
6. conversation resolution where applicable;
7. administrator bypass either disabled or documented and exceptional;
8. signed commits/tags if the parties agree to that assurance level.

At the time this document was introduced, branch protection was not represented as already enabled. Repository documentation must not claim enforcement until GitHub settings actually enforce it.

## Closing freeze procedure

When a buyer and seller nominate a closing candidate:

```text
NOMINATE COMMIT
→ STOP FEATURE MERGES INTO CLOSING CANDIDATE
→ HELIOS INTEGRITY PASS
→ SBOM / LICENCE / SECURITY REVIEW AS AGREED
→ STRICT CLOSING MANIFEST
→ RESOLVE ALL DISCLOSED EXCEPTIONS
→ TAG / SIGN OR OTHERWISE ATTEST EXACT COMMIT
→ BUYER HASH VERIFICATION
→ OBJECTIVE ACCEPTANCE
```

No file should be silently changed after the manifest is generated.

If a fix is required after freeze:

```text
OLD CANDIDATE = ABANDONED FOR CLOSING
→ FIX IN NEW COMMIT
→ NEW CI RUN
→ NEW SBOM/REVIEWS AS MATERIALITY REQUIRES
→ NEW MANIFEST
→ NEW ACCEPTANCE BASELINE
```

## No mutable “latest version” delivery

A definitive handover must not identify the purchased code merely as “latest main” or “current repository.” It should identify the exact commit SHA and tree SHA.

## Emergency exception

If a security issue requires an urgent change during closing, disclose the change to the buyer, create a new candidate, rerun the agreed gates, and regenerate integrity evidence. An emergency does not justify silently altering the purchased snapshot.

## Ownership of repository settings

After repository transfer, the buyer should recreate/verify required branch protections and rulesets under its own organization. Seller personal credentials are not part of this control system and must not be transferred.
