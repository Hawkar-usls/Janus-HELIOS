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

const [policy, contract, routeEvidence, terms, template, workflow, smokeWorkflow, watcher, smoke, pkg] = await Promise.all([
  readFile(new URL('../commerce/HELIOS_PILOT_PAYMENT_POLICY.json', import.meta.url), 'utf8').then(JSON.parse),
  readFile(new URL('../.janus/HELIOS_PILOT_AUTHORITY.json', import.meta.url), 'utf8').then(JSON.parse),
  readFile(new URL('../commerce/HELIOS_PILOT_RECEIVING_ROUTE_EVIDENCE_2026-08-31.json', import.meta.url), 'utf8').then(JSON.parse),
  readFile(new URL('../legal/HELIOS_STANDARD_PILOT_LICENSE_v1.md', import.meta.url), 'utf8'),
  readFile(new URL('../.github/ISSUE_TEMPLATE/helios-pilot-license.yml', import.meta.url), 'utf8'),
  readFile(new URL('../.github/workflows/helios-pilot-authority.yml', import.meta.url), 'utf8'),
  readFile(new URL('../.github/workflows/helios-pilot-rpc-smoke.yml', import.meta.url), 'utf8'),
  readFile(new URL('../tools/pilot-payment-watch.mjs', import.meta.url), 'utf8'),
  readFile(new URL('../tools/pilot-rpc-smoke.mjs', import.meta.url), 'utf8'),
  readFile(new URL('../package.json', import.meta.url), 'utf8').then(JSON.parse)
]);

const ETH_USDT = '0xdac17f958d2ee523a2206206994597c13d831ec7';
const RECEIVER = '0x7149081aea54fbef57effeb52a5a966b81cc03a0';

assert.equal(HELIOS_PILOT_AUTHORITY_VERSION, '1.2.0');
assert.equal(policy.version, '1.3.0');
assert.equal(policy.enabled, true);
assert.equal(policy.disabled_reason, null);
assert.equal(policy.activation_mode, 'MAIN_ONLY_ISSUER_WITH_CRITICAL_PREFLIGHT_AND_RPC_QUORUM');
assert.equal(policy.payment.network, 'ETHEREUM_MAINNET');
assert.equal(policy.payment.network_display, 'Ethereum Mainnet (ERC20)');
assert.equal(policy.payment.chain_id, 1);
assert.equal(policy.payment.asset, 'USDT');
assert.equal(policy.payment.token_contract.toLowerCase(), ETH_USDT);
assert.equal(policy.payment.decimals, 6);
assert.equal(policy.payment.standard_fee_asset, '10000.000000');
assert.equal(policy.payment.receiving_address.toLowerCase(), RECEIVER);
assert.equal(policy.payment.memo_required, false);
assert.equal(policy.payment.private_key_present, false);
assert.equal(policy.payment.seed_phrase_present, false);
assert.deepEqual(policy.chain_observation.rpc_urls, ['https://ethereum-rpc.publicnode.com', 'https://eth.drpc.org/']);
assert.equal(policy.chain_observation.rpc_quorum, 2);
assert.equal(policy.chain_observation.single_rpc_may_auto_grant, false);
assert.equal(policy.chain_observation.expected_chain_id_hex, '0x1');
assert.equal(policy.chain_observation.min_confirmations, 64);
assert.equal(policy.chain_observation.binance_credit_confirmations_observed, 6);
assert.equal(policy.chain_observation.binance_withdrawal_unlock_confirmations_observed, 64);
assert.equal(policy.chain_observation.rejected_rpc_sources[0].url, 'https://public.1rpc.io/eth');
assert.match(policy.chain_observation.rejected_rpc_sources[0].reason, /ETH_GETLOGS_METHOD_NOT_AVAILABLE/);
assert.equal(policy.grant_gate.payment_alone_is_authority, false);
assert.equal(policy.grant_gate.rpc_quorum_required, true);
assert.equal(policy.grant_gate.rpc_quorum_min_sources, 2);
assert.equal(policy.grant_gate.real_money_gambling_rights, false);
assert.equal(policy.grant_gate.public_production_rights, false);
assert.equal(policy.runtime_guard.issuer_workflow_must_run_on_main, true);
assert.equal(policy.runtime_guard.fail_closed_on_any_preflight_failure, true);
assert.equal(policy.privacy_and_security.payment_verifier_can_move_funds, false);
assert.equal(policy.privacy_and_security.payment_verifier_can_broadcast_transactions, false);
assert.equal(validatePilotPaymentPolicy(policy), true);

