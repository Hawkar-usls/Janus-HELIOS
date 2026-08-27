# JANUS HELIOS — Seller Disclosure Schedule Template

> Fill and sign only as part of a real transaction with counsel. This template is intentionally conservative and must not be treated as a completed representation.

## A. Seller identity and authority

- Legal seller name: `<fill>`
- Capacity/authority to sell the listed assets: `<fill>`
- Entity/individual status: `<fill>`
- Relevant tax/VAT/business registration information: `<fill if applicable>`

## B. Purchased asset ownership

For each Purchased Asset, disclose:

```text
asset
seller basis of ownership/control
other contributors
third-party licence/background IP
prior assignment or exclusive licence
encumbrance/security interest
known ownership claim
```

Do not write `none` until the relevant history has actually been reviewed.

## C. Contributors and development history

- Git contribution review completed: `<yes/no/date>`
- Non-GitHub contributors identified: `<list or none after review>`
- Contractors/employees involved: `<list/status>`
- Written assignments/licences obtained where needed: `<list>`
- AI-assisted development used: `YES — disclosed in legal/BACKGROUND_IP_AND_PROVENANCE.md`
- Buyer-specific AI policy exceptions, if any: `<fill>`

## D. Open-source / third-party material

- SBOM scan tool/version: `<fill>`
- Scan date/closing commit: `<fill>`
- Licence findings: `<attach report>`
- Material notices: `THIRD_PARTY_NOTICES.md`
- Known incompatible/unresolved licence issues: `<fill>`

## E. Background IP

Disclose any background technology used by HELIOS but not assigned outright.

Current known lineage to review:

- `Hawkar-usls/janus-distributed-ai-swarm` — MIT-licensed Buzz/swarm lineage.

If a buyer needs continuing rights to seller-retained background IP beyond public/open-source rights, define the licence expressly in the definitive agreement.

## F. Security / credentials

- Production credentials embedded in closing source: `<must be NO or disclosed/remediated>`
- Seller personal passwords/MFA included: `NO`
- Known undisclosed backdoors intentionally included: `<seller factual response after review>`
- Security review report: `<attach if commissioned>`

## G. Contracts / provider relationships

List only actual agreements, not outreach emails or discussions:

```text
counterparty
agreement date
subject
assignable?
consent needed?
change-of-control clause?
confidentiality restriction?
included in transaction?
```

If no contracts are being assigned, state that expressly after review.

## H. Litigation / claims / takedowns

Disclose known written claims relating to the Purchased Assets, including copyright, trademark, patent, confidentiality, payment or repository ownership claims.

`<fill after actual review>`

## I. Patents and trademarks

- Patent applications/registrations included: `<exact list or none>`
- Trademark applications/registrations included: `<exact list or none>`
- Unregistered product names proposed for transfer: `<list>`
- Clearance performed: `<jurisdiction / adviser / date>`

Do not represent `patented`, `patent pending`, or `registered trademark` without an actual record.

## J. Product status

Seller disclosure should be consistent with the repository truth boundary:

- public build is a capability/evaluation prototype;
- real-money certification is not included by default;
- provider settlement is not production-connected by default;
- profitability and data-center offload are not guaranteed;
- full test PASS may be stated only after execution on the exact closing snapshot.

## K. Exceptions

Any negotiated exception to seller representations/warranties should be recorded here rather than hidden in email.

`<fill>`
