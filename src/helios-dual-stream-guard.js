import {
  assertNoGameCoupling,
  assertNoClientSecrets
} from './helios-router.js';

export const HELIOS_DUAL_STREAM_GUARD_VERSION = '1.0.0';
export const DUAL_STREAM_DECISION_SCHEMA = 'janus.helios.dual-stream-safety.decision.v1';

const FORBIDDEN_HUMAN_STATE_KEYS = new Set([
  'fear', 'anger', 'despair', 'sadness', 'emotion', 'emotional_state',
  'vulnerability', 'player_vulnerability', 'problem_gambling', 'ludoman',
  'loss_streak', 'near_miss', 'wager_history', 'bet_history', 'personal_distress'
]);

const REQUIRED_HARD_GATES = Object.freeze([
  'consent_active',
  'immediate_revoke_available',
  'verifier_ready',
  'exact_artifact_bound',
  'telemetry_fresh'
]);

const RESERVE_FIELDS = Object.freeze([
  'thermal_headroom',
  'power_headroom',
  'memory_headroom',
  'verification_confidence',
  'rollback_readiness'
]);

function clone(value) { return structuredClone(value); }
function clamp01(value) {
  const n = Number(value);
  if (!Number.isFinite(n)) throw new Error('NORMALIZED_VALUE_REQUIRED');
  return Math.max(0, Math.min(1, n));
}
function assertObject(value, label) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error(`${label}_MUST_BE_OBJECT`);
}
function walkForbiddenHumanState(value, path = 'input') {
  if (!value || typeof value !== 'object') return;
  for (const [key, nested] of Object.entries(value)) {
    if (FORBIDDEN_HUMAN_STATE_KEYS.has(String(key).toLowerCase())) {
      throw new Error(`HUMAN_AFFECT_OR_VULNERABILITY_INPUT_FORBIDDEN:${path}.${key}`);
    }
    walkForbiddenHumanState(nested, `${path}.${key}`);
  }
}
function finitePositive(value, label, fallback) {
  const n = value == null ? Number(fallback) : Number(value);
  if (!Number.isFinite(n) || n <= 0) throw new Error(`${label}_MUST_BE_POSITIVE`);
  return n;
}
function norm(vector) {
  if (!Array.isArray(vector) || vector.length === 0) throw new Error('VECTOR_REQUIRED');
  return Math.sqrt(vector.reduce((sum, value) => {
    const n = Number(value);
    if (!Number.isFinite(n)) throw new Error('VECTOR_COMPONENT_MUST_BE_FINITE');
    return sum + n * n;
  }, 0));
}
function dot(a, b) {
  if (!Array.isArray(a) || !Array.isArray(b) || a.length !== b.length || a.length === 0) throw new Error('VECTOR_DIMENSION_MISMATCH');
  return a.reduce((sum, value, index) => sum + Number(value) * Number(b[index]), 0);
}

export function projectAwayFromUnsafeDirection(proposalVector, unsafeDirection) {
  if (!Array.isArray(proposalVector) || !Array.isArray(unsafeDirection) || proposalVector.length !== unsafeDirection.length || proposalVector.length === 0) {
    throw new Error('VECTOR_DIMENSION_MISMATCH');
  }
  const denominator = dot(unsafeDirection, unsafeDirection);
  if (!Number.isFinite(denominator) || denominator <= 1e-15) throw new Error('UNSAFE_DIRECTION_MUST_BE_NONZERO');
  const coefficient = dot(proposalVector, unsafeDirection) / denominator;
  return proposalVector.map((value, index) => Number(value) - coefficient * Number(unsafeDirection[index]));
}

export function deriveSystemRiskVector({
  cpu_load = 0,
  gpu_load = 0,
  temperature_c = 0,
  max_temp_c = 90,
  estimated_watts = 0,
  max_watts = 0,
  battery_percent = 100,
  on_ac_power = true
} = {}) {
  const cpu = clamp01(cpu_load);
  const gpu = clamp01(gpu_load);
  const tempLimit = finitePositive(max_temp_c, 'MAX_TEMP_C', 90);
  const thermal = Math.max(0, Math.min(1, Number(temperature_c || 0) / tempLimit));
  const power = Number(max_watts) > 0 ? Math.max(0, Math.min(1, Number(estimated_watts || 0) / Number(max_watts))) : 0;
  const battery = on_ac_power === false ? 1 - clamp01(Number(battery_percent || 0) / 100) : 0;
  return Object.freeze([cpu, gpu, thermal, Math.max(power, battery)]);
}

