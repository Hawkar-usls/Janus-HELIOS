# JANUS HELIOS — Security Policy

JANUS HELIOS is currently a public capability/evaluation prototype. This policy exists to keep security findings, transaction diligence, and future production hardening separate from ordinary feature discussion.

## Supported public surface

The current public repository and GitHub Pages build are evaluation surfaces. They do not contain production provider credentials, authoritative settlement infrastructure, real-money certification, or a production datacenter execution plane.

Security review should distinguish:

- public demo/browser behavior;
- repository source and build integrity;
- provider adapter / receipt verification design;
- future server-side production components;
- future authenticated swarm transport;
- regulated game deployment, if any.

## Reporting a vulnerability

Please do not publish exploitable details, credentials, private partner information, or a working exploit in a public issue.

Use GitHub private vulnerability reporting / Security Advisories if available for this repository, or use a private communication channel established with the project owner during technical evaluation or due diligence.

A report should include, where possible:

1. exact commit SHA;
2. affected file/component;
3. reproduction steps;
4. impact;
5. whether the issue affects the public demo only or a proposed production design;
6. any suggested mitigation.

No bug bounty or payment is promised by this policy unless separately agreed in writing.

## Security invariants

The following are architectural requirements, not optional UI behavior:

- browser/provider secrets are forbidden;
- unverified receipts have zero authoritative ledger value;
- compute is off by default;
- compute requires explicit revocable consent;
- game RNG/RTP/payout authority is independent from compute routing;
- arbitrary generic shell/command execution is not a valid swarm workload contract;
- stale swarm lease/fencing tokens cannot regain authority;
- production provider identity, signatures, anti-replay, and receipt verification must be server-authoritative;
- public demo state must not be presented as production settlement truth.

## Production gates

Before any production deployment, complete an independent review appropriate to the deployment, including as applicable:

- threat model;
- dependency/SBOM and licence scan;
- secret scan;
- authentication/authorization review;
- transport encryption and key-management review;
- receipt signature and anti-replay review;
- workload sandboxing/isolation review;
- privacy/data-flow assessment;
- resource/thermal abuse testing;
- incident-response and logging plan;
- regulated gaming / payments / financial / crypto review where relevant.

## Acquisition / buyer diligence

A buyer should not treat this file as a security certification. For a transaction, security representations must refer to an exact closing commit and to disclosed testing actually performed on that snapshot.

Known open production gates remain disclosed in `PROJECT_STATUS.json`, `.janus/HELIOS_DUE_DILIGENCE.json`, and the closing data-room documents.

## Secrets and personal accounts

Never request or transfer the seller's personal GitHub password, email password, MFA secrets, recovery codes, wallet seed phrases, or unrelated account credentials as part of product handover.

Production systems should be recreated under buyer-controlled accounts and buyer-generated secrets. Seller-side secrets should be revoked when no longer needed.
