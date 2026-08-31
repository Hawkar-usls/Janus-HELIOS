import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import {
  HELIOS_TRUST_FABRIC_VERSION,
  HELIOS_TRUST_FABRIC_LAWS,
  ProviderAuthorityEpoch,
  TrueWorkAccounting,
  DeviceHealthPassportBuilder,
  assertHumanBlindTelemetry,
  evaluateHostFirstQuietCanary,
  createReceiptProvenanceEnvelope,
  assertVerifierAssuranceMonotonicity,
  qualifyAcceleratorShadow,
  createComputeLineageGraph
} from '../src/helios-trust-fabric.js';

assert.equal(HELIOS_TRUST_FABRIC_VERSION, '1.0.0');
assert.ok(HELIOS_TRUST_FABRIC_LAWS.includes('REGISTERED_PROVIDER_NE_ADMITTED_PROVIDER'));
assert.ok(HELIOS_TRUST_FABRIC_LAWS.includes('GAME_RNG_PERP_COMPUTE'));

assert.equal(assertHumanBlindTelemetry({ gpu_temperature_c: 64, power_w: 112 }), true);
assert.throws(() => assertHumanBlindTelemetry({ nested: { screen: 'pixels' } }), /HUMAN_OBSERVATION_FORBIDDEN/);
assert.throws(() => assertHumanBlindTelemetry({ process_name: 'game.exe' }), /HUMAN_OBSERVATION_FORBIDDEN/);

const authority = new ProviderAuthorityEpoch();
const registered = authority.register({ provider_id: 'science', manifest_version: '1.0.0', resource_classes: ['GPU'] });
assert.equal(registered.status, 'REGISTERED_NOT_ADMITTED');
assert.equal(registered.manifest.registration_is_authority, false);
assert.equal(registered.manifest.admission_default, 'DENY');
const lease = authority.admit('science', { scopes: ['EXECUTE', 'VERIFY'], max_dispatches: 2 });
assert.equal(lease.authority_epoch, 1);
assert.equal(lease.transferable, false);
assert.equal(authority.validateLease(lease.lease_id, { provider_id: 'science', required_scope: 'EXECUTE', consume: true }).dispatches_used, 1);
assert.equal(authority.validateLease(lease.lease_id, { provider_id: 'science', required_scope: 'EXECUTE', consume: true }).dispatches_used, 2);
assert.throws(() => authority.validateLease(lease.lease_id, { consume: true }), /PROVIDER_DISPATCH_BUDGET_EXHAUSTED/);
authority.rotateEpoch('TEST_ROTATION');
assert.throws(() => authority.validateLease(lease.lease_id), /STALE_PROVIDER_AUTHORITY_EPOCH/);

const qos = evaluateHostFirstQuietCanary(
  { cpu_percent: 30, gpu_percent: 80 },
  { allow_execution: true, allowed_load_scale: 0.8 },
  { idle_state: 'BUSY', cpu_load_percent: 72, gpu_load_percent: 55 }
);
assert.equal(qos.external_compute_yields_first, true);
assert.equal(qos.human_observation, 'FORBIDDEN');
assert.ok(qos.cpu_percent <= 30 && qos.gpu_percent <= 80);
assert.equal(qos.scale, 0.25);
const blockedQos = evaluateHostFirstQuietCanary({ cpu_percent: 30, gpu_percent: 80 }, { allow_execution: false, allowed_load_scale: 0 }, {});
assert.equal(blockedQos.allow_execution, false);
assert.equal(blockedQos.cpu_percent, 0);
assert.equal(blockedQos.gpu_percent, 0);
assert.throws(() => evaluateHostFirstQuietCanary({}, {}, { keyboard: 'raw' }), /HUMAN_OBSERVATION_FORBIDDEN/);

const digest = 'a'.repeat(64);
const nonAuthoritative = createReceiptProvenanceEnvelope({ provider_id: 'science', receipt_id: 'r0' });
assert.equal(nonAuthoritative.authority, 'NON_AUTHORITATIVE');
assert.ok(nonAuthoritative.claim_reasons.some(x => x.includes('MISSING_OR_INVALID')));
const authoritative = createReceiptProvenanceEnvelope({
  receipt_id: 'r1', provider_id: 'science', lease_id: 'lease-1', job_id: 'job-1', verifier_id: 'verifier-1', authority_epoch: 4,
  provider_manifest_digest: digest, adapter_digest: digest, executor_digest: digest, verifier_digest: digest, guardian_policy_digest: digest,
  provider_execution_verified: true, settlement_authoritative: true
});
assert.equal(authoritative.authority, 'AUTHORITATIVE');
assert.equal(authoritative.law, 'WORK_RESULT_EXISTS_NE_AUTHORITY_PROVEN');

const accounting = new TrueWorkAccounting();
accounting.record('assigned_slices', 10);
accounting.record('admitted_slices', 8);
accounting.record('executed_slices', 7);
accounting.record('retry_attempts', 2);
accounting.record('stale_or_rejected_results', 1);
accounting.record('verified_results', 6);
accounting.record('device_ms', 1200);
accounting.recordMeasuredWattHours(0.125);
const work = accounting.snapshot();
assert.equal(work.assigned_slices, 10);
assert.equal(work.verified_results, 6);
assert.equal(work.measured_watt_hours, 0.125);
assert.ok(work.laws.includes('ASSIGNED_WORK_NE_COMPLETED_WORK'));

