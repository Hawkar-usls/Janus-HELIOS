export const HELIOS_EVIDENCE_INDEPENDENCE_VERSION = '1.0.0';
export const EVIDENCE_INDEPENDENCE_SCHEMA = 'janus.helios.evidence-independence.v1';

export const INDEPENDENCE_ROOT_AXES = Object.freeze([
  'physical_device_root',
  'execution_lineage_root',
  'authority_root',
  'site_network_root',
  'observation_epoch_root',
  'job_stream_root'
]);

const FORBIDDEN_HUMAN_KEYS = [
  /screen/i, /keyboard/i, /mouse/i, /microphone/i, /camera/i, /clipboard/i,
  /browser.*history/i, /process.*name/i, /game.*name/i, /window.*title/i
];

function stable(value, fallback = '') {
  return value == null ? fallback : String(value).trim();
}

function deepFreeze(value) {
  if (!value || typeof value !== 'object' || Object.isFrozen(value)) return value;
  Object.freeze(value);
  for (const nested of Object.values(value)) deepFreeze(nested);
  return value;
}

export function assertHumanBlindLineage(value, path = 'evidence_independence') {
  if (!value || typeof value !== 'object') return true;
  if (Array.isArray(value)) {
    value.forEach((entry, index) => assertHumanBlindLineage(entry, `${path}[${index}]`));
    return true;
  }
  for (const [key, nested] of Object.entries(value)) {
    if (FORBIDDEN_HUMAN_KEYS.some(pattern => pattern.test(String(key)))) {
      throw new Error(`HUMAN_OBSERVATION_FORBIDDEN:${path}.${key}`);
    }
    assertHumanBlindLineage(nested, `${path}.${key}`);
  }
  return true;
}

export function normalizeReplicationLineage(input = {}) {
  assertHumanBlindLineage(input);
  const nodeId = stable(input.node_id);
  if (!nodeId) throw new Error('EVIDENCE_INDEPENDENCE_NODE_ID_REQUIRED');

  const roots = Object.fromEntries(
    INDEPENDENCE_ROOT_AXES.map(axis => [axis, stable(input[axis] ?? input.roots?.[axis])])
  );

  return deepFreeze({
    schema: 'janus.helios.replication-lineage.v1',
    version: HELIOS_EVIDENCE_INDEPENDENCE_VERSION,
    node_id: nodeId,
    node_class: stable(input.node_class, 'UNKNOWN').toUpperCase(),
    roots,
    known_root_count: INDEPENDENCE_ROOT_AXES.filter(axis => roots[axis]).length,
    unknown_root_count: INDEPENDENCE_ROOT_AXES.filter(axis => !roots[axis]).length,
    hardware_class_is_independence_root: false,
    human_observation_used: false,
    game_effect: 'NONE',
    rng_effect: 'NONE',
    rtp_effect: 'NONE',
    payout_effect: 'NONE'
  });
}

export function compareReplicationLineage(aInput, bInput) {
  const a = normalizeReplicationLineage(aInput);
  const b = normalizeReplicationLineage(bInput);
  if (a.node_id === b.node_id) throw new Error('CANNOT_COMPARE_LINEAGE_NODE_WITH_ITSELF');

  const shared = [];
  const distinct = [];
  const unknown = [];
  for (const axis of INDEPENDENCE_ROOT_AXES) {
    const av = a.roots[axis];
    const bv = b.roots[axis];
    if (!av || !bv) unknown.push(axis);
    else if (av === bv) shared.push(axis);
    else distinct.push(axis);
  }

  const samePhysicalRoot = Boolean(a.roots.physical_device_root) && a.roots.physical_device_root === b.roots.physical_device_root;
  const strong = !unknown.length && !shared.length;
  const partial = !samePhysicalRoot && !strong && distinct.length >= 4;
  const classification = samePhysicalRoot
    ? 'SAME_PHYSICAL_ROOT'
    : strong
      ? 'STRONGLY_INDEPENDENT'
      : partial
        ? 'PARTIALLY_INDEPENDENT'
        : 'CORRELATED_OR_UNRESOLVED';

  return deepFreeze({
    a: a.node_id,
    b: b.node_id,
    classification,
    strongly_independent: strong,
    same_physical_root: samePhysicalRoot,
    shared_axes: shared,
    distinct_axes: distinct,
    unknown_axes: unknown,
    unknown_is_independent: false,
    probability_claim: 'NONE'
  });
}

function maximumClique(nodeIds, adjacency) {
  if (!nodeIds.length) return { node_ids: [], exact: true };
  const sorted = [...nodeIds].sort();
  if (sorted.length > 24) {
    const selected = [];
    for (const id of sorted) {
      if (selected.every(other => adjacency.get(id)?.has(other))) selected.push(id);
    }
    return { node_ids: selected, exact: false };
  }

  let best = [];
  function visit(r, p, x) {
    if (!p.size && !x.size) {
      const candidate = [...r].sort();
      if (candidate.length > best.length || (candidate.length === best.length && candidate.join('|') < best.join('|'))) best = candidate;
      return;
    }
    if (r.size + p.size <= best.length) return;
    const candidates = [...p].sort();
    for (const v of candidates) {
      const neighbours = adjacency.get(v) || new Set();
      visit(
        new Set([...r, v]),
        new Set([...p].filter(id => neighbours.has(id))),
        new Set([...x].filter(id => neighbours.has(id)))
      );
      p.delete(v);
      x.add(v);
    }
  }
  visit(new Set(), new Set(sorted), new Set());
  return { node_ids: best, exact: true };
}

