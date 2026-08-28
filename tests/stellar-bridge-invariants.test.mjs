import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const [source,indexHtml,contract] = await Promise.all([
  readFile(new URL('../helios-stellar-bridge.js', import.meta.url),'utf8'),
  readFile(new URL('../index.html', import.meta.url),'utf8'),
  readFile(new URL('../.janus/HELIOS_STELLAR_NAVIGATOR.json', import.meta.url),'utf8').then(JSON.parse)
]);

assert.match(source,/BRIDGE_VERSION = '1\.0\.4'/);
assert.match(indexHtml,/id="helios-stellar-nav-script"[^>]+helios-stellar-nav\.js\?v=1\.1\.0/);
assert.match(indexHtml,/id="helios-stellar-bridge-script"[^>]+helios-stellar-bridge\.js\?v=1\.0\.4/);
assert.doesNotMatch(indexHtml,/body\[data-game-mode="(?:divine|gridjack|custom)"\]\{--mode:/);
assert.ok(indexHtml.indexOf('id="helios-stellar-nav-script"') < indexHtml.indexOf('id="helios-stellar-bridge-script"'));

// Physical UI anchor remains layout-derived, not game-state-derived.
assert.match(source,/document\.getElementById\('game-panel'\)/);
assert.match(source,/document\.querySelector\('\.hero>\.router'\)/);
assert.match(source,/\(game\.right\+router\.left\)\/2/);
assert.match(source,/BETWEEN_COLUMNS/);
assert.match(source,/ResizeObserver/);
assert.match(source,/STACKED_GAME_CENTER/);

// Root-cause guard: mode changes cannot alter palette, Stellar camera or astronomical light.
assert.doesNotMatch(source,/PALETTES/);
assert.doesNotMatch(source,/PALETTE_DURATION_MS/);
assert.doesNotMatch(source,/transitionPalette/);
assert.doesNotMatch(source,/paletteFrame/);
assert.doesNotMatch(source,/body\.style\.setProperty\('--mode'/);
assert.doesNotMatch(source,/body\.style\.setProperty\('--mode-soft'/);
assert.doesNotMatch(source,/CAMERA\s*=/);
assert.doesNotMatch(source,/applyCamera/);
assert.doesNotMatch(source,/translate3d\(/);
assert.doesNotMatch(source,/attributeFilter:\['data-game-mode'\]/);
assert.doesNotMatch(source,/dataset\.gameMode/);
assert.match(source,/\.helios-stellar-canvas\{[\s\S]*transform:none!important/);
assert.match(source,/global_lighting_mode_coupling:'NONE'/);
assert.match(source,/global_lighting_game_event_coupling:'NONE'/);
assert.match(source,/ui_palette_transition:'NONE_STATIC_ROOT_THEME'/);
assert.match(source,/camera_mode_flyby:false/);

// Root-cause guard: gameplay/bonus events cannot pulse the Dyson or alter global exposure.
assert.doesNotMatch(source,/helios:cascade/);
assert.doesNotMatch(source,/helios:spin-complete/);
assert.doesNotMatch(source,/helios:bonus-wheel-start/);
assert.doesNotMatch(source,/helios:bonus-session-start/);
assert.doesNotMatch(source,/classList\.contains\('spinning'\)/);
assert.doesNotMatch(source,/classList\.contains\('reel-stop'\)/);
assert.doesNotMatch(source,/pulseDyson/);
assert.doesNotMatch(source,/bindReels/);
assert.doesNotMatch(source,/bindPresentationEvents/);
assert.match(source,/game_event_reactivity:'NONE'/);
assert.match(source,/reads_mode:false/);
assert.match(source,/reads_spin:false/);
assert.match(source,/reads_cascade:false/);
assert.match(source,/reads_win:false/);
assert.match(source,/reads_bonus:false/);

// Director/win exposure changes are neutralized at the bridge boundary.
assert.match(source,/body\.director-divergence \.helios-director-stage/);
assert.match(source,/body\.director-resolution \.core\{filter:none!important\}/);
assert.match(source,/filter:none!important/);
assert.match(source,/box-shadow:none!important/);
assert.match(source,/\.game-panel\.win-impact\{box-shadow:var\(--shadow\)!important\}/);
assert.match(source,/\.reels\.win-focus \.cell/);
assert.match(source,/opacity:1!important/);
assert.doesNotMatch(source,/brightness\(/);

// CPU policy remains presentation-size input; compute ACTIVE gates only ambient Dyson animation state.
assert.match(source,/document\.getElementById\('cpu'\)/);
assert.match(source,/document\.getElementById\('compute-state'\)/);
assert.match(source,/dysonPolicyScale/);
assert.match(source,/size\*=dysonPolicyScale\(\)/);
assert.match(source,/computeState\.textContent\.includes\('ACTIVE'\)/);
assert.match(source,/dyson-dormant/);
assert.match(source,/animation-play-state:paused!important/);
assert.match(source,/cpu_policy_percent:state\.cpuPercent/);
assert.match(source,/dyson_compute_active:state\.computeActive/);

// Black hole gets only a static one-step-down baseline trim; it is not event-coupled.
assert.match(source,/\.cosmos>\.planet-horizon\{bottom:clamp\(-328px,-13\.8vw,-205px\)!important\}/);
assert.doesNotMatch(source,/planet-horizon[^\n]+(?:spin|cascade|win|bonus)/i);

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
assert.equal(contract.presentation_bridge?.version,'1.0.4');
assert.equal(contract.presentation_bridge?.ui_anchor,'MIDPOINT_BETWEEN_GAME_AND_ROUTER_COLUMNS');
assert.equal(contract.presentation_bridge?.black_hole_geometry_effect,'STATIC_BASELINE_OFFSET_ONLY');
assert.equal(contract.presentation_bridge?.black_hole_event_coupling,false);
assert.equal(contract.presentation_bridge?.contrast_pumping,'DISABLED');
assert.equal(contract.presentation_bridge?.palette_interpolation,'NONE_STATIC_ROOT_THEME');
assert.equal(contract.presentation_bridge?.palette_duration_ms,0);
assert.equal(contract.presentation_bridge?.mode_palette_transition,'NONE');
assert.equal(contract.presentation_bridge?.global_lighting_mode_coupling,'NONE');
assert.equal(contract.presentation_bridge?.global_lighting_game_event_coupling,'NONE');
assert.equal(contract.presentation_bridge?.global_lighting_motion,'NAVIGATOR_AUTONOMOUS_ONLY');
assert.equal(contract.presentation_bridge?.win_exposure_pumping,false);
assert.equal(contract.presentation_bridge?.camera_mode_flyby,false);
assert.equal(contract.presentation_bridge?.dyson_reel_reactivity,false);
assert.equal(contract.presentation_bridge?.dyson_cascade_reactivity,false);
assert.equal(contract.presentation_bridge?.dyson_paid_win_reactivity,false);
assert.equal(contract.presentation_bridge?.dyson_bonus_reactivity,false);
assert.equal(contract.presentation_bridge?.dyson_event_effect,'NONE');
assert.equal(contract.presentation_bridge?.dyson_cpu_policy_scaling,true);
assert.equal(contract.presentation_bridge?.dyson_ambient_animation_requires_compute_active,true);
assert.equal(contract.presentation_bridge?.dyson_dormant_animation_paused,true);
assert.equal(contract.presentation_bridge?.authority.rng_effect,'NONE');
assert.equal(contract.presentation_bridge?.authority.rtp_effect,'NONE');
assert.equal(contract.presentation_bridge?.authority.compute_routing_effect,'NONE');

console.log('HELIOS Stellar bridge event-decoupled lighting + CPU/layout-only Dyson invariants: PASS');