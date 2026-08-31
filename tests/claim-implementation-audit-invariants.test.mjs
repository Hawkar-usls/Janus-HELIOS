import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const [html, receiptViewer, cockpit, status, architecture, audit, fabricContract, smartContract, pilotContract, pilotPolicy] = await Promise.all([
  readFile(new URL('../index.html', import.meta.url), 'utf8'),
  readFile(new URL('../helios-receipt-viewer.js', import.meta.url), 'utf8'),
  readFile(new URL('../helios-buyer-cockpit.js', import.meta.url), 'utf8'),
  readFile(new URL('../PROJECT_STATUS.json', import.meta.url), 'utf8').then(JSON.parse),
  readFile(new URL('../.janus/HELIOS_ARCHITECTURE.json', import.meta.url), 'utf8').then(JSON.parse),
  readFile(new URL('../.janus/HELIOS_CLAIM_IMPLEMENTATION_AUDIT_2026-08-31.json', import.meta.url), 'utf8').then(JSON.parse),
  readFile(new URL('../.janus/HELIOS_DESKTOP_FABRIC.json', import.meta.url), 'utf8').then(JSON.parse),
  readFile(new URL('../.janus/HELIOS_SMART_COMPUTE_NODE.json', import.meta.url), 'utf8').then(JSON.parse),
  readFile(new URL('../.janus/HELIOS_PILOT_AUTHORITY.json', import.meta.url), 'utf8').then(JSON.parse),
  readFile(new URL('../commerce/HELIOS_PILOT_PAYMENT_POLICY.json', import.meta.url), 'utf8').then(JSON.parse)
]);

// Static public UI must not invent live hardware truth.
assert.doesNotMatch(html, />87%<|87% STABLE/i);
assert.match(html, /id="health-value">DEMO/);
assert.match(html, /NO LIVE SENSORS/);
assert.match(html, /no production provider or live device-health sensor is connected/i);

