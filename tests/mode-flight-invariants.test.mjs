import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const [source,bridge,contract] = await Promise.all([
  readFile(new URL('../helios-mode-flight.js', import.meta.url),'utf8'),
  readFile(new URL('../helios-stellar-bridge.js', import.meta.url),'utf8'),
  readFile(new URL('../.janus/HELIOS_MODE_FLIGHT.json', import.meta.url),'utf8').then(JSON.parse)
]);

assert.match(source,/VERSION = '1\.0\.0'/);
assert.match(source,/CAMERA_DURATION_MS = 2400/);
assert.match(source,/TINT_DURATION_MS = 1900/);
assert.match(source,/divine:Object\.freeze\(\{x:-42,y:18,rotate:-1\.15,scale:1\.072/);
assert.match(source,/gridjack:Object\.freeze\(\{x:38,y:-14,rotate:1\.05,scale:1\.068/);
assert.match(source,/custom:Object\.freeze\(\{x:-28,y:-24,rotate:\.78,scale:1\.076/);
assert.match(source,/style\.setProperty\('filter','none','important'\)/);
assert.match(source,/transform \$\{CAMERA_DURATION_MS\}ms cubic-bezier\(\.16,\.78,\.22,1\)/);
assert.match(source,/background-color \$\{TINT_DURATION_MS\}ms/);
assert.match(source,/attributeFilter:\['data-game-mode'\]/);
assert.match(source,/style\.setProperty\('transform',transformFor\(cue\),'important'\)/);
assert.match(source,/presentation_only:true/);
assert.match(source,/reads_mode:true/);
assert.match(source,/reads_spin:false/);
assert.match(source,/reads_cascade:false/);
assert.match(source,/reads_win:false/);
assert.match(source,/reads_bonus:false/);
assert.match(source,/reads_compute:false/);
assert.match(source,/rng_effect:'NONE'/);
assert.match(source,/rtp_effect:'NONE'/);
assert.match(source,/compute_routing_effect:'NONE'/);
assert.doesNotMatch(source,/\bfetch\s*\(/);
assert.doesNotMatch(source,/XMLHttpRequest/);
assert.doesNotMatch(source,/WebSocket/);
assert.doesNotMatch(source,/Math\.random\s*\(/);
assert.doesNotMatch(source,/helios:spin/);
assert.doesNotMatch(source,/helios:cascade/);
assert.doesNotMatch(source,/helios:bonus/);
assert.match(bridge,/helios-mode-flight-script/);
assert.match(bridge,/helios-mode-flight\.js\?v=1\.0\.0/);
assert.equal(contract.classification,'PRESENTATION_ONLY_MODE_CAMERA_AND_TINT_CROSSFADE');
assert.equal(contract.camera_duration_ms,2400);
assert.equal(contract.tint_duration_ms,1900);
assert.equal(contract.authority?.rng_effect,'NONE');
assert.equal(contract.authority?.rtp_effect,'NONE');
assert.equal(contract.authority?.compute_routing_effect,'NONE');

console.log('HELIOS mode flight camera + tint crossfade invariants: PASS');
