import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const [source,bridge,contract] = await Promise.all([
  readFile(new URL('../helios-reel-identity.js', import.meta.url),'utf8'),
  readFile(new URL('../helios-stellar-bridge.js', import.meta.url),'utf8'),
  readFile(new URL('../.janus/HELIOS_REEL_IDENTITY.json', import.meta.url),'utf8').then(JSON.parse)
]);

assert.match(source,/VERSION='1\.0\.0'/);
assert.match(source,/reel-identity-v1/);
assert.match(source,/data-game-mode="helios"/);
assert.match(source,/data-game-mode="divine"/);
assert.match(source,/data-game-mode="gridjack"/);
assert.match(source,/data-game-mode="custom"/);
assert.match(source,/SOLAR_BRASS|helios/i);
assert.match(source,/heliosGridScan/);
assert.match(source,/cell\.textContent\.trim\(\)/);
assert.match(source,/cell\.dataset\.symbol=/);
assert.match(source,/cell\.dataset\.rank=/);
assert.doesNotMatch(source,/cell\.textContent\s*=/);
assert.doesNotMatch(source,/innerHTML\s*=.*cell/);
assert.doesNotMatch(source,/Math\.random\s*\(/);
assert.doesNotMatch(source,/\bfetch\s*\(/);
assert.doesNotMatch(source,/getElementById\(['"]bet['"]\)/);
assert.doesNotMatch(source,/getElementById\(['"]balance['"]\)/);
assert.match(source,/rng_effect:'NONE'/);
assert.match(source,/rtp_effect:'NONE'/);
assert.match(source,/payout_effect:'NONE'/);
assert.match(source,/compute_routing_effect:'NONE'/);
assert.match(bridge,/helios-reel-identity-script/);
assert.match(bridge,/helios-reel-identity\.js\?v=1\.0\.0/);
assert.equal(contract.classification,'PRESENTATION_ONLY_MODE_NATIVE_REEL_IDENTITY');
assert.equal(contract.visual_policy?.symbol_text_preserved,true);
assert.equal(contract.visual_policy?.fullscreen_overlay,false);
assert.equal(contract.authority?.rng_effect,'NONE');
assert.equal(contract.authority?.rtp_effect,'NONE');
assert.equal(contract.authority?.payout_effect,'NONE');
assert.equal(contract.authority?.compute_routing_effect,'NONE');

console.log('HELIOS mode-native reel identity invariants: PASS');
