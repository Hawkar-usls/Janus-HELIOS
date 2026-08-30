export const HELIOS_TRUST_FABRIC_VERSION = '1.0.0';
export const PROVIDER_AUTHORITY_SCHEMA = 'janus.helios.provider-authority.v1';
export const RECEIPT_PROVENANCE_SCHEMA = 'janus.helios.receipt-provenance.v1';
export const DEVICE_HEALTH_PASSPORT_SCHEMA = 'janus.helios.device-health-passport.v1';
export const TRUE_WORK_ACCOUNTING_SCHEMA = 'janus.helios.true-work-accounting.v1';
export const COMPUTE_LINEAGE_SCHEMA = 'janus.helios.compute-lineage.v1';

const FORBIDDEN_HUMAN_KEYS = new Set([
  'audio', 'audio_spectrum', 'microphone', 'camera', 'screen', 'screenshot',
  'keyboard', 'keystrokes', 'mouse', 'clipboard', 'window_title', 'active_window',
  'browser_history', 'url_history', 'game_name', 'process_name', 'processes',
  'top_processes', 'typed_text', 'voice', 'webcam'
]);

const DIGEST_RE = /^[a-f0-9]{64}$/i;
const AUTHORITY_STATES = Object.freeze(['REGISTERED_NOT_ADMITTED', 'ADMITTED', 'REVOKED']);

function clamp(value, min, max) {
  const n = Number(value);
  return Number.isFinite(n) ? Math.max(min, Math.min(max, n)) : min;
}

