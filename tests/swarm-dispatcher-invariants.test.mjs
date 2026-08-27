import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import {
  HeliosSwarmDispatcher,
  HELIOS_SWARM_VERSION,
  createWorkChunks
} from '../src/helios-swarm-dispatcher.js';

const source = await readFile(new URL('../src/helios-swarm-dispatcher.js', import.meta.url), 'utf8');
const contract = JSON.parse(await readFile(new URL('../.janus/HELIOS_SWARM_DISPATCHER.json', import.meta.url), 'utf8'));

assert.equal(HELIOS_SWARM_VERSION, '1.0.0');
assert.equal(contract.node_admission.explicit_compute_consent_required, true);
assert.equal(contract.lease_fencing.lease_id_is_fencing_token, true);
assert.equal(contract.verification.result_verifier_required, true);
assert.equal(contract.game_boundary.game_event_weighting, 'FORBIDDEN');
assert.equal(contract.game_boundary.game_effect, 'NONE');
assert.equal(contract.production_claim_boundary.sponsor_provider_pilot_required, true);
assert.match(source, /STALE_FENCING_TOKEN/);
assert.match(source, /ACK_DEADLINE_EXCEEDED/);
assert.match(source, /LEASE_EXPIRED/);
assert.match(source, /RESULT_VERIFIER_REQUIRED/);
assert.match(source, /ARBITRARY_EXECUTION_OR_SECRET_FORBIDDEN/);
assert.match(source, /CONSENT_DEVICE_POLICY_PROVIDER_CAPACITY_AND_WORKLOAD_ADMISSION/);
assert.doesNotMatch(source, /game_event_weighting:\s*['"]ALLOWED['"]/);

const chunks = createWorkChunks({
  job_id: 'range-test',
  workload_id: 'test-workload',
  type: 'GENERAL_COMPUTE_JOB',
  route_class: 'DATACENTER',
  artifact_digest: `sha256:${'a'.repeat(64)}`,
  consent_required: true,
  required_capabilities: ['GENERAL_CPU'],
  total_units: 100,
  chunk_units: 25,
  metadata: {}
});
assert.equal(chunks.length, 4);
assert.deepEqual(chunks.map(c => c.input), [
  { offset: 0, length: 25 },
  { offset: 25, length: 25 },
  { offset: 50, length: 25 },
  { offset: 75, length: 25 }
]);

const assignments = [];
const transport = {
  async assign(nodeId, envelope) {
    assignments.push({ nodeId, envelope });
    return true;
  },
  async cancel() { return true; }
};

const dispatcher = new HeliosSwarmDispatcher({
  transport,
  verifier: async ({ output }) => output?.ok === true,
  aggregator: async ({ results }) => ({ verified_parts: results.length }),
  authenticate_node: async hb => hb.session_id === 'signed-demo-session',
  sign_assignment: async envelope => `sig:${envelope.chunk_id}:${envelope.lease_id}`,
  policy: {
    node_ttl_ms: 30_000,
    lease_ttl_ms: 5_000,
    ack_timeout_ms: 1_000,
    max_attempts: 3,
    max_dispatch_per_tick: 8
  }
});

await dispatcher.heartbeat({
  node_id: 'node-a',
  session_id: 'signed-demo-session',
  capabilities: ['GENERAL_CPU'],
  resource_policy: {
    compute_consent: true,
    max_concurrent: 1,
    cpu_percent: 20,
    immediate_revoke: true
  },
  telemetry: {
    load: 0.1,
    temperature_c: 55,
    reliability: 0.99,
    latency_ms: 15,
    available_memory_mb: 8192
  }
}, 1000);

await dispatcher.heartbeat({
  node_id: 'node-b',
  session_id: 'signed-demo-session',
  capabilities: ['GENERAL_CPU'],
  resource_policy: {
    compute_consent: true,
    max_concurrent: 1,
    cpu_percent: 20,
    immediate_revoke: true
  },
  telemetry: {
    load: 0.2,
    temperature_c: 58,
    reliability: 0.98,
    latency_ms: 20,
    available_memory_mb: 8192
  }
}, 1000);

await dispatcher.heartbeat({
  node_id: 'node-no-consent',
  session_id: 'signed-demo-session',
  capabilities: ['GENERAL_CPU'],
  resource_policy: {
    compute_consent: false,
    max_concurrent: 1,
    cpu_percent: 20
  },
  telemetry: { load: 0 }
}, 1000);

assert.rejects(
  dispatcher.heartbeat({
    node_id: 'node-unauthenticated',
    session_id: 'wrong-session',
    capabilities: ['GENERAL_CPU'],
    resource_policy: { compute_consent: true },
    telemetry: {}
  }, 1000),
  /NODE_AUTHENTICATION_FAILED/
);

assert.throws(() => dispatcher.submitJob({
  job_id: 'bad-game-coupling',
  workload_id: 'test-workload',
  type: 'GENERAL_COMPUTE_JOB',
  route_class: 'DATACENTER',
  artifact_digest: `sha256:${'b'.repeat(64)}`,
  consent_required: true,
  required_capabilities: ['GENERAL_CPU'],
  total_units: 1,
  chunk_units: 1,
  bet: 10
}, 1000), /FORBIDDEN_GAME_COUPLING/);

assert.throws(() => dispatcher.submitJob({
  job_id: 'bad-command',
  workload_id: 'test-workload',
  type: 'GENERAL_COMPUTE_JOB',
  route_class: 'DATACENTER',
  artifact_digest: `sha256:${'c'.repeat(64)}`,
  consent_required: true,
  required_capabilities: ['GENERAL_CPU'],
  partitions: [{ command: 'echo unsafe' }]
}, 1000), /ARBITRARY_EXECUTION_OR_SECRET_FORBIDDEN/);

dispatcher.submitJob({
  job_id: 'job-1',
  workload_id: 'renderer-v1',
  type: 'GENERAL_COMPUTE_JOB',
  route_class: 'DATACENTER',
  artifact_digest: `sha256:${'d'.repeat(64)}`,
  consent_required: true,
  required_capabilities: ['GENERAL_CPU'],
  total_units: 50,
  chunk_units: 25,
  metadata: { purpose: 'deterministic-test' }
}, 1000);

const firstWave = await dispatcher.dispatchReady({ now: 1100 });
assert.equal(firstWave.length, 2);
assert.deepEqual(new Set(firstWave.map(x => x.node_id)), new Set(['node-a', 'node-b']));
assert.equal(firstWave.some(x => x.node_id === 'node-no-consent'), false);
assert.notEqual(firstWave[0].assignment.lease_id, firstWave[1].assignment.lease_id);
assert.equal(firstWave.every(x => x.assignment.signature.startsWith('sig:')), true);
assert.equal(firstWave.every(x => x.assignment.game_event_weighting === 'FORBIDDEN'), true);
assert.equal(firstWave.every(x => x.assignment.game_effect === 'NONE'), true);

for (const item of firstWave) {
  dispatcher.acknowledge({
    job_id: item.assignment.job_id,
    chunk_id: item.assignment.chunk_id,
    node_id: item.node_id,
    lease_id: item.assignment.lease_id
  }, 1200);
}

const stale = firstWave[0];
assert.throws(() => dispatcher.renewLease({
  job_id: stale.assignment.job_id,
  chunk_id: stale.assignment.chunk_id,
  node_id: stale.node_id,
  lease_id: '00000000-0000-4000-8000-000000000000'
}, 1300), /STALE_FENCING_TOKEN/);

const rejected = await dispatcher.submitResult({
  job_id: firstWave[0].assignment.job_id,
  chunk_id: firstWave[0].assignment.chunk_id,
  node_id: firstWave[0].node_id,
  lease_id: firstWave[0].assignment.lease_id,
  output: { ok: false }
}, 1400);
assert.equal(rejected.accepted, false);
assert.equal(rejected.requeued, true);

const acceptedSecond = await dispatcher.submitResult({
  job_id: firstWave[1].assignment.job_id,
  chunk_id: firstWave[1].assignment.chunk_id,
  node_id: firstWave[1].node_id,
  lease_id: firstWave[1].assignment.lease_id,
  output: { ok: true, part: 2 }
}, 1400);
assert.equal(acceptedSecond.accepted, true);
assert.equal(acceptedSecond.job_complete, false);

const retryWave = await dispatcher.dispatchReady({ now: 1500 });
assert.equal(retryWave.length, 1);
assert.notEqual(retryWave[0].assignment.lease_id, firstWave[0].assignment.lease_id);

dispatcher.acknowledge({
  job_id: retryWave[0].assignment.job_id,
  chunk_id: retryWave[0].assignment.chunk_id,
  node_id: retryWave[0].node_id,
  lease_id: retryWave[0].assignment.lease_id
}, 1600);

const completed = await dispatcher.submitResult({
  job_id: retryWave[0].assignment.job_id,
  chunk_id: retryWave[0].assignment.chunk_id,
  node_id: retryWave[0].node_id,
  lease_id: retryWave[0].assignment.lease_id,
  output: { ok: true, part: 1 }
}, 1700);
assert.equal(completed.accepted, true);
assert.equal(completed.job_complete, true);

const finalJob = dispatcher.jobSnapshot('job-1');
assert.equal(finalJob.state, 'COMPLETE');
assert.equal(finalJob.receipt.schema, 'janus.helios.swarm.receipt.v1');
assert.equal(finalJob.receipt.aggregate.verified_parts, 2);
assert.equal(finalJob.receipt.game_effect, 'NONE');
assert.equal(finalJob.receipt.game_event_weighting, 'FORBIDDEN');

console.log('HELIOS Buzz-derived swarm dispatcher invariants: PASS');
