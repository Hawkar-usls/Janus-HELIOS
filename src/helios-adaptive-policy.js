import {
  assertNoGameCoupling,
  assertNoClientSecrets
} from './helios-router.js';
import { HeliosDesktopAgentRuntime } from './helios-desktop-agent.js';

export const HELIOS_ADAPTIVE_POLICY_VERSION = '1.0.0';
export const POLICY_MEMORY_SCHEMA = 'janus.helios.adaptive-policy.memory.v1';
export const POLICY_EVENT_SCHEMA = 'janus.helios.adaptive-policy.event.v1';
export const ACCELERATION_STATES = Object.freeze(['CANDIDATE', 'VERIFIED', 'PROMOTED', 'REJECTED']);
export const PRESSURE_STATES = Object.freeze(['NORMAL', 'CONSTRAINED', 'CRITICAL']);
export const MISSION_CLASSES = Object.freeze(['PRIMARY', 'SIDE_QUEST']);

const SAFE_LEARNABLE_KEYS = new Set([
  'batch_size',
  'side_quest_budget_percent',
  'concurrency_hint',
  'poll_interval_ms',
  'retry_backoff_ms',
  'prefetch_depth',
  'provider_preference_bias'
]);

const FORBIDDEN_POLICY_KEYS = new Set([
  'artifact_digest', 'artifact_sha256', 'task_type', 'route_class',
  'verification', 'verifier', 'signature', 'private_key', 'secret',
  'password', 'api_key', 'access_token', 'authorization',
  'rng', 'rtp', 'bet', 'odds', 'payout', 'bonus_probability',
  'personal_jackpot_weight', 'command', 'shell', 'script', 'eval', 'exec', 'spawn'
]);

function clone(value) { return structuredClone(value); }
function clamp(value, min, max) { return Math.max(min, Math.min(max, Number(value))); }
function finite(value, fallback = 0) { return Number.isFinite(Number(value)) ? Number(value) : fallback; }
function stableId(value, label, max = 160) {
  const s = String(value || '');
  if (!s || s.length > max || !/^[A-Za-z0-9_.:/@+-]+$/.test(s)) throw new Error(`${label}_INVALID`);
  return s;
}
function assertObject(value, label) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error(`${label}_MUST_BE_OBJECT`);
}
function walkPolicy(value, path = 'policy') {
  if (!value || typeof value !== 'object') return;
  for (const [key, nested] of Object.entries(value)) {
    const normalized = String(key).toLowerCase();
    if (FORBIDDEN_POLICY_KEYS.has(normalized)) throw new Error(`IMMUTABLE_TRUTH_KEY_FORBIDDEN:${path}.${key}`);
    walkPolicy(nested, `${path}.${key}`);
  }
}
function validateLearnablePolicy(policy) {
  assertObject(policy, 'LEARNABLE_POLICY');
  assertNoGameCoupling(policy, 'learnable_policy');
  assertNoClientSecrets(policy, 'learnable_policy');
  walkPolicy(policy);
  for (const key of Object.keys(policy)) {
    if (!SAFE_LEARNABLE_KEYS.has(key)) throw new Error(`UNAPPROVED_LEARNABLE_POLICY_KEY:${key}`);
  }
  return clone(policy);
}
function canonicalBytes(value) {
  if (value instanceof Uint8Array) return value;
  if (value instanceof ArrayBuffer) return new Uint8Array(value);
  if (typeof value === 'string') return new TextEncoder().encode(value);
  const stable = (v) => {
    if (Array.isArray(v)) return v.map(stable);
    if (v && typeof v === 'object') {
      return Object.fromEntries(Object.keys(v).sort().map(k => [k, stable(v[k])]));
    }
    return v;
  };
  return new TextEncoder().encode(JSON.stringify(stable(value)));
}
function bytesEqual(a, b) {
  const x = canonicalBytes(a), y = canonicalBytes(b);
  if (x.length !== y.length) return false;
  let diff = 0;
  for (let i = 0; i < x.length; i += 1) diff |= x[i] ^ y[i];
  return diff === 0;
}

