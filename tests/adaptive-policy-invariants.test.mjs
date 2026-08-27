import assert from 'node:assert/strict';
import {
  HELIOS_ADAPTIVE_POLICY_VERSION,
  MissionBudgetController,
  SafeActionBandit,
  ThrottledPolicyMemory,
  SelfTestedAccelerationGate,
  HeliosAdaptivePolicyPlane,
  HeliosPolicyBoundDesktopAgent,
  classifyPressure
} from '../src/helios-adaptive-policy.js';
import { FABRIC_ASSIGNMENT_SCHEMA } from '../src/helios-desktop-fabric.js';

assert.equal(HELIOS_ADAPTIVE_POLICY_VERSION, '1.0.0');
assert.equal(classifyPressure({ cpu_load: 0.2, temperature_c: 55 }), 'NORMAL');
assert.equal(classifyPressure({ cpu_load: 0.86, temperature_c: 55 }), 'CONSTRAINED');
assert.equal(classifyPressure({ cpu_load: 0.98, temperature_c: 55 }), 'CRITICAL');

const missions = new MissionBudgetController({
  primary: { provider_ids: ['primary-provider'] },
  side_quest: {
    max_cpu_percent: 20,
    max_gpu_percent: 15,
    max_concurrent: 1,
    window_ms: 10_000,
    runtime_budget_ms: 2_000,
    constrained_scale: 0.25
  }
});

const primaryUnderPressure = missions.decide({
  workload: { provider_id: 'primary-provider', task_type: 'GENERAL_COMPUTE_JOB' },
  telemetry: { cpu_load: 0.99, temperature_c: 92 },
  now: 1000
});
assert.equal(primaryUnderPressure.admitted, true);
assert.equal(primaryUnderPressure.mission_class, 'PRIMARY');
assert.equal(primaryUnderPressure.priority_protected, true);
assert.equal(primaryUnderPressure.safety_gates_still_authoritative, true);

const sideNormal = missions.decide({
  workload: { provider_id: 'side-provider', task_type: 'GENERAL_COMPUTE_JOB' },
  telemetry: { cpu_load: 0.2, temperature_c: 55 },
  now: 1100
});
assert.equal(sideNormal.admitted, true);
assert.equal(sideNormal.mission_class, 'SIDE_QUEST');
assert.equal(sideNormal.execution_budget_cap.cpu_limit_percent, 20);

const sideConstrained = missions.decide({
  workload: { provider_id: 'side-provider', task_type: 'GENERAL_COMPUTE_JOB' },
  telemetry: { cpu_load: 0.85, temperature_c: 55 },
  now: 1200
});
assert.equal(sideConstrained.admitted, true);
assert.equal(sideConstrained.reason, 'QUIET_CANARY_THROTTLED');
assert.equal(sideConstrained.execution_budget_cap.cpu_limit_percent, 5);

const sideCritical = missions.decide({
  workload: { provider_id: 'side-provider', task_type: 'GENERAL_COMPUTE_JOB' },
  telemetry: { cpu_load: 0.99, temperature_c: 55 },
  now: 1300
});
assert.equal(sideCritical.admitted, false);
assert.equal(sideCritical.reason, 'QUIET_CANARY_CRITICAL_PRESSURE');

missions.recordRuntime(2_100, 1400);
const exhausted = missions.decide({
  workload: { provider_id: 'side-provider', task_type: 'GENERAL_COMPUTE_JOB' },
  telemetry: { cpu_load: 0.1, temperature_c: 50 },
  now: 1500
});
assert.equal(exhausted.admitted, false);
assert.equal(exhausted.reason, 'SIDE_QUEST_TIME_BUDGET_EXHAUSTED');

const deterministic = [0.9, 0.0, 0.9, 0.0];
const bandit = new SafeActionBandit({
  arms: [
    { id: 'steady', policy: { batch_size: 32, side_quest_budget_percent: 10 } },
    { id: 'wide', policy: { batch_size: 64, side_quest_budget_percent: 15 } }
  ],
  exploration: 0,
  random: () => deterministic.shift() ?? 0
});
const chosen = bandit.choose();
assert.equal(['steady', 'wide'].includes(chosen.id), true);
const before = bandit.snapshot().weights[chosen.id];
bandit.observe(chosen.id, 1);
const after = bandit.snapshot().weights[chosen.id];
assert.equal(after > before, true);
assert.throws(() => new SafeActionBandit({
  arms: [
    { id: 'bad', policy: { artifact_digest: 'sha256:forbidden' } },
    { id: 'other', policy: { batch_size: 1 } }
  ]
}), /IMMUTABLE_TRUTH_KEY_FORBIDDEN/);
assert.throws(() => bandit.restore({
  schema: 'janus.helios.adaptive-policy.memory.v1',
  arm_ids: ['different', 'arms'],
  weights: { different: 1, arms: 1 },
  observations: 0
}), /SAFE_ARM_SET_MISMATCH/);

let persisted = null;
let saves = 0;
const memory = new ThrottledPolicyMemory({
  load: async () => persisted,
  save: async value => { persisted = value; saves += 1; },
  min_save_interval_ms: 5_000
});
assert.equal(await memory.saveIfDue(bandit.snapshot(), { now: 10_000 }), true);
assert.equal(await memory.saveIfDue(bandit.snapshot(), { now: 12_000 }), false);
assert.equal(await memory.saveIfDue(bandit.snapshot(), { now: 12_000, force: true }), true);
assert.equal(saves, 2);
assert.equal((await memory.load()).schema, 'janus.helios.adaptive-policy.memory.v1');

