import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const [director, mobile, contract] = await Promise.all([
  readFile(new URL('../helios-dual-stream-director.js', import.meta.url), 'utf8'),
  readFile(new URL('../helios-mobile.js', import.meta.url), 'utf8'),
  readFile(new URL('../.janus/HELIOS_DUAL_STREAM_DIRECTOR.json', import.meta.url), 'utf8').then(JSON.parse)
]);

assert.equal(contract.classification, 'PRESENTATION_ONLY_PROCEDURAL_VISUAL_AUDIO_NARRATIVE_DIRECTOR');
assert.equal(contract.authority_boundary.presentation_only, true);
assert.equal(contract.authority_boundary.rng_effect, 'NONE');
assert.equal(contract.authority_boundary.rtp_effect, 'NONE');
assert.equal(contract.authority_boundary.bet_effect, 'NONE');
assert.equal(contract.authority_boundary.compute_routing_effect, 'NONE');
assert.equal(contract.presentation_model.resolution_is_mandatory, true);
assert.equal(contract.presentation_model.reduced_motion_respected, true);
assert.equal(contract.conceptual_origin.mapping.C, 'DIVERGENCE / controlled presentation script-break');
assert.equal(contract.conceptual_origin.mapping.L, 'RESOLUTION / coherence and return-to-readable-state');

assert.match(mobile, /helios-dual-stream-director-script/);
assert.match(mobile, /helios-dual-stream-director\.js\?v=1\.0\.0/);
assert.match(director, /DIRECTOR_VERSION = '1\.0\.0'/);
assert.match(director, /const RHO = 1\.20/);
assert.match(director, /MAX_DIVERGENCE = 1 \/ RHO/);
assert.match(director, /RHO\*rawC/);
assert.match(director, /requiredL\/RHO/);
assert.match(director, /DIVERGENCE/);
assert.match(director, /RESOLUTION/);
assert.match(director, /prefers-reduced-motion: reduce/);
assert.match(director, /helios:music-state/);
assert.match(director, /helios:director-state/);
assert.match(director, /presentation_only:true/);
assert.match(director, /rng_effect:'NONE'/);
assert.match(director, /rtp_effect:'NONE'/);

// Director may observe whether a settled spin paid, but must not derive choreography from stake, loss history or player vulnerability.
assert.match(director, /Number\(e\.detail\?\.spin_win\|\|0\)>0/);
assert.doesNotMatch(director, /getElementById\(['"]bet['"]\)/);
assert.doesNotMatch(director, /getElementById\(['"]balance['"]\)/);
assert.doesNotMatch(director, /querySelector\([^\n]*bet/i);
assert.doesNotMatch(director, /querySelector\([^\n]*balance/i);
assert.doesNotMatch(director, /Math\.random\(/);
assert.doesNotMatch(director, /crypto\.getRandomValues/);
assert.doesNotMatch(director, /\.value\s*=\s*.*bet/i);
assert.doesNotMatch(director, /balance\s*[-+*/]?=/i);
assert.doesNotMatch(director, /RTP\s*[-+*/]?=/);

// Forbidden inputs are declared as a negative boundary, not consumed as runtime signals.
for (const term of ['loss_streak','near_miss','wager_history','inferred_vulnerability','problem_gambling_label']) {
  assert.equal(contract.event_inputs.forbidden_player_inputs.includes(term.toUpperCase()), true);
}

console.log('HELIOS dual-stream presentation director invariants: PASS');
