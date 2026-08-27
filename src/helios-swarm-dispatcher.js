import {
  ROUTE_CLASSES,
  TASK_TYPES,
  assertNoGameCoupling,
  assertNoClientSecrets
} from './helios-router.js';

export const HELIOS_SWARM_VERSION = '1.0.0';
export const SWARM_ASSIGNMENT_SCHEMA = 'janus.helios.swarm.assignment.v1';
export const SWARM_RESULT_SCHEMA = 'janus.helios.swarm.result.v1';
export const SWARM_RECEIPT_SCHEMA = 'janus.helios.swarm.receipt.v1';

export const CHUNK_STATES = Object.freeze([
  'QUEUED',
  'LEASED',
  'ACKED',
  'VERIFYING',
  'VERIFIED',
  'FAILED',
  'CANCELLED'
]);

export const JOB_STATES = Object.freeze([
  'QUEUED',
  'RUNNING',
  'COMPLETE',
  'FAILED',
  'CANCELLED'
]);

const FORBIDDEN_EXECUTION_KEYS = new Set([
  'shell', 'command', 'cmd', 'powershell', 'script', 'eval', 'exec', 'spawn',
  'private_key', 'wallet_seed', 'seed_phrase', 'mnemonic', 'api_key',
  'access_token', 'refresh_token', 'authorization'
]);

const DEFAULTS = Object.freeze({
  node_ttl_ms: 30_000,
  lease_ttl_ms: 20_000,
  ack_timeout_ms: 7_500,
  max_attempts: 4,
  max_nodes: 50_000,
  max_jobs: 1_000,
  max_chunks: 20_000,
  max_chunk_units: 1_000_000,
  max_dispatch_per_tick: 256,
  max_node_concurrency: 4,
  max_result_bytes: 8 * 1024 * 1024,
  thermal_soft_limit_c: 78,
  thermal_hard_limit_c: 88,
  battery_floor_percent: 20
});

function assertObject(value, label) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new Error(`${label}_MUST_BE_OBJECT`);
  }
}

function boundedNumber(value, label, { min = 0, max = Number.MAX_SAFE_INTEGER } = {}) {
  const n = Number(value);
  if (!Number.isFinite(n) || n < min || n > max) throw new Error(`${label}_OUT_OF_RANGE`);
  return n;
}

function stableId(value, label, max = 192) {
  const s = String(value || '');
  if (!s || s.length > max || !/^[A-Za-z0-9_.:/@+-]+$/.test(s)) throw new Error(`${label}_INVALID`);
  return s;
}

function walkForbidden(value, path = 'root') {
  if (!value || typeof value !== 'object') return;
  for (const [key, nested] of Object.entries(value)) {
    if (FORBIDDEN_EXECUTION_KEYS.has(String(key).toLowerCase())) {
      throw new Error(`ARBITRARY_EXECUTION_OR_SECRET_FORBIDDEN:${path}.${key}`);
    }
    walkForbidden(nested, `${path}.${key}`);
  }
}

function secureFenceToken() {
  const c = globalThis.crypto;
  if (c?.randomUUID) return c.randomUUID();
  if (c?.getRandomValues) {
    const bytes = new Uint8Array(16);
    c.getRandomValues(bytes);
    bytes[6] = (bytes[6] & 0x0f) | 0x40;
    bytes[8] = (bytes[8] & 0x3f) | 0x80;
    const h = [...bytes].map(b => b.toString(16).padStart(2, '0')).join('');
    return `${h.slice(0,8)}-${h.slice(8,12)}-${h.slice(12,16)}-${h.slice(16,20)}-${h.slice(20)}`;
  }
  throw new Error('SECURE_RANDOM_REQUIRED');
}

function nowMs(value = Date.now()) {
  const n = Number(value);
  if (!Number.isFinite(n) || n < 0) throw new Error('NOW_INVALID');
  return n;
}

function clone(value) {
  return structuredClone(value);
}

function normalizeCapabilities(input) {
  if (!Array.isArray(input)) throw new Error('CAPABILITIES_REQUIRED');
  const values = [...new Set(input.map(x => stableId(x, 'CAPABILITY', 96)))];
  if (!values.length) throw new Error('CAPABILITIES_REQUIRED');
  return values.sort();
}