assert.equal(routeEvidence.version, '1.2.0');
assert.equal(routeEvidence.status, 'BINANCE_ROUTE_PROMOTED_TO_ACTIVE_STANDARD_PILOT_POLICY_CANDIDATE');
assert.equal(routeEvidence.route.receiving_address.toLowerCase(), RECEIVER);
assert.equal(routeEvidence.route.asset, 'USDT');
assert.equal(routeEvidence.route.network_displayed, 'Ethereum (ERC20)');
assert.equal(routeEvidence.memo_tag_evidence.memo_gate_status, 'CLOSED_BY_EXPANDED_BINANCE_DEPOSIT_SCREEN_EVIDENCE');
assert.equal(routeEvidence.memo_tag_evidence.memo_required_for_helios_policy, false);
assert.equal(routeEvidence.confirmation_evidence.binance_trading_credit_confirmations_displayed, 6);
assert.equal(routeEvidence.confirmation_evidence.binance_withdrawal_unlock_confirmations_displayed, 64);
assert.equal(routeEvidence.confirmation_evidence.helios_automatic_grant_confirmations, 64);
assert.equal(routeEvidence.source.screenshots[1].sha256, 'abe83eca120a7182e4d7d84c316b55c4edfe72ed3ebfbf2ccb34a81df1f42c64');
assert.equal(routeEvidence.promotion_boundary.payment_policy_enabled, true);
assert.equal(routeEvidence.promotion_boundary.route_evidence_alone_is_authority, false);

const enabledPolicy = structuredClone(policy);
assert.equal(validatePilotPaymentPolicy(enabledPolicy), true);

const singleRpc = structuredClone(enabledPolicy);
singleRpc.chain_observation.rpc_urls = ['https://ethereum-rpc.publicnode.com'];
singleRpc.chain_observation.rpc_quorum = 1;
assert.throws(() => validatePilotPaymentPolicy(singleRpc), /PILOT_RPC_REQUIRES_AT_LEAST_TWO_SOURCES|PILOT_RPC_QUORUM_INVALID/);

const wrongNetwork = structuredClone(enabledPolicy);
wrongNetwork.payment.network = 'BASE_MAINNET';
wrongNetwork.payment.chain_id = 8453;
assert.throws(() => validatePilotPaymentPolicy(wrongNetwork), /PILOT_PRIMARY_NETWORK_MUST_BE_ETHEREUM_MAINNET/);

const wrongToken = structuredClone(enabledPolicy);
wrongToken.payment.token_contract = '0x833589fcd6edb6e08f4c7c32d4f71b54bda02913';
assert.throws(() => validatePilotPaymentPolicy(wrongToken), /PILOT_USDT_CONTRACT_MUST_BE_TETHER_ETHEREUM_USDT/);

const weakConfirmations = structuredClone(enabledPolicy);
weakConfirmations.chain_observation.min_confirmations = 6;
assert.throws(() => validatePilotPaymentPolicy(weakConfirmations), /PILOT_CONFIRMATION_THRESHOLD_BELOW_FROZEN_BINANCE_UNLOCK_EVIDENCE/);

const disabledPolicy = structuredClone(enabledPolicy);
disabledPolicy.enabled = false;
disabledPolicy.disabled_reason = 'TEST_DISABLED';
assert.throws(() => validatePilotPaymentPolicy(disabledPolicy), /PILOT_AUTHORITY_DISABLED/);

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
const invoice = createPilotInvoice({ issue_number: 42, request, policy: enabledPolicy, terms_sha256: 'a'.repeat(64), issued_at_ms: issuedAt });
assert.equal(invoice.invoice_id, 'HELIOS-PILOT-42');
assert.equal(invoice.authority_version, '1.2.0');
assert.equal(invoice.payment.network, 'ETHEREUM_MAINNET');
assert.equal(invoice.payment.chain_id, 1);
assert.equal(invoice.payment.asset, 'USDT');
assert.equal(invoice.payment.token_contract, ETH_USDT);
assert.equal(invoice.payment.receiving_address, RECEIVER);
assert.equal(invoice.payment.rpc_quorum_required, 2);
assert.equal(invoice.payment.standard_fee_raw, '10000000000');
assert.equal(invoice.payment.invoice_fingerprint_discount_raw, '43');
assert.equal(invoice.payment.exact_amount_raw, '9999999957');
assert.equal(invoice.payment.exact_amount_asset, '9999.999957');
assert.equal(invoice.payment.wrong_network_grants_rights, false);
assert.equal(invoice.law, 'PAYMENT_IS_EVIDENCE_NOT_AUTHORITY');