const passport = new DeviceHealthPassportBuilder({ pseudonymous_device_id: 'device-pseudo-1', guardian_policy_digest: digest });
passport.addObservation({
  sealed_observation_window_id: 'w1', sensor_source: 'NVML', sensor_freshness: 'FRESH', guardian_state: 'GREEN',
  observed_max_temp_c: 66, compute_hours: 0.5, verified_work_hours: 0.45, measured_watt_hours: 0.08
});
passport.addObservation({ sealed_observation_window_id: 'w2', sensor_source: null, guardian_state: 'UNKNOWN', observed_max_temp_c: null });
passport.addReceiptReference({ receipt_id: 'r1', receipt_digest: digest, authority: 'AUTHORITATIVE' });
const sealed = passport.seal();
assert.equal(sealed.summary.windows, 2);
assert.equal(sealed.summary.max_observed_temperature_c, 66);
assert.equal(sealed.summary.unknown_temperature_windows, 1);
assert.equal(sealed.summary.authoritative_receipts, 1);
assert.equal(sealed.content_telemetry_present, false);
assert.equal(sealed.unknown_remains_unknown, true);
const badPassport = new DeviceHealthPassportBuilder({ pseudonymous_device_id: 'device-pseudo-2' });
assert.throws(() => badPassport.addObservation({ sealed_observation_window_id: 'bad', browser_history: ['x'] }), /HUMAN_OBSERVATION_FORBIDDEN/);

assert.equal(assertVerifierAssuranceMonotonicity(
  { mandatory_rejections: ['BAD_SIGNATURE', 'STALE_LEASE'] },
  { mandatory_rejections: ['BAD_SIGNATURE', 'STALE_LEASE', 'BAD_DIGEST'] }
).status, 'ASSURANCE_MONOTONIC');
assert.throws(() => assertVerifierAssuranceMonotonicity(
  { mandatory_rejections: ['BAD_SIGNATURE', 'STALE_LEASE'] },
  { mandatory_rejections: ['BAD_SIGNATURE'] }
), /VERIFIER_ASSURANCE_REGRESSION/);
assert.equal(assertVerifierAssuranceMonotonicity(
  { mandatory_rejections: ['OLD_RULE'] },
  { mandatory_rejections: [] },
  { explicit_semantics_change: true, replayable: true, new_verifier_identity: 'verifier-v2-new-semantics' }
).status, 'INTENTIONAL_SEMANTICS_CHANGE');

assert.equal(qualifyAcceleratorShadow({ comparisons: 25, minimum_comparisons: 20, mismatches: 0, negative_controls: [true, true, true] }).status, 'QUALIFIED');
assert.equal(qualifyAcceleratorShadow({ comparisons: 25, minimum_comparisons: 20, mismatches: 1, negative_controls: [true, true, true] }).status, 'SHADOW');

const graph = createComputeLineageGraph({ consent: { id: 'consent-1' }, provider: { provider_id: 'science' }, lease, guardian: { evidence_state: 'OBSERVED' }, receipt: { receipt_id: 'r1', authority: 'AUTHORITATIVE' }, passport: { id: 'p1' } });
assert.equal(graph.nodes.length, 9);
assert.equal(graph.edges.length, 8);
assert.ok(graph.laws.includes('STRUCTURAL_LINK_NE_AUTHORITY'));

const contract = JSON.parse(readFileSync(new URL('../.janus/HELIOS_TRUST_FABRIC.json', import.meta.url), 'utf8'));
assert.equal(contract.version, '1.0.0');
assert.equal(contract.provider_authority.registration_is_authority, false);
assert.equal(contract.provider_authority.admission_default, 'DENY');
assert.equal(contract.hardware_boundary.human_blind, true);
assert.equal(contract.device_health_passport.unknown_remains_unknown, true);
assert.equal(contract.public_demo.real_provider_authority, false);
assert.equal(contract.game_boundary.rng_effect, 'NONE');

const ui = readFileSync(new URL('../helios-trust-fabric-ui.js', import.meta.url), 'utf8');
assert.match(ui, /TRUST FABRIC · DEVICE-SOVEREIGN COMPUTE/);
assert.match(ui, /DEFAULT DENY · EPOCH-BOUND/);
assert.match(ui, /EXTERNAL WORK YIELDS FIRST/);
assert.match(ui, /OBSERVATION CHAIN · HUMAN-BLIND/);
assert.match(ui, /NO SILENT ASSURANCE REGRESSION/);
assert.match(ui, /ASSIGNED ≠ VERIFIED/);
assert.match(ui, /PUBLIC PAGE AUTHORITY/);
assert.match(ui, /NONE · ARCHITECTURE DEMO/);
assert.doesNotMatch(ui, /Math\.random/);

const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
assert.match(html, /id="helios-trust-fabric-ui-script"[^>]+helios-trust-fabric-ui\.js\?v=1\.0\.0/);

console.log('HELIOS trust fabric invariants: PASS');
