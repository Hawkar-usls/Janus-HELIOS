import { readFile, access } from 'node:fs/promises';
import { resolve } from 'node:path';
import { execFileSync } from 'node:child_process';

const root = resolve(new URL('..', import.meta.url).pathname);
const strict = process.argv.includes('--strict');
const failures = [];
const warnings = [];
const passes = [];

function check(condition, pass, fail, { warning = false } = {}) {
  if (condition) passes.push(pass);
  else (warning ? warnings : failures).push(fail);
}

async function exists(path) {
  try { await access(resolve(root, path)); return true; } catch { return false; }
}

async function text(path) {
  return readFile(resolve(root, path), 'utf8');
}

const required = [
  'LICENSE.md',
  'IP_NOTICE.md',
  'THIRD_PARTY_NOTICES.md',
  'SECURITY.md',
  'CONTRIBUTING.md',
  'BUYER_HANDOFF_SPEC.json',
  'PROJECT_STATUS.json',
  '.janus/HELIOS_DUE_DILIGENCE.json',
  '.janus/HELIOS_ARCHITECTURE.json',
  '.janus/HELIOS_DESKTOP_FABRIC.json',
  '.janus/HELIOS_ADAPTIVE_POLICY.json',
  '.janus/HELIOS_DUAL_STREAM_SAFETY_GUARD.json',
  '.janus/HELIOS_DUAL_STREAM_DIRECTOR.json',
  '.janus/HELIOS_BUYER_CRITIC_AUDIT_2026-08-27.json',
  '.github/CODEOWNERS',
  '.github/workflows/helios-integrity.yml',
  'legal/PURCHASED_ASSETS_SCHEDULE.md',
  'legal/EXCLUDED_ASSETS_SCHEDULE.md',
  'legal/BACKGROUND_IP_AND_PROVENANCE.md',
  'legal/TRANSACTION_GUARDRAILS.md',
  'legal/ACCEPTANCE_AND_HANDOVER.md',
  'legal/TRANSITION_SUPPORT_SCOPE.md',
  'legal/BRAND_AND_MARKS_SCHEDULE.md',
  'legal/SELLER_DISCLOSURE_SCHEDULE_TEMPLATE.md',
  'docs/RELEASE_AND_HASHING.md',
  'docs/CI_AND_RELEASE_EVIDENCE.md',
  'docs/CHANGE_CONTROL_AND_CLOSING_FREEZE.md',
  'docs/DATA_ROOM_INDEX.md',
  'docs/DESKTOP_FABRIC.md',
  'docs/ADAPTIVE_POLICY_PLANE.md',
  'docs/DUAL_STREAM_SAFETY_GUARD.md',
  'docs/DUAL_STREAM_DIRECTOR.md',
  'docs/THREAT_MODEL.md',
  'docs/PRIVACY_DATA_FLOW.md',
  'index.html',
  'helios-mobile.js',
  'helios-dual-stream-director.js',
  'src/helios-desktop-fabric.js',
  'src/helios-desktop-agent.js',
  'src/helios-adaptive-policy.js',
  'src/helios-dual-stream-guard.js',
  'tests/desktop-fabric-invariants.test.mjs',
  'tests/desktop-agent-invariants.test.mjs',
  'tests/adaptive-policy-invariants.test.mjs',
  'tests/dual-stream-safety-invariants.test.mjs',
  'tests/dual-stream-director-invariants.test.mjs',
  'tests/due-diligence-invariants.test.mjs',
  'tools/build-closing-manifest.mjs',
  'tools/build-declared-sbom.mjs',
  'tools/secret-scan.mjs'
];

for (const path of required) check(await exists(path), `present: ${path}`, `missing required diligence artifact: ${path}`);

const removedLegacyActivePaths = [
  'src/helios-swarm-dispatcher.js',
  '.janus/HELIOS_SWARM_DISPATCHER.json',
  'docs/SWARM_DISPATCHER.md',
  'tests/swarm-dispatcher-invariants.test.mjs'
];
for (const path of removedLegacyActivePaths) {
  check(!(await exists(path)), `historical Buzz-derived active path removed: ${path}`, `legacy Buzz-derived path returned to active HELIOS snapshot: ${path}`);
}