export function classifyPressure(telemetry = {}, policy = {}) {
  const temperature = finite(telemetry.temperature_c, 0);
  const cpuLoad = clamp(finite(telemetry.cpu_load, 0), 0, 1);
  const gpuLoad = clamp(finite(telemetry.gpu_load, 0), 0, 1);
  const watts = Math.max(0, finite(telemetry.estimated_watts, 0));
  const battery = telemetry.battery_percent == null ? null : clamp(telemetry.battery_percent, 0, 100);
  const onAc = telemetry.on_ac_power !== false;

  const criticalTemp = finite(policy.critical_temp_c, 88);
  const constrainedTemp = finite(policy.constrained_temp_c, 78);
  const criticalLoad = clamp(finite(policy.critical_load, 0.96), 0, 1);
  const constrainedLoad = clamp(finite(policy.constrained_load, 0.82), 0, 1);
  const powerCap = Math.max(0, finite(policy.max_watts, 0));
  const batteryFloor = clamp(finite(policy.battery_floor_percent, 25), 0, 100);

  if (
    (temperature > 0 && temperature >= criticalTemp) ||
    Math.max(cpuLoad, gpuLoad) >= criticalLoad ||
    (powerCap > 0 && watts >= powerCap) ||
    (battery != null && !onAc && battery <= batteryFloor)
  ) return 'CRITICAL';

  if (
    (temperature > 0 && temperature >= constrainedTemp) ||
    Math.max(cpuLoad, gpuLoad) >= constrainedLoad ||
    (powerCap > 0 && watts >= powerCap * 0.85) ||
    (battery != null && !onAc && battery <= batteryFloor + 15)
  ) return 'CONSTRAINED';

  return 'NORMAL';
}

export class MissionBudgetController {
  constructor({
    primary = {},
    side_quest = {},
    pressure = {}
  } = {}) {
    this.primary = {
      provider_ids: new Set((primary.provider_ids || []).map(x => stableId(x, 'PRIMARY_PROVIDER_ID'))),
      task_types: new Set((primary.task_types || []).map(String)),
      capability_tags: new Set((primary.capability_tags || []).map(x => stableId(x, 'PRIMARY_CAPABILITY', 96)))
    };
    this.sideQuest = {
      enabled: side_quest.enabled !== false,
      max_cpu_percent: clamp(finite(side_quest.max_cpu_percent, 15), 1, 100),
      max_gpu_percent: clamp(finite(side_quest.max_gpu_percent, 15), 1, 100),
      max_concurrent: Math.max(0, Math.floor(finite(side_quest.max_concurrent, 1))),
      window_ms: Math.max(1_000, finite(side_quest.window_ms, 300_000)),
      runtime_budget_ms: Math.max(0, finite(side_quest.runtime_budget_ms, 60_000)),
      constrained_scale: clamp(finite(side_quest.constrained_scale, 0.25), 0, 1)
    };
    this.pressurePolicy = clone(pressure || {});
    this.windowStartedAt = 0;
    this.sideQuestRuntimeMs = 0;
  }

  classify(workload = {}) {
    const providerMatch = this.primary.provider_ids.size > 0 && this.primary.provider_ids.has(String(workload.provider_id || ''));
    const taskMatch = this.primary.task_types.size > 0 && this.primary.task_types.has(String(workload.task_type || workload.type || ''));
    const caps = new Set(workload.requirements?.required_capabilities || []);
    const capabilityMatch = this.primary.capability_tags.size > 0 && [...this.primary.capability_tags].some(x => caps.has(x));
    return providerMatch || taskMatch || capabilityMatch ? 'PRIMARY' : 'SIDE_QUEST';
  }

  resetWindowIfNeeded(now) {
    const t = finite(now, Date.now());
    if (!this.windowStartedAt || t - this.windowStartedAt >= this.sideQuest.window_ms) {
      this.windowStartedAt = t;
      this.sideQuestRuntimeMs = 0;
    }
  }

