# JANUS HELIOS — Acceptance & Technical Handover Criteria

> Transaction-preparation document. Definitive acceptance language belongs in the signed transaction agreement.

## Principle

Acceptance must be **objective and reproducible**, not based on a buyer's subjective commercial satisfaction.

A HELIOS acquisition should be accepted when the agreed assets are delivered in the agreed state and the agreed technical checks succeed. Future revenue, regulatory approval, provider contracting or market adoption are not acceptance conditions unless separately purchased and expressly written into the agreement.

## Recommended delivery package

The seller delivers:

1. the agreed `Janus-HELIOS` Git repository snapshot with complete history included if contracted;
2. exact closing commit SHA and tree SHA;
3. release/hash manifest;
4. `LICENSE.md`, `IP_NOTICE.md` and `THIRD_PARTY_NOTICES.md`;
5. architecture and buyer handoff documentation;
6. purchased/excluded asset schedules;
7. provider adapter/routing contracts included in the repository;
8. swarm-dispatcher documentation and contracts;
9. package scripts and test sources;
10. known-status / open-gate disclosure;
11. buyer-owned deployment/account migration checklist;
12. agreed transition-support schedule.

## Objective acceptance checks

Unless modified by a signed schedule, recommended acceptance checks are:

### Repository integrity

- repository clone/fetch succeeds from the buyer-controlled destination;
- checkout of the agreed closing SHA succeeds;
- tree SHA matches the closing manifest;
- listed files are present;
- no seller personal credentials are required to build or inspect the delivered snapshot.

### Static verification

- `package.json` parses;
- declared scripts are present;
- JSON contract/config files parse;
- JavaScript syntax checks defined by the package can be executed in the documented runtime.

### Test execution

- execute the repository's complete agreed test command on the closing snapshot;
- preserve stdout/stderr, runtime version and exit code in the closing data room;
- any known failing/non-executed tests must be expressly disclosed and either accepted as an exception or fixed before acceptance.

No party should describe the suite as PASS unless it was actually run on the exact closing snapshot and returned a successful exit code.

### Public demo / reference surface

If the public demo is included in the transaction, confirm that the documented static deployment loads and exposes the agreed HELIOS reference UI. Browser rendering differences that do not break agreed functionality are not, by themselves, rejection grounds.

### Documentation

- buyer can identify how to change public branding/configuration;
- buyer can identify which data must remain server-private;
- buyer can identify the game/compute authority boundary;
- buyer can identify how provider adapters/verifiers connect;
- buyer can identify swarm node/job/receipt contracts.

## Not acceptance criteria by default

The following are expressly **not** default acceptance criteria:

- revenue or profitability;
- any token-price increase;
- casino/operator conversion rate;
- real provider availability;
- regulatory approval;
- RNG/RTP certification;
- data-center offload percentage;
- reduction in electricity cost;
- production security certification;
- investor or sponsor interest;
- successful integration with a future provider that was not part of the agreed scope.

## Defect cure

If an objective acceptance check fails:

1. buyer identifies the exact failed criterion and reproducible evidence;
2. seller receives the contractually agreed cure period;
3. seller may fix the defect or demonstrate that the delivered snapshot already conforms;
4. rejection cannot be based on requirements introduced after signing unless both parties amend scope.

## Acceptance certificate

The definitive transaction should include a short acceptance certificate recording:

```text
transaction_id
buyer
seller
repository
closing_commit_sha
closing_tree_sha
manifest_sha256
test_report_identifier
exceptions_accepted
acceptance_date
signatures
```

Once objective acceptance occurs, any escrow release tied to acceptance should follow the agreed payment mechanics.
