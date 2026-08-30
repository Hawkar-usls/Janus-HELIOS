export const HELIOS_EDGE_HASH_LAB_VERSION = '1.0.0';
export const EDGE_HASH_LAB_SCHEMA = 'janus.helios.edge-hash-lab.v1';
export const I0_BENCHMARK_SCHEMA = 'janus.helios.i0-benchmark-plan.v1';

export const NERDMINER_V2_COMPATIBILITY = Object.freeze({
  upstream_repository: 'BitMaker-hub/NerdMiner_v2',
  upstream_url: 'https://github.com/BitMaker-hub/NerdMiner_v2',
  upstream_license: 'MIT',
  upstream_copyright: 'Copyright (c) 2023 Bitmaker',
  device_family: 'ESP32',
  protocol_family: 'STRATUM_V1',
  source_code_embedded_in_helios: false,
  relationship: 'EXTERNAL_COMPATIBILITY_TARGET'
});

const FIRMWARE_MODES = Object.freeze(['STOCK_EXTERNAL', 'JANUS_I0_BRIDGE', 'CUSTOM_COMPATIBLE']);
const GROUPS = Object.freeze(['JANUS_I0', 'RANDOMIZED_MIRROR']);
const FORBIDDEN_SECRET_KEYS = [
  /password/i, /passwd/i, /wifi.*pw/i, /private.*key/i, /secret/i, /seed/i,
  /mnemonic/i, /api.*key/i, /bearer/i, /credential/i, /auth.*token/i, /access.*token/i
];

function stable(value, fallback = '') {
  return value == null ? fallback : String(value);
}

