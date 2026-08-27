import {
  ROUTE_CLASSES,
  TASK_TYPES,
  assertNoGameCoupling,
  assertNoClientSecrets
} from './helios-router.js';

export const HELIOS_DESKTOP_FABRIC_VERSION = '2.1.0';
export const FABRIC_ASSIGNMENT_SCHEMA = 'janus.helios.fabric.assignment.v2';
export const FABRIC_RECEIPT_SCHEMA = 'janus.helios.fabric.receipt.v2';

export const RESOURCE_CLASSES = Object.freeze(['CPU', 'GPU', 'HYBRID']);
export const SLICE_STATES = Object.freeze(['QUEUED', 'LEASED', 'RUNNING', 'VERIFYING', 'VERIFIED', 'FAILED', 'CANCELLED']);
export const WORKLOAD_STATES = Object.freeze(['QUEUED', 'RUNNING', 'COMPLETE', 'FAILED', 'CANCELLED']);

const FORBIDDEN_EXECUTION_KEYS = new Set([
  'shell', 'command', 'cmd', 'powershell', 'script', 'eval', 'exec', 'spawn',
  'private_key', 'wallet_seed', 'seed_phrase', 'mnemonic', 'api_key',
  'access_token', 'refresh_token', 'authorization', 'password', 'secret'
]);

const DEFAULTS = Object.freeze({
  agent_ttl_ms: 30_000,
  lease_ttl_ms: 45_000,
  ack_timeout_ms: 10_000,
  max_attempts: 5,
  max_agents: 10_000,
  max_workloads: 5_000,
  max_slices: 50_000,
  max_dispatch_per_tick: 512,
  max_agent_concurrency: 8,
  max_result_bytes: 64 * 1024 * 1024,
  thermal_soft_limit_c: 80,
  thermal_hard_limit_c: 90,
  battery_floor_percent: 25,
  provider_failure_threshold: 3,
  provider_cooldown_ms: 30_000,
  priority_aging_ms: 30_000
});

