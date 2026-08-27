import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const [source,indexHtml,contract] = await Promise.all([
  readFile(new URL('../helios-stellar-bridge.js', import.meta.url),'utf8'),
  readFile(new URL('../index.html', import.meta.url),'utf8'),
  readFile(new URL('../.janus/HELIOS_STELLAR_NAVIGATOR.json', import.meta.url),'utf8').then(JSON.parse)
]);

assert.match(source,/BRIDGE_VERSION = '1\.0\.1'/);
assert.match(indexHtml,/id="helios-stellar-nav-script"[^>]+helios-stellar-nav\.js\?v=1\.1\.0/);
assert.match(indexHtml,/id="helios-stellar-bridge-script"[^>]+helios-stellar-bridge\.js\?v=1\.0\.1/);
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

// Palette/exposure changes are registered interpolated properties rather than instant filter swaps.
assert.match(source,/@property --mode/);
assert.match(source,/@property --mode-soft/);
assert.match(source,/@property --helios-ambient-hue/);
assert.match(source,/--mode 2\.65s/);
assert.match(source,/--helios-ambient-hue 3\.1s/);
assert.match(source,/filter:hue-rotate\(calc\(var\(--helios-ambient-hue\)\*1deg\)\)/);
assert.match(source,/body\.director-divergence \.helios-director-stage/);
assert.match(source,/filter:none!important/);
assert.match(source,/reels\.win-focus \.cell/);
assert.match(source,/opacity:\.48!important/);
assert.match(source,/filter:saturate\(\.82\) brightness\(\.90\)!important/);

// Black hole gets only a static one-step-down baseline trim; it is not event-coupled.
assert.match(source,/\.cosmos>\.planet-horizon\{bottom:clamp\(-328px,-13\.8vw,-205px\)!important\}/);
assert.doesNotMatch(source,/helios:cascade[^\n]+planet-horizon/);
assert.doesNotMatch(source,/helios:spin-complete[^\n]+planet-horizon/);

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
assert.equal(contract.presentation_bridge?.version,'1.0.1');
assert.equal(contract.presentation_bridge?.ui_anchor,'MIDPOINT_BETWEEN_GAME_AND_ROUTER_COLUMNS');
assert.equal(contract.presentation_bridge?.black_hole_geometry_effect,'STATIC_BASELINE_OFFSET_ONLY');
assert.equal(contract.presentation_bridge?.black_hole_event_coupling,false);
assert.equal(contract.presentation_bridge?.contrast_pumping,'DISABLED');
assert.equal(contract.presentation_bridge?.palette_interpolation,'REGISTERED_CUSTOM_PROPERTIES');
assert.equal(contract.presentation_bridge?.win_focus_transition,'SMOOTHED');
assert.equal(contract.presentation_bridge?.camera_mode_flyby,true);
assert.equal(contract.presentation_bridge?.dyson_reel_reactivity,true);
assert.equal(contract.presentation_bridge?.dyson_cascade_reactivity,true);
assert.equal(contract.presentation_bridge?.dyson_paid_win_reactivity,true);
assert.equal(contract.presentation_bridge?.authority.rng_effect,'NONE');
assert.equal(contract.presentation_bridge?.authority.rtp_effect,'NONE');
assert.equal(contract.presentation_bridge?.authority.compute_routing_effect,'NONE');

console.log('HELIOS Stellar UI bridge interpolated-palette + static black-hole trim invariants: PASS');
