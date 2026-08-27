import assert from 'node:assert/strict';
import { access, readFile } from 'node:fs/promises';

const [
  license, ip, thirdParty, security, contributing, handoffText, ddText,
  architectureText, fabricText, adaptiveText, safetyText, directorText,
  statusText, purchased, excluded, provenance, guardrails, acceptance,
  support, release, pkgText, workflow, html, mobile, directorSource, bonusConfirm, threatModel
] = await Promise.all([
  readFile(new URL('../LICENSE.md', import.meta.url), 'utf8'),
  readFile(new URL('../IP_NOTICE.md', import.meta.url), 'utf8'),
  readFile(new URL('../THIRD_PARTY_NOTICES.md', import.meta.url), 'utf8'),
  readFile(new URL('../SECURITY.md', import.meta.url), 'utf8'),
  readFile(new URL('../CONTRIBUTING.md', import.meta.url), 'utf8'),
  readFile(new URL('../BUYER_HANDOFF_SPEC.json', import.meta.url), 'utf8'),
  readFile(new URL('../.janus/HELIOS_DUE_DILIGENCE.json', import.meta.url), 'utf8'),
  readFile(new URL('../.janus/HELIOS_ARCHITECTURE.json', import.meta.url), 'utf8'),
  readFile(new URL('../.janus/HELIOS_DESKTOP_FABRIC.json', import.meta.url), 'utf8'),
  readFile(new URL('../.janus/HELIOS_ADAPTIVE_POLICY.json', import.meta.url), 'utf8'),
  readFile(new URL('../.janus/HELIOS_DUAL_STREAM_SAFETY_GUARD.json', import.meta.url), 'utf8'),
  readFile(new URL('../.janus/HELIOS_DUAL_STREAM_DIRECTOR.json', import.meta.url), 'utf8'),
  readFile(new URL('../PROJECT_STATUS.json', import.meta.url), 'utf8'),
  readFile(new URL('../legal/PURCHASED_ASSETS_SCHEDULE.md', import.meta.url), 'utf8'),
  readFile(new URL('../legal/EXCLUDED_ASSETS_SCHEDULE.md', import.meta.url), 'utf8'),
  readFile(new URL('../legal/BACKGROUND_IP_AND_PROVENANCE.md', import.meta.url), 'utf8'),
  readFile(new URL('../legal/TRANSACTION_GUARDRAILS.md', import.meta.url), 'utf8'),
  readFile(new URL('../legal/ACCEPTANCE_AND_HANDOVER.md', import.meta.url), 'utf8'),
  readFile(new URL('../legal/TRANSITION_SUPPORT_SCOPE.md', import.meta.url), 'utf8'),
  readFile(new URL('../docs/RELEASE_AND_HASHING.md', import.meta.url), 'utf8'),
  readFile(new URL('../package.json', import.meta.url), 'utf8'),
  readFile(new URL('../.github/workflows/helios-integrity.yml', import.meta.url), 'utf8'),
  readFile(new URL('../index.html', import.meta.url), 'utf8'),
  readFile(new URL('../helios-mobile.js', import.meta.url), 'utf8'),
  readFile(new URL('../helios-dual-stream-director.js', import.meta.url), 'utf8'),
  readFile(new URL('../helios-bonus-confirm.js', import.meta.url), 'utf8'),
  readFile(new URL('../docs/THREAT_MODEL.md', import.meta.url), 'utf8')
]);

const handoff = JSON.parse(handoffText);
const dd = JSON.parse(ddText);
const architecture = JSON.parse(architectureText);
const fabric = JSON.parse(fabricText);
const adaptive = JSON.parse(adaptiveText);
const safety = JSON.parse(safetyText);
const director = JSON.parse(directorText);
const status = JSON.parse(statusText);
const pkg = JSON.parse(pkgText);

assert.match(license, /source-available evaluation license/i);
assert.match(license, /commercial.*separate written agreement/is);
assert.match(ip, /No patent status is claimed/i);
assert.match(thirdParty, /b644af87de104b405427a8c0ae3c35c8d192507c/);
assert.match(thirdParty, /a1df4ee660f523bf014d739726458ecd1c909587/);
assert.match(thirdParty, /SBOM/i);
assert.match(security, /Desktop Fabric/i);
assert.match(security, /Desktop Agent/i);
assert.match(security, /buyer-generated secrets/i);
assert.match(contributing, /submission is not automatic acceptance/i);
assert.match(contributing, /separate written contributor agreement, assignment, or licence/i);

assert.equal(pkg.version, '1.16.0');
assert.equal(status.project_version, pkg.version);
assert.equal(architecture.version, pkg.version);
assert.equal(handoff.product_version, pkg.version);
assert.equal(dd.project_snapshot.package_version, pkg.version);
assert.equal(dd.project_snapshot.canonical_architecture_version, pkg.version);
assert.equal(status.production_readiness, 'NOT_ESTABLISHED');
assert.equal(architecture.production_gate.status, 'NOT_ESTABLISHED');

