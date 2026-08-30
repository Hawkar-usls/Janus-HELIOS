import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const [html, mobile, bonus, contract] = await Promise.all([
  readFile(new URL('../index.html', import.meta.url), 'utf8'),
  readFile(new URL('../helios-mobile.js', import.meta.url), 'utf8'),
  readFile(new URL('../helios-bonus.js', import.meta.url), 'utf8'),
  readFile(new URL('../.janus/HELIOS_ADAPTIVE_VIEWPORT_UI.json', import.meta.url), 'utf8').then(JSON.parse)
]);

assert.match(html, /width=device-width,initial-scale=1,maximum-scale=1,viewport-fit=cover/);
assert.match(html, /helios-mobile\.js\?v=1\.1\.2/);
assert.match(html, /grid-template-columns:minmax\(0,1\.07fr\) minmax\(0,\.93fr\)/);
assert.match(html, /@media\(max-width:980px\)/);
assert.match(html, /overflow-x:hidden/);

assert.match(mobile, /VERSION='1\.2\.0'/);
assert.match(mobile, /env\(safe-area-inset-top\)/);
assert.match(mobile, /env\(safe-area-inset-bottom\)/);
assert.match(mobile, /100dvh/);
assert.match(mobile, /100svh/);
assert.match(mobile, /pointer:coarse/);
assert.match(mobile, /min-height:44px/);
assert.match(mobile, /@media\(min-width:1600px\)/);
assert.match(mobile, /@media\(min-width:1200px\) and \(max-width:1599px\)/);
assert.match(mobile, /@media\(min-width:981px\) and \(max-width:1199px\)/);
assert.match(mobile, /@media\(max-width:980px\)/);
assert.match(mobile, /@media\(max-width:640px\)/);
assert.match(mobile, /@media\(max-width:390px\)/);
assert.match(mobile, /@media\(max-width:350px\)/);
assert.match(mobile, /orientation:landscape/);
assert.match(mobile, /LANDSCAPE_PHONE/);
assert.match(mobile, /ULTRAWIDE/);
assert.match(mobile, /COMPACT_DESKTOP/);
assert.match(mobile, /SMALL_PHONE/);
assert.match(mobile, /visualViewport/);
assert.match(mobile, /helios:viewport-class/);
assert.match(mobile, /HELIOS_ADAPTIVE_UI/);
assert.match(mobile, /\.hero\{grid-template-columns:minmax\(0,1fr\)!important/);
assert.match(mobile, /\.route-grid\{grid-template-columns:repeat\(2,minmax\(0,1fr\)\)!important/);
assert.match(mobile, /\.profile-drawer\{width:100vw!important/);
assert.match(mobile, /\.solar-corona-overlay/);
assert.match(mobile, /\.spin-btn\{grid-column:1\/-1!important/);

// The late adaptive layer covers the post-GOLD surfaces too, not just the original slot shell.
assert.match(mobile, /\.helios-resource-console/);
assert.match(mobile, /\.helios-resource-profiles/);
assert.match(mobile, /\.helios-receipt-grid/);
assert.match(mobile, /\.helios-trust-strip/);
assert.match(mobile, /\.helios-lifecycle/);
assert.match(mobile, /\.helios-buyer-lab-body/);
assert.match(mobile, /\.helios-chain/);
assert.match(mobile, /\.helios-constellation/);

// Final-loaded presentation layer owns the exposure-stability lock while tactile reel motion remains intact.
assert.match(mobile, /FINAL EXPOSURE LOCK/);
assert.match(mobile, /\.cosmos>\.sun,\.cosmos>\.orbit-field\{filter:none!important/);
assert.match(mobile, /body\.director-divergence \.helios-director-stage/);
assert.match(mobile, /\.reels\.win-focus \.cell/);
assert.match(mobile, /opacity:1!important;filter:none!important/);
assert.match(mobile, /\.game-panel\.win-impact\{box-shadow:var\(--shadow\)!important\}/);
assert.match(mobile, /@keyframes heliosFinalWinPop/);
assert.doesNotMatch(mobile, /\.game-panel\.win-impact\{box-shadow:0 0 0 1px/);
assert.match(mobile, /\.reel-spinning\{animation:mobileReelFloat/);
assert.match(mobile, /\.reel-stop\{animation:mobileReelStop/);

// Adaptive UI is presentation-only and does not become a game/compute authority channel.
assert.match(mobile, /reads_game_math:false/);
assert.match(mobile, /game_effect:'NONE'/);
assert.match(mobile, /rng_effect:'NONE'/);
assert.match(mobile, /rtp_effect:'NONE'/);
assert.match(mobile, /payout_effect:'NONE'/);
assert.doesNotMatch(mobile, /getElementById\(['"]bet['"]\)/);
assert.doesNotMatch(mobile, /getElementById\(['"]balance['"]\)/);

// Mobile is a responsive/mobile presentation layer, not a hidden dependency loader.
assert.match(mobile, /responsive\/mobile presentation plus the final exposure-stability lock/);
assert.doesNotMatch(mobile, /createElement\(['"]script['"]\)/);
assert.doesNotMatch(mobile, /helios-bonus-confirm\.js/);
assert.doesNotMatch(mobile, /helios-dual-stream-director\.js/);
assert.match(html, /id="helios-bonus-confirm-script"/);
assert.match(html, /id="helios-dual-stream-director-script"/);
assert.match(html, /id="helios-stellar-nav-script"[^>]+helios-stellar-nav\.js\?v=1\.1\.0/);

assert.match(bonus, /solar-free-spins-hud/);
assert.match(bonus, /@media\(max-width:520px\)/);
assert.match(bonus, /\.solar-free-spins-hud\{grid-template-columns:1fr 1fr\}/);
assert.match(bonus, /\.bonus-buy-btn\{width:100%\}/);

assert.equal(contract.version,'1.2.0');
assert.deepEqual(contract.viewport_classes,['ULTRAWIDE','DESKTOP','COMPACT_DESKTOP','TABLET','PHONE','SMALL_PHONE','LANDSCAPE_PHONE']);
assert.equal(contract.breakpoints.ultrawide_min_width_px,1600);
assert.equal(contract.breakpoints.compact_desktop_min_width_px,981);
assert.equal(contract.breakpoints.landscape_phone_max_height_px,560);
assert.equal(contract.layout_rules.landscape_phone_restores_two_column_cockpit,true);
assert.equal(contract.layout_rules.horizontal_page_overflow_forbidden,true);
assert.equal(contract.accessibility.coarse_pointer_min_target_px,44);
assert.equal(contract.exposure_lock_preserved,true);
assert.equal(contract.reads_game_math,false);
assert.equal(contract.authority.rng_effect,'NONE');
assert.equal(contract.authority.compute_routing_effect,'NONE');

console.log('HELIOS adaptive viewport UI + final exposure lock + explicit-loader + Solar Free Spins HUD invariants: PASS');