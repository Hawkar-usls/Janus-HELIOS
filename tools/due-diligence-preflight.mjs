import { readFile, access } from 'node:fs/promises';
import { resolve } from 'node:path';
import { execFileSync } from 'node:child_process';

const root = resolve(new URL('..', import.meta.url).pathname);
const strict = process.argv.includes('--strict');
const passes = [];
const warnings = [];
const failures = [];

const pass = message => passes.push(message);
const warn = message => warnings.push(message);
const fail = message => failures.push(message);
const check = (condition, ok, bad, {warning=false}={}) => condition ? pass(ok) : (warning ? warn(bad) : fail(bad));
const pathOf = path => resolve(root, path);

async function exists(path){ try{ await access(pathOf(path)); return true; }catch{ return false; } }
async function text(path){ return readFile(pathOf(path),'utf8'); }
async function json(path){ return JSON.parse(await text(path)); }

const REQUIRED = [
  'LICENSE.md','IP_NOTICE.md','THIRD_PARTY_NOTICES.md','SECURITY.md','CONTRIBUTING.md',
  'README.md','BUYER_HANDOFF_SPEC.json','PROJECT_STATUS.json',
  '.janus/HELIOS_ARCHITECTURE.json','.janus/HELIOS_DUE_DILIGENCE.json',
  '.janus/HELIOS_DESKTOP_FABRIC.json','.janus/HELIOS_ADAPTIVE_POLICY.json',
  '.janus/HELIOS_DUAL_STREAM_SAFETY_GUARD.json','.janus/HELIOS_DUAL_STREAM_DIRECTOR.json',
  '.janus/HELIOS_STELLAR_NAVIGATOR.json',
  '.janus/HELIOS_BUYER_CRITIC_AUDIT_2026-08-27.json',
  '.github/CODEOWNERS','.github/workflows/helios-integrity.yml',
  'legal/PURCHASED_ASSETS_SCHEDULE.md','legal/EXCLUDED_ASSETS_SCHEDULE.md',
  'legal/BACKGROUND_IP_AND_PROVENANCE.md','legal/TRANSACTION_GUARDRAILS.md',
  'legal/ACCEPTANCE_AND_HANDOVER.md','legal/TRANSITION_SUPPORT_SCOPE.md',
  'legal/BRAND_AND_MARKS_SCHEDULE.md','legal/SELLER_DISCLOSURE_SCHEDULE_TEMPLATE.md',
  'docs/RELEASE_AND_HASHING.md','docs/CI_AND_RELEASE_EVIDENCE.md',
  'docs/CHANGE_CONTROL_AND_CLOSING_FREEZE.md','docs/DATA_ROOM_INDEX.md',
  'docs/DESKTOP_FABRIC.md','docs/ADAPTIVE_POLICY_PLANE.md',
  'docs/DUAL_STREAM_SAFETY_GUARD.md','docs/DUAL_STREAM_DIRECTOR.md','docs/STELLAR_NAVIGATOR.md',
  'docs/GAME_MATH_AND_REGULATORY_BOUNDARY.md','docs/THREAT_MODEL.md','docs/PRIVACY_DATA_FLOW.md',
  'index.html','helios.js','helios-bonus.js','helios-bonus-confirm.js','helios-mobile.js','helios-dual-stream-director.js','helios-stellar-nav.js',
  'src/helios-router.js','src/helios-desktop-fabric.js','src/helios-desktop-agent.js',
  'src/helios-adaptive-policy.js','src/helios-dual-stream-guard.js',
  'tests/bonus-buy-consent-invariants.test.mjs','tests/desktop-fabric-invariants.test.mjs',
  'tests/desktop-agent-invariants.test.mjs','tests/adaptive-policy-invariants.test.mjs',
  'tests/dual-stream-safety-invariants.test.mjs','tests/dual-stream-director-invariants.test.mjs',
  'tests/stellar-navigator-invariants.test.mjs','tests/due-diligence-invariants.test.mjs','tools/build-closing-manifest.mjs',
  'tools/build-declared-sbom.mjs','tools/secret-scan.mjs','package.json'
];
for(const path of REQUIRED) check(await exists(path),`present: ${path}`,`missing required diligence artifact: ${path}`);

