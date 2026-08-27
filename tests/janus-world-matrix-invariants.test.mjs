import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const [html, worlds] = await Promise.all([
  readFile(new URL('../index.html', import.meta.url), 'utf8'),
  readFile(new URL('../helios-janus-worlds.js', import.meta.url), 'utf8')
]);

assert.match(html, /helios-janus-worlds\.js\?v=1\.0\.0/);
assert.match(worlds, /JANUS_WORLD_MATRIX/);
assert.match(worlds, /RESPICIENS_ET_PROSPICIENS/);
assert.match(worlds, /APERIATUR PORTA/);
assert.match(worlds, /samples:256/);
assert.match(worlds, /helios:world-matrix/);
assert.match(worlds, /helios:porta-aperta/);
assert.match(worlds, /AUREA/);
assert.match(worlds, /AETHER/);
assert.match(worlds, /VORTEX/);
assert.match(worlds, /UMBRA/);
assert.match(worlds, /LIMEN/);
assert.match(worlds, /presentation_only:true/);
assert.match(worlds, /rng_effect:'NONE'/);
assert.match(worlds, /payout_effect:'NONE'/);
assert.match(worlds, /rtp_effect:'NONE'/);
assert.match(worlds, /compute_effect:'NONE'/);
assert.match(worlds, /route_effect:'NONE'/);
assert.match(worlds, /weapon_domain:false/);
assert.equal(/ballistic|rifle|bullet|projectile|aiming|weapon target/i.test(worlds), false);

console.log('HELIOS JANUS World Matrix invariants: PASS');