function clone(value) { return structuredClone(value); }
function assertObject(value, label) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error(`${label}_MUST_BE_OBJECT`);
}
function finite(value, label, { min = 0, max = Number.MAX_SAFE_INTEGER } = {}) {
  const n = Number(value);
  if (!Number.isFinite(n) || n < min || n > max) throw new Error(`${label}_OUT_OF_RANGE`);
  return n;
}
function stableId(value, label, max = 192) {
  const s = String(value || '');
  if (!s || s.length > max || !/^[A-Za-z0-9_.:/@+-]+$/.test(s)) throw new Error(`${label}_INVALID`);
  return s;
}
function digest(value, label = 'ARTIFACT_DIGEST') {
  const s = String(value || '').toLowerCase();
  if (!/^(sha256:)?[a-f0-9]{64}$/.test(s)) throw new Error(`${label}_SHA256_REQUIRED`);
  return s.startsWith('sha256:') ? s : `sha256:${s}`;
}
function walkForbidden(value, path = 'root') {
  if (!value || typeof value !== 'object') return;
  for (const [key, nested] of Object.entries(value)) {
    if (FORBIDDEN_EXECUTION_KEYS.has(String(key).toLowerCase())) throw new Error(`ARBITRARY_EXECUTION_OR_SECRET_FORBIDDEN:${path}.${key}`);
    walkForbidden(nested, `${path}.${key}`);
  }
}
function secureToken() {
  const c = globalThis.crypto;
  if (c?.randomUUID) return c.randomUUID();
  if (!c?.getRandomValues) throw new Error('SECURE_RANDOM_REQUIRED');
  const b = new Uint8Array(16); c.getRandomValues(b);
  return [...b].map(x => x.toString(16).padStart(2, '0')).join('');
}
function normalizeCapabilities(input = []) {
  if (!Array.isArray(input)) throw new Error('CAPABILITIES_REQUIRED');
  return [...new Set(input.map(x => stableId(x, 'CAPABILITY', 96)))].sort();
}
function normalizeGpus(input = []) {
  if (!Array.isArray(input)) throw new Error('GPUS_MUST_BE_ARRAY');
  return input.slice(0, 16).map((gpu, index) => {
    assertObject(gpu, `GPU_${index}`);
    return {
      id: stableId(gpu.id || `gpu-${index}`, 'GPU_ID', 96),
      vendor: String(gpu.vendor || 'unknown').slice(0, 64),
      model: String(gpu.model || 'unknown').slice(0, 128),
      vram_mb: finite(gpu.vram_mb || 0, 'GPU_VRAM_MB', { max: 1024 * 1024 }),
      capabilities: normalizeCapabilities(gpu.capabilities || [])
    };
  });
}
function normalizeResourcePolicy(input = {}) {
  assertObject(input, 'RESOURCE_POLICY');
  return {
    compute_consent: input.compute_consent === true,
    allow_cpu: input.allow_cpu !== false,
    allow_gpu: input.allow_gpu === true,
    cpu_limit_percent: Math.max(1, Math.min(100, Number(input.cpu_limit_percent ?? 25))),
    gpu_limit_percent: Math.max(1, Math.min(100, Number(input.gpu_limit_percent ?? 25))),
    max_concurrent: Math.max(1, Math.min(DEFAULTS.max_agent_concurrency, Math.floor(Number(input.max_concurrent || 1)))),
    max_temp_c: Math.max(45, Math.min(DEFAULTS.thermal_hard_limit_c, Number(input.max_temp_c || DEFAULTS.thermal_soft_limit_c))),
    max_watts: Math.max(0, Number(input.max_watts || 0)),
    battery_allowed: input.battery_allowed === true,
    immediate_revoke: input.immediate_revoke !== false
  };
}
function normalizeTelemetry(input = {}) {
  assertObject(input, 'TELEMETRY');
  const num = (v, fallback = null) => Number.isFinite(Number(v)) ? Number(v) : fallback;
  return {
    cpu_load: Math.max(0, Math.min(1, num(input.cpu_load, 0))),
    gpu_load: Math.max(0, Math.min(1, num(input.gpu_load, 0))),
    temperature_c: num(input.temperature_c),
    battery_percent: num(input.battery_percent),
    on_ac_power: input.on_ac_power === true,
    available_memory_mb: Math.max(0, num(input.available_memory_mb, 0)),
    available_vram_mb: Math.max(0, num(input.available_vram_mb, 0)),
    estimated_watts: Math.max(0, num(input.estimated_watts, 0)),
    latency_ms: Math.max(0, num(input.latency_ms, 0)),
    reliability: Math.max(0, Math.min(1, num(input.reliability, 0.5)))
  };
}
function hasAll(haystack, needles) { return needles.every(x => haystack.includes(x)); }

export class DesktopAgentDirectory {
  constructor({ max_agents = DEFAULTS.max_agents, agent_ttl_ms = DEFAULTS.agent_ttl_ms } = {}) {
    this.maxAgents = Math.max(1, Number(max_agents));
    this.agentTtlMs = Math.max(1_000, Number(agent_ttl_ms));
    this.agents = new Map();
  }

  heartbeat(input, at = Date.now()) {
    assertObject(input, 'AGENT_HEARTBEAT');
    assertNoGameCoupling(input, 'agent');
    assertNoClientSecrets(input, 'agent');
    walkForbidden(input, 'agent');
    const agentId = stableId(input.agent_id, 'AGENT_ID');
    const existing = this.agents.get(agentId);
    if (!existing && this.agents.size >= this.maxAgents) throw new Error('AGENT_DIRECTORY_FULL');
    const agent = {
      agent_id: agentId,
      platform: String(input.platform || existing?.platform || 'desktop').slice(0, 64),
      architecture: String(input.architecture || existing?.architecture || 'unknown').slice(0, 64),
      logical_cores: Math.max(1, Math.floor(Number(input.logical_cores || existing?.logical_cores || 1))),
      memory_mb: Math.max(0, Number(input.memory_mb || existing?.memory_mb || 0)),
      capabilities: normalizeCapabilities(input.capabilities || existing?.capabilities || ['GENERAL_CPU']),
      gpus: normalizeGpus(input.gpus || existing?.gpus || []),
      resource_policy: normalizeResourcePolicy(input.resource_policy || existing?.resource_policy || {}),
      telemetry: normalizeTelemetry(input.telemetry || existing?.telemetry || {}),
      session_id: String(input.session_id || existing?.session_id || '').slice(0, 256),
      last_seen_ms: finite(at, 'NOW'),
      inflight: existing?.inflight || 0,
      completed: existing?.completed || 0,
      failed: existing?.failed || 0,
      revoked: input.revoked === true
    };
    this.agents.set(agentId, agent);
    return clone(agent);
  }