  recordRuntime(ms, now = Date.now()) {
    this.resetWindowIfNeeded(now);
    this.sideQuestRuntimeMs += Math.max(0, finite(ms, 0));
  }

  decide({ workload, telemetry = {}, active_side_quests = 0, now = Date.now() } = {}) {
    assertObject(workload, 'WORKLOAD');
    assertNoGameCoupling(workload, 'mission_workload');
    assertNoClientSecrets(workload, 'mission_workload');
    this.resetWindowIfNeeded(now);

    const missionClass = this.classify(workload);
    const pressure = classifyPressure(telemetry, this.pressurePolicy);

    if (missionClass === 'PRIMARY') {
      return Object.freeze({
        admitted: true,
        mission_class: 'PRIMARY',
        pressure,
        reason: 'PRIMARY_MISSION_PROTECTED',
        side_quest_scale: 0,
        priority_protected: true,
        safety_gates_still_authoritative: true
      });
    }

    if (!this.sideQuest.enabled) return Object.freeze({ admitted: false, mission_class: 'SIDE_QUEST', pressure, reason: 'SIDE_QUESTS_DISABLED' });
    if (pressure === 'CRITICAL') return Object.freeze({ admitted: false, mission_class: 'SIDE_QUEST', pressure, reason: 'QUIET_CANARY_CRITICAL_PRESSURE' });
    if (Number(active_side_quests) >= this.sideQuest.max_concurrent) return Object.freeze({ admitted: false, mission_class: 'SIDE_QUEST', pressure, reason: 'SIDE_QUEST_CONCURRENCY_BUDGET_EXHAUSTED' });
    if (this.sideQuestRuntimeMs >= this.sideQuest.runtime_budget_ms) return Object.freeze({ admitted: false, mission_class: 'SIDE_QUEST', pressure, reason: 'SIDE_QUEST_TIME_BUDGET_EXHAUSTED' });

    const scale = pressure === 'CONSTRAINED' ? this.sideQuest.constrained_scale : 1;
    return Object.freeze({
      admitted: true,
      mission_class: 'SIDE_QUEST',
      pressure,
      reason: pressure === 'CONSTRAINED' ? 'QUIET_CANARY_THROTTLED' : 'SIDE_QUEST_WITHIN_BUDGET',
      side_quest_scale: scale,
      execution_budget_cap: Object.freeze({
        cpu_limit_percent: Math.max(1, this.sideQuest.max_cpu_percent * scale),
        gpu_limit_percent: Math.max(1, this.sideQuest.max_gpu_percent * scale),
        max_concurrent: 1
      }),
      priority_protected: false,
      safety_gates_still_authoritative: true
    });
  }

  snapshot(now = Date.now()) {
    this.resetWindowIfNeeded(now);
    return {
      window_started_at_ms: this.windowStartedAt,
      side_quest_runtime_ms: this.sideQuestRuntimeMs,
      side_quest_runtime_budget_ms: this.sideQuest.runtime_budget_ms
    };
  }
}

export class SafeActionBandit {
  constructor({ arms, exploration = 0.10, learning_rate = 0.18, decay = 0.985, random = Math.random } = {}) {
    if (!Array.isArray(arms) || arms.length < 2) throw new Error('AT_LEAST_TWO_SAFE_ARMS_REQUIRED');
    this.random = random;
    this.exploration = clamp(exploration, 0, 1);
    this.learningRate = clamp(learning_rate, 0.001, 2);
    this.decay = clamp(decay, 0.5, 1);
    this.arms = arms.map((arm) => {
      assertObject(arm, 'BANDIT_ARM');
      return Object.freeze({
        id: stableId(arm.id, 'ARM_ID', 96),
        policy: Object.freeze(validateLearnablePolicy(arm.policy || {}))
      });
    });
    if (new Set(this.arms.map(x => x.id)).size !== this.arms.length) throw new Error('DUPLICATE_ARM_ID');
    this.weights = new Map(this.arms.map(a => [a.id, 1]));
    this.observations = 0;
  }

