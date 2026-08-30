import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const [audio,quasar,bridge,contract] = await Promise.all([
  readFile(new URL('../helios-quasar-sonification.js', import.meta.url),'utf8'),
  readFile(new URL('../helios-bonus-quasar.js', import.meta.url),'utf8'),
  readFile(new URL('../helios-stellar-bridge.js', import.meta.url),'utf8'),
  readFile(new URL('../.janus/HELIOS_QUASAR_SONIFICATION.json', import.meta.url),'utf8').then(JSON.parse)
]);

assert.match(audio,/VERSION='1\.0\.0'/);
assert.match(audio,/primary_spin_ms:3050/);
assert.match(audio,/secondary_spin_ms:4350/);
assert.match(audio,/precess_ms:5600/);
assert.match(audio,/core_pulse_ms:1900/);
assert.match(audio,/PARTICLE_DIVISIONS=4/);
assert.match(audio,/helios:music-state/);
assert.match(audio,/helios:bonus-quasar-state/);
assert.match(audio,/1000\/Math\.max\(500,Number\(state\.kinematics\.primary_spin_ms/);
assert.match(audio,/1000\/Math\.max\(500,Number\(state\.kinematics\.secondary_spin_ms/);
assert.match(audio,/1000\/Math\.max\(500,Number\(state\.kinematics\.precess_ms/);
assert.match(audio,/1000\/Math\.max\(500,Number\(state\.kinematics\.core_pulse_ms/);
assert.match(audio,/primary_spin_ms\|\|3050\)\/PARTICLE_DIVISIONS/);
assert.match(audio,/reads_music_enable_state:true/);
assert.match(audio,/reads_bonus_quasar_state:true/);
assert.match(audio,/reads_spin:false/);
assert.match(audio,/reads_cascade:false/);
assert.match(audio,/reads_win:false/);
assert.match(audio,/reads_bet:false/);
assert.match(audio,/reads_balance:false/);
assert.match(audio,/reads_compute:false/);
assert.match(audio,/rng_effect:'NONE'/);
assert.match(audio,/rtp_effect:'NONE'/);
assert.match(audio,/payout_effect:'NONE'/);
assert.match(audio,/compute_routing_effect:'NONE'/);
assert.doesNotMatch(audio,/helios:spin-complete/);
assert.doesNotMatch(audio,/helios:cascade/);
assert.doesNotMatch(audio,/getElementById\(['"]bet['"]\)/);
assert.doesNotMatch(audio,/getElementById\(['"]balance['"]\)/);
assert.doesNotMatch(audio,/Math\.random\s*\(/);
assert.doesNotMatch(audio,/\bfetch\s*\(/);
assert.doesNotMatch(audio,/XMLHttpRequest/);
assert.doesNotMatch(audio,/WebSocket/);

assert.match(quasar,/VERSION='1\.1\.0'/);
assert.match(quasar,/PRIMARY_SPIN_MS=3050/);
assert.match(quasar,/SECONDARY_SPIN_MS=4350/);
assert.match(quasar,/PRECESS_MS=5600/);
assert.match(quasar,/CORE_PULSE_MS=1900/);
assert.match(quasar,/helios:bonus-quasar-state/);
assert.match(bridge,/helios-quasar-sonification-script/);
assert.match(bridge,/helios-quasar-sonification\.js\?v=1\.0\.0/);
assert.ok(bridge.indexOf('loadBonusQuasar();') < bridge.indexOf('loadQuasarSonification();'));

assert.equal(contract.classification,'PRESENTATION_ONLY_BONUS_QUASAR_AUDIO_SYNC');
assert.equal(contract.activation?.requires_cosmic_music_enabled,true);
assert.equal(contract.activation?.requires_bonus_quasar_active,true);
assert.equal(contract.activation?.autoplay_when_music_disabled,false);
assert.equal(contract.kinematics?.primary_spin_ms,3050);
assert.equal(contract.kinematics?.secondary_spin_ms,4350);
assert.equal(contract.kinematics?.precess_ms,5600);
assert.equal(contract.kinematics?.core_pulse_ms,1900);
assert.equal(contract.kinematics?.particle_divisions_per_primary_rotation,4);
assert.equal(contract.authority?.rng_effect,'NONE');
assert.equal(contract.authority?.rtp_effect,'NONE');
assert.equal(contract.authority?.payout_effect,'NONE');
assert.equal(contract.authority?.compute_routing_effect,'NONE');

console.log('HELIOS bonus quasar synchronized generative audio invariants: PASS');