  revoke(agentId) {
    const agent = this.agents.get(String(agentId));
    if (!agent) return false;
    agent.revoked = true;
    agent.resource_policy.compute_consent = false;
    return true;
  }

  isLive(agent, at = Date.now()) {
    return Boolean(agent && !agent.revoked && agent.resource_policy.compute_consent === true && Number(at) - agent.last_seen_ms <= this.agentTtlMs);
  }

  eligible(requirements, at = Date.now()) {
    return [...this.agents.values()]
      .filter(agent => this.isLive(agent, at))
      .map(agent => ({ agent, score: scoreDesktopAgent(agent, requirements) }))
      .filter(x => Number.isFinite(x.score))
      .sort((a, b) => b.score - a.score || a.agent.agent_id.localeCompare(b.agent.agent_id))
      .map(x => clone(x.agent));
  }

  acquire(agentId) {
    const agent = this.agents.get(String(agentId));
    if (!agent) throw new Error('AGENT_NOT_FOUND');
    agent.inflight += 1;
  }

  release(agentId, { completed = false, failed = false } = {}) {
    const agent = this.agents.get(String(agentId));
    if (!agent) return;
    agent.inflight = Math.max(0, agent.inflight - 1);
    if (completed) agent.completed += 1;
    if (failed) agent.failed += 1;
  }
}

export function scoreDesktopAgent(agent, requirements = {}) {
  if (!agent?.resource_policy?.compute_consent || agent.revoked) return -Infinity;
  const p = agent.resource_policy, t = agent.telemetry || {};
  if (agent.inflight >= p.max_concurrent) return -Infinity;
  if (Number.isFinite(t.temperature_c) && t.temperature_c >= p.max_temp_c) return -Infinity;
  if (Number.isFinite(t.battery_percent) && !t.on_ac_power && !p.battery_allowed && t.battery_percent < DEFAULTS.battery_floor_percent) return -Infinity;
  if (p.max_watts > 0 && Number(t.estimated_watts || 0) > p.max_watts) return -Infinity;

  const resourceClass = String(requirements.resource_class || 'CPU');
  if (!RESOURCE_CLASSES.includes(resourceClass)) return -Infinity;
  if ((resourceClass === 'CPU' || resourceClass === 'HYBRID') && !p.allow_cpu) return -Infinity;
  if ((resourceClass === 'GPU' || resourceClass === 'HYBRID') && (!p.allow_gpu || agent.gpus.length === 0)) return -Infinity;
  if (agent.logical_cores < Number(requirements.min_logical_cores || 1)) return -Infinity;
  if (Number(t.available_memory_mb || agent.memory_mb) < Number(requirements.min_memory_mb || 0)) return -Infinity;
  if (Number(t.available_vram_mb || 0) < Number(requirements.min_vram_mb || 0)) return -Infinity;
  if (!hasAll(agent.capabilities, requirements.required_capabilities || [])) return -Infinity;

  const load = resourceClass === 'GPU' ? Number(t.gpu_load || 0) : Math.max(Number(t.cpu_load || 0), resourceClass === 'HYBRID' ? Number(t.gpu_load || 0) : 0);
  const headroom = 1 - Math.max(0, Math.min(1, load));
  const reliability = Number(t.reliability ?? 0.5);
  const concurrency = 1 - (agent.inflight / Math.max(1, p.max_concurrent));
  const memory = Math.min(1, Number(t.available_memory_mb || 0) / Math.max(16_384, Number(requirements.min_memory_mb || 1)));
  const vram = resourceClass === 'CPU' ? 0.5 : Math.min(1, Number(t.available_vram_mb || 0) / Math.max(12_288, Number(requirements.min_vram_mb || 1)));
  const latencyPenalty = Math.min(1, Number(t.latency_ms || 0) / 1_000);
  const thermalPenalty = Number.isFinite(t.temperature_c) ? Math.max(0, (t.temperature_c - 55) / 50) : 0;
  return headroom * 0.28 + reliability * 0.28 + concurrency * 0.18 + memory * 0.10 + vram * 0.10 - latencyPenalty * 0.03 - thermalPenalty * 0.03;
}