// index.html is the explicit authoritative loader; presentation modules may not create hidden dependency chains.
for (const [id, file] of [
  ['helios-reel-identity-script', 'helios-reel-identity.js'],
  ['helios-reel-forge-script', 'helios-reel-forge.js'],
  ['helios-resource-console-script', 'helios-resource-console.js'],
  ['helios-route-aura-script', 'helios-route-aura.js'],
  ['helios-receipt-viewer-script', 'helios-receipt-viewer.js'],
  ['helios-buyer-cockpit-script', 'helios-buyer-cockpit.js'],
  ['helios-trust-fabric-ui-script', 'helios-trust-fabric-ui.js'],
  ['helios-edge-hash-lab-ui-script', 'helios-edge-hash-lab-ui.js'],
  ['helios-edge-constellation-ui-script', 'helios-edge-constellation-ui.js'],
  ['helios-evidence-independence-ui-script', 'helios-evidence-independence-ui.js'],
  ['helios-smart-compute-node-ui-script', 'helios-smart-compute-node-ui.js'],
  ['helios-resource-sonification-script', 'helios-resource-sonification.js']
]) {
  assert.match(html, new RegExp(`id="${id}"[^>]+${file.replaceAll('.', '\\.')}`));
}
assert.doesNotMatch(receiptViewer, /createElement\(['"]script['"]\)|loadBuyerEnhancements/);

// Buyer policy wording must reflect hardware pressure, not observation of the person.
assert.match(cockpit, /HARDWARE-AWARE \/ HUMAN-BLIND/);
assert.match(cockpit, /HOST RESERVE FIRST/);
assert.match(cockpit, /SHED ON HOST PRESSURE/);
assert.match(cockpit, /human_observation:'FORBIDDEN'/);
assert.doesNotMatch(cockpit, /PAUSE ON INTERACTION|pause_on_interaction|IDLE ONLY|gpu_while_idle/);

// Canonical machine status must match active stack.
assert.equal(status.last_reviewed, '2026-08-31');
assert.equal(status.production_readiness, 'NOT_ESTABLISHED');
assert.equal(status.desktop_fabric.fabric_version, '2.1.0');
assert.equal(status.desktop_fabric.agent_runtime_version, '1.3.0');
assert.equal(status.hardware_guardian.maturity, 'ENFORCED_IN_DESKTOP_AGENT');
assert.equal(status.host_first_qos.maturity, 'ENFORCED_IN_DESKTOP_AGENT');
assert.equal(status.host_first_qos.human_observation, 'FORBIDDEN');
assert.equal(status.smart_compute_node.version, '1.1.0');
assert.ok(status.smart_compute_node.generic_work_kinds.includes('AI_INFERENCE'));
assert.ok(status.smart_compute_node.generic_work_kinds.includes('RENDER'));
assert.equal(status.evidence_independence.maturity, 'IMPLEMENTED_CORE_REAL_ATTESTED_ROOTS_PENDING');
assert.equal(status.pilot_authority.version, '1.0.0');
assert.equal(status.pilot_authority.maturity, 'IMPLEMENTED_CORE_ARMED_DISABLED_PENDING_RECEIVING_ADDRESS');
assert.equal(status.pilot_authority.core_law, 'PAYMENT_IS_EVIDENCE_NOT_AUTHORITY');
assert.equal(status.pilot_authority.primary_payment, 'NATIVE_USDC_ON_BASE_MAINNET');
assert.equal(status.pilot_authority.receiving_address_configured, false);
assert.equal(status.pilot_authority.wallet_private_key_required, false);
assert.equal(status.pilot_authority.real_money_rights, false);
assert.equal(status.receipt_viewer.loads_other_feature_scripts, false);
assert.equal(status.mobile_showcase.version, '1.2.0');
assert.equal(status.stellar_navigation.version, '1.1.0');
assert.equal(status.public_surface.invented_health_percentage, false);

assert.equal(architecture.last_reviewed, '2026-08-31');
assert.equal(architecture.desktop_fabric.agent_version, '1.3.0');
assert.equal(architecture.hardware_guardian.maturity, 'ENFORCED_IN_DESKTOP_AGENT');
assert.equal(architecture.host_first_qos.maturity, 'ENFORCED_IN_DESKTOP_AGENT');
assert.equal(architecture.trust_fabric.provider_authority_epoch, 'IMPLEMENTED_CORE_NOT_END_TO_END_CONNECTED');
assert.equal(architecture.smart_compute_node.version, '1.1.0');
assert.ok(architecture.smart_compute_node.generic_work_evidence.includes('SCIENCE'));
assert.equal(architecture.pilot_authority.version, '1.0.0');
assert.equal(architecture.pilot_authority.maturity, 'IMPLEMENTED_CORE_ARMED_DISABLED_PENDING_RECEIVING_ADDRESS');
assert.equal(architecture.pilot_authority.primary_payment.chain_id, 8453);
assert.equal(architecture.pilot_authority.primary_payment.receiving_address_configured, false);
assert.equal(architecture.pilot_authority.security.watcher_can_move_funds, false);
assert.equal(architecture.public_truth_boundary.invented_health_score, false);
assert.equal(architecture.public_truth_boundary.pilot_payment_authority_active, false);
assert.equal(architecture.public_loader.authoritative_loader, 'index.html');
assert.equal(architecture.public_loader.receipt_viewer_may_load_features, false);
assert.equal(architecture.production_gate.status, 'NOT_ESTABLISHED');

// Explicit maturity separation: do not promote core-only modules to end-to-end enforced.
const byClaim = new Map(audit.findings.map(x => [x.claim, x]));
assert.equal(byClaim.get('GAME_RNG_PERP_COMPUTE').status, 'ENFORCED');
assert.equal(byClaim.get('HARDWARE_GUARDIAN_CAN_ONLY_TIGHTEN_OR_BLOCK').status, 'ENFORCED');
assert.equal(byClaim.get('HOST_FIRST_QOS_EXTERNAL_COMPUTE_YIELDS_TO_DEVICE_PRESSURE').status, 'ENFORCED');
assert.equal(byClaim.get('PROVIDER_DEFAULT_DENY_AND_AUTHORITY_EPOCH').status, 'IMPLEMENTED_CORE');
assert.equal(byClaim.get('RECEIPT_PROVENANCE_ENVELOPE').status, 'IMPLEMENTED_CORE');
assert.equal(byClaim.get('DEVICE_HEALTH_PASSPORT').status, 'IMPLEMENTED_CORE');
assert.equal(byClaim.get('EVIDENCE_INDEPENDENCE_ENGINE').status, 'IMPLEMENTED_CORE');
assert.equal(byClaim.get('AUTOMATED_STANDARD_PILOT_AUTHORITY').status, 'IMPLEMENTED_CORE');
assert.equal(byClaim.get('AUTOMATED_STANDARD_PILOT_AUTHORITY').claim_value, 'ARMED_DISABLED_PENDING_RECEIVING_ADDRESS');
assert.match(byClaim.get('AUTOMATED_STANDARD_PILOT_AUTHORITY').external_gate, /current Binance USDC\/Base deposit support/i);
assert.equal(byClaim.get('PUBLIC_BUYER_LAB_SHOWS_TRUST_AND_POLICY_SURFACES').status, 'DEMO_PREVIEW');
assert.equal(byClaim.get('PRODUCTION_COMPUTE_SETTLEMENT_NETWORK').status, 'EXTERNAL_GATE');
assert.equal(byClaim.get('PUBLIC_PAGE_HAS_LIVE_DEVICE_HEALTH_OR_MINING').claim_value, false);
assert.match(audit.final_rule, /NO_BUYER_FACING_CLAIM/);

assert.equal(pilotContract.status, 'ARMED_DISABLED_PENDING_RECEIVING_ADDRESS');
assert.equal(pilotContract.core_law, 'PAYMENT_IS_EVIDENCE_NOT_AUTHORITY');
assert.equal(pilotContract.payment.primary, 'USDC_ON_BASE_MAINNET');
assert.equal(pilotContract.security.wallet_private_key_required, false);
assert.equal(pilotPolicy.enabled, false);
assert.equal(pilotPolicy.payment.receiving_address, null);
assert.equal(pilotPolicy.grant_gate.payment_alone_is_authority, false);

assert.equal(fabricContract.desktop_agent.runtime_version, '1.3.0');
assert.equal(fabricContract.desktop_agent.hardware_guardian_enforced_before_executor, true);
assert.equal(fabricContract.desktop_agent.host_first_qos_enforced_before_executor, true);
assert.equal(fabricContract.desktop_agent.human_observation_allowed, false);
assert.equal(fabricContract.provider_boundary.provider_authority_epoch_enforced_by_router_dispatch_end_to_end, false);
assert.equal(smartContract.version, '1.1.0');
assert.ok(smartContract.supported_work_evidence.generic.includes('AI_INFERENCE'));
assert.equal(smartContract.public_demo.generic_live_compute, false);

console.log('HELIOS claim-to-implementation audit invariants: PASS');