function optionalNumber(value) {
  if (value == null || value === '') return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

function safeId(value, label) {
  const out = String(value || '').trim();
  if (!out) throw new Error(`${label}_REQUIRED`);
  return out;
}

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

export function assertHumanBlindTelemetry(value, path = 'telemetry') {
  if (value == null || typeof value !== 'object') return true;
  if (Array.isArray(value)) {
    value.forEach((entry, index) => assertHumanBlindTelemetry(entry, `${path}[${index}]`));
    return true;
  }
  for (const [key, nested] of Object.entries(value)) {
    if (FORBIDDEN_HUMAN_KEYS.has(String(key).toLowerCase())) {
      throw new Error(`HUMAN_OBSERVATION_FORBIDDEN:${path}.${key}`);
    }
    assertHumanBlindTelemetry(nested, `${path}.${key}`);
  }
  return true;
}

export function normalizeProviderManifest(input = {}) {
  const providerId = safeId(input.provider_id, 'PROVIDER_ID');
  const version = safeId(input.manifest_version || input.version, 'MANIFEST_VERSION');
  return Object.freeze({
    provider_id: providerId,
    manifest_version: version,
    adapter_id: input.adapter_id ? String(input.adapter_id) : null,
    verifier_id: input.verifier_id ? String(input.verifier_id) : null,
    resource_classes: Object.freeze([...(input.resource_classes || [])].map(x => String(x).toUpperCase()).sort()),
    declared_capabilities: Object.freeze([...(input.declared_capabilities || [])].map(String).sort()),
    registration_is_authority: false,
    admission_default: 'DENY'
  });
}

export class ProviderAuthorityEpoch {
  constructor({ epoch = 1 } = {}) {
    const normalizedEpoch = Math.floor(Number(epoch));
    if (!Number.isFinite(normalizedEpoch) || normalizedEpoch < 1) throw new Error('AUTHORITY_EPOCH_MUST_BE_POSITIVE');
    this.epoch = normalizedEpoch;
    this.providers = new Map();
    this.leases = new Map();
    this.sequence = 0;
  }

  register(manifest) {
    const normalized = normalizeProviderManifest(manifest);
    const record = {
      schema: PROVIDER_AUTHORITY_SCHEMA,
      provider_id: normalized.provider_id,
      manifest: normalized,
      status: 'REGISTERED_NOT_ADMITTED',
      authority_epoch: this.epoch,
      revoked_reason: null
    };
    this.providers.set(normalized.provider_id, record);
    return clone(record);
  }

  admit(providerId, { scopes = ['EXECUTE'], max_dispatches = 1 } = {}) {
    const id = safeId(providerId, 'PROVIDER_ID');
    const provider = this.providers.get(id);
    if (!provider) throw new Error('UNKNOWN_PROVIDER');
    if (provider.status === 'REVOKED') throw new Error('PROVIDER_REVOKED');
    const normalizedScopes = [...new Set(scopes.map(x => String(x).trim()).filter(Boolean))].sort();
    if (!normalizedScopes.length) throw new Error('NONEMPTY_SCOPE_REQUIRED');
    const budget = Math.floor(Number(max_dispatches));
    if (!Number.isFinite(budget) || budget < 1) throw new Error('MAX_DISPATCHES_MUST_BE_POSITIVE');
    provider.status = 'ADMITTED';
    provider.authority_epoch = this.epoch;
    const leaseId = `HELIOS-LEASE-${this.epoch}-${++this.sequence}-${id}`;
    const lease = {
      schema: PROVIDER_AUTHORITY_SCHEMA,
      lease_id: leaseId,
      provider_id: id,
      authority_epoch: this.epoch,
      scopes: normalizedScopes,
      max_dispatches: budget,
      dispatches_used: 0,
      revoked: false,
      transferable: false
    };
    this.leases.set(leaseId, lease);
    return clone(lease);
  }

  revokeProvider(providerId, reason = 'POLICY_REVOKE') {
    const id = safeId(providerId, 'PROVIDER_ID');
    const provider = this.providers.get(id);
    if (!provider) throw new Error('UNKNOWN_PROVIDER');
    provider.status = 'REVOKED';
    provider.revoked_reason = String(reason);
    for (const lease of this.leases.values()) if (lease.provider_id === id) lease.revoked = true;
    return clone(provider);
  }

  rotateEpoch(reason = 'POLICY_ROTATION') {
    this.epoch += 1;
    return Object.freeze({
      schema: PROVIDER_AUTHORITY_SCHEMA,
      authority_epoch: this.epoch,
      reason: String(reason),
      stale_prior_leases: true
    });
  }

  validateLease(leaseId, { provider_id = null, required_scope = 'EXECUTE', consume = false } = {}) {
    const lease = this.leases.get(safeId(leaseId, 'LEASE_ID'));
    if (!lease) throw new Error('UNKNOWN_PROVIDER_LEASE');
    if (lease.revoked) throw new Error('PROVIDER_LEASE_REVOKED');
    if (lease.authority_epoch !== this.epoch) throw new Error('STALE_PROVIDER_AUTHORITY_EPOCH');
    if (provider_id != null && String(provider_id) !== lease.provider_id) throw new Error('PROVIDER_PRINCIPAL_MISMATCH');
    const provider = this.providers.get(lease.provider_id);
    if (!provider || provider.status !== 'ADMITTED') throw new Error('PROVIDER_NOT_ADMITTED');
    if (!lease.scopes.includes(String(required_scope))) throw new Error('PROVIDER_CAPABILITY_SCOPE_DENIED');
    if (consume) {
      if (lease.dispatches_used >= lease.max_dispatches) throw new Error('PROVIDER_DISPATCH_BUDGET_EXHAUSTED');
      lease.dispatches_used += 1;
    }
    return clone(lease);
  }

  getProvider(providerId) {
    const record = this.providers.get(String(providerId));
    return record ? clone(record) : null;
  }
}

export function evaluateHostFirstQuietCanary(resourcePolicy = {}, guardianDecision = {}, hostTelemetry = {}) {
  assertHumanBlindTelemetry(hostTelemetry, 'hostTelemetry');
  const requestedCpu = clamp(resourcePolicy.cpu_percent ?? resourcePolicy.cpu_limit_percent ?? 0, 0, 100);
  const requestedGpu = clamp(resourcePolicy.gpu_percent ?? resourcePolicy.gpu_limit_percent ?? 0, 0, 100);
  const reasons = [];
  if (guardianDecision.allow_execution === false || Number(guardianDecision.allowed_load_scale) <= 0) {
    return Object.freeze({
      schema: 'janus.helios.host-first-qos.v1',
      allow_execution: false,
      host_priority: 'ABSOLUTE',
      external_compute_yields_first: true,
      cpu_percent: 0,
      gpu_percent: 0,
      scale: 0,
      reasons: ['HARDWARE_GUARDIAN_BLOCK'],
      human_observation: 'FORBIDDEN'
    });
  }

  let scale = clamp(guardianDecision.allowed_load_scale ?? 1, 0, 1);
  const idleState = String(hostTelemetry.idle_state || 'UNKNOWN').toUpperCase();
  const cpuLoad = optionalNumber(hostTelemetry.cpu_load_percent);
  const gpuLoad = optionalNumber(hostTelemetry.gpu_load_percent);
  const memoryPressure = optionalNumber(hostTelemetry.memory_pressure_percent);
  const vramPressure = optionalNumber(hostTelemetry.vram_pressure_percent);

  if (idleState === 'BUSY') {
    scale = Math.min(scale, 0.25);
    reasons.push('LOCAL_HOST_BUSY_EXTERNAL_WORK_SHED');
  } else if (idleState === 'UNKNOWN') {
    scale = Math.min(scale, 0.60);
    reasons.push('HOST_IDLE_STATE_UNKNOWN_CONSERVATIVE_LIMIT');
  }
  if (cpuLoad != null && cpuLoad >= 85) {
    scale = Math.min(scale, 0.30);
    reasons.push('HOST_CPU_PRESSURE_HIGH');
  }
  if (gpuLoad != null && gpuLoad >= 90) {
    scale = Math.min(scale, 0.30);
    reasons.push('HOST_GPU_PRESSURE_HIGH');
  }
  if (memoryPressure != null && memoryPressure >= 85) {
    scale = Math.min(scale, 0.25);
    reasons.push('HOST_MEMORY_PRESSURE_HIGH');
  }
  if (vramPressure != null && vramPressure >= 90) {
    scale = Math.min(scale, 0.25);
    reasons.push('HOST_VRAM_PRESSURE_HIGH');
  }
  if (!reasons.length) reasons.push('HOST_RESERVES_ACCEPTABLE');

  const cpu = Math.min(requestedCpu, Math.floor(requestedCpu * scale));
  const gpu = Math.min(requestedGpu, Math.floor(requestedGpu * scale));
  return Object.freeze({
    schema: 'janus.helios.host-first-qos.v1',
    allow_execution: scale > 0 && (cpu > 0 || gpu > 0),
    host_priority: 'ABSOLUTE',
    external_compute_yields_first: true,
    cpu_percent: cpu,
    gpu_percent: gpu,
    scale: Number(scale.toFixed(3)),
    reasons,
    human_observation: 'FORBIDDEN',
    invariant: 'LOCAL_HOST_AND_USER_RESERVE_GT_EXTERNAL_PROVIDER_THROUGHPUT'
  });
}

function digestState(value) {
  if (value == null || value === '') return 'MISSING';
  return DIGEST_RE.test(String(value)) ? 'VALID_SHA256_SHAPE' : 'INVALID_DIGEST_SHAPE';
}

export function createReceiptProvenanceEnvelope(input = {}) {
  const digestFields = [
    'provider_manifest_digest', 'adapter_digest', 'executor_digest',
    'verifier_digest', 'guardian_policy_digest'
  ];
  const digests = Object.fromEntries(digestFields.map(field => [field, input[field] || null]));
  const digest_status = Object.fromEntries(digestFields.map(field => [field, digestState(input[field])]));
  const missing = digestFields.filter(field => digest_status[field] !== 'VALID_SHA256_SHAPE');
  for (const field of ['lease_id', 'job_id', 'provider_id', 'verifier_id']) if (!input[field]) missing.push(field);
  const providerVerified = input.provider_execution_verified === true;
  const settlementVerified = input.settlement_authoritative === true;
  const authoritative = missing.length === 0 && providerVerified && settlementVerified;
  return Object.freeze({
    schema: RECEIPT_PROVENANCE_SCHEMA,
    version: HELIOS_TRUST_FABRIC_VERSION,
    receipt_id: input.receipt_id || null,
    provider_id: input.provider_id || null,
    lease_id: input.lease_id || null,
    job_id: input.job_id || null,
    verifier_id: input.verifier_id || null,
    authority_epoch: optionalNumber(input.authority_epoch),
    digests,
    digest_status,
    provider_execution_verified: providerVerified,
    settlement_authoritative: settlementVerified,
    authority: authoritative ? 'AUTHORITATIVE' : 'NON_AUTHORITATIVE',
    claim_reasons: authoritative ? ['PROVENANCE_COMPLETE_AND_EXTERNAL_AUTHORITY_CONFIRMED'] : [...new Set([
      ...missing.map(x => `MISSING_OR_INVALID:${x}`),
      ...(providerVerified ? [] : ['PROVIDER_EXECUTION_NOT_EXTERNALLY_VERIFIED']),
      ...(settlementVerified ? [] : ['SETTLEMENT_AUTHORITY_NOT_ESTABLISHED'])
    ])],
    law: 'WORK_RESULT_EXISTS_NE_AUTHORITY_PROVEN'
  });
}

export class TrueWorkAccounting {
  constructor() {
    this.counters = {
      assigned_slices: 0,
      admitted_slices: 0,
      executed_slices: 0,
      retry_attempts: 0,
      stale_or_rejected_results: 0,
      verified_results: 0,
      failed_results: 0,
      device_ms: 0,
      measured_watt_hours: 0,
      measured_watt_hours_samples: 0
    };
  }

  record(kind, amount = 1) {
    if (!(kind in this.counters)) throw new Error(`UNKNOWN_WORK_COUNTER:${kind}`);
    const n = Number(amount);
    if (!Number.isFinite(n) || n < 0) throw new Error('WORK_COUNTER_AMOUNT_MUST_BE_NONNEGATIVE');
    this.counters[kind] += n;
    return this.snapshot();
  }

  recordMeasuredWattHours(value) {
    const n = Number(value);
    if (!Number.isFinite(n) || n < 0) throw new Error('INVALID_MEASURED_WATT_HOURS');
    this.counters.measured_watt_hours += n;
    this.counters.measured_watt_hours_samples += 1;
    return this.snapshot();
  }

  snapshot() {
    return Object.freeze({
      schema: TRUE_WORK_ACCOUNTING_SCHEMA,
      ...this.counters,
      measured_watt_hours: Number(this.counters.measured_watt_hours.toFixed(6)),
      laws: [
        'ASSIGNED_WORK_NE_COMPLETED_WORK',
        'COMPLETED_WORK_NE_VERIFIED_WORK',
        'NOMINAL_RUNTIME_NE_MEASURED_DEVICE_TIME',
        'NOMINAL_WATTS_NE_MEASURED_WATT_HOURS'
      ]
    });
  }
}

export class DeviceHealthPassportBuilder {
  constructor({ pseudonymous_device_id, guardian_policy_digest = null } = {}) {
    this.deviceId = safeId(pseudonymous_device_id, 'PSEUDONYMOUS_DEVICE_ID');
    if (guardian_policy_digest != null && digestState(guardian_policy_digest) !== 'VALID_SHA256_SHAPE') {
      throw new Error('INVALID_GUARDIAN_POLICY_DIGEST');
    }
    this.guardianPolicyDigest = guardian_policy_digest;
    this.windows = [];
    this.receiptRefs = [];
  }

  addObservation(observation = {}) {
    assertHumanBlindTelemetry(observation, 'deviceHealthObservation');
    const windowId = safeId(observation.sealed_observation_window_id, 'SEALED_OBSERVATION_WINDOW_ID');
    if (this.windows.some(x => x.sealed_observation_window_id === windowId)) throw new Error('DUPLICATE_OBSERVATION_WINDOW');
    const record = Object.freeze({
      sealed_observation_window_id: windowId,
      sensor_source: observation.sensor_source ? String(observation.sensor_source) : null,
      sensor_freshness: observation.sensor_freshness ? String(observation.sensor_freshness).toUpperCase() : 'UNKNOWN',
      guardian_state: observation.guardian_state ? String(observation.guardian_state).toUpperCase() : 'UNKNOWN',
      observed_max_temp_c: optionalNumber(observation.observed_max_temp_c),
      compute_hours: optionalNumber(observation.compute_hours),
      verified_work_hours: optionalNumber(observation.verified_work_hours),
      measured_watt_hours: optionalNumber(observation.measured_watt_hours),
      throttle_events: Math.max(0, Math.floor(optionalNumber(observation.throttle_events) || 0)),
      cooldown_events: Math.max(0, Math.floor(optionalNumber(observation.cooldown_events) || 0)),
      thermal_or_power_blocks: Math.max(0, Math.floor(optionalNumber(observation.thermal_or_power_blocks) || 0)),
      user_revokes: Math.max(0, Math.floor(optionalNumber(observation.user_revokes) || 0)),
      evidence_state: observation.evidence_state ? String(observation.evidence_state).toUpperCase() : 'OBSERVED'
    });
    this.windows.push(record);
    return clone(record);
  }

  addReceiptReference({ receipt_id, receipt_digest = null, authority = 'NON_AUTHORITATIVE' } = {}) {
    const id = safeId(receipt_id, 'RECEIPT_ID');
    if (receipt_digest != null && digestState(receipt_digest) !== 'VALID_SHA256_SHAPE') throw new Error('INVALID_RECEIPT_DIGEST');
    this.receiptRefs.push(Object.freeze({ receipt_id: id, receipt_digest, authority: String(authority).toUpperCase() }));
    return clone(this.receiptRefs.at(-1));
  }

  seal() {
    const knownTemps = this.windows.map(x => x.observed_max_temp_c).filter(x => x != null);
    const knownWh = this.windows.map(x => x.measured_watt_hours).filter(x => x != null);
    const knownCompute = this.windows.map(x => x.compute_hours).filter(x => x != null);
    const knownVerified = this.windows.map(x => x.verified_work_hours).filter(x => x != null);
    const sum = values => Number(values.reduce((a, b) => a + b, 0).toFixed(6));
    return Object.freeze({
      schema: DEVICE_HEALTH_PASSPORT_SCHEMA,
      version: HELIOS_TRUST_FABRIC_VERSION,
      pseudonymous_device_id: this.deviceId,
      guardian_policy_digest: this.guardianPolicyDigest,
      observation_windows: this.windows.map(clone),
      receipt_chain_refs: this.receiptRefs.map(clone),
      summary: {
        windows: this.windows.length,
        max_observed_temperature_c: knownTemps.length ? Math.max(...knownTemps) : null,
        measured_watt_hours: knownWh.length ? sum(knownWh) : null,
        compute_hours: knownCompute.length ? sum(knownCompute) : null,
        verified_work_hours: knownVerified.length ? sum(knownVerified) : null,
        throttle_events: sum(this.windows.map(x => x.throttle_events)),
        cooldown_events: sum(this.windows.map(x => x.cooldown_events)),
        thermal_or_power_blocks: sum(this.windows.map(x => x.thermal_or_power_blocks)),
        user_revokes: sum(this.windows.map(x => x.user_revokes)),
        unknown_temperature_windows: this.windows.filter(x => x.observed_max_temp_c == null).length,
        authoritative_receipts: this.receiptRefs.filter(x => x.authority === 'AUTHORITATIVE').length
      },
      privacy_boundary: 'HARDWARE_AWARE_HUMAN_BLIND',
      unknown_remains_unknown: true,
      content_telemetry_present: false,
      claim_boundary: 'PASSPORT_INTEGRITY_DOES_NOT_PROVE_SENSOR_TRUTH_WITHOUT_SENSOR_PROVENANCE'
    });
  }
}

export function assertVerifierAssuranceMonotonicity(previous = {}, next = {}, migrationProof = null) {
  const inherited = new Set((previous.mandatory_rejections || []).map(String));
  const successor = new Set((next.mandatory_rejections || []).map(String));
  const removed = [...inherited].filter(code => !successor.has(code)).sort();
  if (removed.length) {
    const allowed = migrationProof?.explicit_semantics_change === true && migrationProof?.replayable === true && String(migrationProof?.new_verifier_identity || '').trim();
    if (!allowed) throw new Error(`VERIFIER_ASSURANCE_REGRESSION:${removed.join(',')}`);
    return Object.freeze({ status: 'INTENTIONAL_SEMANTICS_CHANGE', removed, replayable_migration_proof: true });
  }
  return Object.freeze({ status: 'ASSURANCE_MONOTONIC', removed: [], replayable_migration_proof: false });
}

export function qualifyAcceleratorShadow(report = {}) {
  const comparisons = Math.max(0, Math.floor(Number(report.comparisons || 0)));
  const minimum = Math.max(1, Math.floor(Number(report.minimum_comparisons || 10)));
  const mismatches = Math.max(0, Math.floor(Number(report.mismatches || 0)));
  const controls = Array.isArray(report.negative_controls) ? report.negative_controls : [];
  const controlsPass = controls.length > 0 && controls.every(x => x === true);
  const qualified = comparisons >= minimum && mismatches === 0 && controlsPass;
  return Object.freeze({
    schema: 'janus.helios.executor-qualification.v1',
    status: qualified ? 'QUALIFIED' : 'SHADOW',
    comparisons,
    minimum_comparisons: minimum,
    mismatches,
    negative_controls_pass: controlsPass,
    fallback_required: !qualified,
    law: 'FAST_PATH_MUST_PROVE_REFERENCE_EQUIVALENCE_BEFORE_PROMOTION'
  });
}

export function createComputeLineageGraph(input = {}) {
  const ordered = [
    ['CONSENT', input.consent],
    ['PROVIDER', input.provider],
    ['LEASE', input.lease],
    ['GUARDIAN', input.guardian],
    ['EXECUTOR', input.executor],
    ['WORK_RESULT', input.result],
    ['VERIFIER', input.verifier],
    ['RECEIPT', input.receipt],
    ['DEVICE_HEALTH_PASSPORT', input.passport]
  ];
  const nodes = ordered.map(([type, value], index) => ({
    id: `${index + 1}:${type}`,
    type,
    evidence_state: value?.evidence_state || value?.authority || (value ? 'OBSERVED' : 'UNKNOWN'),
    ref: value?.id || value?.receipt_id || value?.lease_id || value?.provider_id || null
  }));
  return Object.freeze({
    schema: COMPUTE_LINEAGE_SCHEMA,
    version: HELIOS_TRUST_FABRIC_VERSION,
    nodes,
    edges: nodes.slice(1).map((node, index) => ({ from: nodes[index].id, to: node.id, relation: 'NEXT_IN_EXECUTION_LINEAGE', authority_delta: 0 })),
    laws: ['STRUCTURAL_LINK_NE_TRUTH', 'STRUCTURAL_LINK_NE_AUTHORITY', 'UNKNOWN_REMAINS_UNKNOWN']
  });
}

export const HELIOS_TRUST_FABRIC_LAWS = Object.freeze([
  'REGISTERED_PROVIDER_NE_ADMITTED_PROVIDER',
  'CAPABILITY_NE_EFFECT',
  'STALE_AUTHORITY_EPOCH_NE_EXECUTION_PERMISSION',
  'LOCAL_HOST_AND_USER_RESERVE_GT_EXTERNAL_PROVIDER_THROUGHPUT',
  'WORK_RESULT_EXISTS_NE_AUTHORITY_PROVEN',
  'ASSIGNED_WORK_NE_VERIFIED_WORK',
  'INTEGRITY_NE_SENSOR_TRUTH',
  'UNKNOWN_REMAINS_UNKNOWN',
  'VERIFIER_SUCCESSOR_MAY_NOT_SILENTLY_FORGET_MANDATORY_REJECTIONS',
  'GAME_RNG_PERP_COMPUTE'
]);

export { AUTHORITY_STATES };
