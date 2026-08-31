import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import {
  HELIOS_SMART_COMPUTE_NODE_VERSION,
  buildSmartComputeNodeSnapshot
} from '../src/helios-smart-compute-node.js';

const [contract, ui, receiptViewer] = await Promise.all([
  readFile(new URL('../.janus/HELIOS_SMART_COMPUTE_NODE.json', import.meta.url), 'utf8').then(JSON.parse),
  readFile(new URL('../helios-smart-compute-node-ui.js', import.meta.url), 'utf8'),
  readFile(new URL('../helios-receipt-viewer.js', import.meta.url), 'utf8')
]);

assert.equal(HELIOS_SMART_COMPUTE_NODE_VERSION, '1.0.0');

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

assert.equal(smart.fusion_state, 'MONITORED_WORK_AND_DEVICE');
assert.equal(smart.self_monitoring.work_or_hash_evidence, true);
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

assert.equal(contract.version, '1.0.0');
assert.equal(contract.classification, 'UNIFIED_WORK_AND_DEVICE_SELF_MONITORING_NODE');
assert.ok(contract.core_laws.includes('WORK_MONITORING_AND_DEVICE_MONITORING_ARE_ONE_NODE_RECORD'));
assert.equal(contract.safety.provider_can_override_guardian, false);
assert.equal(contract.safety.missing_thermal_sensor_means_green, false);
assert.equal(contract.safety.human_activity_observation_allowed, false);
assert.equal(contract.work_evidence.raw_hashrate_is_proof, false);
assert.equal(contract.device_health.unknown_remains_unknown, true);
assert.equal(contract.public_demo.live_mining, false);
assert.equal(contract.public_demo.fake_hashrate, false);
assert.equal(contract.public_demo.fake_temperature, false);
assert.equal(contract.authority.game_effect, 'NONE');

assert.match(ui, /SMART COMPUTE NODE · WORK \+ DEVICE SELF-MONITORING/);
assert.match(ui, /ONE NODE RECORD/);
assert.match(ui, /LIVE SENSORS REQUIRED/);
assert.match(ui, /helios-smart-compute-node\.js\?v=1\.0\.0/);
assert.doesNotMatch(ui, /requestPort\s*\(/);
assert.doesNotMatch(ui, /getUserMedia\s*\(/);
assert.doesNotMatch(ui, /Math\.random\s*\(/);
assert.match(receiptViewer, /helios-smart-compute-node-ui-script/);

console.log('HELIOS Smart Compute Node work + device self-monitoring invariants: PASS');
