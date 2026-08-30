import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const [source,contract] = await Promise.all([
  readFile(new URL('../helios-resource-sonification.js', import.meta.url),'utf8'),
  readFile(new URL('../.janus/HELIOS_RESOURCE_SONIFICATION.json', import.meta.url),'utf8').then(JSON.parse)
]);

assert.match(source,/VERSION='1\.0\.0'/);
assert.match(source,/helios:music-state/);
assert.match(source,/helios:resource-policy/);
assert.match(source,/compute-state/);
assert.match(source,/state\.musicEnabled&&state\.computeActive/);
assert.match(source,/cpuRatio/);
assert.match(source,/gpuRatio/);
assert.match(source,/cpuLfo/);
assert.match(source,/gpuLfo/);
assert.match(source,/BiquadFilter|createBiquadFilter/);
assert.match(source,/maxPolicy/);
assert.match(source,/setTimeout\(ping,2400\)/);
assert.match(source,/presentation_only:true/);
assert.match(source,/reads_bet:false/);
assert.match(source,/reads_balance:false/);
assert.match(source,/reads_win:false/);
assert.match(source,/reads_rng:false/);
assert.doesNotMatch(source,/Math\.random\s*\(/);
assert.doesNotMatch(source,/loss_streak|near_miss|wager_history|inferred_vulnerability/i);
assert.doesNotMatch(source,/getElementById\(['"]bet['"]\)|getElementById\(['"]balance['"]\)/);

assert.equal(contract.version,'1.0.0');
assert.equal(contract.classification,'PRESENTATION_ONLY_RESOURCE_POLICY_AUDIO');
assert.equal(contract.activation.requires_cosmic_audio,true);
assert.equal(contract.activation.requires_compute_active,true);
assert.equal(contract.truth_boundary.audio_is_throughput_claim,false);
assert.equal(contract.truth_boundary.audio_is_earnings_claim,false);
assert.equal(contract.authority.rng_effect,'NONE');
assert.equal(contract.authority.rtp_effect,'NONE');
assert.equal(contract.authority.payout_effect,'NONE');
assert.equal(contract.authority.compute_routing_effect,'NONE');

console.log('HELIOS CPU/GPU resource sonification invariants: PASS');