const goodObservation = {
  chain_id: 1,
  token_contract: enabledPolicy.payment.token_contract,
  tx_hash: `0x${'b'.repeat(64)}`,
  from: '0x2222222222222222222222222222222222222222',
  to: enabledPolicy.payment.receiving_address,
  amount_raw: invoice.payment.exact_amount_raw,
  block_number: 1000,
  removed: false,
  receipt_status: true,
  observed_at: '2026-08-31T00:02:00Z',
  rpc_quorum_verified: true,
  rpc_source_count: 2
};

const noQuorum = verifyPilotPaymentEvidence({ invoice, observation: { ...goodObservation, rpc_quorum_verified: false }, latest_block_number: 1100, min_confirmations: 64 });
assert.equal(noQuorum.verified, false);
assert.equal(noQuorum.reason, 'RPC_QUORUM_NOT_VERIFIED');
const oneSource = verifyPilotPaymentEvidence({ invoice, observation: { ...goodObservation, rpc_source_count: 1 }, latest_block_number: 1100, min_confirmations: 64 });
assert.equal(oneSource.verified, false);
assert.equal(oneSource.reason, 'RPC_SOURCE_COUNT_INSUFFICIENT');
const insufficient = verifyPilotPaymentEvidence({ invoice, observation: goodObservation, latest_block_number: 1010, min_confirmations: 64 });
assert.equal(insufficient.verified, false);
assert.equal(insufficient.reason, 'INSUFFICIENT_CONFIRMATIONS');
const wrongAmount = verifyPilotPaymentEvidence({ invoice, observation: { ...goodObservation, amount_raw: '10000000000' }, latest_block_number: 1100, min_confirmations: 64 });
assert.equal(wrongAmount.verified, false);
assert.equal(wrongAmount.reason, 'WRONG_AMOUNT');
const wrongChain = verifyPilotPaymentEvidence({ invoice, observation: { ...goodObservation, chain_id: 8453 }, latest_block_number: 1100, min_confirmations: 64 });
assert.equal(wrongChain.verified, false);
assert.equal(wrongChain.reason, 'WRONG_CHAIN');

const verified = verifyPilotPaymentEvidence({ invoice, observation: goodObservation, latest_block_number: 1100, min_confirmations: 64 });
assert.equal(verified.verified, true);
assert.equal(verified.reason, 'EXACT_ONCHAIN_PAYMENT_CONFIRMED_BY_RPC_QUORUM');
assert.equal(verified.payment_is_authority, false);
assert.equal(verified.rpc_quorum_verified, true);
assert.equal(verified.rpc_source_count, 2);
assert.equal(verified.confirmations, 101);
assert.equal(verified.amount_asset, '9999.999957');
assert.equal(verified.asset, 'USDT');

const grantTime = Date.parse('2026-08-31T00:05:00Z');
const grant = issuePilotGrant({ invoice, request, payment_evidence: verified, granted_at_ms: grantTime, term_days: 90 });
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
assert.equal(grant.payment.network, 'ETHEREUM_MAINNET');
assert.equal(grant.payment.chain_id, 1);
assert.equal(grant.payment.asset, 'USDT');
assert.equal(grant.payment.amount_asset, '9999.999957');
assert.equal(grant.payment.rpc_quorum_verified, true);
assert.equal(grant.payment.rpc_source_count, 2);
assert.equal(grant.payment.payment_is_authority, false);
assert.equal(isPilotGrantActive(grant, grantTime + 1000), true);
assert.equal(isPilotGrantActive(grant, Date.parse(grant.expires_at)), false);

assert.equal(contract.version, '1.3.0');
assert.equal(contract.status, 'ACTIVE_STANDARD_PILOT_AUTHORITY_MAIN_ONLY_AWAITING_FIRST_PAID_GRANT');
assert.equal(contract.core_law, 'PAYMENT_IS_EVIDENCE_NOT_AUTHORITY');
assert.equal(contract.payment.primary, 'USDT_ON_ETHEREUM_MAINNET_ERC20');
assert.equal(contract.payment.chain_id, 1);
assert.equal(contract.payment.erc20_contract.toLowerCase(), ETH_USDT);
assert.equal(contract.payment.receiving_address.toLowerCase(), RECEIVER);
assert.equal(contract.payment.receiving_address_configured, true);
assert.equal(contract.payment.memo_required, false);
assert.equal(contract.payment.helios_grant_confirmations, 64);
assert.equal(contract.rpc_quorum.required, true);
assert.equal(contract.rpc_quorum.minimum_sources, 2);
assert.equal(contract.rpc_quorum.single_rpc_may_auto_grant, false);
assert.equal(contract.rpc_quorum.pre_activation_smoke_result, 'PASS');
assert.deepEqual(contract.rpc_quorum.sources, ['https://ethereum-rpc.publicnode.com', 'https://eth.drpc.org/']);
assert.equal(contract.runtime_preflight.issuer_main_only, true);
assert.equal(contract.runtime_preflight.any_failure_blocks_invoice_and_grant, true);
assert.equal(contract.pilot_scope.term_days, 90);
assert.equal(contract.pilot_scope.real_money_gambling, false);
assert.equal(contract.security.wallet_private_key_required, false);
assert.equal(contract.security.verifier_can_move_funds, false);
assert.equal(contract.security.verifier_can_broadcast_transactions, false);
assert.equal(contract.legal_boundary.production_authorization, 'NONE');
assert.equal(contract.activation_gate.policy_enabled, true);
assert.equal(contract.first_real_grant_status, 'NOT_YET_OBSERVED');