function freshSlice({ slice_id, index, units, payload }) {
  return {
    slice_id,
    index,
    units,
    payload: clone(payload),
    state: 'QUEUED',
    attempt: 0,
    lease: null,
    result: null,
    verified_agent_id: null,
    verified_at_ms: null,
    last_error: null
  };
}

export function buildFabricSlices(workload, limits = {}) {
  assertObject(workload, 'WORKLOAD');
  const maxSlices = Number(limits.max_slices || DEFAULTS.max_slices);
  const workloadId = stableId(workload.workload_id, 'WORKLOAD_ID');
  if (Array.isArray(workload.partitions) && workload.partitions.length) {
    if (workload.partitions.length > maxSlices) throw new Error('TOO_MANY_SLICES');
    return workload.partitions.map((payload, index) => freshSlice({
      slice_id: `${workloadId}:p${String(index).padStart(6, '0')}`,
      index,
      units: 1,
      payload
    }));
  }
  const total = Math.floor(finite(workload.total_units, 'TOTAL_UNITS', { min: 1 }));
  const shard = Math.floor(finite(workload.shard_units, 'SHARD_UNITS', { min: 1 }));
  const count = Math.ceil(total / shard);
  if (count > maxSlices) throw new Error('TOO_MANY_SLICES');
  const out = [];
  for (let index = 0, offset = 0; offset < total; index += 1, offset += shard) {
    const units = Math.min(shard, total - offset);
    out.push(freshSlice({
      slice_id: `${workloadId}:r${String(index).padStart(6, '0')}`,
      index,
      units,
      payload: { offset, units }
    }));
  }
  return out;
}

function normalizeRequirements(input = {}) {
  assertObject(input, 'REQUIREMENTS');
  const resourceClass = String(input.resource_class || 'CPU').toUpperCase();
  if (!RESOURCE_CLASSES.includes(resourceClass)) throw new Error('INVALID_RESOURCE_CLASS');
  const defaultCaps = resourceClass === 'GPU'
    ? ['GENERAL_GPU']
    : resourceClass === 'HYBRID'
      ? ['GENERAL_CPU', 'GENERAL_GPU']
      : ['GENERAL_CPU'];
  return {
    resource_class: resourceClass,
    min_logical_cores: Math.max(1, Math.floor(Number(input.min_logical_cores || 1))),
    min_memory_mb: Math.max(0, Number(input.min_memory_mb || 0)),
    min_vram_mb: Math.max(0, Number(input.min_vram_mb || 0)),
    required_capabilities: normalizeCapabilities(input.required_capabilities || defaultCaps)
  };
}

