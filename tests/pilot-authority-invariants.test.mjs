import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import {
  HELIOS_PILOT_AUTHORITY_VERSION,
  createPilotInvoice,
  deriveInvoiceFingerprintDiscountRaw,
  isPilotGrantActive,
  issuePilotGrant,
  normalizePilotRequest,
  validatePilotPaymentPolicy,
  verifyPilotPaymentEvidence
} from '../src/helios-pilot-authority.js';
import { parsePilotIssueRequest } from '../tools/pilot-payment-watch.mjs';

const [policy, contract, terms, template, workflow, watcher, pkg] = await Promise.all([
  readFile(new URL('../commerce/HELIOS_PILOT_PAYMENT_POLICY.json', import.meta.url), 'utf8').then(JSON.parse),
  readFile(new URL('../.janus/HELIOS_PILOT_AUTHORITY.json', import.meta.url), 'utf8').then(JSON.parse),
  readFile(new URL('../legal/HELIOS_STANDARD_PILOT_LICENSE_v1.md', import.meta.url), 'utf8'),
  readFile(new URL('../.github/ISSUE_TEMPLATE/helios-pilot-license.yml', import.meta.url), 'utf8'),
  readFile(new URL('../.github/workflows/helios-pilot-authority.yml', import.meta.url), 'utf8'),
  readFile(new URL('../tools/pilot-payment-watch.mjs', import.meta.url), 'utf8'),
  readFile(new URL('../package.json', import.meta.url), 'utf8').then(JSON.parse)
]);

assert.equal(HELIOS_PILOT_AUTHORITY_VERSION, '1.0.0');
assert.equal(policy.enabled, false);
assert.equal(policy.disabled_reason, 'RECEIVING_ADDRESS_NOT_CONFIGURED_BY_OWNER');
assert.equal(policy.payment.network, 'BASE_MAINNET');
assert.equal(policy.payment.chain_id, 8453);
assert.equal(policy.payment.asset, 'USDC');
assert.equal(policy.payment.token_contract.toLowerCase(), '0x833589fcd6edb6e08f4c7c32d4f71b54bda02913');
assert.equal(policy.payment.decimals, 6);
assert.equal(policy.payment.standard_fee_usdc, '10000.000000');
assert.equal(policy.payment.receiving_address, null);
assert.equal(policy.payment.private_key_present, false);
assert.equal(policy.payment.seed_phrase_present, false);
assert.equal(policy.grant_gate.payment_alone_is_authority, false);
assert.equal(policy.grant_gate.real_money_gambling_rights, false);
assert.equal(policy.grant_gate.public_production_rights, false);
assert.equal(policy.privacy_and_security.payment_verifier_can_move_funds, false);

assert.throws(() => validatePilotPaymentPolicy(policy), /PILOT_AUTHORITY_DISABLED/);

const enabledPolicy = structuredClone(policy);
enabledPolicy.enabled = true;
enabledPolicy.disabled_reason = null;
enabledPolicy.payment.receiving_address = '0x1111111111111111111111111111111111111111';
assert.equal(validatePilotPaymentPolicy(enabledPolicy), true);

const request = normalizePilotRequest({
  legal_entity_name: 'Example Compute Inc.',
  authorized_representative: 'Jane Doe, CTO',
  github_grantee: '@example-compute',
  pilot_project: 'Controlled HELIOS non-money compute pilot',
  requested_scope: 'HELIOS_STANDARD_NON_MONEY_PILOT',
  acceptance: {
    standard_pilot_license_v1: true,
    authorized_to_bind_grantee: true,
    no_real_money_or_production_rights: true,
    legal_and_sanctions_compliance: true,
    exact_network_and_asset_required: true
  }
});
assert.equal(request.github_grantee, 'example-compute');
assert.equal(request.privacy_boundary, 'NO_ID_DOCUMENT_PHONE_HOME_ADDRESS_OR_PAYMENT_PRIVATE_KEY_REQUIRED');
assert.throws(() => normalizePilotRequest({}), /PILOT_TERMS_NOT_ACCEPTED/);