const [
  license, ipNotice, thirdParty, statusText, handoffText, ddText, architectureText,
  fabricText, adaptiveText, safetyText, directorContractText, criticAuditText,
  purchased, excluded, provenance, guardrails, acceptance, support,
  changeControl, codeowners, ciEvidence, packageText, workflowText,
  indexHtml, mobileSource, directorSource, fabricSource, agentSource, adaptiveSource, safetySource,
  threatModel, securityPolicy
] = await Promise.all([
  text('LICENSE.md'), text('IP_NOTICE.md'), text('THIRD_PARTY_NOTICES.md'), text('PROJECT_STATUS.json'),
  text('BUYER_HANDOFF_SPEC.json'), text('.janus/HELIOS_DUE_DILIGENCE.json'), text('.janus/HELIOS_ARCHITECTURE.json'),
  text('.janus/HELIOS_DESKTOP_FABRIC.json'), text('.janus/HELIOS_ADAPTIVE_POLICY.json'),
  text('.janus/HELIOS_DUAL_STREAM_SAFETY_GUARD.json'), text('.janus/HELIOS_DUAL_STREAM_DIRECTOR.json'),
  text('.janus/HELIOS_BUYER_CRITIC_AUDIT_2026-08-27.json'),
  text('legal/PURCHASED_ASSETS_SCHEDULE.md'), text('legal/EXCLUDED_ASSETS_SCHEDULE.md'), text('legal/BACKGROUND_IP_AND_PROVENANCE.md'), text('legal/TRANSACTION_GUARDRAILS.md'),
  text('legal/ACCEPTANCE_AND_HANDOVER.md'), text('legal/TRANSITION_SUPPORT_SCOPE.md'), text('docs/CHANGE_CONTROL_AND_CLOSING_FREEZE.md'),
  text('.github/CODEOWNERS'), text('docs/CI_AND_RELEASE_EVIDENCE.md'), text('package.json'), text('.github/workflows/helios-integrity.yml'),
  text('index.html'), text('helios-mobile.js'), text('helios-dual-stream-director.js'), text('src/helios-desktop-fabric.js'), text('src/helios-desktop-agent.js'),
  text('src/helios-adaptive-policy.js'), text('src/helios-dual-stream-guard.js'), text('docs/THREAT_MODEL.md'), text('SECURITY.md')
]);

const status = JSON.parse(statusText);
const handoff = JSON.parse(handoffText);
const dd = JSON.parse(ddText);
const architecture = JSON.parse(architectureText);
const fabric = JSON.parse(fabricText);
const adaptive = JSON.parse(adaptiveText);
const safety = JSON.parse(safetyText);
const director = JSON.parse(directorContractText);
const criticAudit = JSON.parse(criticAuditText);
const packageJson = JSON.parse(packageText);

check(/source-available/i.test(license) && /not an open-source license/i.test(license), 'public HELIOS licence is source-available evaluation only', 'HELIOS licence boundary is not explicit');
check(/commercial/i.test(license) && /separate written agreement/i.test(license), 'commercial rights require separate agreement', 'commercial rights boundary missing');
check(/No patent status is claimed/i.test(ipNotice), 'patent claims remain bounded', 'IP notice may overstate patent status');
check(/SBOM/i.test(thirdParty), 'third-party register requires closing SBOM', 'third-party register lacks SBOM closing gate');