function normalizeResourcePolicy(input = {}) {
  assertObject(input, 'RESOURCE_POLICY');
  return {
    compute_consent: input.compute_consent === true,
    max_concurrent: Math.max(1, Math.min(DEFAULTS.max_node_concurrency, Math.floor(Number(input.max_concurrent || 1)))),
    cpu_percent: Math.max(0, Math.min(100, Number(input.cpu_percent ?? 0))),
    gpu_allowed: input.gpu_allowed === true,
    battery_allowed: input.battery_allowed === true,
    max_temp_c: Math.max(40, Math.min(DEFAULTS.thermal_hard_limit_c, Number(input.max_temp_c || DEFAULTS.thermal_soft_limit_c))),
    immediate_revoke: input.immediate_revoke !== false
  };
}

function normalizeTelemetry(input = {}) {
  assertObject(input, 'TELEMETRY');
  const n = (v, fallback = null) => Number.isFinite(Number(v)) ? Number(v) : fallback;
  return {
    load: Math.max(0, Math.min(1, n(input.load, 0))),
    temperature_c: n(input.temperature_c),
    battery_percent: n(input.battery_percent),
    on_ac_power: input.on_ac_power === true,
    latency_ms: Math.max(0, n(input.latency_ms, 0)),
    reliability: Math.max(0, Math.min(1, n(input.reliability, 0.5))),
    available_memory_mb: Math.max(0, n(input.available_memory_mb, 0)),
    available_vram_mb: Math.max(0, n(input.available_vram_mb, 0)),
    estimated_watts: Math.max(0, n(input.estimated_watts, 0))
  };
}

function hasCapabilities(node, required = []) {
  return required.every(cap => node.capabilities.includes(cap));
}

export function scoreNode(node, requiredCapabilities = [], policy = {}) {
  if (!node || node.resource_policy?.compute_consent !== true) return -Infinity;
  if (!hasCapabilities(node, requiredCapabilities)) return -Infinity;
  if (node.inflight >= node.resource_policy.max_concurrent) return -Infinity;

  const t = node.telemetry || {};
  const maxTemp = Math.min(
    Number(node.resource_policy.max_temp_c || DEFAULTS.thermal_soft_limit_c),
    Number(policy.thermal_hard_limit_c || DEFAULTS.thermal_hard_limit_c)
  );
  if (Number.isFinite(t.temperature_c) && t.temperature_c >= maxTemp) return -Infinity;
  if (
    Number.isFinite(t.battery_percent) &&
    !t.on_ac_power &&
    node.resource_policy.battery_allowed !== true &&
    t.battery_percent < Number(policy.battery_floor_percent || DEFAULTS.battery_floor_percent)
  ) return -Infinity;

  const headroom = 1 - Math.max(0, Math.min(1, Number(t.load || 0)));
  const reliability = Math.max(0, Math.min(1, Number(t.reliability ?? 0.5)));
  const latencyPenalty = Math.min(1, Math.max(0, Number(t.latency_ms || 0)) / 1_000);
  const concurrencyHeadroom = 1 - (node.inflight / Math.max(1, node.resource_policy.max_concurrent));
  const memoryBonus = Math.min(1, Math.max(0, Number(t.available_memory_mb || 0)) / 16_384);
  const vramBonus = Math.min(1, Math.max(0, Number(t.available_vram_mb || 0)) / 24_576);
  return (
    headroom * 0.30 +
    reliability * 0.30 +
    concurrencyHeadroom * 0.20 +
    memoryBonus * 0.08 +
    vramBonus * 0.08 -
    latencyPenalty * 0.04
  );
}

export class SwarmNodeRegistry {
  constructor({ max_nodes = DEFAULTS.max_nodes, node_ttl_ms = DEFAULTS.node_ttl_ms } = {}) {
    this.maxNodes = Math.max(1, Number(max_nodes));
    this.nodeTtlMs = Math.max(1_000, Number(node_ttl_ms));
    this.nodes = new Map();
  }

