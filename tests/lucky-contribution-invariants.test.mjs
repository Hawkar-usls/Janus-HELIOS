import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const [lucky, config, music] = await Promise.all([
  readFile(new URL('../helios-lucky.js', import.meta.url), 'utf8'),
  readFile(new URL('../config/helios.public.json', import.meta.url), 'utf8'),
  readFile(new URL('../helios-music.js', import.meta.url), 'utf8')
]);

const cfg = JSON.parse(config).demo_lucky_contribution;

assert.equal(cfg.enabled, true);
assert.equal(cfg.reward_ledger, 'LUCKY_CONTRIBUTION_LEDGER');
assert.equal(cfg.real_money_value, false);
assert.equal(cfg.wagering_value, false);
assert.equal(cfg.production_requires_authoritative_receipt, true);
assert.equal(cfg.production_browser_self_verification, false);
assert.ok(cfg.demo_probability_per_receipt > 0 && cfg.demo_probability_per_receipt <= 0.5);

for (const route of ['MARKETPLACE','TREASURY','SCIENCE','PUBLIC_GOOD','DATACENTER','OPERATOR','CUSTOM']) {
  assert.ok(cfg.eligible_route_classes.includes(route), `missing lucky route ${route}`);
}

assert.match(lucky, /LUCKY HASH/);
assert.match(lucky, /IMPACT HIT/);
assert.match(lucky, /GOLDEN TASK/);
assert.match(lucky, /LUCKY_CONTRIBUTION_LEDGER/);
assert.match(lucky, /receipt\.mode!=='SIMULATION'/);
assert.match(lucky, /authoritative:false/);
assert.match(lucky, /simulated:true/);
assert.match(lucky, /wagering_value:false/);
assert.match(lucky, /rng_effect:'NONE'/);
assert.match(lucky, /rtp_effect:'NONE'/);
assert.match(lucky, /personal_jackpot_weight_effect:'NONE'/);
assert.match(lucky, /helios:lucky-contribution/);
assert.match(music, /helios:lucky-contribution/);

console.log('HELIOS Lucky Contribution invariants: PASS');