function finite(value, fallback = 0) {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function nonNegative(value) {
  return Math.max(0, finite(value, 0));
}

function deepFreeze(value) {
  if (!value || typeof value !== 'object' || Object.isFrozen(value)) return value;
  Object.freeze(value);
  for (const nested of Object.values(value)) deepFreeze(nested);
  return value;
}

export function assertNoEdgeSecrets(value, path = 'edge_hash') {
  if (!value || typeof value !== 'object') return true;
  if (Array.isArray(value)) {
    value.forEach((entry, index) => assertNoEdgeSecrets(entry, `${path}[${index}]`));
    return true;
  }
  for (const [key, nested] of Object.entries(value)) {
    if (FORBIDDEN_SECRET_KEYS.some(pattern => pattern.test(String(key)))) {
      throw new Error(`EDGE_HASH_SECRET_FORBIDDEN:${path}.${key}`);
    }
    assertNoEdgeSecrets(nested, `${path}.${key}`);
  }
  return true;
}

export function normalizeEdgeNodeManifest(input = {}) {
  assertNoEdgeSecrets(input);
  const firmwareMode = stable(input.firmware_mode, 'STOCK_EXTERNAL').toUpperCase();
  if (!FIRMWARE_MODES.includes(firmwareMode)) throw new Error('INVALID_EDGE_FIRMWARE_MODE');

  const i0Requested = input.i0_scheduler_enabled === true;
  if (firmwareMode === 'STOCK_EXTERNAL' && i0Requested) {
    throw new Error('I0_SCHEDULER_REQUIRES_BRIDGE_OR_COMPATIBLE_FIRMWARE');
  }

  const manifest = {
    schema: EDGE_HASH_LAB_SCHEMA,
    version: HELIOS_EDGE_HASH_LAB_VERSION,
    node_id: stable(input.node_id, 'edge-node-preview'),
    node_kind: stable(input.node_kind, 'NERDMINER_V2_COMPATIBLE_ESP32').toUpperCase(),
    compatibility: { ...NERDMINER_V2_COMPATIBILITY },
    firmware_mode: firmwareMode,
    transport: stable(input.transport, 'STRATUM_V1').toUpperCase(),
    stock_firmware_modified_by_helios: false,
    upstream_source_vendored: false,
    local_configuration_only: true,
    public_demo_collects_wallet_address: false,
    public_demo_collects_wifi_credentials: false,
    public_demo_connects_to_pool: false,
    i0_scheduler_enabled: i0Requested,
    i0_scheduler_authority: i0Requested ? 'BACKGROUND_IP_BRIDGE_ONLY' : 'NONE',
    wire_policy: firmwareMode === 'STOCK_EXTERNAL'
      ? 'UPSTREAM_STRATUM_BEHAVIOR_UNCHANGED'
      : 'BRIDGE_WIRE_MUST_PASS_EXPLICIT_POOL_CONFORMANCE_GATE',
    execution_authority: 'LOCAL_NODE_OR_APPROVED_BRIDGE_ONLY',
    provider_authority: 'DEFAULT_DENY',
    game_effect: 'NONE',
    rng_effect: 'NONE',
    rtp_effect: 'NONE',
    payout_effect: 'NONE'
  };
  return deepFreeze(manifest);
}

export function createI0BenchmarkPlan(input = {}) {
  const manifest = normalizeEdgeNodeManifest(input.manifest || {});
  const targetMh = Math.max(1, finite(input.checked_work_target_mh, 100));
  const i0Executable = manifest.firmware_mode === 'JANUS_I0_BRIDGE' && manifest.i0_scheduler_enabled;

  return deepFreeze({
    schema: I0_BENCHMARK_SCHEMA,
    version: HELIOS_EDGE_HASH_LAB_VERSION,
    experiment_id: stable(input.experiment_id, 'i0-edge-50-50-preview'),
    mode: i0Executable ? 'BRIDGE_EXECUTION_PLAN' : 'PRESENTATION_PLAN_ONLY',
    execution_ready: i0Executable,
    execution_gate: i0Executable ? 'BRIDGE_CONFORMANCE_STILL_REQUIRED' : 'JANUS_I0_BRIDGE_OR_COMPATIBLE_FIRMWARE_REQUIRED',
    thesis: 'COMPARE_STRUCTURED_TRAVERSAL_WITH_RANDOMIZED_MIRROR_PER_CHECKED_WORK',
    arms: [
      { group: 'JANUS_I0', weight: 0.5, checked_work_target_mh: targetMh / 2 },
      { group: 'RANDOMIZED_MIRROR', weight: 0.5, checked_work_target_mh: targetMh / 2 }
    ],
    controls: {
      equal_exposure: true,
      same_device_required: true,
      same_pool_required: true,
      same_job_stream_required: true,
      same_wire_required: true,
      same_guardian_policy_required: true,
      stock_wire_mutation_allowed: false
    },
    evidence_metrics: [
      'checked_MH', 'accepted', 'z28_per_MH', 'z30_per_MH', 'z32_per_MH', 'z33_per_MH', 'z34_per_MH',
      'max_z', 'reject_rate', 'stale_drops', 'reconnect_count', 'cooldown', 'desktop_load_state'
    ],
    claims: {
      sha256_break: false,
      nonce_prediction: false,
      guaranteed_block_advantage: false,
      mining_profit_claim: false,
      isolated_rare_tail_is_proof: false
    },
    source_lineage: {
      methodology: 'Hawkar-usls/janus-io',
      relationship: 'FIRST_PARTY_BACKGROUND_IP_INTERFACE',
      full_i0_scheduler_embedded_in_helios: false,
      nerdminer_v2: { ...NERDMINER_V2_COMPATIBILITY }
    },
    game_effect: 'NONE'
  });
}

export function normalizeI0Telemetry(sample = {}) {
  assertNoEdgeSecrets(sample);
  const group = stable(sample.group, 'JANUS_I0').toUpperCase();
  if (!GROUPS.includes(group)) throw new Error('INVALID_I0_TELEMETRY_GROUP');
  return deepFreeze({
    group,
    checked_mh: nonNegative(sample.checked_mh ?? sample.checked_MH),
    accepted: Math.floor(nonNegative(sample.accepted)),
    z28: Math.floor(nonNegative(sample.z28)),
    z30: Math.floor(nonNegative(sample.z30)),
    z32: Math.floor(nonNegative(sample.z32)),
    z33: Math.floor(nonNegative(sample.z33)),
    z34: Math.floor(nonNegative(sample.z34)),
    max_z: Math.floor(nonNegative(sample.max_z)),
    rejects: Math.floor(nonNegative(sample.rejects)),
    stale_drops: Math.floor(nonNegative(sample.stale_drops)),
    reconnect_count: Math.floor(nonNegative(sample.reconnect_count)),
    cooldown_ms: nonNegative(sample.cooldown_ms),
    observed_at: stable(sample.observed_at, ''),
    job_id_hash: stable(sample.job_id_hash, ''),
    guardian_state: stable(sample.guardian_state, 'UNKNOWN').toUpperCase(),
    source: stable(sample.source, 'EDGE_BRIDGE')
  });
}

function rate(count, checkedMh) {
  return checkedMh > 0 ? Number((count / checkedMh).toFixed(9)) : null;
}

function summarizeGroup(samples, group) {
  const rows = samples.filter(row => row.group === group);
  const total = rows.reduce((acc, row) => {
    acc.checked_mh += row.checked_mh;
    acc.accepted += row.accepted;
    acc.z28 += row.z28;
    acc.z30 += row.z30;
    acc.z32 += row.z32;
    acc.z33 += row.z33;
    acc.z34 += row.z34;
    acc.rejects += row.rejects;
    acc.stale_drops += row.stale_drops;
    acc.reconnect_count += row.reconnect_count;
    acc.cooldown_ms += row.cooldown_ms;
    acc.max_z = Math.max(acc.max_z, row.max_z);
    return acc;
  }, { checked_mh: 0, accepted: 0, z28: 0, z30: 0, z32: 0, z33: 0, z34: 0, rejects: 0, stale_drops: 0, reconnect_count: 0, cooldown_ms: 0, max_z: 0 });

  const attempts = total.accepted + total.rejects;
  return deepFreeze({
    group,
    sample_count: rows.length,
    checked_mh: Number(total.checked_mh.toFixed(6)),
    accepted: total.accepted,
    accepted_per_mh: rate(total.accepted, total.checked_mh),
    z28_per_mh: rate(total.z28, total.checked_mh),
    z30_per_mh: rate(total.z30, total.checked_mh),
    z32_per_mh: rate(total.z32, total.checked_mh),
    z33_per_mh: rate(total.z33, total.checked_mh),
    z34_per_mh: rate(total.z34, total.checked_mh),
    max_z: total.max_z,
    reject_rate: attempts > 0 ? Number((total.rejects / attempts).toFixed(9)) : null,
    stale_drops: total.stale_drops,
    reconnect_count: total.reconnect_count,
    cooldown_ms: total.cooldown_ms
  });
}

function delta(a, b) {
  if (a == null || b == null) return null;
  return Number((a - b).toFixed(9));
}

export function compareI0Evidence(rawSamples = []) {
  const samples = rawSamples.map(normalizeI0Telemetry);
  const janus = summarizeGroup(samples, 'JANUS_I0');
  const random = summarizeGroup(samples, 'RANDOMIZED_MIRROR');
  const sufficientExposure = janus.checked_mh > 0 && random.checked_mh > 0;

  return deepFreeze({
    schema: 'janus.helios.i0-evidence-comparison.v1',
    version: HELIOS_EDGE_HASH_LAB_VERSION,
    normalization: 'PER_CHECKED_MH',
    janus_i0: janus,
    randomized_mirror: random,
    deltas: {
      accepted_per_mh: delta(janus.accepted_per_mh, random.accepted_per_mh),
      z28_per_mh: delta(janus.z28_per_mh, random.z28_per_mh),
      z30_per_mh: delta(janus.z30_per_mh, random.z30_per_mh),
      z32_per_mh: delta(janus.z32_per_mh, random.z32_per_mh),
      z33_per_mh: delta(janus.z33_per_mh, random.z33_per_mh),
      z34_per_mh: delta(janus.z34_per_mh, random.z34_per_mh)
    },
    verdict: sufficientExposure ? 'OBSERVED_DIFFERENCE_NOT_CAUSAL_PROOF' : 'INSUFFICIENT_EXPOSURE',
    isolated_rare_tail_is_proof: false,
    profit_inference_allowed: false,
    game_effect: 'NONE'
  });
}

export function buildEdgeHashEvidenceEnvelope(input = {}) {
  const manifest = normalizeEdgeNodeManifest(input.manifest || {});
  const comparison = compareI0Evidence(input.samples || []);
  const provenance = input.provenance && typeof input.provenance === 'object' ? input.provenance : {};
  const required = ['authority_epoch', 'lease_id', 'executor_digest', 'firmware_digest', 'verifier_id', 'pool_receipt_id'];
  const complete = required.every(key => stable(provenance[key]).length > 0);

  return deepFreeze({
    schema: 'janus.helios.edge-hash-evidence-envelope.v1',
    version: HELIOS_EDGE_HASH_LAB_VERSION,
    node: manifest,
    comparison,
    provenance: Object.fromEntries(required.map(key => [key, stable(provenance[key], '')])),
    provenance_complete: complete,
    authoritative: complete && stable(provenance.external_verification_status).toUpperCase() === 'VERIFIED',
    settlement_authority: 'EXTERNAL_POOL_OR_PROVIDER_ONLY',
    device_health_passport_link: stable(provenance.device_health_passport_id, ''),
    raw_wallet_material_stored: false,
    human_observation_used: false,
    game_effect: 'NONE',
    rng_effect: 'NONE',
    rtp_effect: 'NONE',
    payout_effect: 'NONE'
  });
}
