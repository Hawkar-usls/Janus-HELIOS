import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const [source,contract] = await Promise.all([
  readFile(new URL('../helios-route-aura.js', import.meta.url),'utf8'),
  readFile(new URL('../.janus/HELIOS_ROUTE_AURA.json', import.meta.url),'utf8').then(JSON.parse)
]);

assert.match(source,/VERSION='1\.0\.0'/);
for(const route of ['MARKET','SCIENCE','TREASURY','DC','OPERATOR','CUSTOM']) assert.match(source,new RegExp(`${route}:Object\\.freeze`));
assert.match(source,/route-aura-v1/);
assert.match(source,/heliosRouteAuraBreath/);
assert.match(source,/route-aura-streaming/);
assert.match(source,/document\.getElementById\('reels'\)/);
assert.match(source,/document\.getElementById\('route-grid'\)/);
assert.match(source,/document\.getElementById\('selected-route'\)/);
assert.match(source,/helios:music-state/);
assert.match(source,/session_seed/);
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
assert.doesNotMatch(source,/inset:\s*0[^\d]/);
assert.doesNotMatch(source,/Math\.random\s*\(/);
assert.doesNotMatch(source,/loss_streak|near_miss|wager_history|inferred_vulnerability/i);

assert.equal(contract.classification,'PRESENTATION_ONLY_LOCAL_REEL_ROUTE_AURA');
assert.equal(contract.locality,'REELS_ONLY');
assert.equal(contract.fullscreen_overlay,false);
assert.equal(contract.reads_game_math,false);
assert.equal(contract.authority?.rng_effect,'NONE');
assert.equal(contract.authority?.rtp_effect,'NONE');
assert.equal(contract.authority?.payout_effect,'NONE');
assert.equal(contract.authority?.compute_routing_effect,'NONE');

console.log('HELIOS procedural Route Aura invariants: PASS');