assert.deepEqual(
  architecture.solar_feature_family.purchased_bonus.tiers.map(x => x.cost_multiplier_of_bet),
  [50,100,175]
);
assert.deepEqual(
  architecture.solar_feature_family.purchased_bonus.tiers.map(x => x.base_spins),
  [10,12,15]
);
assert.equal(architecture.solar_feature_family.purchased_bonus.visual_activation_rng_effect, 'NONE');
assert.equal(architecture.solar_feature_family.purchased_bonus.production_enabled, false);

assert.equal(handoff.transaction_boundary.default_scope, 'HELIOS_ONLY_UNLESS_EXPRESSLY_EXPANDED');
assert.equal(handoff.transaction_boundary.specialized_children_included_by_default, false);
assert.equal(handoff.transaction_boundary.future_inventions_included_by_default, false);
assert.equal(handoff.transaction_boundary.seller_personal_accounts_or_credentials_included, false);
assert.equal(handoff.closing_release.complete_test_run_on_closing_snapshot_required_before_claiming_pass, true);
assert.equal(handoff.legal_status_boundary.patent_status_claimed, false);

assert.equal(dd.provenance.buzz_lineage.historical_mit_retroactively_revoked, false);
assert.equal(dd.provenance.buzz_lineage.current_license, 'JANUS_DISTRIBUTED_AI_SWARM_SOURCE_AVAILABLE_EVALUATION_LICENSE_V1_1');
assert.equal(dd.provenance.buzz_lineage.entire_source_repository_transferred_by_default, false);
assert.equal(dd.provenance.buzz_lineage.historical_removed_helios_dispatcher_disclosed, true);
assert.equal(dd.provenance.helios_native_architecture.central_multigateway_resource_router_attributed_to_buzz, false);
assert.equal(dd.provenance.helios_native_architecture.active_dependency_on_janus_distributed_ai_swarm, false);
assert.equal(dd.provenance.helios_native_architecture.active_dependency_on_buzz_esp32_firmware, false);
assert.equal(dd.third_party.closing_sbom_scan_required, true);
assert.equal(dd.acceptance.subjective_commercial_satisfaction_allowed_as_default, false);
assert.equal(dd.acceptance.profitability_is_acceptance_condition, false);
assert.equal(dd.transaction_guardrails.seller_personal_credentials_are_delivery_item, false);
assert.equal(dd.production_truth.production_profitability_validated, false);
assert.equal(dd.repository_change_control.main_branch_protected_at_2026_08_27_audit, false);
assert.equal(dd.repository_change_control.repository_rulesets_present_at_2026_08_27_audit, false);
assert.equal(dd.repository_change_control.current_commit_signature_claimed, false);

assert.equal(fabric.lineage.active_dependency_on_janus_distributed_ai_swarm, false);
assert.equal(fabric.lineage.active_dependency_on_buzz_esp32_code, false);
assert.equal(fabric.target_hardware.desktop_class, true);
assert.equal(fabric.target_hardware.esp32_required, false);
assert.deepEqual(fabric.scheduler.resource_class_placement, ['CPU', 'GPU', 'HYBRID']);
assert.equal(fabric.game_boundary.game_event_weighting, 'FORBIDDEN');
assert.equal(fabric.game_boundary.game_effect, 'NONE');
assert.equal(fabric.production_claim_boundary.production_ready, false);

assert.equal(adaptive.lineage.active_code_dependency_on_swarm_repository, false);
assert.equal(adaptive.lineage.active_code_dependency_on_zim_firmware, false);
assert.equal(adaptive.lineage.source_code_copied_from_zim, false);
assert.equal(adaptive.safe_learning.learning_may_change_artifact_digest, false);
assert.equal(adaptive.safe_learning.learning_may_change_verifier, false);
assert.equal(adaptive.safe_learning.learning_may_change_signature_rules, false);
assert.equal(adaptive.game_boundary.game_effect, 'NONE');
assert.equal(adaptive.game_boundary.player_vulnerability_input, 'FORBIDDEN');

assert.match(safety.hard_invariant.formula, /SAFETY_RESERVE/);
assert.match(safety.hard_invariant.implementation_rule, /DO_NOT_FABRICATE_SAFETY/);
assert.equal(safety.hard_invariant.bottleneck_reserve, true);
assert.equal(safety.player_boundary.player_emotional_state_input, 'FORBIDDEN');
assert.equal(safety.player_boundary.problem_gambling_or_vulnerability_targeting, 'FORBIDDEN');
assert.equal(safety.relationship_to_adaptive_policy.dual_stream_guard_may_widen_user_resource_policy, false);