const REMOVED_LEGACY = [
  'src/helios-swarm-dispatcher.js','.janus/HELIOS_SWARM_DISPATCHER.json',
  'docs/SWARM_DISPATCHER.md','tests/swarm-dispatcher-invariants.test.mjs'
];
for(const path of REMOVED_LEGACY) check(!(await exists(path)),`legacy active path absent: ${path}`,`legacy Buzz-derived path returned to active snapshot: ${path}`);

const [
  pkg,status,architecture,handoff,dd,fabric,adaptive,safety,director,stellar,critic,
  license,ipNotice,thirdParty,readme,indexHtml,bonusConfirm,mobileSource,directorSource,stellarSource,stellarDocs,
  fabricSource,agentSource,adaptiveSource,safetySource,workflow,security,threatModel,gameMath,
  purchased,excluded,provenance,guardrails,acceptance,support,changeControl,codeowners,ciEvidence
] = await Promise.all([
  json('package.json'),json('PROJECT_STATUS.json'),json('.janus/HELIOS_ARCHITECTURE.json'),
  json('BUYER_HANDOFF_SPEC.json'),json('.janus/HELIOS_DUE_DILIGENCE.json'),json('.janus/HELIOS_DESKTOP_FABRIC.json'),
  json('.janus/HELIOS_ADAPTIVE_POLICY.json'),json('.janus/HELIOS_DUAL_STREAM_SAFETY_GUARD.json'),
  json('.janus/HELIOS_DUAL_STREAM_DIRECTOR.json'),json('.janus/HELIOS_STELLAR_NAVIGATOR.json'),
  json('.janus/HELIOS_BUYER_CRITIC_AUDIT_2026-08-27.json'),
  text('LICENSE.md'),text('IP_NOTICE.md'),text('THIRD_PARTY_NOTICES.md'),text('README.md'),
  text('index.html'),text('helios-bonus-confirm.js'),text('helios-mobile.js'),text('helios-dual-stream-director.js'),
  text('helios-stellar-nav.js'),text('docs/STELLAR_NAVIGATOR.md'),
  text('src/helios-desktop-fabric.js'),text('src/helios-desktop-agent.js'),text('src/helios-adaptive-policy.js'),
  text('src/helios-dual-stream-guard.js'),text('.github/workflows/helios-integrity.yml'),text('SECURITY.md'),
  text('docs/THREAT_MODEL.md'),text('docs/GAME_MATH_AND_REGULATORY_BOUNDARY.md'),
  text('legal/PURCHASED_ASSETS_SCHEDULE.md'),text('legal/EXCLUDED_ASSETS_SCHEDULE.md'),
  text('legal/BACKGROUND_IP_AND_PROVENANCE.md'),text('legal/TRANSACTION_GUARDRAILS.md'),
  text('legal/ACCEPTANCE_AND_HANDOVER.md'),text('legal/TRANSITION_SUPPORT_SCOPE.md'),
  text('docs/CHANGE_CONTROL_AND_CLOSING_FREEZE.md'),text('.github/CODEOWNERS'),text('docs/CI_AND_RELEASE_EVIDENCE.md')
]);

// Snapshot/version truth.
check(pkg.version==='1.16.0','package snapshot is HELIOS 1.16.0','unexpected package version');
check(status.project_version===pkg.version,'PROJECT_STATUS matches package version','PROJECT_STATUS/package version drift');
check(architecture.version===pkg.version,'canonical architecture matches package version','architecture/package version drift');
check(handoff.product_version===pkg.version,'buyer handoff matches package version','buyer handoff/package version drift');
check(dd.project_snapshot?.package_version===pkg.version,'DD record matches package version','DD/package version drift');
check(critic.product_snapshot_version===pkg.version,'buyer critic audit matches package version','buyer critic audit/package version drift');
check(/version-1\.16\.0/.test(readme),'README badge matches 1.16.0','README version badge drift');
check(status.production_readiness==='NOT_ESTABLISHED','status does not fake production readiness','production readiness overclaim');
check(architecture.production_gate?.status==='NOT_ESTABLISHED','architecture preserves production gate','architecture falsely claims production readiness');
check(critic.non_claims?.production_ready===false && critic.non_claims?.security_certified===false,'buyer audit does not self-certify','buyer audit contains self-certification overclaim');

