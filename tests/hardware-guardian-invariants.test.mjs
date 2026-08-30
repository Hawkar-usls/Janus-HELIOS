import assert from 'node:assert/strict';
import {
  HELIOS_HARDWARE_GUARDIAN_VERSION,
  HARDWARE_GUARDIAN_STATES,
  HeliosHardwareGuardian,
  assertHardwareOnlyTelemetry,
  evaluateHardwareSnapshot,
  tightenExecutionBudgetForGuardian
} from '../src/helios-hardware-guardian.js';

assert.equal(HELIOS_HARDWARE_GUARDIAN_VERSION, '1.0.0');
assert.deepEqual(HARDWARE_GUARDIAN_STATES, ['GREEN', 'WATCH', 'THROTTLE', 'COOLDOWN', 'BLOCK', 'UNKNOWN']);

const basePolicy = {
  max_temp_c: 80,
  thermal_margin_c: 10,
  thermal_recovery_margin_c: 15,
  max_watts: 250,
  battery_allowed: false,
  min_available_memory_mb: 1024,
  min_available_vram_mb: 512,
  missing_thermal_sensor_action: 'LIMIT'
};

const safe = evaluateHardwareSnapshot({
  cpu_load: 20,
  gpu_load: 30,
  cpu_temperature_c: 52,
  gpu_temperature_c: 58,
  available_memory_mb: 12000,
  available_vram_mb: 9000,
  estimated_watts: 130,
  battery_percent: 100,
  on_ac_power: true
}, basePolicy, { resource_class: 'HYBRID', temp_rise_c_per_min: 0.5 });
assert.equal(safe.state, 'GREEN');
assert.equal(safe.allow_execution, true);
assert.equal(safe.allowed_load_scale, 1);
assert.equal(safe.sensor_scope, 'HARDWARE_ONLY');
assert.equal(safe.human_observation, 'FORBIDDEN');

const hot = evaluateHardwareSnapshot({
  gpu_temperature_c: 75,
  available_memory_mb: 12000,
  available_vram_mb: 9000,
  estimated_watts: 130,
  on_ac_power: true
}, basePolicy, { resource_class: 'GPU', temp_rise_c_per_min: 1 });
assert.equal(hot.state, 'THROTTLE');
assert.equal(hot.allow_execution, true);
assert.equal(hot.allowed_load_scale, 0.5);
assert.match(hot.reasons.join('|'), /THERMAL_HEADROOM_LOW/);

const vendorLimited = evaluateHardwareSnapshot({
  gpu_temperature_c: 70,
  vendor_slowdown_temp_c: 78,
  available_vram_mb: 9000,
  estimated_watts: 100,
  on_ac_power: true
}, basePolicy, { resource_class: 'GPU' });
assert.equal(vendorLimited.effective_thermal_limit_c, 73);
assert.equal(vendorLimited.state, 'THROTTLE');

const overheated = evaluateHardwareSnapshot({
  gpu_hotspot_temperature_c: 82,
  available_vram_mb: 9000,
  estimated_watts: 140,
  on_ac_power: true
}, basePolicy, { resource_class: 'GPU' });
assert.equal(overheated.state, 'BLOCK');
assert.equal(overheated.allow_execution, false);
assert.equal(overheated.allowed_load_scale, 0);

const powerPressure = evaluateHardwareSnapshot({
  gpu_temperature_c: 55,
  available_vram_mb: 9000,
  estimated_watts: 230,
  on_ac_power: true
}, basePolicy, { resource_class: 'GPU' });
assert.equal(powerPressure.state, 'THROTTLE');
assert.match(powerPressure.reasons.join('|'), /POWER_HEADROOM_LOW/);

const batteryBlock = evaluateHardwareSnapshot({
  cpu_temperature_c: 50,
  available_memory_mb: 12000,
  estimated_watts: 60,
  battery_percent: 80,
  on_ac_power: false
}, basePolicy, { resource_class: 'CPU' });
assert.equal(batteryBlock.state, 'BLOCK');
assert.match(batteryBlock.reasons.join('|'), /BATTERY_OPERATION_FORBIDDEN/);

const unknownLimited = evaluateHardwareSnapshot({
  available_memory_mb: 12000,
  estimated_watts: 60,
  on_ac_power: true
}, basePolicy, { resource_class: 'CPU' });
assert.equal(unknownLimited.state, 'UNKNOWN');
assert.equal(unknownLimited.allow_execution, true);
assert.equal(unknownLimited.allowed_load_scale, 0.35);

const unknownBlocked = evaluateHardwareSnapshot({
  available_memory_mb: 12000,
  estimated_watts: 60,
  on_ac_power: true
}, { ...basePolicy, missing_thermal_sensor_action: 'BLOCK' }, { resource_class: 'CPU' });
assert.equal(unknownBlocked.state, 'BLOCK');
assert.equal(unknownBlocked.allow_execution, false);

assert.throws(
  () => assertHardwareOnlyTelemetry({ gpu_temperature_c: 50, screen: { brightness: 0.5 } }),
  /HUMAN_OBSERVATION_FORBIDDEN/
);
assert.throws(
  () => evaluateHardwareSnapshot({ gpu_temperature_c: 50, process_name: 'game.exe' }, basePolicy, { resource_class: 'GPU' }),
  /HUMAN_OBSERVATION_FORBIDDEN/
);

const tightened = tightenExecutionBudgetForGuardian({
  cpu_limit_percent: 40,
  gpu_limit_percent: 50,
  max_temp_c: 75,
  max_watts: 200,
  max_concurrent: 2
}, hot);
assert.equal(tightened.cpu_limit_percent, 20);
assert.equal(tightened.gpu_limit_percent, 25);
assert.equal(tightened.max_watts, 100);
assert.equal(tightened.guardian_state, 'THROTTLE');
assert.equal(tightened.guardian_scale, 0.5);
assert.throws(
  () => tightenExecutionBudgetForGuardian({ cpu_limit_percent: 20, gpu_limit_percent: 20, max_watts: 100 }, overheated),
  /HARDWARE_GUARDIAN_BLOCK/
);

const guardian = new HeliosHardwareGuardian({ ...basePolicy, cooldown_hold_ms: 30_000 });
const first = guardian.evaluate({ gpu_temperature_c: 85, available_vram_mb: 9000, on_ac_power: true }, { resource_class: 'GPU', now_ms: 1_000_000 });
assert.equal(first.state, 'BLOCK');
const cooling = guardian.evaluate({ gpu_temperature_c: 72, available_vram_mb: 9000, on_ac_power: true }, { resource_class: 'GPU', now_ms: 1_005_000 });
assert.equal(cooling.state, 'COOLDOWN');
assert.equal(cooling.allow_execution, false);
const recovered = guardian.evaluate({ gpu_temperature_c: 60, available_vram_mb: 9000, on_ac_power: true }, { resource_class: 'GPU', now_ms: 1_010_000 });
assert.equal(recovered.allow_execution, true);
assert.notEqual(recovered.state, 'COOLDOWN');

console.log('HELIOS hardware-aware / human-blind Guardian invariants: PASS');
