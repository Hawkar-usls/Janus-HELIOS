# JANUS HELIOS — Transition Support Scope

> Default commercial handover framework. A signed Statement of Work should set the actual hours, rates and response times.

## Objective

Transition support exists to transfer knowledge about the delivered HELIOS snapshot. It is **not** an unlimited obligation to build new product features, operate production infrastructure or guarantee commercial outcomes.

## Included support examples

If purchased, transition support may include:

- architecture walkthroughs;
- explanation of configuration and buyer-editable settings;
- explanation of provider-adapter / verifier contracts;
- explanation of swarm dispatcher contracts and state transitions;
- guidance on reproducing documented build/test/deployment steps;
- clarification of known status/open gates already disclosed at closing;
- reasonable handover questions about existing source code;
- assistance rotating from seller-controlled deployment references to buyer-controlled accounts.

## Excluded unless separately contracted

- new features or redesigns;
- custom casino/operator integration;
- new provider adapter implementation;
- production DevOps/SRE or 24/7 operations;
- data migration not expressly listed;
- regulated gambling certification;
- security certification or penetration testing;
- privacy/DPIA/legal work;
- tokenomics, exchange listing or financial compliance;
- guaranteed bug-fix response for defects introduced by buyer modifications;
- guaranteed revenue, user acquisition or profitability;
- production workload sourcing;
- ongoing customer support.

## Recommended commercial structure

A transition-support schedule should specify:

```text
support_period_days: 30 / 60 / 90
included_hours: <fixed number>
meeting_hours_count_against_cap: true
async_support_hours_count_against_cap: true
business_days_and_timezone: <defined>
response_target: <defined, not 24/7 unless priced>
additional_hourly_rate: <defined>
new_feature_work_requires_SOW: true
```

Unused included hours expire at the end of the support period unless otherwise agreed.

## Change control

Any request that materially changes the purchased snapshot is a change request. Before work starts, parties should document scope, price, acceptance criteria and ownership of the new work.

## Knowledge-transfer completion

Transition support is considered completed when the purchased support period/hours expire or the parties sign an earlier completion note. Completion does not create a warranty that buyer-operated production systems will remain defect-free.
