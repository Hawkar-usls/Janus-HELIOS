import os from 'node:os';
import {
  TASK_TYPES,
  assertNoGameCoupling,
  assertNoClientSecrets
} from './helios-router.js';
import {
  FABRIC_ASSIGNMENT_SCHEMA,
  RESOURCE_CLASSES
} from './helios-desktop-fabric.js';
import {
  HeliosHardwareGuardian,
  assertHardwareOnlyTelemetry,
  tightenExecutionBudgetForGuardian
} from './helios-hardware-guardian.js';

export const HELIOS_DESKTOP_AGENT_VERSION = '1.2.0';
export const DESKTOP_AGENT_RESULT_SCHEMA = 'janus.helios.desktop-agent.result.v1';

const FORBIDDEN_KEYS = new Set([
  'shell', 'command', 'cmd', 'powershell', 'script', 'eval', 'exec', 'spawn',
  'private_key', 'wallet_seed', 'seed_phrase', 'mnemonic', 'api_key',
  'access_token', 'refresh_token', 'authorization', 'password', 'secret'
]);

function assertObject(value, label) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error(`${label}_MUST_BE_OBJECT`);
}
function stableId(value, label, max = 192) {
  const s = String(value || '');
  if (!s || s.length > max || !/^[A-Za-z0-9_.:/@+-]+$/.test(s)) throw new Error(`${label}_INVALID`);
  return s;
}
function boundedNumber(value, label, { min = 0, max = Number.MAX_SAFE_INTEGER } = {}) {
  const n = Number(value);
  if (!Number.isFinite(n) || n < min || n > max) throw new Error(`${label}_OUT_OF_RANGE`);
  return n;
}
function normalizeDigest(value) {
  const s = String(value || '').toLowerCase();
  if (!/^(sha256:)?[a-f0-9]{64}$/.test(s)) throw new Error('ARTIFACT_DIGEST_SHA256_REQUIRED');
  return s.startsWith('sha256:') ? s : `sha256:${s}`;
}
function walkForbidden(value, path = 'root') {
  if (!value || typeof value !== 'object') return;
  for (const [key, nested] of Object.entries(value)) {
    if (FORBIDDEN_KEYS.has(String(key).toLowerCase())) throw new Error(`ARBITRARY_EXECUTION_OR_SECRET_FORBIDDEN:${path}.${key}`);
    walkForbidden(nested, `${path}.${key}`);
  }
}
function clone(value) { return structuredClone(value); }

function normalizeExecutionBudget(input) {
  assertObject(input, 'EXECUTION_BUDGET');
  return {
    cpu_limit_percent: boundedNumber(input.cpu_limit_percent, 'CPU_LIMIT_PERCENT', { min: 1, max: 100 }),
    gpu_limit_percent: boundedNumber(input.gpu_limit_percent, 'GPU_LIMIT_PERCENT', { min: 1, max: 100 }),
    max_temp_c: boundedNumber(input.max_temp_c, 'MAX_TEMP_C', { min: 40, max: 100 }),
    max_watts: boundedNumber(input.max_watts ?? 0, 'MAX_WATTS', { min: 0, max: 100_000 }),
    max_concurrent: boundedNumber(input.max_concurrent, 'MAX_CONCURRENT', { min: 1, max: 64 })
  };
}

