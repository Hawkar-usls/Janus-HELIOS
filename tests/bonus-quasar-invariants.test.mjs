import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const [source,bridge,contract] = await Promise.all([
  readFile(new URL('../helios-bonus-quasar.js', import.meta.url),'utf8'),
  readFile(new URL('../helios-stellar-bridge.js', import.meta.url),'utf8'),
  readFile(new URL('../.janus/HELIOS_BONUS_QUASAR.json', import.meta.url),'utf8').then(JSON.parse)
]);

assert.match(source,/VERSION='1\.0\.0'/);
assert.match(source,/TRANSIENT_CORONA_MS=3400/);
assert.match(source,/helios:bonus-session-start/);
assert.match(source,/helios:solar-corona/);
assert.match(source,/solar-free-spins-active/);
assert.match(source,/bonus-quasar-active/);
assert.match(source,/helios-quasar-disk/);
assert.match(source,/heliosQuasarSpin 3\.05s linear infinite/);
assert.match(source,/heliosQuasarPrecess 5\.6s ease-in-out infinite alternate/);
assert.match(source,/prefers-reduced-motion: reduce/);
assert.match(source,/presentation_only:true/);
assert.match(source,/reads_bonus:true/);
assert.match(source,/reads_mode:false/);
assert.match(source,/reads_spin:false/);
assert.match(source,/reads_cascade:false/);
assert.match(source,/reads_win:false/);
assert.match(source,/reads_compute:false/);
assert.match(source,/rng_effect:'NONE'/);
assert.match(source,/rtp_effect:'NONE'/);
assert.match(source,/payout_effect:'NONE'/);
assert.match(source,/compute_routing_effect:'NONE'/);
assert.doesNotMatch(source,/helios:spin-complete/);
assert.doesNotMatch(source,/getElementById\(['"]bet['"]\)/);
assert.doesNotMatch(source,/getElementById\(['"]balance['"]\)/);
assert.doesNotMatch(source,/Math\.random\s*\(/);
assert.doesNotMatch(source,/\bfetch\s*\(/);
assert.doesNotMatch(source,/XMLHttpRequest/);
assert.doesNotMatch(source,/WebSocket/);
assert.match(bridge,/helios-bonus-quasar-script/);
assert.match(bridge,/helios-bonus-quasar\.js\?v=1\.0\.0/);
assert.equal(contract.classification,'PRESENTATION_ONLY_BONUS_ORBIT_QUASAR');
assert.equal(contract.visual_policy?.fullscreen_overlay,false);
assert.equal(contract.visual_policy?.strobe,false);
assert.equal(contract.visual_policy?.local_orbit_field_only,true);
assert.equal(contract.authority?.rng_effect,'NONE');
assert.equal(contract.authority?.rtp_effect,'NONE');
assert.equal(contract.authority?.payout_effect,'NONE');
assert.equal(contract.authority?.compute_routing_effect,'NONE');

console.log('HELIOS bonus-only orbit quasar invariants: PASS');