function normalizeWorkload(input, limits) {
  assertObject(input, 'WORKLOAD');
  assertNoGameCoupling(input, 'workload');
  assertNoClientSecrets(input, 'workload');
  walkForbidden(input, 'workload');
  const type = String(input.type || '');
  const routeClass = String(input.route_class || '');
  if (!TASK_TYPES.includes(type)) throw new Error(`UNSUPPORTED_TASK_TYPE:${type}`);
  if (!ROUTE_CLASSES.includes(routeClass)) throw new Error(`UNSUPPORTED_ROUTE_CLASS:${routeClass}`);
  if (input.consent_required !== true) throw new Error('CONSENT_REQUIRED_MUST_BE_TRUE');
  const normalized = {
    workload_id: stableId(input.workload_id, 'WORKLOAD_ID'),
    provider_id: stableId(input.provider_id, 'PROVIDER_ID'),
    provider_job_id: input.provider_job_id ? stableId(input.provider_job_id, 'PROVIDER_JOB_ID') : null,
    type,
    route_class: routeClass,
    artifact_digest: digest(input.artifact_digest),
    requirements: normalizeRequirements(input.requirements || {}),
    priority: Math.max(0, Math.min(100, Number(input.priority || 0))),
    submitted_at_ms: Number(input.submitted_at_ms || Date.now()),
    deadline_ms: input.deadline_ms == null ? null : finite(input.deadline_ms, 'DEADLINE_MS'),
    consent_required: true,
    metadata: clone(input.metadata || {}),
    partitions: Array.isArray(input.partitions) ? clone(input.partitions) : undefined,
    total_units: input.total_units,
    shard_units: input.shard_units
  };
  normalized.slices = buildFabricSlices(normalized, limits);
  delete normalized.partitions; delete normalized.total_units; delete normalized.shard_units;
  return normalized;
}

export class HeliosDesktopFabric {
  constructor({ authenticate_agent = null, sign_assignment = null, policy = {} } = {}) {
    this.policy = { ...DEFAULTS, ...policy };
    this.directory = new DesktopAgentDirectory(this.policy);
    this.authenticateAgent = authenticate_agent;
    this.signAssignment = sign_assignment;
    this.adapters = new Map();
    this.providerHealth = new Map();
    this.workloads = new Map();
  }

  registerProviderAdapter(providerId, adapter) {
    const id = stableId(providerId, 'PROVIDER_ID');
    assertObject(adapter, 'PROVIDER_ADAPTER');
    if (typeof adapter.dispatch !== 'function') throw new Error('ADAPTER_DISPATCH_REQUIRED');
    if (typeof adapter.verify !== 'function') throw new Error('ADAPTER_VERIFY_REQUIRED');
    this.adapters.set(id, adapter);
    this.providerHealth.set(id, { failures: 0, open_until_ms: 0 });
    return id;
  }

  async heartbeat(input, at = Date.now()) {
    if (this.authenticateAgent && await this.authenticateAgent(input) !== true) throw new Error('AGENT_AUTHENTICATION_FAILED');
    return this.directory.heartbeat(input, at);
  }

  submitWorkload(input, at = Date.now()) {
    if (this.workloads.size >= this.policy.max_workloads) throw new Error('WORKLOAD_CAPACITY_REACHED');
    const workload = normalizeWorkload({ ...input, submitted_at_ms: at }, this.policy);
    if (this.workloads.has(workload.workload_id)) throw new Error('DUPLICATE_WORKLOAD_ID');
    if (!this.adapters.has(workload.provider_id)) throw new Error(`PROVIDER_ADAPTER_NOT_REGISTERED:${workload.provider_id}`);
    const queued = [...this.workloads.values()].reduce((n, w) => n + w.slices.filter(s => s.state === 'QUEUED').length, 0);
    if (queued + workload.slices.length > this.policy.max_slices) throw new Error('FABRIC_BACKPRESSURE_QUEUE_FULL');
    workload.state = 'QUEUED';
    workload.started_at_ms = null;
    workload.completed_at_ms = null;
    workload.receipt = null;
    workload.retry_count = 0;
    this.workloads.set(workload.workload_id, workload);
    return this.workloadSnapshot(workload.workload_id);
  }

  providerAvailable(providerId, at) {
    const h = this.providerHealth.get(providerId) || { failures: 0, open_until_ms: 0 };
    return Number(at) >= Number(h.open_until_ms || 0);
  }

  providerSuccess(providerId) {
    this.providerHealth.set(providerId, { failures: 0, open_until_ms: 0 });
  }

