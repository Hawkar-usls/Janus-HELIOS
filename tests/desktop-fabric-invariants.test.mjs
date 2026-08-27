import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import {
  HeliosDesktopFabric,
  HELIOS_DESKTOP_FABRIC_VERSION,
  buildFabricSlices,
  scoreDesktopAgent
} from '../src/helios-desktop-fabric.js';

const source = await readFile(new URL('../src/helios-desktop-fabric.js', import.meta.url), 'utf8');
const contract = JSON.parse(await readFile(new URL('../.janus/HELIOS_DESKTOP_FABRIC.json', import.meta.url), 'utf8'));

assert.equal(HELIOS_DESKTOP_FABRIC_VERSION, '2.0.0');
assert.equal(contract.lineage.active_dependency_on_janus_distributed_ai_swarm, false);
assert.equal(contract.target_hardware.desktop_class, true);
assert.equal(contract.target_hardware.esp32_required, false);
assert.equal(contract.game_boundary.game_event_weighting, 'FORBIDDEN');
assert.equal(contract.game_boundary.game_effect, 'NONE');
assert.equal(contract.production_claim_boundary.production_ready, false);
assert.match(source, /FABRIC_BACKPRESSURE_QUEUE_FULL/);
assert.match(source, /STALE_FENCING_TOKEN/);
assert.match(source, /ACK_DEADLINE_EXCEEDED/);
assert.match(source, /ARBITRARY_EXECUTION_OR_SECRET_FORBIDDEN/);
assert.match(source, /DESKTOP_TELEMETRY/);
assert.doesNotMatch(source, /Buzz-derived/i);

const slices = buildFabricSlices({ workload_id: 'desktop-range', total_units: 96, shard_units: 24 });
assert.equal(slices.length, 4);
assert.deepEqual(slices.map(x => x.payload), [
  { offset: 0, units: 24 },
  { offset: 24, units: 24 },
  { offset: 48, units: 24 },
  { offset: 72, units: 24 }
]);

const hotAgent = {
  inflight: 0,
  revoked: false,
  logical_cores: 16,
  memory_mb: 32768,
  gpus: [],
  capabilities: ['GENERAL_CPU'],
  resource_policy: { compute_consent: true, allow_cpu: true, allow_gpu: false, max_concurrent: 2, max_temp_c: 80, max_watts: 0, battery_allowed: false },
  telemetry: { cpu_load: 0.1, gpu_load: 0, temperature_c: 84, available_memory_mb: 30000, available_vram_mb: 0, reliability: 0.99, latency_ms: 10 }
};
assert.equal(scoreDesktopAgent(hotAgent, { resource_class: 'CPU', required_capabilities: ['GENERAL_CPU'] }), -Infinity);

const dispatched = [];
const fabric = new HeliosDesktopFabric({
  authenticate_agent: async hb => hb.session_id === 'desktop-session',
  sign_assignment: async a => `sig:${a.workload_id}:${a.slice_id}:${a.lease_id}`,
  policy: { lease_ttl_ms: 5_000, ack_timeout_ms: 1_000, max_attempts: 3, max_dispatch_per_tick: 16, max_slices: 100 }
});

fabric.registerProviderAdapter('provider-cpu', {
  async dispatch(agentId, assignment) { dispatched.push({ agentId, assignment }); return true; },
  async cancel() { return true; },
  async verify({ output }) { return output?.ok === true; }
});

fabric.registerProviderAdapter('provider-gpu', {
  async dispatch(agentId, assignment) { dispatched.push({ agentId, assignment }); return true; },
  async cancel() { return true; },
  async verify({ output }) { return output?.ok === true; }
});

await fabric.heartbeat({
  agent_id: 'desktop-cpu-01', session_id: 'desktop-session', platform: 'win32', architecture: 'x64', logical_cores: 24, memory_mb: 65536,
  capabilities: ['GENERAL_CPU', 'AVX2'], gpus: [],
  resource_policy: { compute_consent: true, allow_cpu: true, allow_gpu: false, cpu_limit_percent: 35, max_concurrent: 2, max_temp_c: 80, immediate_revoke: true },
  telemetry: { cpu_load: 0.10, temperature_c: 58, on_ac_power: true, available_memory_mb: 48000, reliability: 0.99, latency_ms: 12, estimated_watts: 95 }
}, 1000);

await fabric.heartbeat({
  agent_id: 'desktop-gpu-01', session_id: 'desktop-session', platform: 'linux', architecture: 'x64', logical_cores: 32, memory_mb: 131072,
  capabilities: ['GENERAL_CPU', 'GENERAL_GPU', 'CUDA'],
  gpus: [{ id: 'gpu0', vendor: 'NVIDIA', model: 'desktop-gpu', vram_mb: 24576, capabilities: ['CUDA'] }],
  resource_policy: { compute_consent: true, allow_cpu: true, allow_gpu: true, cpu_limit_percent: 40, gpu_limit_percent: 50, max_concurrent: 2, max_temp_c: 82, immediate_revoke: true },
  telemetry: { cpu_load: 0.15, gpu_load: 0.05, temperature_c: 60, on_ac_power: true, available_memory_mb: 96000, available_vram_mb: 22000, reliability: 0.995, latency_ms: 8, estimated_watts: 170 }
}, 1000);

