import { assertNoEdgeSecrets, compareI0Evidence } from './helios-edge-hash-lab.js';

export const HELIOS_EDGE_CONSTELLATION_VERSION = '1.0.0';
export const EDGE_CONSTELLATION_SCHEMA = 'janus.helios.edge-constellation-plan.v1';
export const EDGE_CONSTELLATION_EVIDENCE_SCHEMA = 'janus.helios.edge-constellation-evidence.v1';

export const EDGE_NODE_CLASSES = Object.freeze({
  NERDMINER_ESP32: Object.freeze({
    label: 'NerdMinerV2 / compatible ESP32',
    compute_family: 'MICROCONTROLLER',
    execution_plane: 'EXTERNAL_EDGE_BRIDGE',
    default_transport: 'STRATUM_V1',
    default_adapter_mode: 'STOCK_OR_EXPLICIT_I0_BRIDGE',
    physical_target_known: true
  }),
  DESKTOP_CPU: Object.freeze({
    label: 'HELIOS Desktop CPU',
    compute_family: 'DESKTOP_CPU',
    execution_plane: 'HELIOS_DESKTOP_FABRIC',
    default_transport: 'HELIOS_DESKTOP_FABRIC',
    default_adapter_mode: 'HELIOS_NATIVE_AGENT',
    physical_target_known: false
  }),
  DESKTOP_GPU: Object.freeze({
    label: 'HELIOS Desktop GPU',
    compute_family: 'DESKTOP_GPU',
    execution_plane: 'HELIOS_DESKTOP_FABRIC',
    default_transport: 'HELIOS_DESKTOP_FABRIC',
    default_adapter_mode: 'HELIOS_NATIVE_AGENT',
    physical_target_known: false
  }),
  ASIC_GATEWAY: Object.freeze({
    label: 'External ASIC gateway',
    compute_family: 'ASIC',
    execution_plane: 'APPROVED_EXTERNAL_GATEWAY',
    default_transport: 'STRATUM_V1_GATEWAY',
    default_adapter_mode: 'EXPLICIT_COMPATIBILITY_GATE',
    physical_target_known: false
  })
});

const NODE_CLASS_NAMES = Object.freeze(Object.keys(EDGE_NODE_CLASSES));

function stable(value, fallback = '') {
  return value == null ? fallback : String(value);
}