  providerFailure(providerId, at) {
    const h = this.providerHealth.get(providerId) || { failures: 0, open_until_ms: 0 };
    h.failures += 1;
    if (h.failures >= this.policy.provider_failure_threshold) h.open_until_ms = Number(at) + this.policy.provider_cooldown_ms;
    this.providerHealth.set(providerId, h);
  }

  sweepExpired(at = Date.now()) {
    for (const workload of this.workloads.values()) {
      for (const slice of workload.slices) {
        if (slice.state !== 'LEASED' && slice.state !== 'RUNNING') continue;
        if (Number(at) <= Number(slice.lease?.expires_at_ms || 0)) continue;
        this.directory.release(slice.lease.agent_id, { failed: true });
        slice.last_error = 'LEASE_EXPIRED';
        slice.lease = null;
        slice.attempt += 1;
        workload.retry_count += 1;
        slice.state = slice.attempt >= this.policy.max_attempts ? 'FAILED' : 'QUEUED';
      }
      this.refreshWorkloadState(workload, at);
    }
  }

  queuedCandidates(at = Date.now()) {
    const candidates = [];
    for (const workload of this.workloads.values()) {
      if (!['QUEUED', 'RUNNING'].includes(workload.state)) continue;
      if (!this.providerAvailable(workload.provider_id, at)) continue;
      if (workload.deadline_ms != null && Number(at) > workload.deadline_ms) continue;
      for (const slice of workload.slices) {
        if (slice.state !== 'QUEUED') continue;
        const ageBoost = Math.floor(Math.max(0, Number(at) - workload.submitted_at_ms) / this.policy.priority_aging_ms);
        candidates.push({ workload, slice, effectivePriority: workload.priority + ageBoost });
      }
    }
    candidates.sort((a, b) =>
      b.effectivePriority - a.effectivePriority ||
      a.workload.submitted_at_ms - b.workload.submitted_at_ms ||
      a.slice.index - b.slice.index
    );
    return candidates;
  }

  selectDispatchableSlice(at = Date.now()) {
    for (const candidate of this.queuedCandidates(at)) {
      const agent = this.directory.eligible(candidate.workload.requirements, at)[0] || null;
      if (agent) return { ...candidate, agent };
    }
    return null;
  }

  async dispatchReady({ now = Date.now(), limit = this.policy.max_dispatch_per_tick } = {}) {
    this.sweepExpired(now);
    const dispatched = [];
    for (let i = 0; i < Math.max(0, Number(limit)); i += 1) {
      const next = this.selectDispatchableSlice(now);
      if (!next) break;
      const agent = next.agent;
      const leaseId = secureToken();
      const lease = {
        lease_id: leaseId,
        agent_id: agent.agent_id,
        issued_at_ms: Number(now),
        ack_deadline_ms: Number(now) + this.policy.ack_timeout_ms,
        expires_at_ms: Number(now) + this.policy.lease_ttl_ms
      };
      const executionBudget = {
        cpu_limit_percent: Number(agent.resource_policy.cpu_limit_percent),
        gpu_limit_percent: Number(agent.resource_policy.gpu_limit_percent),
        max_temp_c: Number(agent.resource_policy.max_temp_c),
        max_watts: Number(agent.resource_policy.max_watts || 0),
        max_concurrent: Number(agent.resource_policy.max_concurrent)
      };
      const assignment = {
        schema: FABRIC_ASSIGNMENT_SCHEMA,
        fabric_version: HELIOS_DESKTOP_FABRIC_VERSION,
        workload_id: next.workload.workload_id,
        slice_id: next.slice.slice_id,
        provider_id: next.workload.provider_id,
        provider_job_id: next.workload.provider_job_id,
        task_type: next.workload.type,
        route_class: next.workload.route_class,
        artifact_digest: next.workload.artifact_digest,
        requirements: clone(next.workload.requirements),
        execution_budget: executionBudget,
        payload: clone(next.slice.payload),
        lease_id: leaseId,
        lease_expires_at_ms: lease.expires_at_ms,
        scheduling_basis: 'CONSENT_RESOURCE_POLICY_PROVIDER_CAPACITY_WORKLOAD_ADMISSION_AND_DESKTOP_TELEMETRY',
        game_event_weighting: 'FORBIDDEN',
        game_effect: 'NONE'
      };
      if (this.signAssignment) assignment.signature = await this.signAssignment(assignment);
      const adapter = this.adapters.get(next.workload.provider_id);
      try {
        const accepted = await adapter.dispatch(agent.agent_id, clone(assignment));
        if (accepted !== true) throw new Error('ADAPTER_DISPATCH_REJECTED');
        this.providerSuccess(next.workload.provider_id);
      } catch (error) {
        this.providerFailure(next.workload.provider_id, now);
        next.slice.last_error = String(error?.message || error);
        next.slice.attempt += 1;
        next.workload.retry_count += 1;
        if (next.slice.attempt >= this.policy.max_attempts) next.slice.state = 'FAILED';
        this.refreshWorkloadState(next.workload, now);
        continue;
      }
      next.slice.lease = lease;
      next.slice.state = 'LEASED';
      next.workload.state = 'RUNNING';
      next.workload.started_at_ms ??= Number(now);
      this.directory.acquire(agent.agent_id);
      dispatched.push({ agent_id: agent.agent_id, assignment: clone(assignment) });
    }
    return dispatched;
  }

