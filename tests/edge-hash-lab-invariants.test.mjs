import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import {
  HELIOS_EDGE_HASH_LAB_VERSION,
  NERDMINER_V2_COMPATIBILITY,
  assertNoEdgeSecrets,
  normalizeEdgeNodeManifest,
  createI0BenchmarkPlan,
  compareI0Evidence,
  buildEdgeHashEvidenceEnvelope
} from '../src/helios-edge-hash-lab.js';
import {
  HELIOS_EDGE_CONSTELLATION_VERSION,
  EDGE_NODE_CLASSES,
  normalizeConstellationNode,
  createEdgeConstellationPlan
} from '../src/helios-edge-constellation.js';

const [ui, constellationUi, contract, constellationContract, notices, excluded, receiptViewer, providers, constellationDoc] = await Promise.all([
  readFile(new URL('../helios-edge-hash-lab-ui.js', import.meta.url), 'utf8'),
  readFile(new URL('../helios-edge-constellation-ui.js', import.meta.url), 'utf8'),
  readFile(new URL('../.janus/HELIOS_EDGE_HASH_LAB.json', import.meta.url), 'utf8').then(JSON.parse),
  readFile(new URL('../.janus/HELIOS_EDGE_CONSTELLATION.json', import.meta.url), 'utf8').then(JSON.parse),
  readFile(new URL('../THIRD_PARTY_NOTICES.md', import.meta.url), 'utf8'),
  readFile(new URL('../legal/EXCLUDED_ASSETS_SCHEDULE.md', import.meta.url), 'utf8'),
  readFile(new URL('../helios-receipt-viewer.js', import.meta.url), 'utf8'),
  readFile(new URL('../providers/REFERENCE_ROUTES.json', import.meta.url), 'utf8').then(JSON.parse),
  readFile(new URL('../docs/EDGE_CONSTELLATION.md', import.meta.url), 'utf8')
]);

assert.equal(HELIOS_EDGE_HASH_LAB_VERSION, '1.0.0');
assert.equal(NERDMINER_V2_COMPATIBILITY.upstream_repository, 'BitMaker-hub/NerdMiner_v2');
assert.equal(NERDMINER_V2_COMPATIBILITY.upstream_license, 'MIT');
assert.equal(NERDMINER_V2_COMPATIBILITY.source_code_embedded_in_helios, false);

assert.equal(assertNoEdgeSecrets({ telemetry: { checked_mh: 10 } }), true);
assert.throws(() => assertNoEdgeSecrets({ wifi_password: 'nope' }), /EDGE_HASH_SECRET_FORBIDDEN/);
assert.throws(() => assertNoEdgeSecrets({ nested: { private_key: 'nope' } }), /EDGE_HASH_SECRET_FORBIDDEN/);

const stock = normalizeEdgeNodeManifest({ firmware_mode: 'STOCK_EXTERNAL' });
assert.equal(stock.stock_firmware_modified_by_helios, false);
assert.equal(stock.upstream_source_vendored, false);
assert.equal(stock.i0_scheduler_enabled, false);
assert.equal(stock.public_demo_connects_to_pool, false);
assert.equal(stock.public_demo_collects_wallet_address, false);
assert.equal(stock.game_effect, 'NONE');
assert.throws(
  () => normalizeEdgeNodeManifest({ firmware_mode: 'STOCK_EXTERNAL', i0_scheduler_enabled: true }),
  /I0_SCHEDULER_REQUIRES_BRIDGE_OR_COMPATIBLE_FIRMWARE/
);

const bridge = normalizeEdgeNodeManifest({ firmware_mode: 'JANUS_I0_BRIDGE', i0_scheduler_enabled: true });
assert.equal(bridge.i0_scheduler_authority, 'BACKGROUND_IP_BRIDGE_ONLY');
assert.match(bridge.wire_policy, /CONFORMANCE/);