  choose() {
    if (this.random() < this.exploration) {
      const index = Math.min(this.arms.length - 1, Math.floor(this.random() * this.arms.length));
      return clone(this.arms[index]);
    }
    const total = [...this.weights.values()].reduce((n, x) => n + x, 0);
    let cursor = this.random() * total;
    for (const arm of this.arms) {
      cursor -= this.weights.get(arm.id);
      if (cursor <= 0) return clone(arm);
    }
    return clone(this.arms.at(-1));
  }

  observe(armId, reward) {
    const id = stableId(armId, 'ARM_ID', 96);
    if (!this.weights.has(id)) throw new Error('UNKNOWN_ARM');
    const boundedReward = clamp(reward, -1, 1);
    for (const [key, weight] of this.weights) {
      this.weights.set(key, 1 + (weight - 1) * this.decay);
    }
    const current = this.weights.get(id);
    const next = current * Math.exp(this.learningRate * boundedReward);
    this.weights.set(id, clamp(next, 0.05, 100));
    this.observations += 1;
    return this.snapshot();
  }

  snapshot() {
    return {
      schema: POLICY_MEMORY_SCHEMA,
      version: HELIOS_ADAPTIVE_POLICY_VERSION,
      arm_ids: this.arms.map(a => a.id),
      weights: Object.fromEntries(this.weights),
      observations: this.observations
    };
  }

  restore(snapshot) {
    assertObject(snapshot, 'BANDIT_MEMORY');
    if (snapshot.schema !== POLICY_MEMORY_SCHEMA) throw new Error('UNSUPPORTED_POLICY_MEMORY_SCHEMA');
    const expected = this.arms.map(a => a.id);
    if (JSON.stringify(snapshot.arm_ids) !== JSON.stringify(expected)) throw new Error('SAFE_ARM_SET_MISMATCH');
    for (const id of expected) {
      const weight = Number(snapshot.weights?.[id]);
      if (!Number.isFinite(weight) || weight <= 0) throw new Error('INVALID_PERSISTED_WEIGHT');
      this.weights.set(id, clamp(weight, 0.05, 100));
    }
    this.observations = Math.max(0, Math.floor(finite(snapshot.observations, 0)));
    return this.snapshot();
  }
}

export class ThrottledPolicyMemory {
  constructor({ load, save, min_save_interval_ms = 300_000 } = {}) {
    if (typeof load !== 'function' || typeof save !== 'function') throw new Error('POLICY_MEMORY_ADAPTER_REQUIRED');
    this.loadFn = load;
    this.saveFn = save;
    this.minSaveIntervalMs = Math.max(1_000, finite(min_save_interval_ms, 300_000));
    this.lastSavedAt = 0;
  }

  async load() {
    const value = await this.loadFn();
    if (value == null) return null;
    assertNoGameCoupling(value, 'policy_memory');
    assertNoClientSecrets(value, 'policy_memory');
    walkPolicy(value, 'policy_memory');
    return clone(value);
  }

  async saveIfDue(value, { now = Date.now(), force = false } = {}) {
    assertNoGameCoupling(value, 'policy_memory');
    assertNoClientSecrets(value, 'policy_memory');
    walkPolicy(value, 'policy_memory');
    if (!force && this.lastSavedAt && Number(now) - this.lastSavedAt < this.minSaveIntervalMs) return false;
    await this.saveFn(clone(value));
    this.lastSavedAt = Number(now);
    return true;
  }
}

export class SelfTestedAccelerationGate {
  constructor({ stable_handler, candidate_handler, min_gain_percent = 3, crosscheck_every = 4096, comparator = bytesEqual } = {}) {
    if (typeof stable_handler !== 'function' || typeof candidate_handler !== 'function') throw new Error('STABLE_AND_CANDIDATE_HANDLERS_REQUIRED');
    this.stable = stable_handler;
    this.candidate = candidate_handler;
    this.minGainPercent = Math.max(0, finite(min_gain_percent, 3));
    this.crosscheckEvery = Math.max(1, Math.floor(finite(crosscheck_every, 4096)));
    this.comparator = comparator;
    this.state = 'CANDIDATE';
    this.invocations = 0;
    this.lastQualification = null;
  }

