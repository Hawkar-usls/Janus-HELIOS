import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const [source,bridge,contract] = await Promise.all([
  readFile(new URL('../helios-energy-spin-sonification.js', import.meta.url),'utf8'),
  readFile(new URL('../helios-stellar-bridge.js', import.meta.url),'utf8'),
  readFile(new URL('../.janus/HELIOS_ENERGY_SPIN_SONIFICATION.json', import.meta.url),'utf8').then(JSON.parse)
]);

assert.match(source,/VERSION='1\.0\.0'/);
assert.match(source,/MODE_ROOTS/);
assert.match(source,/ROUTE_OFFSETS/);
assert.match(source,/sessionSeed/);
assert.match(source,/seededUnit/);
assert.match(source,/energyIgnition/);
assert.match(source,/energyResolve/);
assert.match(source,/#energy-spin/);
assert.match(source,/helios:music-state/);
assert.match(source,/helios:spin-complete/);
assert.match(source,/source\|\|'\'\)!=='energy'/);
assert.match(source,/AudioContext/);
assert.doesNotMatch(source,/Math\.random\s*\(/);
assert.doesNotMatch(source,/\bfetch\s*\(/);
assert.doesNotMatch(source,/getElementById\(['"]bet['"]\)/);
assert.doesNotMatch(source,/getElementById\(['"]balance['"]\)/);
assert.doesNotMatch(source,/lossStreak|nearMiss|wageringHistory|playerVulnerability/i);
assert.match(source,/rng_effect:'NONE'/);
assert.match(source,/rtp_effect:'NONE'/);
assert.match(source,/payout_effect:'NONE'/);
assert.match(source,/compute_routing_effect:'NONE'/);
assert.match(bridge,/helios-energy-spin-sonification-script/);
assert.match(bridge,/helios-energy-spin-sonification\.js\?v=1\.0\.0/);
assert.equal(contract.classification,'PRESENTATION_ONLY_PROCEDURAL_ENERGY_SPIN_AUDIO');
assert.equal(contract.activation?.requires_cosmic_music_on,true);
assert.equal(contract.audio_policy?.web_audio_generated,true);
assert.equal(contract.audio_policy?.session_seed_follow,true);
assert.equal(contract.authority?.rng_effect,'NONE');
assert.equal(contract.authority?.rtp_effect,'NONE');
assert.equal(contract.authority?.payout_effect,'NONE');
assert.equal(contract.authority?.compute_routing_effect,'NONE');

console.log('HELIOS Energy Spin procedural sonification invariants: PASS');