const issueBody = `### Legal entity name\n\nExample Compute Inc.\n\n### Authorized representative\n\nJane Doe, CTO\n\n### GitHub grantee\n\n@example-compute\n\n### Pilot project\n\nControlled HELIOS non-money compute pilot\n\n### Requested scope\n\nHELIOS_STANDARD_NON_MONEY_PILOT\n\n### Acceptance and authority\n\n- [x] I accept \`legal/HELIOS_STANDARD_PILOT_LICENSE_v1.md\` version 1.0 and understand the invoice will bind its SHA-256 terms digest.\n- [x] I certify that I am authorized to bind the named grantee to the pilot terms.\n- [x] I understand this automated grant does not authorize real-money gambling, public production deployment, sublicensing, source resale, HELIOS Core ownership or automatic commercial rights.\n- [x] I certify that entering this pilot and making the payment are lawful for the grantee and will not knowingly be used to evade sanctions, export controls, AML requirements, gambling regulation, tax obligations or other applicable law.\n- [x] I understand that only the exact token, exact network, exact receiving address and exact invoice amount can satisfy the automatic payment gate; wrong-network or unmatched transfers do not automatically grant rights.`;
const parsed = parsePilotIssueRequest(issueBody);
assert.equal(parsed.legal_entity_name, 'Example Compute Inc.');
assert.equal(parsed.github_grantee, 'example-compute');
assert.equal(parsed.acceptance.standard_pilot_license_v1, true);
assert.equal(parsed.acceptance.legal_and_sanctions_compliance, true);

assert.equal(deriveInvoiceFingerprintDiscountRaw(42), 43n);
const issuedAt = Date.parse('2026-08-31T00:00:00Z');
const invoice = createPilotInvoice({
  issue_number: 42,
  request,
  policy: enabledPolicy,
  terms_sha256: 'a'.repeat(64),
  issued_at_ms: issuedAt
});
assert.equal(invoice.invoice_id, 'HELIOS-PILOT-42');
assert.equal(invoice.payment.standard_fee_raw, '10000000000');
assert.equal(invoice.payment.invoice_fingerprint_discount_raw, '43');
assert.equal(invoice.payment.exact_amount_raw, '9999999957');
assert.equal(invoice.payment.exact_amount_usdc, '9999.999957');
assert.equal(invoice.payment.wrong_network_grants_rights, false);
assert.equal(invoice.law, 'PAYMENT_IS_EVIDENCE_NOT_AUTHORITY');

const goodObservation = {
  chain_id: 8453,
  token_contract: enabledPolicy.payment.token_contract,
  tx_hash: `0x${'b'.repeat(64)}`,
  from: '0x2222222222222222222222222222222222222222',
  to: enabledPolicy.payment.receiving_address,
  amount_raw: invoice.payment.exact_amount_raw,
  block_number: 1000,
  removed: false,
  receipt_status: true,
  observed_at: '2026-08-31T00:02:00Z'
};

const insufficient = verifyPilotPaymentEvidence({
  invoice,
  observation: goodObservation,
  latest_block_number: 1010,
  min_confirmations: 64
});
assert.equal(insufficient.verified, false);
assert.equal(insufficient.reason, 'INSUFFICIENT_CONFIRMATIONS');

const wrongAmount = verifyPilotPaymentEvidence({
  invoice,
  observation: { ...goodObservation, amount_raw: '10000000000' },
  latest_block_number: 1100,
  min_confirmations: 64
});
assert.equal(wrongAmount.verified, false);
assert.equal(wrongAmount.reason, 'WRONG_AMOUNT');

const wrongChain = verifyPilotPaymentEvidence({
  invoice,
  observation: { ...goodObservation, chain_id: 1 },
  latest_block_number: 1100,
  min_confirmations: 64
});
assert.equal(wrongChain.verified, false);
assert.equal(wrongChain.reason, 'WRONG_CHAIN');

const verified = verifyPilotPaymentEvidence({
  invoice,
  observation: goodObservation,
  latest_block_number: 1100,
  min_confirmations: 64
});
assert.equal(verified.verified, true);
assert.equal(verified.payment_is_authority, false);
assert.equal(verified.confirmations, 101);

