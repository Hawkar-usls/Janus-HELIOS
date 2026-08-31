# HELIOS Standard Pilot License v1.0

Copyright (c) 2026 Hawkar-usls. All rights reserved.

This Standard Pilot License is a limited pilot-only commercial licence for JANUS HELIOS. It is separate from the repository-wide Source-Available Evaluation License in `LICENSE.md`.

## 1. How this pilot licence becomes effective

A pilot grant becomes effective only when **all** of the following conditions are satisfied:

1. a person submits a HELIOS Pilot Request through the repository's standard pilot-request channel;
2. the request identifies the legal entity receiving the grant and the GitHub identity bound to the pilot;
3. the submitter affirmatively accepts this exact licence version and certifies authority to bind the named grantee;
4. the submitter accepts the non-production / non-real-money boundary and the exact-network payment rule;
5. HELIOS Pilot Authority issues a specific invoice tied to that request;
6. the exact invoiced amount is observed on the exact approved blockchain, token contract and receiving address within the invoice validity period;
7. the payment reaches the configured confirmation threshold and is not detected as removed, failed, reused or otherwise invalid; and
8. HELIOS Pilot Authority emits a `PILOT_ACTIVE` grant record bound to the request, this licence version, the terms digest and the payment transaction.

A transfer sent without a valid Pilot Request or outside the issued invoice does **not** by itself create any licence right.

> **PAYMENT IS EVIDENCE, NOT AUTHORITY.**

The authority arises only from satisfaction of the complete grant conditions in this licence and the corresponding Pilot Authority policy.

## 2. Grant

Subject to the conditions and restrictions in this licence, the copyright holder grants the named grantee a limited, revocable, non-exclusive, non-transferable and non-sublicensable right, for the stated pilot term, to:

- internally evaluate HELIOS;
- internally integrate HELIOS with the grantee's own pilot systems;
- modify HELIOS source only as reasonably necessary for the named pilot;
- conduct one controlled non-money pilot associated with the named Pilot Request;
- run approved test compute workloads within that controlled pilot; and
- collect technical, security, reliability, device-care and unit-economics measurements needed to decide whether to negotiate a broader commercial agreement.

The standard automated pilot term is **90 days** from the grant's effective timestamp unless the grant record expressly states a shorter period.

## 3. Rights not granted

This Standard Pilot License does **not** authorize real-money gambling or wagering, public production deployment, sublicensing, source resale or transfer of HELIOS Core ownership.

The Standard Pilot License does **not** grant any right to:

- operate real-money gambling or wagering using HELIOS;
- launch a public production HELIOS service;
- represent HELIOS as regulator-approved, security-certified or production-certified;
- sublicense, resell, lease or independently distribute HELIOS source;
- transfer ownership of HELIOS Core or other JANUS intellectual property;
- use the pilot licence as an assignment of copyright, patent rights, trademarks, trade secrets, future inventions or general know-how;
- detach HELIOS Core from the licence by creating a substantially derivative commercial clone for the purpose of avoiding the applicable HELIOS commercial licence;
- use JANUS I0 or any separately scoped Background IP unless a separate written grant expressly includes it;
- obtain exclusive rights by making the pilot payment; or
- automatically convert the pilot into a commercial, production, perpetual or acquisition licence.

Commercial production deployment requires a separate written commercial agreement.

## 4. Grantee and personnel boundary

The grant applies only to the legal entity identified in the Pilot Request. The grantee may allow its employees and contractors to access HELIOS solely as reasonably necessary for the named pilot, provided those persons are bound to protect the Materials and do not receive independent sublicensing or resale rights.

The person submitting the Pilot Request represents that they are authorized to bind the named grantee. A false authority representation does not create rights in a third party that never validly accepted this licence.

The automated flow deliberately does not request passports, home addresses, phone numbers, seed phrases or wallet private keys.

## 5. Payment terms and exact-network rule

The controlling invoice identifies:

- blockchain network and chain ID;
- token and token contract;
- receiving address;
- exact token amount;
- invoice issue time and expiry;
- this licence version; and
- a SHA-256 digest of these terms.

Only the exact payment described by the invoice satisfies the automatic payment gate. Sending a different token, a different amount or the correct token on a different network does not automatically grant rights.

The standard pilot invoice may include a deterministic discount of less than one USDC below the stated standard pilot fee solely to create a unique on-chain payment fingerprint. This fingerprint is a discount, not a surcharge.

Accidental, unmatched, late, wrong-network, underpaid or overpaid transfers are subject to manual review and applicable law; they do not create automatic licence rights merely because value reached an address associated with the copyright holder or a custodial provider.

Once a valid `PILOT_ACTIVE` grant is issued, the pilot fee is earned for the pilot right granted, except to the extent a refund is required by applicable law or separately agreed in writing.

