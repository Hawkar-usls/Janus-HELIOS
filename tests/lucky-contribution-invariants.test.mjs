import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const [lucky, config, music, html] = await Promise.all([
  readFile(new URL('../helios-lucky.js', import.meta.url), 'utf8'),
  readFile(new URL('../config/helios.public.json', import.meta.url), 'utf8'),
  readFile(new URL('../helios-music.js', import.meta.url), 'utf8'),
  readFile(new URL('../index.html', import.meta.url), 'utf8')
]);

const cfg = JSON.parse(config).demo_lucky_contribution;

assert.equal(cfg.enabled, true);
assert.equal(cfg.reward_ledger, 'LUCKY_CONTRIBUTION_LEDGER');
assert.equal(cfg.notification_surface, 'HELIOS_PROFILE');
assert.equal(cfg.real_money_value, false);
assert.equal(cfg.wagering_value, false);
assert.equal(cfg.production_requires_authoritative_receipt, true);
assert.equal(cfg.production_browser_self_verification, false);
assert.equal(cfg.production_selection_model, 'AUTHORITATIVE_SIGNIFICANCE_RULE_NOT_BROWSER_PROBABILITY');
assert.ok(cfg.demo_probability_per_receipt > 0 && cfg.demo_probability_per_receipt <= 0.005);
assert.equal(cfg.showcase_manual_trigger, true);

for (const route of ['MARKETPLACE','TREASURY','SCIENCE','PUBLIC_GOOD','DATACENTER','OPERATOR','CUSTOM']) {
  assert.ok(cfg.eligible_route_classes.includes(route), `missing lucky route ${route}`);
}

assert.match(lucky, /LUCKY HASH/);
assert.match(lucky, /IMPACT HIT/);
assert.match(lucky, /GOLDEN TASK/);
assert.match(lucky, /LUCKY_CONTRIBUTION_LEDGER/);
assert.match(lucky, /authoritative:false/);
assert.match(lucky, /simulated:true/);
assert.match(lucky, /notification_surface:'HELIOS_PROFILE'/);
assert.match(lucky, /bonus_probability_effect:'NONE'/);
assert.match(lucky, /personal_jackpot_weight_effect:'NONE'/);
assert.match(lucky, /helios:lucky-contribution/);
assert.match(lucky, /helios:showcase-lucky-contribution/);
assert.equal(/lucky-overlay|lucky-card/.test(lucky), false);
assert.match(music, /helios:lucky-contribution/);
assert.match(html, /helios-lucky\.js\?v=2\.0\.0/);
assert.match(html, /helios-profile\.js\?v=1\.0\.0/);

console.log('HELIOS rare profile Lucky Contribution invariants: PASS');
