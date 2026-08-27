import assert from 'node:assert/strict';
import {
  HeliosDesktopAgentRuntime,
  HELIOS_DESKTOP_AGENT_VERSION
} from '../src/helios-desktop-agent.js';
import { FABRIC_ASSIGNMENT_SCHEMA } from '../src/helios-desktop-fabric.js';

assert.equal(HELIOS_DESKTOP_AGENT_VERSION, '1.0.0');

const artifact = `sha256:${'a'.repeat(64)}`;
const agent = new HeliosDesktopAgentRuntime({
  agent_id: 'desktop-agent-test',
  resource_policy: {
    compute_consent: true,
    allow_cpu: true,
    allow_gpu: true,
    cpu_limit_percent: 35,
    gpu_limit_percent: 40,
    max_concurrent: 2,
    max_temp_c: 80,
    max_watts: 250,
    immediate_revoke: true
  },
  gpu_inventory: [{ id: 'gpu0', vendor: 'NVIDIA', model: 'test-gpu', vram_mb: 16384, capabilities: ['CUDA'] }],
  extra_capabilities: ['CUDA'],
  telemetry_provider: async () => ({
    cpu_load: 0.1,
    gpu_load: 0.1,
    temperature_c: 55,
    battery_percent: 100,
    on_ac_power: true,
    available_vram_mb: 15000,
    estimated_watts: 120,
    latency_ms: 5,
    reliability: 0.99
  })
});

agent.registerExecutor({
  provider_id: 'provider-test',
  task_type: 'GENERAL_COMPUTE_JOB',
  artifact_digest: artifact,
  capabilities: ['GENERAL_GPU', 'CUDA'],
  handler: async ({ payload, resource_budget }) => ({
    ok: true,
    doubled: Number(payload.value) * 2,
    cpu_budget: resource_budget.cpu_limit_percent,
    gpu_budget: resource_budget.gpu_limit_percent
  })
});

const heartbeat = await agent.heartbeatPayload({ session_id: 'session-1' });
assert.equal(heartbeat.agent_id, 'desktop-agent-test');
assert.equal(heartbeat.resource_policy.compute_consent, true);
assert.equal(heartbeat.capabilities.includes('GENERAL_CPU'), true);
assert.equal(heartbeat.capabilities.includes('GENERAL_GPU'), true);
assert.equal(heartbeat.capabilities.includes('CUDA'), true);
assert.equal(heartbeat.gpus.length, 1);

const assignment = {
  schema: FABRIC_ASSIGNMENT_SCHEMA,
  fabric_version: '2.0.0',
  workload_id: 'workload-1',
  slice_id: 'workload-1:r000000',
  provider_id: 'provider-test',
  provider_job_id: null,
  task_type: 'GENERAL_COMPUTE_JOB',
  route_class: 'DATACENTER',
  artifact_digest: artifact,
  requirements: {
    resource_class: 'GPU',
    min_logical_cores: 1,
    min_memory_mb: 0,
    min_vram_mb: 1000,
    required_capabilities: ['GENERAL_GPU', 'CUDA']
  },
  payload: { value: 21 },
  lease_id: 'lease-1',
  lease_expires_at_ms: Date.now() + 10000,
  scheduling_basis: 'CONSENT_RESOURCE_POLICY_PROVIDER_CAPACITY_WORKLOAD_ADMISSION_AND_DESKTOP_TELEMETRY',
  game_event_weighting: 'FORBIDDEN',
  game_effect: 'NONE'
};

const result = await agent.executeAssignment(assignment);
assert.equal(result.ok, true);
assert.equal(result.output.doubled, 42);
assert.equal(result.output.cpu_budget, 35);
assert.equal(result.output.gpu_budget, 40);
assert.equal(result.game_event_weighting, 'FORBIDDEN');
assert.equal(result.game_effect, 'NONE');

await assert.rejects(
  agent.executeAssignment({ ...assignment, artifact_digest: `sha256:${'b'.repeat(64)}` }),
  /APPROVED_EXECUTOR_NOT_FOUND_FOR_EXACT_ARTIFACT/
);

await assert.rejects(
  agent.executeAssignment({ ...assignment, bet: 10 }),
  /FORBIDDEN_GAME_COUPLING/
);

await assert.rejects(
  agent.executeAssignment({ ...assignment, payload: { command: 'echo unsafe' } }),
  /ARBITRARY_EXECUTION_OR_SECRET_FORBIDDEN/
);

agent.revoke();
await assert.rejects(agent.executeAssignment(assignment), /COMPUTE_CONSENT_NOT_ACTIVE/);

console.log('HELIOS desktop agent runtime invariants: PASS');
