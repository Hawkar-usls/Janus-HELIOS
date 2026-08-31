import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import {
  HELIOS_SMART_COMPUTE_NODE_VERSION,
  buildSmartComputeNodeSnapshot
} from '../src/helios-smart-compute-node.js';

const [contract, ui, html] = await Promise.all([
  readFile(new URL('../.janus/HELIOS_SMART_COMPUTE_NODE.json', import.meta.url), 'utf8').then(JSON.parse),
  readFile(new URL('../helios-smart-compute-node-ui.js', import.meta.url), 'utf8'),
  readFile(new URL('../index.html', import.meta.url), 'utf8')
]);

assert.equal(HELIOS_SMART_COMPUTE_NODE_VERSION, '1.1.0');

const roots = {
  physical_device_root: 'gpu-device-a',
  execution_lineage_root: 'executor-a',
  authority_root: 'provider-a',
  site_network_root: 'site-a',
  observation_epoch_root: 'epoch-a',
  job_stream_root: 'job-a'
};

const smart = buildSmartComputeNodeSnapshot({
  node_id: 'smart-gpu-a',
  node_class: 'DESKTOP_GPU',
  resource_class: 'GPU',
  resource_policy: { cpu_percent: 0, gpu_percent: 40 },
  guardian_policy: { max_temp_c: 80, thermal_margin_c: 10, throttle_scale: 0.5 },
  hardware_telemetry: {
    gpu_temperature_c: 72,
    estimated_watts: 130,
    power_limit_w: 220,
    available_vram_mb: 4096,
    gpu_load: 20,
    on_ac_power: true,
    sensor_source: 'NVML',
    sensor_freshness: 'FRESH'
  },
  host_telemetry: { idle_state: 'IDLE', gpu_load_percent: 20 },
  edge_manifest: { firmware_mode: 'JANUS_I0_BRIDGE', i0_scheduler_enabled: true },
  work_samples: [
    { group: 'JANUS_I0', checked_mh: 50, accepted: 5, z32: 1, guardian_state: 'THROTTLE' },
    { group: 'RANDOMIZED_MIRROR', checked_mh: 50, accepted: 4, z32: 0, guardian_state: 'THROTTLE' }
  ],
  replication_lineage: roots,
  sealed_observation_window_id: 'window-a',
  compute_hours: 1,
  verified_work_hours: 0.8,
  measured_watt_hours: 100
});

assert.equal(smart.work_kind, 'EDGE_HASH');
assert.equal(smart.fusion_state, 'MONITORED_WORK_AND_DEVICE');
assert.equal(smart.self_monitoring.work_or_hash_evidence, true);
assert.equal(smart.self_monitoring.generic_work_evidence_supported, true);
assert.equal(smart.self_monitoring.edge_hash_evidence_supported, true);
assert.equal(smart.self_monitoring.device_health, true);
assert.equal(smart.self_monitoring.human_observation, false);
assert.equal(smart.guardian.state, 'THROTTLE');
assert.equal(smart.execution_budget.gpu_percent, 20);
assert.ok(smart.execution_budget.gpu_percent <= 40);
assert.equal(smart.work_evidence.comparison.normalization, 'PER_CHECKED_MH');
assert.equal(smart.work_evidence.comparison.verdict, 'OBSERVED_DIFFERENCE_NOT_CAUSAL_PROOF');
assert.equal(smart.device_health_passport.summary.max_observed_temperature_c, 72);
assert.equal(smart.device_health_passport.summary.measured_watt_hours, 100);
assert.equal(smart.device_health_passport.privacy_boundary, 'HARDWARE_AWARE_HUMAN_BLIND');
assert.equal(smart.replication_lineage.known_root_count, 6);
assert.equal(smart.replication_lineage.unknown_root_count, 0);
assert.equal(smart.readiness.replication_lineage_complete, true);
assert.equal(smart.readiness.authoritative_work_evidence, false);
assert.equal(smart.readiness.production_execution_ready, false);
assert.equal(smart.claim_boundary.sha256_break, false);
assert.equal(smart.claim_boundary.guaranteed_mining_advantage, false);
assert.equal(smart.claim_boundary.game_effect, 'NONE');

