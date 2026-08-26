export const HELIOS_ROUTER_VERSION = '1.0.0';

export const ROUTE_CLASSES = Object.freeze([
  'SCIENCE',
  'PUBLIC_GOOD',
  'MARKETPLACE',
  'TREASURY',
  'DATACENTER',
  'OPERATOR',
  'CUSTOM'
]);

export const TASK_TYPES = Object.freeze([
  'SCIENCE_WORK_UNIT',
  'GENERAL_COMPUTE_JOB',
  'ECONOMIC_COMPUTE_JOB',
  'POW_SHARE'
]);

const FORBIDDEN_GAME_KEYS = new Set([
  'spin_id', 'wager_id', 'bet', 'rtp', 'odds', 'win_probability',
  'payout_multiplier', 'free_spins', 'personal_jackpot_weight',
  'loss_rebate', 'bonus_multiplier', 'chasing_score'
]);

const SECRET_KEYS = new Set([
  'secret', 'password', 'private_key', 'privateKey', 'wallet_seed',
  'seed_phrase', 'mnemonic', 'api_key', 'apiKey', 'app_key', 'appKey',
  'access_token', 'refresh_token', 'authorization'
]);

function assertObject(value, name) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new Error(`${name}_MUST_BE_OBJECT`);
  }
}

function walk(value, path, forbiddenSet, code) {
  if (!value || typeof value !== 'object') return;
  for (const [key, nested] of Object.entries(value)) {
    if (forbiddenSet.has(key)) throw new Error(`${code}:${path}.${key}`);
    walk(nested, `${path}.${key}`, forbiddenSet, code);
  }
}

export function assertNoGameCoupling(value, path = 'root') {
  walk(value, path, FORBIDDEN_GAME_KEYS, 'FORBIDDEN_GAME_COUPLING');
  return true;
}

export function assertNoClientSecrets(value, path = 'root') {
  walk(value, path, SECRET_KEYS, 'CLIENT_SECRET_FORBIDDEN');
  return true;
}

export function validateProviderManifest(input) {
  assertObject(input, 'PROVIDER_MANIFEST');
  assertNoGameCoupling(input, 'provider');
  assertNoClientSecrets(input, 'provider');

  if (!input.provider_id || typeof input.provider_id !== 'string') throw new Error('PROVIDER_ID_REQUIRED');
  if (!input.display_name || typeof input.display_name !== 'string') throw new Error('DISPLAY_NAME_REQUIRED');
  if (!ROUTE_CLASSES.includes(input.route_class)) throw new Error('INVALID_ROUTE_CLASS');
  if (!Array.isArray(input.task_types) || input.task_types.length === 0) throw new Error('TASK_TYPES_REQUIRED');
  for (const type of input.task_types) {
    if (!TASK_TYPES.includes(type)) throw new Error(`UNSUPPORTED_TASK_TYPE:${type}`);
  }
  if (!Array.isArray(input.receipt_kinds) || input.receipt_kinds.length === 0) throw new Error('RECEIPT_KINDS_REQUIRED');
  if (input.enabled !== true && input.enabled !== false) throw new Error('ENABLED_BOOLEAN_REQUIRED');

  return Object.freeze({
    manifest_version: String(input.manifest_version || '1.0.0'),
    provider_id: input.provider_id,
    display_name: input.display_name,
    route_class: input.route_class,
    task_types: Object.freeze([...new Set(input.task_types)]),
    receipt_kinds: Object.freeze([...new Set(input.receipt_kinds.map(String))]),
    gateway_alias: String(input.gateway_alias || input.provider_id),
    sink_policy: Object.freeze(structuredClone(input.sink_policy || { mode: 'AUDITED' })),
    capability_tags: Object.freeze([...(input.capability_tags || []).map(String)]),
    enabled: input.enabled,
    metadata: Object.freeze(structuredClone(input.metadata || {}))
  });
}

export class ProviderRegistry {
  constructor(manifests = []) {
    this.providers = new Map();
    manifests.forEach((m) => this.register(m));
  }

  register(manifest) {
    const p = validateProviderManifest(manifest);
    if (this.providers.has(p.provider_id)) throw new Error(`DUPLICATE_PROVIDER:${p.provider_id}`);
    this.providers.set(p.provider_id, p);
    return p;
  }

