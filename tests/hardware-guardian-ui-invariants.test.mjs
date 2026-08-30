import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const [ui, contract] = await Promise.all([
  readFile(new URL('../helios-hardware-guardian-ui.js', import.meta.url), 'utf8'),
  readFile(new URL('../.janus/HELIOS_HARDWARE_GUARDIAN.json', import.meta.url), 'utf8').then(JSON.parse)
]);

assert.match(ui, /const VERSION='1\.0\.0'/);
assert.match(ui, /HARDWARE GUARDIAN · HUMAN-BLIND/);
assert.match(ui, /USER \+ VENDOR LIMITS/);
assert.match(ui, /WATT HEADROOM/);
assert.match(ui, /AC \/ RESERVE POLICY/);
assert.match(ui, /HARDWARE ONLY/);
assert.match(ui, /DESKTOP AGENT REQUIRED/);
assert.match(ui, /policy_preview_only:true/);
assert.match(ui, /live_telemetry:false/);
assert.match(ui, /sensor_scope:'HARDWARE_ONLY'/);
assert.match(ui, /human_observation:'FORBIDDEN'/);
assert.match(ui, /production_gate:'HELIOS_DESKTOP_AGENT_HARDWARE_GUARDIAN'/);
assert.match(ui, /game_effect:'NONE'/);
assert.match(ui, /rng_effect:'NONE'/);
assert.match(ui, /rtp_effect:'NONE'/);
assert.match(ui, /payout_effect:'NONE'/);
assert.match(ui, /helios:resource-policy/);
assert.match(ui, /helios:hardware-guardian-preview/);
assert.match(ui, /prefers-reduced-motion:reduce/);
assert.doesNotMatch(ui, /Math\.random/);
assert.doesNotMatch(ui, /getElementById\(['"]bet['"]\)/);
assert.doesNotMatch(ui, /getElementById\(['"]balance['"]\)/);
assert.doesNotMatch(ui, /temperature_c\s*:/);
assert.doesNotMatch(ui, /estimated_watts\s*:/);

assert.equal(contract.version, '1.0.0');
assert.equal(contract.principles.hardware_aware, true);
assert.equal(contract.principles.human_blind, true);
assert.equal(contract.principles.guardian_can_widen_execution_budget, false);
assert.equal(contract.public_demo.live_hardware_telemetry, false);
assert.equal(contract.public_demo.invented_temperature_or_watt_readings, false);
assert.equal(contract.authority.rng_effect, 'NONE');
assert.equal(contract.authority.local_execution_budget_effect, 'TIGHTEN_OR_BLOCK_ONLY');

console.log('HELIOS Hardware Guardian public policy-preview invariants: PASS');
