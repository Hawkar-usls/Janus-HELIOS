import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const [source,contract,receiptViewer] = await Promise.all([
  readFile(new URL('../helios-buyer-cockpit.js', import.meta.url),'utf8'),
  readFile(new URL('../.janus/HELIOS_BUYER_COCKPIT.json', import.meta.url),'utf8').then(JSON.parse),
  readFile(new URL('../helios-receipt-viewer.js', import.meta.url),'utf8')
]);

assert.match(source,/VERSION='1\.0\.0'/);
assert.match(source,/DEMO TRUST \+ COMPUTE LIFECYCLE/);
assert.match(source,/ARMED','ADMITTING','SCHEDULING','RUNNING','VERIFYING','RECEIPT/);
assert.match(source,/ADVANCED RESOURCE GOVERNOR · POLICY PREVIEW/);
assert.match(source,/idle_only/);
assert.match(source,/ac_only/);
assert.match(source,/gpu_while_idle/);
assert.match(source,/pause_on_interaction/);
assert.match(source,/thermal_ceiling_c/);
assert.match(source,/watt_ceiling_w/);
assert.match(source,/quiet_hours_enabled/);
assert.match(source,/ALLOCATION MIXER · BUYER PREVIEW/);
assert.match(source,/routing_effect:'NONE_PUBLIC_DEMO'/);
assert.match(source,/CAPABILITY SELF-TEST · OPT-IN \/ LOCAL ONLY/);
assert.match(source,/thread_class/);
assert.match(source,/webgpu_api/);
assert.match(source,/detailed_fingerprint_collected:false/);
assert.match(source,/network_transmission:'NONE'/);
assert.match(source,/VERIFICATION \+ ATTESTATION CHAIN/);
assert.match(source,/Lease fencing \/ stale result rejection/);
assert.match(source,/COMPUTE CONSTELLATION · DISTRIBUTED FABRIC VIEW/);
assert.match(source,/COMPUTE PASSPORT · DEMO SESSION/);
assert.match(source,/sessionStorage\.setItem/);
assert.match(source,/wagering_value:'NONE'/);
assert.match(source,/session-identity-manifest\.v1/);
assert.match(source,/ONE EXPLAIN PANEL · BUYER HANDOFF/);
assert.match(source,/RNG ⟂ COMPUTE/);
assert.match(source,/external_energy_signal:'NOT_CONNECTED'/);
assert.doesNotMatch(source,/Math\.random\s*\(/);
assert.doesNotMatch(source,/getElementById\(['"]bet['"]\)|getElementById\(['"]balance['"]\)/);
assert.doesNotMatch(source,/loss_streak|near_miss|wager_history|inferred_vulnerability/i);

assert.equal(contract.version,'1.0.0');
assert.equal(contract.classification,'DEMO_BUYER_PRESENTATION_AND_POLICY_PREVIEW');
assert.equal(contract.truth_boundary.real_provider_connected,false);
assert.equal(contract.truth_boundary.real_verifier_connected,false);
assert.equal(contract.truth_boundary.real_gpu_workload_executed_by_page,false);
assert.equal(contract.truth_boundary.allocation_mixer_changes_public_demo_routing,false);
assert.equal(contract.truth_boundary.governor_controls_enforced_by_public_page,false);
assert.equal(contract.coarse_self_test.requires_user_click,true);
assert.equal(contract.coarse_self_test.local_only,true);
assert.equal(contract.passport.authoritative,false);
assert.equal(contract.passport.wagering_value,'NONE');
assert.equal(contract.authority.rng_effect,'NONE');
assert.equal(contract.authority.rtp_effect,'NONE');
assert.equal(contract.authority.payout_effect,'NONE');
assert.equal(contract.authority.compute_routing_effect,'NONE_FROM_BUYER_LAB');

assert.match(receiptViewer,/helios-buyer-cockpit\.js\?v=1\.0\.0/);
assert.match(receiptViewer,/helios-resource-sonification\.js\?v=1\.0\.0/);

console.log('HELIOS TOPA buyer cockpit invariants: PASS');