const grantTime = Date.parse('2026-08-31T00:05:00Z');
const grant = issuePilotGrant({
  invoice,
  request,
  payment_evidence: verified,
  granted_at_ms: grantTime,
  term_days: 90
});
assert.equal(grant.status, 'PILOT_ACTIVE');
assert.equal(grant.license.non_exclusive, true);
assert.equal(grant.license.non_transferable, true);
assert.equal(grant.license.non_sublicensable, true);
assert.equal(grant.license.ownership_transferred, false);
assert.equal(grant.license.core_ip_transferred, false);
assert.equal(grant.license.commercial_production_rights, false);
assert.equal(grant.license.real_money_gambling_rights, false);
assert.equal(grant.license.clone_or_license_circumvention_rights, false);
assert.equal(grant.production_requires_separate_written_agreement, true);
assert.equal(grant.payment.payment_is_authority, false);
assert.equal(isPilotGrantActive(grant, grantTime + 1000), true);
assert.equal(isPilotGrantActive(grant, Date.parse(grant.expires_at)), false);

assert.equal(contract.status, 'ARMED_DISABLED_PENDING_RECEIVING_ADDRESS');
assert.equal(contract.core_law, 'PAYMENT_IS_EVIDENCE_NOT_AUTHORITY');
assert.equal(contract.payment.primary, 'USDC_ON_BASE_MAINNET');
assert.equal(contract.payment.bitcoin_primary, false);
assert.equal(contract.pilot_scope.term_days, 90);
assert.equal(contract.pilot_scope.real_money_gambling, false);
assert.equal(contract.security.wallet_private_key_required, false);
assert.equal(contract.security.verifier_can_move_funds, false);
assert.equal(contract.legal_boundary.production_authorization, 'NONE');

assert.match(terms, /PAYMENT IS EVIDENCE, NOT AUTHORITY/);
assert.match(terms, /90 days/);
assert.match(terms, /does \*\*not\*\* authorize real-money gambling/i);
assert.match(terms, /non-transferable and non-sublicensable/i);
assert.match(terms, /does not transfer ownership/i);
assert.match(terms, /different token, a different amount or the correct token on a different network/i);
assert.match(terms, /private key, seed phrase, withdrawal credential or exchange password/i);
assert.match(terms, /Commercial production deployment requires a separate written commercial agreement/i);

assert.match(template, /name: HELIOS Standard Pilot License Request/);
assert.match(template, /Do \*\*not\*\* post passports/);
assert.match(template, /I accept `legal\/HELIOS_STANDARD_PILOT_LICENSE_v1\.md` version 1\.0/);
assert.match(template, /I certify that I am authorized to bind the named grantee/);
assert.match(template, /does not authorize real-money gambling/);
assert.match(template, /exact token, exact network, exact receiving address and exact invoice amount/);

assert.match(workflow, /name: HELIOS Pilot Authority/);
assert.match(workflow, /cron: '\*\/10 \* \* \* \*'/);
assert.match(workflow, /contents: read/);
assert.match(workflow, /issues: write/);
assert.match(workflow, /actions\/checkout@fbc6f3992d24b796d5a048ff273f7fcc4a7b6c09/);
assert.match(workflow, /actions\/setup-node@a0853c24544627f65ddf259abe73b1d18a591444/);
assert.match(workflow, /persist-credentials: false/);
assert.match(workflow, /HELIOS_PILOT_RPC_URL: \$\{\{ secrets\.HELIOS_PILOT_RPC_URL \}\}/);
assert.doesNotMatch(workflow, /contents: write/);

assert.match(watcher, /eth_getLogs/);
assert.match(watcher, /eth_getTransactionReceipt/);
assert.match(watcher, /RPC_CHAIN_ID_MISMATCH/);
assert.match(watcher, /txAlreadyGrantedElsewhere/);
assert.match(watcher, /PILOT_ACTIVE/);
assert.match(watcher, /policy\.enabled !== true/);
assert.doesNotMatch(watcher, /seed phrase\s*=|private key\s*=/i);

assert.match(pkg.scripts.test, /pilot-authority-invariants\.test\.mjs/);
assert.match(pkg.scripts['check:public'], /src\/helios-pilot-authority\.js/);
assert.match(pkg.scripts['check:public'], /tools\/pilot-payment-watch\.mjs/);

console.log('HELIOS Pilot Authority standard-license + exact-payment invariants: PASS');
