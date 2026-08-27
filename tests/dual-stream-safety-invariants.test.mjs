import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import {
  HELIOS_DUAL_STREAM_GUARD_VERSION,
  deriveSystemRiskVector,
  evaluateSafetyBalance,
  projectAwayFromUnsafeDirection,
  stepBoundedDualStream
} from '../src/helios-dual-stream-guard.js';

const contract = JSON.parse(await readFile(new URL('../.janus/HELIOS_DUAL_STREAM_SAFETY_GUARD.json', import.meta.url), 'utf8'));
const source = await readFile(new URL('../src/helios-dual-stream-guard.js', import.meta.url), 'utf8');

assert.equal(HELIOS_DUAL_STREAM_GUARD_VERSION, '1.0.0');
assert.equal(contract.active_code_dependency_on_meta_registry, false);
assert.equal(contract.source_code_copied_from_registry, false);
assert.equal(contract.player_boundary.player_emotional_state_input, 'FORBIDDEN');
assert.equal(contract.player_boundary.problem_gambling_or_vulnerability_targeting, 'FORBIDDEN');
assert.equal(contract.player_boundary.game_effect, 'NONE');
assert.match(source, /SAFETY_RESERVE_BELOW_REQUIRED_BALANCE/);
assert.match(source, /HARD_SAFETY_GATE_MISSING/);
assert.match(source, /HUMAN_AFFECT_OR_VULNERABILITY_INPUT_FORBIDDEN/);
assert.match(source, /never fabricate safety reserve/i);

const risk = deriveSystemRiskVector({
  cpu_load: 0.7,
  gpu_load: 0.2,
  temperature_c: 70,
  max_temp_c: 90,
  estimated_watts: 150,
  max_watts: 300,
  battery_percent: 100,
  on_ac_power: true
});
assert.equal(risk.length, 4);
assert.equal(risk.every(x => x >= 0 && x <= 1), true);

const stepped = stepBoundedDualStream({
  state: { change_pressure: 0.8, safety_reserve: 0.3 },
  risk_vector: [0.9, 0.8, 0.7, 0.6],
  params: { rho: 2 },
  dt: 0.1
});
assert.equal(stepped.safety_reserve + 1e-12 >= stepped.rho * stepped.change_pressure, true);
assert.equal(stepped.balance_limited, true);

const strongEvidence = {
  consent_active: true,
  immediate_revoke_available: true,
  verifier_ready: true,
  exact_artifact_bound: true,
  telemetry_fresh: true,
  thermal_headroom: 0.95,
  power_headroom: 0.90,
  memory_headroom: 0.90,
  verification_confidence: 0.98,
  rollback_readiness: 0.95
};

const admitted = evaluateSafetyBalance({ change_pressure: 0.4, evidence: strongEvidence, rho: 1.5 });
assert.equal(admitted.admitted, true);
assert.equal(admitted.game_effect, 'NONE');
assert.equal(admitted.game_event_weighting, 'FORBIDDEN');

const weak = evaluateSafetyBalance({
  change_pressure: 0.7,
  evidence: { ...strongEvidence, thermal_headroom: 0.3 },
  rho: 1.5
});
assert.equal(weak.admitted, false);
assert.equal(weak.reason, 'SAFETY_RESERVE_BELOW_REQUIRED_BALANCE');
assert.equal(weak.safety_reserve, 0.3);

const missing = evaluateSafetyBalance({
  change_pressure: 0.1,
  evidence: { ...strongEvidence, verifier_ready: false },
  rho: 1.5
});
assert.equal(missing.admitted, false);
assert.equal(missing.reason, 'HARD_SAFETY_GATE_MISSING');
assert.deepEqual(missing.missing_hard_gates, ['verifier_ready']);

assert.throws(() => evaluateSafetyBalance({
  change_pressure: 0.1,
  evidence: strongEvidence,
  metadata: { fear: 0.8 }
}), /HUMAN_AFFECT_OR_VULNERABILITY_INPUT_FORBIDDEN/);

const proposal = [3, 4, 5];
const unsafe = [1, 0, 0];
const projected = projectAwayFromUnsafeDirection(proposal, unsafe);
assert.equal(Math.abs(projected[0]) < 1e-12, true);
assert.deepEqual(projected.slice(1), [4, 5]);

const dot = projected.reduce((sum, x, i) => sum + x * unsafe[i], 0);
assert.equal(Math.abs(dot) < 1e-12, true);

console.log('HELIOS dual-stream safety guard invariants: PASS');