export function stepBoundedDualStream({
  state = {},
  risk_vector,
  params = {},
  dt = 0.1
} = {}) {
  assertObject(state, 'DUAL_STREAM_STATE');
  walkForbiddenHumanState({ state, risk_vector, params });
  const risk = norm(risk_vector);

  const a = finitePositive(params.a, 'A', 0.35);
  const b = finitePositive(params.b, 'B', 0.45);
  const gamma = finitePositive(params.gamma, 'GAMMA', 0.70);
  const d = finitePositive(params.d, 'D', 0.55);
  const e = finitePositive(params.e, 'E', 0.60);
  const f = finitePositive(params.f, 'F', 0.30);
  const rho = finitePositive(params.rho, 'RHO', 1.5);
  const base = Math.max(0, Number(params.safety_base ?? 0.25));
  const delta = finitePositive(dt, 'DT', 0.1);

  const currentChange = Math.max(0, Number(state.change_pressure || 0));
  const currentSafety = Math.max(base, Number(state.safety_reserve ?? base));

  const rawChange = Math.max(0, currentChange + delta * (a * risk - b * currentChange - gamma * currentSafety * currentChange));
  const rawSafety = Math.max(base, currentSafety + delta * (d * risk + e * currentChange - f * (currentSafety - base)));

  // Production interpretation of L >= rho*C: never fabricate safety reserve.
  // If measured/earned reserve is insufficient, constrain change pressure instead.
  const maxAdmissibleChange = rawSafety / rho;
  const changePressure = Math.min(rawChange, maxAdmissibleChange);

  return Object.freeze({
    change_pressure: changePressure,
    safety_reserve: rawSafety,
    raw_change_pressure: rawChange,
    max_admissible_change: maxAdmissibleChange,
    balance_limited: changePressure + 1e-12 < rawChange,
    risk_intensity: risk,
    rho
  });
}

export function evaluateSafetyBalance({
  change_pressure,
  evidence,
  rho = 1.5,
  metadata = {}
} = {}) {
  assertObject(evidence, 'SAFETY_EVIDENCE');
  assertNoGameCoupling({ change_pressure, evidence, metadata }, 'dual_stream_guard');
  assertNoClientSecrets({ evidence, metadata }, 'dual_stream_guard');
  walkForbiddenHumanState({ evidence, metadata });

  const changePressure = clamp01(change_pressure);
  const balanceRatio = finitePositive(rho, 'RHO', 1.5);

  const missingHardGates = REQUIRED_HARD_GATES.filter(key => evidence[key] !== true);
  if (missingHardGates.length) {
    return Object.freeze({
      schema: DUAL_STREAM_DECISION_SCHEMA,
      version: HELIOS_DUAL_STREAM_GUARD_VERSION,
      admitted: false,
      reason: 'HARD_SAFETY_GATE_MISSING',
      missing_hard_gates: missingHardGates,
      change_pressure: changePressure,
      safety_reserve: 0,
      max_admissible_change: 0,
      rho: balanceRatio,
      game_effect: 'NONE',
      game_event_weighting: 'FORBIDDEN'
    });
  }

  const reserveComponents = Object.fromEntries(RESERVE_FIELDS.map(key => [key, clamp01(evidence[key])]));
  // Safety is bottlenecked by the weakest required margin, not averaged away.
  const safetyReserve = Math.min(...Object.values(reserveComponents));
  const maxAdmissibleChange = Math.min(1, safetyReserve / balanceRatio);
  const admitted = changePressure <= maxAdmissibleChange + 1e-12;

  return Object.freeze({
    schema: DUAL_STREAM_DECISION_SCHEMA,
    version: HELIOS_DUAL_STREAM_GUARD_VERSION,
    admitted,
    reason: admitted ? 'SAFETY_BALANCE_ADMITTED' : 'SAFETY_RESERVE_BELOW_REQUIRED_BALANCE',
    change_pressure: changePressure,
    safety_reserve: safetyReserve,
    reserve_components: Object.freeze(reserveComponents),
    max_admissible_change: maxAdmissibleChange,
    required_safety_reserve: Math.min(1, balanceRatio * changePressure),
    rho: balanceRatio,
    game_effect: 'NONE',
    game_event_weighting: 'FORBIDDEN'
  });
}

export class HeliosDualStreamSafetyGuard {
  constructor({ rho = 1.5, reporter = null } = {}) {
    this.rho = finitePositive(rho, 'RHO', 1.5);
    this.reporter = reporter;
    this.sequence = 0;
  }

  async evaluate(input) {
    const decision = evaluateSafetyBalance({ ...clone(input), rho: this.rho });
    this.sequence += 1;
    if (typeof this.reporter === 'function') {
      await this.reporter(Object.freeze({
        ...clone(decision),
        sequence: this.sequence,
        observed_at_ms: Date.now()
      }));
    }
    return decision;
  }
}