  heartbeat(input, at = Date.now()) {
    assertObject(input, 'NODE_HEARTBEAT');
    assertNoGameCoupling(input, 'node');
    assertNoClientSecrets(input, 'node');
    walkForbidden(input, 'node');

    const nodeId = stableId(input.node_id, 'NODE_ID');
    if (!this.nodes.has(nodeId) && this.nodes.size >= this.maxNodes) throw new Error('NODE_REGISTRY_FULL');
    const existing = this.nodes.get(nodeId);
    const capabilities = normalizeCapabilities(input.capabilities || existing?.capabilities);
    const resourcePolicy = normalizeResourcePolicy(input.resource_policy || existing?.resource_policy || {});
    const telemetry = normalizeTelemetry(input.telemetry || existing?.telemetry || {});
    const timestamp = nowMs(at);

    const node = {
      node_id: nodeId,
      node_kind: String(input.node_kind || existing?.node_kind || 'HELIOS_CLIENT'),
      firmware_version: String(input.firmware_version || existing?.firmware_version || 'unknown'),
      capabilities,
      resource_policy: resourcePolicy,
      telemetry,
      last_seen_ms: timestamp,
      revoked: input.revoked === true,
      inflight: existing?.inflight || 0,
      completed: existing?.completed || 0,
      failed: existing?.failed || 0,
      session_id: String(input.session_id || existing?.session_id || '')
    };
    this.nodes.set(nodeId, node);
    return clone(node);
  }

  revoke(nodeId) {
    const node = this.nodes.get(String(nodeId));
    if (!node) return false;
    node.revoked = true;
    node.resource_policy.compute_consent = false;
    return true;
  }

  get(nodeId) {
    const node = this.nodes.get(String(nodeId));
    return node ? clone(node) : null;
  }

  isLive(node, at = Date.now()) {
    return Boolean(
      node &&
      !node.revoked &&
      node.resource_policy.compute_consent === true &&
      nowMs(at) - node.last_seen_ms <= this.nodeTtlMs
    );
  }

  eligible(requiredCapabilities = [], at = Date.now(), scoringPolicy = {}) {
    const required = normalizeCapabilities(requiredCapabilities.length ? requiredCapabilities : ['GENERAL_CPU']);
    return [...this.nodes.values()]
      .filter(node => this.isLive(node, at))
      .map(node => ({ node, score: scoreNode(node, required, scoringPolicy) }))
      .filter(x => Number.isFinite(x.score))
      .sort((a, b) => b.score - a.score || a.node.node_id.localeCompare(b.node.node_id))
      .map(x => clone(x.node));
  }

  incrementInflight(nodeId) {
    const node = this.nodes.get(String(nodeId));
    if (!node) throw new Error('NODE_NOT_FOUND');
    node.inflight += 1;
  }

  releaseInflight(nodeId, { completed = false, failed = false } = {}) {
    const node = this.nodes.get(String(nodeId));
    if (!node) return;
    node.inflight = Math.max(0, node.inflight - 1);
    if (completed) node.completed += 1;
    if (failed) node.failed += 1;
  }

  snapshot(at = Date.now()) {
    const timestamp = nowMs(at);
    return [...this.nodes.values()].map(node => ({
      ...clone(node),
      live: this.isLive(node, timestamp),
      age_ms: Math.max(0, timestamp - node.last_seen_ms)
    }));
  }
}

