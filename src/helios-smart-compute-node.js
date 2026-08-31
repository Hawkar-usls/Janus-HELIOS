import { evaluateHardwareSnapshot } from './helios-hardware-guardian.js';
import { buildEdgeHashEvidenceEnvelope } from './helios-edge-hash-lab.js';
import { normalizeReplicationLineage } from './helios-evidence-independence.js';
import { DeviceHealthPassportBuilder, evaluateHostFirstQuietCanary, assertHumanBlindTelemetry } from './helios-trust-fabric.js';

export const HELIOS_SMART_COMPUTE_NODE_VERSION = '1.1.0';
export const SMART_COMPUTE_NODE_SCHEMA = 'janus.helios.smart-compute-node.v1';
export const GENERIC_WORK_EVIDENCE_SCHEMA = 'janus.helios.generic-work-evidence.v1';

const GENERIC_WORK_KINDS = Object.freeze([
  'GENERAL_COMPUTE', 'AI_INFERENCE', 'RENDER', 'SCIENCE', 'TRANSCODE',
  'STORAGE_NETWORK', 'OPERATOR_BATCH', 'CUSTOM'
]);

function stable(value, fallback = '') {
  return value == null ? fallback : String(value).trim();
}

function optionalNumber(value) {
  if (value == null || value === '') return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

function nonnegative(value) {
  const n = optionalNumber(value);
  return n == null ? null : Math.max(0, n);
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

function normalizeWorkKind(input = {}) {
  const explicit = stable(input.work_kind).toUpperCase();
  if (explicit === 'EDGE_HASH') return 'EDGE_HASH';
  if (GENERIC_WORK_KINDS.includes(explicit)) return explicit;
  if (input.edge_manifest || Array.isArray(input.work_samples)) return 'EDGE_HASH';
  return 'GENERAL_COMPUTE';
}

function genericWorkEvidence(input = {}) {
  const evidence = input.work_evidence && typeof input.work_evidence === 'object' ? input.work_evidence : {};
  const provenance = input.work_provenance && typeof input.work_provenance === 'object' ? input.work_provenance : {};
  assertHumanBlindTelemetry(evidence, 'genericWorkEvidence');
  assertHumanBlindTelemetry(provenance, 'genericWorkProvenance');
  const kind = normalizeWorkKind(input);
  const assigned = nonnegative(evidence.assigned_units);
  const completed = nonnegative(evidence.completed_units);
  const verified = nonnegative(evidence.verified_units);
  if (assigned != null && completed != null && completed > assigned) throw new Error('COMPLETED_WORK_EXCEEDS_ASSIGNED_WORK');
  if (completed != null && verified != null && verified > completed) throw new Error('VERIFIED_WORK_EXCEEDS_COMPLETED_WORK');
  const unit = stable(evidence.unit_name, 'WORK_UNIT').toUpperCase();
  const providerVerified = provenance.provider_execution_verified === true;
  const settlementAuthoritative = provenance.settlement_authoritative === true;
  const receiptId = stable(provenance.provider_receipt_id || provenance.receipt_id) || null;
  const resultDigest = stable(provenance.result_digest) || null;
  const provenanceComplete = Boolean(
    stable(provenance.provider_id) &&
    stable(provenance.executor_id || provenance.executor_digest) &&
    stable(provenance.verifier_id) &&
    receiptId
  );
  const authoritative = provenanceComplete && providerVerified && settlementAuthoritative;
  return deepFreeze({
    schema: GENERIC_WORK_EVIDENCE_SCHEMA,
    work_kind: kind,
    task_type: stable(evidence.task_type, kind),
    normalization: 'WORKLOAD_APPROPRIATE_UNITS',
    unit_name: unit,
    accounting: {
      assigned_units: assigned,
      completed_units: completed,
      verified_units: verified,
      device_ms: nonnegative(evidence.device_ms),
      measured_watt_hours: nonnegative(evidence.measured_watt_hours)
    },
    provenance: {
      provider_id: stable(provenance.provider_id) || null,
      executor_id: stable(provenance.executor_id) || null,
      executor_digest: stable(provenance.executor_digest) || null,
      verifier_id: stable(provenance.verifier_id) || null,
      provider_receipt_id: receiptId,
      result_digest: resultDigest,
      provider_execution_verified: providerVerified,
      settlement_authoritative: settlementAuthoritative
    },
    provenance_complete: provenanceComplete,
    authoritative,
    evidence_ready: (verified ?? completed ?? 0) > 0,
    laws: [
      'ASSIGNED_WORK_NE_COMPLETED_WORK',
      'COMPLETED_WORK_NE_VERIFIED_WORK',
      'WORK_RESULT_EXISTS_NE_AUTHORITY_PROVEN',
      'WORKLOAD_APPROPRIATE_UNITS_NE_MARKETING_THROUGHPUT'
    ]
  });
}

function buildWorkEvidence(input, nodeId) {
  const kind = normalizeWorkKind(input);
  if (kind !== 'EDGE_HASH') return genericWorkEvidence({ ...input, work_kind: kind });
  return buildEdgeHashEvidenceEnvelope({
    manifest: { ...(input.edge_manifest || {}), node_id: nodeId },
    samples: input.work_samples || [],
    provenance: input.work_provenance || {}
  });
}

function workEvidenceReady(workEvidence, workKind) {
  if (workKind === 'EDGE_HASH') {
    return workEvidence.comparison.janus_i0.checked_mh > 0
      && workEvidence.comparison.randomized_mirror.checked_mh > 0;
  }
  return workEvidence.evidence_ready === true;
}

function workEvidenceAuthoritative(workEvidence) {
  return workEvidence.authoritative === true;
}

function workEvidenceProvenanceComplete(workEvidence) {
  return workEvidence.provenance_complete === true;
}

function workReceiptId(workEvidence, workKind) {
  if (workKind === 'EDGE_HASH') return workEvidence.provenance?.pool_receipt_id || null;
  return workEvidence.provenance?.provider_receipt_id || null;
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

  const workKind = normalizeWorkKind(input);
  const workEvidence = buildWorkEvidence(input, nodeId);

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

  const receiptId = workReceiptId(workEvidence, workKind);
  if (receiptId) {
    passportBuilder.addReceiptReference({
      receipt_id: receiptId,
      authority: workEvidenceAuthoritative(workEvidence) ? 'AUTHORITATIVE' : 'NON_AUTHORITATIVE'
    });
  }
  const deviceHealthPassport = passportBuilder.seal();

  const workReady = workEvidenceReady(workEvidence, workKind);
  const hardwareKnown = guardian.observed_max_temp_c != null || guardian.estimated_watts != null;
  const lineageComplete = replicationLineage.unknown_root_count === 0;

  const fusionState = guardian.allow_execution === false
    ? 'DEVICE_PROTECTED_BLOCK'
    : workReady && hardwareKnown
      ? 'MONITORED_WORK_AND_DEVICE'
      : 'MONITORED_PARTIAL_EVIDENCE';

  return deepFreeze({
    schema: SMART_COMPUTE_NODE_SCHEMA,
    version: HELIOS_SMART_COMPUTE_NODE_VERSION,
    node_id: nodeId,
    node_class: nodeClass,
    resource_class: resourceClass,
    work_kind: workKind,
    fusion_state: fusionState,
    self_monitoring: {
      work_or_hash_evidence: true,
      generic_work_evidence_supported: true,
      edge_hash_evidence_supported: true,
      device_health: true,
      execution_budget: true,
      provenance: true,
      replication_lineage: true,
      human_observation: false
    },
    guardian,
    execution_budget: executionBudget,
    work_evidence: workEvidence,
    device_health_passport: deviceHealthPassport,
    replication_lineage: replicationLineage,
    readiness: {
      work_exposure_ready: workReady,
      hardware_sensor_evidence_present: hardwareKnown,
      provenance_complete: workEvidenceProvenanceComplete(workEvidence),
      authoritative_work_evidence: workEvidenceAuthoritative(workEvidence),
      replication_lineage_complete: lineageComplete,
      production_execution_ready: false
    },
    laws: [
      'WORK_MONITORING_AND_DEVICE_MONITORING_ARE_ONE_NODE_RECORD',
      'DEVICE_SAFETY_PRECEDES_EXTERNAL_THROUGHPUT',
      'UNKNOWN_SENSOR_DATA_REMAINS_UNKNOWN',
      workKind === 'EDGE_HASH' ? 'HASH_EVIDENCE_IS_NORMALIZED_BY_CHECKED_WORK' : 'WORK_EVIDENCE_USES_WORKLOAD_APPROPRIATE_UNITS',
      'WORK_RESULT_EXISTS_NE_AUTHORITY_PROVEN',
      'REPLICATION_COUNT_NE_INDEPENDENT_ROOT_COUNT',
      'HARDWARE_AWARE_HUMAN_BLIND',
      'GAME_RNG_PERP_COMPUTE'
    ],
    claim_boundary: {
      universal_workload_execution_claimed_by_public_page: false,
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
