export const HELIOS_PILOT_AUTHORITY_VERSION = '1.1.0';
export const HELIOS_PILOT_GRANT_SCHEMA = 'janus.helios.pilot-grant.v1';
export const HELIOS_PILOT_INVOICE_SCHEMA = 'janus.helios.pilot-invoice.v1';

const EVM_ADDRESS_RE = /^0x[a-fA-F0-9]{40}$/;
const TX_HASH_RE = /^0x[a-fA-F0-9]{64}$/;
const ETHEREUM_MAINNET_CHAIN_ID = 1;
const ETHEREUM_USDT_CONTRACT = '0xdac17f958d2ee523a2206206994597c13d831ec7';

function stable(value, fallback = '') {
  return value == null ? fallback : String(value).trim();
}

function requireText(value, errorCode) {
  const out = stable(value);
  if (!out) throw new Error(errorCode);
  return out;
}

function toPositiveInteger(value, errorCode) {
  const n = Number(value);
  if (!Number.isSafeInteger(n) || n <= 0) throw new Error(errorCode);
  return n;
}

function normalizeEvmAddress(value, errorCode = 'INVALID_EVM_ADDRESS') {
  const address = stable(value);
  if (!EVM_ADDRESS_RE.test(address)) throw new Error(errorCode);
  return address.toLowerCase();
}

function normalizeTxHash(value) {
  const txHash = stable(value);
  if (!TX_HASH_RE.test(txHash)) throw new Error('INVALID_PAYMENT_TX_HASH');
  return txHash.toLowerCase();
}

function rawToDisplay(raw, decimals = 6) {
  const amount = BigInt(raw);
  const scale = 10n ** BigInt(decimals);
  const whole = amount / scale;
  const fraction = (amount % scale).toString().padStart(decimals, '0');
  return `${whole}.${fraction}`;
}

export function normalizePilotRequest(input = {}) {
  const accepted = input.acceptance && typeof input.acceptance === 'object' ? input.acceptance : {};
  if (accepted.standard_pilot_license_v1 !== true) throw new Error('PILOT_TERMS_NOT_ACCEPTED');
  if (accepted.authorized_to_bind_grantee !== true) throw new Error('GRANTEE_AUTHORITY_NOT_CERTIFIED');
  if (accepted.no_real_money_or_production_rights !== true) throw new Error('PILOT_SCOPE_BOUNDARY_NOT_ACCEPTED');
  if (accepted.legal_and_sanctions_compliance !== true) throw new Error('LEGAL_COMPLIANCE_CERTIFICATION_REQUIRED');
  if (accepted.exact_network_and_asset_required !== true) throw new Error('PAYMENT_NETWORK_BOUNDARY_NOT_ACCEPTED');

  return Object.freeze({
    legal_entity_name: requireText(input.legal_entity_name, 'LEGAL_ENTITY_NAME_REQUIRED'),
    authorized_representative: requireText(input.authorized_representative, 'AUTHORIZED_REPRESENTATIVE_REQUIRED'),
    github_grantee: requireText(input.github_grantee, 'GITHUB_GRANTEE_REQUIRED').replace(/^@/, ''),
    pilot_project: requireText(input.pilot_project, 'PILOT_PROJECT_REQUIRED'),
    requested_scope: stable(input.requested_scope, 'HELIOS_STANDARD_NON_MONEY_PILOT'),
    acceptance: Object.freeze({
      standard_pilot_license_v1: true,
      authorized_to_bind_grantee: true,
      no_real_money_or_production_rights: true,
      legal_and_sanctions_compliance: true,
      exact_network_and_asset_required: true
    }),
    privacy_boundary: 'NO_ID_DOCUMENT_PHONE_HOME_ADDRESS_OR_PAYMENT_PRIVATE_KEY_REQUIRED'
  });
}