const previewPlan = createI0BenchmarkPlan({ manifest: { firmware_mode: 'STOCK_EXTERNAL' }, checked_work_target_mh: 200 });
assert.equal(previewPlan.mode, 'PRESENTATION_PLAN_ONLY');
assert.equal(previewPlan.execution_ready, false);
assert.equal(previewPlan.arms.length, 2);
assert.equal(previewPlan.arms[0].weight, 0.5);
assert.equal(previewPlan.arms[1].weight, 0.5);
assert.equal(previewPlan.arms[0].checked_work_target_mh, 100);
assert.equal(previewPlan.arms[1].checked_work_target_mh, 100);
assert.equal(previewPlan.controls.equal_exposure, true);
assert.equal(previewPlan.controls.same_job_stream_required, true);
assert.equal(previewPlan.controls.stock_wire_mutation_allowed, false);
assert.equal(previewPlan.claims.sha256_break, false);
assert.equal(previewPlan.claims.nonce_prediction, false);
assert.equal(previewPlan.claims.mining_profit_claim, false);
assert.equal(previewPlan.source_lineage.full_i0_scheduler_embedded_in_helios, false);

const executablePlan = createI0BenchmarkPlan({
  manifest: { firmware_mode: 'JANUS_I0_BRIDGE', i0_scheduler_enabled: true },
  checked_work_target_mh: 40
});
assert.equal(executablePlan.mode, 'BRIDGE_EXECUTION_PLAN');
assert.equal(executablePlan.execution_ready, true);
assert.equal(executablePlan.execution_gate, 'BRIDGE_CONFORMANCE_STILL_REQUIRED');

const evidence = compareI0Evidence([
  { group: 'JANUS_I0', checked_mh: 50, accepted: 5, z28: 3, z30: 2, z32: 1, max_z: 32 },
  { group: 'RANDOMIZED_MIRROR', checked_mh: 50, accepted: 4, z28: 2, z30: 1, z32: 0, max_z: 30 }
]);
assert.equal(evidence.normalization, 'PER_CHECKED_MH');
assert.equal(evidence.janus_i0.accepted_per_mh, 0.1);
assert.equal(evidence.randomized_mirror.accepted_per_mh, 0.08);
assert.equal(evidence.janus_i0.z32_per_mh, 0.02);
assert.equal(evidence.randomized_mirror.z32_per_mh, 0);
assert.equal(evidence.verdict, 'OBSERVED_DIFFERENCE_NOT_CAUSAL_PROOF');
assert.equal(evidence.isolated_rare_tail_is_proof, false);
assert.equal(evidence.profit_inference_allowed, false);

const incompleteEnvelope = buildEdgeHashEvidenceEnvelope({ manifest: { firmware_mode: 'STOCK_EXTERNAL' }, samples: [] });
assert.equal(incompleteEnvelope.provenance_complete, false);
assert.equal(incompleteEnvelope.authoritative, false);
assert.equal(incompleteEnvelope.raw_wallet_material_stored, false);
assert.equal(incompleteEnvelope.human_observation_used, false);
assert.equal(incompleteEnvelope.settlement_authority, 'EXTERNAL_POOL_OR_PROVIDER_ONLY');

const completeEnvelope = buildEdgeHashEvidenceEnvelope({
  manifest: { firmware_mode: 'JANUS_I0_BRIDGE', i0_scheduler_enabled: true },
  samples: [],
  provenance: {
    authority_epoch: '7', lease_id: 'lease-1', executor_digest: 'sha256:a', firmware_digest: 'sha256:b',
    verifier_id: 'verifier-1', pool_receipt_id: 'pool-1', external_verification_status: 'VERIFIED'
  }
});
assert.equal(completeEnvelope.provenance_complete, true);
assert.equal(completeEnvelope.authoritative, true);

