import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const [source,contract] = await Promise.all([
  readFile(new URL('../helios-route-aura.js', import.meta.url),'utf8'),
  readFile(new URL('../.janus/HELIOS_ROUTE_AURA.json', import.meta.url),'utf8').then(JSON.parse)
]);

assert.match(source,/VERSION='1\.2\.0'/);
assert.match(source,/route-aura-v1/);
assert.match(source,/heliosRouteAuraBreath/);
assert.match(source,/route-aura-streaming/);
assert.match(source,/document\.getElementById\('reels'\)/);
assert.match(source,/document\.getElementById\('game-panel'\)/);
assert.match(source,/document\.getElementById\('route-grid'\)/);
assert.match(source,/document\.getElementById\('selected-route'\)/);
assert.match(source,/helios:reel-forge-profile/);
assert.match(source,/HELIOS_REEL_FORGE/);
assert.match(source,/helios:resource-policy/);
assert.match(source,/HELIOS_RESOURCE_POLICY/);
assert.match(source,/visual_envelope_ratio/);
assert.match(source,/cpu_percent/);
assert.match(source,/gpu_percent/);
assert.match(source,/max_policy/);
assert.match(source,/helios-route-aura-spark/);
assert.match(source,/state\.streaming&&state\.resource\.max_policy/);
assert.match(source,/palette_source:'REEL_FORGE'/);
assert.match(source,/intensity_source:'CPU_GPU_USER_POLICY'/);
assert.match(source,/presentation_only:true/);
assert.match(source,/reads_spin:false/);
assert.match(source,/reads_win:false/);
assert.match(source,/reads_bet:false/);
assert.match(source,/reads_balance:false/);
assert.match(source,/rng_effect:'NONE'/);
assert.match(source,/rtp_effect:'NONE'/);
assert.match(source,/payout_effect:'NONE'/);
assert.match(source,/compute_routing_effect:'NONE'/);
assert.doesNotMatch(source,/position:\s*fixed/);
assert.doesNotMatch(source,/Math\.random\s*\(/);
assert.doesNotMatch(source,/loss_streak|near_miss|wager_history|inferred_vulnerability/i);

assert.equal(contract.version,'1.2.0');
assert.equal(contract.classification,'PRESENTATION_ONLY_LOCAL_REEL_ROUTE_AURA');
assert.equal(contract.palette_source,'REEL_FORGE_PRIMARY_SECONDARY_TERTIARY');
assert.equal(contract.intensity_source,'CPU_GPU_USER_RESOURCE_POLICY');
assert.equal(contract.max_policy_sparks.enabled,true);
assert.equal(contract.max_policy_sparks.requires_compute_active,true);
assert.equal(contract.max_policy_sparks.requires_both_cpu_and_gpu_at_configured_max,true);
assert.equal(contract.fullscreen_overlay,false);
assert.equal(contract.reads_game_math,false);
assert.equal(contract.authority?.rng_effect,'NONE');
assert.equal(contract.authority?.rtp_effect,'NONE');
assert.equal(contract.authority?.payout_effect,'NONE');
assert.equal(contract.authority?.compute_routing_effect,'NONE');

console.log('HELIOS CPU/GPU-driven procedural Route Aura invariants: PASS');