export function createWorkChunks(job, limits = {}) {
  assertObject(job, 'JOB');
  assertNoGameCoupling(job, 'job');
  assertNoClientSecrets(job, 'job');
  walkForbidden(job, 'job');

  const maxChunks = Number(limits.max_chunks || DEFAULTS.max_chunks);
  const maxChunkUnits = Number(limits.max_chunk_units || DEFAULTS.max_chunk_units);
  const jobId = stableId(job.job_id, 'JOB_ID');

  if (Array.isArray(job.partitions) && job.partitions.length) {
    if (job.partitions.length > maxChunks) throw new Error('TOO_MANY_CHUNKS');
    return job.partitions.map((input, index) => ({
      chunk_id: `${jobId}:p${String(index).padStart(6, '0')}`,
      index,
      input: clone(input),
      state: 'QUEUED',
      attempt: 0,
      lease: null,
      result: null,
      verified_at_ms: null,
      last_error: null
    }));
  }

  const totalUnits = boundedNumber(job.total_units, 'TOTAL_UNITS', { min: 1, max: Number.MAX_SAFE_INTEGER });
  const chunkUnits = Math.floor(boundedNumber(job.chunk_units, 'CHUNK_UNITS', { min: 1, max: maxChunkUnits }));
  const count = Math.ceil(totalUnits / chunkUnits);
  if (count > maxChunks) throw new Error('TOO_MANY_CHUNKS');

  const chunks = [];
  for (let index = 0, offset = 0; offset < totalUnits; index += 1, offset += chunkUnits) {
    const length = Math.min(chunkUnits, totalUnits - offset);
    chunks.push({
      chunk_id: `${jobId}:r${String(index).padStart(6, '0')}`,
      index,
      input: { offset, length },
      state: 'QUEUED',
      attempt: 0,
      lease: null,
      result: null,
      verified_at_ms: null,
      last_error: null
    });
  }
  return chunks;
}

function normalizeJob(input, limits) {
  assertObject(input, 'JOB');
  assertNoGameCoupling(input, 'job');
  assertNoClientSecrets(input, 'job');
  walkForbidden(input, 'job');

  const type = String(input.type || '');
  if (!TASK_TYPES.includes(type)) throw new Error(`UNSUPPORTED_TASK_TYPE:${type}`);
  const routeClass = String(input.route_class || 'DATACENTER');
  if (!ROUTE_CLASSES.includes(routeClass)) throw new Error(`UNSUPPORTED_ROUTE_CLASS:${routeClass}`);
  const requiredCapabilities = normalizeCapabilities(input.required_capabilities || ['GENERAL_CPU']);
  const jobId = stableId(input.job_id, 'JOB_ID');
  const workloadId = stableId(input.workload_id, 'WORKLOAD_ID');
  const digest = String(input.artifact_digest || '');
  if (!/^(sha256:)?[a-fA-F0-9]{64}$/.test(digest)) throw new Error('ARTIFACT_DIGEST_SHA256_REQUIRED');
  if (input.consent_required !== true) throw new Error('CONSENT_REQUIRED_MUST_BE_TRUE');

  const normalized = {
    job_id: jobId,
    workload_id: workloadId,
    type,
    route_class: routeClass,
    artifact_digest: digest.toLowerCase(),
    required_capabilities: requiredCapabilities,
    priority: Math.max(0, Math.min(100, Number(input.priority || 0))),
    deadline_ms: input.deadline_ms == null ? null : nowMs(input.deadline_ms),
    consent_required: true,
    metadata: clone(input.metadata || {}),
    partitions: Array.isArray(input.partitions) ? clone(input.partitions) : undefined,
    total_units: input.total_units,
    chunk_units: input.chunk_units
  };
  normalized.chunks = createWorkChunks(normalized, limits);
  delete normalized.partitions;
  delete normalized.total_units;
  delete normalized.chunk_units;
  return normalized;
}

export class HeliosSwarmDispatcher {
  constructor({
    transport,
    verifier,
    aggregator = null,
    authenticate_node = null,
    sign_assignment = null,
    policy = {}
  } = {}) {
    if (!transport || typeof transport.assign !== 'function') throw new Error('TRANSPORT_ASSIGN_REQUIRED');
    if (typeof verifier !== 'function') throw new Error('RESULT_VERIFIER_REQUIRED');
    if (aggregator != null && typeof aggregator !== 'function') throw new Error('AGGREGATOR_MUST_BE_FUNCTION');
    if (authenticate_node != null && typeof authenticate_node !== 'function') throw new Error('AUTHENTICATE_NODE_MUST_BE_FUNCTION');
    if (sign_assignment != null && typeof sign_assignment !== 'function') throw new Error('SIGN_ASSIGNMENT_MUST_BE_FUNCTION');

    this.policy = {
      ...DEFAULTS,
      ...clone(policy),
      scheduling_basis: 'CONSENT_DEVICE_POLICY_PROVIDER_CAPACITY_AND_WORKLOAD_ADMISSION',
      game_event_weighting: 'FORBIDDEN',
      game_effect: 'NONE'
    };
    this.transport = transport;
    this.verifier = verifier;
    this.aggregator = aggregator;
    this.authenticateNode = authenticate_node;
    this.signAssignment = sign_assignment;
    this.nodes = new SwarmNodeRegistry(this.policy);
    this.jobs = new Map();
    this.chunks = new Map();
    this.leases = new Map();
    this.receipts = [];
    this.sequence = 0;
  }

