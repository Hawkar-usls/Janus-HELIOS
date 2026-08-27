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
  'tools/build-closing-manifest.mjs',
  'tools/secret-scan.mjs'
];

for (const path of required) check(await exists(path), `present: ${path}`, `missing required diligence artifact: ${path}`);

const [license, ipNotice, thirdParty, statusText, handoffText, ddText, purchased, excluded, provenance, guardrails, acceptance, support, changeControl, codeowners, ciEvidence] = await Promise.all([
  text('LICENSE.md'), text('IP_NOTICE.md'), text('THIRD_PARTY_NOTICES.md'), text('PROJECT_STATUS.json'),
  text('BUYER_HANDOFF_SPEC.json'), text('.janus/HELIOS_DUE_DILIGENCE.json'), text('legal/PURCHASED_ASSETS_SCHEDULE.md'),
  text('legal/EXCLUDED_ASSETS_SCHEDULE.md'), text('legal/BACKGROUND_IP_AND_PROVENANCE.md'), text('legal/TRANSACTION_GUARDRAILS.md'),
  text('legal/ACCEPTANCE_AND_HANDOVER.md'), text('legal/TRANSITION_SUPPORT_SCOPE.md'), text('docs/CHANGE_CONTROL_AND_CLOSING_FREEZE.md'),
  text('.github/CODEOWNERS'), text('docs/CI_AND_RELEASE_EVIDENCE.md')
]);

const status = JSON.parse(statusText);
const handoff = JSON.parse(handoffText);
const dd = JSON.parse(ddText);

check(/source-available/i.test(license) && /not an open-source license/i.test(license), 'public HELIOS licence is source-available evaluation only', 'HELIOS licence boundary is not explicit');
check(/commercial/i.test(license) && /separate written agreement/i.test(license), 'commercial rights require separate agreement', 'commercial rights boundary missing');
check(/patent status is claimed/i.test(ipNotice) === false || /No patent status is claimed/i.test(ipNotice), 'patent claims remain bounded', 'IP notice may overstate patent status');
check(/SBOM/i.test(thirdParty), 'third-party register requires closing SBOM', 'third-party register lacks SBOM closing gate');
check(status.production_readiness !== 'READY' && status.production_readiness !== 'PRODUCTION_READY', 'status does not falsely claim production readiness', 'status falsely claims production readiness');
check(typeof status.full_test_suite_execution_status === 'string' && /RE_RUN_REQUIRED/i.test(status.full_test_suite_execution_status), 'test status is snapshot-scoped and requires rerun', 'test status is not scoped to an exact/repeatable snapshot');
check(status.integrity_ci?.scope_rule?.includes('GREEN_COMMIT_DOES_NOT_CERTIFY_A_LATER_COMMIT'), 'status records immutable CI scope rule', 'status does not clearly scope green CI to one commit');
check(handoff.transaction_boundary?.default_scope === 'HELIOS_ONLY_UNLESS_EXPRESSLY_EXPANDED', 'handoff defaults to HELIOS-only scope', 'handoff transaction scope is too broad');
check(handoff.transaction_boundary?.seller_personal_accounts_or_credentials_included === false, 'personal accounts excluded', 'personal account transfer boundary missing');
check(dd.provenance?.buzz_lineage?.historical_mit_retroactively_revoked === false, 'historical swarm MIT grant is disclosed honestly', 'historical swarm MIT boundary missing or overstated');
check(dd.provenance?.buzz_lineage?.current_license?.includes('SOURCE_AVAILABLE'), 'current swarm source-available licence is tracked', 'current swarm licence not tracked');
check(/DIVINE_REALM/i.test(excluded) && /SSlot/i.test(excluded), 'specialized child repos excluded by default', 'child-repository exclusion is incomplete');
check(/future/i.test(excluded) && /know-how/i.test(excluded), 'future inventions / general know-how are addressed', 'future inventions or know-how exclusion unclear');
check(/exact/i.test(purchased) && /commit/i.test(purchased), 'purchased asset schedule expects exact snapshot', 'purchased asset schedule does not anchor exact snapshot');
check(/AI-assisted/i.test(provenance), 'AI-assisted development is disclosed', 'AI-assisted development disclosure missing');
check(/escrow/i.test(guardrails) && /credentials/i.test(guardrails), 'transaction guardrails cover funds and credentials', 'transaction guardrails incomplete');
check(/objective/i.test(acceptance) && /profit/i.test(acceptance), 'acceptance is objective and not based on profitability', 'acceptance criteria risk subjective commercial satisfaction');
check(/SOW/i.test(support) && /new feature/i.test(support), 'transition support excludes free feature development', 'transition support scope is too open-ended');
check(/required Code Owner review/i.test(changeControl) && /no force-push/i.test(changeControl), 'closing change-control policy defines enforceable target settings', 'change-control policy lacks required review/force-push controls');
check(/At the time this document was introduced, branch protection was not represented as already enabled/i.test(changeControl), 'branch-protection status is not falsely claimed', 'change-control document may falsely imply repository settings are enforced');
check(/\* @Hawkar-usls/.test(codeowners), 'default CODEOWNERS review owner is declared', 'default CODEOWNERS owner missing');
check(/exact commit/i.test(ciEvidence) && /does \*\*not\*\* turn HELIOS into a production-certified product/i.test(ciEvidence), 'CI evidence is exact-snapshot and non-certification scoped', 'CI evidence scope is ambiguous');

let dirty = null;
try {
  dirty = Boolean(execFileSync('git', ['status', '--porcelain=v1', '--untracked-files=all'], { cwd: root, encoding: 'utf8' }).trim());
  check(!dirty, 'working tree clean', 'working tree dirty; closing snapshot cannot be frozen yet', { warning: !strict });
} catch {
  warnings.push('git status unavailable; cannot verify clean closing workspace');
}

const packageJson = JSON.parse(await text('package.json'));
const depCount = Object.keys(packageJson.dependencies || {}).length + Object.keys(packageJson.devDependencies || {}).length + Object.keys(packageJson.optionalDependencies || {}).length + Object.keys(packageJson.peerDependencies || {}).length;
check(depCount === 0, 'package.json currently declares zero npm dependencies', `package.json declares ${depCount} dependencies; update SBOM/third-party register before closing`, { warning: true });

console.log('JANUS HELIOS — DUE DILIGENCE PREFLIGHT');
console.log(`PASS=${passes.length} WARN=${warnings.length} FAIL=${failures.length}`);
for (const item of passes) console.log(`PASS  ${item}`);
for (const item of warnings) console.log(`WARN  ${item}`);
for (const item of failures) console.log(`FAIL  ${item}`);

if (failures.length || (strict && warnings.length)) process.exit(1);