  getSlice(workloadId, sliceId) {
    const workload = this.workloads.get(String(workloadId));
    if (!workload) throw new Error('WORKLOAD_NOT_FOUND');
    const slice = workload.slices.find(s => s.slice_id === String(sliceId));
    if (!slice) throw new Error('SLICE_NOT_FOUND');
    return { workload, slice };
  }

  assertLease(slice, agentId, leaseId, at, { requireAckWindow = false } = {}) {
    if (!slice.lease || slice.lease.agent_id !== String(agentId) || slice.lease.lease_id !== String(leaseId)) throw new Error('STALE_FENCING_TOKEN');
    if (Number(at) > slice.lease.expires_at_ms) throw new Error('LEASE_EXPIRED');
    if (requireAckWindow && Number(at) > slice.lease.ack_deadline_ms) throw new Error('ACK_DEADLINE_EXCEEDED');
  }

  acknowledge({ workload_id, slice_id, agent_id, lease_id }, at = Date.now()) {
    const { slice } = this.getSlice(workload_id, slice_id);
    this.assertLease(slice, agent_id, lease_id, at, { requireAckWindow: true });
    slice.state = 'RUNNING';
    return true;
  }

  renewLease({ workload_id, slice_id, agent_id, lease_id }, at = Date.now()) {
    const { slice } = this.getSlice(workload_id, slice_id);
    this.assertLease(slice, agent_id, lease_id, at);
    slice.lease.expires_at_ms = Number(at) + this.policy.lease_ttl_ms;
    return clone(slice.lease);
  }

  async submitResult({ workload_id, slice_id, agent_id, lease_id, output, result_bytes = 0 }, at = Date.now()) {
    const { workload, slice } = this.getSlice(workload_id, slice_id);
    this.assertLease(slice, agent_id, lease_id, at);
    finite(result_bytes, 'RESULT_BYTES', { max: this.policy.max_result_bytes });
    assertNoGameCoupling(output || {}, 'result');
    assertNoClientSecrets(output || {}, 'result');
    walkForbidden(output || {}, 'result');
    slice.state = 'VERIFYING';
    const adapter = this.adapters.get(workload.provider_id);
    const verified = await adapter.verify({
      workload: clone(workload),
      slice: clone(slice),
      agent_id: String(agent_id),
      output: clone(output),
      at: Number(at)
    });
    if (verified !== true) {
      this.directory.release(agent_id, { failed: true });
      slice.last_error = 'RESULT_VERIFICATION_FAILED';
      slice.result = null;
      slice.verified_agent_id = null;
      slice.verified_at_ms = null;
      slice.lease = null;
      slice.attempt += 1;
      workload.retry_count += 1;
      slice.state = slice.attempt >= this.policy.max_attempts ? 'FAILED' : 'QUEUED';
      this.refreshWorkloadState(workload, at);
      return { accepted: false, requeued: slice.state === 'QUEUED' };
    }
    slice.state = 'VERIFIED';
    slice.result = clone(output);
    slice.verified_agent_id = String(agent_id);
    slice.verified_at_ms = Number(at);
    this.directory.release(agent_id, { completed: true });
    slice.lease = null;
    this.refreshWorkloadState(workload, at);
    return {
      accepted: true,
      workload_complete: workload.state === 'COMPLETE',
      receipt: workload.receipt ? clone(workload.receipt) : null
    };
  }