function axisSummary(lineages, axis) {
  const known = lineages.map(row => row.roots[axis]).filter(Boolean);
  const groups = new Map();
  for (const value of known) groups.set(value, (groups.get(value) || 0) + 1);
  const largest = Math.max(0, ...groups.values());
  return {
    axis,
    known_count: known.length,
    unknown_count: lineages.length - known.length,
    unique_root_count: groups.size,
    largest_shared_root_size: largest,
    largest_shared_root_fraction: known.length ? Number((largest / known.length).toFixed(9)) : null
  };
}

export function createEvidenceIndependencePlan(input = {}) {
  const nodes = Array.isArray(input.nodes) ? input.nodes : [];
  return deepFreeze({
    schema: 'janus.helios.evidence-independence-plan.v1',
    version: HELIOS_EVIDENCE_INDEPENDENCE_VERSION,
    campaign_id: stable(input.campaign_id, 'helios-evidence-independence-preview'),
    planned_node_count: nodes.length,
    required_roots: [...INDEPENDENCE_ROOT_AXES],
    law: 'REPLICATION_COUNT_NOT_EQUAL_INDEPENDENT_ROOT_COUNT',
    strong_independence: 'ALL_REQUIRED_ROOTS_KNOWN_AND_DISTINCT_PAIRWISE',
    unknown_policy: 'UNKNOWN_NEVER_COUNTS_AS_INDEPENDENT',
    synthesis_unit: 'MAXIMUM_PAIRWISE_STRONGLY_INDEPENDENT_NODE_SET',
    hardware_class_is_independence_root: false,
    probability_claim: 'NONE',
    public_demo_connected_nodes: 0,
    presentation_only: true,
    game_effect: 'NONE'
  });
}

export function analyzeEvidenceIndependence(rawLineages = []) {
  const lineages = rawLineages.map(normalizeReplicationLineage);
  const ids = new Set();
  for (const row of lineages) {
    if (ids.has(row.node_id)) throw new Error('DUPLICATE_EVIDENCE_INDEPENDENCE_NODE_ID');
    ids.add(row.node_id);
  }

  const adjacency = new Map(lineages.map(row => [row.node_id, new Set()]));
  const pairs = [];
  for (let i = 0; i < lineages.length; i += 1) {
    for (let j = i + 1; j < lineages.length; j += 1) {
      const pair = compareReplicationLineage(lineages[i], lineages[j]);
      pairs.push(pair);
      if (pair.strongly_independent) {
        adjacency.get(pair.a).add(pair.b);
        adjacency.get(pair.b).add(pair.a);
      }
    }
  }

  const clique = maximumClique(lineages.map(row => row.node_id), adjacency);
  const strongSet = new Set(clique.node_ids);
  const physicalKnown = lineages.map(row => row.roots.physical_device_root).filter(Boolean);
  const physicalRootCount = new Set(physicalKnown).size;
  const allRootsKnown = lineages.length > 0 && lineages.every(row => row.unknown_root_count === 0);

  const dependencyClusters = {};
  for (const axis of INDEPENDENCE_ROOT_AXES) {
    const groups = new Map();
    for (const row of lineages) {
      const value = row.roots[axis];
      if (!value) continue;
      if (!groups.has(value)) groups.set(value, []);
      groups.get(value).push(row.node_id);
    }
    dependencyClusters[axis] = [...groups.entries()]
      .filter(([, members]) => members.length > 1)
      .map(([root, members]) => ({ root, node_ids: members.sort(), size: members.length }));
  }

  return deepFreeze({
    schema: EVIDENCE_INDEPENDENCE_SCHEMA,
    version: HELIOS_EVIDENCE_INDEPENDENCE_VERSION,
    raw_replication_count: lineages.length,
    known_physical_root_count: physicalRootCount,
    strong_independent_replication_count: clique.node_ids.length,
    strong_independent_set: {
      node_ids: clique.node_ids,
      exact_maximum_clique: clique.exact,
      rule: 'PAIRWISE_STRONGLY_INDEPENDENT'
    },
    correlated_or_nonselected_node_ids: lineages.map(row => row.node_id).filter(id => !strongSet.has(id)).sort(),
    all_required_roots_known: allRootsKnown,
    lineages,
    pairs,
    axis_diversity: INDEPENDENCE_ROOT_AXES.map(axis => axisSummary(lineages, axis)),
    dependency_clusters: dependencyClusters,
    verdict: clique.node_ids.length >= 2
      ? 'STRONG_INDEPENDENCE_SET_FOUND'
      : 'INSUFFICIENT_STRONG_INDEPENDENCE',
    laws: {
      replication_count_not_equal_independent_root_count: true,
      unknown_never_counts_as_independent: true,
      hardware_class_not_used_as_independence_root: true,
      raw_hashrate_not_used_as_independence_weight: true,
      confidence_probability_inference_allowed: false,
      causal_proof: false
    },
    game_effect: 'NONE',
    rng_effect: 'NONE',
    rtp_effect: 'NONE',
    payout_effect: 'NONE'
  });
}
