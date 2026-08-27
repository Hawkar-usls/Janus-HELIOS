# JANUS HELIOS — Privacy & Data-Flow Boundary

Status: public capability prototype / production-design guidance.

This document describes the current public demo and the privacy gates for a future production deployment. It is not a jurisdiction-specific privacy notice, DPIA, DPA, or compliance certification.

## 1. Current public demo

The public HELIOS page is a browser-based demonstration.

Current product status records:

- no real-money gambling;
- local demo value only;
- simulated compute receipts;
- no authoritative live provider settlement;
- local demo profile/history surfaces;
- compute is off by default and requires explicit opt-in.

The project does not claim that ordinary web-hosting/platform logs outside HELIOS application code do not exist. GitHub Pages, the user's browser, operating system, ISP, DNS provider, or other infrastructure may process ordinary connection metadata under their own terms.

## 2. Current local/demo state

Client-side demo state may include values such as:

- selected game mode;
- selected compute route;
- demo balance/value;
- demo work/profile history;
- simulated receipt history;
- local UI/audio preferences;
- Spin Energy/demo reward state.

These values are presentation/demo state and are not authoritative production account records.

## 3. Future production data classes

A production HELIOS deployment may need some combination of the following, depending on the operator and workload.

### Device/resource telemetry

Potential examples:

- node identifier;
- capability class;
- CPU/GPU availability;
- configured resource cap;
- load;
- temperature;
- battery/AC status;
- memory/VRAM availability;
- latency;
- reliability/heartbeat status;
- estimated/actual energy use where necessary for economics/safety.

### Work records

Potential examples:

- workload ID;
- chunk ID;
- lease/fencing token;
- assignment/result timestamps;
- verification result;
- provider receipt ID;
- work-unit accounting.

### Commercial/account records

Only where a production operator actually implements them:

- user/operator account identifier;
- earned compute value;
- settlement/reconciliation records;
- tax/payment/KYC information if legally required by that separate service.

Such regulated/payment data should not be collected merely because HELIOS technically can display a profile.

## 4. Data minimization rule

Collect the minimum data required for:

```text
CONSENT
+ SAFE RESOURCE ENFORCEMENT
+ WORKLOAD DELIVERY
+ RESULT VERIFICATION
+ RECEIPT / ACCOUNTING
+ SECURITY / ABUSE PREVENTION
+ REQUIRED LEGAL COMPLIANCE
```

Do not collect unrelated browsing history, private files, message content, contacts, precise location, microphone/camera data, or other sensitive information merely to operate distributed compute.

## 5. Consent separation

Compute consent must be distinguishable from:

- acceptance of website terms;
- gameplay participation;
- marketing consent;
- analytics consent where separately required;
- payment/KYC consent where separately required.

A user declining compute must still be distinguishable from a user declining the game itself.

Revocation should stop new work promptly and terminate/hand back existing work according to the safe cancellation policy.

## 6. Game / compute privacy separation

The compute scheduler must not use vulnerability or gambling-behavior profiling as a scheduling input.

Forbidden examples include using:

- loss streak;
- near-miss history;
- bet size;
- inferred gambling vulnerability;
- wagering history;
- personal jackpot state;

to increase compute pressure, resource allocation, or game odds.

## 7. Workload privacy rule

Consumer/edge nodes should receive only workloads appropriate for execution on such nodes.

Do not send a confidential enterprise dataset to thousands of consumer machines simply because the scheduler can partition it.

Production workload admission must consider:

- data classification;
- contractual restrictions;
- privacy law;
- export/jurisdiction restrictions;
- customer confidentiality;
- ability to minimize each chunk's data exposure;
- encryption and sandbox/egress controls.

Some workloads belong in a data center and should remain there.

## 8. Identifiers

Prefer pseudonymous, scoped node/work IDs over directly identifying personal information when identity is not required.

Do not use one global permanent identifier across unrelated operators/providers unless there is a justified and disclosed need.

Production design should consider rotation/scoping of identifiers while preserving anti-fraud/accounting requirements.

## 9. Retention

A production operator must define explicit retention periods for:

- node telemetry;
- work/lease logs;
- security logs;
- receipts/accounting;
- user profile data;
- payment/KYC records where applicable.

Retention must not default to "forever because storage is cheap."

Immutable financial/compliance records, if legally required, should be separated from ephemeral telemetry.

## 10. Deletion / revocation

A production system should distinguish:

- revoking future compute consent;
- deleting optional profile/history;
- deleting account data;
- retaining records that cannot legally or operationally be deleted immediately.

The UI must not imply that disabling compute necessarily erases legally required settlement/security records.

## 11. Security controls for personal/work data

Production minimums should include as appropriate:

- encryption in transit;
- server-side secret management;
- least-privilege access control;
- audit logging;
- segregation of provider/customer payloads;
- incident-response process;
- backup/restore policy for authoritative records;
- no production secrets in browser config;
- no personal credentials transferred in a product acquisition.

## 12. International / regulated deployment

Before production, the deployment entity must identify:

- controller/processor roles;
- lawful bases / consent requirements;
- sub-processors;
- cross-border transfer mechanism where relevant;
- data-subject rights process;
- breach-notification obligations;
- payment/KYC/AML obligations if such functions exist;
- gaming-specific privacy/responsible-gaming requirements if real-money gaming exists.

## 13. Acquisition boundary

A HELIOS acquisition does not automatically transfer seller personal data, email, personal GitHub credentials, unrelated analytics, private correspondence, or third-party customer data.

Any data or contracts included in a transaction require their own lawful transfer basis and explicit Purchased Assets schedule.

## 14. Current truth statement

The current public prototype demonstrates interfaces and local/simulated accounting. It is **not** evidence that a production privacy architecture, DPA network, KYC system, or live provider/customer dataset is already deployed.
