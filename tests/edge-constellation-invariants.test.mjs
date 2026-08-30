import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import {
  HELIOS_EDGE_CONSTELLATION_VERSION,
  normalizeConstellationNode,
  createEdgeConstellationPlan,
  compareEdgeConstellationEvidence
} from '../src/helios-edge-constellation.js';

const [contract, ui] = await Promise.all([
  readFile(new URL('../.janus/HELIOS_EDGE_CONSTELLATION.json', import.meta.url), 'utf8').then(JSON.parse),
  readFile(new URL('../helios-edge-constellation-ui.js', import.meta.url), 'utf8')
]);

assert.equal(HELIOS_EDGE_CONSTELLATION_VERSION, '1.1.0');

const passport = normalizeConstellationNode({ node_id: 'n1', node_class: 'DESKTOP_GPU' });
assert.equal(passport.evidence_weight, 'ONE_NODE_ONE_REPLICATION_UNIT_BEFORE_INDEPENDENCE_GATE');
assert.equal(passport.independent_evidence_requires_lineage_roots, true);
assert.equal(passport.raw_hashrate_used_as_cross_node_weight, false);
assert.equal(passport.game_effect, 'NONE');

const plan = createEdgeConstellationPlan({ campaign_id: 'test' });
assert.equal(plan.version, '1.1.0');
assert.equal(plan.replication_law.node_power_not_evidence_weight, true);
assert.equal(plan.replication_law.replication_count_not_equal_independent_root_count, true);
assert.equal(plan.replication_law.unknown_lineage_not_independent, true);
assert.equal(plan.replication_law.minimum_strongly_independent_complete_nodes, 2);
assert.equal(plan.replication_law.independence_engine, 'MAXIMUM_PAIRWISE_STRONGLY_INDEPENDENT_SET');
assert.equal(plan.nodes[0].lineage_gate.required_before_independent_replication, true);
assert.equal(plan.nodes[0].lineage_gate.roots.length, 6);
assert.equal(plan.claims.raw_replication_count_equals_independent_replications, false);

const roots = prefix => ({
  physical_device_root: `${prefix}-device`,
  execution_lineage_root: `${prefix}-exec`,
  authority_root: `${prefix}-authority`,
  site_network_root: `${prefix}-site`,
  observation_epoch_root: `${prefix}-epoch`,
  job_stream_root: `${prefix}-job`
});

const samples = (i0Accepted, randomAccepted) => [
  { group: 'JANUS_I0', checked_mh: 50, accepted: i0Accepted, z28: 3, z30: 2, z32: 1, max_z: 32 },
  { group: 'RANDOMIZED_MIRROR', checked_mh: 50, accepted: randomAccepted, z28: 2, z30: 1, z32: 0, max_z: 30 }
];

const independent = compareEdgeConstellationEvidence([
  { node_id: 'gpu-a', node_class: 'DESKTOP_GPU', samples: samples(5, 4), lineage: roots('a') },
  { node_id: 'gpu-b', node_class: 'DESKTOP_GPU', samples: samples(6, 5), lineage: roots('b') }
]);
assert.equal(independent.complete_node_count, 2);
assert.equal(independent.strongly_independent_complete_node_count, 2);
assert.equal(independent.independence.strong_independent_replication_count, 2);
assert.equal(independent.aggregation.raw_hashrate_weighting_used, false);
assert.equal(independent.aggregation.unknown_lineage_counted_as_independent, false);
assert.equal(independent.verdict, 'DIRECTIONALLY_CONSISTENT_INDEPENDENT_REPLICATION_SIGNAL_NOT_CAUSAL_PROOF');
assert.equal(independent.causal_proof, false);
assert.equal(independent.probability_claim, 'NONE');

const sameRackClone = compareEdgeConstellationEvidence([
  { node_id: 'asic-a', node_class: 'ASIC_GATEWAY', samples: samples(5, 4), lineage: roots('x') },
  { node_id: 'asic-b', node_class: 'ASIC_GATEWAY', samples: samples(6, 5), lineage: { ...roots('y'), site_network_root: 'x-site' } },
  { node_id: 'asic-c', node_class: 'ASIC_GATEWAY', samples: samples(7, 6), lineage: { ...roots('z'), site_network_root: 'x-site' } }
]);
assert.equal(sameRackClone.complete_node_count, 3);
assert.equal(sameRackClone.strongly_independent_complete_node_count, 2);
assert.equal(sameRackClone.correlated_or_nonselected_complete_node_count, 1);
assert.notEqual(sameRackClone.strongly_independent_complete_node_count, sameRackClone.complete_node_count);

const unresolved = compareEdgeConstellationEvidence([
  { node_id: 'esp', node_class: 'NERDMINER_ESP32', samples: samples(5, 4), lineage: { physical_device_root: 'esp-device' } },
  { node_id: 'asic', node_class: 'ASIC_GATEWAY', samples: samples(6, 5), lineage: { physical_device_root: 'asic-device' } }
]);
assert.equal(unresolved.complete_node_count, 2);
assert.equal(unresolved.strongly_independent_complete_node_count, 1);
assert.equal(unresolved.verdict, 'INSUFFICIENT_STRONG_INDEPENDENCE');

const incomplete = compareEdgeConstellationEvidence([
  { node_id: 'a', node_class: 'DESKTOP_CPU', samples: [], lineage: roots('a') },
  { node_id: 'b', node_class: 'DESKTOP_CPU', samples: samples(5, 4), lineage: roots('b') }
]);
assert.equal(incomplete.verdict, 'INSUFFICIENT_COMPLETE_NODE_REPLICATION');

assert.equal(contract.version, '1.1.0');
assert.ok(contract.core_laws.includes('NODE_POWER_NOT_EQUAL_EVIDENCE_WEIGHT'));
assert.ok(contract.core_laws.includes('REPLICATION_COUNT_NOT_EQUAL_INDEPENDENT_ROOT_COUNT'));
assert.equal(contract.evidence_independence_gate.required, true);
assert.equal(contract.evidence_independence_gate.unknown_counts_as_independent, false);
assert.equal(contract.evidence_independence_gate.minimum_strongly_independent_complete_nodes, 2);
assert.equal(contract.cross_node_replication_law.correlated_reports_are_deleted, false);
assert.equal(contract.cross_node_replication_law.correlated_reports_get_independent_votes, false);
assert.equal(contract.public_demo.fake_independence_score, false);

assert.match(ui, /VERSION='1\.1\.0'/);
assert.match(ui, /INDEPENDENCE GATE/);
assert.match(ui, /replication_count_not_equal_independent_root_count:true/);
assert.match(ui, /src\/helios-edge-constellation\.js\?v=1\.1\.0/);
assert.doesNotMatch(ui, /requestPort\s*\(/);
assert.doesNotMatch(ui, /Math\.random\s*\(/);

console.log('HELIOS independence-gated Edge Constellation invariants: PASS');