  get(id) { return this.providers.get(id) || null; }

  list({ taskType = null, routeClass = null } = {}) {
    return [...this.providers.values()].filter((p) =>
      p.enabled &&
      (!taskType || p.task_types.includes(taskType)) &&
      (!routeClass || p.route_class === routeClass)
    );
  }
}

export function createRoutingPlan({ plan_id = 'default', allocations, policy = {} }) {
  if (!Array.isArray(allocations) || allocations.length === 0) throw new Error('ALLOCATIONS_REQUIRED');
  assertNoGameCoupling({ allocations, policy }, 'plan');
  assertNoClientSecrets(policy, 'plan.policy');

  const normalized = allocations.map((a) => {
    const weight = Number(a.weight);
    if (!a.provider_id || !Number.isFinite(weight) || weight <= 0 || weight > 1) {
      throw new Error('INVALID_ALLOCATION');
    }
    return Object.freeze({ provider_id: String(a.provider_id), weight });
  });

  const sum = normalized.reduce((n, x) => n + x.weight, 0);
  if (Math.abs(sum - 1) > 1e-9) throw new Error('ROUTE_WEIGHTS_MUST_SUM_TO_ONE');

  const safePolicy = structuredClone(policy);
  delete safePolicy.game_event_weighting;
  delete safePolicy.scheduling_basis;

  return Object.freeze({
    router_version: HELIOS_ROUTER_VERSION,
    plan_id: String(plan_id),
    allocations: Object.freeze(normalized),
    policy: Object.freeze({
      ...safePolicy,
      scheduling_basis: 'CONSENT_DEVICE_POLICY_PROVIDER_CAPACITY_AND_WORKLOAD_ADMISSION',
      game_event_weighting: 'FORBIDDEN',
      fail_closed: safePolicy.fail_closed !== false
    })
  });
}

export function selectProvider(plan, registry, { taskType, cursor = 0 } = {}) {
  if (!(registry instanceof ProviderRegistry)) throw new Error('REGISTRY_REQUIRED');
  if (!TASK_TYPES.includes(taskType)) throw new Error('VALID_TASK_TYPE_REQUIRED');
  if (plan.policy?.game_event_weighting !== 'FORBIDDEN') throw new Error('GAME_EVENT_WEIGHTING_MUST_BE_FORBIDDEN');

  for (const a of plan.allocations) {
    const p = registry.get(a.provider_id);
    if (!p || !p.enabled) throw new Error(`PROVIDER_UNAVAILABLE:${a.provider_id}`);
    if (!p.task_types.includes(taskType)) throw new Error(`PROVIDER_TASK_MISMATCH:${a.provider_id}`);
  }

  const x = ((Number(cursor) % 1) + 1) % 1;
  let acc = 0;
  for (const a of plan.allocations) {
    acc += a.weight;
    if (x < acc) return registry.get(a.provider_id);
  }
  return registry.get(plan.allocations.at(-1).provider_id);
}

export function createRouteDecision({ consentAllowed, task, plan, registry, schedulerCursor = 0 }) {
  if (consentAllowed !== true) throw new Error('COMPUTE_NOT_ALLOWED');
  assertObject(task, 'TASK');
  if (!TASK_TYPES.includes(task.type)) throw new Error('VALID_TASK_TYPE_REQUIRED');
  assertNoGameCoupling(task, 'task');

  const provider = selectProvider(plan, registry, { taskType: task.type, cursor: schedulerCursor });
  return Object.freeze({
    router_version: HELIOS_ROUTER_VERSION,
    task_id: String(task.task_id || 'unbound-demo-task'),
    task_type: task.type,
    provider_id: provider.provider_id,
    route_class: provider.route_class,
    gateway_alias: provider.gateway_alias,
    expected_receipt_kinds: provider.receipt_kinds,
    scheduling_basis: 'CONSENT_DEVICE_POLICY_PROVIDER_CAPACITY_AND_WORKLOAD_ADMISSION',
    game_event_weighting: 'FORBIDDEN',
    game_effect: 'NONE'
  });
}