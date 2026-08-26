import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const [html, bonus, config, music] = await Promise.all([
  readFile(new URL('../index.html', import.meta.url), 'utf8'),
  readFile(new URL('../helios-bonus.js', import.meta.url), 'utf8'),
  readFile(new URL('../config/helios.public.json', import.meta.url), 'utf8'),
  readFile(new URL('../helios-music.js', import.meta.url), 'utf8')
]);

const cfg = JSON.parse(config);
const corona = cfg.demo_solar_corona;
const buy = cfg.demo_bonus_buy;

assert.match(html, /helios-bonus\.js\?v=/);
assert.match(bonus, /SOLAR CORONA BONUS/);
assert.match(bonus, /SOLAR FREE SPINS/);
assert.match(bonus, /BUY SOLAR CORONA BONUS/);
assert.match(bonus, /helios:bonus-buy-start/);
assert.match(bonus, /helios:bonus-session-start/);
assert.match(bonus, /helios:bonus-spin/);
assert.match(bonus, /helios:bonus-session-complete/);
assert.match(bonus, /helios:bonus-buy-complete/);
assert.match(bonus, /retrigger_spins_added/);
assert.match(bonus, /DEMO_SOLAR_FREE_SPINS/);
assert.match(bonus, /production_enabled:false/);
assert.match(bonus, /compute_effect:'NONE'/);
assert.match(bonus, /rng_effect:'STANDARD_GAME_RNG'/);

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
assert.equal(buy.cost_multiplier_of_demo_bet, 50);
assert.equal(buy.free_spins_count, 10);
assert.equal(buy.retrigger_symbol, '☀');
assert.equal(buy.retrigger_count, 3);
assert.equal(buy.retrigger_spins, 2);
assert.equal(buy.max_total_spins, 16);
assert.equal(buy.bonus_session_ledger, 'DEMO_SOLAR_FREE_SPINS');
assert.equal(buy.winnings_settle_to_demo_balance, true);
assert.equal(buy.real_money_value, false);
assert.equal(buy.production_enabled, false);
assert.equal(buy.affects_compute, false);
assert.equal(buy.affects_compute_route, false);

for (const event of ['helios:bonus-session-start','helios:bonus-spin','helios:bonus-session-complete']) {
  assert.match(music, new RegExp(event.replace(':','\\:')));
}
assert.match(music, /bonusSessionActive/);

console.log('HELIOS Solar Corona + true free-spins Bonus Buy invariants: PASS');