function optionalMetric(value) {
  if (value == null || value === '') return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

export class DesktopExecutorRegistry {
  constructor() { this.executors = new Map(); }

  register({ provider_id, task_type, artifact_digest, capabilities = [], handler }) {
    const providerId = stableId(provider_id, 'PROVIDER_ID');
    if (!TASK_TYPES.includes(task_type)) throw new Error(`UNSUPPORTED_TASK_TYPE:${task_type}`);
    const artifactDigest = normalizeDigest(artifact_digest);
    if (typeof handler !== 'function') throw new Error('EXECUTOR_HANDLER_REQUIRED');
    const key = `${providerId}|${task_type}|${artifactDigest}`;
    if (this.executors.has(key)) throw new Error('DUPLICATE_EXECUTOR');
    const entry = Object.freeze({
      provider_id: providerId,
      task_type,
      artifact_digest: artifactDigest,
      capabilities: Object.freeze([...new Set((capabilities || []).map(x => stableId(x, 'CAPABILITY', 96)))]),
      handler
    });
    this.executors.set(key, entry);
    return entry;
  }

  resolve({ provider_id, task_type, artifact_digest }) {
    const key = `${String(provider_id)}|${String(task_type)}|${normalizeDigest(artifact_digest)}`;
    return this.executors.get(key) || null;
  }

  capabilities() {
    return [...new Set([...this.executors.values()].flatMap(x => x.capabilities))].sort();
  }
}

export class HeliosDesktopAgentRuntime {
  constructor({
    agent_id,
    resource_policy = {},
    gpu_inventory = [],
    extra_capabilities = [],
    telemetry_provider = null,
    result_sink = null
  } = {}) {
    this.agentId = stableId(agent_id, 'AGENT_ID');
    this.registry = new DesktopExecutorRegistry();
    this.policy = {
      compute_consent: resource_policy.compute_consent === true,
      allow_cpu: resource_policy.allow_cpu !== false,
      allow_gpu: resource_policy.allow_gpu === true,
      cpu_limit_percent: Math.max(1, Math.min(100, Number(resource_policy.cpu_limit_percent ?? 25))),
      gpu_limit_percent: Math.max(1, Math.min(100, Number(resource_policy.gpu_limit_percent ?? 25))),
      max_concurrent: Math.max(1, Math.min(16, Math.floor(Number(resource_policy.max_concurrent || 1)))),
      max_temp_c: Math.max(45, Math.min(95, Number(resource_policy.max_temp_c || 80))),
      max_watts: Math.max(0, Number(resource_policy.max_watts || 0)),
      battery_allowed: resource_policy.battery_allowed === true,
      min_battery_percent: Math.max(5, Math.min(100, Number(resource_policy.min_battery_percent ?? 40))),
      hardware_guardian_enabled: resource_policy.hardware_guardian_enabled !== false,
      missing_thermal_sensor_action: String(resource_policy.missing_thermal_sensor_action || 'LIMIT').toUpperCase(),
      immediate_revoke: resource_policy.immediate_revoke !== false
    };
    this.gpuInventory = clone(Array.isArray(gpu_inventory) ? gpu_inventory : []);
    this.extraCapabilities = [...new Set((extra_capabilities || []).map(x => stableId(x, 'CAPABILITY', 96)))];
    this.telemetryProvider = telemetry_provider;
    this.resultSink = result_sink;
    this.revoked = false;
    this.inflight = 0;
    this.guardian = new HeliosHardwareGuardian({
      enabled: this.policy.hardware_guardian_enabled,
      max_temp_c: this.policy.max_temp_c,
      max_watts: this.policy.max_watts,
      battery_allowed: this.policy.battery_allowed,
      min_battery_percent: this.policy.min_battery_percent,
      missing_thermal_sensor_action: this.policy.missing_thermal_sensor_action,
      thermal_margin_c: resource_policy.thermal_margin_c,
      thermal_recovery_margin_c: resource_policy.thermal_recovery_margin_c,
      vendor_safety_margin_c: resource_policy.vendor_safety_margin_c,
      max_temp_rise_c_per_min: resource_policy.max_temp_rise_c_per_min,
      min_available_memory_mb: resource_policy.min_available_memory_mb,
      min_available_vram_mb: resource_policy.min_available_vram_mb,
      max_host_cpu_load_percent: resource_policy.max_host_cpu_load_percent,
      max_host_gpu_load_percent: resource_policy.max_host_gpu_load_percent,
      cooldown_hold_ms: resource_policy.cooldown_hold_ms
    });
  }

  registerExecutor(spec) { return this.registry.register(spec); }

  grantConsent() {
    if (!this.revoked) this.policy.compute_consent = true;
  }

  revoke() {
    this.revoked = true;
    this.policy.compute_consent = false;
    return true;
  }

  async telemetry() {
    const external = typeof this.telemetryProvider === 'function' ? await this.telemetryProvider() : {};
    assertHardwareOnlyTelemetry(external || {});
    return {
      cpu_load: Number(external?.cpu_load ?? 0),
      gpu_load: Number(external?.gpu_load ?? 0),
      temperature_c: optionalMetric(external?.temperature_c),
      cpu_temperature_c: optionalMetric(external?.cpu_temperature_c),
      gpu_temperature_c: optionalMetric(external?.gpu_temperature_c),
      gpu_hotspot_temperature_c: optionalMetric(external?.gpu_hotspot_temperature_c),
      vram_temperature_c: optionalMetric(external?.vram_temperature_c),
      vendor_slowdown_temp_c: optionalMetric(external?.vendor_slowdown_temp_c),
      vendor_shutdown_temp_c: optionalMetric(external?.vendor_shutdown_temp_c),
      battery_percent: optionalMetric(external?.battery_percent),
      on_ac_power: external?.on_ac_power !== false,
      available_memory_mb: Math.round(os.freemem() / 1024 / 1024),
      available_vram_mb: Math.max(0, Number(external?.available_vram_mb || 0)),
      estimated_watts: Math.max(0, Number(external?.estimated_watts || external?.power_w || 0)),
      power_limit_w: optionalMetric(external?.power_limit_w),
      fan_percent: optionalMetric(external?.fan_percent),
      latency_ms: Math.max(0, Number(external?.latency_ms || 0)),
      reliability: Math.max(0, Math.min(1, Number(external?.reliability ?? 0.5))),
      telemetry_scope: 'HARDWARE_ONLY',
      human_observation: 'FORBIDDEN'
    };
  }

  async heartbeatPayload({ session_id = '' } = {}) {
    const telemetry = await this.telemetry();
    const capabilities = [...new Set([
      'GENERAL_CPU',
      ...(this.gpuInventory.length ? ['GENERAL_GPU'] : []),
      'HARDWARE_GUARDIAN',
      ...this.extraCapabilities,
      ...this.registry.capabilities()
    ])].sort();
    const resourceClass = this.policy.allow_gpu && this.gpuInventory.length ? (this.policy.allow_cpu ? 'HYBRID' : 'GPU') : 'CPU';
    const guardian = this.guardian.evaluate(telemetry, { resource_class: resourceClass });
    return {
      agent_id: this.agentId,
      session_id: String(session_id),
      platform: os.platform(),
      architecture: os.arch(),
      logical_cores: Math.max(1, os.cpus().length),
      memory_mb: Math.round(os.totalmem() / 1024 / 1024),
      capabilities,
      gpus: clone(this.gpuInventory),
      resource_policy: clone(this.policy),
      telemetry,
      hardware_guardian: clone(guardian),
      revoked: this.revoked
    };
  }

  assertControllerBudget(budget) {
    if (budget.cpu_limit_percent > this.policy.cpu_limit_percent) throw new Error('CONTROLLER_CPU_BUDGET_EXCEEDS_AGENT_POLICY');
    if (budget.gpu_limit_percent > this.policy.gpu_limit_percent) throw new Error('CONTROLLER_GPU_BUDGET_EXCEEDS_AGENT_POLICY');
    if (budget.max_temp_c > this.policy.max_temp_c) throw new Error('CONTROLLER_THERMAL_BUDGET_EXCEEDS_AGENT_POLICY');
    if (budget.max_concurrent > this.policy.max_concurrent) throw new Error('CONTROLLER_CONCURRENCY_BUDGET_EXCEEDS_AGENT_POLICY');
    if (this.policy.max_watts > 0 && (budget.max_watts === 0 || budget.max_watts > this.policy.max_watts)) throw new Error('CONTROLLER_POWER_BUDGET_EXCEEDS_AGENT_POLICY');
  }

  assertAssignmentAllowed(assignment, telemetry, at = Date.now()) {
    assertObject(assignment, 'ASSIGNMENT');
    assertNoGameCoupling(assignment, 'assignment');
    assertNoClientSecrets(assignment, 'assignment');
    walkForbidden(assignment, 'assignment');
    if (assignment.schema !== FABRIC_ASSIGNMENT_SCHEMA) throw new Error('UNSUPPORTED_ASSIGNMENT_SCHEMA');
    if (!String(assignment.lease_id || '')) throw new Error('LEASE_ID_REQUIRED');
    if (!Number.isFinite(Number(assignment.lease_expires_at_ms))) throw new Error('LEASE_EXPIRY_REQUIRED');
    if (Number(at) > Number(assignment.lease_expires_at_ms)) throw new Error('ASSIGNMENT_LEASE_EXPIRED');
    if (assignment.game_event_weighting !== 'FORBIDDEN' || assignment.game_effect !== 'NONE') throw new Error('GAME_COMPUTE_BOUNDARY_VIOLATION');
    if (!this.policy.compute_consent || this.revoked) throw new Error('COMPUTE_CONSENT_NOT_ACTIVE');
    if (this.inflight >= this.policy.max_concurrent) throw new Error('AGENT_CONCURRENCY_LIMIT');

    const budget = normalizeExecutionBudget(assignment.execution_budget);
    this.assertControllerBudget(budget);

    const resourceClass = String(assignment.requirements?.resource_class || 'CPU');
    if (!RESOURCE_CLASSES.includes(resourceClass)) throw new Error('INVALID_RESOURCE_CLASS');
    if ((resourceClass === 'CPU' || resourceClass === 'HYBRID') && !this.policy.allow_cpu) throw new Error('CPU_NOT_ALLOWED_BY_AGENT_POLICY');
    if ((resourceClass === 'GPU' || resourceClass === 'HYBRID') && (!this.policy.allow_gpu || this.gpuInventory.length === 0)) throw new Error('GPU_NOT_ALLOWED_OR_UNAVAILABLE');

    if (os.cpus().length < Number(assignment.requirements?.min_logical_cores || 1)) throw new Error('LOCAL_CPU_CAPACITY_CHANGED');
    if (telemetry.available_memory_mb < Number(assignment.requirements?.min_memory_mb || 0)) throw new Error('LOCAL_MEMORY_CAPACITY_CHANGED');
    if (telemetry.available_vram_mb < Number(assignment.requirements?.min_vram_mb || 0)) throw new Error('LOCAL_VRAM_CAPACITY_CHANGED');
    if (Number.isFinite(telemetry.temperature_c) && telemetry.temperature_c >= Math.min(this.policy.max_temp_c, budget.max_temp_c)) throw new Error('THERMAL_POLICY_BLOCK');
    const effectiveWatts = this.policy.max_watts > 0 && budget.max_watts > 0 ? Math.min(this.policy.max_watts, budget.max_watts) : Math.max(this.policy.max_watts, budget.max_watts);
    if (effectiveWatts > 0 && telemetry.estimated_watts > effectiveWatts) throw new Error('POWER_BUDGET_BLOCK');
    if (telemetry.battery_percent != null && telemetry.on_ac_power === false && !this.policy.battery_allowed) throw new Error('BATTERY_POLICY_BLOCK');

    const guardian = this.guardian.evaluate(telemetry, { resource_class: resourceClass, now_ms: at });
    if (!guardian.allow_execution) throw new Error(`HARDWARE_GUARDIAN_BLOCK:${guardian.state}:${guardian.reasons[0] || 'UNSPECIFIED'}`);
    const guardedBudget = tightenExecutionBudgetForGuardian(budget, guardian);

    const executor = this.registry.resolve(assignment);
    if (!executor) throw new Error('APPROVED_EXECUTOR_NOT_FOUND_FOR_EXACT_ARTIFACT');
    const advertised = new Set([
      'GENERAL_CPU',
      ...(this.gpuInventory.length ? ['GENERAL_GPU'] : []),
      'HARDWARE_GUARDIAN',
      ...this.extraCapabilities,
      ...this.registry.capabilities()
    ]);
    for (const capability of assignment.requirements?.required_capabilities || []) {
      if (!advertised.has(capability)) throw new Error(`CAPABILITY_NOT_AVAILABLE:${capability}`);
    }
    return { executor, budget: guardedBudget, guardian };
  }

  async executeAssignment(assignment) {
    const telemetry = await this.telemetry();
    const { executor, budget, guardian } = this.assertAssignmentAllowed(assignment, telemetry);
    this.inflight += 1;
    const startedAt = Date.now();
    try {
      const output = await executor.handler({
        payload: clone(assignment.payload),
        assignment: clone(assignment),
        resource_budget: clone(budget),
        hardware_guardian: clone(guardian)
      });
      assertNoGameCoupling(output || {}, 'executor_output');
      assertNoClientSecrets(output || {}, 'executor_output');
      walkForbidden(output || {}, 'executor_output');
      const result = {
        schema: DESKTOP_AGENT_RESULT_SCHEMA,
        runtime_version: HELIOS_DESKTOP_AGENT_VERSION,
        agent_id: this.agentId,
        workload_id: String(assignment.workload_id),
        slice_id: String(assignment.slice_id),
        lease_id: String(assignment.lease_id),
        provider_id: String(assignment.provider_id),
        task_type: String(assignment.task_type),
        artifact_digest: normalizeDigest(assignment.artifact_digest),
        ok: true,
        output: clone(output),
        hardware_guardian: {
          state: guardian.state,
          allowed_load_scale: guardian.allowed_load_scale,
          health_score: guardian.health_score,
          reasons: [...guardian.reasons],
          sensor_scope: guardian.sensor_scope,
          human_observation: guardian.human_observation
        },
        started_at_ms: startedAt,
        completed_at_ms: Date.now(),
        game_event_weighting: 'FORBIDDEN',
        game_effect: 'NONE'
      };
      if (typeof this.resultSink === 'function') await this.resultSink(clone(result));
      return result;
    } finally {
      this.inflight = Math.max(0, this.inflight - 1);
    }
  }
}
