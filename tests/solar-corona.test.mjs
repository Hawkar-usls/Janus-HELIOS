import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const [html, bonus, core, config, music] = await Promise.all([
  readFile(new URL('../index.html', import.meta.url), 'utf8'),
  readFile(new URL('../helios-bonus.js', import.meta.url), 'utf8'),
  readFile(new URL('../helios.js', import.meta.url), 'utf8'),
  readFile(new URL('../config/helios.public.json', import.meta.url), 'utf8'),
  readFile(new URL('../helios-music.js', import.meta.url), 'utf8')
]);

const cfg = JSON.parse(config);
const corona = cfg.demo_solar_corona;
const buy = cfg.demo_bonus_buy;

assert.match(html, /helios-bonus\.js\?v=1\.4\.0/);
assert.match(bonus, /BONUS_ENGINE_VERSION='1\.4\.0'/);
assert.match(bonus, /SOLAR CORONA/);
assert.match(bonus, /SOLAR FREE SPINS/);
assert.match(bonus, /CHOOSE BONUS/);
assert.match(bonus, /helios:bonus-buy-request/);
assert.match(bonus, /helios:bonus-buy-authorized/);
assert.match(bonus, /helios:bonus-buy-start/);
assert.match(bonus, /helios:bonus-session-start/);
assert.match(bonus, /helios:bonus-spin/);
assert.match(bonus, /helios:bonus-session-complete/);
assert.match(bonus, /helios:bonus-buy-complete/);
assert.match(bonus, /retrigger_spins_added/);
assert.match(bonus, /DEMO_SOLAR_FREE_SPINS/);
assert.match(bonus, /production_enabled: false/);
assert.match(bonus, /compute_effect: 'NONE'/);
assert.match(bonus, /first_class_bonus_core_source:true/);
assert.match(bonus, /stake_refund_bridge:false/);

// Bonus execution belongs to the game core, not a balance-source refund bridge.
assert.match(core, /const VALID_SPIN_SOURCES = new Set\(\['balance','energy','bonus'\]\)/);
assert.match(core, /function openBonusSession/);
assert.match(core, /async function spinBonus\(token\)/);
assert.match(core, /spin\(\{source:'bonus',bonusCapability:token\}\)/);
assert.match(core, /stake_charge:'NONE'/);
assert.match(core, /INVALID_BONUS_CAPABILITY/);

assert.equal(corona.enabled, true);
assert.deepEqual(corona.eligible_game_modes, ['helios']);
assert.equal(corona.trigger_symbol, '☀');
assert.equal(corona.trigger_count, 3);
assert.equal(corona.real_money_value, false);
assert.equal(corona.affects_compute, false);
assert.equal(corona.affects_rng, false);
assert.equal(corona.affects_route, false);
assert.equal(corona.reward_ledger, 'SOLAR_BONUS_BANK');

assert.equal(buy.enabled, true);
assert.deepEqual(buy.eligible_game_modes, ['helios']);
assert.equal(buy.feature, 'SOLAR_CORONA_FREE_SPINS');
assert.equal(buy.retrigger_symbol, '☀');
assert.equal(buy.retrigger_count, 3);
assert.equal(buy.bonus_session_ledger, 'DEMO_SOLAR_FREE_SPINS');
assert.equal(buy.winnings_settle_to_demo_balance, true);
assert.equal(buy.explicit_confirmation_required, true);
assert.equal(buy.tier_selection_required, true);
assert.equal(buy.real_money_value, false);
assert.equal(buy.production_enabled, false);
assert.equal(buy.affects_compute, false);
assert.equal(buy.affects_compute_route, false);

const tiers = buy.tiers;
assert.deepEqual(tiers.map(x=>x.id), ['standard','radiant','solar_flare']);
assert.deepEqual(tiers.map(x=>x.free_spins_count), [10,12,15]);
assert.deepEqual(tiers.map(x=>x.retrigger_spins), [2,2,3]);
assert.deepEqual(tiers.map(x=>x.max_total_spins), [16,20,24]);
assert.deepEqual(tiers.map(x=>x.extra_retrigger_chance), [0,0,0]);

for (const event of ['helios:bonus-session-start','helios:bonus-spin','helios:bonus-session-complete']) {
  assert.match(music, new RegExp(event.replace(':','\\:')));
}
assert.match(music, /bonusSessionActive/);

console.log('HELIOS Solar Corona + tiered free-spins Bonus Buy invariants: PASS');