export function validatePilotPaymentPolicy(policy = {}) {
  if (policy.schema !== 'janus.helios.pilot-payment-policy.v1') throw new Error('INVALID_PILOT_PAYMENT_POLICY_SCHEMA');
  if (policy.enabled !== true) throw new Error(`PILOT_AUTHORITY_DISABLED:${stable(policy.disabled_reason, 'UNSPECIFIED')}`);

  const payment = policy.payment || {};
  if (payment.asset !== 'USDT') throw new Error('PILOT_PRIMARY_ASSET_MUST_BE_USDT');
  if (payment.network !== 'ETHEREUM_MAINNET') throw new Error('PILOT_PRIMARY_NETWORK_MUST_BE_ETHEREUM_MAINNET');
  if (Number(payment.chain_id) !== ETHEREUM_MAINNET_CHAIN_ID) throw new Error('PILOT_ETHEREUM_CHAIN_ID_MISMATCH');
  if (Number(payment.decimals) !== 6) throw new Error('PILOT_USDT_DECIMALS_MISMATCH');
  if (normalizeEvmAddress(payment.token_contract) !== ETHEREUM_USDT_CONTRACT) {
    throw new Error('PILOT_USDT_CONTRACT_MUST_BE_TETHER_ETHEREUM_USDT');
  }
  if (String(policy.chain_observation?.expected_chain_id_hex || '').toLowerCase() !== '0x1') {
    throw new Error('PILOT_RPC_EXPECTED_CHAIN_ID_MUST_BE_ETHEREUM_MAINNET');
  }
  normalizeEvmAddress(payment.receiving_address, 'PILOT_RECEIVING_ADDRESS_NOT_CONFIGURED');
  if (payment.memo_required === true) throw new Error('PILOT_AUTOMATION_DOES_NOT_SUPPORT_MEMO_REQUIRED_DEPOSIT');
  if (payment.private_key_present === true || payment.seed_phrase_present === true) throw new Error('PAYMENT_PRIVATE_MATERIAL_FORBIDDEN');
  if (BigInt(payment.standard_fee_raw) <= 1_000_000n) throw new Error('PILOT_STANDARD_FEE_INVALID');

  return true;
}

export function deriveInvoiceFingerprintDiscountRaw(issueNumber) {
  const issue = BigInt(toPositiveInteger(issueNumber, 'PILOT_ISSUE_NUMBER_REQUIRED'));
  return (issue % 999_999n) + 1n;
}

export function createPilotInvoice({
  issue_number,
  request,
  policy,
  terms_sha256,
  issued_at_ms = Date.now()
} = {}) {
  validatePilotPaymentPolicy(policy);
  const normalizedRequest = normalizePilotRequest(request);
  const issueNumber = toPositiveInteger(issue_number, 'PILOT_ISSUE_NUMBER_REQUIRED');
  const termsDigest = requireText(terms_sha256, 'PILOT_TERMS_DIGEST_REQUIRED').toLowerCase();
  if (!/^[a-f0-9]{64}$/.test(termsDigest)) throw new Error('INVALID_PILOT_TERMS_DIGEST');

  const payment = policy.payment;
  const decimals = toPositiveInteger(payment.decimals, 'PILOT_ASSET_DECIMALS_REQUIRED');
  const baseRaw = BigInt(payment.standard_fee_raw);
  const discountRaw = deriveInvoiceFingerprintDiscountRaw(issueNumber);
  if (discountRaw >= baseRaw) throw new Error('INVOICE_FINGERPRINT_EXCEEDS_STANDARD_FEE');
  const amountRaw = baseRaw - discountRaw;
  const ttlHours = toPositiveInteger(policy.invoice_ttl_hours, 'PILOT_INVOICE_TTL_REQUIRED');
  const issuedAt = Number(issued_at_ms);
  if (!Number.isFinite(issuedAt) || issuedAt <= 0) throw new Error('INVALID_PILOT_INVOICE_TIME');

  return Object.freeze({
    schema: HELIOS_PILOT_INVOICE_SCHEMA,
    authority_version: HELIOS_PILOT_AUTHORITY_VERSION,
    invoice_id: `HELIOS-PILOT-${issueNumber}`,
    issue_number: issueNumber,
    legal_entity_name: normalizedRequest.legal_entity_name,
    github_grantee: normalizedRequest.github_grantee,
    terms_file: policy.terms_file,
    terms_sha256: termsDigest,
    payment: Object.freeze({
      network: payment.network,
      network_display: stable(payment.network_display, payment.network),
      chain_id: Number(payment.chain_id),
      asset: payment.asset,
      token_contract: normalizeEvmAddress(payment.token_contract),
      receiving_address: normalizeEvmAddress(payment.receiving_address),
      decimals,
      standard_fee_raw: baseRaw.toString(),
      invoice_fingerprint_discount_raw: discountRaw.toString(),
      exact_amount_raw: amountRaw.toString(),
      exact_amount_asset: rawToDisplay(amountRaw, decimals),
      memo_required: false,
      wrong_network_grants_rights: false,
      overpayment_or_underpayment_auto_grants_rights: false
    }),
    issued_at: new Date(issuedAt).toISOString(),
    expires_at: new Date(issuedAt + ttlHours * 60 * 60 * 1000).toISOString(),
    law: 'PAYMENT_IS_EVIDENCE_NOT_AUTHORITY'
  });
}

