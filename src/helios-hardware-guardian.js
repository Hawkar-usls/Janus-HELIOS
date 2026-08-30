export const HELIOS_HARDWARE_GUARDIAN_VERSION = '1.0.0';
export const HARDWARE_GUARDIAN_DECISION_SCHEMA = 'janus.helios.hardware-guardian.decision.v1';

const HUMAN_OBSERVATION_KEYS = new Set([
  'audio', 'audio_spectrum', 'microphone', 'camera', 'screen', 'screenshot',
  'keyboard', 'keystrokes', 'mouse', 'clipboard', 'window_title', 'active_window',
  'browser_history', 'url_history', 'game_name', 'process_name', 'processes',
  'top_processes', 'typed_text', 'voice', 'webcam'
]);

const STATES = Object.freeze(['GREEN', 'WATCH', 'THROTTLE', 'COOLDOWN', 'BLOCK', 'UNKNOWN']);
export const HARDWARE_GUARDIAN_STATES = STATES;

function clamp(value, min, max) {
  const n = Number(value);
  return Number.isFinite(n) ? Math.max(min, Math.min(max, n)) : min;
}

function optionalNumber(value) {
  if (value == null || value === '') return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

function percent(value) {
  const n = optionalNumber(value);
  if (n == null) return null;
  return clamp(n <= 1 ? n * 100 : n, 0, 100);
}

function stableString(value, fallback = '') {
  return value == null ? fallback : String(value);
}

export function assertHardwareOnlyTelemetry(value, path = 'telemetry') {
  if (!value || typeof value !== 'object') return true;
  if (Array.isArray(value)) {
    value.forEach((entry, index) => assertHardwareOnlyTelemetry(entry, `${path}[${index}]`));
    return true;
  }
  for (const [key, nested] of Object.entries(value)) {
    if (HUMAN_OBSERVATION_KEYS.has(String(key).toLowerCase())) {
      throw new Error(`HUMAN_OBSERVATION_FORBIDDEN:${path}.${key}`);
    }
    assertHardwareOnlyTelemetry(nested, `${path}.${key}`);
  }
  return true;
}

export function normalizeGuardianPolicy(input = {}) {
  const missing = String(input.missing_thermal_sensor_action || 'LIMIT').toUpperCase();
  if (!['LIMIT', 'BLOCK'].includes(missing)) throw new Error('INVALID_MISSING_THERMAL_SENSOR_ACTION');
  return Object.freeze({
    enabled: input.enabled !== false,
    max_temp_c: clamp(input.max_temp_c ?? 80, 45, 95),
    thermal_margin_c: clamp(input.thermal_margin_c ?? 10, 3, 25),
    thermal_recovery_margin_c: clamp(input.thermal_recovery_margin_c ?? 15, 5, 30),
    vendor_safety_margin_c: clamp(input.vendor_safety_margin_c ?? 5, 0, 20),
    max_temp_rise_c_per_min: clamp(input.max_temp_rise_c_per_min ?? 3, 0.5, 20),
    max_watts: Math.max(0, Number(input.max_watts || 0)),
    power_watch_ratio: clamp(input.power_watch_ratio ?? 0.90, 0.50, 0.99),
    battery_allowed: input.battery_allowed === true,
    min_battery_percent: clamp(input.min_battery_percent ?? 40, 5, 100),
    min_available_memory_mb: Math.max(0, Math.floor(Number(input.min_available_memory_mb ?? 1024))),
    min_available_vram_mb: Math.max(0, Math.floor(Number(input.min_available_vram_mb ?? 512))),
    max_host_cpu_load_percent: clamp(input.max_host_cpu_load_percent ?? 90, 30, 100),
    max_host_gpu_load_percent: clamp(input.max_host_gpu_load_percent ?? 95, 30, 100),
    missing_thermal_sensor_action: missing,
    unknown_sensor_scale: clamp(input.unknown_sensor_scale ?? 0.35, 0.05, 0.75),
    watch_scale: clamp(input.watch_scale ?? 0.80, 0.25, 1),
    throttle_scale: clamp(input.throttle_scale ?? 0.50, 0.10, 0.90),
    cooldown_hold_ms: Math.max(0, Math.floor(Number(input.cooldown_hold_ms ?? 30_000)))
  });
}

function temperatureSnapshot(telemetry) {
  const entries = [
    ['cpu', optionalNumber(telemetry.cpu_temperature_c)],
    ['gpu', optionalNumber(telemetry.gpu_temperature_c)],
    ['gpu_hotspot', optionalNumber(telemetry.gpu_hotspot_temperature_c)],
    ['vram', optionalNumber(telemetry.vram_temperature_c)],
    ['fallback', optionalNumber(telemetry.temperature_c)]
  ].filter(([, value]) => value != null && value >= -20 && value <= 150);
  if (!entries.length) return { max_temp_c: null, hottest_sensor: null, sensors: [] };
  entries.sort((a, b) => b[1] - a[1]);
  return {
    max_temp_c: entries[0][1],
    hottest_sensor: entries[0][0],
    sensors: entries.map(([sensor, value]) => ({ sensor, temperature_c: value }))
  };
}

function effectiveThermalLimit(policy, telemetry) {
  const candidates = [policy.max_temp_c];
  const slowdown = optionalNumber(telemetry.vendor_slowdown_temp_c);
  const shutdown = optionalNumber(telemetry.vendor_shutdown_temp_c);
  if (slowdown != null) candidates.push(slowdown - policy.vendor_safety_margin_c);
  if (shutdown != null) candidates.push(shutdown - Math.max(policy.vendor_safety_margin_c, 8));
  return Math.max(40, Math.min(...candidates));
}

function healthScore({ thermalHeadroom, powerHeadroom, memoryHeadroom, vramHeadroom, batteryHeadroom, telemetryKnown }) {
  const values = [thermalHeadroom, powerHeadroom, memoryHeadroom, vramHeadroom, batteryHeadroom]
    .filter(value => value != null)
    .map(value => clamp(value, 0, 1));
  if (!values.length) return telemetryKnown ? 0.5 : 0.25;
  return clamp(Math.min(...values), 0, 1);
}

export function evaluateHardwareSnapshot(telemetry = {}, rawPolicy = {}, context = {}) {
  assertHardwareOnlyTelemetry(telemetry);
  const policy = normalizeGuardianPolicy(rawPolicy);
  const resourceClass = stableString(context.resource_class || 'CPU', 'CPU').toUpperCase();
  const trendCPerMin = optionalNumber(context.temp_rise_c_per_min);

  if (!policy.enabled) {
    return Object.freeze({
      schema: HARDWARE_GUARDIAN_DECISION_SCHEMA,
      version: HELIOS_HARDWARE_GUARDIAN_VERSION,
      state: 'GREEN',
      allow_execution: true,
      allowed_load_scale: 1,
      health_score: 1,
      reasons: ['GUARDIAN_DISABLED_BY_LOCAL_POLICY'],
      resource_class: resourceClass,
      sensor_scope: 'HARDWARE_ONLY',
      human_observation: 'FORBIDDEN'
    });
  }

  const temp = temperatureSnapshot(telemetry);
  const thermalLimit = effectiveThermalLimit(policy, telemetry);
  const watts = optionalNumber(telemetry.estimated_watts ?? telemetry.power_w);
  const powerLimitTelemetry = optionalNumber(telemetry.power_limit_w);
  const configuredPowerLimit = policy.max_watts > 0 ? policy.max_watts : null;
  const effectivePowerLimit = [configuredPowerLimit, powerLimitTelemetry].filter(v => v != null && v > 0).reduce((a, b) => Math.min(a, b), Infinity);
  const powerLimit = Number.isFinite(effectivePowerLimit) ? effectivePowerLimit : null;
  const battery = optionalNumber(telemetry.battery_percent);
  const onAc = telemetry.on_ac_power !== false;
  const freeMemory = optionalNumber(telemetry.available_memory_mb);
  const freeVram = optionalNumber(telemetry.available_vram_mb);
  const cpuLoad = percent(telemetry.cpu_load);
  const gpuLoad = percent(telemetry.gpu_load);

  const reasons = [];
  let state = 'GREEN';
  let scale = 1;
  let allow = true;

  const worsen = (nextState, nextScale, reason, nextAllow = true) => {
    const rank = { GREEN: 0, WATCH: 1, THROTTLE: 2, UNKNOWN: 3, COOLDOWN: 4, BLOCK: 5 };
    reasons.push(reason);
    if (rank[nextState] > rank[state]) state = nextState;
    scale = Math.min(scale, nextScale);
    allow = allow && nextAllow;
  };

  if (temp.max_temp_c == null) {
    if (policy.missing_thermal_sensor_action === 'BLOCK') worsen('BLOCK', 0, 'THERMAL_SENSOR_REQUIRED_BUT_UNAVAILABLE', false);
    else worsen('UNKNOWN', policy.unknown_sensor_scale, 'THERMAL_SENSOR_UNAVAILABLE_LIMITED_MODE');
  } else {
    const watchAt = thermalLimit - policy.thermal_margin_c;
    if (temp.max_temp_c >= thermalLimit) {
      worsen('BLOCK', 0, `THERMAL_LIMIT_REACHED:${temp.hottest_sensor}`, false);
    } else if (temp.max_temp_c >= watchAt) {
      worsen('THROTTLE', policy.throttle_scale, `THERMAL_HEADROOM_LOW:${temp.hottest_sensor}`);
    }
    if (trendCPerMin != null && trendCPerMin > policy.max_temp_rise_c_per_min) {
      worsen('THROTTLE', policy.throttle_scale, 'THERMAL_RISE_RATE_HIGH');
    }
  }

  if (!onAc) {
    if (!policy.battery_allowed) worsen('BLOCK', 0, 'BATTERY_OPERATION_FORBIDDEN', false);
    else if (battery != null && battery < policy.min_battery_percent) worsen('BLOCK', 0, 'BATTERY_RESERVE_TOO_LOW', false);
    else worsen('WATCH', policy.watch_scale, 'RUNNING_ON_BATTERY');
  }

  if (powerLimit != null && watts != null) {
    if (watts >= powerLimit) worsen('BLOCK', 0, 'POWER_LIMIT_REACHED', false);
    else if (watts >= powerLimit * policy.power_watch_ratio) worsen('THROTTLE', policy.throttle_scale, 'POWER_HEADROOM_LOW');
  }

  if (freeMemory != null && freeMemory < policy.min_available_memory_mb) worsen('THROTTLE', policy.throttle_scale, 'HOST_MEMORY_RESERVE_LOW');
  if ((resourceClass === 'GPU' || resourceClass === 'HYBRID') && freeVram != null && freeVram < policy.min_available_vram_mb) worsen('THROTTLE', policy.throttle_scale, 'VRAM_RESERVE_LOW');
  if ((resourceClass === 'CPU' || resourceClass === 'HYBRID') && cpuLoad != null && cpuLoad >= policy.max_host_cpu_load_percent) worsen('THROTTLE', policy.throttle_scale, 'HOST_CPU_ALREADY_BUSY');
  if ((resourceClass === 'GPU' || resourceClass === 'HYBRID') && gpuLoad != null && gpuLoad >= policy.max_host_gpu_load_percent) worsen('THROTTLE', policy.throttle_scale, 'HOST_GPU_ALREADY_BUSY');

  const thermalHeadroom = temp.max_temp_c == null ? null : (thermalLimit - temp.max_temp_c) / Math.max(1, policy.thermal_margin_c);
  const powerHeadroom = powerLimit == null || watts == null ? null : (powerLimit - watts) / Math.max(1, powerLimit * (1 - policy.power_watch_ratio));
  const memoryHeadroom = freeMemory == null || policy.min_available_memory_mb <= 0 ? null : freeMemory / Math.max(1, policy.min_available_memory_mb * 2);
  const vramHeadroom = freeVram == null || policy.min_available_vram_mb <= 0 ? null : freeVram / Math.max(1, policy.min_available_vram_mb * 2);
  const batteryHeadroom = onAc || battery == null ? null : (battery - policy.min_battery_percent) / Math.max(1, 100 - policy.min_battery_percent);

  if (!reasons.length) reasons.push('HARDWARE_HEADROOM_ACCEPTABLE');

  return Object.freeze({
    schema: HARDWARE_GUARDIAN_DECISION_SCHEMA,
    version: HELIOS_HARDWARE_GUARDIAN_VERSION,
    state,
    allow_execution: allow && scale > 0,
    allowed_load_scale: Number(scale.toFixed(3)),
    health_score: Number(healthScore({
      thermalHeadroom,
      powerHeadroom,
      memoryHeadroom,
      vramHeadroom,
      batteryHeadroom,
      telemetryKnown: temp.max_temp_c != null || watts != null
    }).toFixed(3)),
    reasons,
    resource_class: resourceClass,
    hottest_sensor: temp.hottest_sensor,
    observed_max_temp_c: temp.max_temp_c,
    effective_thermal_limit_c: Number(thermalLimit.toFixed(1)),
    estimated_watts: watts,
    effective_power_limit_w: powerLimit,
    temp_rise_c_per_min: trendCPerMin,
    sensor_scope: 'HARDWARE_ONLY',
    human_observation: 'FORBIDDEN',
    privacy_boundary: 'NO_SCREEN_AUDIO_KEYBOARD_MOUSE_OR_CONTENT_TELEMETRY'
  });
}

export class HeliosHardwareGuardian {
  constructor(policy = {}) {
    this.policy = normalizeGuardianPolicy(policy);
    this.samples = [];
    this.cooldownUntilMs = 0;
    this.lastDecision = null;
  }

  updatePolicy(policy = {}) {
    this.policy = normalizeGuardianPolicy({ ...this.policy, ...policy });
    return this.policy;
  }

  _temperatureTrend(telemetry, nowMs) {
    const snapshot = temperatureSnapshot(telemetry);
    if (snapshot.max_temp_c == null) return null;
    this.samples.push({ at_ms: nowMs, temp_c: snapshot.max_temp_c });
    const cutoff = nowMs - 120_000;
    this.samples = this.samples.filter(sample => sample.at_ms >= cutoff).slice(-24);
    if (this.samples.length < 2) return 0;
    const first = this.samples[0];
    const minutes = Math.max(1 / 60, (nowMs - first.at_ms) / 60_000);
    return (snapshot.max_temp_c - first.temp_c) / minutes;
  }

  evaluate(telemetry = {}, context = {}) {
    const nowMs = Number.isFinite(Number(context.now_ms)) ? Number(context.now_ms) : Date.now();
    const trend = this._temperatureTrend(telemetry, nowMs);
    let decision = evaluateHardwareSnapshot(telemetry, this.policy, {
      ...context,
      temp_rise_c_per_min: trend
    });

    if (decision.state === 'BLOCK' && decision.reasons.some(reason => reason.startsWith('THERMAL_'))) {
      this.cooldownUntilMs = Math.max(this.cooldownUntilMs, nowMs + this.policy.cooldown_hold_ms);
    }

    if (decision.state !== 'BLOCK' && this.cooldownUntilMs > nowMs) {
      const recoveryTemp = decision.observed_max_temp_c;
      const recoveryLimit = decision.effective_thermal_limit_c - this.policy.thermal_recovery_margin_c;
      if (recoveryTemp == null || recoveryTemp > recoveryLimit) {
        decision = Object.freeze({
          ...decision,
          state: 'COOLDOWN',
          allow_execution: false,
          allowed_load_scale: 0,
          reasons: [...decision.reasons, 'THERMAL_COOLDOWN_LATCH_ACTIVE']
        });
      } else {
        this.cooldownUntilMs = 0;
      }
    }

    this.lastDecision = decision;
    return decision;
  }

  getState() {
    return this.lastDecision ? { ...this.lastDecision, reasons: [...this.lastDecision.reasons] } : null;
  }
}

export function tightenExecutionBudgetForGuardian(budget, decision) {
  if (!budget || typeof budget !== 'object') throw new Error('EXECUTION_BUDGET_REQUIRED');
  if (!decision || typeof decision !== 'object') throw new Error('GUARDIAN_DECISION_REQUIRED');
  if (!decision.allow_execution || Number(decision.allowed_load_scale) <= 0) throw new Error(`HARDWARE_GUARDIAN_BLOCK:${decision.state}`);
  const scale = clamp(decision.allowed_load_scale, 0.01, 1);
  return Object.freeze({
    ...budget,
    cpu_limit_percent: Math.max(1, Math.floor(Number(budget.cpu_limit_percent) * scale)),
    gpu_limit_percent: Math.max(1, Math.floor(Number(budget.gpu_limit_percent) * scale)),
    max_watts: Number(budget.max_watts) > 0 ? Math.max(1, Math.floor(Number(budget.max_watts) * scale)) : Number(budget.max_watts || 0),
    guardian_scale: Number(scale.toFixed(3)),
    guardian_state: stableString(decision.state, 'UNKNOWN')
  });
}
