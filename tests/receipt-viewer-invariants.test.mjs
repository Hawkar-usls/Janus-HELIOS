import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const [source,contract,indexHtml] = await Promise.all([
  readFile(new URL('../helios-receipt-viewer.js', import.meta.url),'utf8'),
  readFile(new URL('../.janus/HELIOS_RECEIPT_VIEWER.json', import.meta.url),'utf8').then(JSON.parse),
  readFile(new URL('../index.html', import.meta.url),'utf8')
]);

assert.match(source,/VERSION='1\.1\.0'/);
assert.match(source,/HUMAN_SUMMARY/);
assert.match(source,/RAW JSON · MACHINE VIEW/);
assert.match(source,/COPY JSON/);
assert.match(source,/navigator\.clipboard\.writeText\(raw\)/);
assert.match(source,/document\.getElementById\('receipt'\)/);
assert.match(source,/document\.getElementById\('receipt-status'\)/);
assert.match(source,/resource_policy/);
assert.match(source,/cpu_percent/);
assert.match(source,/gpu_percent/);
assert.match(source,/provider_route/);
assert.match(source,/task_type/);
assert.match(source,/compute_units/);
assert.match(source,/proof_kind/);
assert.match(source,/sink/);
assert.match(source,/receipt_id/);
assert.match(source,/DEMO PROOF/);
assert.match(source,/VERIFIED/);
assert.match(source,/textContent/);
assert.match(source,/raw_json_preserved:true/);
assert.match(source,/receipt_authority:'NONE'/);
assert.match(source,/feature_loader_authority:'NONE'/);
assert.match(source,/const preserveRawOpen=Boolean\(state\.details\?\.open\)/);
assert.match(source,/state\.details\.open=preserveRawOpen/);
assert.match(indexHtml,/id="helios-receipt-viewer-script"[^>]+helios-receipt-viewer\.js\?v=1\.1\.0/);
assert.match(indexHtml,/HELIOS ROUTER v2/);
assert.doesNotMatch(source,/getElementById\(['"]bet['"]\)/);
assert.doesNotMatch(source,/getElementById\(['"]balance['"]\)/);
assert.doesNotMatch(source,/loss_streak|near_miss|wager_history|inferred_vulnerability/i);
assert.doesNotMatch(source,/Math\.random\s*\(/);
assert.doesNotMatch(source,/createElement\(['"]script['"]\)/);
assert.doesNotMatch(source,/loadBuyerEnhancements/);

assert.equal(contract.version,'1.1.0');
assert.equal(contract.classification,'PRESENTATION_ONLY_HUMAN_MACHINE_RECEIPT_VIEWER');
assert.equal(contract.machine_surface.raw_json_preserved,true);
assert.equal(contract.machine_surface.viewer_mutates_receipt_payload,false);
assert.equal(contract.loader_boundary.authoritative_feature_loader,'index.html');
assert.equal(contract.loader_boundary.viewer_may_load_other_feature_scripts,false);
assert.equal(contract.loader_boundary.dynamic_feature_script_injection,false);
assert.equal(contract.trust_boundary.mock_or_simulation_is_never_labeled_verified,true);
assert.equal(contract.trust_boundary.dynamic_receipt_values_render_with_textContent,true);
assert.equal(contract.authority.rng_effect,'NONE');
assert.equal(contract.authority.rtp_effect,'NONE');
assert.equal(contract.authority.payout_effect,'NONE');
assert.equal(contract.authority.compute_routing_effect,'NONE');
assert.equal(contract.authority.receipt_mutation_effect,'NONE');
assert.equal(contract.authority.feature_loader_effect,'NONE');

console.log('HELIOS human-first receipt viewer + authoritative loader boundary invariants: PASS');
