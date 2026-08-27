# JANUS HELIOS — Public / Private Production Boundary

JANUS HELIOS is intentionally public enough to demonstrate the product and support buyer/partner diligence. Public evaluation should not require exposing the secrets, customer data, anti-abuse internals, settlement logic, or partner-specific economics that make a production deployment secure and commercially defensible.

## Public repository may contain

- game/demo UX and presentation;
- public configuration examples;
- compute/game authority separation;
- provider-manifest schemas and reference contracts;
- generic adapter interfaces;
- generic verifier interfaces;
- generic swarm scheduling primitives;
- consent/resource-policy interfaces;
- simulated receipts;
- architecture diagrams;
- transaction-readiness documentation;
- public tests and invariants;
- non-sensitive threat-model and privacy boundaries.

## Private production layer should contain

Where confidentiality is appropriate, keep outside the public browser and public repository:

- provider API credentials;
- signing/private keys;
- wallet/private settlement material;
- buyer/customer secrets;
- private production endpoints;
- provider-specific negotiated pricing;
- customer workload payloads;
- production capacity/dispatch policy that reveals confidential partner economics;
- anti-fraud and anti-abuse rules whose effectiveness depends on secrecy;
- anti-replay state;
- authoritative settlement/reconciliation logic;
- incident-response internals;
- sensitive telemetry/customer identifiers;
- confidential benchmark data;
- non-public integration agreements;
- security-sensitive verifier internals where publication materially weakens abuse resistance.

## Browser boundary

The public/browser client must be treated as observable and modifiable by the user.

Therefore it must never be the sole authority for:

```text
PROVIDER IDENTITY
PROVIDER PAYMENT
AUTHORITATIVE WORK ACCEPTANCE
RECEIPT VALIDITY
SETTLEMENT VALUE
ANTI-REPLAY
SECRET STORAGE
PRODUCTION USER BALANCE
REGULATED GAME OUTCOME CERTIFICATION
```

The browser may display authoritative facts only after receiving them from an appropriate trusted backend/provider proof path.

## Open architecture does not mean open credentials

A buyer should be able to understand the integration pattern without receiving seller personal passwords or requiring public disclosure of future production secrets.

Canonical production unit:

```text
SIGNED/APPROVED PROVIDER MANIFEST
+ AUTHENTICATED ADAPTER
+ SERVER/AUTHORITATIVE VERIFIER
+ AUDITED SINK
+ RESOURCE/CONSENT POLICY
```

The interfaces can be public while each buyer supplies its own private deployment material.

## Swarm boundary

The public `HeliosSwarmDispatcher` demonstrates scheduling semantics. A production swarm should place authoritative coordination behind buyer/operator-controlled infrastructure with:

- node enrollment/authentication;
- encrypted/authenticated transport;
- durable lease/fencing state;
- workload-specific sandboxing;
- workload/customer data classification;
- authoritative result verification;
- replay/abuse protection;
- production monitoring and incident handling.

Do not put live customer payloads or provider credentials into the GitHub Pages demo.

## Commercial moat

Because historical/public disclosure exists, HELIOS should not pretend every broad concept is a trade secret.

A defensible commercial moat can instead combine:

- maintained source-available improvements;
- exact production integrations;
- provider/customer relationships;
- operational know-how;
- private benchmark/economics data;
- security/anti-abuse implementation;
- certification and deployment work;
- brand/trademark rights where actually obtained;
- patents only if separately filed/validated;
- contractual exclusivity where negotiated;
- real network liquidity/device/provider participation.

## Acquisition boundary

A HELIOS buyer receives only what the definitive Purchased Assets / Background IP schedules identify.

A buyer does not need seller personal secrets to receive a functioning code/IP handover. Production credentials should be generated under buyer-controlled accounts after or during handover.

Private partner/customer information can be transferred only when legally and contractually assignable and expressly included.

## Repository hygiene rule

Before every public push or closing candidate:

1. run secret scanning;
2. verify `.gitignore` and local secret separation;
3. review new config/examples for live endpoints or credentials;
4. update third-party notices when external material is added;
5. do not publish private commercial terms merely to make the public demo look more complete.

## Truth invariant

```text
PUBLIC DEMO = UNDERSTANDABLE + EVALUABLE
PRIVATE PRODUCTION = AUTHENTICATED + AUTHORITATIVE + CUSTOMER-SPECIFIC

PUBLIC SOURCE VISIBILITY != PRODUCTION SECRET DISCLOSURE
PUBLIC REPOSITORY ACCESS != COMMERCIAL LICENCE
```