const generic = buildSmartComputeNodeSnapshot({
  node_id: 'ai-gpu-node',
  node_class: 'DESKTOP_GPU',
  resource_class: 'GPU',
  work_kind: 'AI_INFERENCE',
  resource_policy: { cpu_percent: 10, gpu_percent: 35 },
  guardian_policy: { max_temp_c: 80 },
  hardware_telemetry: {
    gpu_temperature_c: 60,
    estimated_watts: 110,
    power_limit_w: 220,
    available_vram_mb: 8192,
    on_ac_power: true,
    sensor_source: 'NVML',
    sensor_freshness: 'FRESH'
  },
  host_telemetry: { idle_state: 'AVAILABLE', cpu_load_percent: 20, gpu_load_percent: 30 },
  work_evidence: {
    task_type: 'AI_INFERENCE',
    unit_name: 'INFERENCE_BATCH',
    assigned_units: 10,
    completed_units: 8,
    verified_units: 7,
    device_ms: 2500,
    measured_watt_hours: 0.08
  },
  work_provenance: {
    provider_id: 'provider-ai',
    executor_id: 'executor-ai-v1',
    verifier_id: 'verifier-ai-v1',
    provider_receipt_id: 'receipt-ai-1',
    provider_execution_verified: true,
    settlement_authoritative: true
  },
  replication_lineage: roots,
  sealed_observation_window_id: 'window-ai'
});
assert.equal(generic.work_kind, 'AI_INFERENCE');
assert.equal(generic.work_evidence.normalization, 'WORKLOAD_APPROPRIATE_UNITS');
assert.equal(generic.work_evidence.accounting.assigned_units, 10);
assert.equal(generic.work_evidence.accounting.completed_units, 8);
assert.equal(generic.work_evidence.accounting.verified_units, 7);
assert.equal(generic.work_evidence.authoritative, true);
assert.equal(generic.readiness.authoritative_work_evidence, true);
assert.equal(generic.fusion_state, 'MONITORED_WORK_AND_DEVICE');
assert.equal(generic.device_health_passport.summary.authoritative_receipts, 1);
assert.ok(generic.laws.includes('WORK_EVIDENCE_USES_WORKLOAD_APPROPRIATE_UNITS'));

assert.throws(() => buildSmartComputeNodeSnapshot({
  node_id: 'bad-accounting',
  work_kind: 'RENDER',
  work_evidence: { assigned_units: 1, completed_units: 2 }
}), /COMPLETED_WORK_EXCEEDS_ASSIGNED_WORK/);

const unknown = buildSmartComputeNodeSnapshot({
  node_id: 'unknown-sensor-node',
  node_class: 'NERDMINER_ESP32',
  resource_policy: { cpu_percent: 15, gpu_percent: 0 },
  edge_manifest: { firmware_mode: 'STOCK_EXTERNAL' },
  hardware_telemetry: {},
  work_samples: [],
  replication_lineage: {}
});
assert.equal(unknown.guardian.state, 'UNKNOWN');
assert.equal(unknown.device_health_passport.summary.max_observed_temperature_c, null);
assert.equal(unknown.device_health_passport.unknown_remains_unknown, true);
assert.equal(unknown.fusion_state, 'MONITORED_PARTIAL_EVIDENCE');
assert.equal(unknown.replication_lineage.known_root_count, 0);

assert.throws(() => buildSmartComputeNodeSnapshot({
  node_id: 'spy-node',
  hardware_telemetry: { screen: 'pixels' }
}), /HUMAN_OBSERVATION_FORBIDDEN/);
assert.throws(() => buildSmartComputeNodeSnapshot({
  node_id: 'secret-node',
  edge_manifest: { pool_password: 'forbidden' }
}), /EDGE_HASH_SECRET_FORBIDDEN/);
assert.throws(() => buildSmartComputeNodeSnapshot({}), /SMART_COMPUTE_NODE_ID_REQUIRED/);

assert.equal(contract.version, '1.1.0');
assert.equal(contract.classification, 'UNIFIED_WORK_AND_DEVICE_SELF_MONITORING_NODE');
assert.ok(contract.core_laws.includes('WORK_MONITORING_AND_DEVICE_MONITORING_ARE_ONE_NODE_RECORD'));
assert.ok(contract.supported_work_evidence.generic.includes('AI_INFERENCE'));
assert.ok(contract.supported_work_evidence.generic.includes('RENDER'));
assert.equal(contract.safety.provider_can_override_guardian, false);
assert.equal(contract.safety.missing_thermal_sensor_means_green, false);
assert.equal(contract.safety.human_activity_observation_allowed, false);
assert.equal(contract.supported_work_evidence.sha256_break_claim, false);
assert.equal(contract.device_health.unknown_remains_unknown, true);
assert.equal(contract.public_demo.live_mining, false);
assert.equal(contract.public_demo.generic_live_compute, false);
assert.equal(contract.public_demo.fake_hashrate, false);
assert.equal(contract.public_demo.fake_temperature, false);
assert.equal(contract.authority.game_effect, 'NONE');

assert.match(ui, /VERSION='1\.1\.0'/);
assert.match(ui, /SMART COMPUTE NODE · WORK \+ DEVICE SELF-MONITORING/);
assert.match(ui, /HASH \/ AI \/ RENDER \/ SCIENCE/);
assert.match(ui, /ONE NODE RECORD/);
assert.match(ui, /LIVE SENSORS REQUIRED/);
assert.match(ui, /helios-smart-compute-node\.js\?v=1\.1\.0/);
assert.doesNotMatch(ui, /requestPort\s*\(/);
assert.doesNotMatch(ui, /getUserMedia\s*\(/);
assert.doesNotMatch(ui, /Math\.random\s*\(/);
assert.match(html, /id="helios-smart-compute-node-ui-script"[^>]+helios-smart-compute-node-ui\.js\?v=1\.1\.0/);

console.log('HELIOS Smart Compute Node generic work + edge-hash + device self-monitoring invariants: PASS');