// Licence / transaction / provenance truth.
check(/source-available/i.test(license)&&/not an open-source license/i.test(license),'HELIOS licence is explicitly source-available/non-OSS','licence boundary ambiguous');
check(/commercial/i.test(license)&&/separate written agreement/i.test(license),'commercial rights require written agreement','commercial-use boundary missing');
check(/No patent status is claimed/i.test(ipNotice),'patent status not overstated','patent status overclaim');
check(/SBOM/i.test(thirdParty),'third-party register contains SBOM gate','third-party SBOM gate missing');
check(/wisnc\/stellar-map/.test(thirdParty)&&/design-study reference only/i.test(thirdParty),'stellar-map reference is disclosed as design study','stellar-map provenance boundary missing');
check(/no repository `LICENSE` file was found/i.test(stellarDocs),'stellar-map missing-licence observation disclosed','stellar-map licence observation missing');
check(handoff.transaction_boundary?.default_scope==='HELIOS_ONLY_UNLESS_EXPRESSLY_EXPANDED','handoff defaults HELIOS-only','handoff scope too broad');
check(handoff.transaction_boundary?.specialized_children_included_by_default===false,'child repos excluded by default','child repo transaction scope unsafe');
check(handoff.transaction_boundary?.future_inventions_included_by_default===false,'future inventions excluded by default','future invention scope unsafe');
check(handoff.transaction_boundary?.seller_personal_accounts_or_credentials_included===false,'personal accounts excluded from transfer','personal credentials included/ambiguous');
check(/DIVINE_REALM/.test(excluded)&&/SSlot/.test(excluded),'specialized children explicitly excluded','child exclusion document incomplete');
check(/future/i.test(excluded)&&/know-how/i.test(excluded),'future work/know-how addressed','future work/know-how boundary unclear');
check(/exact/i.test(purchased)&&/commit/i.test(purchased),'purchased schedule anchors exact snapshot','purchased schedule lacks exact snapshot anchor');
check(/AI-assisted development disclosure/i.test(provenance),'AI assistance disclosed','AI assistance disclosure missing');
check(/Historical licence boundary/i.test(provenance),'historical swarm licence boundary disclosed','historical licence boundary hidden');
check(/HELIOS Stellar Navigator \/ external design-study boundary/i.test(provenance),'stellar navigation provenance disclosed','stellar navigation provenance missing');
check(dd.provenance?.buzz_lineage?.historical_mit_retroactively_revoked===false,'historical MIT rights not falsely revoked','historical MIT treatment inaccurate');
check(dd.provenance?.helios_native_architecture?.central_multigateway_resource_router_attributed_to_buzz===false,'central HELIOS architecture not misattributed to Buzz','central architecture provenance drift');
check(/escrow/i.test(guardrails)&&/credentials/i.test(guardrails),'transaction guardrails cover funds/credentials','transaction guardrails incomplete');
check(/objective/i.test(acceptance)&&/profit/i.test(acceptance),'acceptance objective and non-profitability based','acceptance scope subjective');
check(/SOW/i.test(support)&&/new feature/i.test(support),'transition support excludes free new development','support scope open-ended');

// Current game/bonus truth.
const tierCosts=architecture.solar_feature_family?.purchased_bonus?.tiers?.map(x=>Number(x.cost_multiplier_of_bet));
const tierSpins=architecture.solar_feature_family?.purchased_bonus?.tiers?.map(x=>Number(x.base_spins));
check(JSON.stringify(tierCosts)===JSON.stringify([50,100,175]),'architecture has current tier costs','bonus tier cost drift');
check(JSON.stringify(tierSpins)===JSON.stringify([10,12,15]),'architecture has current starting spins','bonus starting-spin drift');
check(architecture.solar_feature_family?.purchased_bonus?.visual_activation_rng_effect==='NONE','activation wheel is presentation-only','activation wheel authority drift');
check(architecture.solar_feature_family?.purchased_bonus?.production_enabled===false,'real-money bonus production disabled','bonus production boundary weakened');
check(/not a certified real-money gambling product/i.test(gameMath),'game-math document explicitly says non-certified demo','game-math certification boundary missing');
check(/no regulator-approved RNG package/i.test(gameMath),'regulated RNG package not falsely claimed','RNG certification boundary missing');
check(/first-class BONUS source/i.test(gameMath),'bonus bridge production refactor disclosed','bonus bridge hidden');