check(status.production_readiness !== 'READY' && status.production_readiness !== 'PRODUCTION_READY', 'status does not falsely claim production readiness', 'status falsely claims production readiness');
check(typeof status.full_test_suite_execution_status === 'string' && /(RE_RUN_REQUIRED|REQUIRES_NEW_INTEGRITY_RUN|CLOSING_SNAPSHOT|REQUIRES_NEW_INTEGRITY_RUN_FOR_CURRENT)/i.test(status.full_test_suite_execution_status), 'test status is snapshot-scoped and requires closing rerun', 'test status is not scoped to an exact/repeatable snapshot');
check(status.integrity_ci?.scope_rule?.includes('GREEN_COMMIT_DOES_NOT_CERTIFY_A_LATER_COMMIT'), 'status records immutable CI scope rule', 'status does not clearly scope green CI to one commit');
check(status.project_version === packageJson.version, 'PROJECT_STATUS and package version agree', 'PROJECT_STATUS/package version drift detected');
check(architecture.version === packageJson.version, 'canonical architecture and package version agree', 'HELIOS_ARCHITECTURE/package version drift detected');
check(dd.project_snapshot?.package_version === packageJson.version && dd.project_snapshot?.canonical_architecture_version === architecture.version, 'DD snapshot, architecture and package versions agree', 'DD snapshot version drift detected');
check(handoff.product_version === undefined || handoff.product_version === packageJson.version, 'buyer handoff is not version-drifted', 'BUYER_HANDOFF_SPEC/package version drift detected');
check(status.desktop_fabric?.module === 'src/helios-desktop-fabric.js', 'project status points to active desktop fabric', 'project status does not point to active desktop fabric');
check(status.adaptive_policy_plane?.module === 'src/helios-adaptive-policy.js', 'project status points to adaptive policy plane', 'adaptive policy plane missing from project status');
check(status.dual_stream_safety_guard?.module === 'src/helios-dual-stream-guard.js', 'project status points to dual-stream safety guard', 'dual-stream safety guard missing from project status');
check(status.dual_stream_director?.module === 'helios-dual-stream-director.js', 'project status points to presentation director', 'dual-stream director missing from project status');
check(status.swarm_dispatcher == null, 'legacy swarm dispatcher is not an active status component', 'legacy swarm dispatcher still appears as active project component');

const architectureTierCosts = architecture.solar_feature_family?.purchased_bonus?.tiers?.map(x => Number(x.cost_multiplier_of_bet));
const architectureTierSpins = architecture.solar_feature_family?.purchased_bonus?.tiers?.map(x => Number(x.base_spins));
check(JSON.stringify(architectureTierCosts) === JSON.stringify([50,100,175]), 'canonical architecture records current tiered bonus prices', 'canonical architecture bonus tier prices drifted');
check(JSON.stringify(architectureTierSpins) === JSON.stringify([10,12,15]), 'canonical architecture records current tiered bonus starting spins', 'canonical architecture bonus tier spins drifted');
check(architecture.solar_feature_family?.purchased_bonus?.visual_activation_rng_effect === 'NONE', 'purchased activation wheel remains presentation-only', 'activation wheel authority boundary drifted');
check(architecture.desktop_compute_plane?.fabric_module === 'src/helios-desktop-fabric.js', 'canonical architecture records desktop fabric', 'canonical architecture omits desktop fabric');
check(architecture.adaptive_policy_plane?.module === 'src/helios-adaptive-policy.js', 'canonical architecture records adaptive policy', 'canonical architecture omits adaptive policy');
check(architecture.dual_stream_safety_guard?.module === 'src/helios-dual-stream-guard.js', 'canonical architecture records safety guard', 'canonical architecture omits safety guard');
check(architecture.dual_stream_director?.module === 'helios-dual-stream-director.js', 'canonical architecture records presentation director', 'canonical architecture omits presentation director');

check(handoff.transaction_boundary?.default_scope === 'HELIOS_ONLY_UNLESS_EXPRESSLY_EXPANDED', 'handoff defaults to HELIOS-only scope', 'handoff transaction scope is too broad');
check(handoff.transaction_boundary?.seller_personal_accounts_or_credentials_included === false, 'personal accounts excluded', 'personal account transfer boundary missing');