  async heartbeat(input, at = Date.now()) {
    if (this.authenticateNode) {
      const ok = await this.authenticateNode(clone(input));
      if (ok !== true) throw new Error('NODE_AUTHENTICATION_FAILED');
    }
    return this.nodes.heartbeat(input, at);
  }

  submitJob(input, at = Date.now()) {
    if (this.jobs.size >= Number(this.policy.max_jobs)) throw new Error('JOB_QUEUE_FULL');
    const job = normalizeJob(input, this.policy);
    if (this.jobs.has(job.job_id)) throw new Error(`DUPLICATE_JOB:${job.job_id}`);
    if (this.chunks.size + job.chunks.length > Number(this.policy.max_chunks)) throw new Error('CHUNK_QUEUE_FULL');

    const timestamp = nowMs(at);
    const record = {
      ...job,
      state: 'QUEUED',
      created_at_ms: timestamp,
      completed_at_ms: null,
      cancelled_at_ms: null,
      failure_reason: null,
      receipt: null
    };
    this.jobs.set(record.job_id, record);
    for (const chunk of record.chunks) this.chunks.set(chunk.chunk_id, chunk);
    return this.jobSnapshot(record.job_id);
  }

  jobSnapshot(jobId) {
    const job = this.jobs.get(String(jobId));
    if (!job) return null;
    return clone({
      job_id: job.job_id,
      workload_id: job.workload_id,
      type: job.type,
      route_class: job.route_class,
      artifact_digest: job.artifact_digest,
      required_capabilities: job.required_capabilities,
      state: job.state,
      created_at_ms: job.created_at_ms,
      completed_at_ms: job.completed_at_ms,
      failure_reason: job.failure_reason,
      chunks: job.chunks.map(c => ({
        chunk_id: c.chunk_id,
        index: c.index,
        input: c.input,
        state: c.state,
        attempt: c.attempt,
        lease: c.lease ? { ...c.lease } : null,
        verified_at_ms: c.verified_at_ms,
        last_error: c.last_error
      })),
      receipt: job.receipt
    });
  }

  #leaseChunk(job, chunk, node, at) {
    if (chunk.state !== 'QUEUED') throw new Error('CHUNK_NOT_QUEUED');
    if (chunk.attempt >= Number(this.policy.max_attempts)) {
      chunk.state = 'FAILED';
      chunk.last_error = 'MAX_ATTEMPTS_EXCEEDED';
      this.#evaluateJob(job, at);
      return null;
    }

