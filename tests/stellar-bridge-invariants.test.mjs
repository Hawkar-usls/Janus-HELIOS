import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const [source,indexHtml,contract] = await Promise.all([
  readFile(new URL('../helios-stellar-bridge.js', import.meta.url),'utf8'),
  readFile(new URL('../index.html', import.meta.url),'utf8'),
  readFile(new URL('../.janus/HELIOS_STELLAR_NAVIGATOR.json', import.meta.url),'utf8').then(JSON.parse)
]);

assert.match(source,/BRIDGE_VERSION = '1\.0\.0'/);
assert.match(indexHtml,/id="helios-stellar-nav-script"[^>]+helios-stellar-nav\.js\?v=1\.1\.0/);
assert.match(indexHtml,/id="helios-stellar-bridge-script"[^>]+helios-stellar-bridge\.js\?v=1\.0\.0/);
assert.ok(indexHtml.indexOf('id="helios-stellar-nav-script"') < indexHtml.indexOf('id="helios-stellar-bridge-script"'));

// Physical UI anchor: the sphere follows the real midpoint between game and router columns.
assert.match(source,/document\.getElementById\('game-panel'\)/);
assert.match(source,/document\.querySelector\('\.hero>\.router'\)/);
assert.match(source,/\(game\.right\+router\.left\)\/2/);
assert.match(source,/BETWEEN_COLUMNS/);
assert.match(source,/ResizeObserver/);
assert.match(source,/STACKED_GAME_CENTER/);

// Mode changes drive a bounded presentation-only camera flight on the Stellar canvas.
for(const mode of ['helios','divine','gridjack','custom']) assert.match(source,new RegExp(`${mode}:\\{x:`));
assert.match(source,/attributeFilter:\['data-game-mode'\]/);
assert.match(source,/translate3d\(/);
assert.match(source,/transition:opacity 2\.4s[^\n]+transform 2\.8s/);

// The Dyson presentation may react to reel motion, cascades and a settled paid-win boolean.
assert.match(source,/classList\.contains\('spinning'\)/);
assert.match(source,/classList\.contains\('reel-stop'\)/);
assert.match(source,/helios:cascade/);
assert.match(source,/helios:spin-complete/);
assert.match(source,/Number\(e\.detail\?\.spin_win\|\|0\)>0/);
assert.match(source,/pulseDyson/);

// Fast contrast pumping is explicitly neutralized while transform/glow choreography remains available.
assert.match(source,/body\.director-divergence \.helios-director-stage/);
assert.match(source,/filter:none!important/);
assert.match(source,/transition:filter 2\.8s/);
assert.match(source,/body\[data-game-mode="divine"\] \.cosmos>\.sun/);
assert.match(source,/body\[data-game-mode="custom"\] \.cosmos>\.sun/);

// Black-hole geometry is intentionally outside this bridge's authority.
assert.doesNotMatch(source,/planet-horizon/);

// Presentation bridge must not become a game/math/compute authority channel.
assert.match(source,/presentation_only:true/);
assert.match(source,/reads_bet:false/);
assert.match(source,/reads_balance:false/);
assert.match(source,/rng_effect:'NONE'/);
assert.match(source,/rtp_effect:'NONE'/);
assert.match(source,/payout_effect:'NONE'/);
assert.match(source,/compute_routing_effect:'NONE'/);
assert.doesNotMatch(source,/\bfetch\s*\(/);
assert.doesNotMatch(source,/XMLHttpRequest/);
assert.doesNotMatch(source,/WebSocket/);
assert.doesNotMatch(source,/Math\.random\s*\(/);
assert.doesNotMatch(source,/getElementById\(['"]bet['"]\)/);
assert.doesNotMatch(source,/getElementById\(['"]balance['"]\)/);
assert.doesNotMatch(source,/loss_streak|near_miss|wager_history|inferred_vulnerability|problem_gambling_label/i);

assert.equal(contract.presentation_bridge?.module,'helios-stellar-bridge.js');
assert.equal(contract.presentation_bridge?.version,'1.0.0');
assert.equal(contract.presentation_bridge?.ui_anchor,'MIDPOINT_BETWEEN_GAME_AND_ROUTER_COLUMNS');
assert.equal(contract.presentation_bridge?.black_hole_geometry_effect,'NONE');
assert.equal(contract.presentation_bridge?.contrast_pumping,'DISABLED');
assert.equal(contract.presentation_bridge?.camera_mode_flyby,true);
assert.equal(contract.presentation_bridge?.dyson_reel_reactivity,true);
assert.equal(contract.presentation_bridge?.dyson_cascade_reactivity,true);
assert.equal(contract.presentation_bridge?.dyson_paid_win_reactivity,true);
assert.equal(contract.presentation_bridge?.authority.rng_effect,'NONE');
assert.equal(contract.presentation_bridge?.authority.rtp_effect,'NONE');
assert.equal(contract.presentation_bridge?.authority.compute_routing_effect,'NONE');

console.log('HELIOS Stellar UI bridge invariants: PASS');
