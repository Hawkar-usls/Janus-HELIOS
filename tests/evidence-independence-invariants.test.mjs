import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import {
  HELIOS_EVIDENCE_INDEPENDENCE_VERSION,
  INDEPENDENCE_ROOT_AXES,
  assertHumanBlindLineage,
  normalizeReplicationLineage,
  compareReplicationLineage,
  createEvidenceIndependencePlan,
  analyzeEvidenceIndependence
} from '../src/helios-evidence-independence.js';

const [contract, ui, receiptViewer] = await Promise.all([
  readFile(new URL('../.janus/HELIOS_EVIDENCE_INDEPENDENCE_ENGINE.json', import.meta.url), 'utf8').then(JSON.parse),
  readFile(new URL('../helios-evidence-independence-ui.js', import.meta.url), 'utf8'),
  readFile(new URL('../helios-receipt-viewer.js', import.meta.url), 'utf8')
]);

assert.equal(HELIOS_EVIDENCE_INDEPENDENCE_VERSION, '1.0.0');
assert.deepEqual(INDEPENDENCE_ROOT_AXES, [
  'physical_device_root',
  'execution_lineage_root',
  'authority_root',
  'site_network_root',
  'observation_epoch_root',
  'job_stream_root'
]);

const roots = (prefix, nodeClass = 'DESKTOP_GPU') => ({
  node_id: `${prefix}-node`,
  node_class: nodeClass,
  physical_device_root: `${prefix}-device`,
  execution_lineage_root: `${prefix}-exec`,
  authority_root: `${prefix}-authority`,
  site_network_root: `${prefix}-site`,
  observation_epoch_root: `${prefix}-epoch`,
  job_stream_root: `${prefix}-job`
});

assert.equal(assertHumanBlindLineage({ node_id: 'ok', physical_device_root: 'd1' }), true);
assert.throws(() => assertHumanBlindLineage({ screen_history: 'nope' }), /HUMAN_OBSERVATION_FORBIDDEN/);
assert.throws(() => assertHumanBlindLineage({ nested: { process_name: 'miner' } }), /HUMAN_OBSERVATION_FORBIDDEN/);

const a = normalizeReplicationLineage(roots('a', 'DESKTOP_GPU'));
const b = normalizeReplicationLineage(roots('b', 'DESKTOP_GPU'));
assert.equal(a.unknown_root_count, 0);
assert.equal(a.hardware_class_is_independence_root, false);
const sameHardwareDifferentRoots = compareReplicationLineage(a, b);
assert.equal(sameHardwareDifferentRoots.strongly_independent, true);
assert.equal(sameHardwareDifferentRoots.classification, 'STRONGLY_INDEPENDENT');

const samePhysical = compareReplicationLineage(
  roots('a'),
  { ...roots('c'), physical_device_root: 'a-device' }
);
assert.equal(samePhysical.same_physical_root, true);
assert.equal(samePhysical.strongly_independent, false);
assert.equal(samePhysical.classification, 'SAME_PHYSICAL_ROOT');

const unknownDifferentHardware = compareReplicationLineage(
  { node_id: 'esp', node_class: 'NERDMINER_ESP32', physical_device_root: 'esp-device' },
  { node_id: 'asic', node_class: 'ASIC_GATEWAY', physical_device_root: 'asic-device' }
);
assert.equal(unknownDifferentHardware.strongly_independent, false);
assert.ok(unknownDifferentHardware.unknown_axes.length > 0);
assert.equal(unknownDifferentHardware.unknown_is_independent, false);

const plan = createEvidenceIndependencePlan({ campaign_id: 'test', nodes: [{ node_id: 'a' }, { node_id: 'b' }] });
assert.equal(plan.law, 'REPLICATION_COUNT_NOT_EQUAL_INDEPENDENT_ROOT_COUNT');
assert.equal(plan.required_roots.length, 6);
assert.equal(plan.unknown_policy, 'UNKNOWN_NEVER_COUNTS_AS_INDEPENDENT');
assert.equal(plan.hardware_class_is_independence_root, false);
assert.equal(plan.probability_claim, 'NONE');

const c = { ...roots('c'), execution_lineage_root: 'a-exec' };
const analysisTwoOfThree = analyzeEvidenceIndependence([roots('a'), roots('b'), c]);
assert.equal(analysisTwoOfThree.raw_replication_count, 3);
assert.equal(analysisTwoOfThree.strong_independent_replication_count, 2);
assert.equal(analysisTwoOfThree.strong_independent_set.exact_maximum_clique, true);
assert.equal(analysisTwoOfThree.laws.replication_count_not_equal_independent_root_count, true);
assert.equal(analysisTwoOfThree.laws.unknown_never_counts_as_independent, true);
assert.equal(analysisTwoOfThree.laws.confidence_probability_inference_allowed, false);

const analysisThree = analyzeEvidenceIndependence([roots('a'), roots('b'), roots('c')]);
assert.equal(analysisThree.strong_independent_replication_count, 3);
assert.equal(analysisThree.verdict, 'STRONG_INDEPENDENCE_SET_FOUND');

const duplicatePhysical = analyzeEvidenceIndependence([
  roots('a'),
  { ...roots('b'), physical_device_root: 'a-device' },
  { ...roots('c'), physical_device_root: 'a-device' }
]);
assert.equal(duplicatePhysical.known_physical_root_count, 1);
assert.equal(duplicatePhysical.strong_independent_replication_count, 1);
assert.equal(duplicatePhysical.verdict, 'INSUFFICIENT_STRONG_INDEPENDENCE');

assert.equal(contract.version, '1.0.0');
assert.equal(contract.core_law, 'REPLICATION_COUNT_NOT_EQUAL_INDEPENDENT_ROOT_COUNT');
assert.equal(contract.strong_independence.unknown_counts_as_independent, false);
assert.equal(contract.strong_independence.same_hardware_class_is_dependency, false);
assert.equal(contract.graph_model.selected_replication_set, 'MAXIMUM_CLIQUE_OF_STRONG_INDEPENDENCE_GRAPH');
assert.equal(contract.constellation_gate.minimum_strongly_independent_complete_nodes, 2);
assert.equal(contract.public_demo.fake_independence_score, false);
assert.equal(contract.privacy.human_blind, true);
assert.equal(contract.authority.game_effect, 'NONE');

assert.match(ui, /REPLICATION COUNT ≠ INDEPENDENT ROOT COUNT/);
assert.match(ui, /MAXIMUM CLIQUE/);
assert.match(ui, /Unknown ≠ independent/);
assert.match(ui, /No lineage roots are invented/);
assert.doesNotMatch(ui, /requestPort\s*\(/);
assert.doesNotMatch(ui, /Math\.random\s*\(/);
assert.doesNotMatch(ui, /\b9[0-9]% independent\b/i);
assert.match(receiptViewer, /helios-evidence-independence-ui-script/);
assert.match(receiptViewer, /helios-evidence-independence-ui\.js\?v=1\.0\.0/);
assert.match(receiptViewer, /helios-edge-constellation-ui\.js\?v=1\.1\.0/);

console.log('HELIOS Evidence Independence Engine invariants: PASS');
