import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const [source,indexHtml,contract] = await Promise.all([
  readFile(new URL('../helios-stellar-bridge.js', import.meta.url),'utf8'),
  readFile(new URL('../index.html', import.meta.url),'utf8'),
  readFile(new URL('../.janus/HELIOS_STELLAR_NAVIGATOR.json', import.meta.url),'utf8').then(JSON.parse)
]);

assert.match(source,/BRIDGE_VERSION = '1\.0\.3'/);
assert.match(indexHtml,/id="helios-stellar-nav-script"[^>]+helios-stellar-nav\.js\?v=1\.1\.0/);
assert.match(indexHtml,/id="helios-stellar-bridge-script"[^>]+helios-stellar-bridge\.js\?v=1\.0\.3/);
assert.doesNotMatch(indexHtml,/body\[data-game-mode="(?:divine|gridjack|custom)"\]\{--mode:/);
assert.ok(indexHtml.indexOf('id="helios-stellar-nav-script"') < indexHtml.indexOf('id="helios-stellar-bridge-script"'));

// Physical UI anchor: the sphere follows the real midpoint between game and router columns.
assert.match(source,/document\.getElementById\('game-panel'\)/);
assert.match(source,/document\.querySelector\('\.hero>\.router'\)/);
assert.match(source,/\(game\.right\+router\.left\)\/2/);
assert.match(source,/BETWEEN_COLUMNS/);
assert.match(source,/ResizeObserver/);
assert.match(source,/STACKED_GAME_CENTER/);

// Mode changes drive a bounded camera flight while UI accent colour is frame-interpolated.
for(const mode of ['helios','divine','gridjack','custom']) assert.match(source,new RegExp(`${mode}:\\{x:`));
assert.match(source,/attributeFilter:\['data-game-mode'\]/);
assert.match(source,/translate3d\(/);
assert.match(source,/transition:opacity 2\.4s[^\n]+transform 2\.8s/);
assert.match(source,/PALETTE_DURATION_MS = 3200/);
assert.match(source,/requestAnimationFrame\(paletteFrame\)/);
assert.match(source,/transitionPalette\(next\)/);
assert.match(source,/body\.style\.setProperty\('--mode'/);
assert.match(source,/body\.style\.setProperty\('--mode-soft'/);
assert.doesNotMatch(source,/@property --mode/);

// Global astronomical illumination is deliberately NOT coupled to mode changes.
assert.match(source,/global_lighting_mode_coupling:'NONE'/);
assert.match(source,/helios-bridge-sun-ambient/);
assert.match(source,/helios-bridge-orbit-ambient/);
assert.match(source,/AUTONOMOUS_CONTINUOUS_AMBIENT_ONLY/);
assert.doesNotMatch(source,/--helios-ambient-hue/);
assert.doesNotMatch(source,/--helios-ambient-bright/);

// Exposure pumping from Director/win impacts is neutralized instead of merely made faster/slower.
assert.match(source,/body\.director-divergence \.helios-director-stage/);
assert.match(source,/body\.director-resolution \.core\{filter:none!important\}/);
assert.match(source,/filter:none!important/);
assert.match(source,/box-shadow:none!important/);
assert.match(source,/\.game-panel\.win-impact\{box-shadow:var\(--shadow\)!important\}/);
assert.match(source,/reels\.win-focus \.cell/);
assert.match(source,/opacity:\.76!important/);
assert.doesNotMatch(source,/brightness\(\.90\)/);

// CPU policy is a presentation-size input; compute ACTIVE gates Dyson motion.
assert.match(source,/document\.getElementById\('cpu'\)/);
assert.match(source,/document\.getElementById\('compute-state'\)/);
assert.match(source,/dysonPolicyScale/);
assert.match(source,/size\*=dysonPolicyScale\(\)/);
assert.match(source,/computeState\.textContent\.includes\('ACTIVE'\)/);
assert.match(source,/dyson-dormant/);
assert.match(source,/animation-play-state:paused!important/);
assert.match(source,/if\(state\.reducedMotion\|\|!state\.computeActive\|\|!state\.dyson\) return/);
assert.match(source,/cpu_policy_percent:state\.cpuPercent/);
assert.match(source,/dyson_compute_active:state\.computeActive/);

// The Dyson presentation may react to reel motion/cascade/win only when compute is active.
assert.match(source,/classList\.contains\('spinning'\)/);
assert.match(source,/classList\.contains\('reel-stop'\)/);
assert.match(source,/helios:cascade/);
assert.match(source,/helios:spin-complete/);
assert.match(source,/Number\(e\.detail\?\.spin_win\|\|0\)>0/);
assert.match(source,/pulseDyson/);

// Black hole gets only a static one-step-down baseline trim; it is not event-coupled.
assert.match(source,/\.cosmos>\.planet-horizon\{bottom:clamp\(-328px,-13\.8vw,-205px\)!important\}/);
assert.doesNotMatch(source,/helios:cascade[^\n]+planet-horizon/);
assert.doesNotMatch(source,/helios:spin-complete[^\n]+planet-horizon/);

// Presentation bridge must not become a game-math/compute-routing authority channel.
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
assert.equal(contract.presentation_bridge?.version,'1.0.3');
assert.equal(contract.presentation_bridge?.ui_anchor,'MIDPOINT_BETWEEN_GAME_AND_ROUTER_COLUMNS');
assert.equal(contract.presentation_bridge?.black_hole_geometry_effect,'STATIC_BASELINE_OFFSET_ONLY');
assert.equal(contract.presentation_bridge?.black_hole_event_coupling,false);
assert.equal(contract.presentation_bridge?.contrast_pumping,'DISABLED');
assert.equal(contract.presentation_bridge?.palette_interpolation,'REQUEST_ANIMATION_FRAME_RGB_INTERPOLATION');
assert.equal(contract.presentation_bridge?.palette_duration_ms,3200);
assert.equal(contract.presentation_bridge?.global_lighting_mode_coupling,'NONE');
assert.equal(contract.presentation_bridge?.global_lighting_motion,'AUTONOMOUS_CONTINUOUS_AMBIENT_ONLY');
assert.equal(contract.presentation_bridge?.win_exposure_pumping,false);
assert.equal(contract.presentation_bridge?.camera_mode_flyby,true);
assert.equal(contract.presentation_bridge?.dyson_cpu_policy_scaling,true);
assert.equal(contract.presentation_bridge?.dyson_motion_requires_compute_active,true);
assert.equal(contract.presentation_bridge?.dyson_dormant_animation_paused,true);
assert.equal(contract.presentation_bridge?.authority.rng_effect,'NONE');
assert.equal(contract.presentation_bridge?.authority.rtp_effect,'NONE');
assert.equal(contract.presentation_bridge?.authority.compute_routing_effect,'NONE');

console.log('HELIOS Stellar UI bridge mode-neutral lighting + CPU-bound Dyson invariants: PASS');