  async qualify(cases, { clock = () => performance.now(), rounds = 1 } = {}) {
    if (!Array.isArray(cases) || cases.length === 0) throw new Error('SELF_TEST_CASES_REQUIRED');
    for (const input of cases) {
      const truth = await this.stable(clone(input));
      const candidate = await this.candidate(clone(input));
      if (!this.comparator(truth, candidate)) {
        this.state = 'REJECTED';
        this.lastQualification = { equivalent: false, promoted: false, reason: 'BYTE_EQUIVALENCE_FAILED' };
        return clone(this.lastQualification);
      }
    }
    this.state = 'VERIFIED';

    const loops = Math.max(1, Math.floor(rounds));
    const benchInput = clone(cases[0]);
    let start = clock();
    for (let i = 0; i < loops; i += 1) await this.stable(clone(benchInput));
    const stableMs = Math.max(0.000001, clock() - start);
    start = clock();
    for (let i = 0; i < loops; i += 1) await this.candidate(clone(benchInput));
    const candidateMs = Math.max(0.000001, clock() - start);
    const gainPercent = ((stableMs - candidateMs) / stableMs) * 100;
    const promoted = gainPercent >= this.minGainPercent;
    this.state = promoted ? 'PROMOTED' : 'VERIFIED';
    this.lastQualification = { equivalent: true, promoted, stable_ms: stableMs, candidate_ms: candidateMs, gain_percent: gainPercent, reason: promoted ? 'SELF_TESTED_ACCELERATION_PROMOTED' : 'GAIN_BELOW_THRESHOLD' };
    return clone(this.lastQualification);
  }

  async execute(input) {
    this.invocations += 1;
    if (this.state !== 'PROMOTED') return this.stable(clone(input));
    try {
      const fast = await this.candidate(clone(input));
      if (this.invocations % this.crosscheckEvery === 0) {
        const truth = await this.stable(clone(input));
        if (!this.comparator(truth, fast)) {
          this.state = 'REJECTED';
          return truth;
        }
      }
      return fast;
    } catch (_) {
      this.state = 'REJECTED';
      return this.stable(clone(input));
    }
  }

  snapshot() {
    return { state: this.state, invocations: this.invocations, last_qualification: clone(this.lastQualification) };
  }
}

export class AdaptivePolicyReporter {
  constructor({ node_id, sink = null } = {}) {
    this.nodeId = stableId(node_id, 'NODE_ID');
    this.sink = sink;
    this.sequence = 0;
  }

  async emit(kind, payload = {}, at = Date.now()) {
    assertNoGameCoupling(payload, 'policy_event');
    assertNoClientSecrets(payload, 'policy_event');
    walkPolicy(payload, 'policy_event');
    const event = Object.freeze({
      schema: POLICY_EVENT_SCHEMA,
      version: HELIOS_ADAPTIVE_POLICY_VERSION,
      node_id: this.nodeId,
      sequence: ++this.sequence,
      at_ms: Number(at),
      kind: stableId(kind, 'EVENT_KIND', 96),
      payload: Object.freeze(clone(payload))
    });
    if (typeof this.sink === 'function') await this.sink(clone(event));
    return event;
  }
}

export class HeliosAdaptivePolicyPlane {
  constructor({ node_id, mission, bandit_arms, bandit = {}, memory = null, report_sink = null } = {}) {
    this.mission = new MissionBudgetController(mission || {});
    this.bandit = new SafeActionBandit({ arms: bandit_arms, ...bandit });
    this.memory = memory;
    this.reporter = new AdaptivePolicyReporter({ node_id, sink: report_sink });
  }

