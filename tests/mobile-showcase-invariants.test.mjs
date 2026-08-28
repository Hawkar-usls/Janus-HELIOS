import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const [html, mobile, bonus] = await Promise.all([
  readFile(new URL('../index.html', import.meta.url), 'utf8'),
  readFile(new URL('../helios-mobile.js', import.meta.url), 'utf8'),
  readFile(new URL('../helios-bonus.js', import.meta.url), 'utf8')
]);

assert.match(html, /width=device-width,initial-scale=1,maximum-scale=1,viewport-fit=cover/);
assert.match(html, /helios-mobile\.js\?v=1\.1\.2/);
assert.match(html, /grid-template-columns:minmax\(0,1\.07fr\) minmax\(0,\.93fr\)/);
assert.match(html, /@media\(max-width:980px\)/);
assert.match(html, /overflow-x:hidden/);

assert.match(mobile, /env\(safe-area-inset-top\)/);
assert.match(mobile, /env\(safe-area-inset-bottom\)/);
assert.match(mobile, /100dvh/);
assert.match(mobile, /pointer:coarse/);
assert.match(mobile, /min-height:44px/);
assert.match(mobile, /@media\(max-width:640px\)/);
assert.match(mobile, /@media\(max-width:390px\)/);
assert.match(mobile, /orientation:landscape/);
assert.match(mobile, /\.hero\{grid-template-columns:minmax\(0,1fr\)!important/);
assert.match(mobile, /\.route-grid\{grid-template-columns:repeat\(2,minmax\(0,1fr\)\)!important/);
assert.match(mobile, /\.profile-drawer\{width:100vw!important/);
assert.match(mobile, /\.solar-corona-overlay/);
assert.match(mobile, /\.spin-btn\{grid-column:1\/-1!important/);

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

// Mobile is a responsive presentation layer, not a hidden dependency loader.
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

console.log('HELIOS mobile showcase + final exposure lock + explicit-loader + Solar Free Spins HUD invariants: PASS');