function finite(value, fallback = 0) {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function positive(value, fallback = 1) {
  return Math.max(Number.EPSILON, finite(value, fallback));
}

function deepFreeze(value) {
  if (!value || typeof value !== 'object' || Object.isFrozen(value)) return value;
  Object.freeze(value);
  for (const nested of Object.values(value)) deepFreeze(nested);
  return value;
}

function median(values) {
  const rows = values.filter(Number.isFinite).sort((a, b) => a - b);
  if (!rows.length) return null;
  const mid = Math.floor(rows.length / 2);
  return rows.length % 2 ? rows[mid] : Number(((rows[mid - 1] + rows[mid]) / 2).toFixed(9));
}

function direction(delta, epsilon = 1e-12) {
  if (!Number.isFinite(delta) || Math.abs(delta) <= epsilon) return 'FLAT';
  return delta > 0 ? 'POSITIVE' : 'NEGATIVE';
}

export function normalizeConstellationNode(input = {}) {
  assertNoEdgeSecrets(input, 'edge_constellation.node');
  const nodeClass = stable(input.node_class, 'NERDMINER_ESP32').toUpperCase();
  if (!NODE_CLASS_NAMES.includes(nodeClass)) throw new Error('INVALID_EDGE_CONSTELLATION_NODE_CLASS');
  const profile = EDGE_NODE_CLASSES[nodeClass];
  const nodeId = stable(input.node_id, '').trim();
  if (!nodeId) throw new Error('EDGE_CONSTELLATION_NODE_ID_REQUIRED');

  return deepFreeze({
    schema: 'janus.helios.edge-capability-passport.v1',
    version: HELIOS_EDGE_CONSTELLATION_VERSION,
    node_id: nodeId,
    node_class: nodeClass,
    label: stable(input.label, profile.label),
    compute_family: profile.compute_family,
    execution_plane: profile.execution_plane,
    transport: stable(input.transport, profile.default_transport).toUpperCase(),
    adapter_mode: stable(input.adapter_mode, profile.default_adapter_mode).toUpperCase(),
    research_bridge_declared: input.research_bridge_declared === true,
    conformance_verified: input.conformance_verified === true,
    authoritative_identity_verified: input.authoritative_identity_verified === true,
    evidence_role: 'NODE_LOCAL_PAIRED_REPLICATION_UNIT',
    evidence_weight: 'ONE_NODE_ONE_REPLICATION_UNIT',
    advertised_performance_used_as_evidence_weight: false,
    raw_hashrate_used_as_cross_node_weight: false,
    local_pairing_required: 'JANUS_I0_50_PERCENT_VS_RANDOMIZED_MIRROR_50_PERCENT',
    public_demo_connected: false,
    public_demo_executes_hashing: false,
    game_effect: 'NONE',
    rng_effect: 'NONE',
    rtp_effect: 'NONE',
    payout_effect: 'NONE'
  });
}

export function createEdgeConstellationPlan(input = {}) {
  assertNoEdgeSecrets(input, 'edge_constellation.plan');
  const requestedNodes = Array.isArray(input.nodes) && input.nodes.length ? input.nodes : [
    { node_id: 'esp32-edge-01', node_class: 'NERDMINER_ESP32' },
    { node_id: 'desktop-cpu-01', node_class: 'DESKTOP_CPU' },
    { node_id: 'asic-gateway-01', node_class: 'ASIC_GATEWAY' }
  ];
  const ids = new Set();
  const nodes = requestedNodes.map((raw, index) => {
    const passport = normalizeConstellationNode(raw);
    if (ids.has(passport.node_id)) throw new Error('DUPLICATE_EDGE_CONSTELLATION_NODE_ID');
    ids.add(passport.node_id);
    const target = positive(raw.checked_work_target_mh, positive(input.default_checked_work_target_mh, 100));
    return {
      ordinal: index + 1,
      passport,
      local_experiment: {
        pairing: 'WITHIN_NODE_STRICT_50_50',
        arms: [
          { group: 'JANUS_I0', weight: 0.5, checked_work_target_mh: target / 2 },
          { group: 'RANDOMIZED_MIRROR', weight: 0.5, checked_work_target_mh: target / 2 }
        ],
        equal_exposure_required: true,
        same_device_required: true,
        same_pool_required: true,
        same_job_stream_required: true,
        same_wire_required: true,
        same_guardian_policy_required: true
      },
      execution_ready: passport.research_bridge_declared && passport.conformance_verified && passport.authoritative_identity_verified
    };
  });

  const productionGate = input.production_gate_verified === true;
  const executionReady = productionGate && nodes.every(node => node.execution_ready);

  return deepFreeze({
    schema: EDGE_CONSTELLATION_SCHEMA,
    version: HELIOS_EDGE_CONSTELLATION_VERSION,
    campaign_id: stable(input.campaign_id, 'helios-i0-constellation-preview'),
    mode: executionReady ? 'ADMITTED_MULTI_NODE_CAMPAIGN' : 'PRESENTATION_PLAN_ONLY',
    execution_ready: executionReady,
    execution_gate: executionReady
      ? 'NODE_LOCAL_LEASES_AND_PROVIDER_AUTHORITY_STILL_REQUIRED'
      : 'EACH_NODE_REQUIRES_IDENTITY_BRIDGE_CONFORMANCE_AND_PRODUCTION_ADMISSION',
    nodes,
    replication_law: {
      node_power_not_evidence_weight: true,
      one_node_one_replication_unit: true,
      raw_hashrate_cross_node_weighting: false,
      raw_checked_work_cross_node_weighting: false,
      local_effects_required_before_cross_node_synthesis: true,
      minimum_independent_complete_nodes: 2,
      aggregation: 'MEDIAN_NODE_LOCAL_DELTA_PLUS_DIRECTIONAL_CONSISTENCY',
      purpose: 'PREVENT_HIGH_THROUGHPUT_HARDWARE_FROM_DOMINATING_REPLICATION_BY_VOLUME_ALONE'
    },
    cross_node_controls: {
      same_job_stream_across_different_nodes_required: false,
      preserve_node_local_same_job_stream: true,
      preserve_node_local_same_wire: true,
      preserve_node_local_same_pool: true,
      preserve_node_local_same_guardian_policy: true,
      hardware_class_recorded: true,
      firmware_or_executor_digest_required_for_authoritative_evidence: true
    },
    claims: {
      causal_proof_from_directional_consistency: false,
      sha256_break: false,
      nonce_prediction: false,
      guaranteed_profit: false,
      stronger_hardware_equals_stronger_evidence: false
    },
    public_demo: {
      connects_to_nodes: false,
      connects_to_pool: false,
      requests_serial_device: false,
      fake_hashrate: false,
      fake_temperature: false,
      fake_watts: false
    },
    game_effect: 'NONE'
  });
}

function normalizeNodeEvidence(input = {}) {
  assertNoEdgeSecrets(input, 'edge_constellation.evidence');
  const passport = normalizeConstellationNode({
    node_id: input.node_id,
    node_class: input.node_class,
    label: input.label,
    transport: input.transport,
    adapter_mode: input.adapter_mode
  });
  const comparison = compareI0Evidence(Array.isArray(input.samples) ? input.samples : []);
  const acceptedDelta = comparison.deltas.accepted_per_mh;
  const z32Delta = comparison.deltas.z32_per_mh;
  const complete = comparison.janus_i0.checked_mh > 0 && comparison.randomized_mirror.checked_mh > 0;
  return deepFreeze({
    node_id: passport.node_id,
    node_class: passport.node_class,
    evidence_weight: 'ONE_NODE_ONE_REPLICATION_UNIT',
    complete,
    accepted_per_mh_delta: acceptedDelta,
    z32_per_mh_delta: z32Delta,
    accepted_direction: complete ? direction(acceptedDelta) : 'INSUFFICIENT',
    comparison
  });
}

export function compareEdgeConstellationEvidence(rawNodes = []) {
  const nodes = rawNodes.map(normalizeNodeEvidence);
  const complete = nodes.filter(node => node.complete);
  const directionCounts = { POSITIVE: 0, NEGATIVE: 0, FLAT: 0 };
  for (const node of complete) directionCounts[node.accepted_direction] += 1;
  const completeCount = complete.length;
  const dominant = Object.entries(directionCounts).sort((a, b) => b[1] - a[1])[0] || ['FLAT', 0];
  const consistency = completeCount ? Number((dominant[1] / completeCount).toFixed(9)) : 0;
  const medianAcceptedDelta = median(complete.map(node => node.accepted_per_mh_delta));
  const medianZ32Delta = median(complete.map(node => node.z32_per_mh_delta));
  const enoughNodes = completeCount >= 2;
  const directionallyConsistent = enoughNodes && dominant[0] !== 'FLAT' && consistency >= (2 / 3);

  return deepFreeze({
    schema: EDGE_CONSTELLATION_EVIDENCE_SCHEMA,
    version: HELIOS_EDGE_CONSTELLATION_VERSION,
    node_count: nodes.length,
    complete_node_count: completeCount,
    incomplete_node_count: nodes.length - completeCount,
    nodes,
    aggregation: {
      unit: 'NODE_LOCAL_EFFECT_VECTOR',
      node_power_not_evidence_weight: true,
      one_node_one_replication_unit: true,
      raw_hashrate_weighting_used: false,
      raw_checked_mh_weighting_used: false,
      median_accepted_per_mh_delta: medianAcceptedDelta,
      median_z32_per_mh_delta: medianZ32Delta,
      direction_counts: directionCounts,
      dominant_direction: dominant[0],
      directional_consistency: consistency
    },
    verdict: !enoughNodes
      ? 'INSUFFICIENT_INDEPENDENT_NODE_REPLICATION'
      : directionallyConsistent
        ? 'DIRECTIONALLY_CONSISTENT_REPLICATION_SIGNAL_NOT_CAUSAL_PROOF'
        : 'HETEROGENEOUS_OR_INCONCLUSIVE',
    causal_proof: false,
    profit_inference_allowed: false,
    isolated_rare_tail_is_proof: false,
    game_effect: 'NONE',
    rng_effect: 'NONE',
    rtp_effect: 'NONE',
    payout_effect: 'NONE'
  });
}