let tick = 0;
const goodGate = new SelfTestedAccelerationGate({
  stable_handler: async input => { tick += 10; return { value: input.value * 2 }; },
  candidate_handler: async input => { tick += 5; return { value: input.value * 2 }; },
  min_gain_percent: 20,
  crosscheck_every: 2
});
const qualification = await goodGate.qualify([{ value: 2 }, { value: 7 }], { clock: () => tick, rounds: 4 });
assert.equal(qualification.equivalent, true);
assert.equal(qualification.promoted, true);
assert.equal(goodGate.snapshot().state, 'PROMOTED');
assert.deepEqual(await goodGate.execute({ value: 9 }), { value: 18 });

const badGate = new SelfTestedAccelerationGate({
  stable_handler: async input => ({ value: input.value }),
  candidate_handler: async input => ({ value: input.value + 1 })
});
const rejected = await badGate.qualify([{ value: 1 }]);
assert.equal(rejected.equivalent, false);
assert.equal(badGate.snapshot().state, 'REJECTED');
assert.deepEqual(await badGate.execute({ value: 5 }), { value: 5 });

const reports = [];
const plane = new HeliosAdaptivePolicyPlane({
  node_id: 'helios-policy-node',
  mission: {
    primary: { provider_ids: ['primary-provider'] },
    side_quest: { max_cpu_percent: 20, max_gpu_percent: 20, max_concurrent: 1, runtime_budget_ms: 10_000 }
  },
  bandit_arms: [
    { id: 'small-batch', policy: { batch_size: 16, side_quest_budget_percent: 10 } },
    { id: 'medium-batch', policy: { batch_size: 32, side_quest_budget_percent: 15 } }
  ],
  bandit: { exploration: 0, random: () => 0 },
  report_sink: async event => reports.push(event)
});
const decision = await plane.decide({
  workload: { provider_id: 'side-provider', task_type: 'GENERAL_COMPUTE_JOB' },
  telemetry: { cpu_load: 0.1, temperature_c: 50 },
  now: 20_000
});
assert.equal(decision.mission.admitted, true);
assert.equal(decision.arm.id, 'small-batch');
await plane.observe({ arm_id: decision.arm.id, reward: 0.5, side_quest_runtime_ms: 250, now: 20_500 });
assert.equal(reports.some(x => x.kind === 'WORKLOAD_POLICY_ADMIT'), true);
assert.equal(reports.some(x => x.kind === 'POLICY_OUTCOME'), true);

const artifact = `sha256:${'a'.repeat(64)}`;
const boundAgent = new HeliosPolicyBoundDesktopAgent({
  adaptive_policy_plane: plane,
  agent_id: 'policy-bound-agent',
  resource_policy: {
    compute_consent: true,
    allow_cpu: true,
    allow_gpu: false,
    cpu_limit_percent: 50,
    gpu_limit_percent: 10,
    max_concurrent: 2,
    max_temp_c: 80,
    max_watts: 250
  },
  telemetry_provider: async () => ({
    cpu_load: 0.1,
    gpu_load: 0,
    temperature_c: 50,
    battery_percent: 100,
    on_ac_power: true,
    available_vram_mb: 0,
    estimated_watts: 80,
    reliability: 0.99
  })
});
boundAgent.registerExecutor({
  provider_id: 'side-provider',
  task_type: 'GENERAL_COMPUTE_JOB',
  artifact_digest: artifact,
  capabilities: ['GENERAL_CPU'],
  handler: async ({ resource_budget }) => ({ cpu_budget_seen: resource_budget.cpu_limit_percent })
});

const assignment = {
  schema: FABRIC_ASSIGNMENT_SCHEMA,
  fabric_version: '2.1.0',
  workload_id: 'side-workload',
  slice_id: 'side-workload:r000000',
  provider_id: 'side-provider',
  provider_job_id: null,
  task_type: 'GENERAL_COMPUTE_JOB',
  route_class: 'DATACENTER',
  artifact_digest: artifact,
  requirements: { resource_class: 'CPU', min_logical_cores: 1, min_memory_mb: 0, min_vram_mb: 0, required_capabilities: ['GENERAL_CPU'] },
  payload: { value: 1 },
  lease_id: 'lease-policy-1',
  lease_expires_at_ms: Date.now() + 10_000,
  execution_budget: { cpu_limit_percent: 50, gpu_limit_percent: 10, max_temp_c: 80, max_watts: 200, max_concurrent: 2 },
  scheduling_basis: 'CONSENT_RESOURCE_POLICY_PROVIDER_CAPACITY_WORKLOAD_ADMISSION_AND_DESKTOP_TELEMETRY',
  game_event_weighting: 'FORBIDDEN',
  game_effect: 'NONE'
};
const policyResult = await boundAgent.executeAssignment(assignment);
assert.equal(policyResult.ok, true);
assert.equal(policyResult.output.cpu_budget_seen <= 20, true);

console.log('HELIOS PRIMARY_MISSION + BOUNDED_SIDE_QUESTS + safe learning invariants: PASS');