  async restore() {
    if (!this.memory) return false;
    const snapshot = await this.memory.load();
    if (!snapshot) return false;
    this.bandit.restore(snapshot);
    await this.reporter.emit('POLICY_MEMORY_RESTORED', { observations: this.bandit.observations });
    return true;
  }

  async decide({ workload, telemetry, active_side_quests = 0, now = Date.now() } = {}) {
    const mission = this.mission.decide({ workload, telemetry, active_side_quests, now });
    let arm = null;
    if (mission.admitted) arm = this.bandit.choose();
    await this.reporter.emit(mission.admitted ? 'WORKLOAD_POLICY_ADMIT' : 'WORKLOAD_POLICY_DECLINE', {
      mission_class: mission.mission_class,
      pressure: mission.pressure,
      reason: mission.reason,
      arm_id: arm?.id || null
    }, now);
    return { mission, arm };
  }

  async observe({ arm_id, reward, side_quest_runtime_ms = 0, now = Date.now(), force_save = false } = {}) {
    const snapshot = this.bandit.observe(arm_id, reward);
    if (side_quest_runtime_ms > 0) this.mission.recordRuntime(side_quest_runtime_ms, now);
    const saved = this.memory ? await this.memory.saveIfDue(snapshot, { now, force: force_save }) : false;
    await this.reporter.emit('POLICY_OUTCOME', { arm_id, reward: clamp(reward, -1, 1), persisted: saved }, now);
    return { snapshot, persisted: saved };
  }

  snapshot(now = Date.now()) {
    return {
      version: HELIOS_ADAPTIVE_POLICY_VERSION,
      mission: this.mission.snapshot(now),
      bandit: this.bandit.snapshot()
    };
  }
}

export class HeliosPolicyBoundDesktopAgent extends HeliosDesktopAgentRuntime {
  constructor({ adaptive_policy_plane, ...agentOptions } = {}) {
    super(agentOptions);
    if (!(adaptive_policy_plane instanceof HeliosAdaptivePolicyPlane)) throw new Error('ADAPTIVE_POLICY_PLANE_REQUIRED');
    this.adaptivePolicy = adaptive_policy_plane;
    this.activeSideQuests = 0;
  }

  async executeAssignment(assignment) {
    const telemetry = await this.telemetry();
    const decision = await this.adaptivePolicy.decide({
      workload: assignment,
      telemetry,
      active_side_quests: this.activeSideQuests,
      now: Date.now()
    });
    if (!decision.mission.admitted) throw new Error(`ADAPTIVE_POLICY_DECLINED:${decision.mission.reason}`);

    const bounded = clone(assignment);
    if (decision.mission.mission_class === 'SIDE_QUEST') {
      this.activeSideQuests += 1;
      const cap = decision.mission.execution_budget_cap || {};
      if (bounded.execution_budget) {
        bounded.execution_budget.cpu_limit_percent = Math.min(bounded.execution_budget.cpu_limit_percent, cap.cpu_limit_percent ?? bounded.execution_budget.cpu_limit_percent);
        bounded.execution_budget.gpu_limit_percent = Math.min(bounded.execution_budget.gpu_limit_percent, cap.gpu_limit_percent ?? bounded.execution_budget.gpu_limit_percent);
        bounded.execution_budget.max_concurrent = Math.min(bounded.execution_budget.max_concurrent, cap.max_concurrent ?? bounded.execution_budget.max_concurrent);
      }
    }

    const started = Date.now();
    try {
      const result = await super.executeAssignment(bounded);
      const elapsed = Math.max(0, Date.now() - started);
      if (decision.arm) {
        await this.adaptivePolicy.observe({
          arm_id: decision.arm.id,
          reward: result.ok === true ? 1 : -1,
          side_quest_runtime_ms: decision.mission.mission_class === 'SIDE_QUEST' ? elapsed : 0,
          now: Date.now()
        });
      }
      return result;
    } finally {
      if (decision.mission.mission_class === 'SIDE_QUEST') this.activeSideQuests = Math.max(0, this.activeSideQuests - 1);
    }
  }
}