assert.match(terms, /PAYMENT IS EVIDENCE, NOT AUTHORITY/);
assert.match(terms, /90 days/);
assert.match(terms, /does \*\*not\*\* authorize real-money gambling/i);
assert.match(terms, /non-transferable and non-sublicensable/i);
assert.match(terms, /does not transfer ownership/i);
assert.match(terms, /different token, a different amount or the correct token on a different network/i);
assert.match(terms, /private key, seed phrase, withdrawal credential or exchange password/i);
assert.match(terms, /less than one unit of the invoiced stablecoin/i);
assert.match(terms, /Commercial production deployment requires a separate written commercial agreement/i);

assert.match(template, /name: HELIOS Standard Pilot License Request/);
assert.match(template, /Do \*\*not\*\* post passports/);
assert.match(template, /I accept `legal\/HELIOS_STANDARD_PILOT_LICENSE_v1\.md` version 1\.0/);
assert.match(template, /I certify that I am authorized to bind the named grantee/);
assert.match(template, /does not authorize real-money gambling/);
assert.match(template, /exact token, exact network, exact receiving address and exact invoice amount/);

assert.match(workflow, /name: HELIOS Pilot Authority/);
assert.match(workflow, /cron: '\*\/10 \* \* \* \*'/);
assert.match(workflow, /if: github\.ref == 'refs\/heads\/main'/);
assert.match(workflow, /contents: read/);
assert.match(workflow, /issues: write/);
assert.match(workflow, /persist-credentials: false/);
assert.match(workflow, /Critical licensing syntax and invariant preflight/);
assert.match(workflow, /npm run audit:preflight:strict/);
assert.match(workflow, /Live read-only Ethereum RPC quorum preflight/);
assert.doesNotMatch(workflow, /contents: write/);
assert.match(smokeWorkflow, /name: HELIOS Pilot RPC Quorum/);
assert.match(smokeWorkflow, /permissions:\s*\n\s*contents: read/);
assert.match(smokeWorkflow, /node tools\/pilot-rpc-smoke\.mjs/);

assert.match(watcher, /eth_getLogs/);
assert.match(watcher, /eth_getTransactionReceipt/);
assert.match(watcher, /RPC_CHAIN_ID_QUORUM_MISMATCH/);
assert.match(watcher, /RPC_RECEIPT_QUORUM_DISAGREEMENT/);
assert.match(watcher, /RPC_BLOCK_QUORUM_DISAGREEMENT/);
assert.match(watcher, /txAlreadyGrantedElsewhere/);
assert.match(watcher, /PILOT_ACTIVE/);
assert.match(watcher, /policy\.enabled !== true/);
assert.match(watcher, /rpc_quorum_verified/);
assert.doesNotMatch(watcher, /Base Mainnet · chain 8453|native USDC|inbound USDC/i);
assert.doesNotMatch(watcher, /seed phrase\s*=|private key\s*=/i);

assert.match(smoke, /eth_chainId/);
assert.match(smoke, /eth_blockNumber/);
assert.match(smoke, /eth_getCode/);
assert.match(smoke, /eth_getLogs/);
assert.match(smoke, /fund_movement_authority: false/);

assert.match(pkg.scripts.test, /pilot-authority-invariants\.test\.mjs/);
assert.match(pkg.scripts['check:public'], /src\/helios-pilot-authority\.js/);
assert.match(pkg.scripts['check:public'], /tools\/pilot-payment-watch\.mjs/);
assert.match(pkg.scripts['check:public'], /tools\/pilot-rpc-smoke\.mjs/);

console.log('HELIOS Pilot Authority v1.3 active main-only RPC-quorum invariants: PASS');