check(dd.provenance?.buzz_lineage?.historical_mit_retroactively_revoked === false, 'historical swarm MIT grant is disclosed honestly', 'historical swarm MIT boundary missing or overstated');
check(dd.provenance?.buzz_lineage?.current_license?.includes('SOURCE_AVAILABLE'), 'current separate swarm source-available licence is tracked', 'current separate swarm licence not tracked');
check(dd.provenance?.buzz_lineage?.historical_removed_helios_dispatcher_disclosed === true, 'removed historical Buzz-derived HELIOS module is disclosed', 'removed historical Buzz-derived HELIOS module is hidden or undocumented');
check(dd.provenance?.helios_native_architecture?.active_dependency_on_janus_distributed_ai_swarm === false, 'HELIOS active architecture has no swarm code dependency', 'HELIOS DD record still declares active swarm dependency');
check(dd.provenance?.helios_native_architecture?.active_dependency_on_buzz_esp32_firmware === false, 'HELIOS active architecture has no Buzz firmware dependency', 'HELIOS DD record still declares active Buzz firmware dependency');
check(dd.provenance?.helios_native_architecture?.central_multigateway_resource_router_attributed_to_buzz === false, 'central multi-gateway HELIOS architecture is not attributed to Buzz', 'central HELIOS multi-gateway architecture is still attributed to Buzz');