assert.equal(director.implementation_version, '1.1.0');
assert.equal(director.authority_boundary.presentation_only, true);
assert.equal(director.authority_boundary.rng_effect, 'NONE');
assert.equal(director.authority_boundary.rtp_effect, 'NONE');
assert.equal(director.authority_boundary.bet_effect, 'NONE');
assert.equal(director.authority_boundary.player_retention_targeting, 'FORBIDDEN');
assert.equal(director.presentation_model.core_reel_cell_transform_overrides, false);
assert.equal(director.loader_boundary.authoritative_loader, 'index.html');
assert.equal(director.loader_boundary.mobile_layer_may_load_director, false);
assert.match(html, /id="helios-dual-stream-director-script"[^>]+helios-dual-stream-director\.js\?v=1\.1\.0/);
assert.match(html, /id="helios-bonus-confirm-script"[^>]+helios-bonus-confirm\.js\?v=2\.3\.0/);
assert.match(bonusConfirm, /BONUS_CONFIRM_VERSION = '2\.3\.0'/);
assert.match(bonusConfirm, /safeTierId/);
assert.match(bonusConfirm, /safeText/);
assert.match(bonusConfirm, /name\.textContent=tier\.name/);
assert.match(bonusConfirm, /replaceChildren/);
assert.doesNotMatch(bonusConfirm, /btn\.innerHTML=`<b>\$\{tier\.name\}/);
assert.doesNotMatch(bonusConfirm, /result\.innerHTML=`\$\{award\}/);
assert.doesNotMatch(bonusConfirm, /querySelector\(`\.bonus-tier-card\[data-tier=/);
assert.doesNotMatch(mobile, /createElement\(['"]script['"]\)/);
assert.doesNotMatch(mobile, /helios-bonus-confirm\.js/);
assert.doesNotMatch(mobile, /helios-dual-stream-director\.js/);
assert.match(directorSource, /helios-director-stage/);
assert.doesNotMatch(directorSource, /getElementById\(['"]bet['"]\)/);
assert.doesNotMatch(directorSource, /getElementById\(['"]balance['"]\)/);
assert.doesNotMatch(directorSource, /Math\.random\(/);

assert.equal(status.desktop_fabric.module, 'src/helios-desktop-fabric.js');
assert.equal(status.adaptive_policy_plane.module, 'src/helios-adaptive-policy.js');
assert.equal(status.dual_stream_safety_guard.module, 'src/helios-dual-stream-guard.js');
assert.equal(status.dual_stream_director.module, 'helios-dual-stream-director.js');
assert.equal(status.mobile_showcase.loads_other_feature_scripts, false);
assert.equal(status.swarm_dispatcher, undefined);

const removedActivePaths = [
  '../src/helios-swarm-dispatcher.js',
  '../.janus/HELIOS_SWARM_DISPATCHER.json',
  '../docs/SWARM_DISPATCHER.md',
  './swarm-dispatcher-invariants.test.mjs'
];
for (const relative of removedActivePaths) {
  let exists = true;
  try { await access(new URL(relative, import.meta.url)); } catch { exists = false; }
  assert.equal(exists, false, `legacy active path must remain absent: ${relative}`);
}

assert.match(purchased, /exact/i);
assert.match(purchased, /commit/i);
assert.match(excluded, /DIVINE_REALM/);
assert.match(excluded, /SSlot/);
assert.match(excluded, /future/i);
assert.match(excluded, /know-how/i);
assert.match(provenance, /AI-assisted development disclosure/i);
assert.match(provenance, /Historical licence boundary/i);
assert.match(provenance, /Active HELIOS Desktop Fabric v2 boundary/i);
assert.match(guardrails, /escrow/i);
assert.match(guardrails, /personal/i);
assert.match(acceptance, /objective/i);
assert.match(acceptance, /profit/i);
assert.match(support, /SOW/i);
assert.match(release, /SHA-256/i);
assert.match(release, /exact/i);

assert.match(workflow, /audit:preflight:strict/);
assert.match(workflow, /persist-credentials:\s*false/);
assert.match(workflow, /contents:\s*read/);
assert.match(workflow, /actions\/checkout@[a-f0-9]{40}/);
assert.match(workflow, /actions\/setup-node@[a-f0-9]{40}/);
assert.match(workflow, /actions\/upload-artifact@043fb46d1a93c77aae656e7c1c64a875d1fc6a0a/);
assert.match(threatModel, /Adaptive-policy truth-core erosion/i);
assert.match(threatModel, /Forged\/stale safety evidence/i);
assert.match(threatModel, /Presentation Director authority or retention leak/i);
assert.doesNotMatch(threatModel, /src\/helios-swarm-dispatcher\.js/);

assert.equal(pkg.dependencies, undefined);
assert.equal(pkg.devDependencies, undefined);
assert.equal(typeof pkg.scripts['audit:preflight:strict'], 'string');
assert.match(pkg.scripts['audit:buyer'], /audit:preflight:strict/);
assert.equal(typeof pkg.scripts['closing:manifest'], 'string');
assert.equal(pkg.engines.node, '>=24');

console.log('HELIOS 1.16 acquisition / provenance / authority-plane + bonus DOM due-diligence invariants: PASS');
