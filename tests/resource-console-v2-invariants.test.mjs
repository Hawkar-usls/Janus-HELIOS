import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const [source,config,contract] = await Promise.all([
  readFile(new URL('../helios-resource-console.js', import.meta.url),'utf8'),
  readFile(new URL('../config/helios.resource-policy.v2.json', import.meta.url),'utf8').then(JSON.parse),
  readFile(new URL('../.janus/HELIOS_RESOURCE_CONSOLE_V2.json', import.meta.url),'utf8').then(JSON.parse)
]);

assert.match(source,/VERSION='2\.0\.0'/);
assert.match(source,/HELIOS ROUTER v2/);
assert.match(source,/id="gpu"/);
assert.match(source,/CPU/);
assert.match(source,/GPU/);
assert.match(source,/HYBRID/);
assert.match(source,/MAX/);
assert.match(source,/visual_envelope_ratio/);
assert.match(source,/helios:resource-policy/);
assert.match(source,/obj\.router_version=p\.router_version/);
assert.match(source,/throughput_scaling:'NOT_MODELED'/);
assert.match(source,/public_gpu_execution/);
assert.match(source,/DESKTOP_AGENT_OR_APPROVED_GPU_ADAPTER/);
assert.match(source,/const next=JSON\.stringify\(obj,null,2\)/);
assert.match(source,/if\(next===text\) return/);
assert.match(source,/try\{state\.receipt\.textContent=next;\}finally\{state\.patchGuard=false;\}/);
assert.doesNotMatch(source,/getElementById\(['"]bet['"]\)/);
assert.doesNotMatch(source,/getElementById\(['"]balance['"]\)/);
assert.doesNotMatch(source,/loss_streak|near_miss|wager_history|inferred_vulnerability/i);

assert.equal(config.router_version,'2.0.0');
assert.equal(config.cpu.max_percent,30);
assert.equal(config.gpu.max_percent,80);
assert.equal(config.visual_envelope_weights.cpu,0.35);
assert.equal(config.visual_envelope_weights.gpu,0.65);
assert.equal(config.visual_envelope_weights.throughput_claim,'NONE_PRESENTATION_MAPPING_ONLY');
assert.deepEqual(config.profiles.map(x=>x.id),['cpu','gpu','hybrid','max']);
assert.equal(config.max_policy_sparks.requires_cpu_at_max,true);
assert.equal(config.max_policy_sparks.requires_gpu_at_max,true);
assert.equal(config.game_effect,'NONE');
assert.equal(config.rng_effect,'NONE');
assert.equal(config.rtp_effect,'NONE');

assert.equal(contract.classification,'EXPLICIT_USER_RESOURCE_POLICY_CONTROL');
assert.deepEqual(contract.resource_classes,['CPU','GPU','HYBRID','IDLE']);
assert.equal(contract.gpu_public_execution,'SIMULATED_POLICY_ONLY');
assert.equal(contract.visual_envelope.throughput_claim,'NONE_PRESENTATION_MAPPING_ONLY');
assert.equal(contract.reads_game_math,false);
assert.equal(contract.authority.rng_effect,'NONE');
assert.equal(contract.authority.rtp_effect,'NONE');
assert.equal(contract.authority.payout_effect,'NONE');

console.log('HELIOS Router v2 CPU/GPU resource console invariants: PASS');