await assert.rejects(fabric.heartbeat({
  agent_id: 'bad-auth', session_id: 'wrong', logical_cores: 8, memory_mb: 16000, capabilities: ['GENERAL_CPU'], resource_policy: { compute_consent: true }, telemetry: {}
}, 1000), /AGENT_AUTHENTICATION_FAILED/);

assert.throws(() => fabric.submitWorkload({
  workload_id: 'bad-coupling', provider_id: 'provider-cpu', type: 'GENERAL_COMPUTE_JOB', route_class: 'DATACENTER',
  artifact_digest: `sha256:${'a'.repeat(64)}`, consent_required: true, requirements: { resource_class: 'CPU' }, total_units: 1, shard_units: 1, bet: 10
}, 1000), /FORBIDDEN_GAME_COUPLING/);

assert.throws(() => fabric.submitWorkload({
  workload_id: 'bad-command', provider_id: 'provider-cpu', type: 'GENERAL_COMPUTE_JOB', route_class: 'DATACENTER',
  artifact_digest: `sha256:${'b'.repeat(64)}`, consent_required: true, requirements: { resource_class: 'CPU' }, partitions: [{ command: 'unsafe' }]
}, 1000), /ARBITRARY_EXECUTION_OR_SECRET_FORBIDDEN/);

fabric.submitWorkload({
  workload_id: 'cpu-job', provider_id: 'provider-cpu', type: 'GENERAL_COMPUTE_JOB', route_class: 'DATACENTER',
  artifact_digest: `sha256:${'c'.repeat(64)}`, consent_required: true, priority: 20,
  requirements: { resource_class: 'CPU', min_logical_cores: 8, min_memory_mb: 8000, required_capabilities: ['GENERAL_CPU'] },
  total_units: 40, shard_units: 20, metadata: { purpose: 'desktop-cpu-test' }
}, 1000);

const cpuWave = await fabric.dispatchReady({ now: 1100, limit: 2 });
assert.equal(cpuWave.length, 2);
assert.equal(cpuWave.every(x => x.assignment.signature.startsWith('sig:')), true);
assert.equal(cpuWave.every(x => x.assignment.game_event_weighting === 'FORBIDDEN'), true);
assert.equal(cpuWave.every(x => x.assignment.game_effect === 'NONE'), true);

for (const item of cpuWave) fabric.acknowledge({ workload_id: item.assignment.workload_id, slice_id: item.assignment.slice_id, agent_id: item.agent_id, lease_id: item.assignment.lease_id }, 1200);

assert.throws(() => fabric.renewLease({ workload_id: cpuWave[0].assignment.workload_id, slice_id: cpuWave[0].assignment.slice_id, agent_id: cpuWave[0].agent_id, lease_id: 'stale-token' }, 1300), /STALE_FENCING_TOKEN/);

const rejectOne = await fabric.submitResult({ workload_id: cpuWave[0].assignment.workload_id, slice_id: cpuWave[0].assignment.slice_id, agent_id: cpuWave[0].agent_id, lease_id: cpuWave[0].assignment.lease_id, output: { ok: false }, result_bytes: 20 }, 1400);
assert.equal(rejectOne.accepted, false);
assert.equal(rejectOne.requeued, true);

const acceptTwo = await fabric.submitResult({ workload_id: cpuWave[1].assignment.workload_id, slice_id: cpuWave[1].assignment.slice_id, agent_id: cpuWave[1].agent_id, lease_id: cpuWave[1].assignment.lease_id, output: { ok: true }, result_bytes: 20 }, 1400);
assert.equal(acceptTwo.accepted, true);

const retry = await fabric.dispatchReady({ now: 1500, limit: 1 });
assert.equal(retry.length, 1);
fabric.acknowledge({ workload_id: retry[0].assignment.workload_id, slice_id: retry[0].assignment.slice_id, agent_id: retry[0].agent_id, lease_id: retry[0].assignment.lease_id }, 1600);
const done = await fabric.submitResult({ workload_id: retry[0].assignment.workload_id, slice_id: retry[0].assignment.slice_id, agent_id: retry[0].agent_id, lease_id: retry[0].assignment.lease_id, output: { ok: true }, result_bytes: 20 }, 1700);
assert.equal(done.workload_complete, true);
assert.equal(done.receipt.schema, 'janus.helios.fabric.receipt.v2');
assert.equal(done.receipt.resource_class, 'CPU');
assert.equal(done.receipt.retry_count, 1);
assert.equal(done.receipt.provider_settlement_authoritative, false);

fabric.submitWorkload({
  workload_id: 'gpu-job', provider_id: 'provider-gpu', type: 'SCIENCE_WORK_UNIT', route_class: 'SCIENCE',
  artifact_digest: `sha256:${'d'.repeat(64)}`, consent_required: true, priority: 30,
  requirements: { resource_class: 'GPU', min_memory_mb: 16000, min_vram_mb: 12000, required_capabilities: ['GENERAL_GPU', 'CUDA'] },
  total_units: 10, shard_units: 10
}, 1800);
const gpuWave = await fabric.dispatchReady({ now: 1900, limit: 1 });
assert.equal(gpuWave.length, 1);
assert.equal(gpuWave[0].agent_id, 'desktop-gpu-01');
assert.equal(gpuWave[0].assignment.requirements.resource_class, 'GPU');

console.log('HELIOS desktop fabric invariants: PASS');