export function verifyPilotPaymentEvidence({ invoice, observation, latest_block_number, min_confirmations } = {}) {
  if (!invoice || invoice.schema !== HELIOS_PILOT_INVOICE_SCHEMA) throw new Error('PILOT_INVOICE_REQUIRED');
  if (!observation || typeof observation !== 'object') return Object.freeze({ verified: false, reason: 'PAYMENT_OBSERVATION_MISSING' });

  let txHash;
  let to;
  let token;
  try {
    txHash = normalizeTxHash(observation.tx_hash);
    to = normalizeEvmAddress(observation.to);
    token = normalizeEvmAddress(observation.token_contract);
  } catch (error) {
    return Object.freeze({ verified: false, reason: error.message });
  }

  const expected = invoice.payment;
  if (Number(observation.chain_id) !== Number(expected.chain_id)) return Object.freeze({ verified: false, reason: 'WRONG_CHAIN' });
  if (token !== expected.token_contract) return Object.freeze({ verified: false, reason: 'WRONG_TOKEN_CONTRACT' });
  if (to !== expected.receiving_address) return Object.freeze({ verified: false, reason: 'WRONG_RECEIVING_ADDRESS' });
  if (String(observation.amount_raw) !== String(expected.exact_amount_raw)) return Object.freeze({ verified: false, reason: 'WRONG_AMOUNT' });
  if (observation.removed === true) return Object.freeze({ verified: false, reason: 'REMOVED_OR_REORGED_LOG' });
  if (observation.receipt_status !== true) return Object.freeze({ verified: false, reason: 'TRANSACTION_NOT_SUCCESSFUL' });

  const blockNumber = Number(observation.block_number);
  const latest = Number(latest_block_number);
  const minimum = toPositiveInteger(min_confirmations, 'MIN_CONFIRMATIONS_REQUIRED');
  if (!Number.isSafeInteger(blockNumber) || blockNumber <= 0 || !Number.isSafeInteger(latest) || latest < blockNumber) {
    return Object.freeze({ verified: false, reason: 'INVALID_BLOCK_EVIDENCE' });
  }
  const confirmations = latest - blockNumber + 1;
  if (confirmations < minimum) return Object.freeze({ verified: false, reason: 'INSUFFICIENT_CONFIRMATIONS', confirmations, minimum });

  const observedAtMs = Date.parse(observation.observed_at);
  const issuedAtMs = Date.parse(invoice.issued_at);
  const expiresAtMs = Date.parse(invoice.expires_at);
  if (!Number.isFinite(observedAtMs)) return Object.freeze({ verified: false, reason: 'PAYMENT_TIME_UNKNOWN' });
  if (observedAtMs < issuedAtMs) return Object.freeze({ verified: false, reason: 'PAYMENT_PREDATES_INVOICE' });
  if (observedAtMs > expiresAtMs) return Object.freeze({ verified: false, reason: 'PAYMENT_AFTER_INVOICE_EXPIRY' });

  return Object.freeze({
    verified: true,
    reason: 'EXACT_ONCHAIN_PAYMENT_CONFIRMED',
    tx_hash: txHash,
    from: EVM_ADDRESS_RE.test(stable(observation.from)) ? normalizeEvmAddress(observation.from) : null,
    to,
    token_contract: token,
    amount_raw: String(observation.amount_raw),
    amount_asset: expected.exact_amount_asset,
    asset: expected.asset,
    block_number: blockNumber,
    confirmations,
    observed_at: new Date(observedAtMs).toISOString(),
    payment_is_authority: false
  });
}

