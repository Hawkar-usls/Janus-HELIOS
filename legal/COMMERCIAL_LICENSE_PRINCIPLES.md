# HELIOS — Commercial License Principles

**Status:** non-binding discussion framework for counsel and qualified counterparties.  
**Not a signed license, legal opinion, tax advice, regulatory approval or fixed commercial offer.**

## 1. Intended relationship

HELIOS is intended to be commercialized primarily through licensing rather than by requiring the IP owner to become an iGaming operator, cloud provider, data-center operator or end-user support organization.

```text
LICENSOR
owns HELIOS Core / defined Background IP
        ↓ license
LICENSEE
funds, builds, integrates, operates, sells and supports production deployment
```

## 2. Indicative opening economics

The following is a negotiating framework only:

```text
pilot license / integration right:
USD 10,000–25,000 indicative discussion range

commercial running royalty after successful commercialization:
2%–5% of contractually defined HELIOS-attributable compute revenue

alternative:
fixed amount per verified / monetized device-hour
```

These figures are **not** a valuation of HELIOS and do not cap the value of broader exclusivity, source access, custom development, geographic rights or acquisition rights.

The parties may replace the percentage with another structure where it better matches the licensee's economics.

## 3. Royalty denominator

A definitive agreement should define `HELIOS-attributable compute revenue` narrowly enough to avoid ambiguity.

Unless specifically negotiated otherwise, it should not automatically include:
- unrelated casino GGR;
- player deposits or wagering volume;
- unrelated sportsbook revenue;
- unrelated cloud/infrastructure revenue;
- taxes;
- pass-through provider, hosting, power or settlement costs;
- unrelated services/support revenue.

## 4. Science / Public Benefit Discount

The licensor may approve a reduced or zero **HELIOS platform royalty** for qualified public-benefit workloads.

Potential qualifying classes:
- academic/nonprofit scientific research;
- medical or public-health research;
- humanitarian/public-interest computation;
- independently reviewed open-science workloads.

Approval should be workload-specific and written.

This policy does not waive third-party compute, electricity, cloud, settlement, security, tax or compliance costs.

## 5. Background IP remains with licensor

Unless a definitive agreement expressly assigns ownership, the following remain licensor Background IP:
- HELIOS Core architecture and maintained source;
- provider-neutral routing contracts;
- Hardware Guardian concepts/implementation in HELIOS;
- Trust Fabric and provider-authority model;
- Smart Compute Node fusion contract;
- Device Health Passport implementation;
- receipt provenance / true work accounting;
- Edge Constellation / Evidence Independence implementation;
- future general HELIOS improvements created outside a licensee-specific statement of work;
- separately scoped JANUS technology, including JANUS I0, unless expressly included.

## 6. Licensee freedom to build

A licensee should be able to do real engineering rather than receive a frozen demo.

Subject to the signed agreement, the licensee may be permitted to:
- integrate HELIOS into its own platform;
- build production adapters and gateways;
- customize UI/branding;
- implement provider-specific verification;
- add operational tooling;
- create licensee-specific backends;
- deploy within the agreed field, territory and term;
- use approved subcontractors and sublicensing channels where expressly allowed.

## 7. Anti-circumvention / no standalone clone

The commercial goal is not to stop legitimate independent innovation. The goal is to prevent a licensee from receiving protected HELIOS source, specifications and know-how, reproducing substantially the same protected implementation under another name, and then using that substitute specifically to avoid the agreed license/royalty.

A definitive agreement should therefore address, to the extent enforceable under governing law:
- no resale of HELIOS source as a standalone competing product;
- no removal of required provenance/licensing notices;
- no sublicensing outside the permitted chain;
- no deliberate royalty avoidance through renaming or superficial reimplementation of licensed protected materials;
- audit/reporting rights limited to the licensed economics.

Copyright alone does not monopolize abstract ideas, algorithms or business methods. Counsel must draft this boundary carefully.

## 8. Improvements boundary

A balanced model should distinguish:

**General/core improvements**
- changes to reusable HELIOS Core, Guardian, Trust Fabric, Smart Compute Node, receipt model or provider-neutral contracts;
- preferred outcome: licensor retains or receives a negotiated license-back / shared-use right.

**Licensee-specific improvements**
- proprietary operator integrations;
- internal infrastructure;
- customer-specific adapters;
- proprietary datasets and operational tooling;
- preferred outcome: may remain licensee property, subject to any interfaces needed for HELIOS interoperability.

The exact allocation is negotiable and should be explicit.

## 9. Exclusivity is earned, not parked

Exclusivity should be limited by field, territory and time, and should require meaningful performance.

Possible conditions:
- funded pilot by an agreed deadline;
- commercial launch milestone;
- minimum annual royalty/guarantee after launch;
- minimum active operator/provider deployment;
- regular reporting.

Failure to meet the agreed performance floor should normally convert the license to non-exclusive rather than block the technology indefinitely.

## 10. Licensee operational responsibility

Unless separately contracted, the licensor should have no obligation to:
- obtain gambling/operator licenses;
- operate the casino or sportsbook;
- procure compute/data-center capacity;
- operate production infrastructure 24/7;
- perform KYC/AML;
- maintain player accounts or payments;
- provide end-user support;
- guarantee workload demand;
- guarantee profitability;
- certify legal/regulatory compliance.

Reasonable architecture handover and agreed integration consultation may be separately scoped.

## 11. Production boundaries survive licensing

A commercial license must not erase HELIOS safety laws:

```text
COMPUTE -> RNG / RTP / PERSONAL WIN ODDS       FORBIDDEN
COMPUTE -> UNDISCLOSED WAGERING ADVANTAGE      FORBIDDEN
CONTROLLER -> WIDER USER DEVICE LIMITS          FORBIDDEN
UNKNOWN SENSOR STATE -> INVENTED HEALTH CLAIM   FORBIDDEN
UNVERIFIED WORK -> AUTHORITATIVE VALUE          FORBIDDEN
```

Production real-money gambling, privacy, cybersecurity, tax, consumer protection, labor, crypto, data-transfer and compute-workload obligations remain subject to the applicable jurisdiction and counterparties.

## 12. Source-available evaluation repository

Public repository access remains governed by `LICENSE.md`.

This document does not grant production rights. Only a separately signed agreement can do that.