assert.match(ui, /EDGE HASH LAB · NERDMINER V2 × JANUS I0/);
assert.match(ui, /STRICT 50 \/ 50 RANDOM MIRROR/);
assert.match(ui, /PER CHECKED MH · NOT RAW COUNTS/);
assert.match(ui, /NO SHA-256 SHORTCUT CLAIM/);
assert.match(ui, /no NerdMiner source is vendored/i);
assert.doesNotMatch(ui, /requestPort\s*\(/);
assert.doesNotMatch(ui, /wallet_address\s*[:=]/i);
assert.doesNotMatch(ui, /Math\.random\s*\(/);

assert.equal(contract.version, '1.0.0');
assert.equal(contract.nerdminer_v2.license, 'MIT');
assert.equal(contract.nerdminer_v2.source_code_vendored_into_helios, false);
assert.equal(contract.janus_i0.full_scheduler_source_embedded_in_helios, false);
assert.equal(contract.evidence.raw_counts_alone_are_sufficient, false);
assert.equal(contract.evidence.same_wire_required, true);
assert.equal(contract.public_demo.live_mining, false);
assert.equal(contract.public_demo.fake_hashrate, false);
assert.equal(contract.commercial_boundary.janus_i0_not_automatically_assigned_with_helios, true);
assert.equal(contract.authority.game_math_authority, 'NONE');

const edgeProvider = providers.routes.find(route => route.provider_id === 'nerdminer-v2-edge');
assert.ok(edgeProvider);
assert.equal(edgeProvider.route_class, 'TREASURY');
assert.equal(edgeProvider.compatibility_only, true);
assert.equal(edgeProvider.upstream_license, 'MIT');
assert.equal(edgeProvider.stock_firmware_i0_scheduler, false);
assert.equal(edgeProvider.live_pool_connected_in_public_demo, false);

assert.match(notices, /BitMaker-hub\/NerdMiner_v2/);
assert.match(notices, /Copyright \(c\) 2023 Bitmaker/);
assert.match(excluded, /Hawkar-usls\/janus-io/);
assert.match(excluded, /JANUS I0/i);

// Superseding Edge Constellation compatibility boundary.
// Detailed v1.1 independence behavior lives in edge-constellation-invariants.test.mjs
// and evidence-independence-invariants.test.mjs; this parent test only protects the bridge.
assert.equal(HELIOS_EDGE_CONSTELLATION_VERSION, '1.1.0');
assert.ok(EDGE_NODE_CLASSES.NERDMINER_ESP32);
assert.ok(EDGE_NODE_CLASSES.DESKTOP_CPU);
assert.ok(EDGE_NODE_CLASSES.DESKTOP_GPU);
assert.ok(EDGE_NODE_CLASSES.ASIC_GATEWAY);

const esp32Passport = normalizeConstellationNode({ node_id: 'esp32-1', node_class: 'NERDMINER_ESP32' });
assert.equal(esp32Passport.evidence_weight, 'ONE_NODE_ONE_REPLICATION_UNIT_BEFORE_INDEPENDENCE_GATE');
assert.equal(esp32Passport.advertised_performance_used_as_evidence_weight, false);
assert.equal(esp32Passport.raw_hashrate_used_as_cross_node_weight, false);
assert.equal(esp32Passport.independent_evidence_requires_lineage_roots, true);
assert.equal(esp32Passport.public_demo_connected, false);
assert.equal(esp32Passport.public_demo_executes_hashing, false);
assert.throws(() => normalizeConstellationNode({ node_class: 'NERDMINER_ESP32' }), /NODE_ID_REQUIRED/);
assert.throws(() => normalizeConstellationNode({ node_id: 'x', node_class: 'QUANTUM_MAGIC' }), /INVALID_EDGE_CONSTELLATION_NODE_CLASS/);
assert.throws(() => normalizeConstellationNode({ node_id: 'x', node_class: 'ASIC_GATEWAY', pool_password: 'nope' }), /EDGE_HASH_SECRET_FORBIDDEN/);

const constellationPlan = createEdgeConstellationPlan({
  campaign_id: 'test-constellation',
  nodes: [
    { node_id: 'esp32-1', node_class: 'NERDMINER_ESP32', checked_work_target_mh: 20 },
    { node_id: 'cpu-1', node_class: 'DESKTOP_CPU', checked_work_target_mh: 200 },
    { node_id: 'asic-1', node_class: 'ASIC_GATEWAY', checked_work_target_mh: 20000 }
  ]
});
assert.equal(constellationPlan.mode, 'PRESENTATION_PLAN_ONLY');
assert.equal(constellationPlan.execution_ready, false);
assert.equal(constellationPlan.nodes.length, 3);
assert.equal(constellationPlan.replication_law.node_power_not_evidence_weight, true);
assert.equal(constellationPlan.replication_law.replication_count_not_equal_independent_root_count, true);
assert.equal(constellationPlan.replication_law.unknown_lineage_not_independent, true);
assert.equal(constellationPlan.replication_law.minimum_strongly_independent_complete_nodes, 2);
assert.equal(constellationPlan.replication_law.raw_hashrate_cross_node_weighting, false);
assert.equal(constellationPlan.replication_law.raw_checked_work_cross_node_weighting, false);
assert.equal(constellationPlan.claims.stronger_hardware_equals_stronger_evidence, false);
assert.equal(constellationPlan.claims.raw_replication_count_equals_independent_replications, false);
assert.equal(constellationPlan.public_demo.requests_serial_device, false);
assert.equal(constellationPlan.public_demo.fake_hashrate, false);
assert.throws(() => createEdgeConstellationPlan({ nodes: [
  { node_id: 'dup', node_class: 'NERDMINER_ESP32' },
  { node_id: 'dup', node_class: 'DESKTOP_CPU' }
] }), /DUPLICATE_EDGE_CONSTELLATION_NODE_ID/);

assert.match(constellationUi, /EDGE CONSTELLATION · I0 REPLICATION PLANE/);
assert.match(constellationUi, /NODE POWER ≠ EVIDENCE WEIGHT/);
assert.match(constellationUi, /INDEPENDENCE GATE/);
assert.match(constellationUi, /PLANNED · NOT CONNECTED/);
assert.doesNotMatch(constellationUi, /requestPort\s*\(/);
assert.doesNotMatch(constellationUi, /Math\.random\s*\(/);
assert.doesNotMatch(constellationUi, /wallet_address\s*[:=]/i);
assert.match(receiptViewer, /helios-edge-constellation-ui-script/);
assert.match(receiptViewer, /helios-edge-constellation-ui\.js\?v=1\.1\.0/);
assert.match(receiptViewer, /helios-evidence-independence-ui-script/);

assert.equal(constellationContract.version, '1.1.0');
assert.ok(constellationContract.core_laws.includes('NODE_POWER_NOT_EQUAL_EVIDENCE_WEIGHT'));
assert.ok(constellationContract.core_laws.includes('REPLICATION_COUNT_NOT_EQUAL_INDEPENDENT_ROOT_COUNT'));
assert.equal(constellationContract.evidence_independence_gate.required, true);
assert.equal(constellationContract.evidence_independence_gate.unknown_counts_as_independent, false);
assert.equal(constellationContract.evidence_independence_gate.minimum_strongly_independent_complete_nodes, 2);
assert.equal(constellationContract.cross_node_replication_law.node_power_not_evidence_weight, true);
assert.equal(constellationContract.cross_node_replication_law.raw_hashrate_cross_node_weighting, false);
assert.equal(constellationContract.cross_node_replication_law.raw_checked_work_cross_node_weighting, false);
assert.equal(constellationContract.cross_node_replication_law.directional_consistency_is_causal_proof, false);
assert.equal(constellationContract.public_demo.connected_devices, 0);
assert.equal(constellationContract.public_demo.requests_serial_device, false);
assert.equal(constellationContract.public_demo.fake_independence_score, false);
assert.equal(constellationContract.authority.game_math_authority, 'NONE');
assert.equal(constellationContract.authority.public_compute_execution_authority, 'NONE');
assert.match(constellationDoc, /NODE POWER ≠ EVIDENCE WEIGHT/);

console.log('HELIOS Edge Hash Lab / NerdMinerV2 × JANUS I0 + superseding Edge Constellation bridge invariants: PASS');
