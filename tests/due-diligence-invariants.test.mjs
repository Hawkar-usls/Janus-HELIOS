import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const [
  license,
  ip,
  thirdParty,
  security,
  contributing,
  handoffText,
  ddText,
  purchased,
  excluded,
  provenance,
  guardrails,
  acceptance,
  support,
  release,
  pkgText
] = await Promise.all([
  readFile(new URL('../LICENSE.md', import.meta.url), 'utf8'),
  readFile(new URL('../IP_NOTICE.md', import.meta.url), 'utf8'),
  readFile(new URL('../THIRD_PARTY_NOTICES.md', import.meta.url), 'utf8'),
  readFile(new URL('../SECURITY.md', import.meta.url), 'utf8'),
  readFile(new URL('../CONTRIBUTING.md', import.meta.url), 'utf8'),
  readFile(new URL('../BUYER_HANDOFF_SPEC.json', import.meta.url), 'utf8'),
  readFile(new URL('../.janus/HELIOS_DUE_DILIGENCE.json', import.meta.url), 'utf8'),
  readFile(new URL('../legal/PURCHASED_ASSETS_SCHEDULE.md', import.meta.url), 'utf8'),
  readFile(new URL('../legal/EXCLUDED_ASSETS_SCHEDULE.md', import.meta.url), 'utf8'),
  readFile(new URL('../legal/BACKGROUND_IP_AND_PROVENANCE.md', import.meta.url), 'utf8'),
  readFile(new URL('../legal/TRANSACTION_GUARDRAILS.md', import.meta.url), 'utf8'),
  readFile(new URL('../legal/ACCEPTANCE_AND_HANDOVER.md', import.meta.url), 'utf8'),
  readFile(new URL('../legal/TRANSITION_SUPPORT_SCOPE.md', import.meta.url), 'utf8'),
  readFile(new URL('../docs/RELEASE_AND_HASHING.md', import.meta.url), 'utf8'),
  readFile(new URL('../package.json', import.meta.url), 'utf8')
]);

const handoff = JSON.parse(handoffText);
const dd = JSON.parse(ddText);
const pkg = JSON.parse(pkgText);

assert.match(license, /source-available evaluation license/i);
assert.match(license, /commercial.*separate written agreement/is);
assert.match(ip, /No patent status is claimed/i);
assert.match(thirdParty, /b644af87de104b405427a8c0ae3c35c8d192507c/);
assert.match(thirdParty, /a1df4ee660f523bf014d739726458ecd1c909587/);
assert.match(thirdParty, /SBOM/i);
assert.match(security, /browser\/provider secrets are forbidden/i);
assert.match(security, /buyer-generated secrets/i);
assert.match(contributing, /submission is not automatic acceptance/i);
assert.match(contributing, /separate written contributor agreement, assignment, or licence/i);

assert.equal(handoff.transaction_boundary.default_scope, 'HELIOS_ONLY_UNLESS_EXPRESSLY_EXPANDED');
assert.equal(handoff.transaction_boundary.specialized_children_included_by_default, false);
assert.equal(handoff.transaction_boundary.future_inventions_included_by_default, false);
assert.equal(handoff.transaction_boundary.seller_personal_accounts_or_credentials_included, false);
assert.equal(handoff.closing_release.complete_test_run_on_closing_snapshot_required_before_claiming_pass, true);
assert.equal(handoff.legal_status_boundary.patent_status_claimed, false);

assert.equal(dd.provenance.buzz_lineage.historical_mit_retroactively_revoked, false);
assert.equal(dd.provenance.buzz_lineage.current_license, 'JANUS_DISTRIBUTED_AI_SWARM_SOURCE_AVAILABLE_EVALUATION_LICENSE_V1_1');
assert.equal(dd.provenance.buzz_lineage.entire_source_repository_transferred_by_default, false);
assert.equal(dd.third_party.closing_sbom_scan_required, true);
assert.equal(dd.acceptance.subjective_commercial_satisfaction_allowed_as_default, false);
assert.equal(dd.acceptance.profitability_is_acceptance_condition, false);
assert.equal(dd.transaction_guardrails.seller_personal_credentials_are_delivery_item, false);
assert.equal(dd.production_truth.production_profitability_validated, false);

assert.match(purchased, /exact/i);
assert.match(purchased, /commit/i);
assert.match(excluded, /DIVINE_REALM/);
assert.match(excluded, /SSlot/);
assert.match(excluded, /future/i);
assert.match(excluded, /know-how/i);
assert.match(provenance, /AI-assisted development disclosure/i);
assert.match(provenance, /Historical licence boundary/i);
assert.match(guardrails, /escrow/i);
assert.match(guardrails, /personal/i);
assert.match(acceptance, /objective/i);
assert.match(acceptance, /profit/i);
assert.match(support, /SOW/i);
assert.match(release, /SHA-256/i);
assert.match(release, /exact/i);

assert.equal(pkg.dependencies, undefined);
assert.equal(pkg.devDependencies, undefined);
assert.equal(typeof pkg.scripts['audit:preflight'], 'string');
assert.equal(typeof pkg.scripts['closing:manifest'], 'string');

console.log('HELIOS acquisition / provenance / due-diligence invariants: PASS');
