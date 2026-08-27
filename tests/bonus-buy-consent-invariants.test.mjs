import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const [html, confirm, bonus, config] = await Promise.all([
  readFile(new URL('../index.html', import.meta.url), 'utf8'),
  readFile(new URL('../helios-bonus-confirm.js', import.meta.url), 'utf8'),
  readFile(new URL('../helios-bonus.js', import.meta.url), 'utf8'),
  readFile(new URL('../config/helios.public.json', import.meta.url), 'utf8')
]);
const cfg = JSON.parse(config);
const buy = cfg.demo_bonus_buy;

assert.match(html, /helios-bonus\.js\?v=1\.3\.0/);
assert.match(html, /helios-bonus-confirm\.js\?v=2\.0\.0/);
assert.match(confirm, /CHOOSE SOLAR FREE SPINS/);
assert.match(confirm, /TOTAL BONUS COST/);
assert.match(confirm, /CURRENT BET/);
assert.match(confirm, /bonus-tier-card/);
assert.match(confirm, /bonus-confirm-consent/);
assert.match(confirm, /CONFIRM BUY/);
assert.match(confirm, /explicit_consent:true/);
assert.match(confirm, /Nothing is deducted before confirmation/);
assert.match(confirm, /helios:bonus-buy-request/);
assert.match(confirm, /helios:bonus-buy-authorized/);
assert.match(confirm, /queueMicrotask/);
assert.match(confirm, /overlay\.hidden=true/);
assert.doesNotMatch(confirm, /bypassOnce/);
assert.doesNotMatch(confirm, /btn\.click\(\)/);

assert.match(bonus, /helios:bonus-buy-request/);
assert.match(bonus, /helios:bonus-buy-authorized/);
assert.match(bonus, /PRICE_OR_BET_CHANGED/);
assert.match(bonus, /explicit_confirmation_required/);

assert.equal(buy.explicit_confirmation_required, true);
assert.equal(buy.tier_selection_required, true);
assert.equal(buy.real_money_value, false);
assert.equal(buy.production_enabled, false);
assert.equal(Array.isArray(buy.tiers), true);
assert.equal(buy.tiers.length, 3);
assert.deepEqual(buy.tiers.map(x=>x.id), ['standard','radiant','solar_flare']);
assert.deepEqual(buy.tiers.map(x=>x.cost_multiplier_of_demo_bet), [50,100,175]);
assert.deepEqual(buy.tiers.map(x=>x.free_spins_count), [10,12,15]);

console.log('HELIOS Bonus Buy event-driven consent + tier chooser invariants: PASS');