    const leaseId = secureFenceToken();
    chunk.attempt += 1;
    chunk.state = 'LEASED';
    chunk.lease = {
      lease_id: leaseId,
      node_id: node.node_id,
      attempt: chunk.attempt,
      issued_at_ms: at,
      ack_deadline_ms: at + Number(this.policy.ack_timeout_ms),
      expires_at_ms: at + Number(this.policy.lease_ttl_ms),
      acked: false
    };
    this.leases.set(chunk.chunk_id, chunk.lease);
    this.nodes.incrementInflight(node.node_id);
    job.state = 'RUNNING';
    return chunk.lease;
  }

  async #assignmentEnvelope(job, chunk, lease) {
    const envelope = {
      schema: SWARM_ASSIGNMENT_SCHEMA,
      swarm_version: HELIOS_SWARM_VERSION,
      sequence: ++this.sequence,
      job_id: job.job_id,
      workload_id: job.workload_id,
      task_type: job.type,
      route_class: job.route_class,
      artifact_digest: job.artifact_digest,
      chunk_id: chunk.chunk_id,
      chunk_index: chunk.index,
      chunk_input: clone(chunk.input),
      required_capabilities: clone(job.required_capabilities),
      lease_id: lease.lease_id,
      attempt: lease.attempt,
      lease_expires_at_ms: lease.expires_at_ms,
      scheduling_basis: this.policy.scheduling_basis,
      game_event_weighting: 'FORBIDDEN',
      game_effect: 'NONE',
      consent_required: true
    };
    assertNoGameCoupling(envelope, 'assignment');
    assertNoClientSecrets(envelope, 'assignment');
    if (this.signAssignment) envelope.signature = await this.signAssignment(clone(envelope));
    return Object.freeze(envelope);
  }

  async dispatchReady({ now = Date.now(), limit = null } = {}) {
    const at = nowMs(now);
    await this.reap(at);
    let budget = Math.max(1, Math.min(Number(limit || this.policy.max_dispatch_per_tick), Number(this.policy.max_dispatch_per_tick)));
    const sent = [];

    const jobs = [...this.jobs.values()]
      .filter(j => j.state === 'QUEUED' || j.state === 'RUNNING')
      .sort((a, b) => b.priority - a.priority || a.created_at_ms - b.created_at_ms || a.job_id.localeCompare(b.job_id));

    for (const job of jobs) {
      if (budget <= 0) break;
      if (job.deadline_ms != null && at > job.deadline_ms) {
        this.#failJob(job, 'JOB_DEADLINE_EXCEEDED', at);
        continue;
      }

      for (const chunk of job.chunks) {
        if (budget <= 0) break;
        if (chunk.state !== 'QUEUED') continue;
        const node = this.nodes.eligible(job.required_capabilities, at, this.policy)[0];
        if (!node) break;
        const lease = this.#leaseChunk(job, chunk, node, at);
        if (!lease) continue;
        const envelope = await this.#assignmentEnvelope(job, chunk, lease);
        try {
          const accepted = await this.transport.assign(node.node_id, envelope);
          if (accepted === false) throw new Error('TRANSPORT_ASSIGN_REJECTED');
          sent.push({ node_id: node.node_id, assignment: clone(envelope) });
          budget -= 1;
        } catch (error) {
          this.nodes.releaseInflight(node.node_id, { failed: true });
          this.leases.delete(chunk.chunk_id);
          chunk.lease = null;
          chunk.state = chunk.attempt >= Number(this.policy.max_attempts) ? 'FAILED' : 'QUEUED';
          chunk.last_error = String(error?.message || error || 'TRANSPORT_ASSIGN_FAILED');
          this.#evaluateJob(job, at);
        }
      }
    }
    return sent;
  }

  acknowledge({ job_id, chunk_id, node_id, lease_id }, at = Date.now()) {
    const timestamp = nowMs(at);
    const { job, chunk, lease } = this.#assertCurrentLease({ job_id, chunk_id, node_id, lease_id }, timestamp, { allowExpired: false });
    if (timestamp > lease.ack_deadline_ms) throw new Error('ACK_DEADLINE_EXCEEDED');
    lease.acked = true;
    chunk.state = 'ACKED';
    return clone({ job_id: job.job_id, chunk_id: chunk.chunk_id, lease_id: lease.lease_id, acked: true });
  }

  renewLease({ job_id, chunk_id, node_id, lease_id }, at = Date.now()) {
    const timestamp = nowMs(at);
    const { chunk, lease } = this.#assertCurrentLease({ job_id, chunk_id, node_id, lease_id }, timestamp, { allowExpired: false });
    if (!lease.acked) throw new Error('LEASE_NOT_ACKED');
    lease.expires_at_ms = timestamp + Number(this.policy.lease_ttl_ms);
    chunk.state = 'ACKED';
    return clone(lease);
  }

  #assertCurrentLease({ job_id, chunk_id, node_id, lease_id }, at, { allowExpired = false } = {}) {
    const job = this.jobs.get(String(job_id));
    if (!job) throw new Error('JOB_NOT_FOUND');
    const chunk = this.chunks.get(String(chunk_id));
    if (!chunk || !job.chunks.includes(chunk)) throw new Error('CHUNK_NOT_FOUND');
    const lease = chunk.lease;
    if (!lease) throw new Error('LEASE_NOT_FOUND');
    if (String(lease.lease_id) !== String(lease_id)) throw new Error('STALE_FENCING_TOKEN');
    if (String(lease.node_id) !== String(node_id)) throw new Error('LEASE_NODE_MISMATCH');
    if (!allowExpired && at > lease.expires_at_ms) throw new Error('LEASE_EXPIRED');
    return { job, chunk, lease };
  }

  async submitResult(input, at = Date.now()) {
    assertObject(input, 'RESULT');
    assertNoGameCoupling(input, 'result');
    assertNoClientSecrets(input, 'result');
    walkForbidden(input, 'result');
    const timestamp = nowMs(at);
    const { job, chunk, lease } = this.#assertCurrentLease(input, timestamp, { allowExpired: false });
    if (!lease.acked) throw new Error('RESULT_BEFORE_ACK_FORBIDDEN');
    if (!this.nodes.isLive(this.nodes.nodes.get(lease.node_id), timestamp)) throw new Error('RESULT_FROM_STALE_OR_REVOKED_NODE');

    const payload = clone(input.output ?? input.result ?? null);
    const bytes = new TextEncoder().encode(JSON.stringify(payload)).byteLength;
    if (bytes > Number(this.policy.max_result_bytes)) throw new Error('RESULT_TOO_LARGE');

    chunk.state = 'VERIFYING';
    const verification = await this.verifier({
      schema: SWARM_RESULT_SCHEMA,
      job: clone({
        job_id: job.job_id,
        workload_id: job.workload_id,
        artifact_digest: job.artifact_digest,
        type: job.type,
        route_class: job.route_class,
        metadata: job.metadata
      }),
      chunk: clone({ chunk_id: chunk.chunk_id, index: chunk.index, input: chunk.input }),
      assignment: clone({ lease_id: lease.lease_id, node_id: lease.node_id, attempt: lease.attempt }),
      output: payload
    });

    const ok = verification === true || verification?.ok === true;
    if (!ok) {
      this.nodes.releaseInflight(lease.node_id, { failed: true });
      this.leases.delete(chunk.chunk_id);
      chunk.lease = null;
      chunk.result = null;
      chunk.last_error = String(verification?.reason || 'VERIFIER_REJECTED');
      chunk.state = chunk.attempt >= Number(this.policy.max_attempts) ? 'FAILED' : 'QUEUED';
      this.#evaluateJob(job, timestamp);
      return { accepted: false, requeued: chunk.state === 'QUEUED', reason: chunk.last_error };
    }

    chunk.result = payload;
    chunk.verified_at_ms = timestamp;
    chunk.state = 'VERIFIED';
    chunk.last_error = null;
    this.nodes.releaseInflight(lease.node_id, { completed: true });
    this.leases.delete(chunk.chunk_id);
    chunk.lease = null;
    const completed = await this.#evaluateJob(job, timestamp);
    return { accepted: true, job_complete: completed, chunk_id: chunk.chunk_id };
  }

  async #evaluateJob(job, at) {
    if (job.state === 'CANCELLED' || job.state === 'FAILED' || job.state === 'COMPLETE') return job.state === 'COMPLETE';
    if (job.chunks.some(c => c.state === 'FAILED')) {
      this.#failJob(job, 'CHUNK_MAX_ATTEMPTS_EXCEEDED', at);
      return false;
    }
    if (!job.chunks.every(c => c.state === 'VERIFIED')) return false;

    const ordered = [...job.chunks].sort((a, b) => a.index - b.index);
    const aggregate = this.aggregator
      ? await this.aggregator({
          job: clone({ job_id: job.job_id, workload_id: job.workload_id, artifact_digest: job.artifact_digest, metadata: job.metadata }),
          results: ordered.map(c => clone(c.result))
        })
      : ordered.map(c => clone(c.result));

    job.state = 'COMPLETE';
    job.completed_at_ms = at;
    job.receipt = Object.freeze({
      schema: SWARM_RECEIPT_SCHEMA,
      swarm_version: HELIOS_SWARM_VERSION,
      job_id: job.job_id,
      workload_id: job.workload_id,
      artifact_digest: job.artifact_digest,
      chunk_count: job.chunks.length,
      attempts_total: job.chunks.reduce((sum, c) => sum + c.attempt, 0),
      completed_at_ms: at,
      aggregate,
      scheduling_basis: this.policy.scheduling_basis,
      game_event_weighting: 'FORBIDDEN',
      game_effect: 'NONE'
    });
    this.receipts.push(job.receipt);
    return true;
  }

  #failJob(job, reason, at) {
    job.state = 'FAILED';
    job.failure_reason = String(reason);
    job.completed_at_ms = at;
    for (const chunk of job.chunks) {
      if (chunk.lease) {
        this.nodes.releaseInflight(chunk.lease.node_id, { failed: true });
        this.leases.delete(chunk.chunk_id);
        chunk.lease = null;
      }
      if (chunk.state !== 'VERIFIED') chunk.state = 'FAILED';
    }
  }

  async reap(at = Date.now()) {
    const timestamp = nowMs(at);
    const events = [];
    for (const job of this.jobs.values()) {
      if (job.state !== 'RUNNING' && job.state !== 'QUEUED') continue;
      for (const chunk of job.chunks) {
        const lease = chunk.lease;
        if (!lease) continue;
        const node = this.nodes.nodes.get(lease.node_id);
        const nodeLive = this.nodes.isLive(node, timestamp);
        const ackExpired = !lease.acked && timestamp > lease.ack_deadline_ms;
        const leaseExpired = timestamp > lease.expires_at_ms;
        if (!nodeLive || ackExpired || leaseExpired) {
          this.nodes.releaseInflight(lease.node_id, { failed: true });
          this.leases.delete(chunk.chunk_id);
          chunk.lease = null;
          chunk.last_error = !nodeLive ? 'NODE_STALE_OR_REVOKED' : ackExpired ? 'ACK_TIMEOUT' : 'LEASE_EXPIRED';
          chunk.state = chunk.attempt >= Number(this.policy.max_attempts) ? 'FAILED' : 'QUEUED';
          events.push({ job_id: job.job_id, chunk_id: chunk.chunk_id, old_lease_id: lease.lease_id, reason: chunk.last_error, requeued: chunk.state === 'QUEUED' });
        }
      }
      await this.#evaluateJob(job, timestamp);
    }
    return events;
  }

  async cancelJob(jobId, reason = 'CANCELLED_BY_OPERATOR', at = Date.now()) {
    const job = this.jobs.get(String(jobId));
    if (!job) return false;
    if (job.state === 'COMPLETE' || job.state === 'FAILED' || job.state === 'CANCELLED') return false;
    const timestamp = nowMs(at);
    for (const chunk of job.chunks) {
      if (chunk.lease) {
        const lease = chunk.lease;
        this.nodes.releaseInflight(lease.node_id);
        this.leases.delete(chunk.chunk_id);
        if (typeof this.transport.cancel === 'function') {
          try { await this.transport.cancel(lease.node_id, { job_id: job.job_id, chunk_id: chunk.chunk_id, lease_id: lease.lease_id }); } catch (_) {}
        }
        chunk.lease = null;
      }
      if (chunk.state !== 'VERIFIED') chunk.state = 'CANCELLED';
    }
    job.state = 'CANCELLED';
    job.failure_reason = String(reason);
    job.cancelled_at_ms = timestamp;
    return true;
  }

  revokeNode(nodeId) {
    return this.nodes.revoke(nodeId);
  }

  snapshot(at = Date.now()) {
    const timestamp = nowMs(at);
    return {
      schema: 'janus.helios.swarm.snapshot.v1',
      swarm_version: HELIOS_SWARM_VERSION,
      now_ms: timestamp,
      policy: clone({
        node_ttl_ms: this.policy.node_ttl_ms,
        lease_ttl_ms: this.policy.lease_ttl_ms,
        ack_timeout_ms: this.policy.ack_timeout_ms,
        max_attempts: this.policy.max_attempts,
        scheduling_basis: this.policy.scheduling_basis,
        game_event_weighting: 'FORBIDDEN',
        game_effect: 'NONE'
      }),
      nodes: this.nodes.snapshot(timestamp),
      jobs: [...this.jobs.keys()].map(id => this.jobSnapshot(id)),
      receipt_count: this.receipts.length
    };
  }
}