// Bonus Confirmation v2.3 DOM injection boundary.
check(/id="helios-bonus-confirm-script"[^>]+helios-bonus-confirm\.js\?v=2\.3\.0/.test(indexHtml),'index explicitly loads bonus confirmation 2.3.0','bonus confirmation cache/version drift');
check(/BONUS_CONFIRM_VERSION = '2\.3\.0'/.test(bonusConfirm),'bonus confirmation implementation reports v2.3.0','bonus confirmation implementation version drift');
check(/safeTierId/.test(bonusConfirm)&&/safeText/.test(bonusConfirm),'tier metadata is normalized','tier metadata normalization missing');
check(/name\.textContent=tier\.name/.test(bonusConfirm)&&/replaceChildren/.test(bonusConfirm),'dynamic tier content uses text DOM APIs','dynamic tier rendering not text-safe');
check(!/btn\.innerHTML=`<b>\$\{tier\.name\}/.test(bonusConfirm),'tier name is not interpolated into innerHTML','tier name HTML injection path present');
check(!/result\.innerHTML=`\$\{award\}/.test(bonusConfirm),'wheel result dynamic metadata is not innerHTML','wheel result HTML injection path present');
check(!/querySelector\(`\.bonus-tier-card\[data-tier=/.test(bonusConfirm),'tier id is not injected into a selector','tier selector injection path present');
check(/explicit_consent:true/.test(bonusConfirm),'purchase requires explicit consent flag','purchase consent contract missing');
check(/visual_wheel_complete:true/.test(bonusConfirm)&&/seamless_overlay_handoff:true/.test(bonusConfirm),'visual wheel/handoff contract preserved','bonus wheel handoff contract drift');

// Desktop Fabric/Agent authority.
check(fabric.lineage?.active_dependency_on_janus_distributed_ai_swarm===false,'desktop fabric has no active swarm dependency','desktop fabric active swarm dependency');
check(fabric.lineage?.active_dependency_on_buzz_esp32_code===false,'desktop fabric has no active Buzz code dependency','desktop fabric active Buzz dependency');
check(fabric.target_hardware?.desktop_class===true&&fabric.target_hardware?.esp32_required===false,'desktop/workstation target explicit','desktop hardware target ambiguous');
check(fabric.game_boundary?.game_event_weighting==='FORBIDDEN'&&fabric.game_boundary?.game_effect==='NONE','fabric cannot use game state','fabric/game boundary weakened');
check(fabric.scheduler?.head_of_line_blocking_by_unschedulable_resource_class_prevented===true,'scheduler fairness contract present','scheduler HOL fairness missing');
check(fabric.receipt_provenance?.verified_agent_id_per_slice===true,'verified agent provenance recorded','verified agent provenance missing');
check(fabric.desktop_agent?.controller_budget_may_exceed_local_user_policy===false,'controller cannot widen local policy','controller/local policy boundary unsafe');
check(fabric.production_claim_boundary?.production_ready===false,'fabric does not claim production ready','fabric readiness overclaim');
check(/selectDispatchableSlice/.test(fabricSource),'fabric selects dispatchable work, not blind queue head','scheduler implementation fairness regression');
check(/verified_agent_id/.test(fabricSource),'fabric persists verified agent ID','verified agent implementation missing');
check(/CONTROLLER_.*BUDGET_EXCEEDS_AGENT_POLICY/.test(agentSource),'agent rejects widened controller budget','agent controller-budget gate missing');
check(/ASSIGNMENT_LEASE_EXPIRED/.test(agentSource),'agent locally rejects expired assignment','local lease expiry gate missing');
check(!/child_process/.test(agentSource)&&!/execFile|spawn\(|eval\(/.test(agentSource),'agent is not generic remote shell','generic process execution primitive found in agent');

// Adaptive policy truth core.
check(adaptive.lineage?.active_code_dependency_on_swarm_repository===false&&adaptive.lineage?.active_code_dependency_on_zim_firmware===false,'adaptive layer has no runtime Zim/swarm dependency','adaptive layer runtime lineage dependency');
check(adaptive.lineage?.source_code_copied_from_zim===false,'adaptive layer records requirements-first rewrite','adaptive source-copy boundary unclear');
check(adaptive.safe_learning?.learning_may_change_artifact_digest===false,'learner cannot change artifact identity','learner can change artifact identity');
check(adaptive.safe_learning?.learning_may_change_verifier===false,'learner cannot change verifier','learner can change verifier');
check(adaptive.safe_learning?.learning_may_change_signature_rules===false,'learner cannot change signature truth','learner can change signature truth');
check(adaptive.game_boundary?.game_effect==='NONE'&&adaptive.game_boundary?.player_vulnerability_input==='FORBIDDEN','adaptive game/vulnerability boundary intact','adaptive game/vulnerability boundary weakened');
check(/IMMUTABLE_TRUTH_KEY_FORBIDDEN/.test(adaptiveSource)&&/UNAPPROVED_LEARNABLE_POLICY_KEY/.test(adaptiveSource),'adaptive implementation fail-closes unknown/immutable keys','adaptive implementation allowlist regression');

// Dual-stream safety truth.
check(safety.hard_invariant?.implementation_rule?.includes('DO_NOT_FABRICATE_SAFETY'),'safety contract forbids fabricated safety','safety fabrication boundary missing');
check(safety.hard_invariant?.bottleneck_reserve===true,'safety reserve is bottleneck minimum','safety reserve averaging regression');
check(safety.player_boundary?.player_emotional_state_input==='FORBIDDEN','safety layer forbids emotional profiling','safety emotional-input boundary weakened');
check(safety.player_boundary?.problem_gambling_or_vulnerability_targeting==='FORBIDDEN','safety layer forbids vulnerability targeting','safety vulnerability targeting weakened');
check(safety.relationship_to_adaptive_policy?.dual_stream_guard_may_widen_user_resource_policy===false,'safety layer cannot widen local resource policy','safety layer can widen local policy');
const safetySemantic =
  /export function stepBoundedDualStream/.test(safetySource)&&
  /state\.change_pressure/.test(safetySource)&&/state\.safety_reserve/.test(safetySource)&&
  /const maxAdmissibleChange = rawSafety \/ rho/.test(safetySource)&&
  /const changePressure = Math\.min\(rawChange, maxAdmissibleChange\)/.test(safetySource)&&
  /const safetyReserve = Math\.min\(\.\.\.Object\.values\(reserveComponents\)\)/.test(safetySource)&&
  /SAFETY_RESERVE_BELOW_REQUIRED_BALANCE/.test(safetySource);
check(safetySemantic,'safety implementation enforces balance and bottleneck reserve','safety implementation semantic regression');

// Presentation Director authority / loader isolation.
check(director.implementation_version==='1.1.0','Director contract is v1.1.0','Director version drift');
check(director.authority_boundary?.presentation_only===true&&director.authority_boundary?.rng_effect==='NONE'&&director.authority_boundary?.rtp_effect==='NONE','Director has presentation authority only','Director RNG/RTP authority leak');
check(director.authority_boundary?.bet_effect==='NONE'&&director.authority_boundary?.player_retention_targeting==='FORBIDDEN','Director cannot alter bet/target retention','Director bet/retention authority leak');
check(director.presentation_model?.core_reel_cell_transform_overrides===false,'Director cannot override reel/cell transforms','Director transform authority regression');
check(director.loader_boundary?.authoritative_loader==='index.html'&&director.loader_boundary?.mobile_layer_may_load_director===false,'Director has one explicit loader','Director loader ambiguity');
check(/id="helios-dual-stream-director-script"[^>]+helios-dual-stream-director\.js\?v=1\.1\.0/.test(indexHtml),'index loads Director v1.1.0','Director cache/version drift');
check(!/createElement\(['"]script['"]\)/.test(mobileSource),'mobile layer is not a dynamic feature loader','hidden mobile feature loader returned');
check(!/helios-bonus-confirm\.js/.test(mobileSource)&&!/helios-dual-stream-director\.js/.test(mobileSource),'mobile has no stale feature-loader references','mobile stale feature-loader reference');
check(/helios-director-stage/.test(directorSource),'Director owns dedicated wrapper stage','Director stage missing');
check(!/director-(?:resolution|divergence) \.reel[,\{]/.test(directorSource)&&!/director-(?:resolution|divergence) \.cell[,\{]/.test(directorSource),'Director does not own core reel/cell transforms','Director directly overrides reel/cell transform');
check(!/getElementById\(['"]bet['"]\)/.test(directorSource)&&!/getElementById\(['"]balance['"]\)/.test(directorSource),'Director does not read bet/balance controls','Director reads wager/balance input');
check(!/Math\.random\(/.test(directorSource)&&!/crypto\.getRandomValues/.test(directorSource),'Director is not a second RNG','Director introduced random authority');

// Stellar Navigator authority / provenance / runtime isolation.
check(stellar.classification==='PRESENTATION_ONLY_ASTRONOMY_INSPIRED_STELLAR_NAVIGATION_BACKGROUND','stellar navigator classification explicit','stellar navigator classification drift');
check(stellar.authority?.rng_effect==='NONE'&&stellar.authority?.rtp_effect==='NONE'&&stellar.authority?.payout_effect==='NONE','stellar navigator has no game-math authority','stellar navigator game authority leak');
check(stellar.authority?.compute_routing_effect==='NONE'&&stellar.authority?.provider_selection_effect==='NONE','stellar navigator has no compute authority','stellar navigator compute authority leak');
check(stellar.rendering?.network_requests===false&&stellar.rendering?.external_runtime_dependency===false,'stellar navigator is local/no-network','stellar navigator external runtime dependency');
check(stellar.external_reference_provenance?.source_code_copied===false&&stellar.external_reference_provenance?.star_catalog_copied===false&&stellar.external_reference_provenance?.images_or_assets_copied===false,'stellar-map material not copied','stellar-map copy boundary weakened');
check(architecture.stellar_navigation?.stellar_map_reference_use==='DESIGN_STUDY_ONLY_NO_CODE_DATA_OR_ASSET_IMPORT','canonical architecture records design-study-only boundary','stellar-map architecture provenance drift');
check(/id="helios-stellar-nav-script"[^>]+helios-stellar-nav\.js\?v=1\.0\.0/.test(indexHtml),'index explicitly loads Stellar Navigator v1.0.0','stellar navigator loader/version drift');
check(/prefers-reduced-motion/.test(stellarSource),'stellar navigator supports reduced motion','stellar reduced-motion boundary missing');
check(/buildSyntheticSky/.test(stellarSource)&&/const BRIGHT_STAR_ANCHORS/.test(stellarSource),'stellar navigator contains HELIOS sky model','stellar sky model missing');
check(!/\bfetch\s*\(/.test(stellarSource)&&!/XMLHttpRequest/.test(stellarSource)&&!/WebSocket/.test(stellarSource),'stellar navigator has no network primitive','stellar navigator network primitive detected');
check(!/Math\.random\s*\(/.test(stellarSource),'stellar navigator deep field is deterministic','stellar navigator non-deterministic random path');
check(!/getElementById\(['"]bet['"]\)/.test(stellarSource)&&!/getElementById\(['"]balance['"]\)/.test(stellarSource),'stellar navigator does not read bet/balance','stellar navigator reads wager/balance input');
check(!/loss_streak|near_miss|problem_gambling_label|inferred_vulnerability/i.test(stellarSource),'stellar navigator does not profile gambling vulnerability','stellar navigator vulnerability/retention input detected');
check(/astronomy-inspired, not a scientific star catalogue/i.test(stellarDocs),'stellar navigator scientific-claim boundary explicit','stellar scientific-claim boundary missing');

// Security docs / CI / supply-chain.
check(/Desktop Fabric/i.test(security)&&/Desktop Agent/i.test(security),'security policy describes active compute plane','security policy stale');
check(/Adaptive-policy truth-core erosion/i.test(threatModel),'threat model covers adaptive truth erosion','adaptive threat missing');
check(/Forged\/stale safety evidence/i.test(threatModel),'threat model covers safety evidence','safety-evidence threat missing');
check(/Presentation Director authority or retention leak/i.test(threatModel),'threat model covers Director authority leak','Director threat missing');
check(!/src\/helios-swarm-dispatcher\.js/.test(threatModel),'threat model does not cite removed dispatcher as active','threat model stale swarm control');
check(/audit:preflight:strict/.test(workflow),'CI executes strict buyer preflight','CI preflight not strict');
check(/actions\/checkout@[a-f0-9]{40}/.test(workflow)&&/actions\/setup-node@[a-f0-9]{40}/.test(workflow)&&/actions\/upload-artifact@[a-f0-9]{40}/.test(workflow),'all workflow actions pinned to immutable SHAs','un-pinned workflow action');
check(/actions\/upload-artifact@043fb46d1a93c77aae656e7c1c64a875d1fc6a0a/.test(workflow),'artifact uploader pinned to audited Node24 v7.0.1 commit','artifact upload action version drift');
check(/persist-credentials:\s*false/.test(workflow)&&/contents:\s*read/.test(workflow),'workflow uses read-only/no-persisted credentials','workflow credential hardening drift');
check(/required Code Owner review/i.test(changeControl)&&/no force-push/i.test(changeControl),'closing target defines code-owner/no-force-push controls','change-control target incomplete');
check(/At the time this document was introduced, branch protection was not represented as already enabled/i.test(changeControl),'branch protection not falsely claimed','host protection status overclaim');
check(/\* @Hawkar-usls/.test(codeowners),'default CODEOWNER present','default CODEOWNER missing');
const evidenceScoped=/exact (?:repository )?snapshots?|exact commit|exact SHA/i.test(ciEvidence)&&/previous green commit never certifies a later commit|does not .*certif.*later commit/i.test(ciEvidence);
const evidenceNonCert=/does (?:\*\*)?not(?:\*\*)? turn HELIOS into a production-certified product/i.test(ciEvidence)||/not a .*security certification|not a gambling certificate/i.test(ciEvidence);
check(evidenceScoped&&evidenceNonCert,'CI evidence is commit-scoped/non-certification','CI evidence scope ambiguous');

// Package/SBOM baseline.
const depCount=Object.keys(pkg.dependencies||{}).length+Object.keys(pkg.devDependencies||{}).length+Object.keys(pkg.optionalDependencies||{}).length+Object.keys(pkg.peerDependencies||{}).length;
check(depCount===0,'package currently declares zero npm dependencies',`package declares ${depCount} dependencies; third-party/SBOM review required`,{warning:true});
check(pkg.engines?.node==='>=24','Node 24 baseline explicit','Node engine baseline drift');
check(/audit:preflight:strict/.test(pkg.scripts?.['audit:buyer']||''),'npm buyer audit uses strict preflight','npm buyer audit not strict');
check(/stellar-navigator-invariants\.test\.mjs/.test(pkg.scripts?.test||''),'stellar navigator invariants wired into full test suite','stellar navigator test missing from npm test');
check(/node --check helios-stellar-nav\.js/.test(pkg.scripts?.['check:public']||''),'stellar navigator syntax wired into public check','stellar navigator missing from public syntax check');

// Clean exact snapshot.
try{
  const dirty=Boolean(execFileSync('git',['status','--porcelain=v1','--untracked-files=all'],{cwd:root,encoding:'utf8'}).trim());
  check(!dirty,'working tree clean','working tree dirty; cannot freeze closing candidate',{warning:!strict});
}catch{
  strict ? fail('git status unavailable in strict mode') : warn('git status unavailable; clean tree not verified');
}

console.log('JANUS HELIOS — STRICT BUYER DUE DILIGENCE PREFLIGHT');
console.log(`PASS=${passes.length} WARN=${warnings.length} FAIL=${failures.length}`);
for(const item of passes) console.log(`PASS  ${item}`);
for(const item of warnings) console.log(`WARN  ${item}`);
for(const item of failures) console.log(`FAIL  ${item}`);

if(failures.length || (strict&&warnings.length)) process.exit(1);