check(fabric.lineage?.active_dependency_on_janus_distributed_ai_swarm === false, 'desktop fabric contract excludes active swarm dependency', 'desktop fabric contract has active swarm dependency');
check(fabric.lineage?.active_dependency_on_buzz_esp32_code === false, 'desktop fabric contract excludes active Buzz code dependency', 'desktop fabric contract has active Buzz code dependency');
check(fabric.target_hardware?.desktop_class === true && fabric.target_hardware?.esp32_required === false, 'desktop hardware target is explicit', 'desktop fabric hardware target is ambiguous');
check(fabric.game_boundary?.game_event_weighting === 'FORBIDDEN' && fabric.game_boundary?.game_effect === 'NONE', 'desktop fabric preserves game/compute authority separation', 'desktop fabric game/compute authority boundary weakened');
check(fabric.scheduler?.head_of_line_blocking_by_unschedulable_resource_class_prevented === true, 'unschedulable work cannot head-of-line block runnable work', 'desktop scheduler fairness contract missing');
check(fabric.receipt_provenance?.verified_agent_id_per_slice === true, 'receipt contract records verified agent provenance per slice', 'verified agent provenance missing from receipt contract');
check(fabric.desktop_agent?.controller_budget_may_exceed_local_user_policy === false, 'controller cannot widen local desktop resource policy', 'desktop agent controller/local policy boundary is unsafe or missing');
check(fabric.desktop_agent?.lease_expiry_rechecked_locally === true, 'desktop agent rechecks lease expiry locally', 'desktop agent does not declare local lease-expiry enforcement');
check(fabric.production_claim_boundary?.production_ready === false, 'desktop fabric does not falsely claim production readiness', 'desktop fabric falsely claims production readiness');
check(/selectDispatchableSlice/.test(fabricSource), 'scheduler selects a dispatchable slice rather than blindly selecting queue head', 'scheduler implementation may reintroduce head-of-line blocking');
check(/verified_agent_id/.test(fabricSource), 'fabric implementation persists verified agent identity', 'fabric implementation lacks verified agent provenance');
check(/CONTROLLER_.*BUDGET_EXCEEDS_AGENT_POLICY/.test(agentSource), 'agent runtime fails closed on widened controller budgets', 'agent runtime lacks controller-budget fail-closed checks');
check(/ASSIGNMENT_LEASE_EXPIRED/.test(agentSource), 'agent runtime rejects expired assignments locally', 'agent runtime lacks local assignment-expiry check');
check(!/child_process/.test(agentSource) && !/execFile|spawn\(|eval\(/.test(agentSource), 'active desktop agent has no generic process-execution primitive', 'desktop agent introduces generic process execution into active runtime');

check(adaptive.lineage?.active_code_dependency_on_swarm_repository === false && adaptive.lineage?.active_code_dependency_on_zim_firmware === false, 'adaptive policy has no active Zim/swarm dependency', 'adaptive policy has an undisclosed active Zim/swarm dependency');
check(adaptive.lineage?.source_code_copied_from_zim === false, 'adaptive policy records requirements-first implementation', 'adaptive policy source-copy boundary is unclear');
check(adaptive.safe_learning?.learning_may_change_artifact_digest === false, 'adaptive policy cannot mutate artifact identity', 'adaptive policy can mutate artifact identity');
check(adaptive.safe_learning?.learning_may_change_verifier === false, 'adaptive policy cannot mutate verifier truth', 'adaptive policy can mutate verifier truth');
check(adaptive.safe_learning?.learning_may_change_signature_rules === false, 'adaptive policy cannot mutate signature truth', 'adaptive policy can mutate signature truth');
check(adaptive.game_boundary?.game_effect === 'NONE' && adaptive.game_boundary?.player_vulnerability_input === 'FORBIDDEN', 'adaptive policy preserves game/vulnerability boundary', 'adaptive policy game/vulnerability boundary weakened');
check(/IMMUTABLE_TRUTH_KEY_FORBIDDEN/.test(adaptiveSource), 'adaptive implementation rejects immutable truth keys', 'adaptive implementation lacks immutable-truth rejection');
check(/UNAPPROVED_LEARNABLE_POLICY_KEY/.test(adaptiveSource), 'adaptive implementation allowlists learnable policy keys', 'adaptive implementation does not fail closed on learnable keys');

check(safety.hard_invariant?.implementation_rule?.includes('DO_NOT_FABRICATE_SAFETY'), 'safety guard cannot fabricate missing safety', 'safety guard fabrication boundary missing');
check(safety.hard_invariant?.bottleneck_reserve === true, 'safety reserve uses bottleneck model', 'safety reserve bottleneck rule missing');
check(safety.player_boundary?.player_emotional_state_input === 'FORBIDDEN', 'safety guard forbids player emotional inputs', 'safety guard player-emotion boundary weakened');
check(safety.player_boundary?.problem_gambling_or_vulnerability_targeting === 'FORBIDDEN', 'safety guard forbids vulnerability targeting', 'safety guard vulnerability boundary weakened');
check(safety.relationship_to_adaptive_policy?.dual_stream_guard_may_widen_user_resource_policy === false, 'safety guard cannot widen user resource policy', 'safety guard can widen user resource policy');
const safetyImplementationSemantic =
  /export function stepBoundedDualStream/.test(safetySource) &&
  /state\.change_pressure/.test(safetySource) &&
  /state\.safety_reserve/.test(safetySource) &&
  /const maxAdmissibleChange = rawSafety \/ rho/.test(safetySource) &&
  /const changePressure = Math\.min\(rawChange, maxAdmissibleChange\)/.test(safetySource) &&
  /export function evaluateSafetyBalance/.test(safetySource) &&
  /const safetyReserve = Math\.min\(\.\.\.Object\.values\(reserveComponents\)\)/.test(safetySource) &&
  /SAFETY_RESERVE_BELOW_REQUIRED_BALANCE/.test(safetySource);
check(safetyImplementationSemantic, 'safety implementation enforces bounded change pressure and bottleneck safety reserve', 'safety implementation no longer semantically enforces reserve/change balance');

check(director.implementation_version === '1.1.0', 'presentation director contract is current v1.1.0', 'presentation director contract version drifted');
check(director.authority_boundary?.presentation_only === true && director.authority_boundary?.rng_effect === 'NONE' && director.authority_boundary?.rtp_effect === 'NONE', 'director is presentation-only with no RNG/RTP authority', 'director authority boundary weakened');
check(director.authority_boundary?.bet_effect === 'NONE' && director.authority_boundary?.player_retention_targeting === 'FORBIDDEN', 'director cannot modify bet or target retention', 'director bet/retention boundary weakened');
check(director.presentation_model?.core_reel_cell_transform_overrides === false, 'director cannot override core reel/cell transforms', 'director may override core reel/cell transforms');
check(director.loader_boundary?.authoritative_loader === 'index.html' && director.loader_boundary?.mobile_layer_may_load_director === false, 'director has one explicit authoritative loader', 'director loader boundary is ambiguous');
check(/id="helios-dual-stream-director-script"[^>]+helios-dual-stream-director\.js\?v=1\.1\.0/.test(indexHtml), 'index explicitly loads current director once', 'index does not explicitly load current director v1.1.0');
check(/id="helios-bonus-confirm-script"[^>]+helios-bonus-confirm\.js\?v=2\.2\.0/.test(indexHtml), 'index explicitly loads current bonus confirmation once', 'index bonus confirmation loader drifted');
check(!/createElement\(['"]script['"]\)/.test(mobileSource), 'mobile layer does not dynamically load feature scripts', 'mobile layer reintroduced hidden feature loading');
check(!/helios-bonus-confirm\.js/.test(mobileSource) && !/helios-dual-stream-director\.js/.test(mobileSource), 'mobile layer contains no stale feature-loader references', 'mobile layer contains stale feature-loader reference');
check(!/helios-bonus-confirm\.js\?v=1\.0\.0/.test(indexHtml + mobileSource), 'stale bonus-confirm v1.0 loader absent', 'stale bonus-confirm v1.0 loader returned');
check(/helios-director-stage/.test(directorSource), 'director owns a dedicated transform stage', 'director dedicated transform stage missing');
check(!/director-(?:resolution|divergence) \.reel[,\{]/.test(directorSource) && !/director-(?:resolution|divergence) \.cell[,\{]/.test(directorSource), 'director does not directly override core reel/cell transforms', 'director directly overrides core reel/cell transforms');
check(!/getElementById\(['"]bet['"]\)/.test(directorSource) && !/getElementById\(['"]balance['"]\)/.test(directorSource), 'director does not read bet or balance controls', 'director reads forbidden wager/balance inputs');
check(!/Math\.random\(/.test(directorSource) && !/crypto\.getRandomValues/.test(directorSource), 'director choreography is not a second gambling RNG', 'director introduced independent random authority');

check(/DIVINE_REALM/i.test(excluded) && /SSlot/i.test(excluded), 'specialized child repos excluded by default', 'child-repository exclusion is incomplete');
check(/future/i.test(excluded) && /know-how/i.test(excluded), 'future inventions / general know-how are addressed', 'future inventions or know-how exclusion unclear');
check(/exact/i.test(purchased) && /commit/i.test(purchased), 'purchased asset schedule expects exact snapshot', 'purchased asset schedule does not anchor exact snapshot');
check(/AI-assisted/i.test(provenance), 'AI-assisted development is disclosed', 'AI-assisted development disclosure missing');
check(/Historical licence boundary/i.test(provenance), 'historical swarm licence boundary is disclosed', 'historical swarm licence boundary missing');
check(/Active HELIOS Desktop Fabric v2 boundary/i.test(provenance), 'active desktop fabric provenance is disclosed', 'active desktop fabric provenance boundary missing');
check(/escrow/i.test(guardrails) && /credentials/i.test(guardrails), 'transaction guardrails cover funds and credentials', 'transaction guardrails incomplete');
check(/objective/i.test(acceptance) && /profit/i.test(acceptance), 'acceptance is objective and not based on profitability', 'acceptance criteria risk subjective commercial satisfaction');
check(/SOW/i.test(support) && /new feature/i.test(support), 'transition support excludes free feature development', 'transition support scope is too open-ended');
check(/required Code Owner review/i.test(changeControl) && /no force-push/i.test(changeControl), 'closing change-control policy defines enforceable target settings', 'change-control policy lacks required review/force-push controls');
check(/At the time this document was introduced, branch protection was not represented as already enabled/i.test(changeControl), 'branch-protection status is not falsely claimed', 'change-control document may falsely imply repository settings are enforced');
check(/\* @Hawkar-usls/.test(codeowners), 'default CODEOWNERS review owner is declared', 'default CODEOWNERS owner missing');
const evidenceIsCommitScoped = /exact (?:repository )?snapshots?|exact commit|exact SHA/i.test(ciEvidence) && /previous green commit never certifies a later commit|does not .*certif.*later commit/i.test(ciEvidence);
const evidenceIsNotCertification = /does (?:\*\*)?not(?:\*\*)? turn HELIOS into a production-certified product/i.test(ciEvidence) || /not a .*security certification|not a gambling certificate/i.test(ciEvidence);
check(evidenceIsCommitScoped && evidenceIsNotCertification, 'CI evidence is exact-snapshot and non-certification scoped', 'CI evidence scope is ambiguous');
check(/audit:preflight:strict/.test(workflowText), 'CI runs strict buyer preflight', 'CI buyer preflight is not strict');
check(/actions\/checkout@[a-f0-9]{40}/.test(workflowText) && /actions\/setup-node@[a-f0-9]{40}/.test(workflowText), 'workflow actions are pinned to immutable SHAs', 'workflow actions are not pinned to immutable SHAs');
check(/persist-credentials:\s*false/.test(workflowText) && /contents:\s*read/.test(workflowText), 'workflow uses read-only content permission and no persisted checkout credentials', 'workflow credential hardening drifted');

check(criticAudit.product_snapshot_version === packageJson.version, 'buyer-critic audit targets current product version', 'buyer-critic audit version drift detected');
check(Array.isArray(criticAudit.fixed_findings) && criticAudit.fixed_findings.length >= 8, 'buyer-critic audit records concrete remediations', 'buyer-critic audit lacks concrete remediation record');
check(Array.isArray(criticAudit.open_external_or_production_gates) && criticAudit.open_external_or_production_gates.length >= 1, 'buyer-critic audit separates unresolved external/production gates', 'buyer-critic audit hides unresolved gates');
check(criticAudit.non_claims?.production_ready === false && criticAudit.non_claims?.security_certified === false, 'buyer-critic audit does not self-certify production/security readiness', 'buyer-critic audit overclaims readiness');

// Security docs must describe the active desktop architecture, not a removed swarm implementation.
check(!/src\/helios-swarm-dispatcher\.js/.test(threatModel), 'threat model does not cite removed swarm dispatcher as active control', 'threat model still cites removed swarm dispatcher as active control');
check(/desktop fabric|desktop agent/i.test(threatModel), 'threat model covers active desktop compute plane', 'threat model does not cover active desktop compute plane');
check(/adaptive/i.test(threatModel) && /presentation director|dual-stream director/i.test(threatModel), 'threat model covers adaptive and presentation policy planes', 'threat model omits new adaptive/presentation threats');
check(/desktop fabric|desktop agent/i.test(securityPolicy), 'security policy names active desktop compute plane', 'security policy still describes only legacy swarm model');

let dirty = null;
try {
  dirty = Boolean(execFileSync('git', ['status', '--porcelain=v1', '--untracked-files=all'], { cwd: root, encoding: 'utf8' }).trim());
  check(!dirty, 'working tree clean', 'working tree dirty; closing snapshot cannot be frozen yet', { warning: !strict });
} catch {
  warnings.push('git status unavailable; cannot verify clean closing workspace');
}

const depCount = Object.keys(packageJson.dependencies || {}).length + Object.keys(packageJson.devDependencies || {}).length + Object.keys(packageJson.optionalDependencies || {}).length + Object.keys(packageJson.peerDependencies || {}).length;
check(depCount === 0, 'package.json currently declares zero npm dependencies', `package.json declares ${depCount} dependencies; update SBOM/third-party register before closing`, { warning: true });

console.log('JANUS HELIOS — DUE DILIGENCE PREFLIGHT');
console.log(`PASS=${passes.length} WARN=${warnings.length} FAIL=${failures.length}`);
for (const item of passes) console.log(`PASS  ${item}`);
for (const item of warnings) console.log(`WARN  ${item}`);
for (const item of failures) console.log(`FAIL  ${item}`);

if (failures.length || (strict && warnings.length)) process.exit(1);
