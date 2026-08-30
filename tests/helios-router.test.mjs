import assert from 'node:assert/strict';
import {
  HELIOS_ROUTER_VERSION,
  ROUTER_RESOURCE_CLASSES,
  ProviderRegistry,
  createRoutingPlan,
  createRouteDecision,
  normalizeResourceEnvelope,
  validateProviderManifest
} from '../src/helios-router.js';

assert.equal(HELIOS_ROUTER_VERSION,'2.0.0');
assert.deepEqual(ROUTER_RESOURCE_CLASSES,['CPU','GPU','HYBRID']);
assert.deepEqual(normalizeResourceEnvelope({cpu_percent:25,gpu_percent:0}),{
  cpu_percent:25,gpu_percent:0,allow_cpu:true,allow_gpu:false,resource_class:'CPU',user_cap_only:true,throughput_scaling:'NOT_DERIVED_FROM_PERCENTAGES',game_event_weighting:'FORBIDDEN',game_effect:'NONE'
});
assert.equal(normalizeResourceEnvelope({cpu_percent:0,gpu_percent:70}).resource_class,'GPU');
assert.equal(normalizeResourceEnvelope({cpu_percent:20,gpu_percent:60}).resource_class,'HYBRID');
assert.throws(()=>normalizeResourceEnvelope({cpu_percent:0,gpu_percent:0}),/RESOURCE_ENVELOPE_REQUIRES_CPU_OR_GPU/);
assert.throws(()=>normalizeResourceEnvelope({cpu_percent:10,gpu_percent:101}),/GPU_PERCENT_OUT_OF_RANGE/);

const science = {
  provider_id: 'science',
  display_name: 'Science',
  route_class: 'SCIENCE',
  task_types: ['SCIENCE_WORK_UNIT'],
  receipt_kinds: ['SCIENCE_UPSTREAM_RECEIPT'],
  enabled: true
};

const datacenter = {
  provider_id: 'dc',
  display_name: 'Data Center',
  route_class: 'DATACENTER',
  task_types: ['GENERAL_COMPUTE_JOB'],
  receipt_kinds: ['GENERAL_UPSTREAM_RECEIPT'],
  enabled: true
};

const marketplace = {
  provider_id: 'market',
  display_name: 'Marketplace',
  route_class: 'MARKETPLACE',
  task_types: ['ECONOMIC_COMPUTE_JOB'],
  receipt_kinds: ['ECONOMIC_UPSTREAM_RECEIPT'],
  enabled: true
};

assert.throws(() => validateProviderManifest({ ...marketplace, api_key: 'secret' }), /CLIENT_SECRET_FORBIDDEN/);
assert.throws(() => validateProviderManifest({ ...marketplace, rtp: 99 }), /FORBIDDEN_GAME_COUPLING/);

const registry = new ProviderRegistry([science, datacenter, marketplace]);

const dcPlan = createRoutingPlan({
  plan_id: 'dc-only',
  allocations: [{ provider_id: 'dc', weight: 1 }],
  policy: {
    game_event_weighting: 'ALLOW',
    scheduling_basis: 'SPIN_COUNT',
    resource_policy:{cpu_percent:20,gpu_percent:50}
  }
});

assert.equal(dcPlan.router_version,'2.0.0');
assert.equal(dcPlan.policy.game_event_weighting, 'FORBIDDEN');
assert.equal(dcPlan.policy.scheduling_basis, 'CONSENT_DEVICE_POLICY_PROVIDER_CAPACITY_AND_WORKLOAD_ADMISSION');
assert.equal(dcPlan.policy.resource_policy.resource_class,'HYBRID');
assert.equal(dcPlan.policy.resource_policy.gpu_percent,50);

assert.throws(() => createRoutingPlan({
  allocations: [
    { provider_id: 'dc', weight: 0.7 },
    { provider_id: 'market', weight: 0.4 }
  ]
}), /ROUTE_WEIGHTS_MUST_SUM_TO_ONE/);

assert.throws(() => createRoutingPlan({
  allocations: [{ provider_id: 'dc', weight: 1 }],
  policy: { spin_id: 'forbidden' }
}), /FORBIDDEN_GAME_COUPLING/);

const decision = createRouteDecision({
  consentAllowed: true,
  task: { task_id: 'task-1', type: 'GENERAL_COMPUTE_JOB', payload: { workload_class: 'render' } },
  plan: dcPlan,
  registry,
  schedulerCursor: 0.5
});

assert.equal(decision.provider_id, 'dc');
assert.equal(decision.resource_policy.resource_class,'HYBRID');
assert.equal(decision.game_effect, 'NONE');
assert.equal(decision.game_event_weighting, 'FORBIDDEN');

assert.throws(() => createRouteDecision({
  consentAllowed: false,
  task: { task_id: 'task-2', type: 'GENERAL_COMPUTE_JOB', payload: {} },
  plan: dcPlan,
  registry
}), /COMPUTE_NOT_ALLOWED/);

assert.throws(() => createRouteDecision({
  consentAllowed: true,
  task: { task_id: 'task-3', type: 'GENERAL_COMPUTE_JOB', payload: { personal_jackpot_weight: 2 } },
  plan: dcPlan,
  registry
}), /FORBIDDEN_GAME_COUPLING/);

console.log('JANUS HELIOS Router v2 routing + resource envelope invariants: PASS');
