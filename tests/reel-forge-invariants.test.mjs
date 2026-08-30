import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const [source,contract] = await Promise.all([
  readFile(new URL('../helios-reel-forge.js', import.meta.url),'utf8'),
  readFile(new URL('../.janus/HELIOS_REEL_FORGE.json', import.meta.url),'utf8').then(JSON.parse)
]);

assert.match(source,/VERSION='1\.1\.0'/);
for(const mode of ['helios','divine','gridjack','custom']) assert.match(source,new RegExp(`${mode}:Object\\.freeze`));
for(const route of ['MARKET','SCIENCE','TREASURY','DC','OPERATOR','CUSTOM']) assert.match(source,new RegExp(`${route}:Object\\.freeze`));
for(const pattern of ['sunburst','rings','alloy','prism','lattice','grid','scan','blueprint']) assert.match(source,new RegExp(pattern));
assert.match(source,/routeWeight=\.50\+unit\(61\)\*\.24/);
assert.match(source,/secondaryWeight=\.46\+unit\(67\)\*\.24/);
assert.match(source,/--forge-accent-solid/);
assert.match(source,/--forge-secondary-solid/);
assert.match(source,/--forge-tertiary-solid/);
assert.match(source,/helios:reel-forge-profile/);
assert.match(source,/palette:\{primary:p\.mix,secondary:p\.secondary,tertiary:p\.tertiary\}/);
assert.match(source,/reel-forge-v1/);
assert.match(source,/data-forge-pattern/);
assert.match(source,/helios:music-state/);
assert.match(source,/session_seed/);
assert.match(source,/presentation_only:true/);
assert.match(source,/reads_visible_symbol:false/);
assert.match(source,/reads_spin_math:false/);
assert.match(source,/reads_bet:false/);
assert.match(source,/reads_balance:false/);
assert.match(source,/reads_compute:false/);
assert.match(source,/rng_effect:'NONE'/);
assert.match(source,/rtp_effect:'NONE'/);
assert.match(source,/payout_effect:'NONE'/);
assert.match(source,/compute_routing_effect:'NONE'/);
assert.doesNotMatch(source,/Math\.random\s*\(/);
assert.doesNotMatch(source,/getElementById\(['"]bet['"]\)/);
assert.doesNotMatch(source,/getElementById\(['"]balance['"]\)/);
assert.doesNotMatch(source,/loss_streak|near_miss|wager_history|inferred_vulnerability/i);

assert.equal(contract.version,'1.1.0');
assert.equal(contract.classification,'PRESENTATION_ONLY_MODE_ROUTE_SESSION_REEL_FORGE');
assert.equal(contract.palette_export_event,'helios:reel-forge-profile');
assert.equal(contract.route_colour_weight,'DOMINANT_BOUNDED');
assert.equal(contract.symbol_text_preserved,true);
assert.equal(contract.session_stable,true);
assert.equal(contract.reads_game_math,false);
assert.equal(contract.authority?.rng_effect,'NONE');
assert.equal(contract.authority?.rtp_effect,'NONE');
assert.equal(contract.authority?.payout_effect,'NONE');
assert.equal(contract.authority?.compute_routing_effect,'NONE');

console.log('HELIOS procedural Reel Forge palette export invariants: PASS');