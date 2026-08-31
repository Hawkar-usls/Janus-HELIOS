import { evaluateHardwareSnapshot } from './helios-hardware-guardian.js';
import { buildEdgeHashEvidenceEnvelope } from './helios-edge-hash-lab.js';
import { normalizeReplicationLineage } from './helios-evidence-independence.js';
import { DeviceHealthPassportBuilder, evaluateHostFirstQuietCanary } from './helios-trust-fabric.js';

export const HELIOS_SMART_COMPUTE_NODE_VERSION = '1.0.0';
export const SMART_COMPUTE_NODE_SCHEMA = 'janus.helios.smart-compute-node.v1';

function stable(value, fallback = '') {
  return value == null ? fallback : String(value).trim();
}

function optionalNumber(value) {
  if (value == null || value === '') return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

function deepFreeze(value) {
  if (!value || typeof value !== 'object' || Object.isFrozen(value)) return value;
  Object.freeze(value);
  for (const nested of Object.values(value)) deepFreeze(nested);
  return value;
}

function hostTelemetryFrom(input = {}, hardware = {}) {
  const host = input && typeof input === 'object' ? input : {};
  return {
    idle_state: stable(host.idle_state, 'UNKNOWN').toUpperCase(),
    cpu_load_percent: optionalNumber(host.cpu_load_percent ?? hardware.cpu_load),
    gpu_load_percent: optionalNumber(host.gpu_load_percent ?? hardware.gpu_load),
    memory_pressure_percent: optionalNumber(host.memory_pressure_percent),
    vram_pressure_percent: optionalNumber(host.vram_pressure_percent)
  };
}

function observationState(guardian) {
  if (guardian.allow_execution === false) return 'PROTECTED_BLOCK';
  if (guardian.observed_max_temp_c == null) return 'PARTIAL_UNKNOWN';
  if (guardian.state === 'THROTTLE' || guardian.state === 'WATCH') return 'OBSERVED_LIMITED';
  return 'OBSERVED';
}

export function buildSmartComputeNodeSnapshot(input = {}) {
  const nodeId = stable(input.node_id);
  if (!nodeId) throw new Error('SMART_COMPUTE_NODE_ID_REQUIRED');

  const nodeClass = stable(input.node_class, 'SMART_COMPUTE_NODE').toUpperCase();
  const resourceClass = stable(input.resource_class, nodeClass.includes('GPU') ? 'GPU' : 'CPU').toUpperCase();
  const hardwareTelemetry = input.hardware_telemetry && typeof input.hardware_telemetry === 'object'
    ? input.hardware_telemetry
    : {};

  const guardian = evaluateHardwareSnapshot(
    hardwareTelemetry,
    input.guardian_policy || {},
    { resource_class: resourceClass, temp_rise_c_per_min: optionalNumber(input.temp_rise_c_per_min) }
  );

  const hostTelemetry = hostTelemetryFrom(input.host_telemetry, hardwareTelemetry);
  const executionBudget = evaluateHostFirstQuietCanary(
    input.resource_policy || {},
    guardian,
    hostTelemetry
  );

  const edgeManifest = {
    ...(input.edge_manifest || {}),
    node_id: nodeId
  };
  const edgeEvidence = buildEdgeHashEvidenceEnvelope({
    manifest: edgeManifest,
    samples: input.work_samples || [],
    provenance: input.work_provenance || {}
  });

  const replicationLineage = normalizeReplicationLineage({
    node_id: nodeId,
    node_class: nodeClass,
    ...(input.replication_lineage || {})
  });

  const passportBuilder = new DeviceHealthPassportBuilder({
    pseudonymous_device_id: stable(input.pseudonymous_device_id, nodeId),
    guardian_policy_digest: input.guardian_policy_digest || null
  });

  passportBuilder.addObservation({
    sealed_observation_window_id: stable(input.sealed_observation_window_id, `SMART-NODE-${nodeId}-PREVIEW`),
    sensor_source: stable(input.sensor_source, hardwareTelemetry.sensor_source || '') || null,
    sensor_freshness: stable(input.sensor_freshness, hardwareTelemetry.sensor_freshness || 'UNKNOWN'),
    guardian_state: guardian.state,
    observed_max_temp_c: guardian.observed_max_temp_c,
    compute_hours: optionalNumber(input.compute_hours),
    verified_work_hours: optionalNumber(input.verified_work_hours),
    measured_watt_hours: optionalNumber(input.measured_watt_hours),
    throttle_events: guardian.state === 'THROTTLE' ? 1 : 0,
    cooldown_events: guardian.state === 'COOLDOWN' ? 1 : 0,
    thermal_or_power_blocks: guardian.state === 'BLOCK' ? 1 : 0,
    user_revokes: Math.max(0, Math.floor(optionalNumber(input.user_revokes) || 0)),
    evidence_state: observationState(guardian)
  });

  if (edgeEvidence.provenance.pool_receipt_id) {
    passportBuilder.addReceiptReference({
      receipt_id: edgeEvidence.provenance.pool_receipt_id,
      authority: edgeEvidence.authoritative ? 'AUTHORITATIVE' : 'NON_AUTHORITATIVE'
    });
  }
  const deviceHealthPassport = passportBuilder.seal();

  const workExposureReady = edgeEvidence.comparison.janus_i0.checked_mh > 0
    && edgeEvidence.comparison.randomized_mirror.checked_mh > 0;
  const hardwareKnown = guardian.observed_max_temp_c != null || guardian.estimated_watts != null;
  const lineageComplete = replicationLineage.unknown_root_count === 0;

  const fusionState = guardian.allow_execution === false
    ? 'DEVICE_PROTECTED_BLOCK'
    : workExposureReady && hardwareKnown
      ? 'MONITORED_WORK_AND_DEVICE'
      : 'MONITORED_PARTIAL_EVIDENCE';

  return deepFreeze({
    schema: SMART_COMPUTE_NODE_SCHEMA,
    version: HELIOS_SMART_COMPUTE_NODE_VERSION,
    node_id: nodeId,
    node_class: nodeClass,
    resource_class: resourceClass,
    fusion_state: fusionState,
    self_monitoring: {
      work_or_hash_evidence: true,
      device_health: true,
      execution_budget: true,
      provenance: true,
      replication_lineage: true,
      human_observation: false
    },
    guardian,
    execution_budget: executionBudget,
    work_evidence: edgeEvidence,
    device_health_passport: deviceHealthPassport,
    replication_lineage: replicationLineage,
    readiness: {
      work_exposure_ready: workExposureReady,
      hardware_sensor_evidence_present: hardwareKnown,
      provenance_complete: edgeEvidence.provenance_complete,
      authoritative_work_evidence: edgeEvidence.authoritative,
      replication_lineage_complete: lineageComplete,
      production_execution_ready: false
    },
    laws: [
      'WORK_MONITORING_AND_DEVICE_MONITORING_ARE_ONE_NODE_RECORD',
      'DEVICE_SAFETY_PRECEDES_EXTERNAL_THROUGHPUT',
      'UNKNOWN_SENSOR_DATA_REMAINS_UNKNOWN',
      'HASH_OR_WORK_EVIDENCE_IS_NORMALIZED_BY_CHECKED_WORK',
      'WORK_RESULT_EXISTS_NE_AUTHORITY_PROVEN',
      'REPLICATION_COUNT_NE_INDEPENDENT_ROOT_COUNT',
      'HARDWARE_AWARE_HUMAN_BLIND',
      'GAME_RNG_PERP_COMPUTE'
    ],
    claim_boundary: {
      sha256_break: false,
      guaranteed_mining_advantage: false,
      sensor_integrity_proves_sensor_truth: false,
      public_page_is_live_miner: false,
      game_effect: 'NONE',
      rng_effect: 'NONE',
      rtp_effect: 'NONE',
      payout_effect: 'NONE'
    }
  });
}