export function issuePilotGrant({ invoice, request, payment_evidence, granted_at_ms = Date.now(), term_days = 90 } = {}) {
  const normalizedRequest = normalizePilotRequest(request);
  if (!invoice || invoice.schema !== HELIOS_PILOT_INVOICE_SCHEMA) throw new Error('PILOT_INVOICE_REQUIRED');
  if (!payment_evidence?.verified) throw new Error('VERIFIED_PILOT_PAYMENT_REQUIRED');
  const days = toPositiveInteger(term_days, 'PILOT_TERM_DAYS_REQUIRED');
  const grantedAt = Number(granted_at_ms);
  if (!Number.isFinite(grantedAt) || grantedAt <= 0) throw new Error('INVALID_PILOT_GRANT_TIME');

  const grantId = `${invoice.invoice_id}-${payment_evidence.tx_hash.slice(2, 14).toUpperCase()}`;
  return Object.freeze({
    schema: HELIOS_PILOT_GRANT_SCHEMA,
    authority_version: HELIOS_PILOT_AUTHORITY_VERSION,
    grant_id: grantId,
    status: 'PILOT_ACTIVE',
    grantee: Object.freeze({
      legal_entity_name: normalizedRequest.legal_entity_name,
      authorized_representative: normalizedRequest.authorized_representative,
      github_grantee: normalizedRequest.github_grantee,
      pilot_project: normalizedRequest.pilot_project
    }),
    license: Object.freeze({
      terms_file: invoice.terms_file,
      terms_sha256: invoice.terms_sha256,
      non_exclusive: true,
      non_transferable: true,
      non_sublicensable: true,
      ownership_transferred: false,
      core_ip_transferred: false,
      standard_pilot_only: true,
      commercial_production_rights: false,
      real_money_gambling_rights: false,
      source_resale_rights: false,
      clone_or_license_circumvention_rights: false,
      future_janus_ip_included: false,
      janus_i0_included_by_default: false
    }),
    permitted_scope: Object.freeze([
      'INTERNAL_EVALUATION',
      'INTERNAL_INTEGRATION',
      'CONTROLLED_NON_MONEY_PILOT',
      'PILOT_ONLY_SOURCE_MODIFICATION',
      'PILOT_MEASUREMENT_AND_DUE_DILIGENCE'
    ]),
    excluded_scope: Object.freeze([
      'REAL_MONEY_GAMBLING',
      'PUBLIC_PRODUCTION_SERVICE',
      'SOURCE_RESALE',
      'SUBLICENSING',
      'CORE_IP_ASSIGNMENT',
      'LICENSE_CIRCUMVENTION_BY_DERIVATIVE_CLONE',
      'AUTOMATIC_COMMERCIAL_LICENSE',
      'REGULATORY_APPROVAL_CLAIM'
    ]),
    payment: Object.freeze({
      invoice_id: invoice.invoice_id,
      network: invoice.payment.network,
      chain_id: invoice.payment.chain_id,
      asset: invoice.payment.asset,
      amount_asset: invoice.payment.exact_amount_asset,
      tx_hash: payment_evidence.tx_hash,
      confirmations_at_grant: payment_evidence.confirmations,
      payment_is_authority: false
    }),
    effective_at: new Date(grantedAt).toISOString(),
    expires_at: new Date(grantedAt + days * 24 * 60 * 60 * 1000).toISOString(),
    automatic_renewal: false,
    commercial_success_automatically_changes_scope: false,
    production_requires_separate_written_agreement: true,
    law: 'TERMS_ACCEPTED_AND_EXACT_PAYMENT_VERIFIED_THEN_LIMITED_PILOT_GRANT'
  });
}

export function isPilotGrantActive(grant, now_ms = Date.now()) {
  if (!grant || grant.schema !== HELIOS_PILOT_GRANT_SCHEMA || grant.status !== 'PILOT_ACTIVE') return false;
  const now = Number(now_ms);
  const start = Date.parse(grant.effective_at);
  const end = Date.parse(grant.expires_at);
  return Number.isFinite(now) && now >= start && now < end;
}