  refreshWorkloadState(workload, at = Date.now()) {
    if (workload.deadline_ms != null && Number(at) > workload.deadline_ms && !workload.slices.every(s => s.state === 'VERIFIED')) {
      const active = workload.slices.some(s => ['LEASED', 'RUNNING', 'VERIFYING'].includes(s.state));
      if (!active) {
        for (const slice of workload.slices) if (slice.state === 'QUEUED') {
          slice.state = 'FAILED';
          slice.last_error = 'WORKLOAD_DEADLINE_EXCEEDED';
        }
        workload.state = 'FAILED';
        return;
      }
    }

    if (workload.slices.every(s => s.state === 'VERIFIED')) {
      workload.state = 'COMPLETE';
      workload.completed_at_ms = Number(at);
      const agents = [...new Set(workload.slices.map(s => s.verified_agent_id).filter(Boolean))].sort();
      workload.receipt = {
        schema: FABRIC_RECEIPT_SCHEMA,
        fabric_version: HELIOS_DESKTOP_FABRIC_VERSION,
        workload_id: workload.workload_id,
        provider_id: workload.provider_id,
        task_type: workload.type,
        route_class: workload.route_class,
        resource_class: workload.requirements.resource_class,
        artifact_digest: workload.artifact_digest,
        slices_verified: workload.slices.length,
        verified_units: workload.slices.reduce((n, s) => n + Number(s.units || 0), 0),
        retry_count: workload.retry_count,
        started_at_ms: workload.started_at_ms,
        completed_at_ms: workload.completed_at_ms,
        duration_ms: Math.max(0, workload.completed_at_ms - (workload.started_at_ms || workload.submitted_at_ms)),
        participating_agents: agents,
        slice_provenance: workload.slices.map(s => ({
          slice_id: s.slice_id,
          verified_agent_id: s.verified_agent_id,
          verified_at_ms: s.verified_at_ms
        })),
        provider_settlement_authoritative: false,
        scheduling_basis: 'CONSENT_RESOURCE_POLICY_PROVIDER_CAPACITY_WORKLOAD_ADMISSION_AND_DESKTOP_TELEMETRY',
        game_event_weighting: 'FORBIDDEN',
        game_effect: 'NONE'
      };
      return;
    }
    if (workload.slices.some(s => s.state === 'FAILED')) workload.state = 'FAILED';
    else if (workload.slices.some(s => ['LEASED', 'RUNNING', 'VERIFYING', 'VERIFIED'].includes(s.state))) workload.state = 'RUNNING';
    else workload.state = 'QUEUED';
  }

  async cancelWorkload(workloadId) {
    const workload = this.workloads.get(String(workloadId));
    if (!workload) return false;
    const adapter = this.adapters.get(workload.provider_id);
    for (const slice of workload.slices) {
      if (slice.lease) {
        try {
          if (typeof adapter.cancel === 'function') {
            await adapter.cancel(slice.lease.agent_id, {
              workload_id: workload.workload_id,
              slice_id: slice.slice_id,
              lease_id: slice.lease.lease_id
            });
          }
        } catch (_) {}
        this.directory.release(slice.lease.agent_id);
      }
      if (slice.state !== 'VERIFIED') slice.state = 'CANCELLED';
      slice.lease = null;
    }
    workload.state = 'CANCELLED';
    return true;
  }

  workloadSnapshot(workloadId) {
    const workload = this.workloads.get(String(workloadId));
    return workload ? clone(workload) : null;
  }
}