## 6. Cryptocurrency and custody boundary

HELIOS Pilot Authority is verification-only. It observes public blockchain evidence; it does not need, request, store or use the receiving wallet's private key, seed phrase, withdrawal credential or exchange password.

A public receiving address may be operated through a custodial provider such as an exchange. Custody, conversion, withdrawal, tax reporting and account access remain outside HELIOS Pilot Authority.

The grantee is responsible for using the exact network and asset shown in the invoice. Blockchain transfers may be irreversible.

## 7. Legal and compliance condition

The grantee represents that entering the pilot and making the payment are lawful for it and that the pilot will not knowingly be used to evade sanctions, export controls, anti-money-laundering requirements, gambling regulation, consumer-protection rules, tax obligations or other applicable law.

The automated pilot licence does not itself perform regulated identity verification, sanctions screening, tax registration, gaming certification or legal due diligence. Where applicable law requires additional review before rights may be exercised, those mandatory requirements control and the grantee must not treat automation as a substitute for them.

No automated grant authorizes a regulated real-money deployment.

## 8. Game / compute constitutional boundary

The grantee must not modify the pilot so that compute contribution, hardware class, compute throughput, resource policy, provider status or payment status changes an individual's RNG outcome, RTP, wager result, bonus probability or personal jackpot weighting.

The following HELIOS constitutional rule survives all pilot modifications:

`GAME RNG ⟂ COMPUTE`

## 9. Device-sovereignty boundary

A pilot must preserve the principle that local hardware protection can reduce or stop external compute and that external throughput cannot override local device-safety policy.

The grantee must not use HELIOS hardware-care mechanisms as a pretext to collect screen content, keyboard content, mouse content, microphone content, camera content, browser history, active-window content, game names or process-name surveillance where HELIOS marks those inputs forbidden.

## 10. Core ownership and pilot improvements

HELIOS Core remains the copyright holder's Background IP. Pilot access does not transfer ownership.

Buyer-specific adapters, deployment tooling and proprietary backend components independently created by the grantee may remain the grantee's property, subject to any third-party rights and any later negotiated agreement.

Nothing in this Standard Pilot License automatically assigns the grantee's independent inventions to the copyright holder. Likewise, nothing automatically grants the grantee ownership of HELIOS Core improvements merely because the grantee can modify the pilot copy.

Treatment of material reusable HELIOS Core improvements should be addressed expressly in any later commercial agreement.

## 11. No warranty; pilot status

THE PILOT MATERIALS ARE PROVIDED **AS IS**, WITHOUT WARRANTY OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, NON-INFRINGEMENT, SECURITY, AVAILABILITY, PROFITABILITY, REGULATORY APPROVAL OR PRODUCTION READINESS.

The public HELIOS repository is a reference/evaluation prototype. A pilot grant is permission to evaluate and integrate it within the stated scope, not a representation that production distributed compute, regulated gambling, authoritative settlement, hardware-longevity improvement or any financial result has already been established.

## 12. Termination and expiry

The pilot expires automatically at the timestamp recorded in the grant unless extended by a separate written agreement.

Rights may terminate earlier upon material breach. After expiry or termination, the grantee must stop uses that depend on this pilot licence and remove pilot-only deployed copies where reasonably practicable, except for immutable records that must be retained by law or solely for evidentiary/compliance purposes.

No automatic renewal applies.

## 13. Commercial discussions after a successful pilot

A successful pilot may lead to a separately negotiated commercial licence. No fixed royalty, exclusivity, territory or production scope is granted by this document.

The current non-binding commercial discussion framework is described separately in HELIOS commercial materials and may include a success-aligned running royalty or verified-device-hour model. Those illustrative commercial terms are not incorporated into this Standard Pilot License unless a later written agreement expressly adopts them.

Qualified scientific or public-benefit workloads may receive reduced or zero HELIOS platform royalty only under a separate written commercial or public-benefit grant.

## 14. Relationship to other repository licences

This Standard Pilot License grants additional pilot rights only to a grantee holding an active grant. It does not replace third-party licences or override excluded/background material.

Where this document grants a specific active pilot right that is broader than `LICENSE.md`, this document controls for that grantee and that pilot only. All rights not expressly granted remain reserved.

## 15. Evidence record

The authoritative operational evidence for an automated standard pilot consists of the combination of:

- the Pilot Request;
- the exact version of this licence;
- the SHA-256 terms digest recorded by the invoice;
- the invoice record;
- the verified on-chain transaction evidence; and
- the repository-authenticated `PILOT_ACTIVE` grant record.

A grant-record digest is evidence of record integrity; it is not a substitute for a digital signature unless an actual cryptographic signing mechanism is expressly identified.

---

**Standard Pilot License version:** `1.0`

**Core law:** `PAYMENT_IS_EVIDENCE_NOT_AUTHORITY`
