import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const [html, mobile, bonus] = await Promise.all([
  readFile(new URL('../index.html', import.meta.url), 'utf8'),
  readFile(new URL('../helios-mobile.js', import.meta.url), 'utf8'),
  readFile(new URL('../helios-bonus.js', import.meta.url), 'utf8')
]);

assert.match(html, /width=device-width,initial-scale=1,maximum-scale=1,viewport-fit=cover/);
assert.match(html, /helios-mobile\.js\?v=1\.0\.0/);
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

assert.match(bonus, /solar-free-spins-hud/);
assert.match(bonus, /@media\(max-width:520px\)/);
assert.match(bonus, /\.solar-free-spins-hud\{grid-template-columns:1fr 1fr\}/);
assert.match(bonus, /\.bonus-buy-btn\{width:100%\}/);

console.log('HELIOS mobile showcase + Solar Free Spins HUD invariants: PASS');
